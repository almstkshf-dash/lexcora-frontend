'use client';

import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTranslations } from '@/hooks/useTranslations';
import { useIsMobile } from '@/hooks/use-mobile';
import { useAuth, useUserRole } from '@/hooks/useAuth';
import { useDispatch } from 'react-redux';
import { logoutWithRedux } from '@/app/services/api/auth';

import MobileSidebar from './components/MobileSidebar';
import DesktopSidebar from './components/DesktopSidebar';
import { useKeyboardNavigation } from './hooks/useKeyboardNavigation';
import { getMenuItems } from './config/menuConfig';

/**
 * AppSidebar
 *
 * Changes vs. original:
 *  1. `allowAllMenu` moved inside `useMemo` — it was a derived bool already
 *     in the dep array, causing an extra recomputation on every render.
 *  2. Silent `catch` in `handleLogout` replaced with `console.error`; a
 *     toast notification can be added here once a toast context is available.
 *  3. Click-outside handler now uses the reactive `isMobile` value instead
 *     of reading `window.innerWidth` on every global click.
 *  4. Removed redundant `closeMobileSidebar` wrapper — `onMobileSidebarClose`
 *     is passed directly (stabilised with optional-chaining at call sites).
 */
const AppSidebar = ({ isMobileSidebarOpen, onMobileSidebarClose }) => {
  const [openSubmenus, setOpenSubmenus] = useState({});
  const [activeItem, setActiveItem] = useState('/');
  const router = useRouter();
  const pathname = usePathname();
  const sidebarRef = useRef(null);
  const dispatch = useDispatch();
  const isMobile = useIsMobile();
  const { isRTL } = useLanguage();
  const { t } = useTranslations();
  const { user, roleEn, departmentEn, permissions } = useAuth();
  const userRole = useUserRole(isRTL ? 'ar' : 'en');

  // allowAllMenu computed inside useMemo — both deps it derives from
  // (roleEn, permissions) are already tracked there, avoiding a double dep.
  const menuItems = useMemo(() => {
    const allowAllMenu =
      (roleEn && roleEn.toLowerCase().includes('admin')) ||
      !permissions ||
      permissions.length === 0;
    return getMenuItems(t, roleEn, departmentEn, permissions, { allowAll: allowAllMenu });
  }, [t, roleEn, departmentEn, permissions]);

  const toggleSubmenu = useCallback((menuId) => {
    setOpenSubmenus(prev => ({ ...prev, [menuId]: !prev[menuId] }));
  }, []);

  const handleNavClick = useCallback((itemId, itemType) => {
    if (itemType === 'category') {
      toggleSubmenu(itemId);
      return;
    }
    setActiveItem(itemId);
    router.push(`/${itemId === '/' ? '' : itemId}`);
    if (isMobile && onMobileSidebarClose) {
      onMobileSidebarClose();
    }
  }, [router, isMobile, toggleSubmenu, onMobileSidebarClose]);

  const handleLogout = useCallback(async () => {
    try {
      await dispatch(logoutWithRedux());
      router.push('/login');
    } catch (error) {
      // Log the error — replace with toast notification when toast context is available
      console.error('[AppSidebar] Logout failed:', error);
    }
  }, [dispatch, router]);

  useKeyboardNavigation(menuItems, activeItem, setActiveItem, handleNavClick);

  // Precompute best matching item for the current path
  const { bestMatch, bestParent } = useMemo(() => {
    if (!pathname || !menuItems?.length) {
      return { bestMatch: '/', bestParent: null };
    }
    const normalizedPath = pathname.replace(/^\/+/, '');
    let foundMatch = '/';
    let parentId = null;
    let longest = 0;

    const traverse = (items, parent = null) => {
      items.forEach((item) => {
        const itemPath = item.id === '/' ? '' : item.id.replace(/^\/+/, '');
        const isMatch =
          item.id === '/'
            ? normalizedPath === ''
            : normalizedPath === itemPath || normalizedPath.startsWith(`${itemPath}/`);
        if (isMatch && itemPath.length >= longest) {
          foundMatch = item.id;
          parentId = parent;
          longest = itemPath.length;
        }
        if (item.submenu) traverse(item.submenu, item.id);
      });
    };

    traverse(menuItems);
    return { bestMatch: foundMatch, bestParent: parentId };
  }, [pathname, menuItems]);

  // Sync active item and open matching submenu on load / navigation
  useEffect(() => {
    setActiveItem((prev) => (prev === bestMatch ? prev : bestMatch));
    if (bestParent) {
      setOpenSubmenus((prev) =>
        prev[bestParent]
          ? prev
          : { ...prev, [bestParent]: true }
      );
    }
  }, [bestMatch, bestParent]);

  // Close submenus / sidebar when clicking outside (mobile only)
  // Uses reactive `isMobile` instead of reading window.innerWidth on every click
  useEffect(() => {
    if (!isMobile) return;

    const handleClickOutside = (event) => {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target)) {
        setOpenSubmenus({});
        onMobileSidebarClose?.();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMobile, onMobileSidebarClose]);

  if (isMobile) {
    return (
      <MobileSidebar
        isOpen={isMobileSidebarOpen}
        onClose={onMobileSidebarClose}
        menuItems={menuItems}
        activeItem={activeItem}
        openSubmenus={openSubmenus}
        onNavClick={handleNavClick}
        onToggleSubmenu={toggleSubmenu}
        user={user}
        userRole={userRole}
        onLogout={handleLogout}
        isRTL={isRTL}
        sidebarRef={sidebarRef}
      />
    );
  }

  return (
    <DesktopSidebar
      menuItems={menuItems}
      activeItem={activeItem}
      openSubmenus={openSubmenus}
      onNavClick={handleNavClick}
      onToggleSubmenu={toggleSubmenu}
      user={user}
      userRole={userRole}
      onLogout={handleLogout}
      isRTL={isRTL}
      sidebarRef={sidebarRef}
    />
  );
};

export default AppSidebar;
