const { sql, getPool } = require('../config/db');

/* ============ DỊCH VỤ ============ */
async function listServices() {
  const pool = await getPool();
  const r = await pool.request().query(`
    SELECT MaDV, TenDV, LoaiDV, DonGia, ThoiLuongPhut, MoTaDV, HinhAnhDV, TrangThaiDV
    FROM DICHVU ORDER BY TrangThaiDV DESC, MaDV`);
  return r.recordset;
}

async function getServiceById(id) {
  const pool = await getPool();
  const r = await pool.request().input('id', sql.Int, id).query(`
    SELECT MaDV, TenDV, LoaiDV, DonGia, ThoiLuongPhut, MoTaDV, HinhAnhDV, TrangThaiDV
    FROM DICHVU WHERE MaDV = @id`);
  return r.recordset[0] || null;
}

async function serviceNameExists(ten, exceptId = 0) {
  const pool = await getPool();
  const r = await pool.request()
    .input('ten', sql.NVarChar(120), ten)
    .input('id', sql.Int, exceptId)
    .query(`SELECT 1 AS x FROM DICHVU WHERE TenDV = @ten AND MaDV <> @id`);
  return r.recordset.length > 0;
}

async function createService(d) {
  const pool = await getPool();
  const r = await pool.request()
    .input('ten',  sql.NVarChar(120), d.tenDV)
    .input('loai', sql.VarChar(50), d.loaiDV)
    .input('gia',  sql.Decimal(12, 0), d.donGia)
    .input('tl',   sql.Int, d.thoiLuongPhut)
    .input('mota', sql.NVarChar(500), d.moTa ?? null)
    .input('anh',  sql.VarChar(255), d.hinhAnh ?? null)
    .query(`
      INSERT INTO DICHVU (TenDV, LoaiDV, DonGia, ThoiLuongPhut, MoTaDV, HinhAnhDV)
      VALUES (@ten, @loai, @gia, @tl, @mota, @anh);
      SELECT CAST(SCOPE_IDENTITY() AS INT) AS id;`);
  return r.recordset[0].id;
}

async function updateService(id, d) {
  const pool = await getPool();
  await pool.request()
    .input('id',   sql.Int, id)
    .input('ten',  sql.NVarChar(120), d.tenDV ?? null)
    .input('loai', sql.VarChar(50), d.loaiDV ?? null)
    .input('gia',  sql.Decimal(12, 0), d.donGia ?? null)
    .input('tl',   sql.Int, d.thoiLuongPhut ?? null)
    .input('mota', sql.NVarChar(500), d.moTa ?? null)
    .input('anh',  sql.VarChar(255), d.hinhAnh ?? null)
    .query(`
      UPDATE DICHVU SET
        TenDV = ISNULL(@ten, TenDV),
        LoaiDV = ISNULL(@loai, LoaiDV),
        DonGia = ISNULL(@gia, DonGia),
        ThoiLuongPhut = ISNULL(@tl, ThoiLuongPhut),
        MoTaDV = ISNULL(@mota, MoTaDV),
        HinhAnhDV = ISNULL(@anh, HinhAnhDV)
      WHERE MaDV = @id`);
}

async function setServiceStatus(id, trangThai) {
  const pool = await getPool();
  await pool.request()
    .input('id', sql.Int, id)
    .input('tt', sql.TinyInt, trangThai)
    .query(`UPDATE DICHVU SET TrangThaiDV = @tt WHERE MaDV = @id`);
}

/* ============ THỢ CẮT TÓC ============ */
const BARBER_SELECT = `
  SELECT t.MaTho, t.MaND, n.HoTen, n.SoDienThoai, n.Email,
         n.TrangThai AS TaiKhoanHoatDong,
         t.ChuyenMon, t.SoNamKN, t.GioiThieuNgan, t.AnhDaiDien,
         t.DiemDanhGiaTB, t.TrangThaiLamViec
  FROM THOCATTOC t JOIN NGUOIDUNG n ON n.MaND = t.MaND`;

async function listBarbers() {
  const pool = await getPool();
  const r = await pool.request().query(`${BARBER_SELECT} ORDER BY t.MaTho`);
  return r.recordset;
}

async function getBarberById(maTho) {
  const pool = await getPool();
  const r = await pool.request().input('id', sql.Int, maTho)
    .query(`${BARBER_SELECT} WHERE t.MaTho = @id`);
  return r.recordset[0] || null;
}

async function phoneExists(sdt) {
  const pool = await getPool();
  const r = await pool.request().input('sdt', sql.VarChar(15), sdt)
    .query(`SELECT 1 AS x FROM NGUOIDUNG WHERE SoDienThoai = @sdt`);
  return r.recordset.length > 0;
}

// Tạo tài khoản + hồ sơ thợ trong 1 giao dịch
async function createBarber(d, passwordHash) {
  const pool = await getPool();
  const tx = new sql.Transaction(pool);
  await tx.begin();
  try {
    const r1 = await new sql.Request(tx)
      .input('ht',   sql.NVarChar(100), d.hoTen)
      .input('sdt',  sql.VarChar(15), d.soDienThoai)
      .input('mail', sql.VarChar(100), d.email ?? null)
      .input('hash', sql.VarChar(255), passwordHash)
      .query(`
        INSERT INTO NGUOIDUNG (HoTen, SoDienThoai, Email, MatKhauHash, VaiTro)
        VALUES (@ht, @sdt, @mail, @hash, 'THOCAT');
        SELECT CAST(SCOPE_IDENTITY() AS INT) AS id;`);
    const maND = r1.recordset[0].id;

    const r2 = await new sql.Request(tx)
      .input('nd',  sql.Int, maND)
      .input('cm',  sql.NVarChar(150), d.chuyenMon)
      .input('kn',  sql.Int, d.soNamKN)
      .input('gt',  sql.NVarChar(500), d.gioiThieu ?? null)
      .input('anh', sql.VarChar(255), d.anhDaiDien ?? null)
      .query(`
        INSERT INTO THOCATTOC (MaND, ChuyenMon, SoNamKN, GioiThieuNgan, AnhDaiDien)
        VALUES (@nd, @cm, @kn, @gt, @anh);
        SELECT CAST(SCOPE_IDENTITY() AS INT) AS id;`);
    await tx.commit();
    return r2.recordset[0].id;
  } catch (e) {
    try { await tx.rollback(); } catch (_) { /* trigger có thể đã rollback rồi */ }
    throw e;
  }
}

async function updateBarber(maTho, d) {
  const pool = await getPool();
  await pool.request()
    .input('id',   sql.Int, maTho)
    .input('ht',   sql.NVarChar(100), d.hoTen ?? null)
    .input('mail', sql.VarChar(100), d.email ?? null)
    .input('cm',   sql.NVarChar(150), d.chuyenMon ?? null)
    .input('kn',   sql.Int, d.soNamKN ?? null)
    .input('gt',   sql.NVarChar(500), d.gioiThieu ?? null)
    .input('anh',  sql.VarChar(255), d.anhDaiDien ?? null)
    .query(`
      SET XACT_ABORT ON;
      BEGIN TRAN;
      UPDATE n SET HoTen = ISNULL(@ht, n.HoTen), Email = ISNULL(@mail, n.Email)
      FROM NGUOIDUNG n JOIN THOCATTOC t ON t.MaND = n.MaND WHERE t.MaTho = @id;
      UPDATE THOCATTOC SET
        ChuyenMon = ISNULL(@cm, ChuyenMon),
        SoNamKN = ISNULL(@kn, SoNamKN),
        GioiThieuNgan = ISNULL(@gt, GioiThieuNgan),
        AnhDaiDien = ISNULL(@anh, AnhDaiDien)
      WHERE MaTho = @id;
      COMMIT;`);
}

// DANGHIVIEC => khóa luôn tài khoản đăng nhập
async function setBarberStatus(maTho, tt) {
  const pool = await getPool();
  await pool.request()
    .input('id', sql.Int, maTho)
    .input('tt', sql.VarChar(20), tt)
    .query(`
      SET XACT_ABORT ON;
      BEGIN TRAN;
      UPDATE THOCATTOC SET TrangThaiLamViec = @tt WHERE MaTho = @id;
      UPDATE n SET TrangThai = CASE WHEN @tt = 'DANGHIVIEC' THEN 0 ELSE 1 END
      FROM NGUOIDUNG n JOIN THOCATTOC t ON t.MaND = n.MaND WHERE t.MaTho = @id;
      COMMIT;`);
}

async function countOpenBookings(maTho) {
  const pool = await getPool();
  const r = await pool.request().input('id', sql.Int, maTho).query(`
    SELECT COUNT(*) AS n FROM LICHHEN
    WHERE MaTho = @id
      AND TrangThaiLH IN ('ChoXacNhan','DaXacNhan','DangPhucVu')
      AND NgayHen >= CAST(GETDATE() AS DATE)`);
  return r.recordset[0].n;
}

module.exports = {
  listServices, getServiceById, serviceNameExists, createService, updateService, setServiceStatus,
  listBarbers, getBarberById, phoneExists, createBarber, updateBarber, setBarberStatus, countOpenBookings,
};