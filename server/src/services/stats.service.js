const repo = require('../repositories/stats.repository');
const { AppError } = require('./auth.service');

const pad = (n) => String(n).padStart(2, '0');
const fmt = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

function parseDate(s, label) {
  if (typeof s !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(s))
    throw new AppError(`${label} phải có dạng YYYY-MM-DD`, 400);
  const d = new Date(`${s}T00:00:00`);
  if (Number.isNaN(d.getTime()) || fmt(d) !== s)
    throw new AppError(`${label} không phải ngày hợp lệ`, 400);
  return d;
}

async function overview(q) {
  const now = new Date();
  const from = q.from || fmt(new Date(now.getFullYear(), now.getMonth(), 1));
  const to = q.to || fmt(now);

  const df = parseDate(from, 'from');
  const dt = parseDate(to, 'to');
  if (df > dt) throw new AppError('from phải nhỏ hơn hoặc bằng to', 400);
  if ((dt - df) / 86400000 > 366) throw new AppError('Khoảng thời gian tối đa 366 ngày', 400);

  const raw = await repo.overview(from, to);
  const theoTrangThai = Object.fromEntries(raw.trangThai.map((r) => [r.TrangThai, r.SoLuong]));
  const tongLichHen = raw.trangThai.reduce((s, r) => s + r.SoLuong, 0);

  return {
    khoang: { from, to },
    tongLichHen,
    theoTrangThai,
    tongHoaDon: raw.tong.TongHoaDon,
    tongTien: raw.tong.TongTien,
    tongGiamGia: raw.tong.TongGiamGia,
    topDichVu: raw.topDichVu,
    theoNgay: raw.theoNgay,
    theoTho: raw.theoTho,
  };
}

module.exports = { overview };