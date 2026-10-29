const repo = require('../repositories/catalog.repository');
const { AppError } = require('./auth.service');

const STEP = 15;                 // bước giờ (phút)
const OPEN = 8 * 60 + 30;        // 08:30
const CLOSE = 22 * 60;           // 22:00
const MIN_ADVANCE = 180;         // BR01: đặt trước tối thiểu 3 tiếng (180 phút)
const MAX_DAYS = 14;             // BR01: tối đa 14 ngày

const toMin = (s) => { const [h, m] = s.split(':').map(Number); return h * 60 + m; };
const toStr = (m) => `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`;
const pad = (n) => String(n).padStart(2, '0');
const localDate = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

async function getFreeSlots({ maTho, date, dv }) {
  maTho = Number(maTho);
  if (!Number.isInteger(maTho) || maTho <= 0) throw new AppError('Thiếu hoặc sai mã thợ');
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date || '')) throw new AppError('Ngày phải có dạng YYYY-MM-DD');
  if (!/^\d+(,\d+)*$/.test(dv || '')) throw new AppError('Vui lòng chọn ít nhất 1 dịch vụ (dv=1,3)');

  const now = new Date();
  const today = localDate(now);
  const limit = new Date(now); limit.setDate(limit.getDate() + MAX_DAYS);
  if (date < today) throw new AppError('Không thể đặt lịch cho ngày đã qua');
  if (date > localDate(limit)) throw new AppError(`Chỉ được đặt trước tối đa ${MAX_DAYS} ngày`);

  const dvIds = [...new Set(dv.split(','))];
  const { SoDV, TongPhut } = await repo.sumDuration(dvIds.join(','));
  if (SoDV !== dvIds.length) throw new AppError('Có dịch vụ không tồn tại hoặc đã ngừng phục vụ');

  const [shifts, booked] = await Promise.all([repo.getShifts(maTho, date), repo.getBooked(maTho, date)]);

  // Hôm nay: giờ bắt đầu phải >= bây giờ + 30 phút
  const earliest = date === today ? now.getHours() * 60 + now.getMinutes() + MIN_ADVANCE : 0;

  const slots = new Set();
  for (const ca of shifts) {
    const start = Math.max(toMin(ca.tu), OPEN);
    const end = Math.min(toMin(ca.den), CLOSE);
    for (let t = start; t + TongPhut <= end; t += STEP) {
      if (t < earliest) continue;
      const trung = booked.some((b) => toMin(b.tu) < t + TongPhut && t < toMin(b.den));
      if (!trung) slots.add(t);
    }
  }
  return { maTho, date, tongThoiLuong: TongPhut, slots: [...slots].sort((a, b) => a - b).map(toStr) };
}

module.exports = { getFreeSlots };