'use client';

import { SWRConfig } from 'swr';

import api from '@/app/services/api/axiosInstance';

// Global SWR configuration
const swrConfig = {
  revalidateOnFocus: false,
  revalidateOnReconnect: true,
  dedupingInterval: 60000, // 1 minute
  errorRetryCount: 3,
  errorRetryInterval: 5000,
  fetcher: (url) => api.get(url).then((res) => res.data),
  onError: (error, key) => {
    console.error(`SWR Error [${key}]:`, error);
  },
};

export default function SWRProvider({ children }) {
  return (
    <SWRConfig value={swrConfig}>
      {children}
    </SWRConfig>
  );
}
