import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Home() {
  const { user } = useAuth();
  return (
    <section
      className="overflow-hidden rounded-2xl bg-coffee"
      style={{ backgroundImage: 'repeating-linear-gradient(45deg, rgba(255,255,255,.04) 0 14px, transparent 14px 28px)' }}
    >
      <div className="px-4 py-12 sm:px-12 sm:py-16">
        <div className="mx-auto max-w-2xl rounded-lg border-2 border-dashed border-coffee/40 bg-cream px-8 py-10 text-center shadow-xl">
          <p className="font-display text-sm uppercase tracking-[0.3em] text-copper-dark">Tiệm cắt tóc nam</p>
          <h1 className="mt-2 text-4xl text-ink sm:text-5xl">Đặt lịch cắt tóc</h1>
          <p className="-mt-1 font-script text-4xl text-copper-dark">gọn gàng, chuẩn phong cách</p>
          <p className="mt-4 text-ink/70">
            Chọn dịch vụ, chọn thợ, chọn giờ trống. Không cần chờ đợi tại tiệm.
          </p>

          <div className="mx-auto my-6 w-fit border-x-4 border-ink px-8 py-1">
            <div className="font-display text-sm uppercase tracking-[0.25em]">Mỗi ngày</div>
            <div className="font-display text-lg tracking-widest">08:30 – 22:00</div>
          </div>

          {user ? (
            <p className="text-lg">Xin chào, <b>{user.name}</b>!</p>
          ) : (
            <Link to="/login" className="btn">Đăng nhập để đặt lịch</Link>
          )}
        </div>
      </div>
    </section>
  );
}