const { sql, getPool } = require('../config/db');

const unwrap = (err) =>
  [err, ...(err.precedingErrors || [])].find((e) => e.number >= 50000) || err;

// Thông tin lịch hẹn + các dịch vụ + mã hóa đơn nếu đã có
async function getBookingForInvoice(maLH) {
  const pool = await getPool();
  const h = await pool.request()
    .input('id', sql.Int, maLH)
    .query(`
      SELECT l.MaLH, l.TrangThaiLH,
             CONVERT(varchar(10), l.NgayHen, 23)    AS NgayHen,
             CONVERT(varchar(5),  l.GioBatDau, 108) AS GioBatDau,
             ndk.HoTen AS KhachHang, ndk.SoDienThoai AS SDTKhach,
             k.HangThanhVien, k.DiemTichLuy,
             ndt.HoTen AS ThoCatToc,
             hd.MaHD
      FROM LICHHEN l
      JOIN KHACHHANG k   ON k.MaKH  = l.MaKH
      JOIN NGUOIDUNG ndk ON ndk.MaND = k.MaND
      JOIN THOCATTOC t   ON t.MaTho = l.MaTho
      JOIN NGUOIDUNG ndt ON ndt.MaND = t.MaND
      LEFT JOIN HOADON hd ON hd.MaLH = l.MaLH
      WHERE l.MaLH = @id`);
  if (!h.recordset[0]) return null;

  const lines = await pool.request()
    .input('id', sql.Int, maLH)
    .query(`
      SELECT d.MaDV, d.TenDV, c.DonGiaApDung, c.ThoiLuongPhut
      FROM CHITIET_LICHHEN c JOIN DICHVU d ON d.MaDV = c.MaDV
      WHERE c.MaLH = @id ORDER BY c.MaCTLH`);
  return { ...h.recordset[0], ChiTiet: lines.recordset };
}

// sp_LapHoaDon tự tính giảm giá; trigger tự cộng điểm và nâng hạng
async function createInvoice({ maLH, cashierId, method }) {
  const pool = await getPool();
  try {
    await pool.request()
      .input('maLH', sql.Int, maLH)
      .input('nv', sql.Int, cashierId)
      .input('pt', sql.VarChar(30), method)
      .query('EXEC sp_LapHoaDon @MaLH = @maLH, @NVThuNgan = @nv, @PhuongThuc = @pt');
  } catch (err) {
    throw unwrap(err);
  }
}

const INVOICE_SELECT = `
  SELECT h.MaHD, h.MaLH,
         CONVERT(varchar(19), h.NgayThanhToan, 120) AS NgayThanhToan,
         h.TongTienDV, h.GiamGia, h.ThanhTien, h.PhuongThucTT, h.TrangThaiTT,
         ndc.HoTen AS ThuNgan,
         ndk.HoTen AS KhachHang, ndk.SoDienThoai AS SDTKhach,
         k.HangThanhVien, k.DiemTichLuy,
         ndt.HoTen AS ThoCatToc
  FROM HOADON h
  JOIN LICHHEN l     ON l.MaLH = h.MaLH
  JOIN KHACHHANG k   ON k.MaKH = l.MaKH
  JOIN NGUOIDUNG ndk ON ndk.MaND = k.MaND
  JOIN THOCATTOC t   ON t.MaTho = l.MaTho
  JOIN NGUOIDUNG ndt ON ndt.MaND = t.MaND
  JOIN NGUOIDUNG ndc ON ndc.MaND = h.NVThuNgan`;

async function getInvoiceByBooking(maLH) {
  const pool = await getPool();
  const h = await pool.request()
    .input('id', sql.Int, maLH)
    .query(`${INVOICE_SELECT} WHERE h.MaLH = @id`);
  if (!h.recordset[0]) return null;

  const lines = await pool.request()
    .input('id', sql.Int, maLH)
    .query(`
      SELECT d.TenDV, c.DonGiaApDung, c.ThoiLuongPhut
      FROM CHITIET_LICHHEN c JOIN DICHVU d ON d.MaDV = c.MaDV
      WHERE c.MaLH = @id ORDER BY c.MaCTLH`);
  return { ...h.recordset[0], ChiTiet: lines.recordset };
}

async function listInvoices(date) {
  const pool = await getPool();
  const r = await pool.request()
    .input('date', sql.VarChar(10), date || null)
    .query(`${INVOICE_SELECT}
            WHERE (@date IS NULL OR CAST(h.NgayThanhToan AS DATE) = CAST(@date AS DATE))
            ORDER BY h.NgayThanhToan DESC`);
  return r.recordset;
}

module.exports = { getBookingForInvoice, createInvoice, getInvoiceByBooking, listInvoices };