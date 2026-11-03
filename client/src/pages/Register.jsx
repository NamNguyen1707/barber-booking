import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { errMsg } from '../api/client';
import { homeFor } from '../utils/roles';
import GoogleButton from '../components/GoogleButton';

export default function Register() {
  const { register, loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ hoTen: '', soDienThoai: '', email: '', matKhau: '', nhapLai: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const [gCred, setGCred] = useState(null);
  const [gInfo, setGInfo] = useState(null);
  const [phone, setPhone] = useState('');

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.matKhau !== form.nhapLai) return setError('Mật khẩu nhập lại không khớp');
    setLoading(true);
    try {
      const { hoTen, soDienThoai, email, matKhau } = form;
      const user = await register({
        hoTen: hoTen.trim(),
        soDienThoai: soDienThoai.trim(),
        email: email.trim() || undefined,
        matKhau,
      });
      navigate(homeFor(user.role), { replace: true });
    } catch (err) {
      setError(errMsg(err));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async (credential, soDienThoai) => {
    setError('');
    setLoading(true);
    try {
      const res = await loginWithGoogle(credential, soDienThoai);
      if (res.user) return navigate(homeFor(res.user.role), { replace: true });
      setGCred(credential);
      setGInfo(res);
    } catch (err) {
      setError(errMsg(err));
    } finally {
      setLoading(false);
    }
  };

  const errBox = error && (
    <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>
  );

  return (
    <div className="card w-full max-w-md overflow-hidden !bg-cream shadow-xl">
      <div className="bg-espresso px-8 py-5 text-center">
        <h1 className="text-2xl text-cream">Đăng ký</h1>
      </div>

      <div className="p-8">
        {gInfo ? (
          <form
            onSubmit={(e) => { e.preventDefault(); handleGoogle(gCred, phone.trim()); }}
            className="space-y-4"
          >
            <p className="text-sm text-ink/70">
              Xin chào <b>{gInfo.name}</b> ({gInfo.email}). Nhập số điện thoại để hoàn tất đăng ký.
            </p>
            <input
              className="field"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Số điện thoại (10 số)"
              required
              autoFocus
            />
            {errBox}
            <button type="submit" disabled={loading} className="btn w-full">
              {loading ? 'Đang xử lý...' : 'Hoàn tất'}
            </button>
          </form>
        ) : (
          <>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium">Họ tên</label>
                <input className="field" value={form.hoTen} onChange={set('hoTen')} required autoFocus />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Số điện thoại</label>
                <input
                  className="field"
                  value={form.soDienThoai}
                  onChange={set('soDienThoai')}
                  required
                  inputMode="numeric"
                  placeholder="10 số, bắt đầu bằng 0"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Email <span className="text-ink/40">(không bắt buộc)</span></label>
                <input className="field" type="email" value={form.email} onChange={set('email')} />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Mật khẩu</label>
                <input
                  className="field"
                  type="password"
                  value={form.matKhau}
                  onChange={set('matKhau')}
                  required
                  minLength={6}
                  placeholder="Tối thiểu 6 ký tự"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Nhập lại mật khẩu</label>
                <input className="field" type="password" value={form.nhapLai} onChange={set('nhapLai')} required />
              </div>

              {errBox}

              <button type="submit" disabled={loading} className="btn w-full">
                {loading ? 'Đang đăng ký...' : 'Đăng ký'}
              </button>
            </form>

            <GoogleButton text="signup_with" onCredential={(c) => handleGoogle(c)} />

            <p className="mt-6 text-center text-sm text-ink/70">
              Đã có tài khoản?{' '}
              <Link to="/login" className="font-medium text-copper-dark hover:underline">Đăng nhập</Link>
            </p>
          </>
        )}
      </div>
    </div>
  );
}
