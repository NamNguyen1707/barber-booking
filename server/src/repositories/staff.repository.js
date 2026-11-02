const { getPool } = require('../config/db');

const unwrap = (err) => {
  if (err.errno >= 50000) {
    err.message = err.sqlMessage || err.message;
  }
  return err;
};

async function listBookings({ date, status, maTho }) {
  const pool = await getPool();
  const conditions = [];
  const params = [];

  if (date) {
    conditions.push('l.NgayHen = ?');
    params.push(date);
  }
  if (status) {
    conditions.push('l.TrangThaiLH = ?');
    params.push(status);
  }
  if (maTho) {
    conditions.push('l.MaTho = ?');
    params.push(maTho);
  }

  const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

  const [rows] = await pool.query(`
    SELECT l.MaLH,
           DATE_FORMAT(l.NgayHen, '%Y-%m-%d') AS NgayHen,
           TIME_FORMAT(l.GioBatDau, '%H:%i')  AS GioBatDau,
           TIME_FORMAT(l.GioKetThucDK, '%H:%i') AS GioKetThucDK,
           l.TrangThaiLH, l.KenhDatLich, l.GhiChuKhach,
           l.TongThoiLuong, l.TongTienTamTinh,
           l.MaTho, ndt.HoTen AS ThoCatToc,
           l.MaKH, ndk.HoTen AS KhachHang, ndk.SoDienThoai AS SDTKhach,
           k.GhiChuKieuToc,
           (SELECT GROUP_CONCAT(d.TenDV SEPARATOR ', ')
              FROM CHITIET_LICHHEN c JOIN DICHVU d ON d.MaDV = c.MaDV
             WHERE c.MaLH = l.MaLH) AS DichVu,
           CASE WHEN EXISTS (SELECT 1 FROM HOADON h WHERE h.MaLH = l.MaLH)
                THEN 1 ELSE 0 END AS DaCoHoaDon
    FROM LICHHEN l
    JOIN KHACHHANG k   ON k.MaKH  = l.MaKH
    JOIN NGUOIDUNG ndk ON ndk.MaND = k.MaND
    JOIN THOCATTOC t   ON t.MaTho = l.MaTho
    JOIN NGUOIDUNG ndt ON ndt.MaND = t.MaND
    ${whereClause}
    ORDER BY l.NgayHen, l.GioBatDau`,
    params
  );
  return rows;
}

async function getBookingOwner(maLH) {
  const pool = await getPool();
  const [rows] = await pool.query(
    'SELECT MaTho, TrangThaiLH FROM LICHHEN WHERE MaLH = ?',
    [maLH]
  );
  return rows[0];
}

// Trigger trg_lh_update kiểm tra luồng trạng thái hợp lệ (BR07)
async function updateStatus(maLH, status) {
  const pool = await getPool();
  try {
    await pool.query(
      'UPDATE LICHHEN SET TrangThaiLH = ? WHERE MaLH = ?',
      [status, maLH]
    );
  } catch (err) {
    throw unwrap(err);
  }
}

module.exports = { listBookings, getBookingOwner, updateStatus };
