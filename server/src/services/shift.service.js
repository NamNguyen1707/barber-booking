const { getPool } = require('../config/db');

// Tự tạo ca mặc định 08:30-22:00 cho mọi thợ đang làm việc trong N ngày tới
async function ensureDefaultShifts(days = 15) {
  const pool = await getPool();
  await pool.query(`
    INSERT INTO CALAMVIEC (MaTho, NgayLamViec, GioBatDau, GioKetThuc, SoKhachToiDa, TrangThaiCa)
    WITH RECURSIVE cte AS (
      SELECT 0 AS n
      UNION ALL
      SELECT n + 1 FROM cte WHERE n + 1 < ?
    )
    SELECT t.MaTho, DATE_ADD(CURDATE(), INTERVAL cte.n DAY), '08:30:00', '22:00:00', 12, 'DANGMO'
    FROM THOCATTOC t
    CROSS JOIN cte
    WHERE t.TrangThaiLamViec = 'DANGLAMVIEC'
      AND NOT EXISTS (
        SELECT 1 FROM CALAMVIEC c
        WHERE c.MaTho = t.MaTho AND c.NgayLamViec = DATE_ADD(CURDATE(), INTERVAL cte.n DAY)
      )
  `, [days]);
}

module.exports = { ensureDefaultShifts };
