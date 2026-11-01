export const STAFF_ROLES = ['LETAN', 'THOCAT', 'QUANLY', 'ADMIN'];
export const ADMIN_ROLES = ['QUANLY', 'ADMIN'];

export const ROLE_LABEL = {
  KHACHHANG: 'Khách hàng',
  LETAN: 'Lễ tân',
  THOCAT: 'Thợ cắt tóc',
  QUANLY: 'Quản lý',
  ADMIN: 'Quản trị',
};

// Trang chính của từng vai trò sau khi đăng nhập
export function homeFor(role) {
  if (role === 'QUANLY' || role === 'ADMIN') return '/admin';
  if (role === 'LETAN' || role === 'THOCAT') return '/staff';
  return '/';
}