const { sql, getPool } = require('../config/db');

// Tự tạo ca mặc định 08:30-22:00 cho mọi thợ đang làm việc trong N ngày tới
async function ensureDefaultShifts(days = 15) {
  const pool = await getPool();
  await pool.request()
    .input('days', sql.Int, days)
    .query(`
      DECLARE @today DATE = CAST(GETDATE() AS DATE);
      INSERT INTO CALAMVIEC (MaTho, NgayLamViec, GioBatDau, GioKetThuc, SoKhachToiDa, TrangThaiCa)
      SELECT t.MaTho, DATEADD(DAY, d.n, @today), '08:30', '22:00', 12, 'DANGMO'
      FROM THOCATTOC t
      CROSS JOIN (SELECT TOP (@days) ROW_NUMBER() OVER (ORDER BY (SELECT NULL)) - 1 AS n
                  FROM sys.all_objects) d
      WHERE t.TrangThaiLamViec = 'DANGLAMVIEC'
        AND NOT EXISTS (SELECT 1 FROM CALAMVIEC c
                        WHERE c.MaTho = t.MaTho AND c.NgayLamViec = DATEADD(DAY, d.n, @today))`);
}

module.exports = { ensureDefaultShifts };