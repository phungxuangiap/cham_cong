const connection = require('../config/db.config');

class DepartmentModel {
  /**
   * Get all departments
   * @returns {Promise<Array>}
   */
  static async getAll() {
    try {
      const [rows] = await connection.query(
        `SELECT department_id, department_name, description, manager_id, parent_department_id
         FROM DEPARTMENT 
         ORDER BY department_name ASC`
      );
      return rows;
    } catch (error) {
      console.error('Error getting all departments:', error);
      throw error;
    }
  }

  /**
   * Get department by ID
   * @param {string} departmentId 
   * @returns {Promise<Object|null>}
   */
  static async getById(departmentId) {
    try {
      const [rows] = await connection.query(
        `SELECT department_id, department_name, description, manager_id, parent_department_id
         FROM DEPARTMENT 
         WHERE department_id = ?`,
        [departmentId]
      );
      return rows.length > 0 ? rows[0] : null;
    } catch (error) {
      console.error('Error getting department by ID:', error);
      throw error;
    }
  }

  /**
   * Create new department
   * @param {Object} departmentData 
   * @returns {Promise<Object>}
   */
  static async create(departmentData) {
    try {
      const { departmentId, departmentName, description, managerId, parentDepartmentId } = departmentData;
      
      await connection.query(
        `INSERT INTO DEPARTMENT (department_id, department_name, description, manager_id, parent_department_id)
         VALUES (?, ?, ?, ?, ?)`,
        [departmentId, departmentName, description || null, managerId || null, parentDepartmentId || null]
      );

      return { departmentId, departmentName, description, managerId, parentDepartmentId };
    } catch (error) {
      console.error('Error creating department:', error);
      throw error;
    }
  }

  /**
   * Update department
   * @param {string} departmentId 
   * @param {Object} updateData 
   * @returns {Promise<Object>}
   */
  static async update(departmentId, updateData) {
    try {
      const { departmentName, description, managerId, parentDepartmentId } = updateData;
      
      const [result] = await connection.query(
        `UPDATE DEPARTMENT 
         SET department_name = ?, description = ?, manager_id = ?, parent_department_id = ?
         WHERE department_id = ?`,
        [departmentName, description || null, managerId || null, parentDepartmentId || null, departmentId]
      );

      if (result.affectedRows === 0) {
        throw new Error('Phòng ban không tồn tại hoặc không có thay đổi.');
      }

      return { departmentId, departmentName, description, managerId, parentDepartmentId };
    } catch (error) {
      console.error('Error updating department:', error);
      throw error;
    }
  }

  /**
   * Delete department
   * @param {string} departmentId 
   * @returns {Promise<boolean>}
   */
  static async delete(departmentId) {
    try {
      const [result] = await connection.query(
        'DELETE FROM DEPARTMENT WHERE department_id = ?',
        [departmentId]
      );

      if (result.affectedRows === 0) {
        throw new Error('Phòng ban không tồn tại.');
      }

      return true;
    } catch (error) {
      console.error('Error deleting department:', error);
      throw error;
    }
  }

  /**
   * Check if department exists
   * @param {string} departmentId 
   * @returns {Promise<boolean>}
   */
  static async exists(departmentId) {
    try {
      const [rows] = await connection.query(
        'SELECT 1 FROM DEPARTMENT WHERE department_id = ?',
        [departmentId]
      );
      return rows.length > 0;
    } catch (error) {
      console.error('Error checking department existence:', error);
      throw error;
    }
  }

  /**
   * Get employees in department
   * @param {string} departmentId 
   * @returns {Promise<Array>}
   */
  static async getEmployeesInDepartment(departmentId) {
    try {
      const [rows] = await connection.query(
        `SELECT employee_id, full_name, position_id 
         FROM EMPLOYEE 
         WHERE department_id = ?`,
        [departmentId]
      );
      return rows;
    } catch (error) {
      console.error('Error getting employees in department:', error);
      throw error;
    }
  }

  /**
   * Get child departments
   * @param {string} departmentId 
   * @returns {Promise<Array>}
   */
  static async getChildDepartments(departmentId) {
    try {
      const [rows] = await connection.query(
        `SELECT department_id, department_name 
         FROM DEPARTMENT 
         WHERE parent_department_id = ?`,
        [departmentId]
      );
      return rows;
    } catch (error) {
      console.error('Error getting child departments:', error);
      throw error;
    }
  }

  /**
   * Transfer employees to another department
   * @param {string} fromDepartmentId 
   * @param {string} toDepartmentId 
   * @returns {Promise<number>}
   */
  static async transferEmployees(fromDepartmentId, toDepartmentId) {
    try {
      const [result] = await connection.query(
        'UPDATE EMPLOYEE SET department_id = ? WHERE department_id = ?',
        [toDepartmentId, fromDepartmentId]
      );
      return result.affectedRows;
    } catch (error) {
      console.error('Error transferring employees:', error);
      throw error;
    }
  }
}

module.exports = DepartmentModel;
