'use client';

import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTranslations } from '@/hooks/useTranslations';
import { getEmployeeCashTransactionById, addEmployeeCashTransactionAttachments, deleteEmployeeCashTransactionAttachment } from '@/app/services/api/employeeCashTransactions';
import { uploadFiles } from '../../../../../utils/fileUpload';
import { toast } from 'react-toastify';
import { Download, X, Upload, FileText, Loader2 } from 'lucide-react';

const ExpenseDetailsModal = ({ isOpen, onClose, expenseId }) => {
  const { isRTL } = useLanguage();
  const t = useTranslations('employeeFinance.expenses');
  const tCommon = useTranslations('common');
  const [expense, setExpense] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [uploading, setUploading] = useState(false);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (isOpen && expenseId) {
      fetchExpenseDetails();
    }
  }, [isOpen, expenseId]);

  const fetchExpenseDetails = async () => {
    try {
      setLoading(true);
      const response = await getEmployeeCashTransactionById(expenseId);
      if (response.success) {
        setExpense(response.data);
      } else {
        toast.error(t('loadError') || 'حدث خطأ في تحميل تفاصيل المصروف');
      }
    } catch (error) {
      console.error('Error fetching expense details:', error);
      toast.error(t('loadError') || 'حدث خطأ في تحميل تفاصيل المصروف');
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (event) => {
    const files = Array.from(event.target.files);
    if (files.length === 0) return;
    setSelectedFiles([...selectedFiles, ...files]);
  };

  const handleRemoveFile = (index) => {
    const newFiles = selectedFiles.filter((_, i) => i !== index);
    setSelectedFiles(newFiles);
  };

  const handleUploadFiles = async () => {
    if (selectedFiles.length === 0) {
      toast.warning(tCommon('selectFilesFirst') || 'يرجى اختيار ملفات للرفع');
      return;
    }

    try {
      setUploading(true);
      const uploadedResults = await uploadFiles(selectedFiles, 'employee-expenses');
      
      const attachments = uploadedResults.map(file => ({
        attachment_url: file.document_url,
        attachment_name: file.document_name
      }));

      // Save attachments to database
      const response = await addEmployeeCashTransactionAttachments(expenseId, attachments);
      
      if (response.success) {
        toast.success(tCommon('uploadSuccess') || 'تم رفع المرفقات بنجاح');
        setSelectedFiles([]);
        fetchExpenseDetails(); // Refresh to show new attachments
      } else {
        toast.error(tCommon('uploadError') || 'حدث خطأ في حفظ المرفقات');
      }
    } catch (error) {
      console.error('Error uploading files:', error);
      toast.error(tCommon('uploadError') || 'حدث خطأ في رفع المرفقات');
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteAttachment = async (attachmentId) => {
    if (!confirm(tCommon('confirmDelete') || 'هل أنت متأكد من حذف هذا المرفق؟')) return;

    try {
      const response = await deleteEmployeeCashTransactionAttachment(expenseId, attachmentId);
      
      if (response.success) {
        toast.success(tCommon('deleteSuccess') || 'تم حذف المرفق بنجاح');
        fetchExpenseDetails();
      } else {
        toast.error(tCommon('deleteError') || 'حدث خطأ في حذف المرفق');
      }
    } catch (error) {
      console.error('Error deleting attachment:', error);
      toast.error(tCommon('deleteError') || 'حدث خطأ في حذف المرفق');
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('ar-AE', {
      style: 'currency',
      currency: 'AED'
    }).format(amount);
  };

  const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleString('ar-AE');
  };

  if (loading) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[700px]" dir={isRTL ? 'rtl' : 'ltr'}>
          <div className="flex items-center justify-center p-8">
            <Loader2 className="h-8 w-8 animate-spin " />
            <span className="mr-3">{tCommon('loading') || 'جاري التحميل...'}</span>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (!expense) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto" dir={isRTL ? 'rtl' : 'ltr'}>
        <DialogHeader>
          <DialogTitle>{t('expenseDetails') || 'تفاصيل المصروف'}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Employee Information */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium ">{t('employeeName')}</Label>
              <p className="mt-1 text-lg font-semibold">{expense.employee_name}</p>
            </div>
            <div>
              <Label className="text-sm font-medium ">{t('phoneNumber')}</Label>
              <p className="mt-1 text-lg">{expense.employee_phone || '-'}</p>
            </div>
          </div>

          {/* Amount and Balance */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-red-50 rounded-lg border border-red-200">
              <Label className="text-sm font-medium text-red-700">{t('amount')}</Label>
              <p className="mt-1 text-2xl font-bold text-red-600">
                - {formatCurrency(expense.amount)}
              </p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
              <Label className="text-sm font-medium ">{t('currentBalance')}</Label>
              <p className={`mt-1 text-2xl font-bold ${
                expense.employee_balance > 0 
                  ? 'text-green-600' 
                  : expense.employee_balance < 0 
                  ? 'text-red-600' 
                  : 'text-gray-600'
              }`}>
                {formatCurrency(expense.employee_balance)}
              </p>
            </div>
          </div>

          {/* Description */}
          {expense.description && (
            <div>
              <Label className="text-sm font-medium ">{t('description')}</Label>
              <p className="mt-1 p-3 bg-gray-50 rounded-lg border">{expense.description}</p>
            </div>
          )}

          {/* Metadata */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <Label className="">{t('addedBy')}</Label>
              <p className="mt-1">{expense.created_by_name || '-'}</p>
            </div>
            <div>
              <Label className="">{t('addedAt')}</Label>
              <p className="mt-1">{formatDateTime(expense.created_at)}</p>
            </div>
          </div>

          {/* Existing Attachments */}
          <div>
            <Label className="text-sm font-medium  mb-2 block">
              {tCommon('attachments')} ({expense.attachments?.length || 0})
            </Label>
            
            {expense.attachments && expense.attachments.length > 0 ? (
              <div className="space-y-2">
                {expense.attachments.map((attachment) => (
                  <div
                    key={attachment.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <FileText className="h-5 w-5 text-blue-600 flex-shrink-0" />
                      <span className="text-sm truncate">{attachment.attachment_name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => window.open(attachment.attachment_url, '_blank')}
                        className="hover:bg-blue-50"
                      >
                        <Download className="h-4 w-4 text-blue-600" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteAttachment(attachment.id)}
                        className="hover:bg-red-50"
                      >
                        <X className="h-4 w-4 text-red-600" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm  p-4  rounded-lg text-center">
                {tCommon('noAttachments') || 'لا توجد مرفقات'}
              </p>
            )}
          </div>

          {/* Upload New Files */}
          <div className="border-t pt-4">
            <Label className="text-sm font-medium  mb-2 block">
              {tCommon('addNewAttachments') || 'إضافة مرفقات جديدة'}
            </Label>
            
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
              <input
                type="file"
                multiple
                onChange={handleFileSelect}
                className="hidden"
                id="file-upload"
                accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png"
              />
              <label
                htmlFor="file-upload"
                className="flex flex-col items-center cursor-pointer"
              >
                <Upload className="h-8 w-8  mb-2" />
                <span className="text-sm ">
                  {tCommon('selectFiles')}
                </span>
                <span className="text-xs  mt-1">
                  {tCommon('supportedFormats')}
                </span>
              </label>
            </div>

            {/* Selected Files Preview */}
            {selectedFiles.length > 0 && (
              <div className="mt-3 space-y-2">
                <Label className="text-sm">
                  {tCommon('selectedFiles')} ({selectedFiles.length})
                </Label>
                {selectedFiles.map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-2 bg-blue-50 rounded border border-blue-200"
                  >
                    <span className="text-sm truncate flex-1">{file.name}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveFile(index)}
                      className="hover:bg-red-50"
                    >
                      <X className="h-4 w-4 text-red-600" />
                    </Button>
                  </div>
                ))}
                <Button
                  onClick={handleUploadFiles}
                  disabled={uploading}
                  className="w-full mt-2"
                >
                  {uploading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      {tCommon('uploading') || 'جاري الرفع...'}
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4 mr-2" />
                      {tCommon('uploadFiles') || 'رفع المرفقات'}
                    </>
                  )}
                </Button>
              </div>
            )}
          </div>

          {/* Close Button */}
          <div className="flex justify-end pt-4">
            <Button variant="outline" onClick={onClose}>
              {tCommon('close')}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ExpenseDetailsModal;
