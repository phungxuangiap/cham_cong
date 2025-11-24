-- Migration: Add UNIQUE constraint to department_id in WORK_SHIFT table
-- This ensures each department can only be assigned to one work shift

USE Attendance_System_Final;

-- First, check if there are any duplicate department_id values (excluding NULL)
SELECT department_id, COUNT(*) as count 
FROM WORK_SHIFT 
WHERE department_id IS NOT NULL 
GROUP BY department_id 
HAVING COUNT(*) > 1;

-- If no duplicates exist, add the UNIQUE constraint
-- Note: NULL values are allowed and don't conflict with UNIQUE constraint
ALTER TABLE WORK_SHIFT 
ADD UNIQUE KEY unique_department_shift (department_id);

-- Verify the constraint was added
SHOW INDEX FROM WORK_SHIFT WHERE Key_name = 'unique_department_shift';
