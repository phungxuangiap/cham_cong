const connection = require('../config/db.config');

class WorkShiftModel {
  /**
   * Get all work shifts
   * @returns {Promise<Array>}
   */
  static async getAll() {
    try {
      const [rows] = await connection.query(
        `SELECT shift_id, shift_name, start_time, end_time, max_late_time, department_id
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
        `SELECT shift_id, shift_name, start_time, end_time, max_late_time, department_id
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
   * Update work shift
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
