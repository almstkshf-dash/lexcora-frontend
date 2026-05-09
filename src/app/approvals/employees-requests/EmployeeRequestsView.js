'use client';

import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTranslations } from '@/hooks/useTranslations';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatDate, getStatusBadgeConfig } from './utils';
import CreateRequestDialog from './CreateRequestDialog';
import ExportButtons from '@/components/ui/export-buttons';

function EmployeeRequestsView({ requests, onUpdate }) {
  const { isRTL, language } = useLanguage();
  const t = useTranslations('employeesRequests');
  const tCommon = useTranslations('common');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  // Get status badge
  const getStatusBadge = (status) => {
    const config = getStatusBadgeConfig(status, language);
    const label = status === 'approved' ? tCommon('approved') : 
                  status === 'rejected' ? tCommon('rejected') : 
                  status === 'pending' ? tCommon('pending') : config.label;
    return (
      <Badge className={config.className}>
        {label}
      </Badge>
    );
  };

  // Get overall status
  const getOverallStatus = (request) => {
    // If both approved, show approved
    if (request.manager_approval === 'approved' && request.hr_approval === 'approved') {
      return getStatusBadge('approved');
    }
    // If any rejected, show rejected
    if (request.manager_approval === 'rejected' || request.hr_approval === 'rejected') {
      return getStatusBadge('rejected');
    }
    // Otherwise pending
    return getStatusBadge('pending');
  };

  const handleCreateSuccess = () => {
    if (onUpdate) onUpdate();
  };

  // Column configuration for export
  const exportColumnConfig = {
    type: {
      en: 'Request Type',
      ar: 'نوع الطلب',
      label: t('requestType'),
      dataKey: 'type'
    },
    date: {
      en: 'Request Date',
      ar: 'التاريخ',
      label: t('date'),
      dataKey: 'date',
      type: 'date'
    },
    from_date: {
      en: 'From Date',
      ar: 'من تاريخ',
      label: t('fromDate'),
      dataKey: 'from_date',
      type: 'date'
    },
    to_date: {
      en: 'To Date',
      ar: 'إلى تاريخ',
      label: t('toDate'),
      dataKey: 'to_date',
      type: 'date'
    },
    manager_approval: {
      en: 'Manager Approval',
      ar: 'موافقة المدير',
      label: t('managerApproval'),
      dataKey: 'manager_approval',
      formatter: (value, item, lang) => {
        if (value === 'approved') return lang === 'ar' ? 'موافق' : 'Approved';
        if (value === 'rejected') return lang === 'ar' ? 'مرفوض' : 'Rejected';
        if (value === 'pending') return lang === 'ar' ? 'قيد الانتظار' : 'Pending';
        return value || '-';
      }
    },
    hr_approval: {
      en: 'HR Approval',
      ar: 'موافقة الموارد البشرية',
      label: t('hrApproval'),
      dataKey: 'hr_approval',
      formatter: (value, item, lang) => {
        if (value === 'approved') return lang === 'ar' ? 'موافق' : 'Approved';
        if (value === 'rejected') return lang === 'ar' ? 'مرفوض' : 'Rejected';
        if (value === 'pending') return lang === 'ar' ? 'قيد الانتظار' : 'Pending';
        return value || '-';
      }
    },
    overall_status: {
      en: 'Overall Status',
      ar: 'الحالة',
      label: t('status'),
      formatter: (value, item, lang) => {
        // Calculate overall status
        if (item.manager_approval === 'approved' && item.hr_approval === 'approved') {
          return lang === 'ar' ? 'موافق' : 'Approved';
        }
        if (item.manager_approval === 'rejected' || item.hr_approval === 'rejected') {
          return lang === 'ar' ? 'مرفوض' : 'Rejected';
        }
        return lang === 'ar' ? 'قيد الانتظار' : 'Pending';
      }
    }
  };

  return (
    <div className="w-full space-y-4">
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4">
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>
                  {t('myRequests')}
                </CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  {t('myRequestsSubtitle')}
                </p>
              </div>
              <Button onClick={() => setIsCreateDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                {t('newRequest')}
              </Button>
            </div>
            {requests && requests.length > 0 && (
              <ExportButtons
                data={requests}
                columnConfig={exportColumnConfig}
                language={language}
                exportName={t('myRequestsExportName')}
                sheetName={t('myRequests')}
              />
            )}
          </div>
        </CardHeader>
        <CardContent>
          {!requests || requests.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">
                {t('noRequestsYet')}
              </p>
              <Button onClick={() => setIsCreateDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                {t('createFirstRequest')}
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className={isRTL ? 'text-right' : 'text-left'}>
                    {t('requestType')}
                  </TableHead>
                  <TableHead className={isRTL ? 'text-right' : 'text-left'}>
                    {t('date')}
                  </TableHead>
                  <TableHead className={isRTL ? 'text-right' : 'text-left'}>
                    {t('fromDate')}
                  </TableHead>
                  <TableHead className={isRTL ? 'text-right' : 'text-left'}>
                    {t('toDate')}
                  </TableHead>
                  <TableHead className={isRTL ? 'text-right' : 'text-left'}>
                    {t('managerApproval')}
                  </TableHead>
                  <TableHead className={isRTL ? 'text-right' : 'text-left'}>
                    {t('hrApproval')}
                  </TableHead>
                  <TableHead className={isRTL ? 'text-right' : 'text-left'}>
                    {t('status')}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {requests.map((request) => (
                  <TableRow key={request.id}>
                    <TableCell className="font-medium">{request.type || '-'}</TableCell>
                    <TableCell>{formatDate(request.date, language)}</TableCell>
                    <TableCell>{formatDate(request.from_date, language)}</TableCell>
                    <TableCell>{formatDate(request.to_date, language)}</TableCell>
                    <TableCell>{getStatusBadge(request.manager_approval)}</TableCell>
                    <TableCell>{getStatusBadge(request.hr_approval)}</TableCell>
                    <TableCell>{getOverallStatus(request)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
      
      {/* Create Request Dialog */}
      <CreateRequestDialog
        isOpen={isCreateDialogOpen}
        onClose={() => setIsCreateDialogOpen(false)}
        onSuccess={handleCreateSuccess}
      />
    </div>
  );
}

export default EmployeeRequestsView;
