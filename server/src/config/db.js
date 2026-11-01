const sql = require('mssql');
require('dotenv').config();

const config = {
  server: process.env.DB_SERVER || 'localhost',
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  port: Number(process.env.DB_PORT) || 1433,
  options: {
    encrypt: process.env.DB_ENCRYPT === 'true',
    trustServerCertificate: process.env.DB_TRUST_CERT !== 'false',
  },
  connectionTimeout: 60000,
  requestTimeout: 60000,  
};

let poolPromise;
function getPool() {
  if (!poolPromise) poolPromise = sql.connect(config);
  return poolPromise;
}

module.exports = { sql, getPool };