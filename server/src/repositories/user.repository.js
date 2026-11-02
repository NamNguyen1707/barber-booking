const { query, withTransaction } = require('../config/db');

// Tìm tài khoản theo số điện thoại hoặc email
async function findByAccount(account) {
  const rows = await query(
    `SELECT n.MaND, n.HoTen, n.SoDienThoai, n.Email, n.MatKhauHash, n.VaiTro, n.TrangThai,
            k.MaKH, t.MaTho
       FROM NGUOIDUNG n
       LEFT JOIN KHACHHANG k ON k.MaND = n.MaND
       LEFT JOIN THOCATTOC t ON t.MaND = n.MaND
      WHERE n.SoDienThoai = ? OR n.Email = ?
      LIMIT 1`,
    [account, account]
  );
  return rows[0] || null;
}

async function findByPhone(sdt) {
  const rows = await query(
    `SELECT n.MaND, n.HoTen, n.VaiTro, n.TrangThai, k.MaKH
       FROM NGUOIDUNG n LEFT JOIN KHACHHANG k ON k.MaND = n.MaND
      WHERE n.SoDienThoai = ? LIMIT 1`,
    [sdt]
  );
  return rows[0] || null;
}

async function isTaken(sdt, email) {
  const rows = await query(
    `SELECT SoDienThoai, Email FROM NGUOIDUNG WHERE SoDienThoai = ? OR (? IS NOT NULL AND Email = ?) LIMIT 1`,
    [sdt, email ?? null, email ?? null]
  );
  return rows[0] || null;
}

// Tạo tài khoản + hồ sơ khách hàng trong một giao dịch, trả về { maND, maKH }
async function createCustomer({ hoTen, soDienThoai, email, passwordHash }) {
  return withTransaction(async (conn) => {
    const [r1] = await conn.query(
      `INSERT INTO NGUOIDUNG (HoTen, SoDienThoai, Email, MatKhauHash, VaiTro)
       VALUES (?, ?, ?, ?, 'KHACHHANG')`,
      [hoTen, soDienThoai, email ?? null, passwordHash]
    );
    const maND = r1.insertId;
    const [r2] = await conn.query(`INSERT INTO KHACHHANG (MaND) VALUES (?)`, [maND]);
    return { maND, maKH: r2.insertId };
  });
}

module.exports = { findByAccount, findByPhone, isTaken, createCustomer };
