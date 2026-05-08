import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  isAuth: false,
  jobId: null,
  email: null,
  roleAr: null,
  roleEn: null,
  departmentAr: null,
  departmentEn: null,
  permissions: [],
  user: null,
  loading: false,
  error: null
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    loginSuccess: (state, action) => {
      const { user = null, permissions = [] } = action.payload || {};
      state.isAuth = true;
      state.jobId = user?.job_id ?? user?.id ?? null;
      state.email = user?.email ?? null;
      state.roleAr = user?.role_ar ?? null;
      state.roleEn = user?.role_en ?? null;
      state.departmentAr = user?.department_ar ?? null;
      state.departmentEn = user?.department_en ?? null;
      state.permissions = Array.isArray(permissions) ? permissions : [];
      state.user = user;
      state.loading = false;
      state.error = null;
    },
    loginFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
      state.isAuth = false;
    },
    logout: (state) => {
      state.isAuth = false;
      state.jobId = null;
      state.email = null;
      state.roleAr = null;
      state.roleEn = null;
      state.departmentAr = null;
      state.departmentEn = null;
      state.permissions = [];
      state.user = null;
      state.loading = false;
      state.error = null;
    },
    clearError: (state) => {
      state.error = null;
    },
    // Action to restore auth state from localStorage/cookies on app load
    restoreAuth: (state, action) => {
      const { user, permissions } = action.payload;
      if (user) {
        state.isAuth = true;
        state.jobId = user.id; // Use 'id' instead of 'job_id' to match API response
        state.email = user.email;
        state.roleAr = user.role_ar;
        state.roleEn = user.role_en;
        state.departmentAr = user.department_ar;
        state.departmentEn = user.department_en;
        state.permissions = Array.isArray(permissions) ? permissions : [];
        state.user = user;
        state.loading = false; // Reset loading state
        state.error = null; // Clear any previous errors
      }
    }
  }
});

export const {
  loginStart,
  loginSuccess,
  loginFailure,
  logout,
  clearError,
  restoreAuth
} = authSlice.actions;

// Selectors
export const selectAuth = (state) => state.auth;
export const selectIsAuth = (state) => state.auth.isAuth;
export const selectUser = (state) => state.auth.user;
export const selectPermissions = (state) => state.auth.permissions;
export const selectAuthLoading = (state) => state.auth.loading;
export const selectAuthError = (state) => state.auth.error;

export default authSlice.reducer;
