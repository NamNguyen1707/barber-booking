const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const repo = require('../repositories/user.repository');
const { ROLES, USER_ACTIVE } = require('../config/constants');

class AppError extends Error {
  constructor(message, status = 400) { super(message); this.status = status; }
}

function signToken(u) {
  return jwt.sign(
    { id: u.MaND, role: u.VaiTro, name: u.HoTen, maKH: u.MaKH || null, maTho: u.MaTho || null },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES || '1d' }
  );
}

async function register({ hoTen, phone, email, password }) {
  if (!hoTen || !phone || !password) throw new AppError('Thiếu họ tên, số điện thoại hoặc mật khẩu');
  if (!/^0\d{9}$/.test(phone)) throw new AppError('Số điện thoại không hợp lệ');
  if (password.length < 6) throw new AppError('Mật khẩu tối thiểu 6 ký tự');
  if (await repo.isTaken(email, phone)) throw new AppError('Số điện thoại hoặc email đã được đăng ký', 409);

  const hash = await bcrypt.hash(password, 10);
  return repo.createCustomer({ hoTen, phone, email, hash, role: ROLES.KHACHHANG });
}

async function login({ account, password }) {
  if (!account || !password) throw new AppError('Vui lòng nhập tài khoản và mật khẩu');
  const u = await repo.findByAccount(account);
  if (!u || !(await bcrypt.compare(password, u.MatKhauHash)))
    throw new AppError('Sai tài khoản hoặc mật khẩu', 401);
  if (u.TrangThai !== USER_ACTIVE) throw new AppError('Tài khoản đã bị khóa', 403);

  return {
    token: signToken(u),
    user: { id: u.MaND, name: u.HoTen, role: u.VaiTro, maKH: u.MaKH, maTho: u.MaTho },
  };
}

module.exports = { register, login, AppError };