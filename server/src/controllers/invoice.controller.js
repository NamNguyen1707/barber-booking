const service = require('../services/invoice.service');

exports.list = async (req, res) => res.json(await service.list(req.query));
exports.preview = async (req, res) => res.json(await service.preview(req.params.maLH));
exports.getByBooking = async (req, res) => res.json(await service.getByBooking(req.params.maLH));
exports.create = async (req, res) => {
  const invoice = await service.create(req.user, req.body);
  res.status(201).json({ message: 'Đã lập hóa đơn', invoice });
};
