const connection = require('../config/db.config');

class WorkShiftModel {
  /**
   * Get all work shifts
   * @returns {Promise<Array>}
   */
  static async getAll() {
    try {
      const [rows] = await connection.query(
        `SELECT 
          shift_id, shift_name, start_time, end_time, max_late_time, department_id,
          pending_shift_name, pending_start_time, pending_end_time, 
          pending_max_late_time, pending_effective_date, 
          pending_updated_by, pending_updated_at
         FROM WORK_SHIFT 
         ORDER BY shift_name ASC`
      );
      return rows;
    } catch (error) {
      console.error('Error getting all work shifts:', error);
      throw error;
    }
  }

  /**
   * Get work shift by ID
   * @param {string} shiftId 
   * @returns {Promise<Object|null>}
   */
  static async getById(shiftId) {
    try {
      const [rows] = await connection.query(
        `SELECT 
          shift_id, shift_name, start_time, end_time, max_late_time, department_id,
          pending_shift_name, pending_start_time, pending_end_time, 
          pending_max_late_time, pending_effective_date, 
          pending_updated_by, pending_updated_at
         FROM WORK_SHIFT 
         WHERE shift_id = ?`,
        [shiftId]
      );
      return rows.length > 0 ? rows[0] : null;
    } catch (error) {
      console.error('Error getting work shift by ID:', error);
      throw error;
    }
  }

  /**
   * Get work shifts by department
   * @param {string} departmentId 
   * @returns {Promise<Array>}
   */
  static async getByDepartment(departmentId) {
    try {
      const [rows] = await connection.query(
        `SELECT shift_id, shift_name, start_time, end_time, max_late_time, department_id
         FROM WORK_SHIFT 
         WHERE department_id = ? OR department_id IS NULL
         ORDER BY shift_name ASC`,
        [departmentId]
      );
      return rows;
    } catch (error) {
      console.error('Error getting work shifts by department:', error);
      throw error;
    }
  }

  /**
   * Create new work shift
   * @param {Object} shiftData 
   * @returns {Promise<Object>}
   */
  static async create(shiftData) {
    try {
      const { shiftId, shiftName, startTime, endTime, maxLateTime, departmentId } = shiftData;
      
      await connection.query(
        `INSERT INTO WORK_SHIFT (shift_id, shift_name, start_time, end_time, max_late_time, department_id)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [shiftId, shiftName, startTime, endTime, maxLateTime || null, departmentId]
      );

      return { shiftId, shiftName, startTime, endTime, maxLateTime, departmentId };
    } catch (error) {
      console.error('Error creating work shift:', error);
      throw error;
    }
  }

  /**
   * Update work shift (immediate update)
   * @param {string} shiftId 
   * @param {Object} updateData 
   * @returns {Promise<Object>}
   */
  static async update(shiftId, updateData) {
    try {
      const { shiftName, startTime, endTime, maxLateTime, departmentId } = updateData;
      
      const [result] = await connection.query(
        `UPDATE WORK_SHIFT 
         SET shift_name = ?, start_time = ?, end_time = ?, max_late_time = ?, department_id = ?
         WHERE shift_id = ?`,
        [shiftName, startTime, endTime, maxLateTime || null, departmentId, shiftId]
      );

      if (result.affectedRows === 0) {
        throw new Error('Ca làm việc không tồn tại hoặc không có thay đổi.');
      }

      return { shiftId, shiftName, startTime, endTime, maxLateTime, departmentId };
    } catch (error) {
      console.error('Error updating work shift:', error);
      throw error;
    }
  }

  /**
   * Schedule pending work shift update
   * @param {string} shiftId 
   * @param {Object} updateData 
   * @param {string} updatedBy - Employee ID
   * @returns {Promise<Object>}
   */
  static async schedulePendingUpdate(shiftId, updateData, updatedBy) {
    try {
      const { shiftName, startTime, endTime, maxLateTime, effectiveDate } = updateData;
      const now = new Date();
      
      const [result] = await connection.query(
        `UPDATE WORK_SHIFT 
         SET pending_shift_name = ?,
             pending_start_time = ?,
             pending_end_time = ?,
             pending_max_late_time = ?,
             pending_effective_date = ?,
             pending_updated_by = ?,
             pending_updated_at = ?
         WHERE shift_id = ?`,
        [shiftName, startTime, endTime, maxLateTime || null, effectiveDate, updatedBy, now, shiftId]
      );

      if (result.affectedRows === 0) {
        throw new Error('Ca làm việc không tồn tại.');
      }

      return { 
        shiftId, 
        pendingShiftName: shiftName, 
        pendingStartTime: startTime, 
        pendingEndTime: endTime,
        pendingMaxLateTime: maxLateTime,
        pendingEffectiveDate: effectiveDate,
        message: `Thay đổi sẽ có hiệu lực từ ${effectiveDate}`
      };
    } catch (error) {
      console.error('Error scheduling pending update:', error);
      throw error;
    }
  }

  /**
   * Cancel pending update
   * @param {string} shiftId 
   * @returns {Promise<boolean>}
   */
  static async cancelPendingUpdate(shiftId) {
    try {
      const [result] = await connection.query(
        `UPDATE WORK_SHIFT 
         SET pending_shift_name = NULL,
             pending_start_time = NULL,
             pending_end_time = NULL,
             pending_max_late_time = NULL,
             pending_effective_date = NULL,
             pending_updated_by = NULL,
             pending_updated_at = NULL
         WHERE shift_id = ?`,
        [shiftId]
      );

      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error canceling pending update:', error);
      throw error;
    }
  }

  /**
   * Apply pending updates (called by cron job)
   * @param {string} targetDate - Format: YYYY-MM-DD
   * @returns {Promise<Object>}
   */
  static async applyPendingUpdates(targetDate = null) {
    const today = targetDate || new Date().toISOString().split('T')[0];
    
    try {
      // Get all shifts with pending updates for today
      const [pendingShifts] = await connection.query(
        `SELECT shift_id, pending_shift_name, pending_start_time, 
                pending_end_time, pending_max_late_time
         FROM WORK_SHIFT
         WHERE pending_effective_date = ?`,
        [today]
      );

      if (pendingShifts.length === 0) {
        return { applied: 0, message: 'Không có thay đổi nào cần áp dụng' };
      }

      let applied = 0;
      for (const shift of pendingShifts) {
        // Apply pending changes to active fields
        await connection.query(
          `UPDATE WORK_SHIFT
           SET shift_name = ?,
               start_time = ?,
               end_time = ?,
               max_late_time = ?,
               pending_shift_name = NULL,
               pending_start_time = NULL,
               pending_end_time = NULL,
               pending_max_late_time = NULL,
               pending_effective_date = NULL,
               pending_updated_by = NULL,
               pending_updated_at = NULL
           WHERE shift_id = ?`,
          [
            shift.pending_shift_name,
            shift.pending_start_time,
            shift.pending_end_time,
            shift.pending_max_late_time,
            shift.shift_id
          ]
        );
        applied++;
      }

      console.log(`✅ Applied ${applied} pending shift updates`);
      return { applied, message: `Đã áp dụng ${applied} thay đổi ca làm việc` };
    } catch (error) {
      console.error('Error applying pending updates:', error);
      throw error;
    }
  }

  /**
   * Check if shift has active employees today
   * @param {string} shiftId
   * @returns {Promise<Object>}
   */
  static async checkActiveEmployees(shiftId) {
    try {
      const today = new Date().toISOString().split('T')[0];
      
      const [employees] = await connection.query(
        `SELECT 
          dt.employee_id,
          e.full_name,
          dt.check_in_time,
          dt.check_out_time
         FROM DAILY_TIMESHEET dt
         INNER JOIN EMPLOYEE e ON dt.employee_id = e.employee_id
         WHERE dt.shift_id = ? 
           AND dt.work_date = ?
           AND dt.check_in_time IS NOT NULL`,
        [shiftId, today]
      );

      const activeCount = employees.filter(emp => !emp.check_out_time).length;
      const totalCount = employees.length;

      return {
        hasActiveEmployees: activeCount > 0,
        activeCount,
        totalCount,
        employees
      };
    } catch (error) {
      console.error('Error checking active employees:', error);
      throw error;
    }
  }

  /**
   * Delete work shift
   * @param {string} shiftId 
   * @returns {Promise<boolean>}
   */
  static async delete(shiftId) {
    try {
      const [result] = await connection.query(
        'DELETE FROM WORK_SHIFT WHERE shift_id = ?',
        [shiftId]
      );

      if (result.affectedRows === 0) {
        throw new Error('Ca làm việc không tồn tại.');
      }

      return true;
    } catch (error) {
      console.error('Error deleting work shift:', error);
      throw error;
    }
  }

  /**
   * Check if work shift exists
   * @param {string} shiftId 
   * @returns {Promise<boolean>}
   */
  static async exists(shiftId) {
    try {
      const [rows] = await connection.query(
        'SELECT 1 FROM WORK_SHIFT WHERE shift_id = ?',
        [shiftId]
      );
      return rows.length > 0;
    } catch (error) {
      console.error('Error checking work shift existence:', error);
      throw error;
    }
  }

  /**
   * Check if work shift is being used in timesheets
   * @param {string} shiftId 
   * @returns {Promise<boolean>}
   */
  static async isInUse(shiftId) {
    try {
      const [rows] = await connection.query(
        'SELECT 1 FROM DAILY_TIMESHEET WHERE shift_id = ? LIMIT 1',
        [shiftId]
      );
      return rows.length > 0;
    } catch (error) {
      console.error('Error checking work shift usage:', error);
      throw error;
    }
  }

  /**
   * Check if department already has a work shift assigned
   * @param {string} departmentId 
   * @param {string} excludeShiftId - Optional shift ID to exclude from check (for update)
   * @returns {Promise<boolean>}
   */
  static async departmentHasShift(departmentId, excludeShiftId = null) {
    try {
      let query = 'SELECT 1 FROM WORK_SHIFT WHERE department_id = ?';
      let params = [departmentId];
      
      if (excludeShiftId) {
        query += ' AND shift_id != ?';
        params.push(excludeShiftId);
      }
      
      query += ' LIMIT 1';
      
      const [rows] = await connection.query(query, params);
      return rows.length > 0;
    } catch (error) {
      console.error('Error checking department work shift:', error);
      throw error;
    }
  }
}

module.exports = WorkShiftModel;
