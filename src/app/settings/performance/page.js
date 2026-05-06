'use client';
import React, { useState, useEffect } from 'react';
import { Database, Trash2, AlertTriangle, RefreshCw, HardDrive } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import PageHeader from '@/components/PageHeader';
import { useTranslations } from '@/hooks/useTranslations';
import { useLanguage } from '@/contexts/LanguageContext';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { getPerformanceStats, clearSystemLogs, clearNotifications } from '@/app/services/api/performance';

const PerformanceSettingsPage = () => {
  const t = useTranslations();
  const { language } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    logsCount: 0,
    notificationsCount: 0
  });
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteType, setDeleteType] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const data = await getPerformanceStats();
      setStats(data);
    } catch (error) {

    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const handleDeleteClick = (type) => {
    setDeleteType(type);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    try {
      setDeleting(true);
      
      if (deleteType === 'logs') {
        await clearSystemLogs();
      } else {
        await clearNotifications();
      }

      // Refresh stats after deletion
      await fetchStats();
    } catch (error) {

    } finally {
      setDeleting(false);
      setDeleteDialogOpen(false);
      setDeleteType(null);
    }
  };

  const formatBytes = (count) => {
    // Rough estimate: assuming average of 500 bytes per record
    const bytes = count * 500;
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <div className="space-y-6 p-6">
      <PageHeader
        title={language === 'ar' ? 'الأداء' : 'Performance'}
        description={language === 'ar' ? 'إدارة البيانات وتحسين الأداء' : 'Manage data and optimize performance'}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* System Logs Card */}
        <Card className="border-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-950">
                  <Database className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <CardTitle className="text-lg">
                    {language === 'ar' ? 'سجلات النظام' : 'System Logs'}
                  </CardTitle>
                  <CardDescription>
                    {language === 'ar' ? 'سجل أنشطة النظام' : 'System activity records'}
                  </CardDescription>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">
                  {language === 'ar' ? 'عدد السجلات' : 'Total Records'}
                </span>
                <span className="font-semibold text-lg">
                  {loading ? '...' : stats.logsCount.toLocaleString()}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">
                  {language === 'ar' ? 'الحجم التقريبي' : 'Estimated Size'}
                </span>
                <span className="font-medium text-blue-600">
                  {loading ? '...' : formatBytes(stats.logsCount)}
                </span>
              </div>
            </div>
            
            <div className="pt-4 border-t">
              <Button
                variant="destructive"
                className="w-full"
                onClick={() => handleDeleteClick('logs')}
                disabled={loading || stats.logsCount === 0 || deleting}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                {language === 'ar' ? 'حذف جميع السجلات' : 'Delete All Logs'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Notifications Card */}
        <Card className="border-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-lg bg-orange-50 dark:bg-orange-950">
                  <HardDrive className="h-6 w-6 text-orange-700" />
                </div>
                <div>
                  <CardTitle className="text-lg">
                    {language === 'ar' ? 'الإشعارات' : 'Notifications'}
                  </CardTitle>
                  <CardDescription>
                    {language === 'ar' ? 'إشعارات التطبيق' : 'Application notifications'}
                  </CardDescription>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">
                  {language === 'ar' ? 'عدد الإشعارات' : 'Total Notifications'}
                </span>
                <span className="font-semibold text-lg">
                  {loading ? '...' : stats.notificationsCount.toLocaleString()}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">
                  {language === 'ar' ? 'الحجم التقريبي' : 'Estimated Size'}
                </span>
                <span className="font-medium text-orange-700">
                  {loading ? '...' : formatBytes(stats.notificationsCount)}
                </span>
              </div>
            </div>
            
            <div className="pt-4 border-t">
              <Button
                variant="destructive"
                className="w-full"
                onClick={() => handleDeleteClick('notifications')}
                disabled={loading || stats.notificationsCount === 0 || deleting}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                {language === 'ar' ? 'حذف جميع الإشعارات' : 'Delete All Notifications'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Warning Card */}
      <Card className="border-yellow-200 dark:border-yellow-900 bg-yellow-50 dark:bg-yellow-950/20">
        <CardContent className="pt-6">
          <div className="flex gap-3">
            <AlertTriangle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="text-sm font-medium text-yellow-900 dark:text-yellow-100">
                {language === 'ar' ? 'تحذير' : 'Warning'}
              </p>
              <p className="text-sm text-yellow-800 dark:text-yellow-200">
                {language === 'ar' 
                  ? 'حذف البيانات هو عملية لا يمكن التراجع عنها. تأكد من عمل نسخة احتياطية قبل المتابعة.'
                  : 'Deleting data is irreversible. Make sure to backup your data before proceeding.'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Refresh Button */}
      <div className="flex justify-center">
        <Button
          variant="outline"
          onClick={fetchStats}
          disabled={loading}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          {language === 'ar' ? 'تحديث الإحصائيات' : 'Refresh Statistics'}
        </Button>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {language === 'ar' ? 'هل أنت متأكد؟' : 'Are you sure?'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {deleteType === 'logs' 
                ? (language === 'ar' 
                    ? `سيتم حذف جميع سجلات النظام (${stats.logsCount} سجل). هذا الإجراء لا يمكن التراجع عنه.`
                    : `This will delete all system logs (${stats.logsCount} records). This action cannot be undone.`)
                : (language === 'ar'
                    ? `سيتم حذف جميع الإشعارات (${stats.notificationsCount} إشعار). هذا الإجراء لا يمكن التراجع عنه.`
                    : `This will delete all notifications (${stats.notificationsCount} notifications). This action cannot be undone.`)}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>
              {language === 'ar' ? 'إلغاء' : 'Cancel'}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              disabled={deleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleting 
                ? (language === 'ar' ? 'جاري الحذف...' : 'Deleting...') 
                : (language === 'ar' ? 'حذف' : 'Delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default PerformanceSettingsPage;
