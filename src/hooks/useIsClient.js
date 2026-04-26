"use client";

import { useState, useEffect } from "react";

/**
 * Shared hook to safely detect client-side hydration.
 * Eliminates the duplicated isClient/setIsClient pattern across layout wrappers.
 * @returns {boolean} true once the component has mounted on the client
 */
export const useIsClient = () => {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  return isClient;
};
