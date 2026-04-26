'use client';

import React, { useMemo } from 'react';
import { LogOut } from 'lucide-react';
import { useTranslations } from '@/hooks/useTranslations';

/**
 * Sidebar Footer Component
 * Displays user profile information and logout button
 */
const SidebarFooter = ({ user, userRole, isRTL, onLogout, isCollapsed }) => {
  const { t } = useTranslations();

  const fallbackUserLabel = useMemo(() => {
    const translated = t('user');
    if (!translated || translated === 'common.user') {
      return isRTL ? 'مستخدم' : 'User';
    }
    return translated;
  }, [t, isRTL]);

  return (
    <footer className="p-4 bg-sidebar border-t border-sidebar-border">
      <div className={`bg-sidebar-accent rounded-xl p-3 border border-sidebar-border/50 backdrop-blur-sm ${isCollapsed ? 'flex justify-center' : ''}`}>
        <div className={`flex items-center ${isCollapsed ? 'justify-center flex-col gap-2' : 'gap-3'}`}>
          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center text-white font-bold text-sm shrink-0">
            {(user?.employeeName || user?.name) ? (user.employeeName || user.name).charAt(0) : 'U'}
          </div>
          
          {!isCollapsed && (
            <div className="flex-1 transition-opacity duration-300">
              <p className="text-sidebar-foreground font-medium text-sm truncate">
                {user?.employeeName || user?.name || fallbackUserLabel}
              </p>
              <p className="text-sidebar-foreground/70 text-xs truncate">
                {userRole || fallbackUserLabel}
              </p>
            </div>
          )}

          <button 
            onClick={onLogout}
            className={`text-sidebar-foreground/70 hover:text-red-600 transition-colors duration-200 p-1 rounded focus:outline-none focus:ring-2 focus:ring-red-300 ${isCollapsed ? 'mt-2' : ''}`}
            aria-label={t('buttons.logout') || (isRTL ? "تسجيل الخروج" : "Logout")}
            title={t('buttons.logout') || (isRTL ? "تسجيل الخروج" : "Logout")}
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>
    </footer>
  );
};

export default SidebarFooter;
