import axios from 'axios';

// Tài khoản quản lý mẫu chỉ dùng cho bài tập CI/CD, không dùng cách này cho web thật
const DEMO_ACCOUNT = import.meta.env.VITE_DEMO_ACCOUNT || '0900000001';
const DEMO_PASSWORD = import.meta.env.VITE_DEMO_PASSWORD || 'password';

export const TOKEN_KEY = 'bb_token';
export const USER_KEY = 'bb_user';

const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

/**
 * Đảm bảo đã có token quản lý trong localStorage.
 * Nếu chưa có thì tự động gọi login ngầm.
 */
export async function ensureSession() {
  const existingToken = localStorage.getItem(TOKEN_KEY);
  if (existingToken) return existingToken;

  const res = await axios.post(`${baseURL}/auth/login`, {
    account: DEMO_ACCOUNT,
    password: DEMO_PASSWORD,
  });

  const { token, user } = res.data;
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
    if (user) localStorage.setItem(USER_KEY, JSON.stringify(user));
  }
  return token;
}
