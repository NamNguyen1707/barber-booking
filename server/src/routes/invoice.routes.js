const express = require('express');
const router = express.Router();
const { verifyToken, requireRole } = require('../middlewares/auth');
const { ROLES } = require('../config/constants');

router.use(verifyToken, requireRole(ROLES.LETAN, ROLES.QUANLY, ROLES.ADMIN));
const service = require('../services/invoice.service');

// API: Lấy danh sách hóa đơn (GET /api/staff/invoices)
router.get('/', async (req, res, next) => {
  try {
    res.json(await service.list(req.query));
  } catch (error) {
    next(error);
  }
});

// API: Tạo hóa đơn mới (POST /api/staff/invoices)
router.post('/', async (req, res, next) => {
  try {
    // Lưu ý: Đảm bảo bạn đã có middleware gán req.user ở app.js hoặc ở route này
    const invoice = await service.create(req.user, req.body);
    res.status(201).json({ message: 'Đã lập hóa đơn', invoice });
  } catch (error) {
    next(error);
  }
});

// API: Xem trước hóa đơn theo mã lịch hẹn (GET /api/staff/invoices/preview/:maLH)
router.get('/preview/:maLH', async (req, res, next) => {
  try {
    res.json(await service.preview(req.params.maLH));
  } catch (error) {
    next(error);
  }
});

// API: Lấy hóa đơn theo mã lịch hẹn (GET /api/staff/invoices/booking/:maLH)
router.get('/booking/:maLH', async (req, res, next) => {
  try {
    res.json(await service.getByBooking(req.params.maLH));
  } catch (error) {
    next(error);
  }
});

// BẮT BUỘC PHẢI EXPORT ROUTER
module.exports = router;