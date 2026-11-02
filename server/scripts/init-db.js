// Nạp database MySQL từ file database/datlich_cattoc_mysql.sql
// Dùng:  npm run db:init            (lần đầu)
//        npm run db:init -- --force (xóa và tạo lại toàn bộ dữ liệu)
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');

const FILE = path.join(__dirname, '..', '..', 'database', 'datlich_cattoc_mysql.sql');
const force = process.argv.includes('--force');

// Bỏ chú thích '-- ...' ở cuối dòng (không đụng vào nội dung trong dấu nháy)
function stripLineComment(line) {
  let q = null;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (q) { if (ch === '\\') i++; else if (ch === q) q = null; }
    else if (ch === "'" || ch === '"' || ch === '`') q = ch;
    else if (ch === '-' && line[i + 1] === '-' && (i + 2 >= line.length || /\s/.test(line[i + 2]))) return line.slice(0, i);
  }
  return line;
}

function parseStatements(sqlText) {
  const text = sqlText.replace(/\/\*[\s\S]*?\*\//g, ''); // bỏ chú thích /* ... */
  const statements = [];
  let delimiter = ';';
  let buffer = '';
  for (const rawLine of text.split(/\r?\n/)) {
    const line = stripLineComment(rawLine).trimEnd();
    const trimmed = line.trim();
    if (buffer === '' && (trimmed === '' || trimmed.startsWith('--'))) continue;
    if (buffer === '' && /^DELIMITER\s+/i.test(trimmed)) {
      delimiter = trimmed.replace(/^DELIMITER\s+/i, '').trim();
      continue;
    }
    if (trimmed.startsWith('--')) continue;
    buffer += line + '\n';
    if (buffer.trimEnd().endsWith(delimiter)) {
      const stmt = buffer.trimEnd().slice(0, -delimiter.length).trim();
      if (stmt) statements.push(stmt);
      buffer = '';
    }
  }
  if (buffer.trim()) statements.push(buffer.trim());
  return statements;
}

async function connect(withDb) {
  const useSsl = process.env.DB_SSL === 'true';
  return mysql.createConnection({
    host: process.env.DB_SERVER || process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: withDb ? process.env.DB_NAME : undefined,
    charset: 'utf8mb4',
    multipleStatements: false,
    ssl: useSsl ? { minVersion: 'TLSv1.2', rejectUnauthorized: false } : undefined,
  });
}

(async () => {
  const dbName = process.env.DB_NAME;
  if (!dbName) throw new Error('Thiếu DB_NAME trong file .env');

  let conn;
  try {
    conn = await connect(true);
  } catch (e) {
    if (e.errno !== 1049) throw e; // 1049 = database chưa tồn tại
    const tmp = await connect(false);
    await tmp.query(`CREATE DATABASE \`${dbName}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
    await tmp.end();
    console.log(`Đã tạo database ${dbName}`);
    conn = await connect(true);
  }

  // Chống chạy nhầm làm mất dữ liệu
  const [t] = await conn.query(
    `SELECT COUNT(*) AS n FROM information_schema.tables WHERE table_schema = ? AND table_name = 'NGUOIDUNG'`,
    [dbName]
  );
  if (t[0].n > 0 && !force) {
    const [u] = await conn.query('SELECT COUNT(*) AS n FROM NGUOIDUNG');
    if (u[0].n > 0) {
      console.error(`Database ${dbName} đã có dữ liệu. Để xóa và tạo lại, chạy: npm run db:init -- --force`);
      process.exit(1);
    }
  }

  const statements = parseStatements(fs.readFileSync(FILE, 'utf8'));
  console.log(`Đang chạy ${statements.length} câu lệnh SQL...`);
  let i = 0;
  for (const stmt of statements) {
    i += 1;
    try {
      await conn.query(stmt);
    } catch (e) {
      console.error(`\nLỗi ở câu lệnh thứ ${i}:\n${stmt.slice(0, 300)}\n\n${e.message}`);
      process.exit(1);
    }
  }
  await conn.end();
  console.log('Xong! Database đã sẵn sàng. Tài khoản mẫu: 0900000001 / password (quản lý).');
})().catch((e) => {
  console.error('Không chạy được:', e.message);
  process.exit(1);
});
