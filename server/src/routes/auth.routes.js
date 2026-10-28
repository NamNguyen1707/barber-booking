const router = require('express').Router();
const c = require('../controllers/auth.controller');
const { verifyToken } = require('../middlewares/auth');

router.post('/register', c.register);
router.post('/login', c.login);
router.get('/me', verifyToken, (req, res) => res.json({ user: req.user }));

module.exports = router;