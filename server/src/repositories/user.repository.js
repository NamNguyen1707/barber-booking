const { sql, getPool } = require('../config/db');

async function findByAccount(account) {
  const pool = await getPool();
  const r = await pool.request()
    .input('acc', sql.VarChar(100), account)
    .query(`
      SELECT nd.MaND, nd.HoTen, nd.SoDienThoai, nd.Email, nd.MatKhauHash,
             nd.VaiTro, nd.TrangThai, kh.MaKH, t.MaTho
      FROM NGUOIDUNG nd
      LEFT JOIN KHACHHANG kh ON kh.MaND = nd.MaND
      LEFT JOIN THOCATTOC t  ON t.MaND  = nd.MaND
      WHERE nd.Email = @acc OR nd.SoDienThoai = @acc`);
  return r.recordset[0];
}

async function isTaken(email, phone) {
  const pool = await getPool();
  const r = await pool.request()
    .input('email', sql.VarChar(100), email || null)
    .input('phone', sql.VarChar(15), phone)
    .query(`SELECT TOP 1 MaND FROM NGUOIDUNG
            WHERE SoDienThoai = @phone OR (@email IS NOT NULL AND Email = @email)`);
  return r.recordset.length > 0;
}

async function createCustomer({ hoTen, phone, email, hash, role }) {
  const pool = await getPool();
  const tx = new sql.Transaction(pool);
  await tx.begin();
  try {
    const u = await new sql.Request(tx)
      .input('hoTen', sql.NVarChar(100), hoTen)
      .input('phone', sql.VarChar(15), phone)
      .input('email', sql.VarChar(100), email || null)
      .input('hash', sql.VarChar(255), hash)
      .input('role', sql.VarChar(20), role)
      .query(`INSERT INTO NGUOIDUNG (HoTen, SoDienThoai, Email, MatKhauHash, VaiTro)
              VALUES (@hoTen, @phone, @email, @hash, @role);
              SELECT CAST(SCOPE_IDENTITY() AS INT) AS MaND;`);
    const maND = u.recordset[0].MaND;

    const k = await new sql.Request(tx)
      .input('maND', sql.Int, maND)
      .query(`INSERT INTO KHACHHANG (MaND) VALUES (@maND);
              SELECT CAST(SCOPE_IDENTITY() AS INT) AS MaKH;`);

    await tx.commit();
    return { maND, maKH: k.recordset[0].MaKH };
  } catch (err) {
    try { await tx.rollback(); } catch { /* trigger đã tự rollback */ }
    throw err;
  }
}

module.exports = { findByAccount, isTaken, createCustomer };