import api from "./axiosInstance";

export const login = async (username, password) => {
  const response = await api.post("/auth/login", { username, password });
  return response.data;
};

export const logout = async () => {
  const response = await api.post("/auth/logout");
  return response.data;
};

export const getProfile = async () => {
  const response = await api.get("/auth/me");
  return response.data;
};

// Thunk action for login with Redux integration
export const loginWithRedux = (username, password) => async (dispatch) => {
  try {
    dispatch({ type: 'auth/loginStart' });
    const data = await login(username, password);
    
    if (data.success) {
      // Store token in localStorage for production compatibility
      if (data.token && typeof window !== 'undefined') {
        localStorage.setItem('authToken', data.token);
      }
      
      dispatch({
        type: 'auth/loginSuccess',
        payload: {
          user: data.data.user,
          permissions: Array.isArray(data.data.permissions) ? data.data.permissions : []
        }
      });
      
      return { success: true, data };
    } else {
      dispatch({
        type: 'auth/loginFailure',
        payload: data.message || 'Login failed'
      });
      return { success: false, error: data.message };
    }
  } catch (error) {
    const errorMessage = error.response?.data?.message || error.message || 'Login failed';
    dispatch({
      type: 'auth/loginFailure',
      payload: errorMessage
    });
    return { success: false, error: errorMessage };
  }
};

// Thunk action for logout with Redux integration
export const logoutWithRedux = () => async (dispatch) => {
  try {
    await logout();
    
    // Clear token from localStorage
    if (typeof window !== 'undefined') {
      localStorage.removeItem('authToken');
    }
    
    dispatch({ type: 'auth/logout' });
    return { success: true };
  } catch (error) {
    // Even if logout API fails, clear local state
    if (typeof window !== 'undefined') {
      localStorage.removeItem('authToken');
    }
    dispatch({ type: 'auth/logout' });
    return { success: false, error: error.message };
  }
};

// Thunk action to check authentication status using getProfile
export const checkAuthStatus = () => async (dispatch) => {
  try {
    const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
    
    if (!token) {
      dispatch({ type: 'auth/logout' });
      return { success: false, error: 'No token found' };
    }
    
    dispatch({ type: 'auth/loginStart' });
    const response = await getProfile();
    
    // Check if the response has the expected structure: { success: true, data: { user object }, permissions: [...] }
    if (response && response.success && response.data) {
      dispatch({
        type: 'auth/restoreAuth',
        payload: {
          user: response.data.user,
          permissions: Array.isArray(response.data.permissions) ? response.data.permissions : []
        }
      });
      return { success: true, user: response.data.user };
    } else {
      // Handle case where API returns success: false or no user data
      dispatch({ type: 'auth/logout' });
      return { success: false, error: 'Authentication failed' };
    }
  } catch (error) {
    dispatch({ type: 'auth/logout' });
    return { 
      success: false, 
      error: error.response?.data?.message || error.message || 'Authentication check failed'
    };
  }
};


