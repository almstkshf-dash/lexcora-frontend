import React from 'react';
import { ChevronDown } from 'lucide-react';

/**
 * Memoized menu item component
 * Handles both link and category type menu items with submenus
 */
const MenuItem = React.memo(({ 
  item, 
  activeItem, 
  openSubmenus, 
  onNavClick, 
  onToggleSubmenu,
  isRTL 
}) => {
  const IconComponent = item.icon;
  const isActive = activeItem === item.id;
  const hasActiveChild = item.submenu?.some((subItem) => activeItem === subItem.id);
  const isCategoryActive = isActive || hasActiveChild;
  const isOpen = openSubmenus[item.id];

  if (item.type === 'link') {
    return (
      <button 
        onClick={() => onNavClick(item.id, item.type)}
        className={`
          group 
          flex 
          items-center 
          w-full 
          px-4 
          py-3 
          text-sidebar-foreground 
          hover:text-sidebdar-foreground 
          rounded-xl 
          cursor-pointer
          transition-all 
          duration-300 
          focus:outline-none 
          focus:ring-2 
          focus:ring-sidebar-ring 
          focus:ring-offset-2 
          focus:ring-offset-sidebar
          ${isActive 
            ? 'bg-sidebar-primary text-sidebar-primary-foreground shadow-lg' 
            : 'hover:bg-sidebar-accent'
          }
        `}
        aria-current={isActive ? 'page' : undefined}
      >
        <IconComponent className={`
          w-5 
          h-5 
          transition-colors  
          ${isRTL ? 'icon-spacing-rtl' : 'icon-spacing-ltr'} 
          ${isActive 
            ? 'text-sidebar-primary-foreground' 
            : 'text-sidebar-foreground/70 group-hover:text-sidebar-foreground'
          }
        `} />
        <span className="font-medium transition-colors">{item.label}</span>
        {item.badge && (
          <span className={`${isRTL ? 'mr-auto' : 'ml-auto'} ${item.badgeColor || 'bg-blue-500'} text-white text-xs px-2 py-1 rounded-full font-semibold`}>
            {item.badge}
          </span>
        )}
      </button>
    );
  }

  return (
    <>
      <button 
        onClick={() => item.type === 'category' ? onNavClick(item.id, item.type) : onToggleSubmenu(item.id)}
        className={`
          group 
          flex 
          items-center 
          justify-between 
          w-full 
          cursor-pointer
          px-4 
          py-3 
          text-sidebar-foreground 
          rounded-xl 
          transition-all 
          duration-300 
          focus:outline-none 
          focus:ring-2 
          focus:ring-sidebar-ring 
          focus:ring-offset-2 
          focus:ring-offset-sidebar
          ${item.type === 'category' 
            ? isCategoryActive 
              ? 'bg-sidebar-accent text-sidebar-foreground' 
              : 'hover:bg-sidebar-accent/50' 
            : isActive 
              ? 'bg-sidebar-primary text-sidebar-primary-foreground' 
              : 'hover:bg-sidebar-accent'
          }
        `}
        aria-expanded={isOpen}
        aria-haspopup="true"
        aria-current={isCategoryActive ? 'page' : undefined}
      >
        <div className="flex items-center">
          <IconComponent className={`
            w-5 
            h-5 
            transition-colors  
            ${isRTL ? 'ml-3' : 'mr-3'} 
            ${item.type === 'category' 
              ? isCategoryActive 
                ? 'text-sidebar-foreground' 
                : 'text-sidebar-foreground/80' 
              : isActive 
                ? 'text-sidebar-primary-foreground' 
                : 'text-sidebar-foreground/70 group-hover:text-sidebar-foreground'
            }
          `} />
          <span className={`font-medium transition-colors ${
            item.type === 'category' ? 'text-sidebar-foreground/90' : ''
          }`}>{item.label}</span>
        </div>
        <ChevronDown 
          className={`
            w-4 
            h-4 
            transition-all  
            duration-300 
            ${isOpen ? 'rotate-180' : ''} 
            ${item.type === 'category' 
              ? 'text-sidebar-foreground/60' 
              : isActive 
                ? 'text-sidebar-primary-foreground' 
                : 'text-sidebar-foreground/50'
            }
          `}
        />
      </button>
      
      <div 
        className={`overflow-hidden p-2 transition-all duration-300 ease-in-out ${
          isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <ul className={`${isRTL ? 'mr-4' : 'ml-4'} mt-2 space-y-1`} role="group">
          {item.submenu?.map((subItem) => {
            const SubIconComponent = subItem.icon;
            const isSubActive = activeItem === subItem.id;
            
            return (
              <li key={subItem.id}>
                <button 
                  onClick={() => onNavClick(subItem.id, 'link')}
                  className={`
                    flex 
                    cursor-pointer
                    items-center 
                    w-full 
                    px-4 
                    py-2 
                    text-sm 
                    rounded-lg 
                    transition-all 
                    duration-200 
                    focus:outline-none 
                    focus:ring-2 
                    focus:ring-sidebar-ring 
                    focus:ring-offset-2 
                    focus:ring-offset-sidebar
                    ${isSubActive 
                      ? 'bg-sidebar-accent text-sidebar-foreground font-medium shadow-sm' 
                      : 'text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/50'
                    }
                  `}
                  aria-current={isSubActive ? 'page' : undefined}
                >
                  <SubIconComponent className={`
                    w-4 
                    h-4 
                    ${isRTL ? 'ml-3' : 'mr-3'} 
                    transition-colors 
                    ${isSubActive 
                      ? 'text-sidebar-foreground' 
                      : 'text-sidebar-foreground/50'
                    }
                  `} />
                  <span className="transition-colors">{subItem.label}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </>
  );
});

MenuItem.displayName = 'MenuItem';

export default MenuItem;
