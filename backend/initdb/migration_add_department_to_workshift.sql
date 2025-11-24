-- Migration: Add department_id to WORK_SHIFT table
-- Date: 2025-11-24

USE Attendance_System_Final;

-- Add department_id column if it doesn't exist
ALTER TABLE WORK_SHIFT 
ADD COLUMN department_id VARCHAR(255) AFTER max_late_time;

-- Add foreign key constraint
ALTER TABLE WORK_SHIFT 
ADD CONSTRAINT fk_workshift_department 
FOREIGN KEY (department_id) 
REFERENCES DEPARTMENT(department_id) 
ON DELETE SET NULL 
ON UPDATE CASCADE;

-- Show current structure
DESCRIBE WORK_SHIFT;
