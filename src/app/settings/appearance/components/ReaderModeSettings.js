'use client';
import { BookOpen, Check } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { useTranslations } from '@/hooks/useTranslations';
import { useTheme } from '@/contexts/ThemeContext';

const ReaderModeSettings = () => {
  const { t } = useTranslations();
  const { readerMode, setReaderMode } = useTheme();

  return (
    <Card>
      <CardHeader className="space-y-1">
        <CardTitle className="flex items-center gap-2">
          <BookOpen className="h-5 w-5" />
          {t('settings.readerMode')}
        </CardTitle>
        <CardDescription>{t('settings.readerModeDescription')}</CardDescription>
      </CardHeader>
      <CardContent className="flex items-center justify-between gap-4">
        <div className="space-y-1">
          <p className="text-sm font-medium text-foreground">
            {readerMode ? t('settings.readerModeOn') : t('settings.readerModeOff')}
          </p>
          <p className="text-xs text-muted-foreground">
            {t('settings.readerModeHint')}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {readerMode && <Check className="h-4 w-4 text-primary" />}
          <Switch
            checked={readerMode}
            onCheckedChange={(value) => setReaderMode(Boolean(value))}
            aria-label={t('settings.readerMode')}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default ReaderModeSettings;
