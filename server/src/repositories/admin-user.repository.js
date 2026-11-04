const { query, withTransaction } = require('../config/db');

const COLUMNS = `
  n.MaND, n.HoTen, n.SoDienThoai, n.Email, n.VaiTro, n.TrangThai, n.NgayTao,
  k.MaKH, k.HangThanhVien, k.DiemTichLuy, t.MaTho`;
const FROM = `
  FROM NGUOIDUNG n
  LEFT JOIN KHACHHANG k ON k.MaND = n.MaND
  LEFT JOIN THOCATTOC t ON t.MaND = n.MaND`;

// Tìm theo tên / SĐT / email, lọc theo vai trò và trạng thái, có phân trang
async function list({ q, role, status, limit, offset }) {
  const where = [];
  const params = [];
  if (q) {
    where.push('(n.HoTen LIKE ? OR n.SoDienThoai LIKE ? OR n.Email LIKE ?)');
    const like = `%${q.replace(/[\\%_]/g, (c) => '\\' + c)}%`;
    params.push(like, like, like);
  }
  if (role) { where.push('n.VaiTro = ?'); params.push(role); }
  if (status !== null && status !== undefined) { where.push('n.TrangThai = ?'); params.push(status); }
  const w = where.length ? `WHERE ${where.join(' AND ')}` : '';

  const [{ total }] = await query(`SELECT COUNT(*) AS total FROM NGUOIDUNG n ${w}`, params);
  const items = await query(
    `SELECT ${COLUMNS} ${FROM} ${w} ORDER BY n.MaND DESC LIMIT ? OFFSET ?`,
    [...params, limit, offset]
  );
  return { total, items };
}

async function getById(id) {
  const rows = await query(`SELECT ${COLUMNS} ${FROM} WHERE n.MaND = ?`, [id]);
  return rows[0] || null;
}

async function setStatus(id, trangThai) {
  await query('UPDATE NGUOIDUNG SET TrangThai = ? WHERE MaND = ?', [trangThai, id]);
}

async function countBookingsOfCustomer(maKH) {
  const [r] = await query('SELECT COUNT(*) AS n FROM LICHHEN WHERE MaKH = ?', [maKH]);
  return r.n;
}

// Đổi vai trò trong một giao dịch.
// - Khách -> nhân viên: xóa hồ sơ khách (chỉ khi chưa có lịch hẹn nào).
// - Nhân viên -> khách: sau khi đổi vai trò mới tạo hồ sơ khách (trigger kiểm tra vai trò).
async function changeRole(user, newRole) {
  return withTransaction(async (conn) => {
    if (user.MaKH && newRole !== 'KHACHHANG') {
      await conn.query('DELETE FROM KHACHHANG WHERE MaKH = ?', [user.MaKH]);
    }
    await conn.query('UPDATE NGUOIDUNG SET VaiTro = ? WHERE MaND = ?', [newRole, user.MaND]);
    if (!user.MaKH && newRole === 'KHACHHANG') {
      await conn.query('INSERT INTO KHACHHANG (MaND) VALUES (?)', [user.MaND]);
    }
  });
}

module.exports = { list, getById, setStatus, countBookingsOfCustomer, changeRole };
