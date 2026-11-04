const s = require('../services/admin-user.service');

exports.list = async (req, res) => res.json(await s.list(req.query));
exports.getOne = async (req, res) => res.json(await s.getOne(req.params.id));
exports.setStatus = async (req, res) =>
  res.json({ message: 'Đã đổi trạng thái tài khoản', user: await s.setStatus(req.user, req.params.id, req.body) });
exports.setRole = async (req, res) =>
  res.json({ message: 'Đã đổi vai trò', user: await s.setRole(req.user, req.params.id, req.body) });
