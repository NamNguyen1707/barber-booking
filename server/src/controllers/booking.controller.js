const service = require('../services/booking.service');

exports.create = async (req, res) => {
  const booking = await service.create(req.user, req.body);
  res.status(201).json({ message: 'Đặt lịch thành công, vui lòng chờ tiệm xác nhận', booking });
};

exports.mine = async (req, res) => {
  res.json(await service.listMine(req.user));
};

exports.cancel = async (req, res) => {
  const booking = await service.cancel(req.user, req.params.id);
  res.json({ message: 'Đã hủy lịch hẹn', booking });
};