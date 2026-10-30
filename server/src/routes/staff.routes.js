const router = require('express').Router();
const c = require('../controllers/staff.controller');
const { verifyToken, requireRole } = require('../middlewares/auth');
const { ROLES } = require('../config/constants');

const frontDesk = [ROLES.LETAN, ROLES.QUANLY, ROLES.ADMIN];

router.get('/bookings', verifyToken, requireRole(...frontDesk, ROLES.THO), c.list);
router.patch('/bookings/:id/status', verifyToken, requireRole(...frontDesk, ROLES.THO), c.changeStatus);
router.post('/walk-in', verifyToken, requireRole(...frontDesk), c.walkIn);

module.exports = router;