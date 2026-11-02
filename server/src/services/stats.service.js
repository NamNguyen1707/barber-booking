const repo = require('../repositories/stats.repository');
const { AppError } = require('./app-error');
const { parseDate, vnNow } = require('../utils/helpers');

async function overview(q) {
  const today = vnNow().date;
  const from = q.from ? parseDate(q.from, 'from') : `${today.slice(0, 8)}01`;
  const to = q.to ? parseDate(q.to, 'to') : today;

  if (from > to) throw new AppError('from phải nhỏ hơn hoặc bằng to', 400);
  const days = (new Date(`${to}T00:00:00Z`) - new Date(`${from}T00:00:00Z`)) / 86400000;
  if (days > 366) throw new AppError('Khoảng thời gian tối đa 366 ngày', 400);

  const raw = await repo.overview(from, to);
  return {
    khoang: { from, to },
    tongLichHen: raw.trangThai.reduce((s, r) => s + r.SoLuong, 0),
    theoTrangThai: Object.fromEntries(raw.trangThai.map((r) => [r.TrangThai, r.SoLuong])),
    tongHoaDon: raw.tong.TongHoaDon,
    tongTien: raw.tong.TongTien,
    tongGiamGia: raw.tong.TongGiamGia,
    topDichVu: raw.topDichVu,
    theoNgay: raw.theoNgay,
    theoTho: raw.theoTho,
  };
}

module.exports = { overview };
