const { sql, getPool } = require('../config/db');

// Gọi sp_DatLich. Lỗi nghiệp vụ (mã >= 50000) được ném ra nguyên vẹn.
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
    // Trigger có ROLLBACK nên SQL Server có thể kèm thêm lỗi phụ; lấy lỗi nghiệp vụ gốc
    const biz = [err, ...(err.precedingErrors || [])].find((e) => e.number >= 50000);
    throw biz || err;
  }
}

async function getBookingById(maLH) {
  const pool = await getPool();
  const r = await pool.request()
    .input('id', sql.Int, maLH)
    .query(`
      SELECT MaLH,
             CONVERT(varchar(10), NgayHen, 23)         AS NgayHen,       -- 2026-10-30
             CONVERT(varchar(5),  GioBatDau, 108)      AS GioBatDau,     -- 10:00
             CONVERT(varchar(5),  GioKetThucDK, 108)   AS GioKetThucDK,  -- 10:40
             TrangThaiLH, KenhDatLich, KhachHang, SDTKhach, ThoCatToc,
             TongThoiLuong, TongTienTamTinh, DichVu
      FROM v_lichhen_chitiet WHERE MaLH = @id`);
  return r.recordset[0];
}

module.exports = { createBooking, getBookingById };