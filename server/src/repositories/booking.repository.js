const { query, getPool } = require('../config/db');

// Cột dùng chung khi trả lịch hẹn ra ngoài (giờ dạng HH:MM)
const BOOKING_COLUMNS = `
  l.MaLH, l.MaKH, l.MaTho,
  l.NgayHen,
  TIME_FORMAT(l.GioBatDau, '%H:%i') AS GioBatDau,
  TIME_FORMAT(l.GioKetThucDK, '%H:%i') AS GioKetThucDK,
  l.TrangThaiLH, l.KenhDatLich, l.TongThoiLuong, l.TongTienTamTinh, l.GhiChuKhach,
  ndt.HoTen AS ThoCatToc,
  ndk.HoTen AS KhachHang, ndk.SoDienThoai AS SDTKhach, k.HangThanhVien,
  (SELECT GROUP_CONCAT(d.TenDV ORDER BY d.MaDV SEPARATOR ', ')
     FROM CHITIET_LICHHEN c JOIN DICHVU d ON d.MaDV = c.MaDV WHERE c.MaLH = l.MaLH) AS DichVu,
  EXISTS (SELECT 1 FROM HOADON h WHERE h.MaLH = l.MaLH) AS CoHoaDon,
  (l.TrangThaiLH IN ('ChoXacNhan','DaXacNhan')
     AND NOW() <= DATE_SUB(TIMESTAMP(l.NgayHen, l.GioBatDau), INTERVAL 2 HOUR)) AS CoTheHuy`;

const BOOKING_FROM = `
  FROM LICHHEN l
  JOIN KHACHHANG k ON k.MaKH = l.MaKH JOIN NGUOIDUNG ndk ON ndk.MaND = k.MaND
  JOIN THOCATTOC t ON t.MaTho = l.MaTho JOIN NGUOIDUNG ndt ON ndt.MaND = t.MaND`;

function normalize(row) {
  return { ...row, CoHoaDon: !!row.CoHoaDon, CoTheHuy: !!row.CoTheHuy };
}

// Gọi sp_DatLich (mọi luật BR01, RB03, RB04, RB05 nằm trong trigger/procedure)
async function createBooking({ maKH, maTho, date, time, dsDV, ghiChu, kenh = 'ONLINE' }) {
  const conn = await getPool().getConnection();
  try {
    await conn.query('CALL sp_DatLich(?, ?, ?, ?, ?, ?, ?, @maLH)',
      [maKH, maTho, date, time, dsDV.join(','), kenh, ghiChu ?? null]);
    const [rows] = await conn.query('SELECT @maLH AS maLH');
    return rows[0].maLH;
  } finally {
    conn.release();
  }
}

async function getBookingById(maLH) {
  const rows = await query(`SELECT ${BOOKING_COLUMNS} ${BOOKING_FROM} WHERE l.MaLH = ?`, [maLH]);
  return rows[0] ? normalize(rows[0]) : null;
}

async function getBookingsByCustomer(maKH) {
  const rows = await query(
    `SELECT ${BOOKING_COLUMNS} ${BOOKING_FROM} WHERE l.MaKH = ? ORDER BY l.NgayHen DESC, l.GioBatDau DESC`,
    [maKH]
  );
  return rows.map(normalize);
}

async function cancelBooking(maLH, maKH) {
  await query('CALL sp_HuyLich(?, ?)', [maLH, maKH]);
}

// Dùng cho nhân viên: lọc theo ngày / trạng thái / thợ
async function listForStaff({ date, status, maTho }) {
  const where = [];
  const params = [];
  if (date) { where.push('l.NgayHen = ?'); params.push(date); }
  if (status) { where.push('l.TrangThaiLH = ?'); params.push(status); }
  if (maTho) { where.push('l.MaTho = ?'); params.push(maTho); }
  const rows = await query(
    `SELECT ${BOOKING_COLUMNS} ${BOOKING_FROM}
      ${where.length ? 'WHERE ' + where.join(' AND ') : ''}
      ORDER BY l.NgayHen, l.GioBatDau`,
    params
  );
  return rows.map(normalize);
}

async function updateStatus(maLH, trangThai) {
  await query('UPDATE LICHHEN SET TrangThaiLH = ? WHERE MaLH = ?', [trangThai, maLH]);
}

module.exports = { createBooking, getBookingById, getBookingsByCustomer, cancelBooking, listForStaff, updateStatus };
