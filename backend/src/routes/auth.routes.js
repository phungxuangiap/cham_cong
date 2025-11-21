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

// Legacy route
router.post('/register', AuthController.register);

module.exports = router;
