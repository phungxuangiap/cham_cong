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

// Cancel pending work shift update - Admin/HR only
router.delete('/work-shift/:shiftId/pending',
  AuthMiddleware.verifyAccessToken,
  AuthMiddleware.verifyAdminOrHR,
  AuthController.cancelPendingWorkShift
);

// ==================== DAILY TIMESHEET ROUTES ====================

// Get my timesheets - all authenticated users
router.get('/my-timesheets',
  AuthMiddleware.verifyAccessToken,
  AuthController.getMyTimesheets
);

// Get department timesheet stats - HR/Admin only
router.get('/timesheets/department-stats',
  AuthMiddleware.verifyAccessToken,
  AuthController.getDepartmentTimesheetStats
);

// Get department employee details - HR/Admin only
router.get('/timesheets/department/:departmentId/employees',
  AuthMiddleware.verifyAccessToken,
  AuthController.getDepartmentEmployeeDetails
);

// Manual generate timesheets - Admin only
router.post('/timesheets/generate',
  AuthMiddleware.verifyAccessToken,
  AuthMiddleware.verifyAdmin,
  AuthController.manualGenerateTimesheets
);

// User check-in - all authenticated users
router.post('/attendance/check-in',
  AuthMiddleware.verifyAccessToken,
  AuthController.userCheckIn
);

// User check-out - all authenticated users
router.post('/attendance/check-out',
  AuthMiddleware.verifyAccessToken,
  AuthController.userCheckOut
);

// Get today's attendance status - all authenticated users
router.get('/attendance/today-status',
  AuthMiddleware.verifyAccessToken,
  AuthController.getTodayAttendanceStatus
);

// ==================== LEAVE REQUEST ROUTES ====================

// Create leave request - all authenticated users
router.post('/leave-request',
  AuthMiddleware.verifyAccessToken,
  AuthController.createLeaveRequest
);

// Get my leave requests - all authenticated users
router.get('/my-leave-requests',
  AuthMiddleware.verifyAccessToken,
  AuthController.getMyLeaveRequests
);

// Get my leave statistics - all authenticated users
router.get('/my-leave-stats',
  AuthMiddleware.verifyAccessToken,
  AuthController.getMyLeaveStats
);

// Delete my leave request - all authenticated users
router.delete('/leave-request',
  AuthMiddleware.verifyAccessToken,
  AuthController.deleteMyLeaveRequest
);

// Get all pending leave requests - HR/Admin only
router.get('/leave-requests/pending',
  AuthMiddleware.verifyAccessToken,
  AuthMiddleware.verifyAdminOrHR,
  AuthController.getPendingLeaveRequests
);

// Get all leave requests with filters - HR/Admin only
router.get('/leave-requests',
  AuthMiddleware.verifyAccessToken,
  AuthMiddleware.verifyAdminOrHR,
  AuthController.getAllLeaveRequests
);

// Approve leave request - HR/Admin only
router.put('/leave-request/approve',
  AuthMiddleware.verifyAccessToken,
  AuthMiddleware.verifyAdminOrHR,
  AuthController.approveLeaveRequest
);

// Reject leave request - HR/Admin only
router.put('/leave-request/reject',
  AuthMiddleware.verifyAccessToken,
  AuthMiddleware.verifyAdminOrHR,
  AuthController.rejectLeaveRequest
);

// ==================== OVERTIME REQUEST ROUTES ====================

// Create overtime request - all authenticated users
router.post('/overtime-request',
  AuthMiddleware.verifyAccessToken,
  AuthController.createOvertimeRequest
);

// Get my overtime requests - all authenticated users
router.get('/my-overtime-requests',
  AuthMiddleware.verifyAccessToken,
  AuthController.getMyOvertimeRequests
);

// Delete my overtime request - all authenticated users
router.delete('/overtime-request',
  AuthMiddleware.verifyAccessToken,
  AuthController.deleteMyOvertimeRequest
);

// Get my overtime stats - all authenticated users
router.get('/my-overtime-stats',
  AuthMiddleware.verifyAccessToken,
  AuthController.getMyOvertimeStats
);

// Get pending overtime requests - HR/Admin only
router.get('/overtime-requests/pending',
  AuthMiddleware.verifyAccessToken,
  AuthMiddleware.verifyAdminOrHR,
  AuthController.getPendingOvertimeRequests
);

// Get all overtime requests with filters - HR/Admin only
router.get('/overtime-requests',
  AuthMiddleware.verifyAccessToken,
  AuthMiddleware.verifyAdminOrHR,
  AuthController.getAllOvertimeRequests
);

// Approve overtime request - HR/Admin only
router.put('/overtime-request/approve',
  AuthMiddleware.verifyAccessToken,
  AuthMiddleware.verifyAdminOrHR,
  AuthController.approveOvertimeRequest
);

// Reject overtime request - HR/Admin only
router.put('/overtime-request/reject',
  AuthMiddleware.verifyAccessToken,
  AuthMiddleware.verifyAdminOrHR,
  AuthController.rejectOvertimeRequest
);

// Legacy route
router.post('/register', AuthController.register);

module.exports = router;

