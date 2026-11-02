const { query } = require('../config/db');

function listServices() {
  return query(
    `SELECT MaDV, TenDV, LoaiDV, DonGia, ThoiLuongPhut, MoTaDV, HinhAnhDV
       FROM DICHVU WHERE TrangThaiDV = 1 ORDER BY MaDV`
  );
}

function listBarbers() {
  return query(
    `SELECT t.MaTho, n.HoTen, t.ChuyenMon, t.SoNamKN, t.AnhDaiDien, t.GioiThieuNgan, t.DiemDanhGiaTB
       FROM THOCATTOC t JOIN NGUOIDUNG n ON n.MaND = t.MaND
      WHERE t.TrangThaiLamViec = 'DANGLAMVIEC' AND n.TrangThai = 1
      ORDER BY t.MaTho`
  );
}

async function getBarber(maTho) {
  const rows = await query(
    `SELECT t.MaTho, n.HoTen, t.TrangThaiLamViec, n.TrangThai
       FROM THOCATTOC t JOIN NGUOIDUNG n ON n.MaND = t.MaND WHERE t.MaTho = ?`,
    [maTho]
  );
  return rows[0] || null;
}

// Các dịch vụ đang phục vụ theo danh sách mã
function getActiveServices(ids) {
  return query(
    `SELECT MaDV, TenDV, DonGia, ThoiLuongPhut FROM DICHVU WHERE TrangThaiDV = 1 AND MaDV IN (?)`,
    [ids]
  );
}

// Ca làm việc đang mở của thợ trong ngày (phút từ 00:00)
function getShifts(maTho, date) {
  return query(
    `SELECT TIME_TO_SEC(GioBatDau) / 60 AS startMin, TIME_TO_SEC(GioKetThuc) / 60 AS endMin
       FROM CALAMVIEC WHERE MaTho = ? AND NgayLamViec = ? AND TrangThaiCa = 'DANGMO'`,
    [maTho, date]
  );
}

// Các lịch đang hiệu lực của thợ trong ngày
function getBusy(maTho, date) {
  return query(
    `SELECT TIME_TO_SEC(GioBatDau) / 60 AS startMin, TIME_TO_SEC(GioKetThucDK) / 60 AS endMin
       FROM LICHHEN
      WHERE MaTho = ? AND NgayHen = ? AND TrangThaiLH IN ('ChoXacNhan','DaXacNhan','DangPhucVu')`,
    [maTho, date]
  );
}

module.exports = { listServices, listBarbers, getBarber, getActiveServices, getShifts, getBusy };
