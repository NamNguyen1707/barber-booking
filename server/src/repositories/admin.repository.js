const { query, withTransaction } = require('../config/db');

/* ============ DỊCH VỤ ============ */
function listServices() {
  return query(
    `SELECT MaDV, TenDV, LoaiDV, DonGia, ThoiLuongPhut, MoTaDV, HinhAnhDV, TrangThaiDV
       FROM DICHVU ORDER BY TrangThaiDV DESC, MaDV`
  );
}

async function getServiceById(id) {
  const rows = await query(
    `SELECT MaDV, TenDV, LoaiDV, DonGia, ThoiLuongPhut, MoTaDV, HinhAnhDV, TrangThaiDV
       FROM DICHVU WHERE MaDV = ?`,
    [id]
  );
  return rows[0] || null;
}

async function serviceNameExists(ten, exceptId = 0) {
  const rows = await query(`SELECT 1 AS x FROM DICHVU WHERE TenDV = ? AND MaDV <> ?`, [ten, exceptId]);
  return rows.length > 0;
}

async function createService(d) {
  const r = await query(
    `INSERT INTO DICHVU (TenDV, LoaiDV, DonGia, ThoiLuongPhut, MoTaDV, HinhAnhDV) VALUES (?, ?, ?, ?, ?, ?)`,
    [d.tenDV, d.loaiDV, d.donGia, d.thoiLuongPhut, d.moTa ?? null, d.hinhAnh ?? null]
  );
  return r.insertId;
}

async function updateService(id, d) {
  await query(
    `UPDATE DICHVU SET
       TenDV = IFNULL(?, TenDV), LoaiDV = IFNULL(?, LoaiDV), DonGia = IFNULL(?, DonGia),
       ThoiLuongPhut = IFNULL(?, ThoiLuongPhut), MoTaDV = IFNULL(?, MoTaDV), HinhAnhDV = IFNULL(?, HinhAnhDV)
     WHERE MaDV = ?`,
    [d.tenDV ?? null, d.loaiDV ?? null, d.donGia ?? null, d.thoiLuongPhut ?? null,
     d.moTa ?? null, d.hinhAnh ?? null, id]
  );
}

async function setServiceStatus(id, trangThai) {
  await query(`UPDATE DICHVU SET TrangThaiDV = ? WHERE MaDV = ?`, [trangThai, id]);
}

/* ============ THỢ CẮT TÓC ============ */
const BARBER_SELECT = `
  SELECT t.MaTho, t.MaND, n.HoTen, n.SoDienThoai, n.Email,
         n.TrangThai AS TaiKhoanHoatDong,
         t.ChuyenMon, t.SoNamKN, t.GioiThieuNgan, t.AnhDaiDien,
         t.DiemDanhGiaTB, t.TrangThaiLamViec
    FROM THOCATTOC t JOIN NGUOIDUNG n ON n.MaND = t.MaND`;

function listBarbers() {
  return query(`${BARBER_SELECT} ORDER BY t.MaTho`);
}

async function getBarberById(maTho) {
  const rows = await query(`${BARBER_SELECT} WHERE t.MaTho = ?`, [maTho]);
  return rows[0] || null;
}

async function phoneExists(sdt) {
  const rows = await query(`SELECT 1 AS x FROM NGUOIDUNG WHERE SoDienThoai = ?`, [sdt]);
  return rows.length > 0;
}

async function emailExists(email) {
  const rows = await query(`SELECT 1 AS x FROM NGUOIDUNG WHERE Email = ?`, [email]);
  return rows.length > 0;
}

// Tạo tài khoản + hồ sơ thợ trong 1 giao dịch
function createBarber(d, passwordHash) {
  return withTransaction(async (conn) => {
    const [r1] = await conn.query(
      `INSERT INTO NGUOIDUNG (HoTen, SoDienThoai, Email, MatKhauHash, VaiTro) VALUES (?, ?, ?, ?, 'THOCAT')`,
      [d.hoTen, d.soDienThoai, d.email ?? null, passwordHash]
    );
    const [r2] = await conn.query(
      `INSERT INTO THOCATTOC (MaND, ChuyenMon, SoNamKN, GioiThieuNgan, AnhDaiDien) VALUES (?, ?, ?, ?, ?)`,
      [r1.insertId, d.chuyenMon, d.soNamKN, d.gioiThieu ?? null, d.anhDaiDien ?? null]
    );
    return r2.insertId;
  });
}

function updateBarber(maTho, d) {
  return withTransaction(async (conn) => {
    await conn.query(
      `UPDATE NGUOIDUNG n JOIN THOCATTOC t ON t.MaND = n.MaND
          SET n.HoTen = IFNULL(?, n.HoTen), n.Email = IFNULL(?, n.Email)
        WHERE t.MaTho = ?`,
      [d.hoTen ?? null, d.email ?? null, maTho]
    );
    await conn.query(
      `UPDATE THOCATTOC SET
         ChuyenMon = IFNULL(?, ChuyenMon), SoNamKN = IFNULL(?, SoNamKN),
         GioiThieuNgan = IFNULL(?, GioiThieuNgan), AnhDaiDien = IFNULL(?, AnhDaiDien)
       WHERE MaTho = ?`,
      [d.chuyenMon ?? null, d.soNamKN ?? null, d.gioiThieu ?? null, d.anhDaiDien ?? null, maTho]
    );
  });
}

// DANGHIVIEC => khóa luôn tài khoản đăng nhập
function setBarberStatus(maTho, tt) {
  return withTransaction(async (conn) => {
    await conn.query(`UPDATE THOCATTOC SET TrangThaiLamViec = ? WHERE MaTho = ?`, [tt, maTho]);
    await conn.query(
      `UPDATE NGUOIDUNG n JOIN THOCATTOC t ON t.MaND = n.MaND
          SET n.TrangThai = ? WHERE t.MaTho = ?`,
      [tt === 'DANGHIVIEC' ? 0 : 1, maTho]
    );
  });
}

async function countOpenBookings(maTho) {
  const rows = await query(
    `SELECT COUNT(*) AS n FROM LICHHEN
      WHERE MaTho = ? AND TrangThaiLH IN ('ChoXacNhan','DaXacNhan','DangPhucVu') AND NgayHen >= CURDATE()`,
    [maTho]
  );
  return rows[0].n;
}

module.exports = {
  listServices, getServiceById, serviceNameExists, createService, updateService, setServiceStatus,
  listBarbers, getBarberById, phoneExists, emailExists, createBarber, updateBarber, setBarberStatus, countOpenBookings,
};
