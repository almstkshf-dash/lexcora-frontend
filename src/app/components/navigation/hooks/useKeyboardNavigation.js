import { useEffect, useMemo } from 'react';

/**
 * Custom hook for keyboard navigation
 * Handles Alt+ArrowUp and Alt+ArrowDown for menu navigation.
 *
 * Fix: removed redundant setActiveItem calls — handleNavClick already owns
 * that responsibility, so calling it twice was causing two React state updates
 * per keypress. Navigation now also traverses submenu items.
 */
export const useKeyboardNavigation = (menuItems, activeItem, handleNavClick) => {
  // Flatten top-level items + their submenus into one navigable list
  const flatItems = useMemo(() => {
    const result = [];
    (menuItems || []).forEach((item) => {
      result.push(item);
      if (item.submenu) {
        item.submenu.forEach((sub) => result.push(sub));
      }
    });
    return result;
  }, [menuItems]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!e.altKey) return;
      if (e.key !== 'ArrowUp' && e.key !== 'ArrowDown') return;

      e.preventDefault();
      const currentIndex = flatItems.findIndex((item) => item.id === activeItem);
      let nextIndex;

      if (e.key === 'ArrowUp') {
        nextIndex = currentIndex > 0 ? currentIndex - 1 : flatItems.length - 1;
      } else {
        nextIndex = currentIndex < flatItems.length - 1 ? currentIndex + 1 : 0;
      }

      const nextItem = flatItems[nextIndex];
      if (nextItem) {
        // handleNavClick owns setActiveItem — no double state-set
        handleNavClick(nextItem.id, nextItem.type || 'link');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [flatItems, activeItem, handleNavClick]);
};
