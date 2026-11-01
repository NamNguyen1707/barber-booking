import { Link, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ROLE_LABEL, homeFor } from '../utils/roles';

const navLink = 'font-display uppercase tracking-wide text-cream/90 hover:text-copper';

export default function MainLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-10 border-b-4 border-copper/60 bg-espresso">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
            <Link to="/" className="flex items-center gap-2">
                <span className="flex h-9 w-9 items-center justify-center rounded-t-full rounded-b-sm border border-copper bg-coffee font-display text-sm text-copper">
                    36
                </span>
                <span className="font-display text-xl uppercase tracking-wider text-cream">
                    36<span className="text-copper">SHINE</span>
                </span>
            </Link>
          <nav className="flex items-center gap-5 text-sm">
            <Link to="/" className={navLink}>Trang chủ</Link>
            {user && user.role !== 'KHACHHANG' && (
              <Link to={homeFor(user.role)} className={navLink}>Khu vực làm việc</Link>
            )}
            {user ? (
              <div className="flex items-center gap-3">
                <span className="hidden text-cream/60 sm:block">
                  {user.name} · {ROLE_LABEL[user.role]}
                </span>
                <button onClick={handleLogout} className="btn-outline btn-sm">
                  Đăng xuất
                </button>
              </div>
            ) : (
              <Link to="/login" className="btn btn-sm">Đăng nhập</Link>
            )}
          </nav>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">
        <Outlet />
      </main>

    
    </div>
  );
}