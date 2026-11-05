import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api, { errMsg } from '../api/client';
import { STATUS_LABEL, STATUS_STYLE, fmtDate, fmtMoney, weekdayOf } from '../utils/format';

export default function MyBookings() {
  const [items, setItems] = useState(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(null);

  const load = useCallback(() => {
    api.get('/bookings/me')
      .then((r) => setItems(r.data))
      .catch((e) => { setError(errMsg(e)); setItems([]); });
  }, []);
  useEffect(load, [load]);

  const cancel = async (b) => {
    if (!window.confirm(`Hủy lịch ${b.GioBatDau} ngày ${fmtDate(b.NgayHen)} với thợ ${b.ThoCatToc}?`)) return;
    setError(''); setBusy(b.MaLH);
    try {
      await api.patch(`/bookings/${b.MaLH}/cancel`);
      load();
    } catch (e) {
      setError(errMsg(e));
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="font-display text-sm uppercase tracking-[0.3em] text-copper-dark">Tài khoản</p>
          <h1 className="text-3xl sm:text-4xl">Lịch của tôi</h1>
        </div>
        <Link to="/booking" className="btn">Đặt lịch mới</Link>
      </div>

      {error && <p className="mb-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

      {items === null ? (
        <p className="text-ink/60">Đang tải...</p>
      ) : items.length === 0 ? (
        <div className="card p-10 text-center">
          <p className="text-ink/70">Bạn chưa có lịch hẹn nào.</p>
          <Link to="/booking" className="btn mt-4">Đặt lịch ngay</Link>
        </div>
      ) : (
        <ul className="space-y-4">
          {items.map((b) => (
            <li key={b.MaLH} className="card flex flex-wrap items-center justify-between gap-4 p-5">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-display text-lg uppercase tracking-wide">
                    {b.GioBatDau} – {b.GioKetThucDK}
                  </span>
                  <span className="text-ink/60">{weekdayOf(b.NgayHen)}, {fmtDate(b.NgayHen)}</span>
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_STYLE[b.TrangThaiLH] || ''}`}>
                    {STATUS_LABEL[b.TrangThaiLH] || b.TrangThaiLH}
                  </span>
                </div>
                <p className="mt-1 text-sm">Thợ: <b>{b.ThoCatToc}</b></p>
                <p className="text-sm text-ink/70">{b.DichVu}</p>
                {b.GhiChuKhach && <p className="text-sm italic text-ink/50">“{b.GhiChuKhach}”</p>}
              </div>
              <div className="text-right">
                <p className="font-semibold text-copper-dark">{fmtMoney(b.TongTienTamTinh)}</p>
                <p className="text-xs text-ink/50">Mã #{b.MaLH}</p>
                {b.CoTheHuy && (
                  <button className="btn-outline btn-sm mt-2" disabled={busy === b.MaLH} onClick={() => cancel(b)}>
                    {busy === b.MaLH ? 'Đang hủy...' : 'Hủy lịch'}
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
