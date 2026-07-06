"use client";

import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useLanguage } from '@/contexts/LanguageContext';
import { useIsClient } from '@/hooks/useIsClient';

export default function ToastProvider() {
  const isClient = useIsClient();
  const { isRTL } = useLanguage();

  if (!isClient) return null;

  return (
    <ToastContainer
      position={isRTL ? "top-left" : "top-right"}
      autoClose={4000}
      hideProgressBar={false}
      newestOnTop={true}
      closeOnClick
      rtl={isRTL}
      pauseOnFocusLoss
      draggable
      pauseOnHover
      theme="colored"
      style={{ zIndex: 999999 }}
    />
  );
}
