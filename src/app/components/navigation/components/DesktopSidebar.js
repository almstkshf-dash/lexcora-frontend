'use client';

import React, { useState } from 'react';
import SidebarHeader from './SidebarHeader';
import NavigationMenu from './NavigationMenu';
import SidebarFooter from './SidebarFooter';

/**
 * Desktop Sidebar Component
 * Handles desktop navigation sidebar
 */
const DesktopSidebar = ({ 
  menuItems,
  activeItem,
  openSubmenus,
  onNavClick,
  onToggleSubmenu,
  user,
  userRole,
  onLogout,
  isRTL,
  sidebarRef
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <aside
      dir={isRTL ? "rtl" : "ltr"}
      ref={sidebarRef}
      className={`
        sidebar-transition 
        ${isCollapsed ? 'w-20' : 'w-64'}
        h-screen 
        shadow-2xl 
        relative 
        flex 
        flex-col
        bg-sidebar
        ${isRTL ? 'sidebar-right' : 'sidebar-left'}
        transition-all 
        duration-300 
        ease-in-out
        z-40
      `}
      role="navigation"
      aria-label="Main navigation"
    >
      {/* Logo Section */}
      <SidebarHeader 
        isRTL={isRTL} 
        isCollapsed={isCollapsed}
        onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
      />
      
      {/* Navigation Menu */}
      <NavigationMenu 
        menuItems={menuItems}
        activeItem={activeItem}
        openSubmenus={openSubmenus}
        onNavClick={onNavClick}
        onToggleSubmenu={onToggleSubmenu}
        isRTL={isRTL}
        isCollapsed={isCollapsed}
      />
      
      {/* User Profile Section */}
      <SidebarFooter 
        user={user}
        userRole={userRole}
        isRTL={isRTL}
        onLogout={onLogout}
        isCollapsed={isCollapsed}
      />
    </aside>
  );
};

export default DesktopSidebar;
