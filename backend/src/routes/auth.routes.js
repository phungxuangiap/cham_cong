const express = require('express');
const AuthController = require('../controllers/auth.controller');
const AuthMiddleware = require('../middleware/auth.middleware');

const router = express.Router();

// Public routes
router.post('/login', AuthController.login);
router.post('/refresh-token', AuthController.refreshAccessToken);
router.post('/logout', AuthController.logout);

// Protected routes - require access token and Admin/HR role
router.post('/employee-register',
  AuthMiddleware.verifyAccessToken,
  AuthMiddleware.verifyAdminOrHR,
  AuthController.employeeRegister
);

router.post('/admin-create-account', 
  AuthMiddleware.verifyAccessToken,
  AuthMiddleware.verifyAdminOrHR,
  AuthController.adminCreateAccount
);

router.get('/profile/:employeeId', AuthController.getProfile);

// Get all employees - protected route for Admin/HR
router.get('/employees',
  AuthMiddleware.verifyAccessToken,
  AuthController.getAllEmployees
);

// Update profile - protected route
router.put('/update-profile/:employeeId',
  AuthMiddleware.verifyAccessToken,
  AuthController.updateProfile
);

// Get user contract - protected route
router.get('/contract/:employeeId',
  AuthMiddleware.verifyAccessToken,
  AuthController.getUserContract
);

// Create user contract - protected route for Admin/HR
router.post('/contract',
  AuthMiddleware.verifyAccessToken,
  AuthMiddleware.verifyAdminOrHR,
  AuthController.createUserContract
);

// Get all contracts - protected route for HR only
router.get('/contracts',
  AuthMiddleware.verifyAccessToken,
  AuthController.getAllContracts
);

// Update user contract - protected route for Admin/HR
router.put('/contract',
  AuthMiddleware.verifyAccessToken,
  AuthMiddleware.verifyAdminOrHR,
  AuthController.updateUserContract
);

// ==================== DEPARTMENT ROUTES ====================

// Get all departments - all authenticated users
router.get('/departments',
  AuthMiddleware.verifyAccessToken,
  AuthController.getAllDepartments
);

// Get department by ID - all authenticated users
router.get('/department/:departmentId',
  AuthMiddleware.verifyAccessToken,
  AuthController.getDepartmentById
);

// Create department - Admin only
router.post('/department',
  AuthMiddleware.verifyAccessToken,
  AuthMiddleware.verifyAdmin,
  AuthController.createDepartment
);

// Update department - Admin only
router.put('/department/:departmentId',
  AuthMiddleware.verifyAccessToken,
  AuthMiddleware.verifyAdmin,
  AuthController.updateDepartment
);

// Delete department - Admin only
router.delete('/department/:departmentId',
  AuthMiddleware.verifyAccessToken,
  AuthMiddleware.verifyAdmin,
  AuthController.deleteDepartment
);

// ==================== WORK SHIFT ROUTES ====================

// Get all work shifts - all authenticated users
router.get('/work-shifts',
  AuthMiddleware.verifyAccessToken,
  AuthController.getAllWorkShifts
);

// Get work shift by ID - all authenticated users
router.get('/work-shift/:shiftId',
  AuthMiddleware.verifyAccessToken,
  AuthController.getWorkShiftById
);

// Get work shifts by department - all authenticated users
router.get('/work-shifts/department/:departmentId',
  AuthMiddleware.verifyAccessToken,
  AuthController.getWorkShiftsByDepartment
);

// Create work shift - Admin/HR only
router.post('/work-shift',
  AuthMiddleware.verifyAccessToken,
  AuthMiddleware.verifyAdminOrHR,
  AuthController.createWorkShift
);

// Update work shift - Admin/HR only
router.put('/work-shift/:shiftId',
  AuthMiddleware.verifyAccessToken,
  AuthMiddleware.verifyAdminOrHR,
  AuthController.updateWorkShift
);

// Delete work shift - Admin only
router.delete('/work-shift/:shiftId',
  AuthMiddleware.verifyAccessToken,
  AuthMiddleware.verifyAdmin,
  AuthController.deleteWorkShift
);

// Legacy route
router.post('/register', AuthController.register);

module.exports = router;
