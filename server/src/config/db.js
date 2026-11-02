const mysql = require('mysql2/promise');

let pool;

// Trả về pool kết nối MySQL (tạo một lần, dùng lại)
function getPool() {
  if (!pool) {
    const useSsl = process.env.DB_SSL === 'true';
    pool = mysql.createPool({
      host: process.env.DB_SERVER || process.env.DB_HOST || 'localhost',
      port: Number(process.env.DB_PORT) || 3306,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      waitForConnections: true,
      connectionLimit: 10,
      connectTimeout: 30000,
      charset: 'utf8mb4',
      dateStrings: true,      // DATE/TIME/DATETIME trả về chuỗi, không bị lệch múi giờ
      decimalNumbers: true,   // DECIMAL trả về số
      ssl: useSsl ? { minVersion: 'TLSv1.2', rejectUnauthorized: process.env.DB_SSL_STRICT === 'true' } : undefined,
    });
    // Mọi kết nối dùng giờ Việt Nam để NOW(), CURDATE() trong trigger/procedure đúng giờ
    pool.pool.on('connection', (conn) => {
      conn.query("SET time_zone = '+07:00'");
    });
  }
  return pool;
}

// Chạy câu truy vấn, trả về mảng dòng (SELECT) hoặc ResultSetHeader (INSERT/UPDATE)
async function query(sql, params = []) {
  const [rows] = await getPool().query(sql, params);
  return rows;
}

// Chạy nhiều câu trong một giao dịch: fn nhận connection
async function withTransaction(fn) {
  const conn = await getPool().getConnection();
  try {
    await conn.beginTransaction();
    const result = await fn(conn);
    await conn.commit();
    return result;
  } catch (err) {
    try { await conn.rollback(); } catch (_) { /* bỏ qua */ }
    throw err;
  } finally {
    conn.release();
  }
}

module.exports = { getPool, query, withTransaction };
