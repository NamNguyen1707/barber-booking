const { getPool } = require('../config/db');

/* ============ DỊCH VỤ ============ */
async function listServices() {
  const pool = await getPool();
  const [rows] = await pool.query(`
    SELECT MaDV, TenDV, LoaiDV, DonGia, ThoiLuongPhut, MoTaDV, HinhAnhDV, TrangThaiDV
    FROM DICHVU ORDER BY TrangThaiDV DESC, MaDV`);
  return rows;
}

async function getServiceById(id) {
  const pool = await getPool();
  const [rows] = await pool.query(`
    SELECT MaDV, TenDV, LoaiDV, DonGia, ThoiLuongPhut, MoTaDV, HinhAnhDV, TrangThaiDV
    FROM DICHVU WHERE MaDV = ?`,
    [id]
  );
  return rows[0] || null;
}

async function serviceNameExists(ten, exceptId = 0) {
  const pool = await getPool();
  const [rows] = await pool.query(
    `SELECT 1 AS x FROM DICHVU WHERE TenDV = ? AND MaDV <> ?`,
    [ten, exceptId]
  );
  return rows.length > 0;
}

async function createService(d) {
  const pool = await getPool();
  const [r] = await pool.query(`
    INSERT INTO DICHVU (TenDV, LoaiDV, DonGia, ThoiLuongPhut, MoTaDV, HinhAnhDV)
    VALUES (?, ?, ?, ?, ?, ?)`,
    [d.tenDV, d.loaiDV, d.donGia, d.thoiLuongPhut, d.moTa ?? null, d.hinhAnh ?? null]
  );
  return r.insertId;
}

async function updateService(id, d) {
  const pool = await getPool();
  await pool.query(`
    UPDATE DICHVU SET
      TenDV = IFNULL(?, TenDV),
      LoaiDV = IFNULL(?, LoaiDV),
      DonGia = IFNULL(?, DonGia),
      ThoiLuongPhut = IFNULL(?, ThoiLuongPhut),
      MoTaDV = IFNULL(?, MoTaDV),
      HinhAnhDV = IFNULL(?, HinhAnhDV)
    WHERE MaDV = ?`,
    [
      d.tenDV ?? null,
      d.loaiDV ?? null,
      d.donGia ?? null,
      d.thoiLuongPhut ?? null,
      d.moTa ?? null,
      d.hinhAnh ?? null,
      id
    ]
  );
}

async function setServiceStatus(id, trangThai) {
  const pool = await getPool();
  await pool.query(`UPDATE DICHVU SET TrangThaiDV = ? WHERE MaDV = ?`, [trangThai, id]);
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
  const [rows] = await pool.query(`${BARBER_SELECT} ORDER BY t.MaTho`);
  return rows;
}

async function getBarberById(maTho) {
  const pool = await getPool();
  const [rows] = await pool.query(`${BARBER_SELECT} WHERE t.MaTho = ?`, [maTho]);
  return rows[0] || null;
}

async function phoneExists(sdt) {
  const pool = await getPool();
  const [rows] = await pool.query(
    `SELECT 1 AS x FROM NGUOIDUNG WHERE SoDienThoai = ?`,
    [sdt]
  );
  return rows.length > 0;
}

// Tạo tài khoản + hồ sơ thợ trong 1 giao dịch
async function createBarber(d, passwordHash) {
  const pool = await getPool();
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const [r1] = await conn.query(`
      INSERT INTO NGUOIDUNG (HoTen, SoDienThoai, Email, MatKhauHash, VaiTro)
      VALUES (?, ?, ?, ?, 'THOCAT')`,
      [d.hoTen, d.soDienThoai, d.email ?? null, passwordHash]
    );
    const maND = r1.insertId;

    const [r2] = await conn.query(`
      INSERT INTO THOCATTOC (MaND, ChuyenMon, SoNamKN, GioiThieuNgan, AnhDaiDien)
      VALUES (?, ?, ?, ?, ?)`,
      [maND, d.chuyenMon, d.soNamKN, d.gioiThieu ?? null, d.anhDaiDien ?? null]
    );
    const maTho = r2.insertId;

    await conn.commit();
    return maTho;
  } catch (e) {
    try { await conn.rollback(); } catch (_) { /* ignore */ }
    throw e;
  } finally {
    conn.release();
  }
}

async function updateBarber(maTho, d) {
  const pool = await getPool();
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    await conn.query(`
      UPDATE NGUOIDUNG n
      JOIN THOCATTOC t ON t.MaND = n.MaND
      SET n.HoTen = IFNULL(?, n.HoTen),
          n.Email = IFNULL(?, n.Email)
      WHERE t.MaTho = ?`,
      [d.hoTen ?? null, d.email ?? null, maTho]
    );

    await conn.query(`
      UPDATE THOCATTOC SET
        ChuyenMon = IFNULL(?, ChuyenMon),
        SoNamKN = IFNULL(?, SoNamKN),
        GioiThieuNgan = IFNULL(?, GioiThieuNgan),
        AnhDaiDien = IFNULL(?, AnhDaiDien)
      WHERE MaTho = ?`,
      [
        d.chuyenMon ?? null,
        d.soNamKN ?? null,
        d.gioiThieu ?? null,
        d.anhDaiDien ?? null,
        maTho
      ]
    );

    await conn.commit();
  } catch (e) {
    try { await conn.rollback(); } catch (_) {}
    throw e;
  } finally {
    conn.release();
  }
}

// DANGHIVIEC => khóa luôn tài khoản đăng nhập
async function setBarberStatus(maTho, tt) {
  const pool = await getPool();
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    await conn.query(
      `UPDATE THOCATTOC SET TrangThaiLamViec = ? WHERE MaTho = ?`,
      [tt, maTho]
    );

    await conn.query(`
      UPDATE NGUOIDUNG n
      JOIN THOCATTOC t ON t.MaND = n.MaND
      SET n.TrangThai = CASE WHEN ? = 'DANGHIVIEC' THEN 0 ELSE 1 END
      WHERE t.MaTho = ?`,
      [tt, maTho]
    );

    await conn.commit();
  } catch (e) {
    try { await conn.rollback(); } catch (_) {}
    throw e;
  } finally {
    conn.release();
  }
}

async function countOpenBookings(maTho) {
  const pool = await getPool();
  const [rows] = await pool.query(`
    SELECT COUNT(*) AS n FROM LICHHEN
    WHERE MaTho = ?
      AND TrangThaiLH IN ('ChoXacNhan','DaXacNhan','DangPhucVu')
      AND NgayHen >= CURDATE()`,
    [maTho]
  );
  return rows[0].n;
}

module.exports = {
  listServices, getServiceById, serviceNameExists, createService, updateService, setServiceStatus,
  listBarbers, getBarberById, phoneExists, createBarber, updateBarber, setBarberStatus, countOpenBookings,
};
