import { useEffect, useMemo, useRef } from 'react';

/**
 * useKeyboardNavigation (sidebar/navigation)
 *
 * Performance fix: the previous implementation re-registered the global
 * `window` keydown listener whenever `flatItems`, `activeItem`, or
 * `handleNavClick` changed — which happens on every navigation and every
 * menu-item render cycle. Multiple overlapping listeners accumulated,
 * firing redundant work on every Alt+Arrow keypress.
 *
 * Fix: register the listener exactly once (on mount) and keep a ref to the
 * latest values so the handler always reads fresh state without needing to
 * be re-created. The flatItems list is still memoized to avoid rebuilding
 * it on every render.
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

  // Stable ref so the single listener always sees the latest values
  const stateRef = useRef({});
  stateRef.current = { flatItems, activeItem, handleNavClick };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!e.altKey) return;
      if (e.key !== 'ArrowUp' && e.key !== 'ArrowDown') return;

      const { flatItems, activeItem, handleNavClick } = stateRef.current;

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

    // Single registration for the lifetime of the sidebar component.
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []); // intentionally empty — stateRef keeps flatItems/activeItem/handleNavClick fresh
};
