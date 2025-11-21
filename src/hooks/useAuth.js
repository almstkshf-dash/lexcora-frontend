import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { 
  selectAuth, 
  selectIsAuth, 
  selectUser, 
  selectPermissions, 
  selectAuthLoading, 
  selectAuthError 
} from '@/redux/slices/authSlice';

/**
 * Custom hook to access authentication state and user information
 * @returns {Object} Auth state and user data
 */
export const useAuth = () => {
  const auth = useSelector(selectAuth);
  const isAuth = useSelector(selectIsAuth);
  const user = useSelector(selectUser);
  const permissions = useSelector(selectPermissions);
  const loading = useSelector(selectAuthLoading);
  const error = useSelector(selectAuthError);

  return {
    ...auth,
    isAuth,
    user,
    permissions,
    loading,
    error,
    // Convenience getters
    isAuthenticated: isAuth,
    jobId: auth.jobId,
    email: auth.email,
    roleAr: auth.roleAr,
    roleEn: auth.roleEn,
    departmentAr: auth.departmentAr,
    departmentEn: auth.departmentEn,
  };
};

/**
 * Hook to check if user has specific permission
 * @param {string} permissionName - Permission name to check (Arabic or English)
 * @returns {boolean} Whether user has the permission
 */
export const usePermission = (permissionName) => {
  const permissions = useSelector(selectPermissions);
  const role = useSelector(s => s.auth.roleEn);
  const department = useSelector(s => s.auth.departmentEn);

  const normalizePermission = (perm) => {
    if (!perm) return null;
    if (typeof perm === 'string') return perm.trim().toLowerCase();
    if (typeof perm === 'number') return perm.toString();

    // Common backend shapes
    const candidates = [
      perm.permission_key,
      perm.permission_name,
      perm.permission_en,
      perm.permission_ar,
      perm.name,
      perm.code,
      perm.id,
      perm.permission_id
    ].filter(Boolean);

    if (candidates.length === 0) return null;
    return candidates[0].toString().trim().toLowerCase();
  };

  const permissionSet = useMemo(() => {
    const set = new Set();
    if (!Array.isArray(permissions)) return set;
    permissions.forEach((perm) => {
      const normalized = normalizePermission(perm);
      if (normalized) set.add(normalized);
    });
    return set;
  }, [permissions]);

  const checkAny = (requested) => {
    if (!requested) return true; // allow when nothing requested
    const list = Array.isArray(requested) ? requested : [requested];
    return list.some((r) => {
      const normalized = normalizePermission(r);
      return normalized ? permissionSet.has(normalized) : false;
    });
  };

  const checkAll = (requested) => {
    if (!requested) return true;
    const list = Array.isArray(requested) ? requested : [requested];
    return list.every((r) => {
      const normalized = normalizePermission(r);
      return normalized ? permissionSet.has(normalized) : false;
    });
  };

  return { 
    permissions, 
    hasPermission: checkAny(permissionName), 
    hasAnyPermission: checkAny,
    hasAllPermissions: checkAll,
    role, 
    department 
  };
};

/**
 * Hook to get user role in preferred language
 * @param {string} language - 'ar' for Arabic, 'en' for English
 * @returns {string|null} User role in specified language
 */
export const useUserRole = (language = 'ar') => {
  const auth = useSelector(selectAuth);
  
  return language === 'ar' ? auth.roleAr : auth.roleEn;
};

/**
 * Hook to get user department in preferred language
 * @param {string} language - 'ar' for Arabic, 'en' for English
 * @returns {string|null} User department in specified language
 */
export const useUserDepartment = (language = 'ar') => {
  const auth = useSelector(selectAuth);
  
  return language === 'ar' ? auth.departmentAr : auth.departmentEn;
};
