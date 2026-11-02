const mysql = require('mysql2/promise');
require('dotenv').config();

const isSsl = process.env.DB_SSL === 'true';

const config = {
  host: process.env.DB_SERVER || 'localhost',
  port: Number(process.env.DB_PORT) || 3306,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  ssl: isSsl ? { rejectUnauthorized: false } : undefined,
  dateStrings: true,
  decimalNumbers: true,
  charset: 'utf8mb4',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
};

let pool;
function getPool() {
  if (!pool) {
    pool = mysql.createPool(config);
  }
  return pool;
}

module.exports = { getPool };
