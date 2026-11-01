import axios from 'axios';

export const TOKEN_KEY = 'bb_token';
export const USER_KEY = 'bb_user';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
});

// Tự gắn token vào mọi request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Token hết hạn / sai -> xóa đăng nhập và về trang login
api.interceptors.response.use(
  (res) => res,
  (err) => {
    const isLogin = err.config?.url?.includes('/auth/login');
    if (err.response?.status === 401 && !isLogin) {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
      if (window.location.pathname !== '/login') window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

// Lấy thông báo lỗi từ server để hiển thị
export const errMsg = (e) => e.response?.data?.message || 'Không kết nối được máy chủ';

export default api;