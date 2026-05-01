'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import { Eye, FileText, CheckCircle } from 'lucide-react';
import useSWR from 'swr';
import { useActiveEmployeeMemos } from '@/hooks/useActiveEmployeeMemos';
import { updateEmployeeMemoStatus, getActiveMemos } from '@/app/services/api/memos';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTranslations } from '@/hooks/useTranslations';
import { toast } from 'react-toastify';
import ApprovalModal from './ApprovalModal';
import EditMemoModal from '../../cases/[id]/edit/memos/EditMemoModal';
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

const Memos = () => {
  const { isRTL, language } = useLanguage();
  const { t } = useTranslations();
  const router = useRouter();
  
  // Get employee role from Redux
  const employeeRole = useSelector((state) => state.auth.roleEn);
  
  // Modal state
  const [isApprovalModalOpen, setIsApprovalModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedMemo, setSelectedMemo] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Conditionally fetch data based on role
  // If admin, fetch all active memos, otherwise fetch employee-specific memos
  const isAdmin = employeeRole?.toLowerCase() === 'admin';
  
  // Fetch all active memos for admin
  const { data: adminData, error: adminError, isLoading: adminLoading, mutate: adminMutate } = useSWR(
    isAdmin ? '/memos/active' : null,
    () => getActiveMemos(),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
    }
  );
  
  // Fetch active employee memos for non-admin users
  const { memos: employeeMemos, isLoading: employeeLoading, isError: employeeError, mutate: employeeMutate } = useActiveEmployeeMemos();
  
  // Use the appropriate data source based on role
  const rawMemos = isAdmin ? (adminData?.data || []) : employeeMemos;
  const isLoading = isAdmin ? adminLoading : employeeLoading;
  const isError = isAdmin ? adminError : employeeError;
  const mutate = isAdmin ? adminMutate : employeeMutate;

  // Filter memos based on role and status
  const filterMemosByRole = (memos, role) => {
    if (!role || !memos) return [];
    
    const normalizedRole = role.toLowerCase();
    
    return memos.filter((memo) => {
      // Legal Advisor: show memos where lawyer_status = "Rejected"
      if (normalizedRole === 'legal advisor') {
        return memo.lawyer_status === 'Rejected';
      }
      
      // Lawyer: show memos where admin_status = "Rejected"
      if (normalizedRole === 'lawyer') {
        return memo.admin_status === 'Rejected';
      }
      
      // Secretary: show memos where admin_status = "Approved"
      if (normalizedRole === 'secretary') {
        return memo.admin_status === 'Approved';
      }
      
      // Admin: show all memos (no filtering)
      if (normalizedRole === 'admin') {
        return memo.admin_status !== 'Approved';
      }
      
      // Default: don't show memo if role doesn't match
      return false;
    });
  };

  // Apply filtering
  const memos = filterMemosByRole(rawMemos, employeeRole);

  // Helper function to format date
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString(language === 'ar' ? 'ar-AE' : 'en-US');
  };

 

  // Handle opening approval modal
  const handleOpenApprovalModal = (memo) => {
    setSelectedMemo(memo);
    setIsApprovalModalOpen(true);
  };

  // Handle closing approval modal
  const handleCloseApprovalModal = () => {
    setIsApprovalModalOpen(false);
    setSelectedMemo(null);
  };

  // Handle opening edit modal
  const handleOpenEditModal = (memo) => {
    setSelectedMemo(memo);
    setIsEditModalOpen(true);
  };

  // Handle closing edit modal
  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setSelectedMemo(null);
  };

  // Handle memo updated
  const handleMemoUpdated = () => {
    // Refresh the memos list
    mutate();
  };

  // Handle approval confirmation
  const handleApprovalConfirm = async (isApproved) => {
    // return null
    if (!selectedMemo || !employeeRole) {
      toast.error(t('memos.employeeInfoNotFound'));
      return;
    }

    setIsSubmitting(true);
    
    try {
      await updateEmployeeMemoStatus(selectedMemo.id, employeeRole, isApproved);
      
      // Refresh the memos list
      await mutate();
      
      toast.success(t('memos.approvalStatusUpdated'));
      
      handleCloseApprovalModal();
    } catch (error) {
      // Check if it's a permission error (403)
      const isPermissionError = error?.response?.status === 403;
      const errorMessage = isPermissionError 
        ? (error?.response?.data?.message || (language === 'ar' ? '??? ???? ?????? ?????? ???? ????????' : 'You do not have permission to update approval status'))
        : (error?.response?.data?.message || t('memos.failedToUpdateApproval'));
      
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Helper function to get status badge
  const getStatusBadge = (status) => {
    if (!status) return null;
    
    let color, text;
    
    switch (status) {
      case 'Submitted to Court':
        color = 'bg-blue-100 text-blue-800 hover:bg-blue-100';
        text = t('memos.statusSubmittedToCourt');
        break;
      case 'Under Review':
        color = 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100';
        text = t('memos.statusUnderReview');
        break;
      case 'Approved':
        color = 'bg-green-100 text-green-800 hover:bg-green-100';
        text = t('memos.statusApproved');
        break;
      case 'Rejected':
        color = 'bg-red-100 text-red-800 hover:bg-red-100';
        text = t('memos.statusRejected');
        break;
      default:
        color = 'bg-gray-100 text-gray-800 hover:bg-gray-100';
        text = status;
    }
    
    return <Badge className={color}>{text}</Badge>;
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <Card>
          <CardHeader>
            <CardTitle>{t('memos.memosPageTitle')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center py-8">
              <div className="text-muted-foreground">{t('common.loading')}</div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-6">
        <Card>
          <CardHeader>
            <CardTitle>{t('memos.memosPageTitle')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center py-8">
              <div className="text-red-500">{t('common.errorLoading')}</div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">
          {t('memos.memosPageTitle')}
        </h1>
      </div>

      {/* Memos Table */}
      <Card>
        <CardHeader>
          <CardTitle>
            {t('memos.memosPageTitle')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {memos.length === 0 ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-muted-foreground">
                {t('common.noData')}
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className={isRTL ? 'text-right' : 'text-left'}>
                      #
                    </TableHead>
                    <TableHead className={isRTL ? 'text-right' : 'text-left'}>
                      {t('memos.memoTitle')}
                    </TableHead>
                    <TableHead className={isRTL ? 'text-right' : 'text-left'}>
                      {t('memos.submissionDate')}
                    </TableHead>
                    {/* <TableHead className={isRTL ? 'text-right' : 'text-left'}>
                      {t('memos.status')}
                    </TableHead> */}
                
                    <TableHead className={isRTL ? 'text-right' : 'text-left'}>
                      {t('memos.createdBy')}
                    </TableHead>
                    <TableHead className={isRTL ? 'text-right' : 'text-left'}>
                      {t('memos.createdAt')}
                    </TableHead>
                    <TableHead className={isRTL ? 'text-right' : 'text-left'}>
                      {t('memos.actions')}
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {memos.map((memo, index) => (
                    <TableRow key={memo.id}>
                      <TableCell className="font-medium">{index + 1}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-muted-foreground" />
                          {memo.title}
                        </div>
                      </TableCell>
                      <TableCell>{formatDate(memo.submission_date)}</TableCell>
                      {/* <TableCell>{getStatusBadge(memo.status)}</TableCell> */}
                      <TableCell>{memo.created_by_name || '-'}</TableCell>
                      <TableCell>{formatDate(memo.created_at)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleOpenEditModal(memo)}
                            title={t('memos.editMemoAction')}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleOpenApprovalModal(memo)}
                            title={t('memos.changeApproval')}
                            className="text-green-600 hover:text-green-700 hover:bg-green-50"
                          >
                            <CheckCircle className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Approval Modal */}
      <ApprovalModal
        isOpen={isApprovalModalOpen}
        onClose={handleCloseApprovalModal}
        onConfirm={handleApprovalConfirm}
        memoTitle={selectedMemo?.title || ''}
        isLoading={isSubmitting}
        currentStatus={
          employeeRole?.toLowerCase() === 'admin' ? selectedMemo?.admin_status :
          employeeRole?.toLowerCase() === 'secretary' ? selectedMemo?.secretary_status :
          employeeRole?.toLowerCase() === 'legal advisor' ? selectedMemo?.consultant_status :
          employeeRole?.toLowerCase() === 'lawyer' ? selectedMemo?.lawyer_status :
          selectedMemo?.admin_status
        }
      />

      {/* Edit Memo Modal */}
      <EditMemoModal
        isOpen={isEditModalOpen}
        onClose={handleCloseEditModal}
        memoId={selectedMemo?.id}
        onSuccess={handleMemoUpdated}
        employeeRole={employeeRole}
      />
    </div>
  );
};

export default Memos;
