const service = require('../services/staff.service');

exports.list = async (req, res) => res.json(await service.list(req.user, req.query));

exports.changeStatus = async (req, res) => {
  const booking = await service.changeStatus(req.user, req.params.id, req.body);
  res.json({ message: 'Đã cập nhật trạng thái lịch hẹn', booking });
};

exports.walkIn = async (req, res) => {
  const booking = await service.walkIn(req.user, req.body);
  res.status(201).json({ message: 'Đã tạo lịch hẹn cho khách đến trực tiếp', booking });
};