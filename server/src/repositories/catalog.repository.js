const { getPool } = require('../config/db');

async function getServices() {
  const pool = await getPool();
  const [rows] = await pool.query(`
    SELECT MaDV, TenDV, LoaiDV, DonGia, ThoiLuongPhut, MoTaDV, HinhAnhDV
    FROM DICHVU WHERE TrangThaiDV = 1 ORDER BY LoaiDV, TenDV`);
  return rows;
}

async function getBarbers() {
  const pool = await getPool();
  const [rows] = await pool.query(`
    SELECT t.MaTho, nd.HoTen, t.ChuyenMon, t.SoNamKN, t.AnhDaiDien,
           t.GioiThieuNgan, t.DiemDanhGiaTB
    FROM THOCATTOC t JOIN NGUOIDUNG nd ON nd.MaND = t.MaND
    WHERE t.TrangThaiLamViec = 'DANGLAMVIEC' AND nd.TrangThai = 1
    ORDER BY nd.HoTen`);
  return rows;
}

// Tổng thời lượng + số dịch vụ hợp lệ của danh sách MaDV (vd '1,3')
async function sumDuration(dsDV) {
  const pool = await getPool();
  const ids = String(dsDV || '')
    .split(',')
    .map((s) => Number(s.trim()))
    .filter((n) => Number.isInteger(n) && n > 0);
  if (ids.length === 0) {
    return { SoDV: 0, TongPhut: 0 };
  }
  const [rows] = await pool.query(
    `SELECT COUNT(*) AS SoDV, IFNULL(SUM(ThoiLuongPhut), 0) AS TongPhut
     FROM DICHVU
     WHERE TrangThaiDV = 1 AND MaDV IN (?)`,
    [ids]
  );
  return rows[0];
}

async function getShifts(maTho, date) {
  const pool = await getPool();
  const [rows] = await pool.query(`
    SELECT TIME_FORMAT(GioBatDau, '%H:%i') AS tu,
           TIME_FORMAT(GioKetThuc, '%H:%i') AS den
    FROM CALAMVIEC
    WHERE MaTho = ? AND NgayLamViec = ? AND TrangThaiCa = 'DANGMO'`,
    [maTho, date]
  );
  return rows;
}

async function getBooked(maTho, date) {
  const pool = await getPool();
  const [rows] = await pool.query(`
    SELECT TIME_FORMAT(GioBatDau, '%H:%i') AS tu,
           TIME_FORMAT(GioKetThucDK, '%H:%i') AS den
    FROM LICHHEN
    WHERE MaTho = ? AND NgayHen = ?
      AND TrangThaiLH IN ('ChoXacNhan','DaXacNhan','DangPhucVu')`,
    [maTho, date]
  );
  return rows;
}

module.exports = { getServices, getBarbers, sumDuration, getShifts, getBooked };
