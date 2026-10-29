const { sql, getPool } = require('../config/db');

async function getServices() {
  const pool = await getPool();
  const r = await pool.request().query(`
    SELECT MaDV, TenDV, LoaiDV, DonGia, ThoiLuongPhut, MoTaDV, HinhAnhDV
    FROM DICHVU WHERE TrangThaiDV = 1 ORDER BY LoaiDV, TenDV`);
  return r.recordset;
}

async function getBarbers() {
  const pool = await getPool();
  const r = await pool.request().query(`
    SELECT t.MaTho, nd.HoTen, t.ChuyenMon, t.SoNamKN, t.AnhDaiDien,
           t.GioiThieuNgan, t.DiemDanhGiaTB
    FROM THOCATTOC t JOIN NGUOIDUNG nd ON nd.MaND = t.MaND
    WHERE t.TrangThaiLamViec = 'DANGLAMVIEC' AND nd.TrangThai = 1
    ORDER BY nd.HoTen`);
  return r.recordset;
}

// Tổng thời lượng + số dịch vụ hợp lệ của danh sách MaDV (vd '1,3')
async function sumDuration(dsDV) {
  const pool = await getPool();
  const r = await pool.request()
    .input('ds', sql.VarChar(200), dsDV)
    .query(`
      SELECT COUNT(*) AS SoDV, ISNULL(SUM(ThoiLuongPhut), 0) AS TongPhut
      FROM DICHVU
      WHERE TrangThaiDV = 1
        AND MaDV IN (SELECT CAST(value AS INT) FROM STRING_SPLIT(@ds, ','))`);
  return r.recordset[0];
}

async function getShifts(maTho, date) {
  const pool = await getPool();
  const r = await pool.request()
    .input('maTho', sql.Int, maTho)
    .input('date', sql.VarChar(10), date)
    .query(`
      SELECT CONVERT(varchar(5), GioBatDau, 108) AS tu,
             CONVERT(varchar(5), GioKetThuc, 108) AS den
      FROM CALAMVIEC
      WHERE MaTho = @maTho AND NgayLamViec = CAST(@date AS DATE) AND TrangThaiCa = 'DANGMO'`);
  return r.recordset;
}

async function getBooked(maTho, date) {
  const pool = await getPool();
  const r = await pool.request()
    .input('maTho', sql.Int, maTho)
    .input('date', sql.VarChar(10), date)
    .query(`
      SELECT CONVERT(varchar(5), GioBatDau, 108) AS tu,
             CONVERT(varchar(5), GioKetThucDK, 108) AS den
      FROM LICHHEN
      WHERE MaTho = @maTho AND NgayHen = CAST(@date AS DATE)
        AND TrangThaiLH IN ('ChoXacNhan','DaXacNhan','DangPhucVu')`);
  return r.recordset;
}

module.exports = { getServices, getBarbers, sumDuration, getShifts, getBooked };