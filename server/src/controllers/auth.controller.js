const service = require('../services/auth.service');

exports.register = async (req, res) => {
  const r = await service.register(req.body);
  res.status(201).json({ message: 'Đăng ký thành công', ...r });
};

exports.login = async (req, res) => {
  res.json(await service.login(req.body));
};