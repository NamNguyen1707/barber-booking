const router = require('express').Router();
const c = require('../controllers/booking.controller');
const { verifyToken, requireRole } = require('../middlewares/auth');
const { ROLES } = require('../config/constants');

const customerOnly = [verifyToken, requireRole(ROLES.KHACHHANG)];

router.post('/', customerOnly, c.create);
router.get('/me', customerOnly, c.mine);
router.patch('/:id/cancel', customerOnly, c.cancel);

module.exports = router;