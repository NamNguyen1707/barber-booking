import axios from 'axios';
import { TOKEN_KEY, USER_KEY, ensureSession } from './session';

export { TOKEN_KEY, USER_KEY };

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
});

// Tự gắn token vào mọi request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Khi gặp lỗi 401: xóa token, đăng nhập ngầm lại và thử lại request ban đầu đúng 1 lần
api.interceptors.response.use(
  (res) => res,
  async (err) => {
    const originalConfig = err.config;
    const isLogin = originalConfig?.url?.includes('/auth/login');

    if (err.response?.status === 401 && !isLogin && originalConfig && !originalConfig._retry) {
      originalConfig._retry = true;
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
      try {
        const newToken = await ensureSession();
        if (newToken) {
          originalConfig.headers.Authorization = `Bearer ${newToken}`;
          return api(originalConfig);
        }
      } catch (loginErr) {
        return Promise.reject(loginErr);
      }
    }

    return Promise.reject(err);
  }
);

// Lấy thông báo lỗi từ server để hiển thị
export const errMsg = (e) => e.response?.data?.message || 'Không kết nối được máy chủ';

export default api;
