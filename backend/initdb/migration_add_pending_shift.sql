-- Migration: Add Simplified Version Control for Work Shifts
-- Date: 2025-11-24
-- Description: Add pending shift fields to support scheduled shift updates

-- Add pending shift fields to WORK_SHIFT table
ALTER TABLE WORK_SHIFT
ADD COLUMN pending_shift_name VARCHAR(255) NULL COMMENT 'Tên ca sẽ có hiệu lực',
ADD COLUMN pending_start_time TIME NULL COMMENT 'Giờ bắt đầu ca pending',
ADD COLUMN pending_end_time TIME NULL COMMENT 'Giờ kết thúc ca pending',
ADD COLUMN pending_max_late_time TIME NULL COMMENT 'Giờ muộn nhất cho phép của ca pending',
ADD COLUMN pending_effective_date DATE NULL COMMENT 'Ngày bắt đầu hiệu lực',
ADD COLUMN pending_updated_by VARCHAR(255) NULL COMMENT 'Employee ID của người schedule update',
ADD COLUMN pending_updated_at DATETIME NULL COMMENT 'Thời gian schedule update';

-- Add foreign key for pending_updated_by
ALTER TABLE WORK_SHIFT
ADD CONSTRAINT fk_work_shift_pending_updated_by
FOREIGN KEY (pending_updated_by) REFERENCES EMPLOYEE(employee_id)
ON DELETE SET NULL;

-- Add index for efficient queries
CREATE INDEX idx_pending_effective_date ON WORK_SHIFT(pending_effective_date);

-- Verify structure
SELECT 
  TABLE_NAME,
  COLUMN_NAME,
  COLUMN_TYPE,
  IS_NULLABLE,
  COLUMN_COMMENT
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_SCHEMA = 'cham_cong_db'
  AND TABLE_NAME = 'WORK_SHIFT'
  AND COLUMN_NAME LIKE 'pending%'
ORDER BY ORDINAL_POSITION;
