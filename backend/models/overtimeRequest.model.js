const db = require('../config/db.config');

class OvertimeRequestModel {
  // Create new overtime request
  static async create(overtimeData) {
    const { employeeId, otDate, startTime, endTime, totalHours, reason } = overtimeData;
    
    // Validate times
    if (startTime >= endTime) {
      throw new Error('Giờ kết thúc phải sau giờ bắt đầu');
    }

    // Check for overlapping overtime requests
    const hasOverlap = await this.hasOverlap(employeeId, otDate, startTime, endTime);
    if (hasOverlap) {
      throw new Error('Đã có yêu cầu tăng ca trùng thời gian này');
    }

    const [result] = await db.query(
      `INSERT INTO OVERTIME_REQUEST 
        (employee_id, ot_date, start_time, end_time, total_hours, reason, status, created_date)
        VALUES (?, ?, ?, ?, ?, ?, 'pending', NOW())`,
      [employeeId, otDate, startTime, endTime, totalHours, reason || null]
    );

    // Return the created request
    return this.getByEmployeeAndDate(employeeId, new Date());
  }

  // Get overtime requests by employee ID
  static async getByEmployeeId(employeeId) {
    const [rows] = await db.query(
      `SELECT ot.*, e.full_name, d.department_name,
              approver.full_name as approver_name
       FROM OVERTIME_REQUEST ot
       LEFT JOIN EMPLOYEE e ON ot.employee_id = e.employee_id
       LEFT JOIN DEPARTMENT d ON e.department_id = d.department_id
       LEFT JOIN EMPLOYEE approver ON ot.approver_id = approver.employee_id
       WHERE ot.employee_id = ?
       ORDER BY ot.created_date DESC`,
      [employeeId]
    );
    return rows;
  }

  // Get single request by employee and date
  static async getByEmployeeAndDate(employeeId, createdDate) {
    // Parse the date - MySQL will handle timezone correctly with Date object
    const searchDate = new Date(createdDate);
    
    const [rows] = await db.query(
      `SELECT ot.*, e.full_name,
              TIMESTAMPDIFF(SECOND, ot.created_date, ?) as time_diff
       FROM OVERTIME_REQUEST ot
       LEFT JOIN EMPLOYEE e ON ot.employee_id = e.employee_id
       WHERE ot.employee_id = ? 
       ORDER BY ABS(time_diff) ASC
       LIMIT 1`,
      [searchDate, employeeId]
    );
    
    if (rows[0]) {
      // Only return if within reasonable time window (5 seconds)
      if (Math.abs(rows[0].time_diff) < 5) {
        return rows[0];
      }
    }
    
    return null;
  }

  // Get all pending overtime requests
  static async getAllPending() {
    const [rows] = await db.query(
      `SELECT ot.*, e.full_name, d.department_name
       FROM OVERTIME_REQUEST ot
       LEFT JOIN EMPLOYEE e ON ot.employee_id = e.employee_id
       LEFT JOIN DEPARTMENT d ON e.department_id = d.department_id
       WHERE ot.status = 'pending'
       ORDER BY ot.created_date DESC`
    );
    return rows;
  }

  // Get all overtime requests with optional filters
  static async getAll(filters = {}) {
    let query = `
      SELECT ot.*, e.full_name, d.department_name,
             approver.full_name as approver_name
      FROM OVERTIME_REQUEST ot
      LEFT JOIN EMPLOYEE e ON ot.employee_id = e.employee_id
      LEFT JOIN DEPARTMENT d ON e.department_id = d.department_id
      LEFT JOIN EMPLOYEE approver ON ot.approver_id = approver.employee_id
      WHERE 1=1
    `;
    const params = [];

    if (filters.status) {
      query += ' AND ot.status = ?';
      params.push(filters.status);
    }

    if (filters.employeeId) {
      query += ' AND ot.employee_id = ?';
      params.push(filters.employeeId);
    }

    if (filters.startDate) {
      query += ' AND ot.ot_date >= ?';
      params.push(filters.startDate);
    }

    if (filters.endDate) {
      query += ' AND ot.ot_date <= ?';
      params.push(filters.endDate);
    }

    query += ' ORDER BY ot.created_date DESC';

    const [rows] = await db.query(query, params);
    return rows;
  }

  // Approve overtime request
  static async approve(employeeId, createdDate, approverId) {
    // Parse date - MySQL will handle timezone correctly with Date object
    const searchDate = new Date(createdDate);
    const [result] = await db.query(
      `UPDATE OVERTIME_REQUEST 
       SET status = 'approved', 
           approver_id = ?
       WHERE employee_id = ? 
       AND ABS(TIMESTAMPDIFF(SECOND, created_date, ?)) < 5 
       AND status = 'pending'`,
      [approverId, employeeId, searchDate]
    );

    if (result.affectedRows === 0) {
      throw new Error('Không tìm thấy yêu cầu hoặc yêu cầu đã được xử lý');
    }

    return this.getByEmployeeAndDate(employeeId, createdDate);
  }

  // Reject overtime request
  static async reject(employeeId, createdDate, approverId) {
    // Parse date - MySQL will handle timezone correctly with Date object
    const searchDate = new Date(createdDate);
    const [result] = await db.query(
      `UPDATE OVERTIME_REQUEST 
       SET status = 'rejected', 
           approver_id = ?
       WHERE employee_id = ? 
       AND ABS(TIMESTAMPDIFF(SECOND, created_date, ?)) < 5 
       AND status = 'pending'`,
      [approverId, employeeId, searchDate]
    );

    if (result.affectedRows === 0) {
      throw new Error('Không tìm thấy yêu cầu hoặc yêu cầu đã được xử lý');
    }

    return this.getByEmployeeAndDate(employeeId, createdDate);
  }

  // Delete overtime request (only if pending and owned by employee)
  static async delete(employeeId, createdDate, requestingEmployeeId) {
    // Verify ownership
    const request = await this.getByEmployeeAndDate(employeeId, createdDate);
    if (!request) {
      throw new Error('Không tìm thấy yêu cầu tăng ca');
    }

    if (request.employee_id !== requestingEmployeeId) {
      throw new Error('Bạn không có quyền xóa yêu cầu này');
    }

    if (request.status !== 'pending') {
      throw new Error('Chỉ có thể xóa yêu cầu đang chờ duyệt');
    }

    // Parse date - MySQL will handle timezone correctly with Date object
    const searchDate = new Date(createdDate);
    const [result] = await db.query(
      'DELETE FROM OVERTIME_REQUEST WHERE employee_id = ? AND ABS(TIMESTAMPDIFF(SECOND, created_date, ?)) < 5',
      [employeeId, searchDate]
    );

    return result.affectedRows > 0;
  }

  // Check if there's overlapping overtime request
  static async hasOverlap(employeeId, otDate, startTime, endTime, excludeCreatedDate = null) {
    let query = `
      SELECT *
      FROM OVERTIME_REQUEST
      WHERE employee_id = ?
        AND ot_date = ?
        AND status IN ('pending', 'approved')
        AND (
          (start_time <= ? AND end_time >= ?) OR
          (start_time <= ? AND end_time >= ?) OR
          (start_time >= ? AND end_time <= ?)
        )
    `;
    const params = [employeeId, otDate, startTime, startTime, endTime, endTime, startTime, endTime];

    if (excludeCreatedDate) {
      query += ' AND ABS(TIMESTAMPDIFF(SECOND, created_date, ?)) >= 5';
      params.push(new Date(excludeCreatedDate));
    }

    const [rows] = await db.query(query, params);
    return rows.length > 0;
  }

  // Get overtime statistics by employee
  static async getStatsByEmployee(employeeId, year, month = null) {
    let query = `
      SELECT 
        COUNT(*) as total_requests,
        SUM(CASE WHEN status = 'approved' THEN 1 ELSE 0 END) as approved_count,
        SUM(CASE WHEN status = 'approved' THEN total_hours ELSE 0 END) as total_hours
      FROM OVERTIME_REQUEST
      WHERE employee_id = ? 
        AND status = 'approved'
        AND YEAR(ot_date) = ?
    `;
    const params = [employeeId, year];

    if (month) {
      query += ' AND MONTH(ot_date) = ?';
      params.push(month);
    }

    const [rows] = await db.query(query, params);
    return rows[0] || { total_requests: 0, approved_count: 0, total_hours: 0 };
  }
}

module.exports = OvertimeRequestModel;
