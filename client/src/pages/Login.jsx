import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { errMsg } from '../api/client';
import { homeFor } from '../utils/roles';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [account, setAccount] = useState('');
  const [password, setPassword] = useState('');
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

  return (
    <div className="card mx-auto max-w-md overflow-hidden">
      <div className="bg-espresso px-8 py-5 text-center">
        <h1 className="text-2xl text-cream">Đăng nhập</h1>
        <p className="font-script text-xl text-copper">chào mừng quay lại</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 p-8">
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
    </div>
  );
}