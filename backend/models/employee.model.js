const pool = require('../config/db.config');
const { v4: uuidv4 } = require('uuid');

class EmployeeModel {
  static async findById(employeeId) {
    try {
      const connection = await pool.getConnection();
      const [rows] = await connection.query(
        'SELECT * FROM EMPLOYEE WHERE employee_id = ?',
        [employeeId]
      );
      connection.release();
      
      return rows.length > 0 ? rows[0] : null;
    } catch (error) {
      console.error('Error finding employee by ID:', error);
      throw error;
    }
  }

  static async findByEmail(personalEmail) {
    try {
      const connection = await pool.getConnection();
      const [rows] = await connection.query(
        'SELECT * FROM EMPLOYEE WHERE personal_email = ?',
        [personalEmail]
      );
      connection.release();
      
      return rows.length > 0 ? rows[0] : null;
    } catch (error) {
      console.error('Error finding employee by email:', error);
      throw error;
    }
  }

  static async create(employeeData) {
    try {
      const connection = await pool.getConnection();
      const employeeId = employeeData.employeeId || uuidv4();
      
      const [result] = await connection.query(
        'INSERT INTO EMPLOYEE (employee_id, full_name, date_of_birth, gender, address, phone_number, personal_email, company_email, status, join_date, department_id, position_id, manager_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [
          employeeId,
          employeeData.fullName,
          employeeData.dateOfBirth || null,
          employeeData.gender || null,
          employeeData.address || null,
          employeeData.phoneNumber || null,
          employeeData.personalEmail || null,
          employeeData.companyEmail || null,
          employeeData.status || 'Active',
          employeeData.joinDate || new Date(),
          employeeData.departmentId || null,
          employeeData.positionId || null,
          employeeData.managerId || null
        ]
      );
      connection.release();
      
      return { id: employeeId, ...result };
    } catch (error) {
      console.error('Error creating employee:', error);
      throw error;
    }
  }

  static async update(employeeId, employeeData) {
    try {
      const connection = await pool.getConnection();
      const [result] = await connection.query(
        'UPDATE EMPLOYEE SET full_name = ?, date_of_birth = ?, gender = ?, address = ?, phone_number = ?, personal_email = ?, company_email = ?, status = ?, department_id = ?, position_id = ?, manager_id = ? WHERE employee_id = ?',
        [
          employeeData.fullName,
          employeeData.dateOfBirth,
          employeeData.gender,
          employeeData.address,
          employeeData.phoneNumber,
          employeeData.personalEmail,
          employeeData.companyEmail,
          employeeData.status,
          employeeData.departmentId,
          employeeData.positionId,
          employeeData.managerId,
          employeeId
        ]
      );
      connection.release();
      
      return result;
    } catch (error) {
      console.error('Error updating employee:', error);
      throw error;
    }
  }

  static async deleteById(employeeId) {
    try {
      const connection = await pool.getConnection();
      const [result] = await connection.query(
        'DELETE FROM EMPLOYEE WHERE employee_id = ?',
        [employeeId]
      );
      connection.release();
      
      return result;
    } catch (error) {
      console.error('Error deleting employee:', error);
      throw error;
    }
  }
}

module.exports = EmployeeModel;
