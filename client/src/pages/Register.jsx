import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { errMsg } from '../api/client';
import './Auth.css';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [hoTen, setHoTen] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const trimmedPhone = phone.trim().replace(/\s+/g, '');
    if (!/^0\d{9}$/.test(trimmedPhone)) {
      setError('Số điện thoại phải gồm 10 chữ số và bắt đầu bằng số 0 (ví dụ: 0912345678).');
      return;
    }

    if (password.length < 6) {
      setError('Mật khẩu bảo mật phải có ít nhất 6 ký tự.');
      return;
    }

    setLoading(true);
    try {
      await register({
        hoTen: hoTen.trim(),
        soDienThoai: trimmedPhone,
        email: email.trim() || null,
        matKhau: password
      });
      navigate('/');
    } catch (err) {
      setError(errMsg(err));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignup = () => {
    if (window.google?.accounts?.id) {
      window.google.accounts.id.prompt();
    } else {
      setError('Tính năng đăng ký Google đang được kết nối với tài khoản salon.');
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
          <h1 className="auth-brand-title">Ghế cắt đã sẵn sàng đón bạn.</h1>
          <p className="auth-brand-desc">
            Tạo tài khoản để chọn người thợ ưng ý, giữ trước khung giờ phù hợp và quản lý trọn vẹn mọi lịch hẹn của bạn ở một nơi.
          </p>
        </div>

        <div className="auth-brand-footer">
          © 2026 GENT CUT. Tiệm cắt tóc nam chuẩn phong cách.
        </div>
      </aside>

      {/* ================= CỘT PHẢI (FORM TẠO TÀI KHOẢN) ================= */}
      <main className="auth-form-side">
        <div className="auth-form-container">
          <h2 className="auth-form-title">Tạo tài khoản</h2>
          <p className="auth-form-subtitle">Điền thông tin của bạn để bắt đầu đặt lịch.</p>

          {error && (
            <div className="auth-error-box" role="alert">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            {/* Hàng 1: Họ và tên + Số điện thoại (2 cột ngang) */}
            <div className="auth-fields-row">
              <div className="auth-field">
                <label className="auth-label" htmlFor="reg-name">
                  Họ và tên
                </label>
                <div className="auth-input-wrapper">
                  <input
                    id="reg-name"
                    className="auth-input"
                    type="text"
                    placeholder="Nguyễn Hoài Nam"
                    value={hoTen}
                    onChange={(e) => setHoTen(e.target.value)}
                    required
                    autoFocus
                    autoComplete="name"
                  />
                </div>
              </div>

              <div className="auth-field">
                <label className="auth-label" htmlFor="reg-phone">
                  Số điện thoại
                </label>
                <div className="auth-input-wrapper">
                  <input
                    id="reg-phone"
                    className="auth-input"
                    type="tel"
                    placeholder="0900 000 000"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                    autoComplete="tel"
                  />
                </div>
              </div>
            </div>

            <div className="auth-field">
              <label className="auth-label" htmlFor="reg-email">
                Địa chỉ Email <span style={{ textTransform: 'none', fontWeight: 'normal', color: '#a8a29e' }}>(không bắt buộc)</span>
              </label>
              <div className="auth-input-wrapper">
                <input
                  id="reg-email"
                  className="auth-input"
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                />
              </div>
            </div>

            <div className="auth-field">
              <label className="auth-label" htmlFor="reg-password">
                Mật khẩu
              </label>
              <div className="auth-input-wrapper">
                <input
                  id="reg-password"
                  className="auth-input"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Tối thiểu 6 ký tự"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="new-password"
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
              {loading ? 'Đang tạo tài khoản...' : 'TẠO TÀI KHOẢN'}
            </button>
          </form>

          <div className="auth-divider">
            <span>HOẶC</span>
          </div>

          <button
            type="button"
            className="auth-google-btn"
            onClick={handleGoogleSignup}
          >
            <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
              <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.616z" />
              <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" />
              <path fill="#FBBC05" d="M3.964 10.707c-.18-.54-.282-1.117-.282-1.707s.102-1.167.282-1.707V4.961H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.039l3.007-2.332z" />
              <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.961L3.964 7.293C4.672 5.166 6.656 3.58 9 3.58z" />
            </svg>
            <span>Đăng ký bằng Google</span>
          </button>

          <div className="auth-switch-text">
            <span>Đã có tài khoản?</span>
            <Link to="/login" className="auth-switch-link">
              Đăng nhập
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
