'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft, 
  ArrowRight,
  Bell, 
  Mail,
  MessageSquare,
  Car,
  DollarSign,
  AlertTriangle
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import PageHeader from '@/components/PageHeader';
import { useTranslations } from '@/hooks/useTranslations';
import { useLanguage } from '@/contexts/LanguageContext';

const NotificationsSettingsPage = () => {
  const { t } = useTranslations();
  const { isRTL } = useLanguage();
  const router = useRouter();

  const [notificationSettings, setNotificationSettings] = useState({
    // Email Notifications
    emailEnabled: true,
    emailBookings: true,
    emailPayments: true,
    emailSystemUpdates: true,
    emailMaintenanceAlerts: true,
    
    // Push Notifications
    pushEnabled: true,
    pushBookings: true,
    pushPayments: false,
    pushReminders: true,
    
    // SMS Notifications
    smsEnabled: false,
    smsBookings: false,
    smsPayments: true,
    smsReminders: false
  });

  const BackIcon = isRTL ? ArrowRight : ArrowLeft;

  const handleSettingChange = (setting, value) => {
    setNotificationSettings(prev => ({
      ...prev,
      [setting]: value
    }));
  };

  const handleSaveSettings = async () => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      alert(t('settings.settingsSaved'));
    } catch (error) {

    }
  };

  const notificationCategories = [
    {
      id: 'bookings',
      title: t('navigation.bookings'),
      description: t('settings.bookingsNotificationsDesc'),
      icon: Car,
      color: 'text-blue-600',
      settings: ['emailBookings', 'pushBookings', 'smsBookings']
    },
    {
      id: 'payments',
      title: t('navigation.payments'),
      description: t('settings.paymentsNotificationsDesc'),
      icon: DollarSign,
      color: 'text-green-600',
      settings: ['emailPayments', 'pushPayments', 'smsPayments']
    },
    {
      id: 'system',
      title: t('settings.systemUpdates'),
      description: t('settings.systemNotificationsDesc'),
      icon: AlertTriangle,
      color: 'text-orange-700',
      settings: ['emailSystemUpdates', 'emailMaintenanceAlerts']
    }
  ];

  return (
    <div className="space-y-6 p-6">
      <PageHeader
        title={t('settings.notifications')}
        description={t('settings.notificationsDescription')}
      >
        <div className="flex items-center gap-2">
          <Button onClick={handleSaveSettings}>
            {t('buttons.save')}
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Email Notifications */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              {t('settings.emailNotifications')}
            </CardTitle>
            <CardDescription>
              {t('settings.emailNotificationsDesc')}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label>{t('settings.enableEmailNotifications')}</Label>
                <p className="text-sm text-muted-foreground">
                  {t('settings.masterEmailToggle')}
                </p>
              </div>
              <Switch
                checked={notificationSettings.emailEnabled}
                onCheckedChange={(checked) => handleSettingChange('emailEnabled', checked)}
              />
            </div>

            <Separator />

            {notificationCategories.map((category) => (
              <div key={category.id} className="space-y-3">
                <div className="flex items-center gap-2">
                  <category.icon className={`h-4 w-4 ${category.color}`} />
                  <Label className="font-medium">{category.title}</Label>
                </div>
                <div className="pl-6 space-y-2">
                  {category.settings.filter(setting => setting.startsWith('email')).map((setting) => (
                    <div key={setting} className="flex items-center justify-between">
                      <Label className="text-sm text-muted-foreground">
                        {t(`settings.${setting}`)}
                      </Label>
                      <Switch
                        checked={notificationSettings[setting]}
                        onCheckedChange={(checked) => handleSettingChange(setting, checked)}
                        disabled={!notificationSettings.emailEnabled}
                      />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Push Notifications */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              {t('settings.pushNotifications')}
            </CardTitle>
            <CardDescription>
              {t('settings.pushNotificationsDesc')}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label>{t('settings.enablePushNotifications')}</Label>
                <p className="text-sm text-muted-foreground">
                  {t('settings.browserNotifications')}
                </p>
              </div>
              <Switch
                checked={notificationSettings.pushEnabled}
                onCheckedChange={(checked) => handleSettingChange('pushEnabled', checked)}
              />
            </div>

            <Separator />

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-sm">{t('settings.bookingUpdates')}</Label>
                <Switch
                  checked={notificationSettings.pushBookings}
                  onCheckedChange={(checked) => handleSettingChange('pushBookings', checked)}
                  disabled={!notificationSettings.pushEnabled}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label className="text-sm">{t('settings.paymentUpdates')}</Label>
                <Switch
                  checked={notificationSettings.pushPayments}
                  onCheckedChange={(checked) => handleSettingChange('pushPayments', checked)}
                  disabled={!notificationSettings.pushEnabled}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label className="text-sm">{t('settings.reminders')}</Label>
                <Switch
                  checked={notificationSettings.pushReminders}
                  onCheckedChange={(checked) => handleSettingChange('pushReminders', checked)}
                  disabled={!notificationSettings.pushEnabled}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* SMS Notifications */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              {t('settings.smsNotifications')}
            </CardTitle>
            <CardDescription>
              {t('settings.smsNotificationsDesc')}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label>{t('settings.enableSmsNotifications')}</Label>
                <p className="text-sm text-muted-foreground">
                  {t('settings.smsCharges')}
                </p>
              </div>
              <Switch
                checked={notificationSettings.smsEnabled}
                onCheckedChange={(checked) => handleSettingChange('smsEnabled', checked)}
              />
            </div>

            <Separator />

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-sm">{t('settings.smsBookings')}</Label>
                <Switch
                  checked={notificationSettings.smsBookings}
                  onCheckedChange={(checked) => handleSettingChange('smsBookings', checked)}
                  disabled={!notificationSettings.smsEnabled}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label className="text-sm">{t('settings.smsPayments')}</Label>
                <Switch
                  checked={notificationSettings.smsPayments}
                  onCheckedChange={(checked) => handleSettingChange('smsPayments', checked)}
                  disabled={!notificationSettings.smsEnabled}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default NotificationsSettingsPage;
