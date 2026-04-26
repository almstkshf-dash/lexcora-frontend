import React from 'react';
import MenuItem from './MenuItem';

/**
 * Navigation Menu Component
 * Renders the list of menu items
 */
const NavigationMenu = ({ 
  menuItems, 
  activeItem, 
  openSubmenus, 
  onNavClick, 
  onToggleSubmenu, 
  isRTL,
  isCollapsed
}) => {
  return (
    <nav className={`flex-1 overflow-y-auto mt-6 ${isCollapsed ? 'px-2' : 'px-4'}`} aria-label={isRTL ? 'قائمة التنقل' : 'Navigation Menu'}>
      <ul className="space-y-2">
        {menuItems.map((item) => (
          <li key={item.id} className='cursor-pointer'>
            <MenuItem
              item={item}
              activeItem={activeItem}
              openSubmenus={openSubmenus}
              onNavClick={onNavClick}
              onToggleSubmenu={onToggleSubmenu}
              isRTL={isRTL}
              isCollapsed={isCollapsed}
            />
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default NavigationMenu;
