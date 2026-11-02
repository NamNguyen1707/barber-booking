const { getPool } = require('../config/db');

const unwrap = (err) => {
  if (err.errno >= 50000) {
    err.message = err.sqlMessage || err.message;
  }
  return err;
};

// Thông tin lịch hẹn + các dịch vụ + mã hóa đơn nếu đã có
async function getBookingForInvoice(maLH) {
  const pool = await getPool();
  const [hRows] = await pool.query(`
    SELECT l.MaLH, l.TrangThaiLH,
           DATE_FORMAT(l.NgayHen, '%Y-%m-%d') AS NgayHen,
           TIME_FORMAT(l.GioBatDau, '%H:%i')  AS GioBatDau,
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
    WHERE l.MaLH = ?`,
    [maLH]
  );
  if (!hRows[0]) return null;

  const [lines] = await pool.query(`
    SELECT d.MaDV, d.TenDV, c.DonGiaApDung, c.ThoiLuongPhut
    FROM CHITIET_LICHHEN c JOIN DICHVU d ON d.MaDV = c.MaDV
    WHERE c.MaLH = ? ORDER BY c.MaCTLH`,
    [maLH]
  );
  return { ...hRows[0], ChiTiet: lines };
}

// sp_LapHoaDon tự tính giảm giá; trigger tự cộng điểm và nâng hạng
async function createInvoice({ maLH, cashierId, method }) {
  const pool = await getPool();
  try {
    await pool.query(
      'CALL sp_LapHoaDon(?, ?, ?)',
      [maLH, cashierId, method]
    );
  } catch (err) {
    throw unwrap(err);
  }
}

const INVOICE_SELECT = `
  SELECT h.MaHD, h.MaLH,
         DATE_FORMAT(h.NgayThanhToan, '%Y-%m-%d %H:%i:%s') AS NgayThanhToan,
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
  const [hRows] = await pool.query(`${INVOICE_SELECT} WHERE h.MaLH = ?`, [maLH]);
  if (!hRows[0]) return null;

  const [lines] = await pool.query(`
    SELECT d.TenDV, c.DonGiaApDung, c.ThoiLuongPhut
    FROM CHITIET_LICHHEN c JOIN DICHVU d ON d.MaDV = c.MaDV
    WHERE c.MaLH = ? ORDER BY c.MaCTLH`,
    [maLH]
  );
  return { ...hRows[0], ChiTiet: lines };
}

async function listInvoices(date) {
  const pool = await getPool();
  if (date) {
    const [rows] = await pool.query(
      `${INVOICE_SELECT}
       WHERE DATE(h.NgayThanhToan) = ?
       ORDER BY h.NgayThanhToan DESC`,
      [date]
    );
    return rows;
  } else {
    const [rows] = await pool.query(
      `${INVOICE_SELECT}
       ORDER BY h.NgayThanhToan DESC`
    );
    return rows;
  }
}

module.exports = { getBookingForInvoice, createInvoice, getInvoiceByBooking, listInvoices };
