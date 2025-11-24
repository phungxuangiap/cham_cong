const db = require('../config/db.config');

class LeaveRequestModel {
  // Create new leave request
  static async create(leaveData) {
    const { employeeId, leaveType, startDate, endDate, reason } = leaveData;
    
    // Validate dates
    if (new Date(startDate) > new Date(endDate)) {
      throw new Error('Ngày kết thúc phải sau hoặc bằng ngày bắt đầu');
    }

    // Check for overlapping leave requests
    const hasOverlap = await this.hasOverlap(employeeId, startDate, endDate);
    if (hasOverlap) {
      throw new Error('Đã có yêu cầu nghỉ phép trùng thời gian này');
    }

    const [result] = await db.query(
      `INSERT INTO LEAVE_REQUEST 
        (employee_id, leave_type, start_date, end_date, reason, status, created_date)
        VALUES (?, ?, ?, ?, ?, 'pending', NOW())`,
      [employeeId, leaveType, startDate, endDate, reason || null]
    );

    // Return the created request
    return this.getByEmployeeAndDate(employeeId, new Date());
  }

  // Get leave requests by employee ID
  static async getByEmployeeId(employeeId) {
    const [rows] = await db.query(
      `SELECT lr.*, e.full_name, d.department_name,
              approver.full_name as approver_name
       FROM LEAVE_REQUEST lr
       LEFT JOIN EMPLOYEE e ON lr.employee_id = e.employee_id
       LEFT JOIN DEPARTMENT d ON e.department_id = d.department_id
       LEFT JOIN EMPLOYEE approver ON lr.approver_id = approver.employee_id
       WHERE lr.employee_id = ?
       ORDER BY lr.created_date DESC`,
      [employeeId]
    );
    return rows;
  }

  // Get single request by employee and date
  static async getByEmployeeAndDate(employeeId, createdDate) {
    // Parse the date and format for MySQL - the date from DB is already in local timezone
    // We need to compare directly with the timestamp
    const searchDate = new Date(createdDate);
    console.log('getByEmployeeAndDate - Looking for:', { employeeId, createdDate, searchDate });
    
    const [rows] = await db.query(
      `SELECT lr.*, e.full_name,
              TIMESTAMPDIFF(SECOND, lr.created_date, ?) as time_diff
       FROM LEAVE_REQUEST lr
       LEFT JOIN EMPLOYEE e ON lr.employee_id = e.employee_id
       WHERE lr.employee_id = ? 
       ORDER BY ABS(time_diff) ASC
       LIMIT 1`,
      [searchDate, employeeId]
    );
    
    if (rows[0]) {
      console.log('Found request:', { 
        created_date: rows[0].created_date, 
        time_diff: rows[0].time_diff 
      });
      // Only return if within reasonable time window (5 seconds)
      if (Math.abs(rows[0].time_diff) < 5) {
        return rows[0];
      }
      console.log('Time diff too large, not returning');
    } else {
      console.log('No request found');
    }
    
    return null;
  }

  // Get all pending leave requests
  static async getAllPending() {
    const [rows] = await db.query(
      `SELECT lr.*, e.full_name, d.department_name
       FROM LEAVE_REQUEST lr
       LEFT JOIN EMPLOYEE e ON lr.employee_id = e.employee_id
       LEFT JOIN DEPARTMENT d ON e.department_id = d.department_id
       WHERE lr.status = 'pending'
       ORDER BY lr.created_date ASC`
    );
    return rows;
  }

  // Get all leave requests with filters
  static async getAll(filters = {}) {
    let query = `
      SELECT lr.*, e.full_name, d.department_name,
             approver.full_name as approver_name
      FROM LEAVE_REQUEST lr
      LEFT JOIN EMPLOYEE e ON lr.employee_id = e.employee_id
      LEFT JOIN DEPARTMENT d ON e.department_id = d.department_id
      LEFT JOIN EMPLOYEE approver ON lr.approver_id = approver.employee_id
      WHERE 1=1
    `;
    const params = [];

    if (filters.status) {
      query += ' AND lr.status = ?';
      params.push(filters.status);
    }

    if (filters.departmentId) {
      query += ' AND e.department_id = ?';
      params.push(filters.departmentId);
    }

    if (filters.startDate) {
      query += ' AND lr.start_date >= ?';
      params.push(filters.startDate);
    }

    if (filters.endDate) {
      query += ' AND lr.end_date <= ?';
      params.push(filters.endDate);
    }

    query += ' ORDER BY lr.created_date DESC';

    const [rows] = await db.query(query, params);
    return rows;
  }

  // Approve leave request
  static async approve(employeeId, createdDate, approverId) {
    // Parse date - MySQL will handle timezone correctly with Date object
    const searchDate = new Date(createdDate);
    const [result] = await db.query(
      `UPDATE LEAVE_REQUEST 
       SET status = 'approved', 
           approver_id = ?, 
           approved_date = NOW()
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

  // Reject leave request
  static async reject(employeeId, createdDate, approverId, rejectReason) {
    if (!rejectReason) {
      throw new Error('Vui lòng nhập lý do từ chối');
    }

    // Parse date - MySQL will handle timezone correctly with Date object
    const searchDate = new Date(createdDate);
    const [result] = await db.query(
      `UPDATE LEAVE_REQUEST 
       SET status = 'rejected', 
           approver_id = ?, 
           approved_date = NOW(),
           rejection_reason = ?
       WHERE employee_id = ? 
       AND ABS(TIMESTAMPDIFF(SECOND, created_date, ?)) < 5 
       AND status = 'pending'`,
      [approverId, rejectReason, employeeId, searchDate]
    );

    if (result.affectedRows === 0) {
      throw new Error('Không tìm thấy yêu cầu hoặc yêu cầu đã được xử lý');
    }

    return this.getByEmployeeAndDate(employeeId, createdDate);
  }

  // Delete leave request (only if pending and owned by employee)
  static async delete(employeeId, createdDate, requestingEmployeeId) {
    // Verify ownership
    const request = await this.getByEmployeeAndDate(employeeId, createdDate);
    if (!request) {
      throw new Error('Không tìm thấy yêu cầu nghỉ phép');
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
      'DELETE FROM LEAVE_REQUEST WHERE employee_id = ? AND ABS(TIMESTAMPDIFF(SECOND, created_date, ?)) < 5',
      [employeeId, searchDate]
    );

    return result.affectedRows > 0;
  }

  // Check if there's overlapping leave request
  static async hasOverlap(employeeId, startDate, endDate, excludeCreatedDate = null) {
    console.log('hasOverlap check:', { employeeId, startDate, endDate, excludeCreatedDate });
    
    let query = `
      SELECT *
      FROM LEAVE_REQUEST
      WHERE employee_id = ?
        AND status IN ('pending', 'approved')
        AND (
          (start_date <= ? AND end_date >= ?) OR
          (start_date <= ? AND end_date >= ?) OR
          (start_date >= ? AND end_date <= ?)
        )
    `;
    const params = [employeeId, startDate, startDate, endDate, endDate, startDate, endDate];

    if (excludeCreatedDate) {
      query += ' AND ABS(TIMESTAMPDIFF(SECOND, created_date, ?)) >= 60';
      params.push(new Date(excludeCreatedDate).toISOString().slice(0, 19).replace('T', ' '));
    }

    const [rows] = await db.query(query, params);
    console.log('Overlapping requests found:', rows.length, rows);
    return rows.length > 0;
  }

  // Get leave statistics by employee
  static async getStatsByEmployee(employeeId, year) {
    const [rows] = await db.query(
      `SELECT 
        leave_type,
        SUM(DATEDIFF(end_date, start_date) + 1) as total_days
       FROM LEAVE_REQUEST
       WHERE employee_id = ? 
         AND status = 'approved'
         AND YEAR(start_date) = ?
       GROUP BY leave_type`,
      [employeeId, year]
    );

    const stats = {
      annual: 0,
      sick: 0,
      personal: 0,
      unpaid: 0,
      other: 0,
      total: 0
    };

    rows.forEach(row => {
      stats[row.leave_type] = parseFloat(row.total_days);
      stats.total += parseFloat(row.total_days);
    });

    return stats;
  }
}

module.exports = LeaveRequestModel;
