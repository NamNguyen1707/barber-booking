const { getPool } = require('../config/db');

// Truyền ngày dạng chuỗi 'YYYY-MM-DD'
async function overview(from, to) {
  const pool = await getPool();
  const [
    [trangThai],
    [tong],
    [topDichVu],
    [theoNgay],
    [theoTho]
  ] = await Promise.all([
    // 0: số lịch hẹn theo trạng thái
    pool.query(`
      SELECT l.TrangThaiLH AS TrangThai, COUNT(*) AS SoLuong
      FROM LICHHEN l
      WHERE l.NgayHen BETWEEN ? AND ?
      GROUP BY l.TrangThaiLH
    `, [from, to]),

    // 1: tổng hóa đơn / tiền / giảm giá
    pool.query(`
      SELECT COUNT(h.MaHD) AS TongHoaDon,
             IFNULL(SUM(h.ThanhTien), 0) AS TongTien,
             IFNULL(SUM(h.GiamGia), 0)  AS TongGiamGia
      FROM HOADON h JOIN LICHHEN l ON l.MaLH = h.MaLH
      WHERE h.TrangThaiTT = 'DaThanhToan' AND l.NgayHen BETWEEN ? AND ?
    `, [from, to]),

    // 2: top 5 dịch vụ (lịch đã hoàn thành)
    pool.query(`
      SELECT d.MaDV, d.TenDV, COUNT(*) AS SoLan, SUM(c.DonGiaApDung) AS DoanhThu
      FROM CHITIET_LICHHEN c
      JOIN LICHHEN l ON l.MaLH = c.MaLH
      JOIN DICHVU d  ON d.MaDV = c.MaDV
      WHERE l.TrangThaiLH = 'HoanThanh' AND l.NgayHen BETWEEN ? AND ?
      GROUP BY d.MaDV, d.TenDV
      ORDER BY SoLan DESC, DoanhThu DESC
      LIMIT 5
    `, [from, to]),

    // 3: doanh thu theo ngày
    pool.query(`
      SELECT DATE_FORMAT(l.NgayHen, '%Y-%m-%d') AS Ngay,
             COUNT(h.MaHD) AS SoHoaDon, SUM(h.ThanhTien) AS DoanhThu
      FROM HOADON h JOIN LICHHEN l ON l.MaLH = h.MaLH
      WHERE h.TrangThaiTT = 'DaThanhToan' AND l.NgayHen BETWEEN ? AND ?
      GROUP BY l.NgayHen
      ORDER BY l.NgayHen
    `, [from, to]),

    // 4: doanh thu theo thợ
    pool.query(`
      SELECT t.MaTho, n.HoTen,
             COUNT(h.MaHD) AS SoHoaDon, IFNULL(SUM(h.ThanhTien), 0) AS DoanhThu
      FROM THOCATTOC t
      JOIN NGUOIDUNG n ON n.MaND = t.MaND
      LEFT JOIN LICHHEN l ON l.MaTho = t.MaTho AND l.NgayHen BETWEEN ? AND ?
      LEFT JOIN HOADON h  ON h.MaLH = l.MaLH AND h.TrangThaiTT = 'DaThanhToan'
      GROUP BY t.MaTho, n.HoTen
      ORDER BY DoanhThu DESC, t.MaTho
    `, [from, to])
  ]);

  return { trangThai, tong: tong[0], topDichVu, theoNgay, theoTho };
}

module.exports = { overview };
