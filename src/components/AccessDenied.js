'use client';

import { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { ShieldOff, ArrowLeft, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTranslations } from '@/hooks/useTranslations';

const AccessDenied = ({ requiredPermissions = [] }) => {
  const router = useRouter();
  const { isRTL } = useLanguage();
  const { t } = useTranslations();

  const requiredLabel = useMemo(() => {
    if (!requiredPermissions || requiredPermissions.length === 0) return null;
    return Array.isArray(requiredPermissions)
      ? requiredPermissions.filter(Boolean).join(', ')
      : requiredPermissions;
  }, [requiredPermissions]);

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="w-full max-w-xl rounded-2xl border border-border bg-card text-card-foreground shadow-sm p-8 text-center space-y-6">
        <div className="mx-auto w-14 h-14 rounded-full bg-destructive/10 text-destructive flex items-center justify-center">
          <ShieldOff className="w-7 h-7" />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold tracking-tight">
            {t('common.accessDeniedTitle') || 'Access denied'}
          </h1>
          <p className="text-muted-foreground">
            {t('common.accessDeniedMessage') || 'You do not have permission to view this page.'}
          </p>
          {requiredLabel && (
            <p className="text-xs text-muted-foreground">
              {t('common.requiredPermissions', { permissions: requiredLabel }) ||
                `Required permission: ${requiredLabel}`}
            </p>
          )}
        </div>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button
            variant="outline"
            className={isRTL ? 'flex-row-reverse' : ''}
            onClick={() => router.back()}
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{t('common.goBack') || 'Go back'}</span>
          </Button>
          <Button
            className={isRTL ? 'flex-row-reverse' : ''}
            onClick={() => router.push('/')}
          >
            <Home className={`w-4 h-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
            <span>{t('common.goHome') || 'Go home'}</span>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AccessDenied;
