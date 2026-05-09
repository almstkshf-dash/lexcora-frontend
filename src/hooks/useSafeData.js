import { useMemo } from 'react';
import useSWR from 'swr';

/**
 * Utility to forcefully extract an array from unknown API responses.
 * Prevents "TypeError: .map is not a function" crashes.
 */
export const extractSafeArray = (rawData) => {
  if (!rawData) return [];
  
  if (Array.isArray(rawData)) return rawData;
  
  if (rawData.data && Array.isArray(rawData.data)) return rawData.data;
  
  if (rawData.data?.data && Array.isArray(rawData.data.data)) return rawData.data.data;
  
  return [];
};

/**
 * A custom hook that wraps useSWR and safely extracts array data.
 * Useful for list endpoints where you want to guarantee `safeData` is an array.
 * 
 * @param {string|null} key - SWR key
 * @param {function} fetcher - SWR fetcher function
 * @param {object} options - SWR options
 */
export const useSafeSWR = (key, fetcher, options = {}) => {
  const swrResponse = useSWR(key, fetcher, options);
  
  const safeData = useMemo(() => {
    return extractSafeArray(swrResponse.data);
  }, [swrResponse.data]);
  
  return {
    ...swrResponse,
    safeData
  };
};

/**
 * A hook to ensure a safe array from raw data, without using SWR directly.
 */
export const useSafeArray = (rawData) => {
  return useMemo(() => extractSafeArray(rawData), [rawData]);
};
