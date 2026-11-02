const router = require('express').Router();
const c = require('../controllers/invoice.controller');
const { verifyToken, requireRole } = require('../middlewares/auth');
const { ROLES } = require('../config/constants');

router.use(verifyToken, requireRole(ROLES.LETAN, ROLES.QUANLY, ROLES.ADMIN));

router.get('/', c.list);
router.get('/preview/:maLH', c.preview);
router.get('/booking/:maLH', c.getByBooking);
router.post('/', c.create);

module.exports = router;
