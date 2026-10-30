const { sql, getPool } = require('../config/db');

// Trigger/procedure có thể ném kèm lỗi phụ; lấy lỗi nghiệp vụ gốc (mã >= 50000)
function unwrap(err) {
  return [err, ...(err.precedingErrors || [])].find((e) => e.number >= 50000) || err;
}

// F3: gọi sp_DatLich
async function createBooking({ maKH, maTho, date, time, ds, ghiChu }) {
  const pool = await getPool();
  try {
    const r = await pool.request()
      .input('maKH', sql.Int, maKH)
      .input('maTho', sql.Int, maTho)
      .input('date', sql.VarChar(10), date)
      .input('time', sql.VarChar(8), time)
      .input('ds', sql.VarChar(200), ds)
      .input('ghiChu', sql.NVarChar(300), ghiChu || null)
      .query(`
        DECLARE @id INT,
                @d DATE = CAST(@date AS DATE),
                @t TIME(0) = CAST(@time AS TIME(0));
        EXEC sp_DatLich @MaKH = @maKH, @MaTho = @maTho, @NgayHen = @d, @GioBatDau = @t,
                        @DsDV = @ds, @Kenh = 'ONLINE', @GhiChu = @ghiChu, @MaLH = @id OUTPUT;
        SELECT @id AS MaLH;`);
    return r.recordset[0].MaLH;
  } catch (err) {
    throw unwrap(err);
  }
}

async function getBookingById(maLH) {
  const pool = await getPool();
  const r = await pool.request()
    .input('id', sql.Int, maLH)
    .query(`
      SELECT MaLH,
             CONVERT(varchar(10), NgayHen, 23)       AS NgayHen,
             CONVERT(varchar(5),  GioBatDau, 108)    AS GioBatDau,
             CONVERT(varchar(5),  GioKetThucDK, 108) AS GioKetThucDK,
             TrangThaiLH, KenhDatLich, KhachHang, SDTKhach, ThoCatToc,
             TongThoiLuong, TongTienTamTinh, DichVu
      FROM v_lichhen_chitiet WHERE MaLH = @id`);
  return r.recordset[0];
}

// F4: lịch hẹn của một khách hàng
async function getBookingsByCustomer(maKH) {
  const pool = await getPool();
  const r = await pool.request()
    .input('maKH', sql.Int, maKH)
    .query(`
      SELECT l.MaLH,
             CONVERT(varchar(10), l.NgayHen, 23)       AS NgayHen,
             CONVERT(varchar(5),  l.GioBatDau, 108)    AS GioBatDau,
             CONVERT(varchar(5),  l.GioKetThucDK, 108) AS GioKetThucDK,
             l.TrangThaiLH, l.KenhDatLich, l.GhiChuKhach,
             l.TongThoiLuong, l.TongTienTamTinh,
             nd.HoTen AS ThoCatToc,
             (SELECT STRING_AGG(d.TenDV, N', ')
                FROM CHITIET_LICHHEN c JOIN DICHVU d ON d.MaDV = c.MaDV
               WHERE c.MaLH = l.MaLH) AS DichVu,
             CASE WHEN l.TrangThaiLH IN ('ChoXacNhan','DaXacNhan')
                   AND GETDATE() <= DATEADD(HOUR, -2, CAST(l.NgayHen AS DATETIME) + CAST(l.GioBatDau AS DATETIME))
                  THEN 1 ELSE 0 END AS CoTheHuy
      FROM LICHHEN l
      JOIN THOCATTOC t ON t.MaTho = l.MaTho
      JOIN NGUOIDUNG nd ON nd.MaND = t.MaND
      WHERE l.MaKH = @maKH
      ORDER BY l.NgayHen DESC, l.GioBatDau DESC`);
  return r.recordset;
}

// F4: khách tự hủy lịch (sp_HuyLich kiểm tra chủ sở hữu và BR05)
async function cancelBooking(maLH, maKH) {
  const pool = await getPool();
  try {
    await pool.request()
      .input('maLH', sql.Int, maLH)
      .input('maKH', sql.Int, maKH)
      .query('EXEC sp_HuyLich @MaLH = @maLH, @MaKH = @maKH');
  } catch (err) {
    throw unwrap(err);
  }
}

module.exports = { createBooking, getBookingById, getBookingsByCustomer, cancelBooking };