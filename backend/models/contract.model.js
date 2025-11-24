const connection = require('../config/db.config');

class ContractModel {
  /**
   * Get latest contract for an employee
   * @param {string} employeeId 
   * @returns {Promise<Object|null>}
   */
  static async getLatestContract(employeeId) {
    const [rows] = await connection.query(
      `SELECT employee_id,
              DATE_FORMAT(signing_date, '%Y-%m-%d') as signing_date,
              contract_type,
              DATE_FORMAT(start_date, '%Y-%m-%d') as start_date,
              DATE_FORMAT(end_date, '%Y-%m-%d') as end_date
       FROM CONTRACT 
       WHERE employee_id = ? 
       ORDER BY signing_date DESC 
       LIMIT 1`,
      [employeeId]
    );
    return rows.length > 0 ? rows[0] : null;
  }

  /**
   * Get all contracts for an employee
   * @param {string} employeeId 
   * @returns {Promise<Array>}
   */
  static async getAllContracts(employeeId) {
    const [rows] = await connection.query(
      `SELECT employee_id,
              DATE_FORMAT(signing_date, '%Y-%m-%d') as signing_date,
              contract_type,
              DATE_FORMAT(start_date, '%Y-%m-%d') as start_date,
              DATE_FORMAT(end_date, '%Y-%m-%d') as end_date
       FROM CONTRACT 
       WHERE employee_id = ? 
       ORDER BY signing_date DESC`,
      [employeeId]
    );
    return rows;
  }

  /**
   * Get specific contract by employee ID and signing date
   * @param {string} employeeId 
   * @param {string} signingDate 
   * @returns {Promise<Object|null>}
   */
  static async getContractBySigningDate(employeeId, signingDate) {
    const [rows] = await connection.query(
      `SELECT employee_id,
              DATE_FORMAT(signing_date, '%Y-%m-%d') as signing_date,
              contract_type,
              DATE_FORMAT(start_date, '%Y-%m-%d') as start_date,
              DATE_FORMAT(end_date, '%Y-%m-%d') as end_date
       FROM CONTRACT 
       WHERE employee_id = ? AND DATE(signing_date) = ?`,
      [employeeId, signingDate]
    );
    return rows.length > 0 ? rows[0] : null;
  }

  /**
   * Get all contracts with employee information
   * @returns {Promise<Array>}
   */
  static async getAllContractsWithEmployees() {
    const [rows] = await connection.query(
      `SELECT c.employee_id,
              DATE_FORMAT(c.signing_date, '%Y-%m-%d') as signing_date,
              c.contract_type,
              DATE_FORMAT(c.start_date, '%Y-%m-%d') as start_date,
              DATE_FORMAT(c.end_date, '%Y-%m-%d') as end_date,
              e.full_name, e.department_id, e.position_id, e.status as employee_status,
              u.username, u.role
       FROM CONTRACT c
       INNER JOIN EMPLOYEE e ON c.employee_id = e.employee_id
       LEFT JOIN USER_ACCOUNT u ON e.employee_id = u.employee_id
       ORDER BY c.end_date ASC, c.signing_date DESC`
    );
    return rows;
  }

  /**
   * Create new contract
   * @param {Object} contractData 
   * @returns {Promise<Object>}
   */
  static async create(contractData) {
    const { employee_id, signing_date, contract_type, start_date, end_date } = contractData;
    await connection.query(
      `INSERT INTO CONTRACT (employee_id, signing_date, contract_type, start_date, end_date) 
       VALUES (?, ?, ?, ?, ?)`,
      [employee_id, signing_date, contract_type, start_date, end_date]
    );
    return contractData;
  }

  /**
   * Update contract
   * @param {string} employeeId 
   * @param {string} signingDate 
   * @param {Object} contractData 
   * @returns {Promise<Object>}
   */
  static async update(employeeId, signingDate, contractData) {
    const { contract_type, start_date, end_date } = contractData;
    const [result] = await connection.query(
      `UPDATE CONTRACT 
       SET contract_type = ?, start_date = ?, end_date = ? 
       WHERE employee_id = ? AND signing_date = ?`,
      [contract_type, start_date, end_date, employeeId, signingDate]
    );
    
    if (result.affectedRows === 0) {
      throw new Error('Contract not found or no changes made');
    }
    
    return contractData;
  }

  /**
   * Delete contract
   * @param {string} employeeId 
   * @param {string} signingDate 
   * @returns {Promise<void>}
   */
  static async delete(employeeId, signingDate) {
    await connection.query(
      `DELETE FROM CONTRACT 
       WHERE employee_id = ? AND signing_date = ?`,
      [employeeId, signingDate]
    );
  }
}

module.exports = ContractModel;
