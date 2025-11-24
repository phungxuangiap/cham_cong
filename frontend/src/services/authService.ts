import apiClient from './apiClient';

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface EmployeeRegisterData {
  fullName: string;
  dateOfBirth?: string;
  gender?: string;
  address?: string;
  phoneNumber?: string;
  personalEmail: string;
  companyEmail: string;
  departmentId: string;
  positionId: string;
  managerId?: string;
  username: string;
  password: string;
  role: string;
}

export interface AdminCreateAccountData {
  personalEmail: string;
  username: string;
  password: string;
  userRole: string;
  status?: string;
}

const authService = {
  // Login
  login: async (credentials: LoginCredentials) => {
    return apiClient.post('/auth/login', credentials);
  },

  // Employee Registration
  employeeRegister: async (userData: EmployeeRegisterData) => {
    return apiClient.post('/auth/employee-register', userData);
  },

  // Admin Create Account
  adminCreateAccount: async (userData: AdminCreateAccountData) => {
    return apiClient.post('/auth/admin-create-account', userData);
  },

  // Refresh Token
  refreshToken: async (refreshToken: string) => {
    return apiClient.post('/auth/refresh-token', { refreshToken });
  },

  // Get Profile
  getProfile: async (employeeId: string) => {
    return apiClient.get(`/auth/profile/${employeeId}`);
  },

  // Get All Employees
  getAllEmployees: async () => {
    return apiClient.get('/auth/employees');
  },

  // Update Profile
  updateProfile: async (employeeId: string, data: any) => {
    return apiClient.put(`/auth/update-profile/${employeeId}`, data);
  },

  // Get User Contract
  getUserContract: async (employeeId: string) => {
    return apiClient.get(`/auth/contract/${employeeId}`);
  },

  // Create User Contract
  createUserContract: async (data: any) => {
    return apiClient.post('/auth/contract', data);
  },

  // Get All Contracts (HR only)
  getAllContracts: async () => {
    return apiClient.get('/auth/contracts');
  },

  // Update User Contract
  updateUserContract: async (data: any) => {
    return apiClient.put('/auth/contract', data);
  },

  // ==================== DEPARTMENT SERVICES ====================

  // Get All Departments
  getAllDepartments: async () => {
    return apiClient.get('/auth/departments');
  },

  // Get Department By ID
  getDepartmentById: async (departmentId: string) => {
    return apiClient.get(`/auth/department/${departmentId}`);
  },

  // Create Department (Admin only)
  createDepartment: async (data: any) => {
    return apiClient.post('/auth/department', data);
  },

  // Update Department (Admin only)
  updateDepartment: async (departmentId: string, data: any) => {
    return apiClient.put(`/auth/department/${departmentId}`, data);
  },

  // Delete Department (Admin only)
  deleteDepartment: async (departmentId: string, transferToDepartmentId?: string) => {
    return apiClient.delete(`/auth/department/${departmentId}`, {
      data: { transferToDepartmentId }
    });
  },

  // ==================== WORK SHIFT SERVICES ====================

  // Get All Work Shifts
  getAllWorkShifts: async () => {
    return apiClient.get('/auth/work-shifts');
  },

  // Get Work Shift By ID
  getWorkShiftById: async (shiftId: string) => {
    return apiClient.get(`/auth/work-shift/${shiftId}`);
  },

  // Get Work Shifts By Department
  getWorkShiftsByDepartment: async (departmentId: string) => {
    return apiClient.get(`/auth/work-shifts/department/${departmentId}`);
  },

  // Create Work Shift (Admin/HR only)
  createWorkShift: async (data: any) => {
    return apiClient.post('/auth/work-shift', data);
  },

  // Update Work Shift (Admin/HR only)
  updateWorkShift: async (shiftId: string, data: any) => {
    return apiClient.put(`/auth/work-shift/${shiftId}`, data);
  },

  // Delete Work Shift (Admin only)
  deleteWorkShift: async (shiftId: string) => {
    return apiClient.delete(`/auth/work-shift/${shiftId}`);
  },

  // Cancel Pending Work Shift Update (Admin/HR)
  cancelPendingWorkShift: async (shiftId: string) => {
    return apiClient.delete(`/auth/work-shift/${shiftId}/pending`);
  },

  // ==================== DAILY TIMESHEET SERVICES ====================

  // Get My Timesheets
  getMyTimesheets: async (startDate?: string, endDate?: string) => {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    return apiClient.get(`/auth/my-timesheets?${params.toString()}`);
  },

  // Get Department Timesheet Stats (HR/Admin)
  getDepartmentTimesheetStats: async (date?: string) => {
    const params = date ? `?date=${date}` : '';
    return apiClient.get(`/auth/timesheets/department-stats${params}`);
  },

  // Get Department Employee Details (HR/Admin)
  getDepartmentEmployeeDetails: async (departmentId: string, date?: string) => {
    const params = date ? `?date=${date}` : '';
    return apiClient.get(`/auth/timesheets/department/${departmentId}/employees${params}`);
  },

  // Manual Generate Timesheets (Admin only)
  manualGenerateTimesheets: async (date?: string) => {
    return apiClient.post('/auth/timesheets/generate', { date });
  },

  // ==================== ATTENDANCE SERVICES ====================

  // User Check-in
  userCheckIn: async () => {
    return apiClient.post('/auth/attendance/check-in');
  },

  // User Check-out
  userCheckOut: async () => {
    return apiClient.post('/auth/attendance/check-out');
  },

  // Get Today's Attendance Status
  getTodayAttendanceStatus: async () => {
    return apiClient.get('/auth/attendance/today-status');
  },

  // ==================== LEAVE REQUEST SERVICES ====================

  // Create Leave Request
  createLeaveRequest: async (data: any) => {
    return apiClient.post('/auth/leave-request', data);
  },

  // Get My Leave Requests
  getMyLeaveRequests: async () => {
    return apiClient.get('/auth/my-leave-requests');
  },

  // Get My Leave Statistics
  getMyLeaveStats: async (year?: number) => {
    const params = year ? `?year=${year}` : '';
    return apiClient.get(`/auth/my-leave-stats${params}`);
  },

  // Delete My Leave Request
  deleteMyLeaveRequest: async (employeeId: string, createdDate: string) => {
    return apiClient.delete('/auth/leave-request', { data: { employeeId, createdDate } });
  },

  // Get All Pending Leave Requests (HR/Admin)
  getPendingLeaveRequests: async () => {
    return apiClient.get('/auth/leave-requests/pending');
  },

  // Get All Leave Requests with filters (HR/Admin)
  getAllLeaveRequests: async (filters?: any) => {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.departmentId) params.append('departmentId', filters.departmentId);
    if (filters?.startDate) params.append('startDate', filters.startDate);
    if (filters?.endDate) params.append('endDate', filters.endDate);
    return apiClient.get(`/auth/leave-requests?${params.toString()}`);
  },

  // Approve Leave Request (HR/Admin)
  approveLeaveRequest: async (employeeId: string, createdDate: string) => {
    return apiClient.put('/auth/leave-request/approve', { employeeId, createdDate });
  },

  // Reject Leave Request (HR/Admin)
  rejectLeaveRequest: async (employeeId: string, createdDate: string, rejectReason: string) => {
    return apiClient.put('/auth/leave-request/reject', { employeeId, createdDate, rejectReason });
  },

  // Logout
  logout: async () => {
    return apiClient.post('/auth/logout');
  },
};

export default authService;

