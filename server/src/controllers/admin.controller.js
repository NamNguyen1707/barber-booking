const s = require('../services/admin.service');

exports.listServices = async (req, res) => res.json(await s.listServices());
exports.createService = async (req, res) =>
  res.status(201).json({ message: 'Đã thêm dịch vụ', service: await s.createService(req.body) });
exports.updateService = async (req, res) =>
  res.json({ message: 'Đã cập nhật dịch vụ', service: await s.updateService(req.params.id, req.body) });
exports.setServiceStatus = async (req, res) =>
  res.json({ message: 'Đã đổi trạng thái dịch vụ', service: await s.setServiceStatus(req.params.id, req.body) });

exports.listBarbers = async (req, res) => res.json(await s.listBarbers());
exports.createBarber = async (req, res) =>
  res.status(201).json({ message: 'Đã thêm thợ', barber: await s.createBarber(req.body) });
exports.updateBarber = async (req, res) =>
  res.json({ message: 'Đã cập nhật thợ', barber: await s.updateBarber(req.params.id, req.body) });
exports.setBarberStatus = async (req, res) =>
  res.json({ message: 'Đã đổi trạng thái thợ', barber: await s.setBarberStatus(req.params.id, req.body) });