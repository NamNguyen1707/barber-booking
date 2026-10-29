require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { getPool } = require('./config/db');

const app = express();
app.use(cors());
app.use(express.json());

app.get('/api/health', async (req, res) => {
  try {
    const pool = await getPool();
    await pool.request().query('SELECT 1 AS ok');
    res.json({ status: 'OK', database: 'connected' });
  } catch (err) {
    res.status(500).json({ status: 'ERROR', message: err.message });
  }
});

app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api', require('./routes/catalog.routes'));
app.use('/api/bookings', require('./routes/booking.routes'));
// Xử lý lỗi chung
app.use((err, req, res, next) => {
  if (err.number >= 50000) {                       // lỗi nghiệp vụ từ trigger/procedure
    return res.status(400).json({ message: err.message });
  }
  if (err.number === 2627 || err.number === 2601) { // trùng khóa unique
    return res.status(409).json({ message: 'Dữ liệu đã tồn tại' });
  }
  if (err.status) return res.status(err.status).json({ message: err.message });
  console.error(err);
  res.status(500).json({ message: 'Lỗi hệ thống' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server chạy tại http://localhost:${PORT}`);
});
