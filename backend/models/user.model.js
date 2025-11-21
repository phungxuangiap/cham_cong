const pool = require('../config/db.config');
const { v4: uuidv4 } = require('uuid');

class UserModel {
  static async findByUsername(username) {
    try {
      const connection = await pool.getConnection();
      const [rows] = await connection.query(
        'SELECT * FROM USER_ACCOUNT WHERE username = ?',
        [username]
      );
      connection.release();
      
      return rows.length > 0 ? rows[0] : null;
    } catch (error) {
      console.error('Error finding user by username:', error);
      throw error;
    }
  }

  static async findById(employeeId) {
    try {
      const connection = await pool.getConnection();
      const [rows] = await connection.query(
        'SELECT * FROM USER_ACCOUNT WHERE employee_id = ?',
        [employeeId]
      );
      connection.release();
      
      return rows.length > 0 ? rows[0] : null;
    } catch (error) {
      console.error('Error finding user by ID:', error);
      throw error;
    }
  }

  static async create(userData) {
    try {
      const connection = await pool.getConnection();
      const [result] = await connection.query(
        'INSERT INTO USER_ACCOUNT (employee_id, username, password_hash, role, status) VALUES (?, ?, ?, ?, ?)',
        [userData.employeeId, userData.username, userData.passwordHash, userData.role, userData.status]
      );
      connection.release();
      
      return result;
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }

  static async update(employeeId, userData) {
    try {
      const connection = await pool.getConnection();
      const [result] = await connection.query(
        'UPDATE USER_ACCOUNT SET username = ?, password_hash = ?, role = ?, status = ? WHERE employee_id = ?',
        [userData.username, userData.passwordHash, userData.role, userData.status, employeeId]
      );
      connection.release();
      
      return result;
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  }

  static async deleteById(employeeId) {
    try {
      const connection = await pool.getConnection();
      const [result] = await connection.query(
        'DELETE FROM USER_ACCOUNT WHERE employee_id = ?',
        [employeeId]
      );
      connection.release();
      
      return result;
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  }
}

module.exports = UserModel;
