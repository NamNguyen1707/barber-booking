const { getPool } = require('../config/db');

function unwrap(err) {
  if (err.errno >= 50000) {
    err.message = err.sqlMessage || err.message;
  }
  return err;
}

// F3: gọi sp_DatLich
async function createBooking({ maKH, maTho, date, time, ds, ghiChu, kenh = 'ONLINE' }) {
  const pool = await getPool();
  const conn = await pool.getConnection();
  try {
    await conn.query(
      'CALL sp_DatLich(?, ?, ?, ?, ?, ?, ?, @malh)',
      [maKH, maTho, date, time, ds, kenh, ghiChu || null]
    );
    const [rows] = await conn.query('SELECT @malh AS malh');
    return rows[0].malh;
  } catch (err) {
    throw unwrap(err);
  } finally {
    conn.release();
  }
}

async function getBookingById(maLH) {
  const pool = await getPool();
  const [rows] = await pool.query(`
    SELECT MaLH,
           DATE_FORMAT(NgayHen, '%Y-%m-%d') AS NgayHen,
           TIME_FORMAT(GioBatDau, '%H:%i')  AS GioBatDau,
           TIME_FORMAT(GioKetThucDK, '%H:%i') AS GioKetThucDK,
           TrangThaiLH, KenhDatLich, KhachHang, SDTKhach, ThoCatToc,
           TongThoiLuong, TongTienTamTinh, DichVu
    FROM v_lichhen_chitiet WHERE MaLH = ?`,
    [maLH]
  );
  return rows[0];
}

// F4: lịch hẹn của một khách hàng
async function getBookingsByCustomer(maKH) {
  const pool = await getPool();
  const [rows] = await pool.query(`
    SELECT l.MaLH,
           DATE_FORMAT(l.NgayHen, '%Y-%m-%d') AS NgayHen,
           TIME_FORMAT(l.GioBatDau, '%H:%i')  AS GioBatDau,
           TIME_FORMAT(l.GioKetThucDK, '%H:%i') AS GioKetThucDK,
           l.TrangThaiLH, l.KenhDatLich, l.GhiChuKhach,
           l.TongThoiLuong, l.TongTienTamTinh,
           nd.HoTen AS ThoCatToc,
           (SELECT GROUP_CONCAT(d.TenDV SEPARATOR ', ')
              FROM CHITIET_LICHHEN c JOIN DICHVU d ON d.MaDV = c.MaDV
             WHERE c.MaLH = l.MaLH) AS DichVu,
           CASE WHEN l.TrangThaiLH IN ('ChoXacNhan','DaXacNhan')
                 AND NOW() <= DATE_SUB(TIMESTAMP(l.NgayHen, l.GioBatDau), INTERVAL 2 HOUR)
                THEN 1 ELSE 0 END AS CoTheHuy
    FROM LICHHEN l
    JOIN THOCATTOC t ON t.MaTho = l.MaTho
    JOIN NGUOIDUNG nd ON nd.MaND = t.MaND
    WHERE l.MaKH = ?
    ORDER BY l.NgayHen DESC, l.GioBatDau DESC`,
    [maKH]
  );
  return rows;
}

// F4: khách tự hủy lịch (sp_HuyLich kiểm tra chủ sở hữu và BR05)
async function cancelBooking(maLH, maKH) {
  const pool = await getPool();
  try {
    await pool.query('CALL sp_HuyLich(?, ?)', [maLH, maKH]);
  } catch (err) {
    throw unwrap(err);
  }
}

module.exports = { createBooking, getBookingById, getBookingsByCustomer, cancelBooking };
