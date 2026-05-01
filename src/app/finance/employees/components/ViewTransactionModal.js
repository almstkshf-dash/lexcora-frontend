'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTranslations } from '@/hooks/useTranslations';
import { Download, Trash2, X, Upload } from 'lucide-react';
import { toast } from 'react-toastify';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { getEmployeeCashTransactionById, updateEmployeeCashTransaction, deleteEmployeeCashTransactionAttachment } from '@/app/services/api/employeeCashTransactions';
import { uploadFiles } from '../../../../../utils/fileUpload';
import api from '@/app/services/api/axiosInstance';
import { DEFAULT_CURRENCY, LOCALE, TRANSACTION_TYPE } from '@/app/finance/constants';

function AttachmentItem({ attachment, deletingAttachment, onDownload, onDelete, t, formatDateTime }) {
  const handleDownload = useCallback(() => onDownload(attachment.attachment_url, attachment.attachment_name), [onDownload, attachment.attachment_url, attachment.attachment_name]);
  const handleDelete = useCallback(() => onDelete(attachment.id, attachment.attachment_name), [onDelete, attachment.id, attachment.attachment_name]);
  return (
    <div className="flex items-center justify-between p-3  rounded-lg border  transition-colors">
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{attachment.attachment_name}</p>
        <p className="text-xs ">{formatDateTime(attachment.created_at)}</p>
      </div>
      <div className="flex gap-2 mr-3">
        <Button type="button" variant="ghost" size="sm" onClick={handleDownload} className="hover:bg-blue-50" title={t('download')}>
          <Download className="h-4 w-4 text-blue-600" />
        </Button>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button type="button" variant="ghost" size="sm" className="hover:bg-red-50" disabled={deletingAttachment === attachment.id} title={t('delete')}>
              <Trash2 className="h-4 w-4 text-red-600" />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{t('deleteAttachmentConfirm')}</AlertDialogTitle>
              <AlertDialogDescription>{t('deleteAttachmentMessage')}</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>{t('close')}</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">{t('delete')}</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}

const ViewTransactionModal = ({ isOpen, onClose, transactionId }) => {
  const { isRTL } = useLanguage();
  const t = useTranslations('employeeFinance.viewModal');
  const [deletingAttachment, setDeletingAttachment] = useState(null);
  const [transaction, setTransaction] = useState(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Fetch transaction data
  useEffect(() => {
    const fetchTransaction = async () => {
      if (!transactionId || !isOpen) return;
      
      setLoading(true);
      try {
        const response = await getEmployeeCashTransactionById(transactionId);
        if (response.success) {
          setTransaction(response.data);
        } else {
          toast.error(t('loadError'));
        }
      } catch {
        toast.error(t('loadError'));
      } finally {
        setLoading(false);
      }
    };

    fetchTransaction();
  }, [transactionId, isOpen, t]);

  if (!isOpen) return null;

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat(LOCALE.ar, {
      style: 'currency',
      currency: DEFAULT_CURRENCY
    }).format(amount);
  };

  const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleString(LOCALE.ar);
  };

  const extractKeyFromUrl = (url) => {
    try {
      const urlObj = new URL(url);
      const pathname = urlObj.pathname;
      return pathname.startsWith('/') ? pathname.substring(1) : pathname;
    } catch {
      return url;
    }
  };

  const handleDownload = async (url, name) => {
    try {
      // Extract the key from the URL
      const key = extractKeyFromUrl(url);
      
      // Get fresh presigned URL from backend
      const response = await api.post('/upload/presigned-url', { key });
      
      const presignedUrl = response.data.url;
      if (response.data.success && presignedUrl && presignedUrl.startsWith('https://')) {
        const link = document.createElement('a');
        link.href = presignedUrl;
        link.download = name;
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success(t('downloadSuccess'));
      } else {
        throw new Error('Failed to get download URL');
      }
    } catch {
      toast.error(t('downloadError'));
    }
  };

  const handleDeleteAttachment = async (attachmentId, attachmentName) => {
    setDeletingAttachment(attachmentId);
    try {
      // Call the API to delete the attachment
      const response = await deleteEmployeeCashTransactionAttachment(transactionId, attachmentId);
      
      if (response.success) {
        toast.success(t('deleteAttachmentSuccess'));
        // Refresh transaction data
        const updatedTransaction = await getEmployeeCashTransactionById(transactionId);
        if (updatedTransaction.success) {
          setTransaction(updatedTransaction.data);
        }
      } else {
        toast.error(t('deleteAttachmentError'));
      }
    } catch {
      toast.error(t('deleteAttachmentError'));
    } finally {
      setDeletingAttachment(null);
    }
  };

  const handleAddFiles = async (event) => {
    const files = Array.from(event.target.files);
    if (files.length === 0) return;

    setUploading(true);
    try {
      // Upload files
      const uploadedResults = await uploadFiles(files, 'employee-cash-transactions');
      
      // Get current attachments
      const currentAttachments = attachments.map(att => ({
        attachment_url: att.attachment_url,
        attachment_name: att.attachment_name
      }));
      
      // Add new attachments
      const newAttachments = uploadedResults.map(file => ({
        attachment_url: file.document_url,
        attachment_name: file.document_name
      }));
      
      // Update transaction with all attachments
      const updatePayload = {
        employee_id: transaction.employee_id,
        amount: transaction.amount,
        type: TRANSACTION_TYPE.CREDIT,
        description: transaction.description,
        attachments: [...currentAttachments, ...newAttachments]
      };
      
      const response = await updateEmployeeCashTransaction(transactionId, updatePayload);
      
      if (response.success) {
        toast.success(t('filesAdded', { count: files.length }));
        // Refresh transaction data
        const updatedTransaction = await getEmployeeCashTransactionById(transactionId);
        if (updatedTransaction.success) {
          setTransaction(updatedTransaction.data);
        }
      } else {
        toast.error(t('addFilesError'));
      }
    } catch {
      toast.error(t('addFilesError'));
    } finally {
      setUploading(false);
    }
  };

  // Parse attachments - only if transaction exists
  let attachments = [];
  if (transaction) {
    try {
      
      if (transaction.attachments !== null && transaction.attachments !== undefined) {
        if (typeof transaction.attachments === 'string') {
          // Try to parse JSON string
          try {
            const parsed = JSON.parse(transaction.attachments);
            attachments = Array.isArray(parsed) ? parsed.filter(att => att !== null) : [];
          } catch {
            attachments = [];
          }
        } else if (Array.isArray(transaction.attachments)) {
          // Already an array - filter out null values
          attachments = transaction.attachments.filter(att => att !== null);
        } else if (typeof transaction.attachments === 'object') {
          // Single object, wrap in array
          attachments = [transaction.attachments];
        }
      }
      
    } catch {
      // ignore
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={`max-w-2xl max-h-[90vh] overflow-y-auto ${isRTL ? 'rtl' : 'ltr'}`}>
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">
            {t('title')}
          </DialogTitle>
        </DialogHeader>
        
        {loading ? (
          <div className="flex items-center justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            <span className="mr-3">{t('loading')}</span>
          </div>
        ) : transaction ? (
          <div className="space-y-4">
          {/* Employee Info */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label className="text-sm ">{t('employeeName')}</Label>
              <p className="font-medium">{transaction.employee_name || '-'}</p>
            </div>
            <div className="space-y-1">
              <Label className="text-sm ">{t('phoneNumber')}</Label>
              <p className="font-mono">{transaction.employee_phone || '-'}</p>
            </div>
          </div>

          {/* Amount */}
          <div className="space-y-1">
            <Label className="text-sm ">{t('amount')}</Label>
            <p className="text-2xl font-bold text-green-600">
              {formatCurrency(transaction.amount)}
            </p>
          </div>

          {/* Description */}
          <div className="space-y-1">
            <Label className="text-sm ">{t('description')}</Label>
            <p className=" whitespace-pre-wrap">
              {transaction.description || t('noDescription')}
            </p>
          </div>

          {/* Created By */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label className="text-sm ">{t('addedBy')}</Label>
              <p>{transaction.created_by_name || '-'}</p>
            </div>
            <div className="space-y-1">
              <Label className="text-sm ">{t('addedAt')}</Label>
              <p className="text-sm">{formatDateTime(transaction.created_at)}</p>
            </div>
          </div>

          {/* Attachments */}
          <div className="space-y-3 border-t pt-4">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-semibold">
                {t('attachments')} ({attachments.length})
              </Label>
              
              {/* Add Files Button */}
              <div>
                <input
                  type="file"
                  multiple
                  onChange={handleAddFiles}
                  className="hidden"
                  id="add-files"
                  disabled={uploading}
                />
                <label htmlFor="add-files">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="cursor-pointer"
                    disabled={uploading}
                    asChild
                  >
                    <span>
                      <Upload className="h-4 w-4 ml-2" />
                      {uploading ? t('uploading') : t('addFiles')}
                    </span>
                  </Button>
                </label>
              </div>
            </div>
            
            {attachments.length === 0 ? (
              <p className="text-sm  py-4 text-center">
                {t('noAttachments')}
              </p>
            ) : (
              <div className="space-y-2">
                {attachments.map((attachment) => (
                  <AttachmentItem
                    key={attachment.id}
                    attachment={attachment}
                    deletingAttachment={deletingAttachment}
                    onDownload={handleDownload}
                    onDelete={handleDeleteAttachment}
                    t={t}
                    formatDateTime={formatDateTime}
                  />
                ))}
              </div>
            )}
          </div>

            {/* Close Button */}
            <div className="flex justify-end pt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={onClose}
              >
                {t('close')}
              </Button>
            </div>
          </div>
        ) : (
          <div className="text-center p-8 ">
            {t('noData')}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ViewTransactionModal;
