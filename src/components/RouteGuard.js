'use client';

import { useEffect, useMemo } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import AccessDenied from '@/components/AccessDenied';
import { useAuth, usePermission } from '@/hooks/useAuth';
import { getRequiredPermissionsForPath, PUBLIC_PATHS } from '@/lib/permissions';

export default function RouteGuard({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuth, loading, permissions = [], roleEn } = useAuth();
  const { hasAnyPermission } = usePermission();

  const isPublicRoute = PUBLIC_PATHS.includes(pathname);
  const requiredPermissions = useMemo(
    () => getRequiredPermissionsForPath(pathname),
    [pathname]
  );

  const allowAll =
    (roleEn && roleEn.toLowerCase().includes('admin')) ||
    !permissions ||
    permissions.length === 0;

  useEffect(() => {
    if (loading || isPublicRoute) return;
    if (!isAuth && pathname !== '/login') {
      router.push('/login');
    }
  }, [isAuth, isPublicRoute, loading, pathname, router]);

  if (loading) {
    return null;
  }

  if (!isAuth && !isPublicRoute) {
    return null;
  }

  const hasPermission =
    allowAll ||
    !requiredPermissions ||
    requiredPermissions.length === 0 ||
    hasAnyPermission(requiredPermissions);

  if (!hasPermission) {
    return <AccessDenied requiredPermissions={requiredPermissions} />;
  }

  return children;
}
