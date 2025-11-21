const connection = require('../config/db.config');

class ContractModel {
  /**
   * Get latest contract for an employee
   * @param {string} employeeId 
   * @returns {Promise<Object|null>}
   */
  static async getLatestContract(employeeId) {
    const [rows] = await connection.query(
      `SELECT * FROM CONTRACT 
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
      `SELECT * FROM CONTRACT 
       WHERE employee_id = ? 
       ORDER BY signing_date DESC`,
      [employeeId]
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
    await connection.query(
      `UPDATE CONTRACT 
       SET contract_type = ?, start_date = ?, end_date = ? 
       WHERE employee_id = ? AND signing_date = ?`,
      [contract_type, start_date, end_date, employeeId, signingDate]
    );
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
