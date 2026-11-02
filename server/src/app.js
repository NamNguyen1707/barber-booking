require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { query } = require('./config/db');
const errorHandler = require('./middlewares/error');

const app = express();
app.use(cors({ origin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : true }));
app.use(express.json());

app.get('/api/health', async (req, res) => {
  try {
    await query('SELECT 1 AS ok');
    res.json({ status: 'OK', database: 'connected' });
  } catch (err) {
    res.status(500).json({ status: 'ERROR', message: err.message });
  }
});

app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api', require('./routes/catalog.routes'));
app.use('/api/bookings', require('./routes/booking.routes'));
app.use('/api/staff/invoices', require('./routes/invoice.routes'));
app.use('/api/staff', require('./routes/staff.routes'));
app.use('/api/admin/stats', require('./routes/stats.routes'));
app.use('/api/admin', require('./routes/admin.routes'));

app.use(errorHandler);

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
