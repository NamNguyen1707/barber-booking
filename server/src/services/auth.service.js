const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const repo = require('../repositories/user.repository');
const { AppError } = require('./app-error');
const { pick, str } = require('../utils/helpers');
const { USER_ACTIVE } = require('../config/constants');

function toUser(row) {
  return { id: row.MaND, name: row.HoTen, role: row.VaiTro, maKH: row.MaKH ?? null, maTho: row.MaTho ?? null };
}

function sign(user) {
  return jwt.sign(user, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES || '1d' });
}

async function register(body) {
  const b = body || {};
  const hoTen = str(pick(b, 'hoTen', 'name', 'fullName', 'HoTen'));
  const soDienThoai = str(pick(b, 'soDienThoai', 'sdt', 'phone', 'SoDienThoai'));
  const email = str(pick(b, 'email', 'Email')) || null;
  const matKhau = pick(b, 'matKhau', 'password', 'MatKhau');

  if (!hoTen) throw new AppError('Thiếu họ tên', 400);
  if (!/^0\d{9}$/.test(soDienThoai || '')) throw new AppError('Số điện thoại phải gồm 10 chữ số, bắt đầu bằng 0', 400);
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new AppError('Email không hợp lệ', 400);
  if (typeof matKhau !== 'string' || matKhau.length < 6) throw new AppError('Mật khẩu tối thiểu 6 ký tự', 400);

  const dup = await repo.isTaken(soDienThoai, email);
  if (dup) {
    throw new AppError(dup.SoDienThoai === soDienThoai ? 'Số điện thoại đã được đăng ký' : 'Email đã được đăng ký', 409);
  }
  const passwordHash = await bcrypt.hash(matKhau, 10);
  const { maND, maKH } = await repo.createCustomer({ hoTen, soDienThoai, email, passwordHash });
  return { id: maND, name: hoTen, role: 'KHACHHANG', maKH, maTho: null };
}

async function login(body) {
  const b = body || {};
  const account = str(pick(b, 'account', 'taiKhoan', 'username', 'soDienThoai', 'email'));
  const password = pick(b, 'password', 'matKhau');
  if (!account || typeof password !== 'string' || !password) {
    throw new AppError('Vui lòng nhập tài khoản và mật khẩu', 400);
  }
  const row = await repo.findByAccount(account);
  if (!row || !(await bcrypt.compare(password, row.MatKhauHash))) {
    throw new AppError('Sai tài khoản hoặc mật khẩu', 401);
  }
  if (row.TrangThai !== USER_ACTIVE) throw new AppError('Tài khoản đã bị khóa', 403);
  const user = toUser(row);
  return { token: sign(user), user };
}

module.exports = { register, login, AppError };
