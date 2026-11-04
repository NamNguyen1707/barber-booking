const repo = require('../repositories/admin-user.repository');
const { AppError } = require('./app-error');
const { ROLES } = require('../config/constants');
const { str, parseId } = require('../utils/helpers');

const ALL_ROLES = Object.values(ROLES);
// Vai trò được gán qua API này. THOCAT không gán ở đây: thợ phải tạo ở /api/admin/barbers (cần hồ sơ thợ).
const ASSIGNABLE = [ROLES.KHACHHANG, ROLES.LETAN, ROLES.QUANLY, ROLES.ADMIN];

async function list(q = {}) {
  const role = q.role ? String(q.role).toUpperCase() : null;
  if (role && !ALL_ROLES.includes(role)) throw new AppError(`Vai trò phải là một trong: ${ALL_ROLES.join(', ')}`, 400);

  let status = null;
  if (q.status !== undefined && q.status !== '') {
    status = Number(q.status);
    if (![0, 1].includes(status)) throw new AppError('status phải là 0 (khóa) hoặc 1 (hoạt động)', 400);
  }
  const limit = Math.min(Math.max(parseInt(q.limit, 10) || 20, 1), 100);
  const page = Math.max(parseInt(q.page, 10) || 1, 1);

  const { total, items } = await repo.list({
    q: str(q.q) || null, role, status, limit, offset: (page - 1) * limit,
  });
  return { total, page, limit, items };
}

async function getOne(idRaw) {
  const u = await repo.getById(parseId(idRaw, 'Mã người dùng'));
  if (!u) throw new AppError('Không tìm thấy người dùng', 404);
  return u;
}

function assertCanManage(actor, target) {
  if (target.MaND === actor.id) throw new AppError('Không thể tự thay đổi tài khoản của chính mình', 400);
}

async function setStatus(actor, idRaw, body) {
  const id = parseId(idRaw, 'Mã người dùng');
  const tt = Number(body?.trangThai);
  if (![0, 1].includes(tt)) throw new AppError('trangThai phải là 0 (khóa) hoặc 1 (hoạt động)', 400);
  const target = await repo.getById(id);
  if (!target) throw new AppError('Không tìm thấy người dùng', 404);
  assertCanManage(actor, target);
  await repo.setStatus(id, tt);
  return repo.getById(id);
}

async function setRole(actor, idRaw, body) {
  const id = parseId(idRaw, 'Mã người dùng');
  const vaiTro = String(body?.vaiTro || '').toUpperCase();
  if (!ASSIGNABLE.includes(vaiTro)) {
    throw new AppError(`vaiTro phải là một trong: ${ASSIGNABLE.join(', ')} (thợ cắt tóc thì thêm ở mục Thợ)`, 400);
  }
  const target = await repo.getById(id);
  if (!target) throw new AppError('Không tìm thấy người dùng', 404);
  assertCanManage(actor, target);
  if (target.VaiTro === ROLES.THO || target.MaTho) {
    throw new AppError('Tài khoản thợ cắt tóc được quản lý ở mục Thợ, không đổi vai trò ở đây', 409);
  }
  if (target.VaiTro === vaiTro) return target;
  if (target.MaKH && (await repo.countBookingsOfCustomer(target.MaKH)) > 0) {
    throw new AppError('Khách này đã có lịch hẹn nên không thể đổi sang vai trò nhân viên. Hãy khóa tài khoản thay vì đổi vai trò', 409);
  }
  await repo.changeRole(target, vaiTro);
  return repo.getById(id);
}

module.exports = { list, getOne, setStatus, setRole };
