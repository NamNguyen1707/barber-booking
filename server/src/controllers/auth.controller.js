const service = require('../services/auth.service');

exports.register = async (req, res) => {
  const user = await service.register(req.body);
  res.status(201).json({ message: 'Đăng ký thành công', user });
};

exports.login = async (req, res) => {
  res.json(await service.login(req.body));
};

exports.me = async (req, res) => {
  res.json({ user: req.user });
};

exports.google = async (req, res) => {
  res.json(await service.googleLogin(req.body));
};
