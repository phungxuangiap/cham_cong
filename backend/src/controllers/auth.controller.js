const UserModel = require('../../models/user.model');
const EmployeeModel = require('../../models/employee.model');
const ContractModel = require('../../models/contract.model');
const DepartmentModel = require('../../models/department.model');
const WorkShiftModel = require('../../models/workshift.model');
const DailyTimesheetModel = require('../../models/dailyTimesheet.model');
const LeaveRequestModel = require('../../models/leaveRequest.model');
const OvertimeRequestModel = require('../../models/overtimeRequest.model');
const CronService = require('../../services/cron.service');
const JWTConfig = require('../../config/jwt.config');
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcrypt');

class AuthController {
  static async login(req, res) {
    try {
      const { username, password } = req.body;

      // Validate input
      if (!username || !password) {
        return res.status(400).json({
          message: 'Tên đăng nhập và mật khẩu là bắt buộc.'
        });
      }

      // Find user by username
      const user = await UserModel.findByUsername(username);

      // Check if user exists
      if (!user) {
        return res.status(401).json({
          message: 'Tên đăng nhập hoặc mật khẩu không đúng.'
        });
      }

      // Check if user is active
      if (user.status !== 'Active') {
        return res.status(403).json({
          message: 'Tài khoản của bạn đã bị vô hiệu hóa.'
        });
      }

      // Compare password with bcrypt
      const isPasswordValid = await bcrypt.compare(password, user.password_hash);
      if (!isPasswordValid && ! password === user.password_hash) {
        return res.status(401).json({
          message: 'Tên đăng nhập hoặc mật khẩu không đúng.'
        });
      }

      // Login successful
      const payload = {
        employee_id: user.employee_id,
        username: user.username,
        role: user.role
      };

      const { accessToken, refreshToken } = JWTConfig.generateTokens(payload);

      return res.status(200).json({
        message: 'Đăng nhập thành công',
        accessToken,
        refreshToken,
        employee_id: user.employee_id,
        username: user.username,
        role: user.role
      });

    } catch (error) {
      console.error('Login error:', error);
      return res.status(500).json({
        message: 'Lỗi máy chủ nội bộ.',
        error: error.message
      });
    }
  }

  static async logout(req, res) {
    try {
      // In a JWT-based system, logout is typically handled on the client side
      // by removing the token from localStorage/sessionStorage
      return res.status(200).json({
        message: 'Đăng xuất thành công'
      });
    } catch (error) {
      console.error('Logout error:', error);
      return res.status(500).json({
        message: 'Lỗi máy chủ nội bộ.',
        error: error.message
      });
    }
  }

  static async register(req, res) {
    try {
      const { employeeId, username, password, role, status } = req.body;

      // Validate input
      if (!employeeId || !username || !password || !role) {
        return res.status(400).json({
          message: 'ID nhân viên, tên đăng nhập, mật khẩu và vai trò là bắt buộc.'
        });
      }

      // Check if user already exists
      const existingUser = await UserModel.findByUsername(username);
      if (existingUser) {
        return res.status(409).json({
          message: 'Tên đăng nhập đã tồn tại.'
        });
      }

      // Hash password with bcrypt
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      // Create new user
      const newUser = await UserModel.create({
        employeeId: employeeId,
        username: username,
        passwordHash: hashedPassword,
        role: role,
        status: status || 'Active'
      });

      return res.status(201).json({
        message: 'Đăng ký thành công',
        employee_id: employeeId,
        username: username,
        role: role
      });

    } catch (error) {
      console.error('Register error:', error);
      return res.status(500).json({
        message: 'Lỗi máy chủ nội bộ.',
        error: error.message
      });
    }
  }

  static async adminCreateAccount(req, res) {
    try {
      const { role, employee_id } = req.user;

      // Check admin or HR permission
      if (role !== 'Admin' && role !== 'HR') {
        return res.status(403).json({
          message: 'Chỉ quản trị viên hoặc nhân viên HR mới có thể tạo tài khoản.'
        });
      }

      const { personalEmail, username, password, userRole, status } = req.body;

      // Validate input
      if (!personalEmail || !username || !password || !userRole) {
        return res.status(400).json({
          message: 'Email cá nhân, tên đăng nhập, mật khẩu và vai trò là bắt buộc.'
        });
      }

      // Check if user already exists
      const existingUser = await UserModel.findByUsername(username);
      if (existingUser) {
        return res.status(409).json({
          message: 'Tên đăng nhập đã tồn tại.'
        });
      }

      // Find employee by personal email
      const employee = await EmployeeModel.findByEmail(personalEmail);
      if (!employee) {
        return res.status(404).json({
          message: 'Nhân viên không tìm thấy với email này.'
        });
      }

      // Check if employee already has an account
      const existingAccount = await UserModel.findById(employee.employee_id);
      if (existingAccount) {
        return res.status(409).json({
          message: 'Nhân viên này đã có tài khoản.'
        });
      }

      // Hash password with bcrypt
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      // Create new user account
      await UserModel.create({
        employeeId: employee.employee_id,
        username: username,
        passwordHash: hashedPassword,
        role: userRole,
        status: status || 'Active'
      });

      return res.status(201).json({
        message: 'Tài khoản được tạo thành công bởi quản trị viên',
        employee_id: employee.employee_id,
        personal_email: personalEmail,
        username: username,
        role: userRole
      });

    } catch (error) {
      console.error('Admin create account error:', error);
      return res.status(500).json({
        message: 'Lỗi máy chủ nội bộ.',
        error: error.message
      });
    }
  }

  static async employeeRegister(req, res) {
    try {
      const {
        fullName,
        dateOfBirth,
        gender,
        address,
        phoneNumber,
        personalEmail,
        companyEmail,
        departmentId,
        positionId,
        managerId,
        username,
        password,
        role
      } = req.body;

      // Validate required fields
      if (!fullName || !username || !password || !role) {
        return res.status(400).json({
          message: 'Tên đầy đủ, tên đăng nhập, mật khẩu và vai trò là bắt buộc.'
        });
      }

      // Check if username already exists
      const existingUser = await UserModel.findByUsername(username);
      if (existingUser) {
        return res.status(409).json({
          message: 'Tên đăng nhập đã tồn tại.'
        });
      }

      // Generate UUID for employee
      const employeeId = uuidv4();

      // Create employee record
      await EmployeeModel.create({
        employeeId: employeeId,
        fullName: fullName,
        dateOfBirth: dateOfBirth || null,
        gender: gender || null,
        address: address || null,
        phoneNumber: phoneNumber || null,
        personalEmail: personalEmail || null,
        companyEmail: companyEmail || null,
        status: 'Active',
        joinDate: new Date().toISOString().split('T')[0],
        departmentId: departmentId || null,
        positionId: positionId || null,
        managerId: managerId || null
      });

      // Hash password with bcrypt
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      // Create user account
      await UserModel.create({
        employeeId: employeeId,
        username: username,
        passwordHash: hashedPassword,
        role: role,
        status: 'Active'
      });
      
      return res.status(201).json({
        message: 'Tạo nhân viên thành công',
        employee_id: employeeId,
        full_name: fullName,
        username: username,
        role: role
      });

    } catch (error) {
      console.error('Employee register error:', error);
      return res.status(500).json({
        message: 'Lỗi máy chủ nội bộ.',
        error: error.message
      });
    }
  }

  static async getProfile(req, res) {
    try {
      const { employeeId } = req.params;

      // Validate input
      if (!employeeId) {
        return res.status(400).json({
          message: 'ID nhân viên là bắt buộc.'
        });
      }

      // Find user by employee ID
      const user = await EmployeeModel.findById(employeeId);

      // Check if user exists
      if (!user) {
        return res.status(404).json({
          message: 'Người dùng không tìm thấy.'
        });
      }

      // Return user profile without password
      return res.status(200).json({
        message: 'Lấy thông tin hồ sơ thành công',
        user: {
            ...user
        }
      });

    } catch (error) {
      console.error('Get profile error:', error);
      return res.status(500).json({
        message: 'Lỗi máy chủ nội bộ.',
        error: error.message
      });
    }
  }

  static async refreshAccessToken(req, res) {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        return res.status(400).json({
          message: 'Refresh token là bắt buộc.'
        });
      }

      const decoded = JWTConfig.verifyRefreshToken(refreshToken);

      const payload = {
        employee_id: decoded.employee_id,
        username: decoded.username,
        role: decoded.role
      };

      const newAccessToken = JWTConfig.generateAccessToken(payload);

      return res.status(200).json({
        message: 'Access token đã được làm mới',
        accessToken: newAccessToken
      });
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({
          message: 'Refresh token đã hết hạn. Vui lòng đăng nhập lại.'
        });
      }

      return res.status(403).json({
        message: 'Refresh token không hợp lệ.'
      });
    }
  }

  static async updateProfile(req, res) {
    try {
      const { role, employee_id } = req.user;
      const { employeeId } = req.params;

      // Check if user is updating their own profile or has Admin/HR privileges
      if (employee_id !== employeeId && role !== 'Admin' && role !== 'HR') {
        return res.status(403).json({
          message: 'Bạn không có quyền cập nhật thông tin của người khác.'
        });
      }

      const {
        fullName,
        dateOfBirth,
        gender,
        address,
        phoneNumber,
        personalEmail,
        companyEmail,
        joinDate,
        departmentId,
        positionId,
        managerId,
        status
      } = req.body;

      // Validate required fields
      if (!fullName) {
        return res.status(400).json({
          message: 'Họ tên là bắt buộc.'
        });
      }

      // Check if employee exists
      const existingEmployee = await EmployeeModel.findById(employeeId);
      if (!existingEmployee) {
        return res.status(404).json({
          message: 'Nhân viên không tồn tại.'
        });
      }

      // Prepare update data based on role
      let updateData = {
        fullName,
        dateOfBirth: dateOfBirth || existingEmployee.date_of_birth,
        gender: gender || existingEmployee.gender,
        address: address || existingEmployee.address,
        phoneNumber: phoneNumber || existingEmployee.phone_number,
        personalEmail: personalEmail || existingEmployee.personal_email,
        managerId: managerId || existingEmployee.manager_id
      };

      // Only Admin and HR can update restricted fields
      if (role === 'Admin' || role === 'HR') {
        updateData.companyEmail = companyEmail || existingEmployee.company_email;
        updateData.status = status || existingEmployee.status;
        updateData.departmentId = departmentId || existingEmployee.department_id;
        updateData.positionId = positionId || existingEmployee.position_id;
        // Note: join_date is not updated as it's a historical record
      } else {
        // Employee role: keep existing restricted fields
        updateData.companyEmail = existingEmployee.company_email;
        updateData.status = existingEmployee.status;
        updateData.departmentId = existingEmployee.department_id;
        updateData.positionId = existingEmployee.position_id;
      }

      // Update employee
      await EmployeeModel.update(employeeId, updateData);

      // Fetch updated employee data
      const updatedEmployee = await EmployeeModel.findById(employeeId);

      return res.status(200).json({
        message: 'Cập nhật thông tin thành công',
        employee: updatedEmployee
      });

    } catch (error) {
      console.error('Update profile error:', error);
      return res.status(500).json({
        message: 'Lỗi máy chủ nội bộ.',
        error: error.message
      });
    }
  }

  static async getAllEmployees(req, res) {
    try {
      const { role } = req.user;

      // Check if user has Admin or HR role
      if (role !== 'Admin' && role !== 'HR') {
        return res.status(403).json({
          message: 'Chỉ Admin và HR mới có thể xem danh sách nhân viên.'
        });
      }

      const employees = await EmployeeModel.findAll();

      return res.status(200).json({
        message: 'Lấy danh sách nhân viên thành công',
        employees: employees
      });

    } catch (error) {
      console.error('Get all employees error:', error);
      return res.status(500).json({
        message: 'Lỗi máy chủ nội bộ.',
        error: error.message
      });
    }
  }

  static async getUserContract(req, res) {
    try {
      const { employeeId } = req.params;

      // Validate input
      if (!employeeId) {
        return res.status(400).json({
          message: 'ID nhân viên là bắt buộc.'
        });
      }

      // Check if employee exists
      const employee = await EmployeeModel.findById(employeeId);
      if (!employee) {
        return res.status(404).json({
          message: 'Nhân viên không tồn tại.'
        });
      }

      // Get latest contract
      const contract = await ContractModel.getLatestContract(employeeId);

      if (!contract) {
        return res.status(404).json({
          message: 'Không tìm thấy hợp đồng cho nhân viên này.',
          contract: null
        });
      }

      return res.status(200).json({
        message: 'Lấy thông tin hợp đồng thành công',
        contract: contract
      });

    } catch (error) {
      console.error('Get user contract error:', error);
      return res.status(500).json({
        message: 'Lỗi máy chủ nội bộ.',
        error: error.message
      });
    }
  }

  static async createUserContract(req, res) {
    try {
      const { role } = req.user;

      // Check if user has Admin or HR role
      if (role !== 'Admin' && role !== 'HR') {
        return res.status(403).json({
          message: 'Chỉ Admin và HR mới có thể tạo hợp đồng.'
        });
      }

      const { employeeId, contractType, startDate, endDate } = req.body;

      // Validate required fields
      if (!employeeId || !contractType || !startDate) {
        return res.status(400).json({
          message: 'ID nhân viên, loại hợp đồng và ngày bắt đầu là bắt buộc.'
        });
      }

      // Check if employee exists
      const employee = await EmployeeModel.findById(employeeId);
      if (!employee) {
        return res.status(404).json({
          message: 'Nhân viên không tồn tại.'
        });
      }

      // Create contract
      const contractData = {
        employee_id: employeeId,
        signing_date: new Date().toISOString().split('T')[0],
        contract_type: contractType,
        start_date: startDate,
        end_date: endDate || null
      };

      await ContractModel.create(contractData);

      return res.status(201).json({
        message: 'Tạo hợp đồng thành công',
        contract: contractData
      });

    } catch (error) {
      console.error('Create user contract error:', error);
      return res.status(500).json({
        message: 'Lỗi máy chủ nội bộ.',
        error: error.message
      });
    }
  }

  static async getAllContracts(req, res) {
    try {
      const { role } = req.user;

      // Check if user has HR role
      if (role !== 'HR') {
        return res.status(403).json({
          message: 'Chỉ HR mới có thể xem tất cả hợp đồng.'
        });
      }

      const contracts = await ContractModel.getAllContractsWithEmployees();

      return res.status(200).json({
        message: 'Lấy danh sách hợp đồng thành công',
        contracts: contracts
      });

    } catch (error) {
      console.error('Get all contracts error:', error);
      return res.status(500).json({
        message: 'Lỗi máy chủ nội bộ.',
        error: error.message
      });
    }
  }

  static async updateUserContract(req, res) {
    try {
      const { role } = req.user;

      // Check if user has Admin or HR role
      if (role !== 'Admin' && role !== 'HR') {
        return res.status(403).json({
          message: 'Chỉ Admin và HR mới có thể cập nhật hợp đồng.'
        });
      }

      const { employeeId, signingDate, contractType, startDate, endDate } = req.body;

      console.log('Update contract request:', { employeeId, signingDate, contractType, startDate, endDate });

      // Validate required fields
      if (!employeeId || !signingDate) {
        return res.status(400).json({
          message: 'ID nhân viên và ngày ký là bắt buộc.'
        });
      }

      // Check if employee exists
      const employee = await EmployeeModel.findById(employeeId);
      if (!employee) {
        return res.status(404).json({
          message: 'Nhân viên không tồn tại.'
        });
      }

      // Check if contract exists with the specific signing_date
      const existingContract = await ContractModel.getContractBySigningDate(employeeId, signingDate);
      if (!existingContract) {
        return res.status(404).json({
          message: 'Hợp đồng không tồn tại với ngày ký này.'
        });
      }

      // Update contract
      const contractData = {
        contract_type: contractType,
        start_date: startDate,
        end_date: endDate || null
      };

      await ContractModel.update(employeeId, signingDate, contractData);

      return res.status(200).json({
        message: 'Cập nhật hợp đồng thành công',
        contract: {
          employee_id: employeeId,
          signing_date: signingDate,
          ...contractData
        }
      });

    } catch (error) {
      console.error('Update user contract error:', error);
      return res.status(500).json({
        message: 'Lỗi máy chủ nội bộ.',
        error: error.message
      });
    }
  }

  // ==================== DEPARTMENT MANAGEMENT ====================

  /**
   * Get all departments (All roles)
   */
  static async getAllDepartments(req, res) {
    try {
      const departments = await DepartmentModel.getAll();
      
      return res.status(200).json({
        message: 'Lấy danh sách phòng ban thành công',
        departments
      });
    } catch (error) {
      console.error('Get all departments error:', error);
      return res.status(500).json({
        message: 'Lỗi máy chủ nội bộ.',
        error: error.message
      });
    }
  }

  /**
   * Get department by ID (All roles)
   */
  static async getDepartmentById(req, res) {
    try {
      const { departmentId } = req.params;

      if (!departmentId) {
        return res.status(400).json({
          message: 'ID phòng ban là bắt buộc.'
        });
      }

      const department = await DepartmentModel.getById(departmentId);

      if (!department) {
        return res.status(404).json({
          message: 'Phòng ban không tồn tại.'
        });
      }

      return res.status(200).json({
        message: 'Lấy thông tin phòng ban thành công',
        department
      });
    } catch (error) {
      console.error('Get department by ID error:', error);
      return res.status(500).json({
        message: 'Lỗi máy chủ nội bộ.',
        error: error.message
      });
    }
  }

  /**
   * Create department (Admin only)
   */
  static async createDepartment(req, res) {
    try {
      const { role } = req.user;

      if (role !== 'Admin') {
        return res.status(403).json({
          message: 'Chỉ Admin mới có thể tạo phòng ban.'
        });
      }

      const { departmentId, departmentName, description, managerId, parentDepartmentId } = req.body;

      if (!departmentId || !departmentName) {
        return res.status(400).json({
          message: 'ID và tên phòng ban là bắt buộc.'
        });
      }

      // Check if department ID already exists
      const existingDepartment = await DepartmentModel.getById(departmentId);
      if (existingDepartment) {
        return res.status(400).json({
          message: 'ID phòng ban đã tồn tại.'
        });
      }

      // If parentDepartmentId provided, check if parent department exists
      if (parentDepartmentId) {
        const parentDepartment = await DepartmentModel.getById(parentDepartmentId);
        if (!parentDepartment) {
          return res.status(404).json({
            message: 'Phòng ban cha không tồn tại.'
          });
        }
      }

      // If managerId provided, check if employee exists
      if (managerId) {
        const manager = await EmployeeModel.findById(managerId);
        if (!manager) {
          return res.status(404).json({
            message: 'Nhân viên quản lý không tồn tại.'
          });
        }
      }

      const department = await DepartmentModel.create({
        departmentId,
        departmentName,
        description,
        managerId,
        parentDepartmentId
      });

      return res.status(201).json({
        message: 'Tạo phòng ban thành công',
        department
      });
    } catch (error) {
      console.error('Create department error:', error);
      return res.status(500).json({
        message: 'Lỗi máy chủ nội bộ.',
        error: error.message
      });
    }
  }

  /**
   * Update department (Admin only)
   */
  static async updateDepartment(req, res) {
    try {
      const { role } = req.user;

      if (role !== 'Admin') {
        return res.status(403).json({
          message: 'Chỉ Admin mới có thể cập nhật phòng ban.'
        });
      }

      const { departmentId } = req.params;
      const { departmentName, description, managerId, parentDepartmentId } = req.body;

      if (!departmentId) {
        return res.status(400).json({
          message: 'ID phòng ban là bắt buộc.'
        });
      }

      // Check if department exists
      const existingDepartment = await DepartmentModel.getById(departmentId);
      if (!existingDepartment) {
        return res.status(404).json({
          message: 'Phòng ban không tồn tại.'
        });
      }

      // If parentDepartmentId provided, check if parent department exists and prevent circular reference
      if (parentDepartmentId !== undefined && parentDepartmentId !== null) {
        if (parentDepartmentId === departmentId) {
          return res.status(400).json({
            message: 'Phòng ban không thể là phòng ban cha của chính nó.'
          });
        }
        if (parentDepartmentId) {
          const parentDepartment = await DepartmentModel.getById(parentDepartmentId);
          if (!parentDepartment) {
            return res.status(404).json({
              message: 'Phòng ban cha không tồn tại.'
            });
          }
        }
      }

      // If managerId provided, check if employee exists
      if (managerId) {
        const manager = await EmployeeModel.findById(managerId);
        if (!manager) {
          return res.status(404).json({
            message: 'Nhân viên quản lý không tồn tại.'
          });
        }
      }

      const department = await DepartmentModel.update(departmentId, {
        departmentName: departmentName || existingDepartment.department_name,
        description: description !== undefined ? description : existingDepartment.description,
        managerId: managerId !== undefined ? managerId : existingDepartment.manager_id,
        parentDepartmentId: parentDepartmentId !== undefined ? parentDepartmentId : existingDepartment.parent_department_id
      });

      return res.status(200).json({
        message: 'Cập nhật phòng ban thành công',
        department
      });
    } catch (error) {
      console.error('Update department error:', error);
      return res.status(500).json({
        message: 'Lỗi máy chủ nội bộ.',
        error: error.message
      });
    }
  }

  /**
   * Delete department (Admin only)
   */
  static async deleteDepartment(req, res) {
    try {
      const { role } = req.user;

      if (role !== 'Admin') {
        return res.status(403).json({
          message: 'Chỉ Admin mới có thể xóa phòng ban.'
        });
      }

      const { departmentId } = req.params;
      const { transferToDepartmentId } = req.body;

      if (!departmentId) {
        return res.status(400).json({
          message: 'ID phòng ban là bắt buộc.'
        });
      }

      // Check if department exists
      const existingDepartment = await DepartmentModel.getById(departmentId);
      if (!existingDepartment) {
        return res.status(404).json({
          message: 'Phòng ban không tồn tại.'
        });
      }

      // Check for employees in department
      const employees = await DepartmentModel.getEmployeesInDepartment(departmentId);
      
      if (employees.length > 0) {
        // If no transfer department specified, return error with employee list
        if (!transferToDepartmentId) {
          return res.status(400).json({
            message: 'Phòng ban này đang có nhân viên. Vui lòng chuyển họ sang phòng ban khác trước khi xóa.',
            hasEmployees: true,
            employees: employees,
            employeeCount: employees.length
          });
        }

        // Validate transfer department exists
        const transferDepartment = await DepartmentModel.getById(transferToDepartmentId);
        if (!transferDepartment) {
          return res.status(404).json({
            message: 'Phòng ban chuyển đến không tồn tại.'
          });
        }

        // Transfer employees
        await DepartmentModel.transferEmployees(departmentId, transferToDepartmentId);
      }

      // Check for child departments
      const childDepartments = await DepartmentModel.getChildDepartments(departmentId);
      if (childDepartments.length > 0) {
        return res.status(400).json({
          message: 'Không thể xóa phòng ban vì có phòng ban con thuộc phòng ban này.',
          hasChildDepartments: true,
          childDepartments: childDepartments
        });
      }

      // Delete department
      await DepartmentModel.delete(departmentId);

      return res.status(200).json({
        message: 'Xóa phòng ban thành công',
        transferredEmployees: employees.length
      });
    } catch (error) {
      console.error('Delete department error:', error);
      return res.status(500).json({
        message: 'Lỗi máy chủ nội bộ.',
        error: error.message
      });
    }
  }

  // ==================== WORK SHIFT MANAGEMENT ====================

  /**
   * Get all work shifts (All roles)
   */
  static async getAllWorkShifts(req, res) {
    try {
      const workShifts = await WorkShiftModel.getAll();

      return res.status(200).json({
        message: 'Lấy danh sách ca làm việc thành công',
        workShifts
      });
    } catch (error) {
      console.error('Get all work shifts error:', error);
      return res.status(500).json({
        message: 'Lỗi máy chủ nội bộ.',
        error: error.message
      });
    }
  }

  /**
   * Get work shift by ID (All roles)
   */
  static async getWorkShiftById(req, res) {
    try {
      const { shiftId } = req.params;

      const workShift = await WorkShiftModel.getById(shiftId);

      if (!workShift) {
        return res.status(404).json({
          message: 'Ca làm việc không tồn tại.'
        });
      }

      return res.status(200).json({
        message: 'Lấy thông tin ca làm việc thành công',
        workShift
      });
    } catch (error) {
      console.error('Get work shift by ID error:', error);
      return res.status(500).json({
        message: 'Lỗi máy chủ nội bộ.',
        error: error.message
      });
    }
  }

  /**
   * Get work shifts by department (All roles)
   */
  static async getWorkShiftsByDepartment(req, res) {
    try {
      const { departmentId } = req.params;

      // Check if department exists
      const department = await DepartmentModel.getById(departmentId);
      if (!department) {
        return res.status(404).json({
          message: 'Phòng ban không tồn tại.'
        });
      }

      const workShifts = await WorkShiftModel.getByDepartment(departmentId);

      return res.status(200).json({
        message: 'Lấy danh sách ca làm việc theo phòng ban thành công',
        workShifts
      });
    } catch (error) {
      console.error('Get work shifts by department error:', error);
      return res.status(500).json({
        message: 'Lỗi máy chủ nội bộ.',
        error: error.message
      });
    }
  }

  /**
   * Create work shift (Admin, HR only)
   */
  static async createWorkShift(req, res) {
    try {
      const { role } = req.user;

      if (role !== 'Admin' && role !== 'HR') {
        return res.status(403).json({
          message: 'Chỉ Admin và HR mới có thể tạo ca làm việc.'
        });
      }

      const { shiftId, shiftName, startTime, endTime, maxLateTime, departmentId } = req.body;

      if (!shiftId || !shiftName || !startTime || !endTime) {
        return res.status(400).json({
          message: 'ID ca làm việc, tên ca, giờ bắt đầu và giờ kết thúc là bắt buộc.'
        });
      }

      if (!departmentId) {
        return res.status(400).json({
          message: 'Phòng ban là bắt buộc. Mỗi ca làm việc phải được gán cho một phòng ban cụ thể.'
        });
      }

      // Check if shift ID already exists
      const existingShift = await WorkShiftModel.getById(shiftId);
      if (existingShift) {
        return res.status(400).json({
          message: 'ID ca làm việc đã tồn tại.'
        });
      }

      // If departmentId provided, check if department exists
      if (departmentId) {
        const department = await DepartmentModel.getById(departmentId);
        if (!department) {
          return res.status(404).json({
            message: 'Phòng ban không tồn tại.'
          });
        }

        // Check if department already has a work shift
        const departmentHasShift = await WorkShiftModel.departmentHasShift(departmentId);
        if (departmentHasShift) {
          return res.status(400).json({
            message: 'Phòng ban này đã có ca làm việc được gán. Mỗi phòng ban chỉ được có 1 ca làm việc.'
          });
        }
      }

      const workShift = await WorkShiftModel.create({
        shiftId,
        shiftName,
        startTime,
        endTime,
        maxLateTime,
        departmentId
      });

      return res.status(201).json({
        message: 'Tạo ca làm việc thành công',
        workShift
      });
    } catch (error) {
      console.error('Create work shift error:', error);
      return res.status(500).json({
        message: 'Lỗi máy chủ nội bộ.',
        error: error.message
      });
    }
  }

  /**
   * Update work shift (Admin, HR only)
   */
  static async updateWorkShift(req, res) {
    try {
      const { role, employee_id } = req.user;

      if (role !== 'Admin' && role !== 'HR') {
        return res.status(403).json({
          message: 'Chỉ Admin và HR mới có thể cập nhật ca làm việc.'
        });
      }

      const { shiftId } = req.params;
      const { shiftName, startTime, endTime, maxLateTime, departmentId, scheduleForTomorrow } = req.body;

      if (!shiftId) {
        return res.status(400).json({
          message: 'ID ca làm việc là bắt buộc.'
        });
      }

      if (departmentId !== undefined && !departmentId) {
        return res.status(400).json({
          message: 'Phòng ban là bắt buộc. Mỗi ca làm việc phải được gán cho một phòng ban cụ thể.'
        });
      }

      // Check if work shift exists
      const existingShift = await WorkShiftModel.getById(shiftId);
      if (!existingShift) {
        return res.status(404).json({
          message: 'Ca làm việc không tồn tại.'
        });
      }

      // If departmentId provided, check if department exists
      if (departmentId) {
        const department = await DepartmentModel.getById(departmentId);
        if (!department) {
          return res.status(404).json({
            message: 'Phòng ban không tồn tại.'
          });
        }

        // Check if department already has a different work shift
        const departmentHasShift = await WorkShiftModel.departmentHasShift(departmentId, shiftId);
        if (departmentHasShift) {
          return res.status(400).json({
            message: 'Phòng ban này đã có ca làm việc khác được gán. Mỗi phòng ban chỉ được có 1 ca làm việc.'
          });
        }
      }

      // Check if there are active employees today
      const activeCheck = await WorkShiftModel.checkActiveEmployees(shiftId);
      
      // If there are active employees and not scheduling for tomorrow
      if (activeCheck.hasActiveEmployees && !scheduleForTomorrow) {
        return res.status(400).json({
          message: `Không thể cập nhật ngay. Có ${activeCheck.activeCount}/${activeCheck.totalCount} nhân viên đang làm việc với ca này.`,
          suggestion: 'Vui lòng chọn "Lưu cho ngày mai" để áp dụng thay đổi từ ngày mai.',
          affectedEmployees: activeCheck.employees,
          hasActiveEmployees: true
        });
      }

      // If scheduling for tomorrow or no active employees
      if (scheduleForTomorrow || activeCheck.hasActiveEmployees) {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const effectiveDate = tomorrow.toISOString().split('T')[0];

        const workShift = await WorkShiftModel.schedulePendingUpdate(shiftId, {
          shiftName: shiftName || existingShift.shift_name,
          startTime: startTime || existingShift.start_time,
          endTime: endTime || existingShift.end_time,
          maxLateTime: maxLateTime !== undefined ? maxLateTime : existingShift.max_late_time,
          effectiveDate
        }, employee_id);

        return res.status(200).json({
          message: `Đã lên lịch cập nhật ca làm việc. Thay đổi sẽ có hiệu lực từ ${effectiveDate}`,
          workShift,
          isScheduled: true,
          effectiveDate
        });
      } else {
        // Immediate update (no active employees)
        const workShift = await WorkShiftModel.update(shiftId, {
          shiftName: shiftName || existingShift.shift_name,
          startTime: startTime || existingShift.start_time,
          endTime: endTime || existingShift.end_time,
          maxLateTime: maxLateTime !== undefined ? maxLateTime : existingShift.max_late_time,
          departmentId: departmentId !== undefined ? departmentId : existingShift.department_id
        });

        return res.status(200).json({
          message: 'Cập nhật ca làm việc thành công',
          workShift,
          isScheduled: false
        });
      }
    } catch (error) {
      console.error('Update work shift error:', error);
      return res.status(500).json({
        message: 'Lỗi máy chủ nội bộ.',
        error: error.message
      });
    }
  }

  /**
   * Delete work shift (Admin only)
   */
  static async deleteWorkShift(req, res) {
    try {
      const { role } = req.user;

      if (role !== 'Admin') {
        return res.status(403).json({
          message: 'Chỉ Admin mới có thể xóa ca làm việc.'
        });
      }

      const { shiftId } = req.params;

      // Check if work shift exists
      const existingShift = await WorkShiftModel.getById(shiftId);
      if (!existingShift) {
        return res.status(404).json({
          message: 'Ca làm việc không tồn tại.'
        });
      }

      // Check if work shift is being used
      const isInUse = await WorkShiftModel.isInUse(shiftId);
      if (isInUse) {
        return res.status(400).json({
          message: 'Không thể xóa ca làm việc vì đang được sử dụng trong bảng chấm công.'
        });
      }

      await WorkShiftModel.delete(shiftId);

      return res.status(200).json({
        message: 'Xóa ca làm việc thành công'
      });
    } catch (error) {
      console.error('Delete work shift error:', error);
      return res.status(500).json({
        message: 'Lỗi máy chủ nội bộ.',
        error: error.message
      });
    }
  }

  /**
   * Cancel pending work shift update (Admin/HR)
   */
  static async cancelPendingWorkShift(req, res) {
    try {
      const { role } = req.user;

      if (role !== 'Admin' && role !== 'HR') {
        return res.status(403).json({
          message: 'Chỉ Admin và HR mới có thể hủy cập nhật đã lên lịch.'
        });
      }

      const { shiftId } = req.params;

      // Check if work shift exists
      const existingShift = await WorkShiftModel.getById(shiftId);
      if (!existingShift) {
        return res.status(404).json({
          message: 'Ca làm việc không tồn tại.'
        });
      }

      // Check if there's a pending update
      if (!existingShift.pending_effective_date) {
        return res.status(400).json({
          message: 'Không có cập nhật nào đang chờ thực hiện.'
        });
      }

      await WorkShiftModel.cancelPendingUpdate(shiftId);

      return res.status(200).json({
        message: 'Đã hủy cập nhật ca làm việc đã lên lịch'
      });
    } catch (error) {
      console.error('Cancel pending work shift error:', error);
      return res.status(500).json({
        message: 'Lỗi máy chủ nội bộ.',
        error: error.message
      });
    }
  }

  // ==================== DAILY TIMESHEET ROUTES ====================

  /**
   * Get my timesheets (Employee/HR/Admin)
   */
  static async getMyTimesheets(req, res) {
    try {
      const { employee_id } = req.user;
      const { startDate, endDate } = req.query;

      const timesheets = await DailyTimesheetModel.getByEmployeeId(
        employee_id,
        startDate,
        endDate
      );

      return res.status(200).json({
        message: 'Lấy danh sách timesheet thành công',
        timesheets
      });
    } catch (error) {
      console.error('Get my timesheets error:', error);
      return res.status(500).json({
        message: 'Lỗi máy chủ nội bộ.',
        error: error.message
      });
    }
  }

  /**
   * Get department timesheet stats (HR only)
   */
  static async getDepartmentTimesheetStats(req, res) {
    try {
      const { role } = req.user;

      if (role !== 'HR' && role !== 'Admin') {
        return res.status(403).json({
          message: 'Chỉ HR và Admin mới có thể xem thống kê phòng ban.'
        });
      }

      const { date } = req.query;
      const workDate = date || new Date().toISOString().split('T')[0];

      const stats = await DailyTimesheetModel.getAllDepartmentStats(workDate);

      return res.status(200).json({
        message: 'Lấy thống kê thành công',
        date: workDate,
        stats
      });
    } catch (error) {
      console.error('Get department stats error:', error);
      return res.status(500).json({
        message: 'Lỗi máy chủ nội bộ.',
        error: error.message
      });
    }
  }

  /**
   * Get department employee details (HR only)
   */
  static async getDepartmentEmployeeDetails(req, res) {
    try {
      const { role } = req.user;

      if (role !== 'HR' && role !== 'Admin') {
        return res.status(403).json({
          message: 'Chỉ HR và Admin mới có thể xem chi tiết nhân viên.'
        });
      }

      const { departmentId } = req.params;
      const { date } = req.query;
      const workDate = date || new Date().toISOString().split('T')[0];

      const details = await DailyTimesheetModel.getEmployeeDetailsByDepartment(
        departmentId,
        workDate
      );

      return res.status(200).json({
        message: 'Lấy chi tiết nhân viên thành công',
        date: workDate,
        employees: details
      });
    } catch (error) {
      console.error('Get department employee details error:', error);
      return res.status(500).json({
        message: 'Lỗi máy chủ nội bộ.',
        error: error.message
      });
    }
  }

  /**
   * Manual trigger timesheet generation (Admin only)
   */
  static async manualGenerateTimesheets(req, res) {
    try {
      const { role } = req.user;

      if (role !== 'Admin') {
        return res.status(403).json({
          message: 'Chỉ Admin mới có thể tạo timesheet thủ công.'
        });
      }

      const { date } = req.body;
      const result = await CronService.manualTrigger(date);

      return res.status(200).json({
        message: 'Tạo timesheet thành công',
        result
      });
    } catch (error) {
      console.error('Manual generate timesheets error:', error);
      return res.status(500).json({
        message: 'Lỗi máy chủ nội bộ.',
        error: error.message
      });
    }
  }

  /**
   * User check-in (All authenticated users)
   */
  static async userCheckIn(req, res) {
    try {
      const { employee_id } = req.user;
      
      // Get current time
      const now = new Date();
      const currentTime = now.toTimeString().split(' ')[0]; // HH:mm:ss
      const currentDate = now.toISOString().split('T')[0]; // YYYY-MM-DD

      const result = await DailyTimesheetModel.checkIn(
        employee_id,
        currentDate,
        currentTime
      );

      return res.status(200).json({
        message: result.message,
        checkInTime: result.checkInTime,
        minutesLate: result.minutesLate
      });
    } catch (error) {
      console.error('User check-in error:', error);
      return res.status(400).json({
        message: error.message || 'Lỗi khi check-in.',
        error: error.message
      });
    }
  }

  /**
   * User check-out (All authenticated users)
   */
  static async userCheckOut(req, res) {
    try {
      const { employee_id } = req.user;
      
      // Get current time
      const now = new Date();
      const currentTime = now.toTimeString().split(' ')[0]; // HH:mm:ss
      const currentDate = now.toISOString().split('T')[0]; // YYYY-MM-DD

      const result = await DailyTimesheetModel.checkOut(
        employee_id,
        currentDate,
        currentTime
      );

      return res.status(200).json({
        message: result.message,
        checkOutTime: result.checkOutTime,
        minutesEarly: result.minutesEarly
      });
    } catch (error) {
      console.error('User check-out error:', error);
      return res.status(400).json({
        message: error.message || 'Lỗi khi check-out.',
        error: error.message
      });
    }
  }

  /**
   * Get today's attendance status (All authenticated users)
   */
  static async getTodayAttendanceStatus(req, res) {
    try {
      const { employee_id } = req.user;

      const status = await DailyTimesheetModel.getTodayStatus(employee_id);

      return res.status(200).json({
        message: 'Lấy trạng thái chấm công thành công',
        status
      });
    } catch (error) {
      console.error('Get today status error:', error);
      return res.status(500).json({
        message: 'Lỗi máy chủ nội bộ.',
        error: error.message
      });
    }
  }

  // ==================== LEAVE REQUEST ROUTES ====================

  /**
   * Create leave request (Employee)
   */
  static async createLeaveRequest(req, res) {
    try {
      const { employee_id } = req.user;
      const { leaveType, startDate, endDate, reason } = req.body;

      // Validation
      if (!leaveType || !startDate || !endDate) {
        return res.status(400).json({
          message: 'Vui lòng điền đầy đủ thông tin: loại nghỉ phép, ngày bắt đầu, ngày kết thúc.'
        });
      }

      // Validate dates
      const start = new Date(startDate);
      const end = new Date(endDate);
      if (end < start) {
        return res.status(400).json({
          message: 'Ngày kết thúc phải sau hoặc bằng ngày bắt đầu.'
        });
      }

      // Create request (model will check for overlaps)
      const leaveRequest = await LeaveRequestModel.create({
        employeeId: employee_id,
        leaveType,
        startDate,
        endDate,
        reason
      });

      return res.status(201).json({
        message: 'Tạo yêu cầu nghỉ phép thành công',
        leaveRequest
      });
    } catch (error) {
      console.error('Create leave request error:', error);
      return res.status(500).json({
        message: error.message || 'Lỗi máy chủ nội bộ.',
        error: error.message
      });
    }
  }

  /**
   * Get my leave requests (Employee)
   */
  static async getMyLeaveRequests(req, res) {
    try {
      const { employee_id } = req.user;

      const leaveRequests = await LeaveRequestModel.getByEmployeeId(employee_id);

      return res.status(200).json({
        message: 'Lấy danh sách yêu cầu nghỉ phép thành công',
        leaveRequests
      });
    } catch (error) {
      console.error('Get my leave requests error:', error);
      return res.status(500).json({
        message: 'Lỗi máy chủ nội bộ.',
        error: error.message
      });
    }
  }

  /**
   * Get all pending leave requests (HR/Admin)
   */
  static async getPendingLeaveRequests(req, res) {
    try {
      const { role } = req.user;

      if (role !== 'Admin' && role !== 'HR') {
        return res.status(403).json({
          message: 'Chỉ Admin và HR mới có thể xem danh sách yêu cầu chờ phê duyệt.'
        });
      }

      const leaveRequests = await LeaveRequestModel.getAllPending();

      return res.status(200).json({
        message: 'Lấy danh sách yêu cầu chờ phê duyệt thành công',
        leaveRequests
      });
    } catch (error) {
      console.error('Get pending leave requests error:', error);
      return res.status(500).json({
        message: 'Lỗi máy chủ nội bộ.',
        error: error.message
      });
    }
  }

  /**
   * Get all leave requests with filters (HR/Admin)
   */
  static async getAllLeaveRequests(req, res) {
    try {
      const { role } = req.user;
      const { status, departmentId, startDate, endDate } = req.query;

      if (role !== 'Admin' && role !== 'HR') {
        return res.status(403).json({
          message: 'Chỉ Admin và HR mới có thể xem tất cả yêu cầu nghỉ phép.'
        });
      }

      const filters = {
        status,
        departmentId,
        startDate,
        endDate
      };

      const leaveRequests = await LeaveRequestModel.getAll(filters);

      return res.status(200).json({
        message: 'Lấy danh sách yêu cầu nghỉ phép thành công',
        leaveRequests
      });
    } catch (error) {
      console.error('Get all leave requests error:', error);
      return res.status(500).json({
        message: 'Lỗi máy chủ nội bộ.',
        error: error.message
      });
    }
  }

  /**
   * Approve leave request (HR/Admin)
   */
  static async approveLeaveRequest(req, res) {
    try {
      const { role, employee_id: approver_id } = req.user;
      const { employeeId, createdDate } = req.body;

      if (role !== 'Admin' && role !== 'HR') {
        return res.status(403).json({
          message: 'Chỉ Admin và HR mới có thể phê duyệt yêu cầu nghỉ phép.'
        });
      }

      if (!employeeId || !createdDate) {
        return res.status(400).json({
          message: 'Thiếu thông tin yêu cầu.'
        });
      }

      // Check if request exists
      const request = await LeaveRequestModel.getByEmployeeAndDate(employeeId, createdDate);
      if (!request) {
        return res.status(404).json({
          message: 'Yêu cầu nghỉ phép không tồn tại.'
        });
      }

      if (request.status !== 'pending') {
        return res.status(400).json({
          message: `Yêu cầu đã được ${request.status === 'approved' ? 'phê duyệt' : 'từ chối'} trước đó.`
        });
      }

      await LeaveRequestModel.approve(employeeId, createdDate, approver_id);

      return res.status(200).json({
        message: 'Phê duyệt yêu cầu nghỉ phép thành công'
      });
    } catch (error) {
      console.error('Approve leave request error:', error);
      return res.status(500).json({
        message: error.message || 'Lỗi máy chủ nội bộ.',
        error: error.message
      });
    }
  }

  /**
   * Reject leave request (HR/Admin)
   */
  static async rejectLeaveRequest(req, res) {
    try {
      const { role, employee_id: approver_id } = req.user;
      const { employeeId, createdDate, rejectReason } = req.body;

      if (role !== 'Admin' && role !== 'HR') {
        return res.status(403).json({
          message: 'Chỉ Admin và HR mới có thể từ chối yêu cầu nghỉ phép.'
        });
      }

      if (!employeeId || !createdDate) {
        return res.status(400).json({
          message: 'Thiếu thông tin yêu cầu.'
        });
      }

      if (!rejectReason) {
        return res.status(400).json({
          message: 'Vui lòng nhập lý do từ chối.'
        });
      }

      // Check if request exists
      const request = await LeaveRequestModel.getByEmployeeAndDate(employeeId, createdDate);
      if (!request) {
        return res.status(404).json({
          message: 'Yêu cầu nghỉ phép không tồn tại.'
        });
      }

      if (request.status !== 'pending') {
        return res.status(400).json({
          message: `Yêu cầu đã được ${request.status === 'approved' ? 'phê duyệt' : 'từ chối'} trước đó.`
        });
      }

      await LeaveRequestModel.reject(employeeId, createdDate, approver_id, rejectReason);

      return res.status(200).json({
        message: 'Đã từ chối yêu cầu nghỉ phép'
      });
    } catch (error) {
      console.error('Reject leave request error:', error);
      return res.status(500).json({
        message: error.message || 'Lỗi máy chủ nội bộ.',
        error: error.message
      });
    }
  }

  /**
   * Delete my leave request (Employee - only pending)
   */
  static async deleteMyLeaveRequest(req, res) {
    try {
      const { employee_id } = req.user;
      const { employeeId, createdDate } = req.body;

      if (!employeeId || !createdDate) {
        return res.status(400).json({
          message: 'Thiếu thông tin yêu cầu.'
        });
      }

      // Verify ownership
      if (employeeId !== employee_id) {
        return res.status(403).json({
          message: 'Bạn không có quyền xóa yêu cầu này.'
        });
      }

      await LeaveRequestModel.delete(employeeId, createdDate, employee_id);

      return res.status(200).json({
        message: 'Xóa yêu cầu nghỉ phép thành công'
      });
    } catch (error) {
      console.error('Delete leave request error:', error);
      return res.status(500).json({
        message: error.message || 'Lỗi máy chủ nội bộ.',
        error: error.message
      });
    }
  }

  /**
   * Get leave statistics (Employee)
   */
  static async getMyLeaveStats(req, res) {
    try {
      const { employee_id } = req.user;
      const year = req.query.year || new Date().getFullYear();

      const stats = await LeaveRequestModel.getStatsByEmployee(employee_id, year);

      return res.status(200).json({
        message: 'Lấy thống kê nghỉ phép thành công',
        stats,
        year
      });
    } catch (error) {
      console.error('Get leave stats error:', error);
      return res.status(500).json({
        message: 'Lỗi máy chủ nội bộ.',
        error: error.message
      });
    }
  }

  /**
   * Create overtime request (Employee)
   */
  static async createOvertimeRequest(req, res) {
    try {
      const { employee_id } = req.user;
      const { otDate, startTime, endTime, totalHours, reason } = req.body;

      // Validation
      if (!otDate || !startTime || !endTime || !totalHours) {
        return res.status(400).json({
          message: 'Vui lòng điền đầy đủ thông tin: ngày tăng ca, giờ bắt đầu, giờ kết thúc, tổng giờ.'
        });
      }

      // Validate times
      if (startTime >= endTime) {
        return res.status(400).json({
          message: 'Giờ kết thúc phải sau giờ bắt đầu.'
        });
      }

      // Create request (model will check for overlaps)
      const overtimeRequest = await OvertimeRequestModel.create({
        employeeId: employee_id,
        otDate,
        startTime,
        endTime,
        totalHours,
        reason
      });

      return res.status(201).json({
        message: 'Tạo yêu cầu tăng ca thành công',
        overtimeRequest
      });
    } catch (error) {
      console.error('Create overtime request error:', error);
      return res.status(500).json({
        message: error.message || 'Lỗi máy chủ nội bộ.',
        error: error.message
      });
    }
  }

  /**
   * Get my overtime requests (Employee)
   */
  static async getMyOvertimeRequests(req, res) {
    try {
      const { employee_id } = req.user;
      const requests = await OvertimeRequestModel.getByEmployeeId(employee_id);

      return res.status(200).json({
        message: 'Lấy danh sách yêu cầu tăng ca thành công',
        overtimeRequests: requests
      });
    } catch (error) {
      console.error('Get overtime requests error:', error);
      return res.status(500).json({
        message: 'Lỗi máy chủ nội bộ.',
        error: error.message
      });
    }
  }

  /**
   * Delete my overtime request (Employee)
   */
  static async deleteMyOvertimeRequest(req, res) {
    try {
      const { employee_id } = req.user;
      const { employeeId, createdDate } = req.body;

      if (!employeeId || !createdDate) {
        return res.status(400).json({
          message: 'Thiếu thông tin yêu cầu.'
        });
      }

      // Verify ownership
      if (employeeId !== employee_id) {
        return res.status(403).json({
          message: 'Bạn không có quyền xóa yêu cầu này.'
        });
      }

      await OvertimeRequestModel.delete(employeeId, createdDate, employee_id);

      return res.status(200).json({
        message: 'Xóa yêu cầu tăng ca thành công'
      });
    } catch (error) {
      console.error('Delete overtime request error:', error);
      return res.status(500).json({
        message: error.message || 'Lỗi máy chủ nội bộ.',
        error: error.message
      });
    }
  }

  /**
   * Get pending overtime requests (HR/Admin)
   */
  static async getPendingOvertimeRequests(req, res) {
    try {
      const requests = await OvertimeRequestModel.getAllPending();

      return res.status(200).json({
        message: 'Lấy danh sách yêu cầu tăng ca chờ duyệt thành công',
        overtimeRequests: requests
      });
    } catch (error) {
      console.error('Get pending overtime requests error:', error);
      return res.status(500).json({
        message: 'Lỗi máy chủ nội bộ.',
        error: error.message
      });
    }
  }

  /**
   * Get all overtime requests (HR/Admin)
   */
  static async getAllOvertimeRequests(req, res) {
    try {
      const filters = {
        status: req.query.status,
        employeeId: req.query.employeeId,
        startDate: req.query.startDate,
        endDate: req.query.endDate
      };

      const requests = await OvertimeRequestModel.getAll(filters);

      return res.status(200).json({
        message: 'Lấy danh sách yêu cầu tăng ca thành công',
        overtimeRequests: requests
      });
    } catch (error) {
      console.error('Get all overtime requests error:', error);
      return res.status(500).json({
        message: 'Lỗi máy chủ nội bộ.',
        error: error.message
      });
    }
  }

  /**
   * Approve overtime request (HR/Admin)
   */
  static async approveOvertimeRequest(req, res) {
    try {
      const { employee_id } = req.user;
      const { employeeId, createdDate } = req.body;

      if (!employeeId || !createdDate) {
        return res.status(400).json({
          message: 'Thiếu thông tin yêu cầu.'
        });
      }

      const overtimeRequest = await OvertimeRequestModel.approve(
        employeeId,
        createdDate,
        employee_id
      );

      return res.status(200).json({
        message: 'Duyệt yêu cầu tăng ca thành công',
        overtimeRequest
      });
    } catch (error) {
      console.error('Approve overtime request error:', error);
      return res.status(500).json({
        message: error.message || 'Lỗi máy chủ nội bộ.',
        error: error.message
      });
    }
  }

  /**
   * Reject overtime request (HR/Admin)
   */
  static async rejectOvertimeRequest(req, res) {
    try {
      const { employee_id } = req.user;
      const { employeeId, createdDate } = req.body;

      if (!employeeId || !createdDate) {
        return res.status(400).json({
          message: 'Thiếu thông tin yêu cầu.'
        });
      }

      const overtimeRequest = await OvertimeRequestModel.reject(
        employeeId,
        createdDate,
        employee_id
      );

      return res.status(200).json({
        message: 'Từ chối yêu cầu tăng ca thành công',
        overtimeRequest
      });
    } catch (error) {
      console.error('Reject overtime request error:', error);
      return res.status(500).json({
        message: error.message || 'Lỗi máy chủ nội bộ.',
        error: error.message
      });
    }
  }

  /**
   * Get overtime statistics (Employee)
   */
  static async getMyOvertimeStats(req, res) {
    try {
      const { employee_id } = req.user;
      const year = req.query.year || new Date().getFullYear();
      const month = req.query.month || null;

      const stats = await OvertimeRequestModel.getStatsByEmployee(employee_id, year, month);

      return res.status(200).json({
        message: 'Lấy thống kê tăng ca thành công',
        stats,
        year,
        month
      });
    } catch (error) {
      console.error('Get overtime stats error:', error);
      return res.status(500).json({
        message: 'Lỗi máy chủ nội bộ.',
        error: error.message
      });
    }
  }
}

module.exports = AuthController;


