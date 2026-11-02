/* =====================================================================
   36SHINE – CSDL ĐẶT LỊCH CẮT TÓC – bản MySQL 8 (tương thích MariaDB 10.5+)
   Chuyển từ bản SQL Server (T-SQL). Quy tắc nghiệp vụ giữ nguyên:
     - Quán mở 08:30 – 22:00, khách đặt online trước tối thiểu 3 giờ, tối đa 14 ngày
     - Trigger: BR07 (luồng trạng thái), RB03 (trùng giờ), RB04 (nằm trong ca),
                RB05 (tối đa 2 lịch chờ), BR08 (hóa đơn), tích điểm, nâng hạng
   Cách chạy: xem README_MYSQL.md (npm run db:init hoặc MySQL Workbench).
   LƯU Ý: chạy lại file này sẽ XÓA và tạo lại toàn bộ dữ liệu.
   Nếu chạy tay trong Workbench: tạo/ chọn sẵn database rồi mới chạy
        CREATE DATABASE IF NOT EXISTS datlich_cattoc CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
        USE datlich_cattoc;
   ===================================================================== */
SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

DROP VIEW IF EXISTS v_lichhen_chitiet;
DROP VIEW IF EXISTS v_doanhthu_ngay;
DROP VIEW IF EXISTS v_hieusuat_tho;
DROP VIEW IF EXISTS v_kiemtra_rb06;
DROP VIEW IF EXISTS v_ca_va_lich_bandat;
DROP PROCEDURE IF EXISTS sp_DatLich;
DROP PROCEDURE IF EXISTS sp_HuyLich;
DROP PROCEDURE IF EXISTS sp_LapHoaDon;
DROP PROCEDURE IF EXISTS sp_chk_lichhen;
DROP TABLE IF EXISTS DANHGIA;
DROP TABLE IF EXISTS HOADON;
DROP TABLE IF EXISTS CHITIET_LICHHEN;
DROP TABLE IF EXISTS LICHHEN;
DROP TABLE IF EXISTS CALAMVIEC;
DROP TABLE IF EXISTS DICHVU;
DROP TABLE IF EXISTS THOCATTOC;
DROP TABLE IF EXISTS KHACHHANG;
DROP TABLE IF EXISTS NGUOIDUNG;

SET FOREIGN_KEY_CHECKS = 1;

/* ---------------------------------------------------------------------
   BẢNG
   --------------------------------------------------------------------- */
CREATE TABLE NGUOIDUNG (
  MaND        INT AUTO_INCREMENT PRIMARY KEY,
  HoTen       VARCHAR(100) NOT NULL,
  SoDienThoai VARCHAR(15)  NOT NULL,
  Email       VARCHAR(100) NULL,
  MatKhauHash VARCHAR(255) NOT NULL,
  VaiTro      VARCHAR(20)  NOT NULL,
  TrangThai   TINYINT      NOT NULL DEFAULT 1,
  NgayTao     DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT uq_nd_sdt UNIQUE (SoDienThoai),
  CONSTRAINT uq_nd_email UNIQUE (Email),
  CONSTRAINT ck_nd_vaitro CHECK (VaiTro IN ('KHACHHANG','LETAN','THOCAT','QUANLY','ADMIN')),
  CONSTRAINT ck_nd_tt CHECK (TrangThai IN (0,1))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE KHACHHANG (
  MaKH          INT AUTO_INCREMENT PRIMARY KEY,
  MaND          INT NOT NULL,
  HangThanhVien VARCHAR(20) NOT NULL DEFAULT 'THUONG',
  DiemTichLuy   INT NOT NULL DEFAULT 0,
  GhiChuKieuToc VARCHAR(255) NULL,
  NgayDangKy    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT uq_kh_nd UNIQUE (MaND),
  CONSTRAINT fk_kh_nd FOREIGN KEY (MaND) REFERENCES NGUOIDUNG(MaND),
  CONSTRAINT ck_kh_hang CHECK (HangThanhVien IN ('THUONG','BAC','VANG','VIP')),
  CONSTRAINT ck_kh_diem CHECK (DiemTichLuy >= 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE THOCATTOC (
  MaTho            INT AUTO_INCREMENT PRIMARY KEY,
  MaND             INT NOT NULL,
  ChuyenMon        VARCHAR(150) NOT NULL,
  SoNamKN          INT NOT NULL DEFAULT 0,
  AnhDaiDien       VARCHAR(255) NULL,
  GioiThieuNgan    VARCHAR(500) NULL,
  DiemDanhGiaTB    DECIMAL(3,2) NOT NULL DEFAULT 5.00,
  TrangThaiLamViec VARCHAR(20) NOT NULL DEFAULT 'DANGLAMVIEC',
  CONSTRAINT uq_tho_nd UNIQUE (MaND),
  CONSTRAINT fk_tho_nd FOREIGN KEY (MaND) REFERENCES NGUOIDUNG(MaND),
  CONSTRAINT ck_tho_kn CHECK (SoNamKN >= 0),
  CONSTRAINT ck_tho_diem CHECK (DiemDanhGiaTB BETWEEN 0 AND 5),
  CONSTRAINT ck_tho_tt CHECK (TrangThaiLamViec IN ('DANGLAMVIEC','TAMNGHI','DANGHIVIEC'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE CALAMVIEC (
  MaCa         INT AUTO_INCREMENT PRIMARY KEY,
  MaTho        INT NOT NULL,
  NgayLamViec  DATE NOT NULL,
  GioBatDau    TIME NOT NULL,
  GioKetThuc   TIME NOT NULL,
  SoKhachToiDa INT NOT NULL DEFAULT 10,
  TrangThaiCa  VARCHAR(20) NOT NULL DEFAULT 'DANGMO',
  CONSTRAINT fk_ca_tho FOREIGN KEY (MaTho) REFERENCES THOCATTOC(MaTho),
  CONSTRAINT ck_ca_gio CHECK (GioBatDau < GioKetThuc),
  CONSTRAINT ck_ca_max CHECK (SoKhachToiDa > 0),
  CONSTRAINT ck_ca_tt  CHECK (TrangThaiCa IN ('DANGMO','NGHIPHEP','DAKHOA')),
  INDEX idx_ca_tho_ngay (MaTho, NgayLamViec)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE DICHVU (
  MaDV          INT AUTO_INCREMENT PRIMARY KEY,
  TenDV         VARCHAR(120) NOT NULL,
  LoaiDV        VARCHAR(50)  NOT NULL,
  DonGia        DECIMAL(12,0) NOT NULL,
  ThoiLuongPhut INT NOT NULL,
  MoTaDV        VARCHAR(500) NULL,
  HinhAnhDV     VARCHAR(255) NULL,
  TrangThaiDV   TINYINT NOT NULL DEFAULT 1,
  CONSTRAINT uq_dv_ten UNIQUE (TenDV),
  CONSTRAINT ck_dv_loai CHECK (LoaiDV IN ('CatGoi','UonToc','NhuomToc','Combo')),
  CONSTRAINT ck_dv_gia CHECK (DonGia > 0),
  CONSTRAINT ck_dv_tl CHECK (ThoiLuongPhut >= 15),
  CONSTRAINT ck_dv_tt CHECK (TrangThaiDV IN (0,1))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE LICHHEN (
  MaLH            INT AUTO_INCREMENT PRIMARY KEY,
  MaKH            INT NOT NULL,
  MaTho           INT NOT NULL,
  NgayHen         DATE NOT NULL,
  GioBatDau       TIME NOT NULL,
  GioKetThucDK    TIME NOT NULL,
  TongThoiLuong   INT NOT NULL,
  TongTienTamTinh DECIMAL(12,0) NOT NULL,
  KenhDatLich     VARCHAR(20) NOT NULL DEFAULT 'ONLINE',
  GhiChuKhach     VARCHAR(300) NULL,
  TrangThaiLH     VARCHAR(25) NOT NULL DEFAULT 'ChoXacNhan',
  NgayTaoLH       DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_lh_kh  FOREIGN KEY (MaKH)  REFERENCES KHACHHANG(MaKH),
  CONSTRAINT fk_lh_tho FOREIGN KEY (MaTho) REFERENCES THOCATTOC(MaTho),
  CONSTRAINT ck_lh_gio CHECK (GioBatDau >= '08:30:00' AND GioBatDau < GioKetThucDK
                              AND GioKetThucDK <= '22:00:00'),
  CONSTRAINT ck_lh_tt  CHECK (TrangThaiLH IN
        ('ChoXacNhan','DaXacNhan','DangPhucVu','HoanThanh','DaHuy','KhongDen')),
  CONSTRAINT ck_lh_kenh CHECK (KenhDatLich IN ('ONLINE','WALKIN')),
  CONSTRAINT ck_lh_tl CHECK (TongThoiLuong > 0),
  CONSTRAINT ck_lh_tien CHECK (TongTienTamTinh >= 0),
  INDEX idx_lh_tho_ngay (MaTho, NgayHen),
  INDEX idx_lh_kh (MaKH, TrangThaiLH, NgayHen)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE CHITIET_LICHHEN (
  MaCTLH        INT AUTO_INCREMENT PRIMARY KEY,
  MaLH          INT NOT NULL,
  MaDV          INT NOT NULL,
  DonGiaApDung  DECIMAL(12,0) NOT NULL,
  ThoiLuongPhut INT NOT NULL,
  GhiChuDV      VARCHAR(200) NULL,
  CONSTRAINT uq_ct_lh_dv UNIQUE (MaLH, MaDV),
  CONSTRAINT fk_ct_lh FOREIGN KEY (MaLH) REFERENCES LICHHEN(MaLH) ON DELETE CASCADE,
  CONSTRAINT fk_ct_dv FOREIGN KEY (MaDV) REFERENCES DICHVU(MaDV),
  CONSTRAINT ck_ct_gia CHECK (DonGiaApDung > 0),
  CONSTRAINT ck_ct_tl  CHECK (ThoiLuongPhut > 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE HOADON (
  MaHD          INT AUTO_INCREMENT PRIMARY KEY,
  MaLH          INT NOT NULL,
  NVThuNgan     INT NOT NULL,
  NgayThanhToan DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  TongTienDV    DECIMAL(12,0) NOT NULL,
  GiamGia       DECIMAL(12,0) NOT NULL DEFAULT 0,
  ThanhTien     DECIMAL(12,0) NOT NULL,
  PhuongThucTT  VARCHAR(30) NOT NULL,
  TrangThaiTT   VARCHAR(20) NOT NULL DEFAULT 'DaThanhToan',
  CONSTRAINT uq_hd_lh UNIQUE (MaLH),
  CONSTRAINT fk_hd_lh FOREIGN KEY (MaLH) REFERENCES LICHHEN(MaLH),
  CONSTRAINT fk_hd_nv FOREIGN KEY (NVThuNgan) REFERENCES NGUOIDUNG(MaND),
  CONSTRAINT ck_hd_tien CHECK (TongTienDV >= 0 AND GiamGia >= 0 AND GiamGia <= TongTienDV
                               AND ThanhTien = TongTienDV - GiamGia),
  CONSTRAINT ck_hd_pt CHECK (PhuongThucTT IN ('TIENMAT','CHUYENKHOAN_QR')),
  CONSTRAINT ck_hd_tt CHECK (TrangThaiTT IN ('DaThanhToan','DaHoanTien'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE DANHGIA (
  MaDG        INT AUTO_INCREMENT PRIMARY KEY,
  MaLH        INT NOT NULL,
  SoSao       TINYINT NOT NULL,
  NoiDungDG   VARCHAR(500) NULL,
  NgayDanhGia DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT uq_dg_lh UNIQUE (MaLH),
  CONSTRAINT fk_dg_lh FOREIGN KEY (MaLH) REFERENCES LICHHEN(MaLH),
  CONSTRAINT ck_dg_sao CHECK (SoSao BETWEEN 1 AND 5)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

/* ---------------------------------------------------------------------
   TRIGGER + STORED PROCEDURE  (dùng DELIMITER $$)
   Mã lỗi nghiệp vụ >= 50000 được đặt trong MYSQL_ERRNO, SQLSTATE = 45000
   --------------------------------------------------------------------- */
DELIMITER $$

CREATE TRIGGER trg_kh_check BEFORE INSERT ON KHACHHANG FOR EACH ROW
BEGIN
  IF (SELECT VaiTro FROM NGUOIDUNG WHERE MaND = NEW.MaND) <> 'KHACHHANG' THEN
    SIGNAL SQLSTATE '45000' SET MYSQL_ERRNO = 50001, MESSAGE_TEXT = 'Tài khoản không có vai trò KHACHHANG';
  END IF;
END$$

CREATE TRIGGER trg_tho_check BEFORE INSERT ON THOCATTOC FOR EACH ROW
BEGIN
  IF (SELECT VaiTro FROM NGUOIDUNG WHERE MaND = NEW.MaND) <> 'THOCAT' THEN
    SIGNAL SQLSTATE '45000' SET MYSQL_ERRNO = 50002, MESSAGE_TEXT = 'Tài khoản không có vai trò THOCAT';
  END IF;
END$$

-- Các kiểm tra chung của LICHHEN (BR06, thợ đang làm, RB04, RB03, RB05, số khách tối đa)
-- p_isnew = 1 khi INSERT, p_malh = 0 khi INSERT
CREATE PROCEDURE sp_chk_lichhen(
  IN p_malh INT, IN p_makh INT, IN p_matho INT, IN p_ngay DATE,
  IN p_gio TIME, IN p_giokt TIME, IN p_tl INT, IN p_tt VARCHAR(25), IN p_isnew TINYINT)
BEGIN
  DECLARE v_phu INT DEFAULT 0;
  DECLARE v_max INT DEFAULT 0;
  DECLARE v_dem INT DEFAULT 0;

  -- BR06: giờ kết thúc dự kiến = giờ bắt đầu + tổng thời lượng
  IF p_giokt <> ADDTIME(p_gio, SEC_TO_TIME(p_tl * 60)) THEN
    SIGNAL SQLSTATE '45000' SET MYSQL_ERRNO = 50012, MESSAGE_TEXT = 'BR06: GioKetThucDK phải = GioBatDau + TongThoiLuong';
  END IF;

  -- Thợ phải đang làm việc (chỉ khi tạo mới)
  IF p_isnew = 1 THEN
    IF (SELECT TrangThaiLamViec FROM THOCATTOC WHERE MaTho = p_matho) <> 'DANGLAMVIEC' THEN
      SIGNAL SQLSTATE '45000' SET MYSQL_ERRNO = 50013, MESSAGE_TEXT = 'Thợ cắt tóc hiện không nhận lịch';
    END IF;
  END IF;

  IF p_tt IN ('ChoXacNhan','DaXacNhan','DangPhucVu') THEN
    -- RB04 / BR03: lịch nằm trọn trong ca DANGMO của đúng thợ, đúng ngày
    SELECT COUNT(*), IFNULL(MAX(SoKhachToiDa), 0) INTO v_phu, v_max
      FROM CALAMVIEC
     WHERE MaTho = p_matho AND NgayLamViec = p_ngay AND TrangThaiCa = 'DANGMO'
       AND GioBatDau <= p_gio AND p_giokt <= GioKetThuc;
    IF v_phu = 0 THEN
      SIGNAL SQLSTATE '45000' SET MYSQL_ERRNO = 50014, MESSAGE_TEXT = 'RB04: Thợ không có ca làm việc (đang mở) bao phủ khung giờ này';
    END IF;

    -- RB03 / BR02: không giao nhau với lịch hiệu lực khác của cùng thợ
    IF EXISTS (SELECT 1 FROM LICHHEN l
                WHERE l.MaTho = p_matho AND l.NgayHen = p_ngay AND l.MaLH <> p_malh
                  AND l.TrangThaiLH IN ('ChoXacNhan','DaXacNhan','DangPhucVu')
                  AND l.GioBatDau < p_giokt AND p_gio < l.GioKetThucDK) THEN
      SIGNAL SQLSTATE '45000' SET MYSQL_ERRNO = 50015, MESSAGE_TEXT = 'RB03: Trùng lịch với một lịch hẹn khác của thợ';
    END IF;

    -- Số khách tối đa trong ngày/ca
    SELECT COUNT(*) INTO v_dem FROM LICHHEN l
     WHERE l.MaTho = p_matho AND l.NgayHen = p_ngay AND l.MaLH <> p_malh
       AND l.TrangThaiLH IN ('ChoXacNhan','DaXacNhan','DangPhucVu');
    IF v_dem + 1 > v_max THEN
      SIGNAL SQLSTATE '45000' SET MYSQL_ERRNO = 50017, MESSAGE_TEXT = 'Ca làm việc đã đủ số khách tối đa';
    END IF;
  END IF;

  -- RB05 / BR04: tối đa 02 lịch chờ/đã xác nhận chưa diễn ra của một khách
  IF p_tt IN ('ChoXacNhan','DaXacNhan') AND p_ngay >= CURDATE() THEN
    SELECT COUNT(*) INTO v_dem FROM LICHHEN l
     WHERE l.MaKH = p_makh AND l.MaLH <> p_malh
       AND l.TrangThaiLH IN ('ChoXacNhan','DaXacNhan') AND l.NgayHen >= CURDATE();
    IF v_dem + 1 > 2 THEN
      SIGNAL SQLSTATE '45000' SET MYSQL_ERRNO = 50016, MESSAGE_TEXT = 'RB05: Khách đã có 02 lịch hẹn đang chờ';
    END IF;
  END IF;
END$$

CREATE TRIGGER trg_lh_insert BEFORE INSERT ON LICHHEN FOR EACH ROW
BEGIN
  CALL sp_chk_lichhen(0, NEW.MaKH, NEW.MaTho, NEW.NgayHen, NEW.GioBatDau, NEW.GioKetThucDK,
                      NEW.TongThoiLuong, NEW.TrangThaiLH, 1);
END$$

CREATE TRIGGER trg_lh_update BEFORE UPDATE ON LICHHEN FOR EACH ROW
BEGIN
  -- BR07: luồng chuyển trạng thái
  IF NEW.TrangThaiLH <> OLD.TrangThaiLH AND NOT (
       (OLD.TrangThaiLH = 'ChoXacNhan' AND NEW.TrangThaiLH IN ('DaXacNhan','DaHuy','KhongDen'))
    OR (OLD.TrangThaiLH = 'DaXacNhan'  AND NEW.TrangThaiLH IN ('DangPhucVu','DaHuy','KhongDen'))
    OR (OLD.TrangThaiLH = 'DangPhucVu' AND NEW.TrangThaiLH = 'HoanThanh')) THEN
    SIGNAL SQLSTATE '45000' SET MYSQL_ERRNO = 50010, MESSAGE_TEXT = 'BR07: Chuyển trạng thái lịch hẹn không hợp lệ';
  END IF;

  -- BR07: lịch đã kết thúc không được đổi thợ/ngày/giờ
  IF OLD.TrangThaiLH IN ('HoanThanh','DaHuy','KhongDen')
     AND (NEW.MaTho <> OLD.MaTho OR NEW.NgayHen <> OLD.NgayHen OR NEW.GioBatDau <> OLD.GioBatDau) THEN
    SIGNAL SQLSTATE '45000' SET MYSQL_ERRNO = 50011, MESSAGE_TEXT = 'BR07: Không được sửa lịch hẹn đã kết thúc';
  END IF;

  CALL sp_chk_lichhen(OLD.MaLH, NEW.MaKH, NEW.MaTho, NEW.NgayHen, NEW.GioBatDau, NEW.GioKetThucDK,
                      NEW.TongThoiLuong, NEW.TrangThaiLH, 0);
END$$

CREATE TRIGGER trg_ct_check BEFORE INSERT ON CHITIET_LICHHEN FOR EACH ROW
BEGIN
  IF (SELECT TrangThaiDV FROM DICHVU WHERE MaDV = NEW.MaDV) <> 1 THEN
    SIGNAL SQLSTATE '45000' SET MYSQL_ERRNO = 50020, MESSAGE_TEXT = 'BR06: Dịch vụ đã ngừng phục vụ';
  END IF;
END$$

-- HOADON: kiểm tra BR08 trước khi ghi
CREATE TRIGGER trg_hd_check BEFORE INSERT ON HOADON FOR EACH ROW
BEGIN
  IF (SELECT TrangThaiLH FROM LICHHEN WHERE MaLH = NEW.MaLH) <> 'HoanThanh' THEN
    SIGNAL SQLSTATE '45000' SET MYSQL_ERRNO = 50030, MESSAGE_TEXT = 'BR08: Chỉ lập hóa đơn cho lịch hẹn đã Hoàn thành';
  END IF;
  IF (SELECT VaiTro FROM NGUOIDUNG WHERE MaND = NEW.NVThuNgan) NOT IN ('LETAN','QUANLY','ADMIN') THEN
    SIGNAL SQLSTATE '45000' SET MYSQL_ERRNO = 50031, MESSAGE_TEXT = 'Người thu ngân phải là Lễ tân/Quản lý/Admin';
  END IF;
  IF NEW.TongTienDV <> (SELECT IFNULL(SUM(DonGiaApDung), 0) FROM CHITIET_LICHHEN WHERE MaLH = NEW.MaLH) THEN
    SIGNAL SQLSTATE '45000' SET MYSQL_ERRNO = 50032, MESSAGE_TEXT = 'TongTienDV không khớp tổng chi tiết lịch hẹn';
  END IF;
END$$

-- HOADON: cộng điểm (10.000đ = 1 điểm) + nâng hạng (Bạc >= 50, Vàng >= 150)
CREATE TRIGGER trg_hd_after AFTER INSERT ON HOADON FOR EACH ROW
BEGIN
  DECLARE v_makh INT;
  SELECT MaKH INTO v_makh FROM LICHHEN WHERE MaLH = NEW.MaLH;
  IF NEW.TrangThaiTT = 'DaThanhToan' THEN
    UPDATE KHACHHANG SET DiemTichLuy = DiemTichLuy + FLOOR(NEW.ThanhTien / 10000) WHERE MaKH = v_makh;
  END IF;
  UPDATE KHACHHANG
     SET HangThanhVien = CASE WHEN HangThanhVien = 'VIP' THEN 'VIP'
                              WHEN DiemTichLuy >= 150 THEN 'VANG'
                              WHEN DiemTichLuy >= 50  THEN 'BAC'
                              ELSE 'THUONG' END
   WHERE MaKH = v_makh;
END$$

-- DANHGIA: BR10
CREATE TRIGGER trg_dg_check BEFORE INSERT ON DANHGIA FOR EACH ROW
BEGIN
  IF (SELECT TrangThaiLH FROM LICHHEN WHERE MaLH = NEW.MaLH) <> 'HoanThanh'
     OR NOT EXISTS (SELECT 1 FROM HOADON WHERE MaLH = NEW.MaLH AND TrangThaiTT = 'DaThanhToan') THEN
    SIGNAL SQLSTATE '45000' SET MYSQL_ERRNO = 50040, MESSAGE_TEXT = 'BR10: Chỉ đánh giá lịch hẹn đã hoàn thành và đã thanh toán';
  END IF;
END$$

CREATE TRIGGER trg_dg_after AFTER INSERT ON DANHGIA FOR EACH ROW
BEGIN
  DECLARE v_matho INT;
  SELECT MaTho INTO v_matho FROM LICHHEN WHERE MaLH = NEW.MaLH;
  UPDATE THOCATTOC
     SET DiemDanhGiaTB = (SELECT CAST(AVG(d.SoSao) AS DECIMAL(3,2))
                            FROM DANHGIA d JOIN LICHHEN l2 ON l2.MaLH = d.MaLH
                           WHERE l2.MaTho = v_matho)
   WHERE MaTho = v_matho;
END$$

-- Đặt lịch. p_dsdv: danh sách MaDV cách nhau dấu phẩy, ví dụ '1,3'
-- ONLINE: kiểm tra BR01 (đặt trước >= 3 giờ, tối đa 14 ngày). WALKIN: bỏ qua.
CREATE PROCEDURE sp_DatLich(
  IN p_makh INT, IN p_matho INT, IN p_ngay DATE, IN p_gio TIME,
  IN p_dsdv VARCHAR(200), IN p_kenh VARCHAR(20), IN p_ghichu VARCHAR(300),
  OUT p_malh INT)
BEGIN
  DECLARE v_sochon INT DEFAULT 0;
  DECLARE v_sohople INT DEFAULT 0;
  DECLARE v_tl INT DEFAULT 0;
  DECLARE v_tien DECIMAL(12,0) DEFAULT 0;
  DECLARE v_rest VARCHAR(300);
  DECLARE v_item VARCHAR(50);
  DECLARE EXIT HANDLER FOR SQLEXCEPTION
  BEGIN
    ROLLBACK;
    DROP TEMPORARY TABLE IF EXISTS tmp_ds;
    RESIGNAL;
  END;

  DROP TEMPORARY TABLE IF EXISTS tmp_ds;
  CREATE TEMPORARY TABLE tmp_ds (MaDV INT PRIMARY KEY);

  SET v_rest = CONCAT(REPLACE(IFNULL(p_dsdv, ''), ' ', ''), ',');
  WHILE LOCATE(',', v_rest) > 0 DO
    SET v_item = SUBSTRING_INDEX(v_rest, ',', 1);
    SET v_rest = SUBSTRING(v_rest, LOCATE(',', v_rest) + 1);
    IF v_item <> '' THEN
      IF v_item NOT REGEXP '^[0-9]+$' THEN
        SIGNAL SQLSTATE '45000' SET MYSQL_ERRNO = 50050, MESSAGE_TEXT = 'BR06: Phải chọn ít nhất 1 dịch vụ hợp lệ và đang phục vụ';
      END IF;
      INSERT IGNORE INTO tmp_ds (MaDV) VALUES (CAST(v_item AS UNSIGNED));
    END IF;
  END WHILE;

  SELECT COUNT(*) INTO v_sochon FROM tmp_ds;
  SELECT COUNT(*), IFNULL(SUM(d.ThoiLuongPhut), 0), IFNULL(SUM(d.DonGia), 0)
    INTO v_sohople, v_tl, v_tien
    FROM DICHVU d JOIN tmp_ds s ON s.MaDV = d.MaDV WHERE d.TrangThaiDV = 1;

  IF v_sochon = 0 OR v_sochon <> v_sohople THEN
    SIGNAL SQLSTATE '45000' SET MYSQL_ERRNO = 50050, MESSAGE_TEXT = 'BR06: Phải chọn ít nhất 1 dịch vụ hợp lệ và đang phục vụ';
  END IF;

  IF p_kenh = 'ONLINE' THEN
    IF TIMESTAMP(p_ngay, p_gio) < DATE_ADD(NOW(), INTERVAL 180 MINUTE) THEN
      SIGNAL SQLSTATE '45000' SET MYSQL_ERRNO = 50051, MESSAGE_TEXT = 'BR01: Phải đặt trước giờ hẹn tối thiểu 3 giờ';
    END IF;
    IF p_ngay > DATE_ADD(CURDATE(), INTERVAL 14 DAY) THEN
      SIGNAL SQLSTATE '45000' SET MYSQL_ERRNO = 50052, MESSAGE_TEXT = 'BR01: Chỉ được đặt trước tối đa 14 ngày';
    END IF;
  END IF;

  START TRANSACTION;
    INSERT INTO LICHHEN (MaKH, MaTho, NgayHen, GioBatDau, GioKetThucDK, TongThoiLuong,
                         TongTienTamTinh, KenhDatLich, GhiChuKhach, TrangThaiLH)
    VALUES (p_makh, p_matho, p_ngay, p_gio, ADDTIME(p_gio, SEC_TO_TIME(v_tl * 60)), v_tl,
            v_tien, p_kenh, p_ghichu, IF(p_kenh = 'WALKIN', 'DaXacNhan', 'ChoXacNhan'));
    SET p_malh = LAST_INSERT_ID();
    INSERT INTO CHITIET_LICHHEN (MaLH, MaDV, DonGiaApDung, ThoiLuongPhut)
      SELECT p_malh, d.MaDV, d.DonGia, d.ThoiLuongPhut FROM DICHVU d JOIN tmp_ds s ON s.MaDV = d.MaDV;
  COMMIT;
  DROP TEMPORARY TABLE IF EXISTS tmp_ds;
END$$

-- Khách tự hủy lịch (BR05): trạng thái Chờ/Đã xác nhận và trước giờ hẹn >= 2 giờ
CREATE PROCEDURE sp_HuyLich(IN p_malh INT, IN p_makh INT)
BEGIN
  DECLARE v_tt VARCHAR(25) DEFAULT NULL;
  DECLARE v_gio DATETIME DEFAULT NULL;
  SELECT TrangThaiLH, TIMESTAMP(NgayHen, GioBatDau) INTO v_tt, v_gio
    FROM LICHHEN WHERE MaLH = p_malh AND MaKH = p_makh;
  IF v_tt IS NULL THEN
    SIGNAL SQLSTATE '45000' SET MYSQL_ERRNO = 50060, MESSAGE_TEXT = 'Không tìm thấy lịch hẹn của khách';
  END IF;
  IF v_tt NOT IN ('ChoXacNhan','DaXacNhan') THEN
    SIGNAL SQLSTATE '45000' SET MYSQL_ERRNO = 50061, MESSAGE_TEXT = 'BR05: Lịch hẹn không ở trạng thái được hủy';
  END IF;
  IF NOW() > DATE_SUB(v_gio, INTERVAL 2 HOUR) THEN
    SIGNAL SQLSTATE '45000' SET MYSQL_ERRNO = 50062, MESSAGE_TEXT = 'BR05: Sát giờ hẹn dưới 2 giờ, vui lòng liên hệ lễ tân';
  END IF;
  UPDATE LICHHEN SET TrangThaiLH = 'DaHuy' WHERE MaLH = p_malh;
END$$

-- Lập hóa đơn (BR08): tự tính giảm giá theo hạng (Bạc 5%, Vàng/VIP 10%)
CREATE PROCEDURE sp_LapHoaDon(IN p_malh INT, IN p_nv INT, IN p_pt VARCHAR(30))
BEGIN
  DECLARE v_tong DECIMAL(12,0) DEFAULT 0;
  DECLARE v_pct DECIMAL(4,2) DEFAULT 0;
  DECLARE v_giam DECIMAL(12,0) DEFAULT 0;
  SELECT IFNULL(SUM(DonGiaApDung), 0) INTO v_tong FROM CHITIET_LICHHEN WHERE MaLH = p_malh;
  SELECT CASE k.HangThanhVien WHEN 'BAC' THEN 0.05 WHEN 'VANG' THEN 0.10 WHEN 'VIP' THEN 0.10 ELSE 0 END
    INTO v_pct
    FROM LICHHEN l JOIN KHACHHANG k ON k.MaKH = l.MaKH WHERE l.MaLH = p_malh;
  SET v_giam = ROUND(v_tong * IFNULL(v_pct, 0), 0);
  INSERT INTO HOADON (MaLH, NVThuNgan, TongTienDV, GiamGia, ThanhTien, PhuongThucTT)
  VALUES (p_malh, p_nv, v_tong, v_giam, v_tong - v_giam, p_pt);
END$$

DELIMITER ;

/* ---------------------------------------------------------------------
   VIEW
   --------------------------------------------------------------------- */
CREATE VIEW v_lichhen_chitiet AS
SELECT l.MaLH, l.NgayHen, l.GioBatDau, l.GioKetThucDK, l.TrangThaiLH, l.KenhDatLich,
       ndk.HoTen AS KhachHang, ndk.SoDienThoai AS SDTKhach, ndt.HoTen AS ThoCatToc,
       l.TongThoiLuong, l.TongTienTamTinh,
       (SELECT GROUP_CONCAT(d.TenDV ORDER BY d.MaDV SEPARATOR ', ') FROM CHITIET_LICHHEN c
          JOIN DICHVU d ON d.MaDV = c.MaDV WHERE c.MaLH = l.MaLH) AS DichVu
FROM LICHHEN l
JOIN KHACHHANG k  ON k.MaKH  = l.MaKH  JOIN NGUOIDUNG ndk ON ndk.MaND = k.MaND
JOIN THOCATTOC t  ON t.MaTho = l.MaTho JOIN NGUOIDUNG ndt ON ndt.MaND = t.MaND;

CREATE VIEW v_doanhthu_ngay AS
SELECT DATE(NgayThanhToan) AS Ngay, COUNT(*) AS SoHoaDon,
       SUM(TongTienDV) AS TongTienDV, SUM(GiamGia) AS TongGiamGia, SUM(ThanhTien) AS DoanhThu
FROM HOADON WHERE TrangThaiTT = 'DaThanhToan' GROUP BY DATE(NgayThanhToan);

CREATE VIEW v_hieusuat_tho AS
SELECT t.MaTho, nd.HoTen, t.DiemDanhGiaTB,
       COUNT(CASE WHEN l.TrangThaiLH = 'HoanThanh' THEN 1 END) AS SoLichHoanThanh,
       IFNULL(SUM(h.ThanhTien), 0) AS DoanhThu
FROM THOCATTOC t JOIN NGUOIDUNG nd ON nd.MaND = t.MaND
LEFT JOIN LICHHEN l ON l.MaTho = t.MaTho
LEFT JOIN HOADON h  ON h.MaLH = l.MaLH AND h.TrangThaiTT = 'DaThanhToan'
GROUP BY t.MaTho, nd.HoTen, t.DiemDanhGiaTB;

CREATE VIEW v_kiemtra_rb06 AS
SELECT l.MaLH, l.TongThoiLuong, SUM(c.ThoiLuongPhut) AS TongCT_TL,
       l.TongTienTamTinh, SUM(c.DonGiaApDung) AS TongCT_Tien
FROM LICHHEN l JOIN CHITIET_LICHHEN c ON c.MaLH = l.MaLH
GROUP BY l.MaLH, l.TongThoiLuong, l.TongTienTamTinh
HAVING l.TongThoiLuong <> SUM(c.ThoiLuongPhut) OR l.TongTienTamTinh <> SUM(c.DonGiaApDung);

CREATE VIEW v_ca_va_lich_bandat AS
SELECT c.MaTho, c.NgayLamViec, c.GioBatDau AS CaTu, c.GioKetThuc AS CaDen,
       l.GioBatDau AS BanTu, l.GioKetThucDK AS BanDen
FROM CALAMVIEC c
LEFT JOIN LICHHEN l ON l.MaTho = c.MaTho AND l.NgayHen = c.NgayLamViec
     AND l.TrangThaiLH IN ('ChoXacNhan','DaXacNhan','DangPhucVu')
WHERE c.TrangThaiCa = 'DANGMO';

/* ---------------------------------------------------------------------
   DỮ LIỆU MẪU  (mật khẩu mẫu của MỌI tài khoản = 'password' – chỉ để test)
   --------------------------------------------------------------------- */
SET @pw = '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi';

INSERT INTO NGUOIDUNG (HoTen, SoDienThoai, Email, MatKhauHash, VaiTro) VALUES
 ('Nguyễn Hoài Nam',      '0900000001', 'quanly@tiemtoc.vn',  @pw, 'QUANLY'),    -- 1
 ('Nguyễn Thái Nguyên',   '0900000002', 'letan@tiemtoc.vn',   @pw, 'LETAN'),     -- 2
 ('Trương Minh Khang',    '0900000011', 'khang@tiemtoc.vn',   @pw, 'THOCAT'),    -- 3
 ('Đặng Chí Dũng',        '0900000012', 'dung@tiemtoc.vn',    @pw, 'THOCAT'),    -- 4
 ('Đặng Hồ Đăng Khôi',    '0900000013', 'khoi@tiemtoc.vn',    @pw, 'THOCAT'),    -- 5
 ('Trần Đăng Khoa',       '0900000014', 'khoa@tiemtoc.vn',    @pw, 'THOCAT'),    -- 6
 ('Trần Thanh Huy',       '0900000015', 'huythanh@tiemtoc.vn',@pw, 'THOCAT'),    -- 7
 ('Nguyễn Trần Anh Luân', '0900000016', 'luan@tiemtoc.vn',    @pw, 'THOCAT'),    -- 8
 ('Nguyễn Văn An',        '0911111111', 'an@gmail.com',       @pw, 'KHACHHANG'), -- 9
 ('Trần Hoàng Nam',       '0922222222', 'nam@gmail.com',      @pw, 'KHACHHANG'), -- 10
 ('Lý Gia Huy',           '0933333333', 'huy@gmail.com',      @pw, 'KHACHHANG'), -- 11
 ('Đỗ Minh Quân',         '0944444444', NULL,                 @pw, 'KHACHHANG'), -- 12 (walk-in)
 ('Admin Hệ Thống',       '0900000000', 'admin@tiemtoc.vn',   @pw, 'ADMIN');     -- 13

INSERT INTO KHACHHANG (MaND, HangThanhVien, DiemTichLuy, GhiChuKieuToc) VALUES
 (9,  'BAC',    60, 'Hay cắt Undercut, tóc dày cứng'),
 (10, 'VANG',  160, 'Layer nam, thích vuốt sáp mờ'),
 (11, 'THUONG',  0, NULL),
 (12, 'THUONG',  0, 'Khách vãng lai');

-- MaTho: 1 Khang, 2 Dũng, 3 Khôi, 4 Khoa, 5 Huy, 6 Luân
INSERT INTO THOCATTOC (MaND, ChuyenMon, SoNamKN, AnhDaiDien, GioiThieuNgan) VALUES
 (3, 'Undercut, Fade, Cắt tạo kiểu nam',          7,  '/img/tho/khang.jpg', 'Chuyên các kiểu tóc nam hiện đại, tỉ mỉ từng đường cắt.'),
 (4, 'Layer, Uốn Premlock, Nhuộm',                5,  '/img/tho/dung.jpg',  'Phong cách trẻ trung, thời thượng Hàn Quốc.'),
 (5, 'Cắt cổ điển, Cạo mặt, Chăm sóc da',         10, '/img/tho/khoi.jpg',  'Barber truyền thống với 10 năm kinh nghiệm.'),
 (6, 'Fade, Textured Crop, Cắt tạo kiểu nam',     6,  '/img/tho/khoa.jpg',  'Thế mạnh các kiểu fade sắc nét, tạo kiểu gọn gàng.'),
 (7, 'Nhuộm thời trang, Uốn Premlock',            4,  '/img/tho/huy.jpg',   'Nhuộm và uốn theo xu hướng, tư vấn màu phù hợp da.'),
 (8, 'Layer, Side Part, Combo cắt gội',           3,  '/img/tho/luan.jpg',  'Nhẹ nhàng, chu đáo, phù hợp khách thích kiểu tóc lịch sự.');

INSERT INTO DICHVU (TenDV, LoaiDV, DonGia, ThoiLuongPhut, MoTaDV) VALUES
 ('Cắt tóc tạo kiểu',          'CatGoi',   100000, 30, 'Tư vấn kiểu, cắt và tạo kiểu bằng sáp.'),
 ('Gội đầu massage',           'CatGoi',    50000, 20, 'Gội đầu thư giãn, massage da đầu.'),
 ('Combo Cắt gội 7 bước',      'Combo',    150000, 45, 'Cắt, gội, massage, rửa mặt, cạo mặt, sấy, vuốt sáp.'),
 ('Uốn Premlock',              'UonToc',   400000, 90, 'Uốn tóc Premlock tạo độ phồng tự nhiên.'),
 ('Nhuộm tóc thời trang',      'NhuomToc', 350000, 90, 'Nhuộm màu theo yêu cầu, thuốc nhập khẩu.'),
 ('Lấy ráy tai + chăm sóc da', 'CatGoi',    60000, 15, 'Lấy ráy tai êm và đắp mặt nạ.');

-- Ca làm việc 08:30 – 22:00 từ 3 ngày trước đến 14 ngày sau hôm nay
SET @today = CURDATE();
INSERT INTO CALAMVIEC (MaTho, NgayLamViec, GioBatDau, GioKetThuc, SoKhachToiDa, TrangThaiCa)
SELECT t.MaTho, DATE_ADD(@today, INTERVAL d.n DAY), '08:30:00', '22:00:00', 12, 'DANGMO'
FROM THOCATTOC t
CROSS JOIN (SELECT -3 AS n UNION ALL SELECT -2 UNION ALL SELECT -1 UNION ALL SELECT 0
            UNION ALL SELECT 1 UNION ALL SELECT 2 UNION ALL SELECT 3 UNION ALL SELECT 4
            UNION ALL SELECT 5 UNION ALL SELECT 6 UNION ALL SELECT 7 UNION ALL SELECT 8
            UNION ALL SELECT 9 UNION ALL SELECT 10 UNION ALL SELECT 11 UNION ALL SELECT 12
            UNION ALL SELECT 13 UNION ALL SELECT 14) d;

UPDATE CALAMVIEC SET TrangThaiCa = 'NGHIPHEP'
 WHERE MaTho = 1 AND NgayLamViec = DATE_ADD(@today, INTERVAL 3 DAY);

UPDATE CALAMVIEC SET TrangThaiCa = 'NGHIPHEP'
 WHERE MaTho = 5 AND NgayLamViec = DATE_ADD(@today, INTERVAL 5 DAY);

SET @d_2 = DATE_SUB(@today, INTERVAL 2 DAY);
SET @d_1 = DATE_SUB(@today, INTERVAL 1 DAY);
SET @d1  = DATE_ADD(@today, INTERVAL 1 DAY);
SET @d2  = DATE_ADD(@today, INTERVAL 2 DAY);

-- (1) Lịch online đã hoàn thành + hóa đơn + đánh giá
INSERT INTO LICHHEN (MaKH,MaTho,NgayHen,GioBatDau,GioKetThucDK,TongThoiLuong,TongTienTamTinh,KenhDatLich,GhiChuKhach,TrangThaiLH,NgayTaoLH)
VALUES (1,1,@d_2,'09:00:00','09:45:00',45,150000,'ONLINE','Undercut như lần trước','ChoXacNhan',DATE_SUB(NOW(), INTERVAL 4 DAY));
SET @id = LAST_INSERT_ID();
INSERT INTO CHITIET_LICHHEN (MaLH,MaDV,DonGiaApDung,ThoiLuongPhut) VALUES (@id,3,150000,45);
UPDATE LICHHEN SET TrangThaiLH='DaXacNhan'  WHERE MaLH=@id;
UPDATE LICHHEN SET TrangThaiLH='DangPhucVu' WHERE MaLH=@id;
UPDATE LICHHEN SET TrangThaiLH='HoanThanh'  WHERE MaLH=@id;
CALL sp_LapHoaDon(@id, 2, 'TIENMAT');
INSERT INTO DANHGIA (MaLH,SoSao,NoiDungDG) VALUES (@id, 5, 'Cắt rất đẹp, thợ nhiệt tình!');

-- (2) Walk-in
CALL sp_DatLich(2, 2, @d_1, '14:00:00', '1,2', 'WALKIN', NULL, @id);
UPDATE LICHHEN SET TrangThaiLH='DangPhucVu' WHERE MaLH=@id;
UPDATE LICHHEN SET TrangThaiLH='HoanThanh'  WHERE MaLH=@id;
CALL sp_LapHoaDon(@id, 2, 'CHUYENKHOAN_QR');
INSERT INTO DANHGIA (MaLH,SoSao,NoiDungDG) VALUES (@id, 4, 'Ổn, hơi phải chờ một chút.');

CALL sp_DatLich(4, 3, @d_1, '10:00:00', '1', 'WALKIN', 'Khách vãng lai', @id);
UPDATE LICHHEN SET TrangThaiLH='DangPhucVu' WHERE MaLH=@id;
UPDATE LICHHEN SET TrangThaiLH='HoanThanh'  WHERE MaLH=@id;
CALL sp_LapHoaDon(@id, 2, 'TIENMAT');

-- (3) Khách không đến
INSERT INTO LICHHEN (MaKH,MaTho,NgayHen,GioBatDau,GioKetThucDK,TongThoiLuong,TongTienTamTinh,KenhDatLich,TrangThaiLH,NgayTaoLH)
VALUES (3,1,@d_1,'16:00:00','16:30:00',30,100000,'ONLINE','ChoXacNhan',DATE_SUB(NOW(), INTERVAL 3 DAY));
SET @id = LAST_INSERT_ID();
INSERT INTO CHITIET_LICHHEN (MaLH,MaDV,DonGiaApDung,ThoiLuongPhut) VALUES (@id,1,100000,30);
UPDATE LICHHEN SET TrangThaiLH='KhongDen' WHERE MaLH=@id;

-- (4) Lịch sắp tới
INSERT INTO LICHHEN (MaKH,MaTho,NgayHen,GioBatDau,GioKetThucDK,TongThoiLuong,TongTienTamTinh,KenhDatLich,TrangThaiLH)
VALUES (1,1,@d1,'10:00:00','10:45:00',45,150000,'ONLINE','ChoXacNhan');
SET @id = LAST_INSERT_ID();
INSERT INTO CHITIET_LICHHEN (MaLH,MaDV,DonGiaApDung,ThoiLuongPhut) VALUES (@id,3,150000,45);
UPDATE LICHHEN SET TrangThaiLH='DaXacNhan' WHERE MaLH=@id;

INSERT INTO LICHHEN (MaKH,MaTho,NgayHen,GioBatDau,GioKetThucDK,TongThoiLuong,TongTienTamTinh,KenhDatLich,GhiChuKhach,TrangThaiLH)
VALUES (3,2,@d2,'15:00:00','16:30:00',90,400000,'ONLINE','Muốn uốn nhẹ','ChoXacNhan');
SET @id = LAST_INSERT_ID();
INSERT INTO CHITIET_LICHHEN (MaLH,MaDV,DonGiaApDung,ThoiLuongPhut) VALUES (@id,4,400000,90);

-- (5) Thêm lịch mẫu cho các thợ còn lại (Khoa, Huy, Luân)
CALL sp_DatLich(2, 4, @d_2, '11:00:00', '3', 'WALKIN', 'Layer nam', @id);
UPDATE LICHHEN SET TrangThaiLH='DangPhucVu' WHERE MaLH=@id;
UPDATE LICHHEN SET TrangThaiLH='HoanThanh'  WHERE MaLH=@id;
CALL sp_LapHoaDon(@id, 1, 'CHUYENKHOAN_QR');
INSERT INTO DANHGIA (MaLH,SoSao,NoiDungDG) VALUES (@id, 5, 'Fade rất sạch, sẽ quay lại.');

CALL sp_DatLich(3, 5, @d_1, '13:00:00', '1,2', 'WALKIN', NULL, @id);
UPDATE LICHHEN SET TrangThaiLH='DangPhucVu' WHERE MaLH=@id;
UPDATE LICHHEN SET TrangThaiLH='HoanThanh'  WHERE MaLH=@id;
CALL sp_LapHoaDon(@id, 2, 'TIENMAT');
INSERT INTO DANHGIA (MaLH,SoSao,NoiDungDG) VALUES (@id, 4, 'Thợ nhiệt tình, giá hợp lý.');

CALL sp_DatLich(4, 6, @d_2, '15:00:00', '4', 'WALKIN', 'Uốn nhẹ', @id);
UPDATE LICHHEN SET TrangThaiLH='DangPhucVu' WHERE MaLH=@id;
UPDATE LICHHEN SET TrangThaiLH='HoanThanh'  WHERE MaLH=@id;
CALL sp_LapHoaDon(@id, 2, 'TIENMAT');
INSERT INTO DANHGIA (MaLH,SoSao,NoiDungDG) VALUES (@id, 5, 'Tóc uốn tự nhiên, rất ưng.');

-- Lịch sắp tới
INSERT INTO LICHHEN (MaKH,MaTho,NgayHen,GioBatDau,GioKetThucDK,TongThoiLuong,TongTienTamTinh,KenhDatLich,GhiChuKhach,TrangThaiLH)
VALUES (2,4,@d1,'14:00:00','15:30:00',90,350000,'ONLINE','Nhuộm nâu khói','ChoXacNhan');
SET @id = LAST_INSERT_ID();
INSERT INTO CHITIET_LICHHEN (MaLH,MaDV,DonGiaApDung,ThoiLuongPhut) VALUES (@id,5,350000,90);

INSERT INTO LICHHEN (MaKH,MaTho,NgayHen,GioBatDau,GioKetThucDK,TongThoiLuong,TongTienTamTinh,KenhDatLich,TrangThaiLH)
VALUES (4,6,@d2,'09:30:00','10:15:00',45,150000,'ONLINE','ChoXacNhan');
SET @id = LAST_INSERT_ID();
INSERT INTO CHITIET_LICHHEN (MaLH,MaDV,DonGiaApDung,ThoiLuongPhut) VALUES (@id,3,150000,45);
UPDATE LICHHEN SET TrangThaiLH='DaXacNhan' WHERE MaLH=@id;
