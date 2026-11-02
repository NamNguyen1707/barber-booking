const service = require('../services/staff.service');

exports.list = async (req, res) => res.json(await service.list(req.user, req.query));
exports.setStatus = async (req, res) => {
  const booking = await service.setStatus(req.user, req.params.id, req.body);
  res.json({ message: 'Đã cập nhật trạng thái', booking });
};
exports.walkIn = async (req, res) => {
  const booking = await service.walkIn(req.body);
  res.status(201).json({ message: 'Đã tạo lịch cho khách vãng lai', booking });
};
