import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { errMsg } from '../api/client';
import { homeFor } from '../utils/roles';
import GoogleButton from '../components/GoogleButton';

export default function Login() {
  const { login, loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [account, setAccount] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Google: tài khoản mới cần bổ sung số điện thoại
  const [gCred, setGCred] = useState(null);
  const [gInfo, setGInfo] = useState(null);
  const [phone, setPhone] = useState('');

  const goHome = (user) => navigate(location.state?.from?.pathname || homeFor(user.role), { replace: true });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      goHome(await login(account.trim(), password));
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
      if (res.user) return goHome(res.user);
      setGCred(credential);
      setGInfo(res);
    } catch (err) {
      setError(errMsg(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card w-full max-w-md overflow-hidden !bg-cream shadow-xl">
      <div className="bg-espresso px-8 py-5 text-center">
        <h1 className="text-2xl text-cream">Đăng nhập</h1>
      </div>

      <div className="p-8">
        {gInfo ? (
          <form
            onSubmit={(e) => { e.preventDefault(); handleGoogle(gCred, phone.trim()); }}
            className="space-y-4"
          >
            <p className="text-sm text-ink/70">
              Xin chào <b>{gInfo.name}</b> ({gInfo.email}). Nhập số điện thoại để hoàn tất tạo tài khoản.
            </p>
            <input
              className="field"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Số điện thoại (10 số)"
              required
              autoFocus
            />
            {error && <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>}
            <button type="submit" disabled={loading} className="btn w-full">
              {loading ? 'Đang xử lý...' : 'Hoàn tất'}
            </button>
          </form>
        ) : (
          <>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium">Tài khoản</label>
                <input
                  className="field"
                  value={account}
                  onChange={(e) => setAccount(e.target.value)}
                  required
                  autoFocus
                  placeholder="Số điện thoại hoặc email"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Mật khẩu</label>
                <input
                  className="field"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              {error && (
                <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>
              )}

              <button type="submit" disabled={loading} className="btn w-full">
                {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
              </button>
            </form>

            <GoogleButton onCredential={(c) => handleGoogle(c)} />

            <p className="mt-6 text-center text-sm text-ink/70">
              Chưa có tài khoản?{' '}
              <Link to="/register" className="font-medium text-copper-dark hover:underline">Đăng ký</Link>
            </p>
          </>
        )}
      </div>
    </div>
  );
}
