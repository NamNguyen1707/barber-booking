const repo = require('../repositories/booking.repository');
const { AppError } = require('./auth.service');

function requireCustomer(user) {
  if (!user.maKH) throw new AppError('Chỉ khách hàng mới dùng được chức năng này', 403);
}

async function create(user, body) {
  requireCustomer(user);

  const maTho = Number(body.maTho);
  if (!Number.isInteger(maTho) || maTho <= 0) throw new AppError('Vui lòng chọn thợ cắt tóc');
  if (!/^\d{4}-\d{2}-\d{2}$/.test(body.date || '')) throw new AppError('Ngày hẹn phải có dạng YYYY-MM-DD');
  if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(body.time || '')) throw new AppError('Giờ hẹn phải có dạng HH:mm');

  const raw = Array.isArray(body.dv) ? body.dv : String(body.dv || '').split(',');
  const ids = raw.map(Number);
  if (!ids.length || ids.some((n) => !Number.isInteger(n) || n <= 0))
    throw new AppError('Vui lòng chọn ít nhất 1 dịch vụ');

  const ghiChu = body.ghiChu ? String(body.ghiChu).trim() : null;
  if (ghiChu && ghiChu.length > 300) throw new AppError('Ghi chú tối đa 300 ký tự');

  const maLH = await repo.createBooking({
    maKH: user.maKH,
    maTho,
    date: body.date,
    time: body.time,
    ds: [...new Set(ids)].join(','),
    ghiChu,
  });
  return repo.getBookingById(maLH);
}

async function listMine(user) {
  requireCustomer(user);
  return repo.getBookingsByCustomer(user.maKH);
}

async function cancel(user, id) {
  requireCustomer(user);
  const maLH = Number(id);
  if (!Number.isInteger(maLH) || maLH <= 0) throw new AppError('Mã lịch hẹn không hợp lệ');
  await repo.cancelBooking(maLH, user.maKH);
  return repo.getBookingById(maLH);
}

module.exports = { create, listMine, cancel };