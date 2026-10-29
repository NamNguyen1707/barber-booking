const router = require('express').Router();
const c = require('../controllers/booking.controller');
const { verifyToken, requireRole } = require('../middlewares/auth');
const { ROLES } = require('../config/constants');

router.post('/', verifyToken, requireRole(ROLES.KHACHHANG), c.create);

module.exports = router;