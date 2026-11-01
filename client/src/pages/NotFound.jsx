import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="py-20 text-center">
      <h1 className="mb-3 text-6xl text-coffee/30">404</h1>
      <p className="mb-6 text-ink/70">Không tìm thấy trang này.</p>
      <Link to="/" className="btn-outline">Về trang chủ</Link>
    </div>
  );
}