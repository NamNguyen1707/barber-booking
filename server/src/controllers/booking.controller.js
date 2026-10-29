const service = require('../services/booking.service');

exports.create = async (req, res) => {
  const booking = await service.create(req.user, req.body);
  res.status(201).json({ message: 'Đặt lịch thành công, vui lòng chờ tiệm xác nhận', booking });
};