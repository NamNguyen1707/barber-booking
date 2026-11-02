const { query } = require('../config/db');

// Mọi số liệu tính theo ngày hẹn (NgayHen) trong khoảng [from, to]
async function overview(from, to) {
  const [trangThai, tong, topDichVu, theoNgay, theoTho] = await Promise.all([
    query(
      `SELECT TrangThaiLH AS TrangThai, COUNT(*) AS SoLuong
         FROM LICHHEN WHERE NgayHen BETWEEN ? AND ? GROUP BY TrangThaiLH`,
      [from, to]
    ),
    query(
      `SELECT COUNT(h.MaHD) AS TongHoaDon, IFNULL(SUM(h.ThanhTien), 0) AS TongTien,
              IFNULL(SUM(h.GiamGia), 0) AS TongGiamGia
         FROM HOADON h JOIN LICHHEN l ON l.MaLH = h.MaLH
        WHERE h.TrangThaiTT = 'DaThanhToan' AND l.NgayHen BETWEEN ? AND ?`,
      [from, to]
    ),
    query(
      `SELECT d.MaDV, d.TenDV, COUNT(*) AS SoLan, SUM(c.DonGiaApDung) AS DoanhThu
         FROM CHITIET_LICHHEN c
         JOIN LICHHEN l ON l.MaLH = c.MaLH JOIN DICHVU d ON d.MaDV = c.MaDV
        WHERE l.TrangThaiLH = 'HoanThanh' AND l.NgayHen BETWEEN ? AND ?
        GROUP BY d.MaDV, d.TenDV ORDER BY SoLan DESC, DoanhThu DESC LIMIT 5`,
      [from, to]
    ),
    query(
      `SELECT l.NgayHen AS Ngay, COUNT(h.MaHD) AS SoHoaDon, SUM(h.ThanhTien) AS DoanhThu
         FROM HOADON h JOIN LICHHEN l ON l.MaLH = h.MaLH
        WHERE h.TrangThaiTT = 'DaThanhToan' AND l.NgayHen BETWEEN ? AND ?
        GROUP BY l.NgayHen ORDER BY l.NgayHen`,
      [from, to]
    ),
    query(
      `SELECT t.MaTho, n.HoTen, COUNT(h.MaHD) AS SoHoaDon, IFNULL(SUM(h.ThanhTien), 0) AS DoanhThu
         FROM THOCATTOC t
         JOIN NGUOIDUNG n ON n.MaND = t.MaND
         LEFT JOIN LICHHEN l ON l.MaTho = t.MaTho AND l.NgayHen BETWEEN ? AND ?
         LEFT JOIN HOADON h ON h.MaLH = l.MaLH AND h.TrangThaiTT = 'DaThanhToan'
        GROUP BY t.MaTho, n.HoTen ORDER BY DoanhThu DESC, t.MaTho`,
      [from, to]
    ),
  ]);
  return { trangThai, tong: tong[0], topDichVu, theoNgay, theoTho };
}

module.exports = { overview };
