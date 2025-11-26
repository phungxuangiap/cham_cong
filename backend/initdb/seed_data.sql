-- ======================================================================
-- DỮ LIỆU MẪU (SEED DATA) - CẬP NHẬT ĐẦY ĐỦ
-- Chú ý: Đảm bảo các bảng đã được tạo thành công trước khi chạy file này.
-- ======================================================================

USE Attendance_System_Final;

-- Xóa dữ liệu cũ (nếu có)
SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE OVERTIME_REQUEST;
TRUNCATE TABLE LEAVE_REQUEST;
TRUNCATE TABLE CONTRACT;
TRUNCATE TABLE DAILY_TIMESHEET;
TRUNCATE TABLE RAW_ATTENDANCE_LOG;
TRUNCATE TABLE USER_ACCOUNT;
TRUNCATE TABLE EMPLOYEE;
TRUNCATE TABLE DEPARTMENT;
TRUNCATE TABLE WORK_SHIFT;
TRUNCATE TABLE POSITION;
SET FOREIGN_KEY_CHECKS = 1;

-- ======================================================================
-- 1. BẢNG TĨNH (STATIC DATA)
-- ======================================================================

-- 1.1. POSITION (Chức vụ)
INSERT INTO POSITION (position_id, position_name, description) VALUES
('P001', 'CEO', 'Chief Executive Officer - Tổng Giám Đốc'),
('P002', 'Director', 'Giám đốc cấp cao'),
('P003', 'Manager', 'Quản lý phòng ban'),
('P004', 'Team Lead', 'Trưởng nhóm'),
('P005', 'Senior Staff', 'Nhân viên cấp cao'),
('P006', 'Staff', 'Nhân viên'),
('P007', 'Junior Staff', 'Nhân viên mới'),
('P008', 'Intern', 'Thực tập sinh');

-- 1.2. EMPLOYEE - Batch 1 (Leadership - không có department)
INSERT INTO EMPLOYEE (employee_id, full_name, date_of_birth, gender, address, phone_number, personal_email, company_email, status, join_date, department_id, position_id, manager_id, bank_account_number, bank_name, bank_branch) VALUES
-- CEO
('E001', 'Nguyễn Văn An', '1975-03-15', 'Male', '123 Lê Lợi, Q1, TPHCM', '0901000001', 'nguyen.van.an@gmail.com', 'ceo@company.com', 'Active', '2010-01-01', NULL, 'P001', NULL, '1234567890', 'Vietcombank', 'Chi nhánh TPHCM'),
-- Directors
('E002', 'Trần Thị Bình', '1980-06-20', 'Female', '456 Nguyễn Huệ, Q1, TPHCM', '0902000002', 'tran.thi.binh@gmail.com', 'tech.director@company.com', 'Active', '2012-03-15', NULL, 'P002', 'E001', '2234567890', 'Techcombank', 'Chi nhánh TPHCM'),
('E003', 'Lê Văn Cường', '1982-09-10', 'Male', '789 Lê Duẩn, Q3, TPHCM', '0903000003', 'le.van.cuong@gmail.com', 'hr.director@company.com', 'Active', '2013-05-20', NULL, 'P002', 'E001', '3234567890', 'BIDV', 'Chi nhánh TPHCM'),
('E004', 'Phạm Thị Dung', '1983-11-25', 'Female', '321 Pasteur, Q3, TPHCM', '0904000004', 'pham.thi.dung@gmail.com', 'sales.director@company.com', 'Active', '2014-07-10', NULL, 'P002', 'E001', '4234567890', 'ACB', 'Chi nhánh TPHCM');

-- 1.3. DEPARTMENT (Phòng ban)
INSERT INTO DEPARTMENT (department_id, department_name, description, parent_department_id, manager_id) VALUES
-- Level 1: Ban điều hành
('D001', 'Ban Giám Đốc', 'Ban lãnh đạo cấp cao công ty', NULL, 'E001'),

-- Level 2: Các phòng ban chính
('D002', 'Phòng Công Nghệ', 'Phát triển và vận hành hệ thống', 'D001', 'E002'),
('D003', 'Phòng Nhân Sự', 'Quản lý nhân sự và đào tạo', 'D001', 'E003'),
('D004', 'Phòng Kinh Doanh', 'Bán hàng và marketing', 'D001', 'E004'),

-- Level 3: Các team trong phòng Công Nghệ
('D005', 'Team Backend', 'Phát triển backend', 'D002', NULL),
('D006', 'Team Frontend', 'Phát triển frontend', 'D002', NULL),
('D007', 'Team Mobile', 'Phát triển mobile app', 'D002', NULL),
('D008', 'Team DevOps', 'Vận hành hệ thống', 'D002', NULL),

-- Level 3: Các team trong phòng Kinh Doanh
('D009', 'Team B2B Sales', 'Bán hàng doanh nghiệp', 'D004', NULL),
('D010', 'Team B2C Sales', 'Bán hàng cá nhân', 'D004', NULL);

-- 1.4. WORK_SHIFT (Ca làm việc) - Cập nhật với department_id
INSERT INTO WORK_SHIFT (shift_id, shift_name, start_time, end_time, max_late_time, department_id) VALUES
('S001', 'Ca Hành Chính', '08:00:00', '17:00:00', '08:15:00', 'D001'),
('S002', 'Ca Sáng', '06:00:00', '14:00:00', '06:15:00', 'D002'),
('S003', 'Ca Chiều', '14:00:00', '22:00:00', '14:15:00', 'D003'),
('S004', 'Ca Đêm', '22:00:00', '06:00:00', '22:15:00', 'D004'),
('S005', 'Ca Linh Hoạt', '09:00:00', '18:00:00', '09:15:00', 'D005');

-- Cập nhật department_id cho leadership
UPDATE EMPLOYEE SET department_id = 'D001' WHERE employee_id = 'E001';
UPDATE EMPLOYEE SET department_id = 'D002' WHERE employee_id = 'E002';
UPDATE EMPLOYEE SET department_id = 'D003' WHERE employee_id = 'E003';
UPDATE EMPLOYEE SET department_id = 'D004' WHERE employee_id = 'E004';

-- 1.5. EMPLOYEE - Batch 2 (Managers và Staff)
INSERT INTO EMPLOYEE (employee_id, full_name, date_of_birth, gender, address, phone_number, personal_email, company_email, status, join_date, department_id, position_id, manager_id, bank_account_number, bank_name, bank_branch) VALUES
-- Phòng Công Nghệ - Managers
('E005', 'Hoàng Văn Em', '1985-02-14', 'Male', '111 Điện Biên Phủ, Q3, TPHCM', '0905000005', 'hoang.van.em@gmail.com', 'backend.lead@company.com', 'Active', '2015-01-10', 'D005', 'P004', 'E002', '5234567890', 'Vietcombank', 'CN Gò Vấp'),
('E006', 'Võ Thị Phương', '1986-04-22', 'Female', '222 Cách Mạng Tháng 8, Q10, TPHCM', '0906000006', 'vo.thi.phuong@gmail.com', 'frontend.lead@company.com', 'Active', '2015-06-15', 'D006', 'P004', 'E002', '6234567890', 'Techcombank', 'CN Q10'),
('E007', 'Đặng Văn Giang', '1987-07-08', 'Male', '333 Hoàng Văn Thụ, TB, TPHCM', '0907000007', 'dang.van.giang@gmail.com', 'mobile.lead@company.com', 'Active', '2016-02-20', 'D007', 'P004', 'E002', '7234567890', 'BIDV', 'CN Tân Bình'),
('E008', 'Ngô Thị Hoa', '1988-10-30', 'Female', '444 Lý Thường Kiệt, Q10, TPHCM', '0908000008', 'ngo.thi.hoa@gmail.com', 'devops.lead@company.com', 'Active', '2016-08-05', 'D008', 'P004', 'E002', '8234567890', 'ACB', 'CN Q10'),

-- Phòng Nhân Sự - Staff
('E009', 'Bùi Văn Ích', '1990-01-12', 'Male', '555 Trường Chinh, TB, TPHCM', '0909000009', 'bui.van.ich@gmail.com', 'hr.recruitment@company.com', 'Active', '2017-03-15', 'D003', 'P006', 'E003', '9234567890', 'Vietinbank', 'CN Tân Bình'),
('E010', 'Trương Thị Kim', '1991-05-18', 'Female', '666 Âu Cơ, TB, TPHCM', '0910000010', 'truong.thi.kim@gmail.com', 'hr.training@company.com', 'Active', '2017-09-01', 'D003', 'P006', 'E003', '1034567890', 'Sacombank', 'CN Tân Bình'),

-- Phòng Kinh Doanh - Managers
('E011', 'Đinh Văn Long', '1989-08-22', 'Male', '777 Nguyễn Chí Thanh, Q5, TPHCM', '0911000011', 'dinh.van.long@gmail.com', 'b2b.lead@company.com', 'Active', '2018-01-10', 'D009', 'P004', 'E004', '1134567890', 'MB Bank', 'CN Q5'),
('E012', 'Lý Thị Mai', '1990-11-05', 'Female', '888 Hồng Bàng, Q6, TPHCM', '0912000012', 'ly.thi.mai@gmail.com', 'b2c.lead@company.com', 'Active', '2018-06-20', 'D010', 'P004', 'E004', '1234567891', 'VPBank', 'CN Q6'),

-- Backend Team (D005)
('E013', 'Phan Văn Nam', '1992-03-10', 'Male', '999 Lạc Long Quân, TB, TPHCM', '0913000013', 'phan.van.nam@gmail.com', 'backend.dev1@company.com', 'Active', '2019-01-15', 'D005', 'P005', 'E005', '1334567890', 'Vietcombank', 'CN Tân Bình'),
('E014', 'Quách Thị Oanh', '1993-06-25', 'Female', '100 Nguyễn Thị Minh Khai, Q1, TPHCM', '0914000014', 'quach.thi.oanh@gmail.com', 'backend.dev2@company.com', 'Active', '2019-07-01', 'D005', 'P006', 'E005', '1434567890', 'Techcombank', 'CN Q1'),
('E015', 'Vũ Văn Phong', '1994-09-14', 'Male', '200 Võ Văn Tần, Q3, TPHCM', '0915000015', 'vu.van.phong@gmail.com', 'backend.dev3@company.com', 'Active', '2020-02-10', 'D005', 'P007', 'E005', '1534567890', 'BIDV', 'CN Q3'),

-- Frontend Team (D006)
('E016', 'Dương Thị Quỳnh', '1993-12-08', 'Female', '300 Hai Bà Trưng, Q1, TPHCM', '0916000016', 'duong.thi.quynh@gmail.com', 'frontend.dev1@company.com', 'Active', '2019-03-20', 'D006', 'P005', 'E006', '1634567890', 'ACB', 'CN Q1'),
('E017', 'Huỳnh Văn Rất', '1994-02-19', 'Male', '400 Nguyễn Đình Chiểu, Q3, TPHCM', '0917000017', 'huynh.van.rat@gmail.com', 'frontend.dev2@company.com', 'Active', '2019-08-15', 'D006', 'P006', 'E006', '1734567890', 'Vietinbank', 'CN Q3'),
('E018', 'Mai Thị Sen', '1995-05-30', 'Female', '500 Trần Hưng Đạo, Q5, TPHCM', '0918000018', 'mai.thi.sen@gmail.com', 'frontend.dev3@company.com', 'Active', '2020-06-01', 'D006', 'P007', 'E006', '1834567890', 'Sacombank', 'CN Q5'),

-- Mobile Team (D007)
('E019', 'Cao Văn Tâm', '1994-08-16', 'Male', '600 Nguyễn Trãi, Q5, TPHCM', '0919000019', 'cao.van.tam@gmail.com', 'mobile.dev1@company.com', 'Active', '2020-01-10', 'D007', 'P005', 'E007', '1934567890', 'MB Bank', 'CN Q5'),
('E020', 'Tô Thị Uyên', '1995-11-22', 'Female', '700 Lý Tự Trọng, Q1, TPHCM', '0920000020', 'to.thi.uyen@gmail.com', 'mobile.dev2@company.com', 'Active', '2020-07-20', 'D007', 'P006', 'E007', '2034567890', 'VPBank', 'CN Q1'),

-- DevOps Team (D008)
('E021', 'Lâm Văn Việt', '1993-04-05', 'Male', '800 Đinh Tiên Hoàng, Q1, TPHCM', '0921000021', 'lam.van.viet@gmail.com', 'devops.engineer1@company.com', 'Active', '2019-09-01', 'D008', 'P005', 'E008', '2134567890', 'Vietcombank', 'CN Q1'),
('E022', 'Thái Thị Xuân', '1994-07-18', 'Female', '900 Yersin, Q1, TPHCM', '0922000022', 'thai.thi.xuan@gmail.com', 'devops.engineer2@company.com', 'Active', '2020-03-15', 'D008', 'P006', 'E008', '2234567891', 'Techcombank', 'CN Q1'),

-- B2B Sales Team (D009)
('E023', 'Trịnh Văn Yên', '1992-10-28', 'Male', '1000 Nam Kỳ Khởi Nghĩa, Q3, TPHCM', '0923000023', 'trinh.van.yen@gmail.com', 'b2b.sales1@company.com', 'Active', '2018-11-01', 'D009', 'P006', 'E011', '2334567890', 'BIDV', 'CN Q3'),
('E024', 'Nguyễn Thị Ánh', '1993-01-09', 'Female', '1100 Võ Thị Sáu, Q3, TPHCM', '0924000024', 'nguyen.thi.anh@gmail.com', 'b2b.sales2@company.com', 'Active', '2019-04-10', 'D009', 'P006', 'E011', '2434567890', 'ACB', 'CN Q3'),

-- B2C Sales Team (D010)
('E025', 'Phạm Văn Bảo', '1994-03-20', 'Male', '1200 Cống Quỳnh, Q1, TPHCM', '0925000025', 'pham.van.bao@gmail.com', 'b2c.sales1@company.com', 'Active', '2019-10-15', 'D010', 'P006', 'E012', '2534567890', 'Vietinbank', 'CN Q1'),
('E026', 'Hoàng Thị Châu', '1995-06-12', 'Female', '1300 Bùi Viện, Q1, TPHCM', '0926000026', 'hoang.thi.chau@gmail.com', 'b2c.sales2@company.com', 'Active', '2020-05-20', 'D010', 'P006', 'E012', '2634567890', 'Sacombank', 'CN Q1'),

-- Interns (các phòng khác nhau)
('E027', 'Lê Văn Đạt', '1999-02-15', 'Male', '1400 Đề Thám, Q1, TPHCM', '0927000027', 'le.van.dat@gmail.com', 'intern.backend@company.com', 'Active', '2024-09-01', 'D005', 'P008', 'E005', '2734567890', 'MB Bank', 'CN Q1'),
('E028', 'Trần Thị Diệp', '1999-08-20', 'Female', '1500 Nguyễn Thái Bình, Q1, TPHCM', '0928000028', 'tran.thi.diep@gmail.com', 'intern.frontend@company.com', 'Active', '2024-09-01', 'D006', 'P008', 'E006', '2834567890', 'VPBank', 'CN Q1'),
('E029', 'Võ Văn Phúc', '2000-04-10', 'Male', '1600 Lê Thánh Tôn, Q1, TPHCM', '0929000029', 'vo.van.phuc@gmail.com', 'intern.hr@company.com', 'Active', '2024-09-15', 'D003', 'P008', 'E003', '2934567890', 'Vietcombank', 'CN Q1'),
('E030', 'Đỗ Thị Mai', '2000-07-25', 'Female', '1700 Ký Con, Q1, TPHCM', '0930000030', 'do.thi.mai@gmail.com', 'intern.sales@company.com', 'Active', '2024-09-15', 'D010', 'P008', 'E012', '3034567890', 'Techcombank', 'CN Q1');

-- Cập nhật manager cho các department còn lại
UPDATE DEPARTMENT SET manager_id = 'E005' WHERE department_id = 'D005';
UPDATE DEPARTMENT SET manager_id = 'E006' WHERE department_id = 'D006';
UPDATE DEPARTMENT SET manager_id = 'E007' WHERE department_id = 'D007';
UPDATE DEPARTMENT SET manager_id = 'E008' WHERE department_id = 'D008';
UPDATE DEPARTMENT SET manager_id = 'E011' WHERE department_id = 'D009';
UPDATE DEPARTMENT SET manager_id = 'E012' WHERE department_id = 'D010';

-- ======================================================================
-- 2. USER ACCOUNTS (Tài khoản)
-- ======================================================================
-- Password: admin123 (đã hash bằng bcrypt)
-- Để test, các bạn cần hash password thật, đây chỉ là ví dụ
INSERT INTO USER_ACCOUNT (employee_id, username, password_hash, role, status) VALUES
-- Admin
('E001', 'admin', '$2a$10$YourHashedPasswordHere001', 'Admin', 'Active'),

-- Directors
('E002', 'tech_director', '$2a$10$YourHashedPasswordHere002', 'Manager', 'Active'),
('E003', 'hr_director', '$2a$10$YourHashedPasswordHere003', 'Manager', 'Active'),
('E004', 'sales_director', '$2a$10$YourHashedPasswordHere004', 'Manager', 'Active'),

-- Team Leads
('E005', 'backend_lead', '$2a$10$YourHashedPasswordHere005', 'Manager', 'Active'),
('E006', 'frontend_lead', '$2a$10$YourHashedPasswordHere006', 'Manager', 'Active'),
('E007', 'mobile_lead', '$2a$10$YourHashedPasswordHere007', 'Manager', 'Active'),
('E008', 'devops_lead', '$2a$10$YourHashedPasswordHere008', 'Manager', 'Active'),
('E011', 'b2b_lead', '$2a$10$YourHashedPasswordHere011', 'Manager', 'Active'),
('E012', 'b2c_lead', '$2a$10$YourHashedPasswordHere012', 'Manager', 'Active'),

-- HR Staff
('E009', 'hr_recruitment', '$2a$10$YourHashedPasswordHere009', 'HR', 'Active'),
('E010', 'hr_training', '$2a$10$YourHashedPasswordHere010', 'HR', 'Active'),

-- Employees
('E013', 'backend_dev1', '$2a$10$YourHashedPasswordHere013', 'Employee', 'Active'),
('E014', 'backend_dev2', '$2a$10$YourHashedPasswordHere014', 'Employee', 'Active'),
('E015', 'backend_dev3', '$2a$10$YourHashedPasswordHere015', 'Employee', 'Active'),
('E016', 'frontend_dev1', '$2a$10$YourHashedPasswordHere016', 'Employee', 'Active'),
('E017', 'frontend_dev2', '$2a$10$YourHashedPasswordHere017', 'Employee', 'Active'),
('E018', 'frontend_dev3', '$2a$10$YourHashedPasswordHere018', 'Employee', 'Active'),
('E019', 'mobile_dev1', '$2a$10$YourHashedPasswordHere019', 'Employee', 'Active'),
('E020', 'mobile_dev2', '$2a$10$YourHashedPasswordHere020', 'Employee', 'Active'),
('E021', 'devops_eng1', '$2a$10$YourHashedPasswordHere021', 'Employee', 'Active'),
('E022', 'devops_eng2', '$2a$10$YourHashedPasswordHere022', 'Employee', 'Active'),
('E023', 'b2b_sales1', '$2a$10$YourHashedPasswordHere023', 'Employee', 'Active'),
('E024', 'b2b_sales2', '$2a$10$YourHashedPasswordHere024', 'Employee', 'Active'),
('E025', 'b2c_sales1', '$2a$10$YourHashedPasswordHere025', 'Employee', 'Active'),
('E026', 'b2c_sales2', '$2a$10$YourHashedPasswordHere026', 'Employee', 'Active'),

-- Interns
('E027', 'intern_backend', '$2a$10$YourHashedPasswordHere027', 'Employee', 'Active'),
('E028', 'intern_frontend', '$2a$10$YourHashedPasswordHere028', 'Employee', 'Active'),
('E029', 'intern_hr', '$2a$10$YourHashedPasswordHere029', 'Employee', 'Active'),
('E030', 'intern_sales', '$2a$10$YourHashedPasswordHere030', 'Employee', 'Active');

-- ======================================================================
-- 3. CONTRACTS (Hợp đồng)
-- ======================================================================
INSERT INTO CONTRACT (employee_id, signing_date, contract_type, start_date, end_date) VALUES
-- Leadership - Vô thời hạn
('E001', '2010-01-01', 'Vô thời hạn', '2010-01-01', NULL),
('E002', '2012-03-15', 'Vô thời hạn', '2012-03-15', NULL),
('E003', '2013-05-20', 'Vô thời hạn', '2013-05-20', NULL),
('E004', '2014-07-10', 'Vô thời hạn', '2014-07-10', NULL),

-- Team Leads - Vô thời hạn
('E005', '2015-01-10', 'Vô thời hạn', '2015-01-10', NULL),
('E006', '2015-06-15', 'Vô thời hạn', '2015-06-15', NULL),
('E007', '2016-02-20', 'Vô thời hạn', '2016-02-20', NULL),
('E008', '2016-08-05', 'Vô thời hạn', '2016-08-05', NULL),
('E011', '2018-01-10', 'Vô thời hạn', '2018-01-10', NULL),
('E012', '2018-06-20', 'Vô thời hạn', '2018-06-20', NULL),

-- HR Staff - Vô thời hạn
('E009', '2017-03-15', 'Vô thời hạn', '2017-03-15', NULL),
('E010', '2017-09-01', 'Vô thời hạn', '2017-09-01', NULL),

-- Senior Staff - Vô thời hạn
('E013', '2019-01-15', 'Vô thời hạn', '2019-01-15', NULL),
('E016', '2019-03-20', 'Vô thời hạn', '2019-03-20', NULL),
('E019', '2020-01-10', 'Vô thời hạn', '2020-01-10', NULL),
('E021', '2019-09-01', 'Vô thời hạn', '2019-09-01', NULL),

-- Regular Staff - 2 năm
('E014', '2019-07-01', 'Có thời hạn 2 năm', '2019-07-01', '2021-06-30'),
('E014', '2021-07-01', 'Có thời hạn 2 năm', '2021-07-01', '2023-06-30'),
('E014', '2023-07-01', 'Vô thời hạn', '2023-07-01', NULL),

('E015', '2020-02-10', 'Có thời hạn 2 năm', '2020-02-10', '2022-02-09'),
('E015', '2022-02-10', 'Có thời hạn 2 năm', '2022-02-10', '2024-02-09'),
('E015', '2024-02-10', 'Có thời hạn 2 năm', '2024-02-10', '2026-02-09'),

('E017', '2019-08-15', 'Có thời hạn 2 năm', '2019-08-15', '2021-08-14'),
('E017', '2021-08-15', 'Vô thời hạn', '2021-08-15', NULL),

('E018', '2020-06-01', 'Có thời hạn 2 năm', '2020-06-01', '2022-05-31'),
('E018', '2022-06-01', 'Có thời hạn 2 năm', '2022-06-01', '2024-05-31'),
('E018', '2024-06-01', 'Có thời hạn 2 năm', '2024-06-01', '2026-05-31'),

('E020', '2020-07-20', 'Có thời hạn 2 năm', '2020-07-20', '2022-07-19'),
('E020', '2022-07-20', 'Có thời hạn 2 năm', '2022-07-20', '2024-07-19'),
('E020', '2024-07-20', 'Có thời hạn 2 năm', '2024-07-20', '2026-07-19'),

('E022', '2020-03-15', 'Có thời hạn 2 năm', '2020-03-15', '2022-03-14'),
('E022', '2022-03-15', 'Có thời hạn 2 năm', '2022-03-15', '2024-03-14'),
('E022', '2024-03-15', 'Có thời hạn 2 năm', '2024-03-15', '2026-03-14'),

-- Sales Team
('E023', '2018-11-01', 'Có thời hạn 2 năm', '2018-11-01', '2020-10-31'),
('E023', '2020-11-01', 'Vô thời hạn', '2020-11-01', NULL),

('E024', '2019-04-10', 'Có thời hạn 2 năm', '2019-04-10', '2021-04-09'),
('E024', '2021-04-10', 'Có thời hạn 2 năm', '2021-04-10', '2023-04-09'),
('E024', '2023-04-10', 'Vô thời hạn', '2023-04-10', NULL),

('E025', '2019-10-15', 'Có thời hạn 2 năm', '2019-10-15', '2021-10-14'),
('E025', '2021-10-15', 'Có thời hạn 2 năm', '2021-10-15', '2023-10-14'),
('E025', '2023-10-15', 'Có thời hạn 2 năm', '2023-10-15', '2025-10-14'),

('E026', '2020-05-20', 'Có thời hạn 2 năm', '2020-05-20', '2022-05-19'),
('E026', '2022-05-20', 'Có thời hạn 2 năm', '2022-05-20', '2024-05-19'),
('E026', '2024-05-20', 'Có thời hạn 2 năm', '2024-05-20', '2026-05-19'),

-- Interns - 6 tháng
('E027', '2024-09-01', 'Thực tập 6 tháng', '2024-09-01', '2025-02-28'),
('E028', '2024-09-01', 'Thực tập 6 tháng', '2024-09-01', '2025-02-28'),
('E029', '2024-09-15', 'Thực tập 6 tháng', '2024-09-15', '2025-03-14'),
('E030', '2024-09-15', 'Thực tập 6 tháng', '2024-09-15', '2025-03-14');

-- ======================================================================
-- 4. RAW ATTENDANCE LOG (Log chấm công thô)
-- ======================================================================
INSERT INTO RAW_ATTENDANCE_LOG (employee_code, log_time, source) VALUES
-- E013 (Backend Dev) - tuần này
('E013', '2025-11-24 07:55:00', 'Fingerprint'),
('E013', '2025-11-24 17:10:00', 'Fingerprint'),
('E013', '2025-11-25 08:02:00', 'Fingerprint'),
('E013', '2025-11-25 12:00:00', 'Fingerprint'),
('E013', '2025-11-25 13:00:00', 'Fingerprint'),

-- E014 (Backend Dev) - tuần này
('E014', '2025-11-24 08:10:00', 'Face Recognition'),
('E014', '2025-11-24 17:05:00', 'Face Recognition'),
('E014', '2025-11-25 08:05:00', 'Face Recognition'),

-- E016 (Frontend Dev) - tuần này
('E016', '2025-11-24 08:00:00', 'Fingerprint'),
('E016', '2025-11-24 17:15:00', 'Fingerprint'),
('E016', '2025-11-25 07:58:00', 'Fingerprint'),

-- E019 (Mobile Dev) - tuần này
('E019', '2025-11-24 08:05:00', 'Face Recognition'),
('E019', '2025-11-24 17:00:00', 'Face Recognition'),
('E019', '2025-11-25 08:00:00', 'Face Recognition'),

-- E023 (B2B Sales) - tuần này
('E023', '2025-11-24 08:15:00', 'Fingerprint'),
('E023', '2025-11-24 17:20:00', 'Fingerprint'),
('E023', '2025-11-25 08:12:00', 'Fingerprint');

-- ======================================================================
-- 5. DAILY TIMESHEET (Bảng chấm công hàng ngày)
-- ======================================================================
INSERT INTO DAILY_TIMESHEET (employee_id, work_date, shift_id, check_in_time, check_out_time, minutes_late, minutes_early, notes, adjusted_by_employee_id) VALUES
-- Tuần trước (2025-11-18 đến 2025-11-22)
-- E013
('E013', '2025-11-18', 'S001', '07:55:00', '17:10:00', 0, 0, 'Đúng giờ', NULL),
('E013', '2025-11-19', 'S001', '08:05:00', '17:05:00', 5, 0, 'Đi muộn 5 phút', NULL),
('E013', '2025-11-20', 'S001', '08:00:00', '17:00:00', 0, 0, 'Đúng giờ', NULL),
('E013', '2025-11-21', 'S001', '07:58:00', '17:15:00', 0, 0, 'Đúng giờ', NULL),
('E013', '2025-11-22', 'S001', '08:02:00', '17:05:00', 2, 0, 'Đi muộn 2 phút', NULL),

-- E014
('E014', '2025-11-18', 'S001', '08:10:00', '17:00:00', 10, 0, 'Đi muộn 10 phút', NULL),
('E014', '2025-11-19', 'S001', '08:15:00', '17:05:00', 15, 0, 'Đi muộn 15 phút', NULL),
('E014', '2025-11-20', 'S001', '08:05:00', '17:00:00', 5, 0, 'Đi muộn 5 phút', NULL),
('E014', '2025-11-21', 'S001', '08:00:00', '17:10:00', 0, 0, 'Đúng giờ', NULL),
('E014', '2025-11-22', 'S001', '08:08:00', '17:05:00', 8, 0, 'Đi muộn 8 phút', NULL),

-- E016
('E016', '2025-11-18', 'S001', '08:00:00', '17:00:00', 0, 0, 'Đúng giờ', NULL),
('E016', '2025-11-19', 'S001', '07:58:00', '17:15:00', 0, 0, 'Đúng giờ', NULL),
('E016', '2025-11-20', 'S001', '08:02:00', '17:05:00', 2, 0, 'Đi muộn 2 phút', NULL),
('E016', '2025-11-21', 'S001', '08:00:00', '17:00:00', 0, 0, 'Đúng giờ', NULL),
('E016', '2025-11-22', 'S001', '08:01:00', '17:10:00', 1, 0, 'Đi muộn 1 phút', NULL),

-- E019
('E019', '2025-11-18', 'S001', '08:05:00', '17:05:00', 5, 0, 'Đi muộn 5 phút', NULL),
('E019', '2025-11-19', 'S001', '08:00:00', '17:00:00', 0, 0, 'Đúng giờ', NULL),
('E019', '2025-11-20', 'S001', '08:03:00', '17:10:00', 3, 0, 'Đi muộn 3 phút', NULL),
('E019', '2025-11-21', 'S001', '08:00:00', '17:05:00', 0, 0, 'Đúng giờ', NULL),
('E019', '2025-11-22', 'S001', '08:02:00', '17:00:00', 2, 0, 'Đi muộn 2 phút', NULL),

-- E023
('E023', '2025-11-18', 'S001', '08:15:00', '17:20:00', 15, 0, 'Đi muộn 15 phút, về muộn', NULL),
('E023', '2025-11-19', 'S001', '08:12:00', '17:15:00', 12, 0, 'Đi muộn 12 phút', NULL),
('E023', '2025-11-20', 'S001', '08:10:00', '17:10:00', 10, 0, 'Đi muộn 10 phút', NULL),
('E023', '2025-11-21', 'S001', '08:05:00', '17:05:00', 5, 0, 'Đi muộn 5 phút', NULL),
('E023', '2025-11-22', 'S001', '08:08:00', '17:00:00', 8, 0, 'Đi muộn 8 phút', NULL),

-- Tuần này (partial - đã có trong RAW_ATTENDANCE_LOG)
('E013', '2025-11-24', 'S001', '07:55:00', '17:10:00', 0, 0, 'Đúng giờ', NULL),
('E014', '2025-11-24', 'S001', '08:10:00', '17:05:00', 10, 0, 'Đi muộn 10 phút', NULL),
('E016', '2025-11-24', 'S001', '08:00:00', '17:15:00', 0, 0, 'Đúng giờ', NULL),
('E019', '2025-11-24', 'S001', '08:05:00', '17:00:00', 5, 0, 'Đi muộn 5 phút', NULL),
('E023', '2025-11-24', 'S001', '08:15:00', '17:20:00', 15, 0, 'Đi muộn 15 phút', NULL),

-- Hôm nay (2025-11-25) - Chưa check-in
('E016', '2025-11-25', 'S001', NULL, NULL, 0, 0, 'Chưa check-in', NULL);

-- ======================================================================
-- 6. LEAVE REQUESTS (Đơn xin nghỉ phép)
-- ======================================================================
INSERT INTO LEAVE_REQUEST (employee_id, created_date, leave_type, start_date, end_date, reason, status, approver_id, approved_date, rejection_reason) VALUES
-- Approved requests
('E013', '2025-11-10 09:00:00', 'Nghỉ phép năm', '2025-12-01', '2025-12-03', 'Về quê nghỉ lễ', 'Approved', 'E005', '2025-11-10 14:30:00', NULL),
('E014', '2025-11-12 10:30:00', 'Nghỉ ốm', '2025-11-14', '2025-11-14', 'Đau răng, đi nha khoa', 'Approved', 'E005', '2025-11-12 15:00:00', NULL),
('E016', '2025-11-15 08:45:00', 'Nghỉ phép năm', '2025-12-10', '2025-12-12', 'Du lịch gia đình', 'Approved', 'E006', '2025-11-15 16:00:00', NULL),
('E019', '2025-11-08 14:00:00', 'Nghỉ việc riêng', '2025-11-20', '2025-11-20', 'Giải quyết công việc cá nhân', 'Approved', 'E007', '2025-11-08 16:30:00', NULL),

-- Pending requests
('E023', '2025-11-23 09:15:00', 'Nghỉ phép năm', '2025-12-15', '2025-12-17', 'Nghỉ lễ cuối năm', 'Pending', NULL, NULL, NULL),
('E024', '2025-11-24 10:00:00', 'Nghỉ ốm', '2025-11-26', '2025-11-27', 'Bị cảm nặng', 'Pending', NULL, NULL, NULL),
('E015', '2025-11-25 08:30:00', 'Nghỉ phép năm', '2025-12-20', '2025-12-22', 'Nghỉ Giáng sinh', 'Pending', NULL, NULL, NULL),

-- Rejected request
('E017', '2025-11-18 11:00:00', 'Nghỉ phép năm', '2025-11-22', '2025-11-25', 'Du lịch cá nhân', 'Rejected', 'E006', '2025-11-18 15:00:00', 'Dự án đang gấp, không thể nghỉ lúc này'),

-- Auto-approved (HR)
('E009', '2025-11-05 09:00:00', 'Nghỉ phép năm', '2025-11-30', '2025-12-02', 'Nghỉ lễ', 'Auto-approved', NULL, '2025-11-05 09:00:00', NULL);

-- ======================================================================
-- 7. OVERTIME REQUESTS (Đơn xin làm thêm giờ)
-- ======================================================================
INSERT INTO OVERTIME_REQUEST (employee_id, created_date, ot_date, start_time, end_time, total_hours, reason, status, approver_id) VALUES
-- Approved OT
('E013', '2025-11-20 16:00:00', '2025-11-21', '17:00:00', '20:00:00', 3.0, 'Hoàn thành tính năng API mới', 'Approved', 'E005'),
('E013', '2025-11-22 16:30:00', '2025-11-23', '17:00:00', '19:30:00', 2.5, 'Fix bugs critical', 'Approved', 'E005'),

('E014', '2025-11-19 15:45:00', '2025-11-20', '17:00:00', '21:00:00', 4.0, 'Deploy hệ thống mới', 'Approved', 'E005'),

('E016', '2025-11-21 16:15:00', '2025-11-22', '17:00:00', '19:00:00', 2.0, 'Hoàn thiện giao diện dashboard', 'Approved', 'E006'),
('E016', '2025-11-23 16:00:00', '2025-11-24', '17:00:00', '20:30:00', 3.5, 'Responsive design cho mobile', 'Approved', 'E006'),

('E019', '2025-11-18 15:30:00', '2025-11-19', '17:00:00', '19:30:00', 2.5, 'Test và fix bugs mobile app', 'Approved', 'E007'),

-- Pending OT
('E023', '2025-11-24 16:00:00', '2025-11-25', '17:00:00', '20:00:00', 3.0, 'Chuẩn bị presentation cho khách hàng', 'Pending', NULL),
('E021', '2025-11-25 15:00:00', '2025-11-26', '17:00:00', '22:00:00', 5.0, 'Bảo trì hệ thống server', 'Pending', NULL),

-- Rejected OT
('E015', '2025-11-17 16:30:00', '2025-11-18', '17:00:00', '21:00:00', 4.0, 'Làm task cá nhân', 'Rejected', 'E005');

-- ======================================================================
-- KẾT THÚC SEED DATA
-- ======================================================================

-- Verify data
SELECT 'POSITIONS' as Table_Name, COUNT(*) as Record_Count FROM POSITION
UNION ALL
SELECT 'DEPARTMENTS', COUNT(*) FROM DEPARTMENT
UNION ALL
SELECT 'EMPLOYEES', COUNT(*) FROM EMPLOYEE
UNION ALL
SELECT 'USER_ACCOUNTS', COUNT(*) FROM USER_ACCOUNT
UNION ALL
SELECT 'WORK_SHIFTS', COUNT(*) FROM WORK_SHIFT
UNION ALL
SELECT 'CONTRACTS', COUNT(*) FROM CONTRACT
UNION ALL
SELECT 'RAW_ATTENDANCE_LOG', COUNT(*) FROM RAW_ATTENDANCE_LOG
UNION ALL
SELECT 'DAILY_TIMESHEET', COUNT(*) FROM DAILY_TIMESHEET
UNION ALL
SELECT 'LEAVE_REQUEST', COUNT(*) FROM LEAVE_REQUEST
UNION ALL
SELECT 'OVERTIME_REQUEST', COUNT(*) FROM OVERTIME_REQUEST;