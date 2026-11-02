const router = require('express').Router();
const c = require('../controllers/catalog.controller');

router.get('/services', c.listServices);
router.get('/barbers', c.listBarbers);
router.get('/slots', c.getSlots);

module.exports = router;
