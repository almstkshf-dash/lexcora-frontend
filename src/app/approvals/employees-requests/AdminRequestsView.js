'use client';

import React, { useState } from 'react';
import { Edit } from 'lucide-react';
import { updateManagerApproval, updateHrApproval } from '@/app/services/api/employeeRequests';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTranslations } from '@/hooks/useTranslations';
import { toast } from 'react-toastify';
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { formatDate, getStatusBadgeConfig } from './utils';
import ExportButtons from '@/components/ui/export-buttons';

function AdminRequestsView({ requests, onUpdate }) {
  const { isRTL, language } = useLanguage();
  const t = useTranslations('employeesRequests');
  const tCommon = useTranslations('common');

  // Modal state
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [editType, setEditType] = useState('manager'); // 'manager' or 'hr'
  const [approvalStatus, setApprovalStatus] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Get status badge
  const getStatusBadge = (status) => {
    const config = getStatusBadgeConfig(status, language);
    // Use standard translations if available, otherwise fallback to config label
    const label = status === 'approved' ? tCommon('approved') : 
                  status === 'rejected' ? tCommon('rejected') : 
                  status === 'pending' ? tCommon('pending') : config.label;
    
    return (
      <Badge className={config.className}>
        {label}
      </Badge>
    );
  };

  // Handle edit click
  const handleEditClick = (request, type) => {
    setSelectedRequest(request);
    setEditType(type);
    setApprovalStatus('');
    setIsEditModalOpen(true);
  };

  // Handle approval update
  const handleApprovalUpdate = async () => {
    if (!selectedRequest || !approvalStatus) {
      toast.error(t('pleaseSelectStatus'));
      return;
    }

    setIsSubmitting(true);

    try {
      if (editType === 'manager') {
        await updateManagerApproval(selectedRequest.id, approvalStatus);
      } else {
        await updateHrApproval(selectedRequest.id, approvalStatus);
      }

      toast.success(t('approvalStatusUpdated'));

      // Refresh data
      if (onUpdate) onUpdate();

      setIsEditModalOpen(false);
      setSelectedRequest(null);
      setApprovalStatus('');
    } catch (error) {
      toast.error(t('errorUpdating'));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!requests || !Array.isArray(requests) || requests.length === 0) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-center text-muted-foreground py-8">
            {t('noRequests')}
          </p>
        </CardContent>
      </Card>
    );
  }

  // Column configuration for export
  const exportColumnConfig = {
    employee_name: {
      en: 'Employee Name',
      ar: 'اسم الموظف',
      label: t('employeeName'),
      dataKey: 'employee_name'
    },
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
      dataKey: 'from_date',
      type: 'date'
    },
    to_date: {
      en: 'To Date',
      ar: 'إلى تاريخ',
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
    }
  };

  return (
    <div className="w-full space-y-4">
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4">
            <div>
              <CardTitle>
                {t('adminTitle')}
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                {t('adminSubtitle')}
              </p>
            </div>
            <ExportButtons
              data={requests}
              columnConfig={exportColumnConfig}
              language={language}
              exportName={t('exportName')}
              sheetName={t('sheetName')}
            />
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className={isRTL ? 'text-right' : 'text-left'}>
                  {t('employeeName')}
                </TableHead>
                <TableHead className={isRTL ? 'text-right' : 'text-left'}>
                  {t('requestType')}
                </TableHead>
                <TableHead className={isRTL ? 'text-right' : 'text-left'}>
                  {t('date')}
                </TableHead>
                <TableHead className={isRTL ? 'text-right' : 'text-left'}>
                  {t('managerApproval')}
                </TableHead>
                <TableHead className={isRTL ? 'text-right' : 'text-left'}>
                  {t('hrApproval')}
                </TableHead>
                <TableHead className={isRTL ? 'text-right' : 'text-left'}>
                  {t('actions')}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {requests.map((request) => (
                <TableRow key={request.id}>
                  <TableCell>{request.employee_name || '-'}</TableCell>
                  <TableCell>{request.type || '-'}</TableCell>
                  <TableCell>{formatDate(request.date, language)}</TableCell>
                  <TableCell>{getStatusBadge(request.manager_approval)}</TableCell>
                  <TableCell>{getStatusBadge(request.hr_approval)}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditClick(request, 'manager')}
                        title={t('editManager')}
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        {t('mgr')}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditClick(request, 'hr')}
                        title={t('editHR')}
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        {t('hr')}
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Edit Approval Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editType === 'manager' ? t('managerApproval') : t('hrApproval')}
            </DialogTitle>
            <DialogDescription>
              {t('modalDescription')}
            </DialogDescription>
          </DialogHeader>

          {selectedRequest && (
            <div className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">
                  {t('employee')}: {selectedRequest.employee_name}
                </p>
                <p className="text-sm text-muted-foreground">
                  {t('type')}: {selectedRequest.type}
                </p>
                <p className="text-sm text-muted-foreground">
                  {t('date')}: {formatDate(selectedRequest.date, language)}
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">
                  {t('status')}
                </label>
                <Select value={approvalStatus} onValueChange={setApprovalStatus}>
                  <SelectTrigger>
                    <SelectValue placeholder={t('selectStatusPlaceholder')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="approved">
                      {tCommon('approved')}
                    </SelectItem>
                    <SelectItem value="rejected">
                      {tCommon('rejected')}
                    </SelectItem>
                    <SelectItem value="pending">
                      {tCommon('pending')}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsEditModalOpen(false);
                setSelectedRequest(null);
                setApprovalStatus('');
              }}
              disabled={isSubmitting}
            >
              {tCommon('cancel')}
            </Button>
            <Button
              onClick={handleApprovalUpdate}
              disabled={isSubmitting || !approvalStatus}
            >
              {isSubmitting ? tCommon('saving') : tCommon('save')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default AdminRequestsView;
