const repo = require('../repositories/invoice.repository');
const { AppError } = require('./app-error');
const { pick, parseId, parseDate } = require('../utils/helpers');

const DISCOUNT = { THUONG: 0, BAC: 0.05, VANG: 0.1, VIP: 0.1 };
const METHODS = ['TIENMAT', 'CHUYENKHOAN_QR'];

// Xem trước số tiền sẽ thu (cùng công thức với sp_LapHoaDon)
async function preview(idRaw) {
  const maLH = parseId(idRaw, 'Mã lịch hẹn');
  const b = await repo.getBookingForInvoice(maLH);
  if (!b) throw new AppError('Không tìm thấy lịch hẹn', 404);
  const pct = DISCOUNT[b.HangThanhVien] ?? 0;
  const giamGia = Math.round(b.TongTienDV * pct);
  return {
    MaLH: b.MaLH,
    TrangThaiLH: b.TrangThaiLH,
    KhachHang: b.KhachHang,
    SDTKhach: b.SDTKhach,
    HangThanhVien: b.HangThanhVien,
    DichVu: b.DichVu,
    TongTienDV: b.TongTienDV,
    PhanTramGiam: pct * 100,
    GiamGia: giamGia,
    ThanhTien: b.TongTienDV - giamGia,
    DaCoHoaDon: !!b.DaCoHoaDon,
    CoTheLap: b.TrangThaiLH === 'HoanThanh' && !b.DaCoHoaDon,
  };
}

async function create(user, body) {
  const maLH = parseId(pick(body || {}, 'maLH', 'MaLH'), 'Mã lịch hẹn');
  const phuongThuc = pick(body || {}, 'phuongThuc', 'PhuongThucTT');
  if (!METHODS.includes(phuongThuc)) throw new AppError(`phuongThuc phải là một trong: ${METHODS.join(', ')}`, 400);

  const b = await repo.getBookingForInvoice(maLH);
  if (!b) throw new AppError('Không tìm thấy lịch hẹn', 404);
  if (b.DaCoHoaDon) throw new AppError('Lịch hẹn này đã có hóa đơn', 409);
  if (b.TrangThaiLH !== 'HoanThanh') throw new AppError('Chỉ lập hóa đơn cho lịch hẹn đã hoàn thành', 400);

  await repo.createInvoice(maLH, user.id, phuongThuc); // trigger BR08 + tích điểm + nâng hạng
  return repo.getInvoiceByBooking(maLH);
}

async function getByBooking(idRaw) {
  const inv = await repo.getInvoiceByBooking(parseId(idRaw, 'Mã lịch hẹn'));
  if (!inv) throw new AppError('Lịch hẹn này chưa có hóa đơn', 404);
  return inv;
}

function list(q) {
  return repo.listInvoices({
    from: q.from ? parseDate(q.from, 'from') : null,
    to: q.to ? parseDate(q.to, 'to') : null,
  });
}

module.exports = { preview, create, getByBooking, list };
