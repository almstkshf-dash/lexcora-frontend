import useSWR from 'swr';
import { getCaseMemos } from '@/app/services/api/memos';

/**
 * Custom hook to manage case memos data with SWR
 * @param {number} caseId - The case ID to fetch memos for
 * @returns {object} { memos, isLoading, error, mutate }
 */
export const useCaseMemos = (caseId) => {
  const { data, error, mutate } = useSWR(
    caseId ? `case-memos-${caseId}` : null,
    () => getCaseMemos(caseId),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      dedupingInterval: 60000, // Cache for 1 minute
    }
  );

  return {
    memos: (data?.success && Array.isArray(data.data)) ? data.data : [],
    isLoading: !data && !error,
    error,
    mutate,
  };
};
