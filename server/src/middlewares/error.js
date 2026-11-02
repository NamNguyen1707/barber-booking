// Xử lý lỗi chung cho toàn bộ API
module.exports = (err, req, res, next) => { // eslint-disable-line no-unused-vars
  // Lỗi do mình chủ động ném (AppError) hoặc lỗi của express (JSON sai...)
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ message: 'Dữ liệu gửi lên không phải JSON hợp lệ' });
  }
  if (err.status) return res.status(err.status).json({ message: err.message });

  // Lỗi nghiệp vụ từ trigger / stored procedure (SIGNAL SQLSTATE '45000', mã >= 50000)
  if (err.sqlState === '45000' || err.errno >= 50000) {
    return res.status(400).json({ message: err.sqlMessage || err.message });
  }
  // Trùng khóa UNIQUE
  if (err.errno === 1062) return res.status(409).json({ message: 'Dữ liệu đã tồn tại' });
  // Vi phạm CHECK (MySQL 3819, MariaDB 4025) hoặc khóa ngoại (1451, 1452)
  if (err.errno === 3819 || err.errno === 4025 || err.errno === 1451 || err.errno === 1452) {
    return res.status(400).json({ message: 'Dữ liệu không hợp lệ (vi phạm ràng buộc)' });
  }

  console.error(err);
  res.status(500).json({ message: 'Lỗi hệ thống' });
};
