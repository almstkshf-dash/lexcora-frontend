
import "./globals.css";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import DynamicLayout from "@/components/DynamicLayout";
import ResponsiveLayout from "@/components/ResponsiveLayout";
import SWRProvider from "@/providers/SWRProvider";
import ReduxProvider from "@/redux/ReduxProvider";
import AuthProvider from "@/providers/AuthProvider";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Noto_Sans_Arabic } from 'next/font/google';
import RouteGuard from "@/components/RouteGuard";
import CelebrationOverlay from "@/components/CelebrationOverlay";

const notoSansArabic = Noto_Sans_Arabic({
  subsets: ['arabic'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-noto-sans-arabic',
});


export const metadata = {
  title: "Lexcora Dashboard",
  description: "Lexcora Management System",
};

export default function RootLayout({ children }) {
  
  
  return (
    <html 
    className={`${notoSansArabic.className} ${notoSansArabic.variable}`}
    data-scroll-behavior="smooth"
    >
      <head />
      <body
        className="font-system-arabic antialiased"
      >
        <LanguageProvider>
          <ThemeProvider>
            <SWRProvider>
              <ReduxProvider>
                <AuthProvider>
                  <RouteGuard>
                    <DynamicLayout>
                      <ResponsiveLayout>
                        {children}
                      </ResponsiveLayout>
                    </DynamicLayout>
                  </RouteGuard>
                </AuthProvider>
                <ToastContainer
                  position="top-right"
                  autoClose={3000}
                  hideProgressBar={false}
                  newestOnTop={false}
                  closeOnClick
                  rtl={true}
                  pauseOnFocusLoss
                  draggable
                  pauseOnHover
                  theme="colored"
                  style={{ zIndex: 9999 }}
                />
              </ReduxProvider>
            </SWRProvider>
          </ThemeProvider>
        </LanguageProvider>
        <CelebrationOverlay />
      </body>
    </html>
  );
}
