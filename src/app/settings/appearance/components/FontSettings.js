'use client';
import React, { useState, useEffect } from 'react';
import { Type, Check, ChevronDown } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useTranslations } from '@/hooks/useTranslations';
import { useLanguage } from '@/contexts/LanguageContext';

  // Font configurations using Google Fonts CSS
  const availableFonts = [
    {
      key: 'cairo',
      name: 'Cairo',
      label: 'Cairo',
      preview: 'نص تجريبي - Sample Text',
      fontFamily: 'Cairo, sans-serif',
      googleFontsUrl: 'https://fonts.googleapis.com/css2?family=Cairo:wght@400;500;600;700&display=swap'
    },
    {
      key: 'tajawal',
      name: 'Tajawal', 
      label: 'Tajawal',
      preview: 'نص تجريبي - Sample Text',
      fontFamily: 'Tajawal, sans-serif',
      googleFontsUrl: 'https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;600;700&display=swap'
    },
    {
      key: 'amiri',
      name: 'Amiri',
      label: 'Amiri', 
      preview: 'نص تجريبي - Sample Text',
      fontFamily: 'Amiri, serif',
      googleFontsUrl: 'https://fonts.googleapis.com/css2?family=Amiri:wght@400;700&display=swap'
    },
    {
      key: 'noto-sans-arabic',
      name: 'Noto Sans Arabic',
      label: 'Noto Sans Arabic',
      preview: 'نص تجريبي - Sample Text', 
      fontFamily: 'Noto Sans Arabic, sans-serif',
      googleFontsUrl: 'https://fonts.googleapis.com/css2?family=Noto+Sans+Arabic:wght@400;500;600;700&display=swap'
    },
    {
      key: 'inter',
      name: 'Inter',
      label: 'Inter (Latin)',
      preview: 'Sample Text - نص تجريبي',
      fontFamily: 'Inter, sans-serif',
      googleFontsUrl: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap'
    }
  ];

const FontSettings = () => {
  const { t } = useTranslations();
  const { isRTL } = useLanguage();
  const [selectedFont, setSelectedFont] = useState('cairo');

  // Function to load Google Font dynamically
  const loadGoogleFont = (fontConfig) => {
    const linkId = `google-font-${fontConfig.key}`;
    
    // Check if font is already loaded
    if (document.getElementById(linkId)) {
      return;
    }
    
    // Create and add font link
    const link = document.createElement('link');
    link.id = linkId;
    link.rel = 'stylesheet';
    link.href = fontConfig.googleFontsUrl;
    document.head.appendChild(link);
  };

  const handleFontChange = (fontKey) => {
    const selectedFontConfig = availableFonts.find(font => font.key === fontKey);
    if (!selectedFontConfig) return;

    setSelectedFont(fontKey);
    
    // Load the Google Font
    loadGoogleFont(selectedFontConfig);
    
    // Update the CSS custom property to change font globally
    document.documentElement.style.setProperty('--font-arabic-system', `${selectedFontConfig.fontFamily}, 'Arial Unicode MS', 'Tahoma', 'Microsoft Sans Serif', 'Segoe UI', Arial, sans-serif`);
    
    // Save to localStorage
    localStorage.setItem('selectedFont', fontKey);
  };

  // Load saved font on component mount and listen for reset events
  useEffect(() => {
    const savedFont = localStorage.getItem('selectedFont');
    if (savedFont && availableFonts.some(font => font.key === savedFont)) {
      const fontConfig = availableFonts.find(font => font.key === savedFont);
      if (fontConfig) {
        setSelectedFont(savedFont);
        // Load and apply the saved font
        loadGoogleFont(fontConfig);
        document.documentElement.style.setProperty('--font-arabic-system', `${fontConfig.fontFamily}, 'Arial Unicode MS', 'Tahoma', 'Microsoft Sans Serif', 'Segoe UI', Arial, sans-serif`);
      }
    } else {
      // Default to cairo if no saved font
      const defaultFont = availableFonts.find(font => font.key === 'cairo');
      if (defaultFont) {
        loadGoogleFont(defaultFont);
        document.documentElement.style.setProperty('--font-arabic-system', `${defaultFont.fontFamily}, 'Arial Unicode MS', 'Tahoma', 'Microsoft Sans Serif', 'Segoe UI', Arial, sans-serif`);
      }
    }

    // Listen for font reset events from parent
    const handleFontReset = (event) => {
      const fontKey = event.detail;
      const fontConfig = availableFonts.find(font => font.key === fontKey);
      if (fontConfig) {
        setSelectedFont(fontKey);
        // Load and apply the reset font
        loadGoogleFont(fontConfig);
        document.documentElement.style.setProperty('--font-arabic-system', `${fontConfig.fontFamily}, 'Arial Unicode MS', 'Tahoma', 'Microsoft Sans Serif', 'Segoe UI', Arial, sans-serif`);
      }
    };

    window.addEventListener('fontReset', handleFontReset);

    return () => {
      window.removeEventListener('fontReset', handleFontReset);
    };
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Type className="h-5 w-5" />
          {t('settings.fontFamily')}
        </CardTitle>
        <CardDescription>
          {t('settings.fontFamilyDescription')}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <Label>{t('settings.selectedFont')}</Label>
            <p className="text-sm text-muted-foreground">
              {t('settings.fontPreviewDescription')}
            </p>
          </div>
          <DropdownMenu dir={isRTL ? "rtl" : "ltr"}>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="outline" 
                className="relative cursor-pointer flex items-center gap-2 h-10 px-4 min-w-[180px] justify-between"
              >
                <div className="flex items-center gap-2">
                  <Type className="h-4 w-4" />
                  <span 
                    className="text-sm"
                    style={{ fontFamily: availableFonts.find(f => f.key === selectedFont)?.fontFamily }}
                  >
                    {availableFonts.find(f => f.key === selectedFont)?.name}
                  </span>
                </div>
                <ChevronDown className="h-4 w-4 opacity-50" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="min-w-[280px]">
              {availableFonts.map((font) => (
                <DropdownMenuItem 
                  key={font.key}
                  onClick={() => handleFontChange(font.key)}
                  className="flex flex-col items-start gap-1 cursor-pointer p-3"
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="font-medium">{font.label}</span>
                    {selectedFont === font.key && <Check className="h-4 w-4 text-blue-600" />}
                  </div>
                  <span 
                    className="text-sm text-muted-foreground"
                    style={{ fontFamily: font.fontFamily }}
                  >
                    {font.preview}
                  </span>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <Separator />

        <div className="space-y-2">
          <Label>{t('settings.fontPreview')}</Label>
          <div 
            className="p-4 border rounded-md bg-muted/50"
            style={{ fontFamily: availableFonts.find(f => f.key === selectedFont)?.fontFamily }}
          >
            <div className="space-y-2">
              <p className="text-lg font-semibold">
                مرحباً بكم في نظام إدارة المكتب القانوني
              </p>
              <p className="text-sm">
                Welcome to the Legal Office Management System
              </p>
              <p className="text-xs text-muted-foreground">
                هذا النص يظهر كيف ستبدو الخطوط المختلفة في التطبيق
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default FontSettings;