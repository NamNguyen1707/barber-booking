const repo = require('../repositories/booking.repository');
const { AppError } = require('./app-error');
const { pick, str, parseId, parseDate, parseTime, parseIdList } = require('../utils/helpers');

// Đọc và kiểm tra dữ liệu đặt lịch (chấp nhận nhiều tên trường để tương thích bản cũ)
function parseBookingInput(b) {
  const maTho = parseId(pick(b, 'maTho', 'MaTho', 'thoId'), 'Mã thợ');
  const date = parseDate(pick(b, 'ngay', 'date', 'ngayHen', 'NgayHen'), 'Ngày');
  const time = parseTime(pick(b, 'gio', 'time', 'gioBatDau', 'GioBatDau'), 'Giờ');
  const dsDV = parseIdList(pick(b, 'dichVu', 'dsDV', 'ds', 'dv', 'services', 'dichVuIds'));
  const ghiChu = str(pick(b, 'ghiChu', 'note', 'ghiChuKhach', 'GhiChuKhach')) || null;
  if (Number(time.slice(3, 5)) % 15 !== 0) throw new AppError('Giờ hẹn phải là bội số của 15 phút (ví dụ 10:00, 10:15)', 400);
  return { maTho, date, time, dsDV, ghiChu };
}

async function create(user, body) {
  if (!user.maKH) throw new AppError('Chỉ khách hàng mới được đặt lịch', 403);
  const input = parseBookingInput(body || {});
  const maLH = await repo.createBooking({ ...input, maKH: user.maKH, kenh: 'ONLINE' });
  return repo.getBookingById(maLH);
}

function listMine(user) {
  if (!user.maKH) throw new AppError('Chỉ khách hàng mới có lịch hẹn cá nhân', 403);
  return repo.getBookingsByCustomer(user.maKH);
}

async function cancel(user, idRaw) {
  if (!user.maKH) throw new AppError('Chỉ khách hàng mới được hủy lịch của mình', 403);
  const maLH = parseId(idRaw, 'Mã lịch hẹn');
  await repo.cancelBooking(maLH, user.maKH);
  return repo.getBookingById(maLH);
}

module.exports = { create, listMine, cancel, parseBookingInput };
