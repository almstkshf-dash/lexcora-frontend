import useSWR from 'swr';
import { getPartiesByBranch } from '@/app/services/api/parties';

/**
 * Custom hook to manage parties data with SWR
 * @param {number} branchId - The branch ID to fetch parties for
 * @returns {object} { parties, isLoading, error, mutate }
 */
export const useParties = (branchId = 1) => {
  const { data, error, mutate } = useSWR(
    branchId ? `parties-branch-${branchId}` : null,
    () => getPartiesByBranch(branchId),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      dedupingInterval: 60000, // Cache for 1 minute
    }
  );

  return {
    parties: (data?.success && Array.isArray(data.data)) ? data.data : [],
    isLoading: !data && !error,
    error,
    mutate,
    // Helper methods
    getPartiesByType: (type) => {
      const parties = (data?.success && Array.isArray(data.data)) ? data.data : [];
      return parties
    //   return parties.filter(party => party.party_type === type);
    },
    getPartyById: (id) => {
      const parties = (data?.success && Array.isArray(data.data)) ? data.data : [];
      return parties.find(party => party.id === parseInt(id));
    }
  };
};