const { query } = require('../config/db');

const INVOICE_SELECT = `
  SELECT h.MaHD, h.MaLH, h.NgayThanhToan, h.TongTienDV, h.GiamGia, h.ThanhTien,
         h.PhuongThucTT, h.TrangThaiTT,
         ntn.HoTen AS ThuNgan, ndk.HoTen AS KhachHang, ndk.SoDienThoai AS SDTKhach,
         k.HangThanhVien, k.DiemTichLuy, ndt.HoTen AS ThoCatToc
    FROM HOADON h
    JOIN LICHHEN l ON l.MaLH = h.MaLH
    JOIN KHACHHANG k ON k.MaKH = l.MaKH JOIN NGUOIDUNG ndk ON ndk.MaND = k.MaND
    JOIN THOCATTOC t ON t.MaTho = l.MaTho JOIN NGUOIDUNG ndt ON ndt.MaND = t.MaND
    JOIN NGUOIDUNG ntn ON ntn.MaND = h.NVThuNgan`;

// Thông tin lịch hẹn + tổng tiền dịch vụ để xem trước hóa đơn
async function getBookingForInvoice(maLH) {
  const rows = await query(
    `SELECT l.MaLH, l.TrangThaiLH, l.NgayHen, ndk.HoTen AS KhachHang, ndk.SoDienThoai AS SDTKhach,
            k.HangThanhVien, k.DiemTichLuy,
            (SELECT IFNULL(SUM(c.DonGiaApDung), 0) FROM CHITIET_LICHHEN c WHERE c.MaLH = l.MaLH) AS TongTienDV,
            (SELECT GROUP_CONCAT(d.TenDV ORDER BY d.MaDV SEPARATOR ', ')
               FROM CHITIET_LICHHEN c JOIN DICHVU d ON d.MaDV = c.MaDV WHERE c.MaLH = l.MaLH) AS DichVu,
            EXISTS (SELECT 1 FROM HOADON h WHERE h.MaLH = l.MaLH) AS DaCoHoaDon
       FROM LICHHEN l
       JOIN KHACHHANG k ON k.MaKH = l.MaKH JOIN NGUOIDUNG ndk ON ndk.MaND = k.MaND
      WHERE l.MaLH = ?`,
    [maLH]
  );
  return rows[0] || null;
}

async function createInvoice(maLH, maNV, phuongThuc) {
  await query('CALL sp_LapHoaDon(?, ?, ?)', [maLH, maNV, phuongThuc]);
}

async function getInvoiceByBooking(maLH) {
  const rows = await query(`${INVOICE_SELECT} WHERE h.MaLH = ?`, [maLH]);
  return rows[0] || null;
}

async function listInvoices({ from, to }) {
  const where = [];
  const params = [];
  if (from) { where.push('DATE(h.NgayThanhToan) >= ?'); params.push(from); }
  if (to) { where.push('DATE(h.NgayThanhToan) <= ?'); params.push(to); }
  return query(
    `${INVOICE_SELECT} ${where.length ? 'WHERE ' + where.join(' AND ') : ''}
      ORDER BY h.NgayThanhToan DESC, h.MaHD DESC LIMIT 200`,
    params
  );
}

module.exports = { getBookingForInvoice, createInvoice, getInvoiceByBooking, listInvoices };
