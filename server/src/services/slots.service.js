const repo = require('../repositories/catalog.repository');
const { AppError } = require('./app-error');
const { parseId, parseDate, parseIdList, vnNow, addDays } = require('../utils/helpers');

const STEP = 15;            // mỗi 15 phút một khung giờ
const OPEN = 8 * 60 + 30;   // 08:30
const CLOSE = 22 * 60;      // 22:00
const MIN_ADVANCE = 180;    // đặt trước tối thiểu 3 giờ
const MAX_DAYS = 14;        // đặt trước tối đa 14 ngày

const hhmm = (min) => `${String(Math.floor(min / 60)).padStart(2, '0')}:${String(min % 60).padStart(2, '0')}`;

async function getSlots(q) {
  const maTho = parseId(q.maTho, 'Mã thợ');
  const date = parseDate(q.date, 'Ngày');
  const ids = parseIdList(q.dv);

  const services = await repo.getActiveServices(ids);
  if (services.length !== ids.length) {
    throw new AppError('Có dịch vụ không tồn tại hoặc đã ngừng phục vụ', 400);
  }
  const duration = services.reduce((s, d) => s + d.ThoiLuongPhut, 0);

  const barber = await repo.getBarber(maTho);
  if (!barber) throw new AppError('Không tìm thấy thợ', 404);
  if (barber.TrangThaiLamViec !== 'DANGLAMVIEC' || barber.TrangThai !== 1) {
    throw new AppError('Thợ hiện không nhận lịch', 400);
  }

  const now = vnNow();
  if (date < now.date) throw new AppError('Không thể chọn ngày đã qua', 400);
  if (date > addDays(now.date, MAX_DAYS)) throw new AppError(`Chỉ được đặt trước tối đa ${MAX_DAYS} ngày`, 400);

  const [shifts, busy] = await Promise.all([repo.getShifts(maTho, date), repo.getBusy(maTho, date)]);
  if (shifts.length === 0) return [];

  const earliest = date === now.date ? now.minutes + MIN_ADVANCE : 0;
  const slots = [];
  for (let t = OPEN; t + duration <= CLOSE; t += STEP) {
    if (t < earliest) continue;
    const end = t + duration;
    const inShift = shifts.some((s) => s.startMin <= t && end <= s.endMin);
    const free = !busy.some((b) => b.startMin < end && t < b.endMin);
    if (inShift && free) slots.push(hhmm(t));
  }
  return slots;
}

module.exports = { getSlots };
