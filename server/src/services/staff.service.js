const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const repo = require('../repositories/staff.repository');
const bookingRepo = require('../repositories/booking.repository');
const userRepo = require('../repositories/user.repository');
const { AppError } = require('./auth.service');
const { ROLES, USER_ACTIVE } = require('../config/constants');

const ALL_STATUS = ['ChoXacNhan', 'DaXacNhan', 'DangPhucVu', 'HoanThanh', 'DaHuy', 'KhongDen'];
const THO_ALLOWED = ['DangPhucVu', 'HoanThanh'];                                   // BR09
const STAFF_ALLOWED = ['DaXacNhan', 'DaHuy', 'KhongDen', 'DangPhucVu', 'HoanThanh'];

const pad = (n) => String(n).padStart(2, '0');
const today = () => {
  const d = new Date();
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

async function list(user, q = {}) {
  const isTho = user.role === ROLES.THO;
  if (isTho && !user.maTho) throw new AppError('Tài khoản thợ chưa có hồ sơ thợ cắt tóc', 403);

  const date = q.date === 'all' ? null : (q.date || today());
  if (date && !/^\d{4}-\d{2}-\d{2}$/.test(date)) throw new AppError('Ngày phải có dạng YYYY-MM-DD');
  if (q.status && !ALL_STATUS.includes(q.status)) throw new AppError('Trạng thái không hợp lệ');

  const maTho = isTho ? user.maTho : (q.maTho ? Number(q.maTho) : null);
  if (maTho !== null && (!Number.isInteger(maTho) || maTho <= 0)) throw new AppError('Mã thợ không hợp lệ');

  return repo.listBookings({ date, status: q.status, maTho });
}

async function changeStatus(user, id, body = {}) {
  const maLH = Number(id);
  if (!Number.isInteger(maLH) || maLH <= 0) throw new AppError('Mã lịch hẹn không hợp lệ');

  const isTho = user.role === ROLES.THO;
  const allowed = isTho ? THO_ALLOWED : STAFF_ALLOWED;
  if (!allowed.includes(body.status))
    throw new AppError('Trạng thái không hợp lệ hoặc bạn không có quyền đặt trạng thái này', 403);

  const cur = await repo.getBookingOwner(maLH);
  if (!cur) throw new AppError('Không tìm thấy lịch hẹn', 404);
  if (isTho && cur.MaTho !== user.maTho)
    throw new AppError('BR09: Thợ chỉ được cập nhật lịch hẹn của chính mình', 403);

  await repo.updateStatus(maLH, body.status);
  return bookingRepo.getBookingById(maLH);
}

// F5: tạo lịch cho khách đến trực tiếp (Walk-in)
async function walkIn(user, body = {}) {
  const hoTen = String(body.hoTen || '').trim();
  const phone = String(body.phone || '').trim();
  if (!hoTen) throw new AppError('Vui lòng nhập tên khách');
  if (!/^0\d{9}$/.test(phone)) throw new AppError('Số điện thoại không hợp lệ');

  const maTho = Number(body.maTho);
  if (!Number.isInteger(maTho) || maTho <= 0) throw new AppError('Vui lòng chọn thợ cắt tóc');
  const date = body.date || today();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) throw new AppError('Ngày hẹn phải có dạng YYYY-MM-DD');
  if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(body.time || '')) throw new AppError('Giờ hẹn phải có dạng HH:mm');

  const raw = Array.isArray(body.dv) ? body.dv : String(body.dv || '').split(',');
  const ids = raw.map(Number);
  if (!ids.length || ids.some((n) => !Number.isInteger(n) || n <= 0))
    throw new AppError('Vui lòng chọn ít nhất 1 dịch vụ');

  // Tìm khách theo số điện thoại; chưa có thì tạo hồ sơ khách (mật khẩu ngẫu nhiên, không đăng nhập được)
  let maKH;
  const u = await userRepo.findByAccount(phone);
  if (u) {
    if (!u.MaKH) throw new AppError('Số điện thoại này thuộc tài khoản không phải khách hàng', 409);
    if (u.TrangThai !== USER_ACTIVE) throw new AppError('Tài khoản khách đang bị khóa', 403);
    maKH = u.MaKH;
  } else {
    const hash = await bcrypt.hash(crypto.randomUUID(), 10);
    ({ maKH } = await userRepo.createCustomer({ hoTen, phone, email: null, hash, role: ROLES.KHACHHANG }));
  }

  const maLH = await bookingRepo.createBooking({
    maKH,
    maTho,
    date,
    time: body.time,
    ds: [...new Set(ids)].join(','),
    ghiChu: body.ghiChu ? String(body.ghiChu).trim().slice(0, 300) : null,
    kenh: 'WALKIN',
  });
  return bookingRepo.getBookingById(maLH);
}

module.exports = { list, changeStatus, walkIn };