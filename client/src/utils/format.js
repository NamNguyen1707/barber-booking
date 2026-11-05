// Định dạng và tính ngày dùng chung (luôn theo giờ Việt Nam, giống máy chủ)
export const fmtMoney = (n) => `${new Intl.NumberFormat('vi-VN').format(Number(n) || 0)}đ`;

export const vnToday = () => new Date(Date.now() + 7 * 3600 * 1000).toISOString().slice(0, 10);

export function addDays(dateStr, n) {
  const d = new Date(`${dateStr}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}

// '2026-11-05' -> '05/11/2026'
export function fmtDate(s) {
  if (!s) return '';
  const [y, m, d] = String(s).slice(0, 10).split('-');
  return `${d}/${m}/${y}`;
}

const WEEKDAY_FULL = ['Chủ nhật', 'Thứ hai', 'Thứ ba', 'Thứ tư', 'Thứ năm', 'Thứ sáu', 'Thứ bảy'];
export function weekdayOf(dateStr) {
  return WEEKDAY_FULL[new Date(`${dateStr}T00:00:00Z`).getUTCDay()];
}

// '10:30' + 75 phút -> '11:45'
export function addMinutes(hhmm, minutes) {
  const [h, m] = hhmm.split(':').map(Number);
  const t = h * 60 + m + minutes;
  return `${String(Math.floor(t / 60)).padStart(2, '0')}:${String(t % 60).padStart(2, '0')}`;
}

export const STATUS_LABEL = {
  ChoXacNhan: 'Chờ xác nhận',
  DaXacNhan: 'Đã xác nhận',
  DangPhucVu: 'Đang phục vụ',
  HoanThanh: 'Hoàn thành',
  DaHuy: 'Đã hủy',
  KhongDen: 'Không đến',
};

export const STATUS_STYLE = {
  ChoXacNhan: 'bg-amber-100 text-amber-800',
  DaXacNhan: 'bg-sky-100 text-sky-800',
  DangPhucVu: 'bg-violet-100 text-violet-800',
  HoanThanh: 'bg-emerald-100 text-emerald-800',
  DaHuy: 'bg-stone-200 text-stone-600',
  KhongDen: 'bg-red-100 text-red-700',
};
