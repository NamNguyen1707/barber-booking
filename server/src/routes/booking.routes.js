const router = require('express').Router();
const c = require('../controllers/booking.controller');
const { verifyToken, requireRole } = require('../middlewares/auth');
const { ROLES } = require('../config/constants');

router.use(verifyToken, requireRole(ROLES.KHACHHANG));

router.post('/', c.create);
router.get('/me', c.listMine);
router.patch('/:id/cancel', c.cancel);

module.exports = router;
