-- Migration: Make department_id NOT NULL in WORK_SHIFT table
-- This ensures every work shift must be assigned to a specific department

USE Attendance_System_Final;

-- First, update any existing NULL values to a default department (if needed)
-- Check for NULL values first
SELECT COUNT(*) as null_count FROM WORK_SHIFT WHERE department_id IS NULL;

-- If you want to delete shifts with NULL department_id:
-- DELETE FROM WORK_SHIFT WHERE department_id IS NULL;

-- Or assign them to a default department:
-- UPDATE WORK_SHIFT SET department_id = 'DEFAULT_DEPT' WHERE department_id IS NULL;

-- Then modify the column to be NOT NULL
ALTER TABLE WORK_SHIFT 
MODIFY COLUMN department_id VARCHAR(255) NOT NULL;

-- Verify the change
DESCRIBE WORK_SHIFT;
