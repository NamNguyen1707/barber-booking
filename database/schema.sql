-- Schema database datlich_cattoc (MySQL 8)

CREATE DATABASE IF NOT EXISTS `datlich_cattoc` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `datlich_cattoc`;

-- ----------------------------
-- Table structure for nguoidung
-- ----------------------------
CREATE TABLE `nguoidung` (
  `MaND` int NOT NULL AUTO_INCREMENT,
  `HoTen` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `SoDienThoai` varchar(15) COLLATE utf8mb4_unicode_ci NOT NULL,
  `Email` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `MatKhauHash` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `VaiTro` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `TrangThai` tinyint NOT NULL DEFAULT '1',
  `NgayTao` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`MaND`),
  UNIQUE KEY `uq_nd_sdt` (`SoDienThoai`),
  UNIQUE KEY `uq_nd_email` (`Email`),
  CONSTRAINT `ck_nd_tt` CHECK ((`TrangThai` in (0,1))),
  CONSTRAINT `ck_nd_vaitro` CHECK ((`VaiTro` in (_utf8mb4'KHACHHANG',_utf8mb4'LETAN',_utf8mb4'THOCAT',_utf8mb4'QUANLY',_utf8mb4'ADMIN')))
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------
-- Table structure for khachhang
-- ----------------------------
CREATE TABLE `khachhang` (
  `MaKH` int NOT NULL AUTO_INCREMENT,
  `MaND` int NOT NULL,
  `HangThanhVien` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'THUONG',
  `DiemTichLuy` int NOT NULL DEFAULT '0',
  `GhiChuKieuToc` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `NgayDangKy` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`MaKH`),
  UNIQUE KEY `uq_kh_nd` (`MaND`),
  CONSTRAINT `fk_kh_nd` FOREIGN KEY (`MaND`) REFERENCES `nguoidung` (`MaND`),
  CONSTRAINT `ck_kh_diem` CHECK ((`DiemTichLuy` >= 0)),
  CONSTRAINT `ck_kh_hang` CHECK ((`HangThanhVien` in (_utf8mb4'THUONG',_utf8mb4'BAC',_utf8mb4'VANG',_utf8mb4'VIP')))
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------
-- Table structure for thocattoc
-- ----------------------------
CREATE TABLE `thocattoc` (
  `MaTho` int NOT NULL AUTO_INCREMENT,
  `MaND` int NOT NULL,
  `ChuyenMon` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `SoNamKN` int NOT NULL DEFAULT '0',
  `AnhDaiDien` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `GioiThieuNgan` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `DiemDanhGiaTB` decimal(3,2) NOT NULL DEFAULT '5.00',
  `TrangThaiLamViec` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'DANGLAMVIEC',
  PRIMARY KEY (`MaTho`),
  UNIQUE KEY `uq_tho_nd` (`MaND`),
  CONSTRAINT `fk_tho_nd` FOREIGN KEY (`MaND`) REFERENCES `nguoidung` (`MaND`),
  CONSTRAINT `ck_tho_diem` CHECK ((`DiemDanhGiaTB` between 0 and 5)),
  CONSTRAINT `ck_tho_kn` CHECK ((`SoNamKN` >= 0)),
  CONSTRAINT `ck_tho_tt` CHECK ((`TrangThaiLamViec` in (_utf8mb4'DANGLAMVIEC',_utf8mb4'TAMNGHI',_utf8mb4'DANGHIVIEC')))
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------
-- Table structure for calamviec
-- ----------------------------
CREATE TABLE `calamviec` (
  `MaCa` int NOT NULL AUTO_INCREMENT,
  `MaTho` int NOT NULL,
  `NgayLamViec` date NOT NULL,
  `GioBatDau` time NOT NULL,
  `GioKetThuc` time NOT NULL,
  `SoKhachToiDa` int NOT NULL DEFAULT '10',
  `TrangThaiCa` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'DANGMO',
  PRIMARY KEY (`MaCa`),
  KEY `idx_ca_tho_ngay` (`MaTho`,`NgayLamViec`),
  CONSTRAINT `fk_ca_tho` FOREIGN KEY (`MaTho`) REFERENCES `thocattoc` (`MaTho`),
  CONSTRAINT `ck_ca_gio` CHECK ((`GioBatDau` < `GioKetThuc`)),
  CONSTRAINT `ck_ca_max` CHECK ((`SoKhachToiDa` > 0)),
  CONSTRAINT `ck_ca_tt` CHECK ((`TrangThaiCa` in (_utf8mb4'DANGMO',_utf8mb4'NGHIPHEP',_utf8mb4'DAKHOA')))
) ENGINE=InnoDB AUTO_INCREMENT=128 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------
-- Table structure for dichvu
-- ----------------------------
CREATE TABLE `dichvu` (
  `MaDV` int NOT NULL AUTO_INCREMENT,
  `TenDV` varchar(120) COLLATE utf8mb4_unicode_ci NOT NULL,
  `LoaiDV` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `DonGia` decimal(12,0) NOT NULL,
  `ThoiLuongPhut` int NOT NULL,
  `MoTaDV` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `HinhAnhDV` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `TrangThaiDV` tinyint NOT NULL DEFAULT '1',
  PRIMARY KEY (`MaDV`),
  UNIQUE KEY `uq_dv_ten` (`TenDV`),
  CONSTRAINT `ck_dv_gia` CHECK ((`DonGia` > 0)),
  CONSTRAINT `ck_dv_loai` CHECK ((`LoaiDV` in (_utf8mb4'CatGoi',_utf8mb4'UonToc',_utf8mb4'NhuomToc',_utf8mb4'Combo'))),
  CONSTRAINT `ck_dv_tl` CHECK ((`ThoiLuongPhut` >= 15)),
  CONSTRAINT `ck_dv_tt` CHECK ((`TrangThaiDV` in (0,1)))
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------
-- Table structure for lichhen
-- ----------------------------
CREATE TABLE `lichhen` (
  `MaLH` int NOT NULL AUTO_INCREMENT,
  `MaKH` int NOT NULL,
  `MaTho` int NOT NULL,
  `NgayHen` date NOT NULL,
  `GioBatDau` time NOT NULL,
  `GioKetThucDK` time NOT NULL,
  `TongThoiLuong` int NOT NULL,
  `TongTienTamTinh` decimal(12,0) NOT NULL,
  `KenhDatLich` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'ONLINE',
  `GhiChuKhach` varchar(300) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `TrangThaiLH` varchar(25) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'ChoXacNhan',
  `NgayTaoLH` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`MaLH`),
  KEY `idx_lh_tho_ngay` (`MaTho`,`NgayHen`),
  KEY `idx_lh_kh` (`MaKH`,`TrangThaiLH`,`NgayHen`),
  CONSTRAINT `fk_lh_kh` FOREIGN KEY (`MaKH`) REFERENCES `khachhang` (`MaKH`),
  CONSTRAINT `fk_lh_tho` FOREIGN KEY (`MaTho`) REFERENCES `thocattoc` (`MaTho`),
  CONSTRAINT `ck_lh_gio` CHECK (((`GioBatDau` >= _utf8mb4'08:30:00') and (`GioBatDau` < `GioKetThucDK`) and (`GioKetThucDK` <= _utf8mb4'22:00:00'))),
  CONSTRAINT `ck_lh_kenh` CHECK ((`KenhDatLich` in (_utf8mb4'ONLINE',_utf8mb4'WALKIN'))),
  CONSTRAINT `ck_lh_tien` CHECK ((`TongTienTamTinh` >= 0)),
  CONSTRAINT `ck_lh_tl` CHECK ((`TongThoiLuong` > 0)),
  CONSTRAINT `ck_lh_tt` CHECK ((`TrangThaiLH` in (_utf8mb4'ChoXacNhan',_utf8mb4'DaXacNhan',_utf8mb4'DangPhucVu',_utf8mb4'HoanThanh',_utf8mb4'DaHuy',_utf8mb4'KhongDen')))
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------
-- Table structure for chitiet_lichhen
-- ----------------------------
CREATE TABLE `chitiet_lichhen` (
  `MaCTLH` int NOT NULL AUTO_INCREMENT,
  `MaLH` int NOT NULL,
  `MaDV` int NOT NULL,
  `DonGiaApDung` decimal(12,0) NOT NULL,
  `ThoiLuongPhut` int NOT NULL,
  `GhiChuDV` varchar(200) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`MaCTLH`),
  UNIQUE KEY `uq_ct_lh_dv` (`MaLH`,`MaDV`),
  KEY `fk_ct_dv` (`MaDV`),
  CONSTRAINT `fk_ct_dv` FOREIGN KEY (`MaDV`) REFERENCES `dichvu` (`MaDV`),
  CONSTRAINT `fk_ct_lh` FOREIGN KEY (`MaLH`) REFERENCES `lichhen` (`MaLH`) ON DELETE CASCADE,
  CONSTRAINT `ck_ct_gia` CHECK ((`DonGiaApDung` > 0)),
  CONSTRAINT `ck_ct_tl` CHECK ((`ThoiLuongPhut` > 0))
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------
-- Table structure for hoadon
-- ----------------------------
CREATE TABLE `hoadon` (
  `MaHD` int NOT NULL AUTO_INCREMENT,
  `MaLH` int NOT NULL,
  `NVThuNgan` int NOT NULL,
  `NgayThanhToan` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `TongTienDV` decimal(12,0) NOT NULL,
  `GiamGia` decimal(12,0) NOT NULL DEFAULT '0',
  `ThanhTien` decimal(12,0) NOT NULL,
  `PhuongThucTT` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL,
  `TrangThaiTT` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'DaThanhToan',
  PRIMARY KEY (`MaHD`),
  UNIQUE KEY `uq_hd_lh` (`MaLH`),
  KEY `fk_hd_nv` (`NVThuNgan`),
  CONSTRAINT `fk_hd_lh` FOREIGN KEY (`MaLH`) REFERENCES `lichhen` (`MaLH`),
  CONSTRAINT `fk_hd_nv` FOREIGN KEY (`NVThuNgan`) REFERENCES `nguoidung` (`MaND`),
  CONSTRAINT `ck_hd_pt` CHECK ((`PhuongThucTT` in (_utf8mb4'TIENMAT',_utf8mb4'CHUYENKHOAN_QR'))),
  CONSTRAINT `ck_hd_tien` CHECK (((`TongTienDV` >= 0) and (`GiamGia` >= 0) and (`GiamGia` <= `TongTienDV`) and (`ThanhTien` = (`TongTienDV` - `GiamGia`)))),
  CONSTRAINT `ck_hd_tt` CHECK ((`TrangThaiTT` in (_utf8mb4'DaThanhToan',_utf8mb4'DaHoanTien')))
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------
-- Table structure for danhgia
-- ----------------------------
CREATE TABLE `danhgia` (
  `MaDG` int NOT NULL AUTO_INCREMENT,
  `MaLH` int NOT NULL,
  `SoSao` tinyint NOT NULL,
  `NoiDungDG` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `NgayDanhGia` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`MaDG`),
  UNIQUE KEY `uq_dg_lh` (`MaLH`),
  CONSTRAINT `fk_dg_lh` FOREIGN KEY (`MaLH`) REFERENCES `lichhen` (`MaLH`),
  CONSTRAINT `ck_dg_sao` CHECK ((`SoSao` between 1 and 5))
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------
-- View structure for v_ca_va_lich_bandat
-- ----------------------------
CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `v_ca_va_lich_bandat` AS select `c`.`MaTho` AS `MaTho`,`c`.`NgayLamViec` AS `NgayLamViec`,`c`.`GioBatDau` AS `CaTu`,`c`.`GioKetThuc` AS `CaDen`,`l`.`GioBatDau` AS `BanTu`,`l`.`GioKetThucDK` AS `BanDen` from (`calamviec` `c` left join `lichhen` `l` on(((`l`.`MaTho` = `c`.`MaTho`) and (`l`.`NgayHen` = `c`.`NgayLamViec`) and (`l`.`TrangThaiLH` in ('ChoXacNhan','DaXacNhan','DangPhucVu'))))) where (`c`.`TrangThaiCa` = 'DANGMO');

-- ----------------------------
-- View structure for v_doanhthu_ngay
-- ----------------------------
CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `v_doanhthu_ngay` AS select cast(`hoadon`.`NgayThanhToan` as date) AS `Ngay`,count(0) AS `SoHoaDon`,sum(`hoadon`.`TongTienDV`) AS `TongTienDV`,sum(`hoadon`.`GiamGia`) AS `TongGiamGia`,sum(`hoadon`.`ThanhTien`) AS `DoanhThu` from `hoadon` where (`hoadon`.`TrangThaiTT` = 'DaThanhToan') group by cast(`hoadon`.`NgayThanhToan` as date);

-- ----------------------------
-- View structure for v_hieusuat_tho
-- ----------------------------
CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `v_hieusuat_tho` AS select `t`.`MaTho` AS `MaTho`,`nd`.`HoTen` AS `HoTen`,`t`.`DiemDanhGiaTB` AS `DiemDanhGiaTB`,count((case when (`l`.`TrangThaiLH` = 'HoanThanh') then 1 end)) AS `SoLichHoanThanh`,ifnull(sum(`h`.`ThanhTien`),0) AS `DoanhThu` from (((`thocattoc` `t` join `nguoidung` `nd` on((`nd`.`MaND` = `t`.`MaND`))) left join `lichhen` `l` on((`l`.`MaTho` = `t`.`MaTho`))) left join `hoadon` `h` on(((`h`.`MaLH` = `l`.`MaLH`) and (`h`.`TrangThaiTT` = 'DaThanhToan')))) group by `t`.`MaTho`,`nd`.`HoTen`,`t`.`DiemDanhGiaTB`;

-- ----------------------------
-- View structure for v_kiemtra_rb06
-- ----------------------------
CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `v_kiemtra_rb06` AS select `l`.`MaLH` AS `MaLH`,`l`.`TongThoiLuong` AS `TongThoiLuong`,sum(`c`.`ThoiLuongPhut`) AS `TongCT_TL`,`l`.`TongTienTamTinh` AS `TongTienTamTinh`,sum(`c`.`DonGiaApDung`) AS `TongCT_Tien` from (`lichhen` `l` join `chitiet_lichhen` `c` on((`c`.`MaLH` = `l`.`MaLH`))) group by `l`.`MaLH`,`l`.`TongThoiLuong`,`l`.`TongTienTamTinh` having ((`l`.`TongThoiLuong` <> sum(`c`.`ThoiLuongPhut`)) or (`l`.`TongTienTamTinh` <> sum(`c`.`DonGiaApDung`)));

-- ----------------------------
-- View structure for v_lichhen_chitiet
-- ----------------------------
CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `v_lichhen_chitiet` AS select `l`.`MaLH` AS `MaLH`,`l`.`NgayHen` AS `NgayHen`,`l`.`GioBatDau` AS `GioBatDau`,`l`.`GioKetThucDK` AS `GioKetThucDK`,`l`.`TrangThaiLH` AS `TrangThaiLH`,`l`.`KenhDatLich` AS `KenhDatLich`,`ndk`.`HoTen` AS `KhachHang`,`ndk`.`SoDienThoai` AS `SDTKhach`,`ndt`.`HoTen` AS `ThoCatToc`,`l`.`TongThoiLuong` AS `TongThoiLuong`,`l`.`TongTienTamTinh` AS `TongTienTamTinh`,(select group_concat(`d`.`TenDV` order by `d`.`MaDV` ASC separator ', ') from (`chitiet_lichhen` `c` join `dichvu` `d` on((`d`.`MaDV` = `c`.`MaDV`))) where (`c`.`MaLH` = `l`.`MaLH`)) AS `DichVu` from ((((`lichhen` `l` join `khachhang` `k` on((`k`.`MaKH` = `l`.`MaKH`))) join `nguoidung` `ndk` on((`ndk`.`MaND` = `k`.`MaND`))) join `thocattoc` `t` on((`t`.`MaTho` = `l`.`MaTho`))) join `nguoidung` `ndt` on((`ndt`.`MaND` = `t`.`MaND`)));

-- ----------------------------
-- Procedure structure for sp_chk_lichhen
-- ----------------------------
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_chk_lichhen`(
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
END;;
DELIMITER ;

-- ----------------------------
-- Procedure structure for sp_DatLich
-- ----------------------------
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_DatLich`(
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
END;;
DELIMITER ;

-- ----------------------------
-- Procedure structure for sp_HuyLich
-- ----------------------------
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_HuyLich`(IN p_malh INT, IN p_makh INT)
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
END;;
DELIMITER ;

-- ----------------------------
-- Procedure structure for sp_LapHoaDon
-- ----------------------------
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_LapHoaDon`(IN p_malh INT, IN p_nv INT, IN p_pt VARCHAR(30))
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
END;;
DELIMITER ;

-- ----------------------------
-- Trigger structure for trg_ct_check
-- ----------------------------
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` TRIGGER `trg_ct_check` BEFORE INSERT ON `chitiet_lichhen` FOR EACH ROW BEGIN
  IF (SELECT TrangThaiDV FROM DICHVU WHERE MaDV = NEW.MaDV) <> 1 THEN
    SIGNAL SQLSTATE '45000' SET MYSQL_ERRNO = 50020, MESSAGE_TEXT = 'BR06: Dịch vụ đã ngừng phục vụ';
  END IF;
END;;
DELIMITER ;

-- ----------------------------
-- Trigger structure for trg_dg_check
-- ----------------------------
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` TRIGGER `trg_dg_check` BEFORE INSERT ON `danhgia` FOR EACH ROW BEGIN
  IF (SELECT TrangThaiLH FROM LICHHEN WHERE MaLH = NEW.MaLH) <> 'HoanThanh'
     OR NOT EXISTS (SELECT 1 FROM HOADON WHERE MaLH = NEW.MaLH AND TrangThaiTT = 'DaThanhToan') THEN
    SIGNAL SQLSTATE '45000' SET MYSQL_ERRNO = 50040, MESSAGE_TEXT = 'BR10: Chỉ đánh giá lịch hẹn đã hoàn thành và đã thanh toán';
  END IF;
END;;
DELIMITER ;

-- ----------------------------
-- Trigger structure for trg_dg_after
-- ----------------------------
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` TRIGGER `trg_dg_after` AFTER INSERT ON `danhgia` FOR EACH ROW BEGIN
  DECLARE v_matho INT;
  SELECT MaTho INTO v_matho FROM LICHHEN WHERE MaLH = NEW.MaLH;
  UPDATE THOCATTOC
     SET DiemDanhGiaTB = (SELECT CAST(AVG(d.SoSao) AS DECIMAL(3,2))
                            FROM DANHGIA d JOIN LICHHEN l2 ON l2.MaLH = d.MaLH
                           WHERE l2.MaTho = v_matho)
   WHERE MaTho = v_matho;
END;;
DELIMITER ;

-- ----------------------------
-- Trigger structure for trg_hd_check
-- ----------------------------
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` TRIGGER `trg_hd_check` BEFORE INSERT ON `hoadon` FOR EACH ROW BEGIN
  IF (SELECT TrangThaiLH FROM LICHHEN WHERE MaLH = NEW.MaLH) <> 'HoanThanh' THEN
    SIGNAL SQLSTATE '45000' SET MYSQL_ERRNO = 50030, MESSAGE_TEXT = 'BR08: Chỉ lập hóa đơn cho lịch hẹn đã Hoàn thành';
  END IF;
  IF (SELECT VaiTro FROM NGUOIDUNG WHERE MaND = NEW.NVThuNgan) NOT IN ('LETAN','QUANLY','ADMIN') THEN
    SIGNAL SQLSTATE '45000' SET MYSQL_ERRNO = 50031, MESSAGE_TEXT = 'Người thu ngân phải là Lễ tân/Quản lý/Admin';
  END IF;
  IF NEW.TongTienDV <> (SELECT IFNULL(SUM(DonGiaApDung), 0) FROM CHITIET_LICHHEN WHERE MaLH = NEW.MaLH) THEN
    SIGNAL SQLSTATE '45000' SET MYSQL_ERRNO = 50032, MESSAGE_TEXT = 'TongTienDV không khớp tổng chi tiết lịch hẹn';
  END IF;
END;;
DELIMITER ;

-- ----------------------------
-- Trigger structure for trg_hd_after
-- ----------------------------
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` TRIGGER `trg_hd_after` AFTER INSERT ON `hoadon` FOR EACH ROW BEGIN
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
END;;
DELIMITER ;

-- ----------------------------
-- Trigger structure for trg_kh_check
-- ----------------------------
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` TRIGGER `trg_kh_check` BEFORE INSERT ON `khachhang` FOR EACH ROW BEGIN
  IF (SELECT VaiTro FROM NGUOIDUNG WHERE MaND = NEW.MaND) <> 'KHACHHANG' THEN
    SIGNAL SQLSTATE '45000' SET MYSQL_ERRNO = 50001, MESSAGE_TEXT = 'Tài khoản không có vai trò KHACHHANG';
  END IF;
END;;
DELIMITER ;

-- ----------------------------
-- Trigger structure for trg_lh_insert
-- ----------------------------
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` TRIGGER `trg_lh_insert` BEFORE INSERT ON `lichhen` FOR EACH ROW BEGIN
  CALL sp_chk_lichhen(0, NEW.MaKH, NEW.MaTho, NEW.NgayHen, NEW.GioBatDau, NEW.GioKetThucDK,
                      NEW.TongThoiLuong, NEW.TrangThaiLH, 1);
END;;
DELIMITER ;

-- ----------------------------
-- Trigger structure for trg_lh_update
-- ----------------------------
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` TRIGGER `trg_lh_update` BEFORE UPDATE ON `lichhen` FOR EACH ROW BEGIN
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
END;;
DELIMITER ;

-- ----------------------------
-- Trigger structure for trg_tho_check
-- ----------------------------
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` TRIGGER `trg_tho_check` BEFORE INSERT ON `thocattoc` FOR EACH ROW BEGIN
  IF (SELECT VaiTro FROM NGUOIDUNG WHERE MaND = NEW.MaND) <> 'THOCAT' THEN
    SIGNAL SQLSTATE '45000' SET MYSQL_ERRNO = 50002, MESSAGE_TEXT = 'Tài khoản không có vai trò THOCAT';
  END IF;
END;;
DELIMITER ;

