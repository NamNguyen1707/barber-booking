import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { errMsg } from '../api/client';
import { homeFor } from '../utils/roles';
import './Auth.css';

export default function Login() {
  const { login, loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [account, setAccount] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await login(account.trim(), password);
      navigate(location.state?.from?.pathname || homeFor(user.role), { replace: true });
    } catch (err) {
      setError(errMsg(err));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    if (window.google?.accounts?.id) {
      window.google.accounts.id.prompt();
    } else {
      setError('Tính năng đăng nhập Google đang được kết nối với tài khoản salon.');
    }
  };

  return (
    <div className="auth-page">
      {/* ================= CỘT TRÁI (BRANDING PANEL) ================= */}
      <aside className="auth-brand-side">
        <Link to="/" className="auth-brand-logo" title="Quay về trang chủ">
          <span className="auth-brand-logo-text">GENT CUT</span>
        </Link>

        <div className="auth-brand-main">
          <h1 className="auth-brand-title">Rất vui được gặp lại bạn.</h1>
          <p className="auth-brand-desc">
            Đăng nhập để theo dõi lịch hẹn sắp tới, chọn đúng người thợ quen thuộc và dễ dàng quản lý mọi buổi cắt của bạn.
          </p>
        </div>

        <div className="auth-brand-footer">
          © 2026 GENT CUT. Tiệm cắt tóc nam chuẩn phong cách.
        </div>
      </aside>

      {/* ================= CỘT PHẢI (FORM ĐĂNG NHẬP) ================= */}
      <main className="auth-form-side">
        <div className="auth-form-container">
          <h2 className="auth-form-title">Đăng nhập</h2>
          <p className="auth-form-subtitle">Vui lòng nhập thông tin tài khoản của bạn để tiếp tục.</p>

          {error && (
            <div className="auth-error-box" role="alert">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            <div className="auth-field">
              <label className="auth-label" htmlFor="login-account">
                Số điện thoại hoặc Email
              </label>
              <div className="auth-input-wrapper">
                <input
                  id="login-account"
                  className="auth-input"
                  type="text"
                  placeholder="0900 000 001 hoặc name@example.com"
                  value={account}
                  onChange={(e) => setAccount(e.target.value)}
                  required
                  autoFocus
                  autoComplete="username"
                />
              </div>
            </div>

            <div className="auth-field">
              <label className="auth-label" htmlFor="login-password">
                Mật khẩu
              </label>
              <div className="auth-input-wrapper">
                <input
                  id="login-password"
                  className="auth-input"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Nhập mật khẩu..."
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="auth-password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                >
                  {showPassword ? 'ẨN' : 'HIỆN'}
                </button>
              </div>
            </div>

            <button type="submit" className="auth-submit-btn" disabled={loading}>
              {loading ? 'Đang đăng nhập...' : 'ĐĂNG NHẬP'}
            </button>
          </form>

          <div className="auth-divider">
            <span>HOẶC</span>
          </div>

          <button
            type="button"
            className="auth-google-btn"
            onClick={handleGoogleLogin}
          >
            <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
              <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.616z" />
              <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" />
              <path fill="#FBBC05" d="M3.964 10.707c-.18-.54-.282-1.117-.282-1.707s.102-1.167.282-1.707V4.961H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.039l3.007-2.332z" />
              <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.961L3.964 7.293C4.672 5.166 6.656 3.58 9 3.58z" />
            </svg>
            <span>Tiếp tục với Google</span>
          </button>

          <div className="auth-switch-text">
            <span>Lần đầu ghé GENT CUT?</span>
            <Link to="/register" className="auth-switch-link">
              Tạo tài khoản ngay
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
