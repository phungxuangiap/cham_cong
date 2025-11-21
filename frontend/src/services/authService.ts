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

  // Logout
  logout: async () => {
    return apiClient.post('/auth/logout');
  },
};

export default authService;
