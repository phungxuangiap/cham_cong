-- ======================================================================
-- DỮ LIỆU MẪU (SEED DATA)
-- Chú ý: Đảm bảo các bảng đã được tạo thành công trước khi chạy file này.
-- ======================================================================

USE Attendance_System_Final;

-- 1. Bảng Tĩnh

-- 1.1. POSITION
INSERT INTO POSITION (position_id, position_name, description) VALUES
('P001', 'CEO', 'Chief Executive Officer'),
('P002', 'Director', 'Trưởng phòng cấp cao'),
('P003', 'Manager', 'Quản lý phòng ban/nhóm'),
('P004', 'TeamLead', 'Trưởng nhóm kỹ thuật/chức năng'),
('P005', 'Staff', 'Nhân viên'),
('P006', 'Intern', 'Thực tập sinh');

-- 1.2. WORK_SHIFT
INSERT INTO WORK_SHIFT (shift_id, shift_name, start_time, end_time, max_late_time) VALUES
('S001', 'Hành chính', '08:00:00', '17:00:00', '08:15:00'),
('S002', 'Ca Sáng', '06:00:00', '14:00:00', '06:15:00'),
('S003', 'Ca Chiều', '14:00:00', '22:00:00', '14:15:00'),
('S004', 'Ca Đêm', '22:00:00', '06:00:00', '22:15:00');


-- 2. Dữ liệu Cấu trúc Tổ chức và Nhân viên

-- 2.1. Chèn CEO/Director/Manager trước
INSERT INTO EMPLOYEE (employee_id, full_name, date_of_birth, gender, address, phone_number, personal_email, company_email, status, join_date, department_id, position_id, manager_id) VALUES
-- E001 (CEO, Tự tham chiếu NULL)
('E001', 'Nguyễn Văn A', '1980-01-01', 'Male', 'HN', '0901000001', 'nva@personal.com', 'nva@company.com', 'Active', '2010-01-01', NULL, 'P001', NULL),
-- E002 (Director Kỹ thuật, Manager: E001)
('E002', 'Trần Thị B', '1985-05-15', 'Female', 'HCM', '0902000002', 'ttb@personal.com', 'ttb@company.com', 'Active', '2015-06-01', NULL, 'P002', 'E001'),
-- E003 (Manager Nhân sự, Manager: E001)
('E003', 'Lê Văn C', '1990-10-20', 'Male', 'HCM', '0903000003', 'lvc@personal.com', 'lvc@company.com', 'Active', '2018-03-10', NULL, 'P003', 'E001'),
-- E004 (Staff Kỹ thuật, Manager: E002)
('E004', 'Phạm Thị D', '1995-03-25', 'Female', 'HCM', '0904000004', 'ptd@personal.com', 'ptd@company.com', 'Active', '2020-09-01', NULL, 'P005', 'E002');


-- 2.2. DEPARTMENT
INSERT INTO DEPARTMENT (department_id, department_name, description, parent_department_id, manager_id) VALUES
('D001', 'Ban Lãnh Đạo', 'Quản lý cấp cao của công ty', NULL, 'E001'),
('D002', 'Phòng Kỹ Thuật', 'Phát triển và duy trì hệ thống', 'D001', 'E002'),
('D003', 'Phòng Nhân sự', 'Quản lý nhân sự và hành chính', 'D001', 'E003');


-- 2.3. Cập nhật department_id cho các EMPLOYEE
UPDATE EMPLOYEE SET department_id = 'D001' WHERE employee_id = 'E001';
UPDATE EMPLOYEE SET department_id = 'D002' WHERE employee_id = 'E002';
UPDATE EMPLOYEE SET department_id = 'D003' WHERE employee_id = 'E003';
UPDATE EMPLOYEE SET department_id = 'D002' WHERE employee_id = 'E004';


-- 3. Dữ liệu Giao dịch/Log

-- 3.1. USER_ACCOUNT
INSERT INTO USER_ACCOUNT (employee_id, username, password_hash, role, status) VALUES
('E001', 'admin', 'hashed_pass_001', 'Admin', 'Active'),
('E002', 'ttb_dir', 'hashed_pass_002', 'Manager', 'Active'),
('E003', 'lvc_hr', 'hashed_pass_003', 'Manager', 'Active'),
('E004', 'ptd_staff', 'hashed_pass_004', 'Employee', 'Active');


-- 3.2. RAW_ATTENDANCE_LOG
INSERT INTO RAW_ATTENDANCE_LOG (employee_code, log_time, source) VALUES
-- E004, ca S001 (08:00 - 17:00)
('E004', '2025-11-19 07:55:00', 'Fingerprint Scanner'),
('E004', '2025-11-19 17:05:00', 'Fingerprint Scanner');

-- 3.3. DAILY_TIMESHEET
INSERT INTO DAILY_TIMESHEET (employee_id, work_date, shift_id, check_in_time, check_out_time, minutes_late, minutes_early, notes, adjusted_by_employee_id) VALUES
('E004', '2025-11-19', 'S001', '07:55:00', '17:05:00', 0, 0, 'Chấm công bình thường', NULL);


-- 4. Dữ liệu Yêu cầu

-- 4.1. LEAVE_REQUEST
INSERT INTO LEAVE_REQUEST (employee_id, created_date, leave_type, start_date, end_date, reason, status, approver_id, approved_date) VALUES
-- E004 xin nghỉ, E002 duyệt
('E004', '2025-11-18 10:00:00', 'Nghỉ ốm', '2025-12-05', '2025-12-05', 'Bị cảm nhẹ', 'Approved', 'E002', '2025-11-18 11:30:00');

-- 4.2. OVERTIME_REQUEST
INSERT INTO OVERTIME_REQUEST (employee_id, created_date, ot_date, start_time, end_time, total_hours, reason, status, approver_id) VALUES
-- E004 xin tăng ca, E002 duyệt
('E004', '2025-11-17 14:00:00', '2025-11-20', '17:00:00', '19:30:00', 2.50, 'Hoàn thành module XYZ', 'Approved', 'E002');