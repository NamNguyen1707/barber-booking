const { getPool } = require('../config/db');

async function findByAccount(account) {
  const pool = await getPool();
  const [rows] = await pool.query(`
    SELECT nd.MaND, nd.HoTen, nd.SoDienThoai, nd.Email, nd.MatKhauHash,
           nd.VaiTro, nd.TrangThai, kh.MaKH, t.MaTho
    FROM NGUOIDUNG nd
    LEFT JOIN KHACHHANG kh ON kh.MaND = nd.MaND
    LEFT JOIN THOCATTOC t  ON t.MaND  = nd.MaND
    WHERE nd.Email = ? OR nd.SoDienThoai = ?`,
    [account, account]
  );
  return rows[0];
}

async function isTaken(email, phone) {
  const pool = await getPool();
  const [rows] = await pool.query(`
    SELECT MaND FROM NGUOIDUNG
    WHERE SoDienThoai = ? OR (? IS NOT NULL AND Email = ?)
    LIMIT 1`,
    [phone, email || null, email || null]
  );
  return rows.length > 0;
}

async function createCustomer({ hoTen, phone, email, hash, role }) {
  const pool = await getPool();
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const [u] = await conn.query(
      `INSERT INTO NGUOIDUNG (HoTen, SoDienThoai, Email, MatKhauHash, VaiTro)
       VALUES (?, ?, ?, ?, ?)`,
      [hoTen, phone, email || null, hash, role]
    );
    const maND = u.insertId;

    const [k] = await conn.query(
      `INSERT INTO KHACHHANG (MaND) VALUES (?)`,
      [maND]
    );
    const maKH = k.insertId;

    await conn.commit();
    return { maND, maKH };
  } catch (err) {
    try { await conn.rollback(); } catch { /* ignore rollback error */ }
    throw err;
  } finally {
    conn.release();
  }
}

module.exports = { findByAccount, isTaken, createCustomer };
