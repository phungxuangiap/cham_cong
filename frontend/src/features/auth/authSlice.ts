import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import authService, { type LoginCredentials, type EmployeeRegisterData, type AdminCreateAccountData } from '../../services/authService';

interface User {
  employee_id: string;
  username: string;
  role: string;
  full_name?: string;
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isLoading: boolean;
  isSuccess: boolean;
  isError: boolean;
  message: string;
}

const initialState: AuthState = {
  user: JSON.parse(localStorage.getItem('user') || 'null'),
  accessToken: localStorage.getItem('accessToken'),
  refreshToken: localStorage.getItem('refreshToken'),
  isLoading: false,
  isSuccess: false,
  isError: false,
  message: '',
};

// Async thunks
export const login = createAsyncThunk(
  'auth/login',
  async (credentials: LoginCredentials, { rejectWithValue }) => {
    try {
      const response = await authService.login(credentials);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Đăng nhập thất bại');
    }
  }
);

export const employeeRegister = createAsyncThunk(
  'auth/employeeRegister',
  async (userData: EmployeeRegisterData, { rejectWithValue }) => {
    try {
      const response = await authService.employeeRegister(userData);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Đăng ký thất bại');
    }
  }
);

export const adminCreateAccount = createAsyncThunk(
  'auth/adminCreateAccount',
  async (userData: AdminCreateAccountData, { rejectWithValue }) => {
    try {
      const response = await authService.adminCreateAccount(userData);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Tạo tài khoản thất bại');
    }
  }
);

export const logout = createAsyncThunk('auth/logout', async (_, { rejectWithValue }) => {
  try {
    await authService.logout();
    return null;
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || 'Đăng xuất thất bại');
  }
});

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    reset: (state) => {
      state.isLoading = false;
      state.isSuccess = false;
      state.isError = false;
      state.message = '';
    },
    setCredentials: (state, action: PayloadAction<any>) => {
      state.user = action.payload.user;
      state.accessToken = action.payload.accessToken;
      state.refreshToken = action.payload.refreshToken;
    },
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(login.pending, (state) => {
        state.isLoading = true;
        state.isError = false;
        state.message = '';
      })
      .addCase(login.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.accessToken = action.payload.accessToken;
        state.refreshToken = action.payload.refreshToken;
        state.user = {
          employee_id: action.payload.employee_id,
          username: action.payload.username,
          role: action.payload.role,
        };
        
        // Save to localStorage
        localStorage.setItem('accessToken', action.payload.accessToken);
        localStorage.setItem('refreshToken', action.payload.refreshToken);
        localStorage.setItem('user', JSON.stringify(state.user));
      })
      .addCase(login.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload as string;
      })
      // Employee Register
      .addCase(employeeRegister.pending, (state) => {
        state.isLoading = true;
        state.isError = false;
        state.message = '';
      })
      .addCase(employeeRegister.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.message = action.payload.message || 'Tạo nhân viên thành công';
        // Don't save tokens or login - this is for Admin/HR creating accounts for others
      })
      .addCase(employeeRegister.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload as string;
      })
      // Admin Create Account
      .addCase(adminCreateAccount.pending, (state) => {
        state.isLoading = true;
        state.isError = false;
        state.message = '';
      })
      .addCase(adminCreateAccount.fulfilled, (state) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.message = 'Tạo tài khoản thành công';
      })
      .addCase(adminCreateAccount.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload as string;
      })
      // Logout
      .addCase(logout.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
        state.accessToken = null;
        state.refreshToken = null;
        state.isLoading = false;
        state.isSuccess = true;
        
        // Clear localStorage
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
      })
      .addCase(logout.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload as string;
      });
  },
});

export const { reset, setCredentials } = authSlice.actions;
export default authSlice.reducer;
