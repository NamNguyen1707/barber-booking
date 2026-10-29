const router = require('express').Router();
const c = require('../controllers/catalog.controller');

router.get('/services', c.services);
router.get('/barbers', c.barbers);
router.get('/slots', c.slots);

module.exports = router;