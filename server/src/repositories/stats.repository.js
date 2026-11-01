const { sql, getPool } = require('../config/db');

// Truyền ngày dạng chuỗi 'YYYY-MM-DD' rồi CONVERT trong SQL để tránh lệch múi giờ
async function overview(from, to) {
  const pool = await getPool();
  const r = await pool.request()
    .input('from', sql.VarChar(10), from)
    .input('to', sql.VarChar(10), to)
    .query(`
      DECLARE @f DATE = CONVERT(date, @from, 23), @t DATE = CONVERT(date, @to, 23);

      -- 0: số lịch hẹn theo trạng thái
      SELECT l.TrangThaiLH AS TrangThai, COUNT(*) AS SoLuong
      FROM LICHHEN l
      WHERE l.NgayHen BETWEEN @f AND @t
      GROUP BY l.TrangThaiLH;

      -- 1: tổng hóa đơn / tiền / giảm giá
      SELECT COUNT(h.MaHD) AS TongHoaDon,
             ISNULL(SUM(h.ThanhTien), 0) AS TongTien,
             ISNULL(SUM(h.GiamGia), 0)  AS TongGiamGia
      FROM HOADON h JOIN LICHHEN l ON l.MaLH = h.MaLH
      WHERE h.TrangThaiTT = 'DaThanhToan' AND l.NgayHen BETWEEN @f AND @t;

      -- 2: top 5 dịch vụ (lịch đã hoàn thành)
      SELECT TOP 5 d.MaDV, d.TenDV, COUNT(*) AS SoLan, SUM(c.DonGiaApDung) AS DoanhThu
      FROM CHITIET_LICHHEN c
      JOIN LICHHEN l ON l.MaLH = c.MaLH
      JOIN DICHVU d  ON d.MaDV = c.MaDV
      WHERE l.TrangThaiLH = 'HoanThanh' AND l.NgayHen BETWEEN @f AND @t
      GROUP BY d.MaDV, d.TenDV
      ORDER BY SoLan DESC, DoanhThu DESC;

      -- 3: doanh thu theo ngày
      SELECT CONVERT(varchar(10), l.NgayHen, 23) AS Ngay,
             COUNT(h.MaHD) AS SoHoaDon, SUM(h.ThanhTien) AS DoanhThu
      FROM HOADON h JOIN LICHHEN l ON l.MaLH = h.MaLH
      WHERE h.TrangThaiTT = 'DaThanhToan' AND l.NgayHen BETWEEN @f AND @t
      GROUP BY l.NgayHen
      ORDER BY l.NgayHen;

      -- 4: doanh thu theo thợ
      SELECT t.MaTho, n.HoTen,
             COUNT(h.MaHD) AS SoHoaDon, ISNULL(SUM(h.ThanhTien), 0) AS DoanhThu
      FROM THOCATTOC t
      JOIN NGUOIDUNG n ON n.MaND = t.MaND
      LEFT JOIN LICHHEN l ON l.MaTho = t.MaTho AND l.NgayHen BETWEEN @f AND @t
      LEFT JOIN HOADON h  ON h.MaLH = l.MaLH AND h.TrangThaiTT = 'DaThanhToan'
      GROUP BY t.MaTho, n.HoTen
      ORDER BY DoanhThu DESC, t.MaTho;
    `);

  const [trangThai, tong, topDichVu, theoNgay, theoTho] = r.recordsets;
  return { trangThai, tong: tong[0], topDichVu, theoNgay, theoTho };
}

module.exports = { overview };