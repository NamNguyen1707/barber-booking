const bcrypt = require('bcryptjs');
const repo = require('../repositories/admin.repository');
const { AppError } = require('./auth.service');
const shift = require('./shift.service');

const LOAI_DV = ['CatGoi', 'UonToc', 'NhuomToc', 'Combo'];
const TT_THO = ['DANGLAMVIEC', 'TAMNGHI', 'DANGHIVIEC'];

function parseId(v) {
  const n = Number(v);
  if (!Number.isInteger(n) || n <= 0) throw new AppError('Mã không hợp lệ', 400);
  return n;
}
const str = (v) => (typeof v === 'string' ? v.trim() : v);

/* ---------- Dịch vụ ---------- */
function validateService(d, isCreate) {
  const out = {};
  if (d.tenDV !== undefined || isCreate) {
    const t = str(d.tenDV);
    if (!t) throw new AppError('Thiếu tên dịch vụ', 400);
    out.tenDV = t;
  }
  if (d.loaiDV !== undefined || isCreate) {
    if (!LOAI_DV.includes(d.loaiDV)) throw new AppError(`Loại dịch vụ phải là một trong: ${LOAI_DV.join(', ')}`, 400);
    out.loaiDV = d.loaiDV;
  }
  if (d.donGia !== undefined || isCreate) {
    const g = Number(d.donGia);
    if (!Number.isFinite(g) || g <= 0) throw new AppError('Đơn giá phải lớn hơn 0', 400);
    out.donGia = Math.round(g);
  }
  if (d.thoiLuongPhut !== undefined || isCreate) {
    const tl = Number(d.thoiLuongPhut);
    if (!Number.isInteger(tl) || tl < 15) throw new AppError('Thời lượng phải là số nguyên >= 15 phút', 400);
    out.thoiLuongPhut = tl;
  }
  if (d.moTa !== undefined) out.moTa = str(d.moTa);
  if (d.hinhAnh !== undefined) out.hinhAnh = str(d.hinhAnh);
  return out;
}

async function listServices() { return repo.listServices(); }

async function createService(body) {
  const d = validateService(body || {}, true);
  if (await repo.serviceNameExists(d.tenDV)) throw new AppError('Tên dịch vụ đã tồn tại', 409);
  const id = await repo.createService(d);
  return repo.getServiceById(id);
}

async function updateService(idRaw, body) {
  const id = parseId(idRaw);
  if (!(await repo.getServiceById(id))) throw new AppError('Không tìm thấy dịch vụ', 404);
  const d = validateService(body || {}, false);
  if (d.tenDV && (await repo.serviceNameExists(d.tenDV, id))) throw new AppError('Tên dịch vụ đã tồn tại', 409);
  await repo.updateService(id, d);
  return repo.getServiceById(id);
}

async function setServiceStatus(idRaw, body) {
  const id = parseId(idRaw);
  const tt = Number(body?.trangThai);
  if (![0, 1].includes(tt)) throw new AppError('trangThai phải là 0 (ẩn) hoặc 1 (đang phục vụ)', 400);
  if (!(await repo.getServiceById(id))) throw new AppError('Không tìm thấy dịch vụ', 404);
  await repo.setServiceStatus(id, tt);
  return repo.getServiceById(id);
}

/* ---------- Thợ ---------- */
async function listBarbers() { return repo.listBarbers(); }

async function createBarber(body) {
  const b = body || {};
  const hoTen = str(b.hoTen);
  const sdt = str(b.soDienThoai);
  const chuyenMon = str(b.chuyenMon);
  const soNamKN = b.soNamKN === undefined ? 0 : Number(b.soNamKN);

  if (!hoTen) throw new AppError('Thiếu họ tên', 400);
  if (!/^0\d{9}$/.test(sdt || '')) throw new AppError('Số điện thoại phải gồm 10 chữ số, bắt đầu bằng 0', 400);
  if (typeof b.matKhau !== 'string' || b.matKhau.length < 6) throw new AppError('Mật khẩu tối thiểu 6 ký tự', 400);
  if (!chuyenMon) throw new AppError('Thiếu chuyên môn', 400);
  if (!Number.isInteger(soNamKN) || soNamKN < 0) throw new AppError('Số năm kinh nghiệm không hợp lệ', 400);
  if (await repo.phoneExists(sdt)) throw new AppError('Số điện thoại đã được sử dụng', 409);

  const hash = await bcrypt.hash(b.matKhau, 10);
  const maTho = await repo.createBarber(
    { hoTen, soDienThoai: sdt, email: str(b.email) || null, chuyenMon, soNamKN,
      gioiThieu: str(b.gioiThieu), anhDaiDien: str(b.anhDaiDien) },
    hash
  );

  // Sinh ca làm việc mặc định để khách đặt được ngay (RB04)
  try { await shift.ensureDefaultShifts(); } catch (e) { console.error('ensureDefaultShifts:', e.message); }

  return repo.getBarberById(maTho);
}

async function updateBarber(idRaw, body) {
  const id = parseId(idRaw);
  if (!(await repo.getBarberById(id))) throw new AppError('Không tìm thấy thợ', 404);
  const b = body || {};
  const d = {};
  if (b.hoTen !== undefined) { d.hoTen = str(b.hoTen); if (!d.hoTen) throw new AppError('Họ tên không được rỗng', 400); }
  if (b.chuyenMon !== undefined) { d.chuyenMon = str(b.chuyenMon); if (!d.chuyenMon) throw new AppError('Chuyên môn không được rỗng', 400); }
  if (b.soNamKN !== undefined) {
    d.soNamKN = Number(b.soNamKN);
    if (!Number.isInteger(d.soNamKN) || d.soNamKN < 0) throw new AppError('Số năm kinh nghiệm không hợp lệ', 400);
  }
  if (b.email !== undefined) d.email = str(b.email);
  if (b.gioiThieu !== undefined) d.gioiThieu = str(b.gioiThieu);
  if (b.anhDaiDien !== undefined) d.anhDaiDien = str(b.anhDaiDien);
  await repo.updateBarber(id, d);
  return repo.getBarberById(id);
}

async function setBarberStatus(idRaw, body) {
  const id = parseId(idRaw);
  const tt = body?.trangThaiLamViec;
  if (!TT_THO.includes(tt)) throw new AppError(`trangThaiLamViec phải là: ${TT_THO.join(', ')}`, 400);
  if (!(await repo.getBarberById(id))) throw new AppError('Không tìm thấy thợ', 404);

  if (tt !== 'DANGLAMVIEC') {
    const n = await repo.countOpenBookings(id);
    if (n > 0) throw new AppError(`Thợ còn ${n} lịch hẹn chưa hoàn thành, hãy xử lý các lịch này trước`, 409);
  }
  await repo.setBarberStatus(id, tt);
  if (tt === 'DANGLAMVIEC') {
    try { await shift.ensureDefaultShifts(); } catch (e) { console.error('ensureDefaultShifts:', e.message); }
  }
  return repo.getBarberById(id);
}

module.exports = {
  listServices, createService, updateService, setServiceStatus,
  listBarbers, createBarber, updateBarber, setBarberStatus,
};