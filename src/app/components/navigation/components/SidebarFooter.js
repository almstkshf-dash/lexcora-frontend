'use client';

import React, { useMemo } from 'react';
import { LogOut } from 'lucide-react';
import { useTranslations } from '@/hooks/useTranslations';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

/**
 * Sidebar Footer Component
 * Displays user profile information and logout button with premium modern design
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

  const displayName = user?.employeeName || user?.name || fallbackUserLabel;
  const displayRole = userRole || fallbackUserLabel;

  return (
    <footer className="p-4 bg-sidebar border-t border-sidebar-border/40">
      <div className={`group bg-sidebar-accent/40 hover:bg-sidebar-accent/60 rounded-2xl p-3 border border-sidebar-border/30 backdrop-blur-md transition-all duration-300 hover:shadow-lg hover:shadow-primary/5 ${isCollapsed ? 'flex justify-center' : ''}`}>
        <div className={`flex items-center ${isCollapsed ? 'justify-center flex-col gap-2' : 'gap-3'}`}>
          {/* Avatar Container with Status Indicator */}
          <div className="relative shrink-0 transition-transform duration-300 group-hover:scale-105">
            <Avatar className="w-10 h-10 border-2 border-primary/20 ring-2 ring-transparent group-hover:ring-primary/10 transition-all">
              <AvatarImage src={user?.profileImage || user?.image} alt={displayName} className="object-cover" />
              <AvatarFallback className="bg-gradient-to-br from-primary via-blue-600 to-purple-600 text-white font-bold text-sm">
                {displayName.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-sidebar rounded-full shadow-sm animate-pulse"></span>
          </div>
          
          {!isCollapsed && (
            <div className="flex-1 min-w-0 transition-all duration-300">
              <p className="text-sidebar-foreground font-semibold text-sm truncate group-hover:text-primary transition-colors">
                {displayName}
              </p>
              <p className="text-sidebar-foreground/50 text-[10px] uppercase tracking-wider font-bold truncate mt-0.5">
                {displayRole}
              </p>
            </div>
          )}

          <TooltipProvider delayDuration={300}>
            <Tooltip>
              <TooltipTrigger asChild>
                <button 
                  onClick={onLogout}
                  className={`relative p-2 rounded-xl text-sidebar-foreground/40 hover:text-red-500 hover:bg-red-500/10 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-red-500/20 ${isCollapsed ? 'mt-2' : ''}`}
                  aria-label={t('buttons.logout') || (isRTL ? "تسجيل الخروج" : "Logout")}
                >
                  <span className="sr-only">{t('buttons.logout') || (isRTL ? "تسجيل الخروج" : "Logout")}</span>
                  <LogOut className="w-5 h-5 transition-transform group-hover:translate-x-0.5" />
                </button>
              </TooltipTrigger>
              <TooltipContent side={isRTL ? "right" : "left"} className="bg-destructive text-destructive-foreground">
                <p>{t('buttons.logout')}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
    </footer>
  );
};

export default SidebarFooter;
