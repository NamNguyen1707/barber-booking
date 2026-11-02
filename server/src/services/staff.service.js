const bcrypt = require('bcryptjs');
const repo = require('../repositories/booking.repository');
const userRepo = require('../repositories/user.repository');
const { AppError } = require('./app-error');
const { parseBookingInput } = require('./booking.service');
const { pick, str, parseId, parseDate, vnNow } = require('../utils/helpers');

const STATUSES = ['ChoXacNhan', 'DaXacNhan', 'DangPhucVu', 'HoanThanh', 'DaHuy', 'KhongDen'];
const STAFF_CAN_SET = ['DaXacNhan', 'DaHuy', 'KhongDen', 'DangPhucVu', 'HoanThanh'];
const BARBER_CAN_SET = ['DangPhucVu', 'HoanThanh'];

async function list(user, q) {
  let date;
  if (q.date === 'all') date = null;
  else if (q.date) date = parseDate(q.date, 'date');
  else date = vnNow().date;

  let status = null;
  if (q.status) {
    if (!STATUSES.includes(q.status)) throw new AppError(`status phải là một trong: ${STATUSES.join(', ')}`, 400);
    status = q.status;
  }
  // Thợ chỉ thấy lịch của chính mình
  let maTho = q.maTho ? parseId(q.maTho, 'Mã thợ') : null;
  if (user.role === 'THOCAT') maTho = user.maTho;

  return repo.listForStaff({ date, status, maTho });
}

async function setStatus(user, idRaw, body) {
  const maLH = parseId(idRaw, 'Mã lịch hẹn');
  const trangThai = pick(body || {}, 'trangThai', 'status', 'TrangThaiLH');
  const booking = await repo.getBookingById(maLH);
  if (!booking) throw new AppError('Không tìm thấy lịch hẹn', 404);

  if (user.role === 'THOCAT') {
    if (booking.MaTho !== user.maTho) throw new AppError('Bạn chỉ được cập nhật lịch của chính mình', 403);
    if (!BARBER_CAN_SET.includes(trangThai)) throw new AppError(`Thợ chỉ được chuyển sang: ${BARBER_CAN_SET.join(', ')}`, 403);
  } else if (!STAFF_CAN_SET.includes(trangThai)) {
    throw new AppError(`trangThai phải là một trong: ${STAFF_CAN_SET.join(', ')}`, 400);
  }
  await repo.updateStatus(maLH, trangThai); // trigger BR07 kiểm tra luồng chuyển trạng thái
  return repo.getBookingById(maLH);
}

// Khách vãng lai: tìm hoặc tạo khách theo số điện thoại rồi đặt lịch kênh WALKIN
async function walkIn(body) {
  const b = body || {};
  const input = parseBookingInput(b);
  const sdt = str(pick(b, 'soDienThoai', 'sdt', 'phone', 'SoDienThoai'));
  if (!/^0\d{9}$/.test(sdt || '')) throw new AppError('Số điện thoại phải gồm 10 chữ số, bắt đầu bằng 0', 400);

  let maKH;
  const existing = await userRepo.findByPhone(sdt);
  if (existing) {
    if (!existing.MaKH) throw new AppError('Số điện thoại này thuộc tài khoản nhân viên', 409);
    maKH = existing.MaKH;
  } else {
    const hoTen = str(pick(b, 'hoTen', 'name', 'fullName', 'HoTen'));
    if (!hoTen) throw new AppError('Khách mới cần có họ tên', 400);
    // Mật khẩu ban đầu của khách vãng lai = số điện thoại (khách có thể đổi sau)
    const created = await userRepo.createCustomer({
      hoTen, soDienThoai: sdt, email: null, passwordHash: await bcrypt.hash(sdt, 10),
    });
    maKH = created.maKH;
  }
  const maLH = await repo.createBooking({ ...input, maKH, kenh: 'WALKIN' });
  return repo.getBookingById(maLH);
}

module.exports = { list, setStatus, walkIn };
