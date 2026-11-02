const { AppError } = require('../services/app-error');

// Lấy giá trị đầu tiên khác undefined trong danh sách tên trường (hỗ trợ nhiều tên gọi cũ/mới)
function pick(obj, ...keys) {
  for (const k of keys) {
    if (obj && obj[k] !== undefined && obj[k] !== null) return obj[k];
  }
  return undefined;
}

const str = (v) => (typeof v === 'string' ? v.trim() : v);

function parseId(v, label = 'Mã') {
  const n = Number(v);
  if (!Number.isInteger(n) || n <= 0) throw new AppError(`${label} không hợp lệ`, 400);
  return n;
}

// '2026-11-03' -> '2026-11-03' (kiểm tra là ngày hợp lệ)
function parseDate(v, label = 'Ngày') {
  if (typeof v !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(v)) {
    throw new AppError(`${label} phải có dạng YYYY-MM-DD`, 400);
  }
  const d = new Date(`${v}T00:00:00Z`);
  if (Number.isNaN(d.getTime()) || d.toISOString().slice(0, 10) !== v) {
    throw new AppError(`${label} không phải ngày hợp lệ`, 400);
  }
  return v;
}

// '9:05' | '09:05' | '09:05:00' -> '09:05:00'
function parseTime(v, label = 'Giờ') {
  const m = typeof v === 'string' ? v.trim().match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?$/) : null;
  if (!m) throw new AppError(`${label} phải có dạng HH:MM`, 400);
  const h = Number(m[1]);
  const mi = Number(m[2]);
  if (h > 23 || mi > 59) throw new AppError(`${label} không hợp lệ`, 400);
  return `${String(h).padStart(2, '0')}:${m[2]}:00`;
}

// [1,3] | '1,3' | 3 -> [1,3]  (không trùng, đều là số nguyên dương)
function parseIdList(v, label = 'Dịch vụ') {
  let arr;
  if (Array.isArray(v)) arr = v;
  else if (typeof v === 'number') arr = [v];
  else if (typeof v === 'string') arr = v.split(',');
  else arr = [];
  const ids = arr.map((x) => (typeof x === 'object' && x !== null ? (x.maDV ?? x.MaDV ?? x.id) : x))
    .map((x) => String(x).trim()).filter((x) => x !== '');
  if (ids.length === 0) throw new AppError(`Phải chọn ít nhất 1 ${label.toLowerCase()}`, 400);
  const out = [];
  for (const s of ids) {
    if (!/^\d+$/.test(s) || Number(s) <= 0) throw new AppError(`${label} không hợp lệ`, 400);
    if (!out.includes(Number(s))) out.push(Number(s));
  }
  return out;
}

// Giờ Việt Nam (UTC+7) bất kể máy chủ đặt múi giờ nào
function vnNow() {
  const d = new Date(Date.now() + 7 * 3600 * 1000);
  const iso = d.toISOString();
  return { date: iso.slice(0, 10), minutes: d.getUTCHours() * 60 + d.getUTCMinutes() };
}

function addDays(dateStr, n) {
  const d = new Date(`${dateStr}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}

module.exports = { pick, str, parseId, parseDate, parseTime, parseIdList, vnNow, addDays };
