const repo = require('../repositories/invoice.repository');
const { AppError } = require('./auth.service');

const METHODS = ['TIENMAT', 'CHUYENKHOAN_QR'];
const DISCOUNT = { BAC: 0.05, VANG: 0.1, VIP: 0.1 };   // phải khớp với sp_LapHoaDon

const pad = (n) => String(n).padStart(2, '0');
const today = () => {
  const d = new Date();
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

function toId(v) {
  const n = Number(v);
  if (!Number.isInteger(n) || n <= 0) throw new AppError('Mã lịch hẹn không hợp lệ');
  return n;
}

async function preview(maLH) {
  const b = await repo.getBookingForInvoice(toId(maLH));
  if (!b) throw new AppError('Không tìm thấy lịch hẹn', 404);

  const tong = b.ChiTiet.reduce((s, d) => s + d.DonGiaApDung, 0);
  const giam = Math.round(tong * (DISCOUNT[b.HangThanhVien] || 0));
  return {
    ...b,
    TongTienDV: tong,
    GiamGia: giam,
    ThanhTien: tong - giam,
    DaCoHoaDon: !!b.MaHD,
    CoTheLapHoaDon: b.TrangThaiLH === 'HoanThanh' && !b.MaHD,
  };
}

async function create(user, body = {}) {
  const maLH = toId(body.maLH);
  if (!METHODS.includes(body.phuongThuc))
    throw new AppError('Phương thức thanh toán phải là TIENMAT hoặc CHUYENKHOAN_QR');

  const b = await repo.getBookingForInvoice(maLH);
  if (!b) throw new AppError('Không tìm thấy lịch hẹn', 404);
  if (b.MaHD) throw new AppError('Lịch hẹn này đã có hóa đơn', 409);
  if (b.TrangThaiLH !== 'HoanThanh')
    throw new AppError('BR08: Chỉ lập hóa đơn cho lịch hẹn đã hoàn thành');

  await repo.createInvoice({ maLH, cashierId: user.id, method: body.phuongThuc });
  return repo.getInvoiceByBooking(maLH);
}

async function getByBooking(maLH) {
  const inv = await repo.getInvoiceByBooking(toId(maLH));
  if (!inv) throw new AppError('Lịch hẹn này chưa có hóa đơn', 404);
  return inv;
}

async function list(q = {}) {
  const date = q.date === 'all' ? null : (q.date || today());
  if (date && !/^\d{4}-\d{2}-\d{2}$/.test(date)) throw new AppError('Ngày phải có dạng YYYY-MM-DD');
  return repo.listInvoices(date);
}

module.exports = { preview, create, getByBooking, list };