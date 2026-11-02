require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { getPool } = require('./config/db');

const app = express();
app.use(cors({ origin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : true }));
app.use(express.json());

app.get('/api/health', async (req, res) => {
  try {
    const pool = await getPool();
    await pool.query('SELECT 1');
    res.json({ status: 'OK', database: 'connected' });
  } catch (err) {
    res.status(500).json({ database: 'ERROR' });
  }
});

app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api', require('./routes/catalog.routes'));
app.use('/api/bookings', require('./routes/booking.routes'));
app.use('/api/staff', require('./routes/staff.routes'));
app.use('/api/staff/invoices', require('./routes/invoice.routes'));
app.use('/api/admin', require('./routes/admin.routes'));
app.use('/api/admin/stats', require('./routes/stats.routes'));

// Xử lý lỗi chung
app.use((err, req, res, next) => {
  const errno = err.errno ?? err.number;
  if (errno >= 50000) {
    const status = errno === 50015 ? 409 : 400;
    return res.status(status).json({ message: err.sqlMessage || err.message });
  }
  if (errno === 1062 || errno === 2627 || errno === 2601) { // trùng khóa unique
    return res.status(409).json({ message: 'Dữ liệu đã tồn tại' });
  }
  if (err.status) return res.status(err.status).json({ message: err.message });
  console.error(err);
  res.status(500).json({ message: 'Lỗi hệ thống' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server chạy tại http://localhost:${PORT}`);

  // Tự sinh ca làm việc cho 15 ngày tới: lúc khởi động và lặp lại mỗi 6 giờ
  const genShifts = () =>
    require('./services/shift.service')
      .ensureDefaultShifts()
      .catch((e) => console.error('Shifts:', e.message));
  genShifts();
  setInterval(genShifts, 6 * 60 * 60 * 1000);
});
