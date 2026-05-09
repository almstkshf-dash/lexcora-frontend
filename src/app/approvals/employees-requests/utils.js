/**
 * Utility functions for Employee Requests
 */

/**
 * Format date to localized string
 */
export const formatDate = (dateString, language = 'en') => {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return date.toLocaleDateString(language === 'ar' ? 'ar-AE' : 'en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

/**
 * Check if user is admin
 */
export const isAdminRole = (role) => {
  return role?.toLowerCase() === 'admin';
};

/**
 * Check if user is HR
 */
export const isHRRole = (department, language = 'en') => {
  if (!department) return false;
  const dept = department.toLowerCase();
  return dept === 'human resources' || dept === 'الموارد البشرية' || dept === 'hr';
};

/**
 * Get status badge configuration
 */
export const getStatusBadgeConfig = (status) => {
  const configs = {
    approved: {
      className: 'bg-green-500',
      label: 'Approved'
    },
    rejected: {
      className: 'bg-red-500',
      label: 'Rejected'
    },
    pending: {
      className: 'bg-yellow-500',
      label: 'Pending'
    }
  };
  
  return configs[status] || configs.pending;
};

/**
 * Filter requests for admin view
 * Admin sees requests that still need approval from admin or HR
 */
export const filterAdminRequests = (requests) => {
  if (!requests) return [];
  return requests.filter(req => 
    req.manager_approval === 'pending' || req.hr_approval === 'pending'
  );
};

/**
 * Filter requests for HR view
 * HR sees requests that need HR approval
 */
export const filterHRRequests = (requests) => {
  if (!requests) return [];
  return requests.filter(req => req.hr_approval === 'pending');
};

/**
 * Filter requests for employee view
 * Employee sees only their own requests
 */
export const filterEmployeeRequests = (requests, employeeId) => {
  if (!requests || !employeeId) return [];
  return requests.filter(req => req.employee_id === employeeId);
};

/**
 * Ensure the input is always an array
 */
export const safeArray = (data) => Array.isArray(data) ? data : [];
