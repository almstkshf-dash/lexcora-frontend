'use client';

import { useEffect, useRef } from 'react';

/**
 * useKeyboardNavigation (search)
 *
 * Performance fix: the previous implementation re-registered the global
 * `window` keydown listener on every render (every keystroke triggers state
 * updates → new filteredResults/selectedIndex refs → effect re-runs).
 *
 * During heavy search usage this created a brief window where multiple
 * listeners existed simultaneously, multiplying the work done per keypress
 * and contributing to INP jank.
 *
 * Fix: use a stable ref to hold the latest props so the listener is only
 * ever registered ONCE (on mount) and cleaned up once (on unmount).
 * The handler reads from the ref, so it always sees fresh values without
 * needing to be re-created.
 */
export const useKeyboardNavigation = ({
  isOpen,
  filteredResults,
  selectedIndex,
  setSelectedIndex,
  setIsOpen,
  setSearchQuery,
  onSelect
}) => {
  // Keep a stable ref to the latest values — updated synchronously before
  // the event handler can fire.
  const stateRef = useRef({});
  stateRef.current = {
    isOpen,
    filteredResults,
    selectedIndex,
    setSelectedIndex,
    setIsOpen,
    setSearchQuery,
    onSelect,
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      const {
        isOpen,
        filteredResults,
        selectedIndex,
        setSelectedIndex,
        setIsOpen,
        setSearchQuery,
        onSelect,
      } = stateRef.current;

      if (!isOpen) return;

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex(prev =>
            prev < filteredResults.length - 1 ? prev + 1 : prev
          );
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex(prev => prev > 0 ? prev - 1 : 0);
          break;
        case 'Enter':
          e.preventDefault();
          if (filteredResults[selectedIndex]) {
            onSelect(filteredResults[selectedIndex]);
          }
          break;
        case 'Escape':
          setIsOpen(false);
          setSearchQuery('');
          break;
      }
    };

    // Single registration — never torn down until the component unmounts.
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // intentionally empty — stateRef keeps values fresh
};
