'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft, 
  ArrowRight,
  HardDrive,
  Clock,
  AlertTriangle,
  CheckCircle,
  RefreshCw,
  Settings,
  Calendar
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import PageHeader from '@/components/PageHeader';
import { useTranslations } from '@/hooks/useTranslations';
import { useLanguage } from '@/contexts/LanguageContext';

const SystemSettingsPage = () => {
  const { t } = useTranslations();
  const { isRTL } = useLanguage();
  const router = useRouter();

  const [systemSettings, setSystemSettings] = useState({
    // Maintenance Settings
    maintenanceMode: false,
    autoUpdates: false,
    updateChannel: 'stable'
  });

  const [systemStatus] = useState({
    diskSpace: { used: 45, total: 100, unit: 'GB' },
    memory: { used: 2.1, total: 8.0, unit: 'GB' },
    uptime: '15 days, 6 hours',
    version: '2.1.5'
  });

  const BackIcon = isRTL ? ArrowRight : ArrowLeft;

  const handleSettingChange = (setting, value) => {
    setSystemSettings(prev => ({
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

  const getUsagePercentage = (used, total) => {
    return Math.round((used / total) * 100);
  };

  const getUsageColor = (percentage) => {
    if (percentage > 80) return 'bg-red-500';
    if (percentage > 60) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  return (
    <div className="space-y-6 p-6">
      <PageHeader
        title={t('settings.system')}
        description={t('settings.systemDescription')}
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

      {/* System Status */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <HardDrive className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="text-sm font-medium">{t('settings.diskSpace')}</p>
                  <p className="text-xs text-muted-foreground">
                    {systemStatus.diskSpace.used}{systemStatus.diskSpace.unit} / {systemStatus.diskSpace.total}{systemStatus.diskSpace.unit}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium">
                  {getUsagePercentage(systemStatus.diskSpace.used, systemStatus.diskSpace.total)}%
                </p>
                <div className="w-12 h-2 bg-gray-200 rounded-full mt-1">
                  <div 
                    className={`h-2 rounded-full ${getUsageColor(getUsagePercentage(systemStatus.diskSpace.used, systemStatus.diskSpace.total))}`}
                    style={{ width: `${getUsagePercentage(systemStatus.diskSpace.used, systemStatus.diskSpace.total)}%` }}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <HardDrive className="h-5 w-5 text-green-600" />
                <div>
                  <p className="text-sm font-medium">{t('settings.memory')}</p>
                  <p className="text-xs text-muted-foreground">
                    {systemStatus.memory.used}{systemStatus.memory.unit} / {systemStatus.memory.total}{systemStatus.memory.unit}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium">
                  {getUsagePercentage(systemStatus.memory.used, systemStatus.memory.total)}%
                </p>
                <div className="w-12 h-2 bg-gray-200 rounded-full mt-1">
                  <div 
                    className={`h-2 rounded-full ${getUsageColor(getUsagePercentage(systemStatus.memory.used, systemStatus.memory.total))}`}
                    style={{ width: `${getUsagePercentage(systemStatus.memory.used, systemStatus.memory.total)}%` }}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-purple-600" />
                <div>
                  <p className="text-sm font-medium">{t('settings.uptime')}</p>
                  <p className="text-xs text-muted-foreground">{systemStatus.uptime}</p>
                </div>
              </div>
              <Badge variant="secondary" className="text-green-600">
                <CheckCircle className="h-3 w-3 mr-1" />
                {t('settings.online')}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Maintenance Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              {t('settings.maintenance')}
            </CardTitle>
            <CardDescription>
              {t('settings.maintenanceDesc')}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label>{t('settings.maintenanceMode')}</Label>
                <p className="text-sm text-muted-foreground">
                  {t('settings.maintenanceModeDesc')}
                </p>
              </div>
              <Switch
                checked={systemSettings.maintenanceMode}
                onCheckedChange={(checked) => handleSettingChange('maintenanceMode', checked)}
              />
            </div>

            {systemSettings.maintenanceMode && (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  {t('settings.maintenanceModeWarning')}
                </AlertDescription>
              </Alert>
            )}

            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label>{t('settings.automaticUpdates')}</Label>
                <p className="text-sm text-muted-foreground">
                  {t('settings.autoUpdatesDesc')}
                </p>
              </div>
              <Switch
                checked={systemSettings.autoUpdates}
                onCheckedChange={(checked) => handleSettingChange('autoUpdates', checked)}
              />
            </div>

            <div className="space-y-2">
              <Label>{t('settings.updateChannel')}</Label>
              <Select
                value={systemSettings.updateChannel}
                onValueChange={(value) => handleSettingChange('updateChannel', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="stable">{t('settings.stableChannel')}</SelectItem>
                  <SelectItem value="beta">{t('settings.betaChannel')}</SelectItem>
                  <SelectItem value="alpha">{t('settings.alphaChannel')}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">{t('settings.currentVersion')}</p>
                <p className="text-xs text-muted-foreground">v{systemStatus.version}</p>
              </div>
              <Button size="sm" variant="outline">
                <RefreshCw className="h-4 w-4 mr-2" />
                {t('settings.checkUpdates')}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SystemSettingsPage;
