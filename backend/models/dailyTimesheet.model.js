const connection = require('../config/db.config');

class DailyTimesheetModel {
  /**
   * Lấy tất cả timesheet của một employee
   * @param {string} employeeId 
   * @param {string} startDate - Format: YYYY-MM-DD
   * @param {string} endDate - Format: YYYY-MM-DD
   * @returns {Promise<Array>}
   */
  static async getByEmployeeId(employeeId, startDate = null, endDate = null) {
    let query = `
      SELECT 
        dt.employee_id,
        dt.work_date,
        dt.shift_id,
        dt.check_in_time,
        dt.check_out_time,
        dt.minutes_late,
        dt.minutes_early,
        dt.notes,
        dt.adjusted_by_employee_id,
        ws.shift_name,
        ws.start_time,
        ws.end_time,
        ws.max_late_time
      FROM DAILY_TIMESHEET dt
      LEFT JOIN WORK_SHIFT ws ON dt.shift_id = ws.shift_id
      WHERE dt.employee_id = ?
    `;

    const params = [employeeId];

    if (startDate && endDate) {
      query += ' AND dt.work_date BETWEEN ? AND ?';
      params.push(startDate, endDate);
    }

    query += ' ORDER BY dt.work_date DESC';

    try {
      const [rows] = await connection.query(query, params);
      return rows;
    } catch (error) {
      console.error('Error getting timesheets by employee:', error);
      throw error;
    }
  }

  /**
   * Lấy tổng quan timesheet theo phòng ban
   * @param {string} departmentId 
   * @param {string} workDate - Format: YYYY-MM-DD
   * @returns {Promise<Object>}
   */
  static async getStatsByDepartment(departmentId, workDate) {
    try {
      const [stats] = await connection.query(`
        SELECT 
          COUNT(DISTINCT dt.employee_id) as total_employees,
          COUNT(DISTINCT CASE WHEN dt.check_in_time IS NOT NULL THEN dt.employee_id END) as checked_in,
          COUNT(DISTINCT CASE WHEN dt.check_out_time IS NOT NULL THEN dt.employee_id END) as checked_out,
          COUNT(DISTINCT CASE WHEN dt.check_in_time IS NULL AND dt.check_out_time IS NULL THEN dt.employee_id END) as not_checked
        FROM DAILY_TIMESHEET dt
        INNER JOIN EMPLOYEE e ON dt.employee_id = e.employee_id
        WHERE e.department_id = ? AND dt.work_date = ?
      `, [departmentId, workDate]);

      return stats[0] || { total_employees: 0, checked_in: 0, checked_out: 0, not_checked: 0 };
    } catch (error) {
      console.error('Error getting department stats:', error);
      throw error;
    }
  }

  /**
   * Lấy tổng quan tất cả phòng ban
   * @param {string} workDate - Format: YYYY-MM-DD
   * @returns {Promise<Array>}
   */
  static async getAllDepartmentStats(workDate) {
    try {
      const [stats] = await connection.query(`
        SELECT 
          d.department_id,
          d.department_name,
          COUNT(DISTINCT dt.employee_id) as total_employees,
          COUNT(DISTINCT CASE WHEN dt.check_in_time IS NOT NULL THEN dt.employee_id END) as checked_in,
          COUNT(DISTINCT CASE WHEN dt.check_out_time IS NOT NULL THEN dt.employee_id END) as checked_out,
          COUNT(DISTINCT CASE WHEN dt.check_in_time IS NULL AND dt.check_out_time IS NULL THEN dt.employee_id END) as not_checked
        FROM DEPARTMENT d
        LEFT JOIN EMPLOYEE e ON d.department_id = e.department_id AND e.status = 'active'
        LEFT JOIN DAILY_TIMESHEET dt ON e.employee_id = dt.employee_id AND dt.work_date = ?
        GROUP BY d.department_id, d.department_name
        ORDER BY d.department_name
      `, [workDate]);

      return stats;
    } catch (error) {
      console.error('Error getting all department stats:', error);
      throw error;
    }
  }

  /**
   * Lấy chi tiết timesheet của nhân viên trong phòng ban
   * @param {string} departmentId 
   * @param {string} workDate 
   * @returns {Promise<Array>}
   */
  static async getEmployeeDetailsByDepartment(departmentId, workDate) {
    try {
      const [details] = await connection.query(`
        SELECT 
          e.employee_id,
          e.full_name,
          dt.work_date,
          dt.check_in_time,
          dt.check_out_time,
          dt.minutes_late,
          dt.minutes_early,
          ws.shift_name,
          ws.start_time,
          ws.end_time,
          CASE 
            WHEN dt.check_in_time IS NULL AND dt.check_out_time IS NULL THEN 'not_checked'
            WHEN dt.check_in_time IS NOT NULL AND dt.check_out_time IS NULL THEN 'checked_in'
            WHEN dt.check_out_time IS NOT NULL THEN 'checked_out'
          END as status
        FROM EMPLOYEE e
        LEFT JOIN DAILY_TIMESHEET dt ON e.employee_id = dt.employee_id AND dt.work_date = ?
        LEFT JOIN WORK_SHIFT ws ON dt.shift_id = ws.shift_id
        WHERE e.department_id = ? AND e.status = 'active'
        ORDER BY e.full_name
      `, [workDate, departmentId]);

      return details;
    } catch (error) {
      console.error('Error getting employee details:', error);
      throw error;
    }
  }

  /**
   * Check if timesheet exists
   * @param {string} employeeId 
   * @param {string} workDate 
   * @returns {Promise<boolean>}
   */
  static async exists(employeeId, workDate) {
    try {
      const [rows] = await connection.query(
        'SELECT 1 FROM DAILY_TIMESHEET WHERE employee_id = ? AND work_date = ?',
        [employeeId, workDate]
      );
      return rows.length > 0;
    } catch (error) {
      console.error('Error checking timesheet existence:', error);
      throw error;
    }
  }

  /**
   * Check-in user
   * @param {string} employeeId 
   * @param {string} workDate 
   * @param {string} checkInTime 
   * @returns {Promise<Object>}
   */
  static async checkIn(employeeId, workDate, checkInTime) {
    try {
      // Get timesheet and shift info
      const [timesheets] = await connection.query(`
        SELECT dt.*, ws.start_time, ws.max_late_time
        FROM DAILY_TIMESHEET dt
        LEFT JOIN WORK_SHIFT ws ON dt.shift_id = ws.shift_id
        WHERE dt.employee_id = ? AND dt.work_date = ?
      `, [employeeId, workDate]);

      if (timesheets.length === 0) {
        throw new Error('Không tìm thấy timesheet cho ngày hôm nay');
      }

      const timesheet = timesheets[0];

      if (timesheet.check_in_time) {
        throw new Error('Bạn đã check-in rồi');
      }

      // Calculate late minutes
      let minutesLate = 0;
      if (timesheet.start_time && timesheet.max_late_time) {
        const checkInMinutes = this.timeToMinutes(checkInTime);
        const startMinutes = this.timeToMinutes(timesheet.start_time);
        minutesLate = Math.max(0, checkInMinutes - startMinutes);
      }

      // Update timesheet
      await connection.query(`
        UPDATE DAILY_TIMESHEET
        SET check_in_time = ?, minutes_late = ?
        WHERE employee_id = ? AND work_date = ?
      `, [checkInTime, minutesLate, employeeId, workDate]);

      return { 
        success: true, 
        checkInTime, 
        minutesLate,
        message: minutesLate > 0 ? `Check-in thành công. Bạn đi muộn ${minutesLate} phút` : 'Check-in thành công'
      };
    } catch (error) {
      console.error('Error checking in:', error);
      throw error;
    }
  }

  /**
   * Check-out user
   * @param {string} employeeId 
   * @param {string} workDate 
   * @param {string} checkOutTime 
   * @returns {Promise<Object>}
   */
  static async checkOut(employeeId, workDate, checkOutTime) {
    try {
      // Get timesheet and shift info
      const [timesheets] = await connection.query(`
        SELECT dt.*, ws.end_time
        FROM DAILY_TIMESHEET dt
        LEFT JOIN WORK_SHIFT ws ON dt.shift_id = ws.shift_id
        WHERE dt.employee_id = ? AND dt.work_date = ?
      `, [employeeId, workDate]);

      if (timesheets.length === 0) {
        throw new Error('Không tìm thấy timesheet cho ngày hôm nay');
      }

      const timesheet = timesheets[0];

      if (!timesheet.check_in_time) {
        throw new Error('Bạn chưa check-in. Vui lòng check-in trước');
      }

      if (timesheet.check_out_time) {
        throw new Error('Bạn đã check-out rồi');
      }

      // Calculate early minutes
      let minutesEarly = 0;
      if (timesheet.end_time) {
        const checkOutMinutes = this.timeToMinutes(checkOutTime);
        const endMinutes = this.timeToMinutes(timesheet.end_time);
        minutesEarly = Math.max(0, endMinutes - checkOutMinutes);
      }

      // Update timesheet
      await connection.query(`
        UPDATE DAILY_TIMESHEET
        SET check_out_time = ?, minutes_early = ?
        WHERE employee_id = ? AND work_date = ?
      `, [checkOutTime, minutesEarly, employeeId, workDate]);

      return { 
        success: true, 
        checkOutTime, 
        minutesEarly,
        message: minutesEarly > 0 ? `Check-out thành công. Bạn về sớm ${minutesEarly} phút` : 'Check-out thành công'
      };
    } catch (error) {
      console.error('Error checking out:', error);
      throw error;
    }
  }

  /**
   * Helper: Convert time string to minutes
   * @param {string} time - Format: HH:mm:ss or HH:mm
   * @returns {number}
   */
  static timeToMinutes(time) {
    if (!time) return 0;
    const parts = time.split(':');
    return parseInt(parts[0]) * 60 + parseInt(parts[1]);
  }

  /**
   * Auto checkout forgotten timesheets (yesterday and before)
   * @returns {Promise<Object>}
   */
  static async autoCheckoutForgottenTimesheets() {
    const today = new Date().toISOString().split('T')[0];
    try {
      // Tìm tất cả timesheet đã check-in nhưng chưa check-out (trước hôm nay)
      const [forgottenTimesheets] = await connection.query(`
        SELECT 
          dt.employee_id,
          dt.work_date,
          ws.end_time
        FROM DAILY_TIMESHEET dt
        LEFT JOIN WORK_SHIFT ws ON dt.shift_id = ws.shift_id
        WHERE dt.check_in_time IS NOT NULL 
          AND dt.check_out_time IS NULL
          AND dt.work_date < ?
      `, [today]);

      if (forgottenTimesheets.length === 0) {
        return { autoCheckedOut: 0, message: 'Không có timesheet nào cần tự động checkout' };
      }

      let autoCheckedOut = 0;
      for (const timesheet of forgottenTimesheets) {
        // Tự động checkout với giờ end_time của ca
        const checkOutTime = timesheet.end_time || '17:30:00';
        await connection.query(`
          UPDATE DAILY_TIMESHEET
          SET check_out_time = ?, 
              minutes_early = 0,
              notes = CONCAT(IFNULL(notes, ''), ' [Auto checkout by system]')
          WHERE employee_id = ? AND work_date = ?
        `, [checkOutTime, timesheet.employee_id, timesheet.work_date]);
        autoCheckedOut++;
      }

      console.log(`✅ Auto checked-out ${autoCheckedOut} forgotten timesheets`);
      return { 
        autoCheckedOut, 
        message: `Đã tự động checkout ${autoCheckedOut} timesheet bị quên` 
      };
    } catch (error) {
      console.error('Error auto checkout forgotten timesheets:', error);
      throw error;
    }
  }

  /**
   * Get today's timesheet status
   * @param {string} employeeId 
   * @returns {Promise<Object>}
   */
  static async getTodayStatus(employeeId) {
    const today = new Date().toISOString().split('T')[0];
    try {
      const [timesheets] = await connection.query(`
        SELECT 
          dt.*,
          ws.shift_name,
          ws.start_time,
          ws.end_time,
          ws.max_late_time
        FROM DAILY_TIMESHEET dt
        LEFT JOIN WORK_SHIFT ws ON dt.shift_id = ws.shift_id
        WHERE dt.employee_id = ? AND dt.work_date = ?
      `, [employeeId, today]);

      if (timesheets.length === 0) {
        return { 
          hasTimesheet: false, 
          canCheckIn: false, 
          canCheckOut: false,
          message: 'Chưa có lịch làm việc cho hôm nay'
        };
      }

      const timesheet = timesheets[0];
      
      // Kiểm tra xem đã tới giờ cho phép check-in chưa
      let canCheckIn = false;
      let checkInMessage = '';
      
      if (!timesheet.check_in_time && timesheet.max_late_time) {
        const now = new Date();
        const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:00`;
        const currentMinutes = this.timeToMinutes(currentTime);
        const maxLateMinutes = this.timeToMinutes(timesheet.max_late_time);
        
        if (currentMinutes >= maxLateMinutes - 60) { // Cho phép check-in từ 1 giờ trước giờ bắt đầu ca
          canCheckIn = true;
        } else {
          checkInMessage = `Chưa tới giờ check-in. Có thể check-in từ ${timesheet.max_late_time.substring(0, 5)}`;
        }
      }
      
      return {
        hasTimesheet: true,
        canCheckIn,
        canCheckOut: timesheet.check_in_time && !timesheet.check_out_time,
        checkInMessage,
        timesheet
      };
    } catch (error) {
      console.error('Error getting today status:', error);
      throw error;
    }
  }
}

module.exports = DailyTimesheetModel;

