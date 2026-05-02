'use client';
import React from 'react';
import { useRouter } from 'next/navigation';
import { 
  Settings2, 
  User, 
  Shield, 
  Palette, 
  ChevronLeft,
  ChevronRight,
  Bell,
  Database,
  FileText,
  Globe,
  Building2,
  Gauge,
  Link2
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import PageHeader from '@/components/PageHeader';
import { useTranslations } from '@/hooks/useTranslations';
import { useLanguage } from '@/contexts/LanguageContext';

const SettingsPage = () => {
  const t = useTranslations();
  const { isRTL, language } = useLanguage();
  const router = useRouter();

  const settingsCategories = [
    {
      id: 'profile',
      title: t('navigation.profile'),
      description: t('settings.profileDescription'),
      icon: User,
      href: '/settings/profile',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50 dark:bg-blue-950'
    },
    {
      id: 'security',
      title: t('navigation.security'),
      description: t('settings.securityDescription'),
      icon: Shield,
      href: '/settings/security',
      color: 'text-green-600',
      bgColor: 'bg-green-50 dark:bg-green-950'
    },
    {
      id: 'appearance',
      title: t('navigation.appearance'),
      description: t('settings.appearanceDescription'),
      icon: Palette,
      href: '/settings/appearance',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50 dark:bg-purple-950'
    },
    {
      id: 'notifications',
      title: t('settings.notifications'),
      description: t('settings.notificationsDescription'),
      icon: Bell,
      href: '/settings/notifications',
      color: 'text-orange-600',
      bgColor: 'bg-orange-50 dark:bg-orange-950'
    },
    {
      id: 'system',
      title: t('settings.system'),
      description: t('settings.systemDescription'),
      icon: Database,
      href: '/settings/system',
      color: 'text-red-600',
      bgColor: 'bg-red-50 dark:bg-red-950'
    },
    {
      id: 'branches',
      title: language === 'ar' ? 'الفروع' : 'Branches',
      description: language === 'ar' ? 'إدارة فروع الشركة' : 'Manage company branches',
      icon: Building2,
      href: '/settings/branches',
      color: 'text-teal-600',
      bgColor: 'bg-teal-50 dark:bg-teal-950'
    },
    {
      id: 'performance',
      title: language === 'ar' ? 'الأداء' : 'Performance',
      description: language === 'ar' ? 'إدارة البيانات وتحسين الأداء' : 'Manage data and optimize performance',
      icon: Gauge,
      href: '/settings/performance',
      color: 'text-pink-600',
      bgColor: 'bg-pink-50 dark:bg-pink-950'
    },
    {
      id: 'reports',
      title: t('settings.reports'),
      description: t('settings.reportsDescription'),
      icon: FileText,
      href: '/settings/reports',
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50 dark:bg-indigo-950'
    },
    {
      id: 'integrations',
      title: language === 'ar' ? 'التكاملات والإرسال' : 'Integrations & Messaging',
      description: language === 'ar' ? 'ربط Outlook وواتساب بيزنس لإرسال رسائل العملاء' : 'Connect Outlook & WhatsApp Business for client messaging',
      icon: Link2,
      href: '/settings/integrations',
      color: 'text-cyan-600',
      bgColor: 'bg-cyan-50 dark:bg-cyan-950'
    }
  ];

  const handleNavigate = (href) => {
    router.push(href);
  };

  return (
    <div className="space-y-6 p-6">
      <PageHeader
        title={t('navigation.settings')}
        description={t('settings.description')}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {settingsCategories.map((category) => {
          const Icon = category.icon;
          const ChevronIcon = isRTL ? ChevronLeft : ChevronRight;
          
          return (
            <Card 
              key={category.id}
              className="hover:shadow-lg transition-all duration-200 cursor-pointer group border-2 hover:border-primary/20"
              onClick={() => handleNavigate(category.href)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className={`p-3 rounded-lg ${category.bgColor}`}>
                    <Icon className={`h-6 w-6 ${category.color}`} />
                  </div>
                  <ChevronIcon className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
                <CardTitle className="text-lg font-semibold">
                  {category.title}
                </CardTitle>
                <CardDescription className="text-sm text-muted-foreground">
                  {category.description}
                </CardDescription>
              </CardHeader>
            </Card>
          );
        })}
      </div>

      <Separator className="my-8" />

      {/* Quick Actions Section */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-foreground">
          {t('settings.quickActions')}
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Button
            variant="outline"
            className="h-20 flex-col space-y-2"
            onClick={() => handleNavigate('/settings/profile')}
          >
            <User className="h-6 w-6" />
            <span className="text-sm">{t('settings.editProfile')}</span>
          </Button>
          <Button
            variant="outline"
            className="h-20 flex-col space-y-2"
            onClick={() => handleNavigate('/settings/security')}
          >
            <Shield className="h-6 w-6" />
            <span className="text-sm">{t('settings.changePassword')}</span>
          </Button>
          <Button
            variant="outline"
            className="h-20 flex-col space-y-2"
            onClick={() => handleNavigate('/settings/appearance')}
          >
            <Palette className="h-6 w-6" />
            <span className="text-sm">{t('settings.changeTheme')}</span>
          </Button>
          <Button
            variant="outline"
            className="h-20 flex-col space-y-2"
            onClick={() => handleNavigate('/settings/notifications')}
          >
            <Bell className="h-6 w-6" />
            <span className="text-sm">{t('settings.manageNotifications')}</span>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
