const UserModel = require('../../models/user.model');
const EmployeeModel = require('../../models/employee.model');
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
}

module.exports = AuthController;
