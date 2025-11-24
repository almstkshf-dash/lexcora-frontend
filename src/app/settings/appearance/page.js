'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft, 
  ArrowRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import PageHeader from '@/components/PageHeader';
import { useTranslations } from '@/hooks/useTranslations';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTheme } from '@/contexts/ThemeContext';
import ThemeSettings from './components/ThemeSettings';
import LanguageSettings from './components/LanguageSettings';
import WorkingHoursSettings from './components/WorkingHoursSettings';
import FontSettings from './components/FontSettings';
import ReaderModeSettings from './components/ReaderModeSettings';

const AppearanceSettingsPage = () => {
  const { t } = useTranslations();
  const { isRTL, setLanguage } = useLanguage();
  const { setTheme, themes } = useTheme();
  const router = useRouter();

  const BackIcon = isRTL ? ArrowRight : ArrowLeft;

  const resetToDefaults = () => {
    setTheme(themes.light);
    setLanguage('ar');
    
    // Reset font to default (using font key instead of name)
    const defaultFontKey = 'cairo';
    localStorage.setItem('selectedFont', defaultFontKey);
    
    // Force re-render of font component by dispatching a custom event
    window.dispatchEvent(new CustomEvent('fontReset', { detail: defaultFontKey }));
  };

  return (
    <div className="space-y-6 p-6">
      <PageHeader
        title={t('navigation.appearance')}
        description={t('settings.appearanceDescription')}
      >
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={resetToDefaults}
          >
            {t('settings.resetToDefaults')}
          </Button>
          <Button
            variant="outline"
            onClick={() => router.back()}
            className="flex items-center gap-2"
          >
            <BackIcon className="h-4 w-4" />
            {t('buttons.back')}
          </Button>
        </div>
      </PageHeader>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-6">
        <ThemeSettings />
        <LanguageSettings />
        <WorkingHoursSettings />
        <FontSettings />
        <ReaderModeSettings />
      </div>
    </div>
  );
};

export default AppearanceSettingsPage;
