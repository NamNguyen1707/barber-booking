const router = require('express').Router();
const c = require('../controllers/admin.controller');
const { verifyToken, requireRole } = require('../middlewares/auth');
const { ROLES } = require('../config/constants');

router.use(verifyToken, requireRole(ROLES.QUANLY, ROLES.ADMIN));

router.get('/services', c.listServices);
router.post('/services', c.createService);
router.put('/services/:id', c.updateService);
router.patch('/services/:id/status', c.setServiceStatus);

router.get('/barbers', c.listBarbers);
router.post('/barbers', c.createBarber);
router.put('/barbers/:id', c.updateBarber);
router.patch('/barbers/:id/status', c.setBarberStatus);

module.exports = router;
