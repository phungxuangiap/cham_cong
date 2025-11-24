-- ======================================================================
-- SEED DATA: Daily Timesheet for Today
-- Tạo daily timesheet cho hôm nay cho tất cả nhân viên active
-- ======================================================================

USE Attendance_System_Final;

-- 1. Tạo timesheet cho tất cả nhân viên active với work_shift tương ứng department
INSERT INTO DAILY_TIMESHEET (employee_id, work_date, shift_id, check_in_time, check_out_time, minutes_late, minutes_early, notes)
SELECT 
    e.employee_id, 
    CURDATE() as work_date, 
    ws.shift_id, 
    NULL as check_in_time, 
    NULL as check_out_time, 
    0 as minutes_late, 
    0 as minutes_early, 
    'Seed data for today' as notes
FROM EMPLOYEE e
INNER JOIN WORK_SHIFT ws ON e.department_id = ws.department_id
WHERE e.status = 'active'
AND NOT EXISTS (
    SELECT 1 
    FROM DAILY_TIMESHEET dt 
    WHERE dt.employee_id = e.employee_id 
    AND dt.work_date = CURDATE()
);

-- 2. Cập nhật một số nhân viên đã check-in (đi muộn)
UPDATE DAILY_TIMESHEET dt
INNER JOIN (
    SELECT employee_id 
    FROM EMPLOYEE 
    WHERE department_id = 'D003' 
    AND status = 'active'
    LIMIT 3
) e ON dt.employee_id = e.employee_id
SET 
    dt.check_in_time = '08:05:00',
    dt.minutes_late = 5
WHERE dt.work_date = CURDATE();

-- 3. Cập nhật một số nhân viên đã hoàn thành (check-in và check-out)
UPDATE DAILY_TIMESHEET dt
INNER JOIN (
    SELECT employee_id 
    FROM EMPLOYEE 
    WHERE department_id = 'D003' 
    AND status = 'active'
    LIMIT 5 OFFSET 3
) e ON dt.employee_id = e.employee_id
SET 
    dt.check_in_time = '07:55:00',
    dt.check_out_time = '17:10:00',
    dt.minutes_late = 0,
    dt.minutes_early = 0
WHERE dt.work_date = CURDATE();

-- 4. Cập nhật một số nhân viên đi muộn nhiều
UPDATE DAILY_TIMESHEET dt
INNER JOIN (
    SELECT employee_id 
    FROM EMPLOYEE 
    WHERE department_id = 'D003' 
    AND status = 'active'
    LIMIT 3 OFFSET 8
) e ON dt.employee_id = e.employee_id
SET 
    dt.check_in_time = '08:20:00',
    dt.minutes_late = 20
WHERE dt.work_date = CURDATE();

-- 5. Cập nhật department D001 (Ban Lãnh Đạo) - đến đúng giờ và ra đúng giờ
UPDATE DAILY_TIMESHEET dt
INNER JOIN EMPLOYEE e ON dt.employee_id = e.employee_id
SET 
    dt.check_in_time = '08:00:00',
    dt.check_out_time = '17:00:00',
    dt.minutes_late = 0,
    dt.minutes_early = 0
WHERE dt.work_date = CURDATE()
AND e.department_id = 'D001';

-- Kiểm tra kết quả
SELECT 
    COUNT(*) as total_timesheets,
    SUM(CASE WHEN check_in_time IS NOT NULL THEN 1 ELSE 0 END) as checked_in,
    SUM(CASE WHEN check_out_time IS NOT NULL THEN 1 ELSE 0 END) as checked_out,
    SUM(CASE WHEN check_in_time IS NULL THEN 1 ELSE 0 END) as not_checked
FROM DAILY_TIMESHEET
WHERE work_date = CURDATE();
