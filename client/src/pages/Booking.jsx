import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import api, { errMsg } from '../api/client';
import { addDays, addMinutes, fmtDate, fmtMoney, vnToday, weekdayOf } from '../utils/format';

const MAX_DAYS = 14; // đặt trước tối đa 14 ngày (luật BR01)
const WEEK = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];

/* ---------- Lịch chọn ngày ---------- */
function Calendar({ value, onChange, min, max }) {
  const [ym, setYm] = useState(min.slice(0, 7));
  const [y, m] = ym.split('-').map(Number);
  const offset = (new Date(Date.UTC(y, m - 1, 1)).getUTCDay() + 6) % 7; // tuần bắt đầu từ thứ hai
  const total = new Date(Date.UTC(y, m, 0)).getUTCDate();
  const cells = [...Array(offset).fill(null), ...Array.from({ length: total }, (_, i) => i + 1)];
  const shift = (n) => setYm(new Date(Date.UTC(y, m - 1 + n, 1)).toISOString().slice(0, 7));

  return (
    <div className="rounded-lg border border-coffee/15 bg-white p-4">
      <div className="mb-3 flex items-center justify-between">
        <button type="button" onClick={() => shift(-1)} disabled={ym <= min.slice(0, 7)}
          className="h-8 w-8 rounded-full text-lg text-copper-dark hover:bg-cream disabled:opacity-30" aria-label="Tháng trước">‹</button>
        <span className="font-display uppercase tracking-wide">Tháng {m}/{y}</span>
        <button type="button" onClick={() => shift(1)} disabled={ym >= max.slice(0, 7)}
          className="h-8 w-8 rounded-full text-lg text-copper-dark hover:bg-cream disabled:opacity-30" aria-label="Tháng sau">›</button>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center text-sm">
        {WEEK.map((w) => <div key={w} className="py-1 text-xs text-ink/50">{w}</div>)}
        {cells.map((d, i) => {
          if (d === null) return <div key={`e${i}`} />;
          const key = `${ym}-${String(d).padStart(2, '0')}`;
          const disabled = key < min || key > max;
          const selected = key === value;
          return (
            <button key={key} type="button" disabled={disabled} onClick={() => onChange(key)}
              className={`aspect-square rounded-md text-sm transition
                ${selected ? 'bg-copper font-semibold text-espresso' : 'hover:bg-sand/50'}
                ${key === min && !selected ? 'ring-1 ring-copper/60' : ''}
                ${disabled ? 'cursor-not-allowed text-ink/25 hover:bg-transparent' : ''}`}>
              {d}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function Step({ no, title, children }) {
  return (
    <section>
      <h2 className="mb-3 flex items-baseline gap-3 text-xl">
        <span className="font-script text-3xl normal-case text-copper-dark">{no}</span>
        {title}
      </h2>
      {children}
    </section>
  );
}

const initials = (name) => name.split(' ').slice(-2).map((w) => w[0]).join('').toUpperCase();

function Avatar({ barber }) {
  const [broken, setBroken] = useState(!barber.AnhDaiDien);
  return broken ? (
    <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-coffee font-display text-xl text-copper">
      {initials(barber.HoTen)}
    </div>
  ) : (
    <img src={barber.AnhDaiDien} alt={barber.HoTen} onError={() => setBroken(true)}
      className="h-16 w-16 shrink-0 rounded-full object-cover" />
  );
}

/* ---------- Trang đặt lịch ---------- */
export default function Booking() {
  const today = useMemo(() => vnToday(), []);
  const maxDate = useMemo(() => addDays(today, MAX_DAYS), [today]);

  const [services, setServices] = useState([]);
  const [barbers, setBarbers] = useState([]);
  const [loadError, setLoadError] = useState('');

  const [selected, setSelected] = useState([]);   // mã dịch vụ đã chọn
  const [maTho, setMaTho] = useState(null);
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [ghiChu, setGhiChu] = useState('');

  const [slots, setSlots] = useState([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [slotsError, setSlotsError] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(null);

  useEffect(() => {
    Promise.all([api.get('/services'), api.get('/barbers')])
      .then(([s, b]) => { setServices(s.data); setBarbers(b.data); })
      .catch((e) => setLoadError(errMsg(e)));
  }, []);

  const chosen = services.filter((s) => selected.includes(s.MaDV));
  const totalMin = chosen.reduce((a, s) => a + s.ThoiLuongPhut, 0);
  const totalMoney = chosen.reduce((a, s) => a + s.DonGia, 0);
  const barber = barbers.find((b) => b.MaTho === maTho);
  const dvKey = [...selected].sort((a, b) => a - b).join(',');

  // Mỗi khi đổi dịch vụ / thợ / ngày thì lấy lại giờ trống (thời lượng thay đổi thì giờ trống cũng đổi)
  const loadSlots = () => {
    if (!dvKey || !maTho || !date) { setSlots([]); return () => {}; }
    let alive = true;
    setSlotsLoading(true); setSlotsError('');
    api.get('/slots', { params: { maTho, date, dv: dvKey } })
      .then((r) => { if (alive) setSlots(Array.isArray(r.data) ? r.data : r.data.slots || []); })
      .catch((e) => { if (alive) { setSlots([]); setSlotsError(errMsg(e)); } })
      .finally(() => { if (alive) setSlotsLoading(false); });
    return () => { alive = false; };
  };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(loadSlots, [dvKey, maTho, date]);
  useEffect(() => { setTime(''); }, [dvKey, maTho, date]);

  const toggle = (id) => setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));

  const groups = [
    ['Buổi sáng', slots.filter((t) => t < '12:00')],
    ['Buổi chiều', slots.filter((t) => t >= '12:00' && t < '17:00')],
    ['Buổi tối', slots.filter((t) => t >= '17:00')],
  ].filter(([, list]) => list.length);

  const ready = selected.length && maTho && date && time;

  const submit = async () => {
    setError(''); setSubmitting(true);
    try {
      const { data } = await api.post('/bookings', {
        maTho, date, time, dv: selected, ghiChu: ghiChu.trim() || undefined,
      });
      setDone(data.booking);
    } catch (e) {
      setError(errMsg(e));
      loadSlots(); // giờ vừa chọn có thể đã bị người khác đặt
      setTime('');
    } finally {
      setSubmitting(false);
    }
  };

  if (done) {
    return (
      <div className="mx-auto max-w-lg py-10 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-copper text-3xl text-espresso">✓</div>
        <h1 className="text-3xl">Đặt lịch thành công</h1>
        <p className="mt-2 text-ink/70">Lịch của bạn đang chờ tiệm xác nhận.</p>
        <div className="card mt-6 space-y-2 p-6 text-left">
          <Row k="Mã lịch hẹn" v={`#${done.MaLH}`} />
          <Row k="Thợ" v={done.ThoCatToc} />
          <Row k="Dịch vụ" v={done.DichVu} />
          <Row k="Thời gian" v={`${done.GioBatDau} – ${done.GioKetThucDK}, ${fmtDate(done.NgayHen)}`} />
          <Row k="Tạm tính" v={fmtMoney(done.TongTienTamTinh)} />
        </div>
        <div className="mt-6 flex justify-center gap-3">
          <Link to="/my-bookings" className="btn">Xem lịch của tôi</Link>
          <button className="btn-outline" onClick={() => { setDone(null); setSelected([]); setMaTho(null); setDate(''); setTime(''); setGhiChu(''); }}>
            Đặt thêm lịch
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <p className="font-display text-sm uppercase tracking-[0.3em] text-copper-dark">Đặt lịch</p>
        <h1 className="text-3xl sm:text-4xl">Chọn dịch vụ, thợ và giờ hẹn</h1>
      </div>
      {loadError && <p className="mb-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{loadError}</p>}

      <div className="grid gap-8 lg:grid-cols-[1fr_340px]">
        <div className="space-y-10">
          <Step no="01" title="Chọn dịch vụ">
            <div className="grid gap-3 sm:grid-cols-2">
              {services.map((s) => {
                const on = selected.includes(s.MaDV);
                return (
                  <button key={s.MaDV} type="button" onClick={() => toggle(s.MaDV)}
                    className={`rounded-lg border p-4 text-left transition ${on ? 'border-copper bg-sand/40 ring-2 ring-copper/40' : 'border-coffee/15 bg-white hover:border-copper'}`}>
                    <div className="flex items-start justify-between gap-2">
                      <span className="font-medium">{s.TenDV}</span>
                      <span className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border text-xs ${on ? 'border-copper bg-copper text-espresso' : 'border-coffee/30'}`}>{on ? '✓' : ''}</span>
                    </div>
                    {s.MoTaDV && <p className="mt-1 text-sm text-ink/60">{s.MoTaDV}</p>}
                    <p className="mt-2 text-sm"><b className="text-copper-dark">{fmtMoney(s.DonGia)}</b> · {s.ThoiLuongPhut} phút</p>
                  </button>
                );
              })}
            </div>
          </Step>

          <Step no="02" title="Chọn thợ">
            <div className="grid gap-3 sm:grid-cols-2">
              {barbers.map((b) => (
                <button key={b.MaTho} type="button" onClick={() => setMaTho(b.MaTho)}
                  className={`flex items-center gap-4 rounded-lg border p-4 text-left transition ${maTho === b.MaTho ? 'border-copper bg-sand/40 ring-2 ring-copper/40' : 'border-coffee/15 bg-white hover:border-copper'}`}>
                  <Avatar barber={b} />
                  <div className="min-w-0">
                    <div className="font-medium">{b.HoTen}</div>
                    <div className="truncate text-sm text-ink/60">{b.ChuyenMon}</div>
                    <div className="text-xs text-ink/50">
                      {b.SoNamKN} năm kinh nghiệm{b.DiemDanhGiaTB ? ` · ★ ${Number(b.DiemDanhGiaTB).toFixed(1)}` : ''}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </Step>

          <div className="grid gap-10 md:grid-cols-2">
            <Step no="03" title="Chọn ngày">
              <Calendar value={date} onChange={setDate} min={today} max={maxDate} />
              <p className="mt-2 text-xs text-ink/50">Đặt trước tối đa {MAX_DAYS} ngày, và trước giờ hẹn ít nhất 3 tiếng.</p>
            </Step>

            <Step no="04" title="Chọn giờ">
              {!selected.length || !maTho || !date ? (
                <p className="rounded-lg border border-dashed border-coffee/25 p-4 text-sm text-ink/60">
                  Chọn dịch vụ, thợ và ngày để xem giờ trống.
                </p>
              ) : slotsLoading ? (
                <p className="text-sm text-ink/60">Đang tải giờ trống...</p>
              ) : slotsError ? (
                <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{slotsError}</p>
              ) : groups.length === 0 ? (
                <p className="rounded-lg border border-dashed border-coffee/25 p-4 text-sm text-ink/60">
                  Ngày này thợ đã kín lịch hoặc không còn giờ phù hợp. Hãy chọn ngày hoặc thợ khác.
                </p>
              ) : (
                <div className="space-y-4">
                  {groups.map(([label, list]) => (
                    <div key={label}>
                      <p className="mb-2 text-xs uppercase tracking-widest text-ink/50">{label}</p>
                      <div className="grid grid-cols-4 gap-2">
                        {list.map((t) => (
                          <button key={t} type="button" onClick={() => setTime(t)}
                            className={`rounded-md border py-2 text-sm transition ${time === t ? 'border-copper bg-copper font-semibold text-espresso' : 'border-coffee/20 bg-white hover:border-copper'}`}>
                            {t}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Step>
          </div>

          <Step no="05" title="Ghi chú (không bắt buộc)">
            <textarea className="field" rows={3} maxLength={300} value={ghiChu} onChange={(e) => setGhiChu(e.target.value)}
              placeholder="Ví dụ: muốn giữ tóc dài phía trên, dị ứng hóa chất..." />
            <p className="mt-1 text-right text-xs text-ink/40">{ghiChu.length}/300</p>
          </Step>
        </div>

        {/* Tóm tắt lịch hẹn */}
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="card p-6">
            <h2 className="mb-4 text-xl">Tóm tắt lịch hẹn</h2>
            <dl className="space-y-3 text-sm">
              <div>
                <dt className="text-xs uppercase tracking-widest text-ink/50">Dịch vụ</dt>
                {chosen.length ? chosen.map((s) => (
                  <dd key={s.MaDV} className="flex justify-between gap-2 py-0.5"><span>{s.TenDV}</span><span>{fmtMoney(s.DonGia)}</span></dd>
                )) : <dd className="text-ink/40">Chưa chọn</dd>}
              </div>
              <Row k="Thợ" v={barber ? barber.HoTen : <span className="text-ink/40">Chưa chọn</span>} />
              <Row k="Ngày" v={date ? `${weekdayOf(date)}, ${fmtDate(date)}` : <span className="text-ink/40">Chưa chọn</span>} />
              <Row k="Giờ" v={time ? `${time} – ${addMinutes(time, totalMin)}` : <span className="text-ink/40">Chưa chọn</span>} />
              <Row k="Thời lượng" v={totalMin ? `${totalMin} phút` : '—'} />
            </dl>
            <div className="mt-4 flex items-baseline justify-between border-t border-coffee/15 pt-4">
              <span className="font-display uppercase tracking-wide">Tạm tính</span>
              <span className="text-xl font-semibold text-copper-dark">{fmtMoney(totalMoney)}</span>
            </div>
            <p className="mt-1 text-xs text-ink/50">Giảm giá theo hạng thành viên được tính khi thanh toán tại tiệm.</p>

            {error && <p className="mt-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
            <button className="btn mt-5 w-full" disabled={!ready || submitting} onClick={submit}>
              {submitting ? 'Đang đặt lịch...' : 'Xác nhận đặt lịch'}
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
}

function Row({ k, v }) {
  return (
    <div className="flex justify-between gap-3">
      <dt className="text-xs uppercase tracking-widest text-ink/50">{k}</dt>
      <dd className="text-right">{v}</dd>
    </div>
  );
}
