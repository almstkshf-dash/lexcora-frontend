
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
  display: 'swap',
  preload: false,
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
    suppressHydrationWarning
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                const savedFont = localStorage.getItem('selectedFont');
                if (savedFont) {
                  const fonts = {
                    cairo: 'Cairo, sans-serif',
                    tajawal: 'Tajawal, sans-serif',
                    amiri: 'Amiri, serif',
                    'noto-sans-arabic': 'Noto Sans Arabic, sans-serif',
                    inter: 'Inter, sans-serif'
                  };
                  const fontFamily = fonts[savedFont];
                  if (fontFamily) {
                    const fontUrls = {
                      tajawal: 'https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;600;700&display=swap',
                      amiri: 'https://fonts.googleapis.com/css2?family=Amiri:wght@400;700&display=swap',
                      'noto-sans-arabic': 'https://fonts.googleapis.com/css2?family=Noto+Sans+Arabic:wght@400;500;600;700&display=swap',
                      inter: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap'
                    };
                    const url = fontUrls[savedFont];
                    if (url) {
                      const link = document.createElement('link');
                      link.id = 'google-font-' + savedFont;
                      link.rel = 'stylesheet';
                      link.href = url;
                      document.head.appendChild(link);
                    }
                    document.documentElement.style.setProperty('--font-arabic-system', fontFamily + ", 'Arial Unicode MS', 'Tahoma', 'Microsoft Sans Serif', 'Segoe UI', Arial, sans-serif");
                  }
                }
              } catch (e) {}
            `
          }}
        />
      </head>
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
                  position="top-center"
                  autoClose={6000}
                  hideProgressBar={false}
                  newestOnTop={false}
                  closeOnClick
                  rtl={true}
                  pauseOnFocusLoss
                  draggable
                  pauseOnHover
                  theme="colored"
                  style={{ zIndex: 999999 }}
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
