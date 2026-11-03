import { createContext, useContext, useState } from 'react';
import api, { TOKEN_KEY, USER_KEY } from '../api/client';

const AuthContext = createContext(null);

function readUser() {
  try {
    return JSON.parse(localStorage.getItem(USER_KEY));
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(readUser);

  const login = async (account, password) => {
    const { data } = await api.post('/auth/login', { account, password });
    localStorage.setItem(TOKEN_KEY, data.token);
    localStorage.setItem(USER_KEY, JSON.stringify(data.user));
    setUser(data.user);
    return data.user;
  };

  const saveSession = (data) => {
    localStorage.setItem(TOKEN_KEY, data.token);
    localStorage.setItem(USER_KEY, JSON.stringify(data.user));
    setUser(data.user);
    return data.user;
  };

  // Trả về { user } nếu đăng nhập được, hoặc { needPhone, email, name } nếu cần thêm số điện thoại
  const loginWithGoogle = async (credential, soDienThoai) => {
    const { data } = await api.post('/auth/google', { credential, soDienThoai });
    if (data.needPhone) return data;
    return { user: saveSession(data) };
  };

  const register = async (form) => {
    await api.post('/auth/register', form);
    return login(form.soDienThoai, form.matKhau);
  };

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setUser(null);
  };

  return <AuthContext.Provider value={{ user, login, register, loginWithGoogle, logout }}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
