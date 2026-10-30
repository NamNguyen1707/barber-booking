const { sql, getPool } = require('../config/db');

const unwrap = (err) =>
  [err, ...(err.precedingErrors || [])].find((e) => e.number >= 50000) || err;

async function listBookings({ date, status, maTho }) {
  const pool = await getPool();
  const r = await pool.request()
    .input('date', sql.VarChar(10), date || null)
    .input('status', sql.VarChar(25), status || null)
    .input('maTho', sql.Int, maTho || null)
    .query(`
      SELECT l.MaLH,
             CONVERT(varchar(10), l.NgayHen, 23)       AS NgayHen,
             CONVERT(varchar(5),  l.GioBatDau, 108)    AS GioBatDau,
             CONVERT(varchar(5),  l.GioKetThucDK, 108) AS GioKetThucDK,
             l.TrangThaiLH, l.KenhDatLich, l.GhiChuKhach,
             l.TongThoiLuong, l.TongTienTamTinh,
             l.MaTho, ndt.HoTen AS ThoCatToc,
             l.MaKH, ndk.HoTen AS KhachHang, ndk.SoDienThoai AS SDTKhach,
             k.GhiChuKieuToc,
             (SELECT STRING_AGG(d.TenDV, N', ')
                FROM CHITIET_LICHHEN c JOIN DICHVU d ON d.MaDV = c.MaDV
               WHERE c.MaLH = l.MaLH) AS DichVu,
             CASE WHEN EXISTS (SELECT 1 FROM HOADON h WHERE h.MaLH = l.MaLH)
                  THEN 1 ELSE 0 END AS DaCoHoaDon
      FROM LICHHEN l
      JOIN KHACHHANG k   ON k.MaKH  = l.MaKH
      JOIN NGUOIDUNG ndk ON ndk.MaND = k.MaND
      JOIN THOCATTOC t   ON t.MaTho = l.MaTho
      JOIN NGUOIDUNG ndt ON ndt.MaND = t.MaND
      WHERE (@date   IS NULL OR l.NgayHen = CAST(@date AS DATE))
        AND (@status IS NULL OR l.TrangThaiLH = @status)
        AND (@maTho  IS NULL OR l.MaTho = @maTho)
      ORDER BY l.NgayHen, l.GioBatDau`);
  return r.recordset;
}

async function getBookingOwner(maLH) {
  const pool = await getPool();
  const r = await pool.request()
    .input('id', sql.Int, maLH)
    .query('SELECT MaTho, TrangThaiLH FROM LICHHEN WHERE MaLH = @id');
  return r.recordset[0];
}

// Trigger trg_lh_check kiểm tra luồng trạng thái hợp lệ (BR07)
async function updateStatus(maLH, status) {
  const pool = await getPool();
  try {
    await pool.request()
      .input('id', sql.Int, maLH)
      .input('st', sql.VarChar(25), status)
      .query('UPDATE LICHHEN SET TrangThaiLH = @st WHERE MaLH = @id');
  } catch (err) {
    throw unwrap(err);
  }
}

module.exports = { listBookings, getBookingOwner, updateStatus };