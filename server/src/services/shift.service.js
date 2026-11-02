const { query } = require('../config/db');

// Tự sinh ca làm việc 08:30 – 22:00 cho thợ đang làm việc trong `days` ngày tới (bỏ qua ngày đã có ca)
async function ensureDefaultShifts(days = 15) {
  const offsets = Array.from({ length: days }, (_, i) => `SELECT ${i} AS n`).join(' UNION ALL ');
  const r = await query(
    `INSERT INTO CALAMVIEC (MaTho, NgayLamViec, GioBatDau, GioKetThuc, SoKhachToiDa, TrangThaiCa)
     SELECT t.MaTho, DATE_ADD(CURDATE(), INTERVAL d.n DAY), '08:30:00', '22:00:00', 12, 'DANGMO'
       FROM THOCATTOC t CROSS JOIN (${offsets}) d
      WHERE t.TrangThaiLamViec = 'DANGLAMVIEC'
        AND NOT EXISTS (SELECT 1 FROM CALAMVIEC c
                         WHERE c.MaTho = t.MaTho AND c.NgayLamViec = DATE_ADD(CURDATE(), INTERVAL d.n DAY))`
  );
  return r.affectedRows;
}

module.exports = { ensureDefaultShifts };
