const router = require('express').Router();
const service = require('../services/stats.service');
const { verifyToken, requireRole } = require('../middlewares/auth');
const { ROLES } = require('../config/constants');

router.use(verifyToken, requireRole(ROLES.QUANLY, ROLES.ADMIN));

router.get('/', async (req, res) => {
  res.json(await service.overview(req.query));
});

module.exports = router;