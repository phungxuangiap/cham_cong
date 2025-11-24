-- Migration: Create Leave Request System
-- Date: 2025-11-24
-- Description: Create table for employee leave requests

-- Create LEAVE_REQUEST table
CREATE TABLE IF NOT EXISTS LEAVE_REQUEST (
  request_id VARCHAR(255) PRIMARY KEY,
  employee_id VARCHAR(255) NOT NULL,
  leave_type ENUM('annual', 'sick', 'personal', 'unpaid', 'other') NOT NULL COMMENT 'Loại nghỉ phép',
  start_date DATE NOT NULL COMMENT 'Ngày bắt đầu nghỉ',
  end_date DATE NOT NULL COMMENT 'Ngày kết thúc nghỉ',
  total_days DECIMAL(4,1) NOT NULL COMMENT 'Tổng số ngày nghỉ',
  reason TEXT NULL COMMENT 'Lý do nghỉ phép',
  status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending' COMMENT 'Trạng thái',
  approved_by VARCHAR(255) NULL COMMENT 'Người phê duyệt',
  approved_at DATETIME NULL COMMENT 'Thời gian phê duyệt',
  reject_reason TEXT NULL COMMENT 'Lý do từ chối',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  CONSTRAINT fk_leave_request_employee
    FOREIGN KEY (employee_id) REFERENCES EMPLOYEE(employee_id)
    ON DELETE CASCADE,
    
  CONSTRAINT fk_leave_request_approved_by
    FOREIGN KEY (approved_by) REFERENCES EMPLOYEE(employee_id)
    ON DELETE SET NULL,
    
  CONSTRAINT chk_leave_dates
    CHECK (end_date >= start_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Bảng quản lý yêu cầu nghỉ phép';

-- Create indexes for better query performance
CREATE INDEX idx_leave_request_employee ON LEAVE_REQUEST(employee_id);
CREATE INDEX idx_leave_request_status ON LEAVE_REQUEST(status);
CREATE INDEX idx_leave_request_dates ON LEAVE_REQUEST(start_date, end_date);
CREATE INDEX idx_leave_request_created ON LEAVE_REQUEST(created_at);

-- Verify table structure
DESCRIBE LEAVE_REQUEST;

SELECT 'Leave Request table created successfully!' as status;
