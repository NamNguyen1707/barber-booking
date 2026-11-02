const router = require('express').Router();
const c = require('../controllers/staff.controller');
const { verifyToken, requireRole } = require('../middlewares/auth');
const { ROLES } = require('../config/constants');

router.use(verifyToken, requireRole(ROLES.LETAN, ROLES.THO, ROLES.QUANLY, ROLES.ADMIN));

router.get('/bookings', c.list);
router.patch('/bookings/:id/status', c.setStatus);
router.post('/walk-in', requireRole(ROLES.LETAN, ROLES.QUANLY, ROLES.ADMIN), c.walkIn);

module.exports = router;
