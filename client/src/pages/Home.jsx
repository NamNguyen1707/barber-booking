import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Home() {
  const { user } = useAuth();
  return (
    <div className="w-full max-w-2xl rounded-lg border-2 border-dashed border-coffee/40 bg-cream px-8 py-12 text-center shadow-xl">
      <p className="font-display text-sm uppercase tracking-[0.3em] text-copper-dark">Tiệm cắt tóc nam</p>
      <h1 className="mt-2 text-4xl text-ink sm:text-5xl">Đặt lịch cắt tóc</h1>
      <p className="-mt-1 font-script text-4xl text-copper-dark">gọn gàng, chuẩn phong cách</p>
      <p className="mt-4 mb-8 text-ink/70">
        Chọn dịch vụ, chọn thợ, chọn giờ trống. Không cần chờ đợi tại tiệm.
      </p>

      {user ? (
        <p className="text-lg">Xin chào, <b>{user.name}</b>!</p>
      ) : (
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Link to="/login" className="btn">Đăng nhập để đặt lịch</Link>
          <Link to="/register" className="btn-outline">Đăng ký</Link>
        </div>
      )}
    </div>
  );
}
