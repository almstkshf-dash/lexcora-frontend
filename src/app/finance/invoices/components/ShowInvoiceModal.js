"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Loader2, Download, Trash2, FileText, File, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { CustomModal, CustomModalBody, CustomModalFooter } from "@/components/ui/custom-modal";
import { toast } from "react-toastify";
import { getInvoiceById, deleteInvoiceAttachment, uploadInvoiceAttachments } from "@/app/services/api/invoices";
import { format, parseISO } from "date-fns";
import { ar, enUS } from "date-fns/locale";
import { useTranslations } from "@/hooks/useTranslations";
import { useLanguage } from "@/contexts/LanguageContext";

function AttachmentRow({ attachment, deletingAttachment, onDownload, onDelete, getFileIcon, tCommon }) {
  const handleDownload = useCallback(() => onDownload(attachment), [onDownload, attachment]);
  const handleDelete = useCallback(() => onDelete(attachment.id), [onDelete, attachment.id]);

  return (
    <div className="flex items-center justify-between p-3 rounded border border-gray-200 hover:bg-gray-100 transition-colors">
      <div className="flex items-center gap-3 flex-1">
        {getFileIcon(attachment.attachment_name)}
        <p className="text-sm font-medium">{attachment.attachment_name}</p>
      </div>
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" onClick={handleDownload} className="flex items-center gap-1">
          <Download className="h-4 w-4" />
          <span>{tCommon('download')}</span>
        </Button>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="outline" size="sm" disabled={deletingAttachment === attachment.id} className="flex items-center gap-1 text-red-600 hover:text-red-700">
              {deletingAttachment === attachment.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
              <span>{tCommon('delete')}</span>
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{tCommon('confirmDelete')}</AlertDialogTitle>
              <AlertDialogDescription>{tCommon('confirmDeleteMessage')}</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>{tCommon('cancel')}</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">{tCommon('delete')}</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}

export default function ShowInvoiceModal({ isOpen, onClose, invoiceId }) {
  const t = useTranslations('invoices');
  const tCommon = useTranslations('common');
  const { isRTL } = useLanguage();
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(false);
  const [deletingAttachment, setDeletingAttachment] = useState(null);
  const [uploadingAttachment, setUploadingAttachment] = useState(false);
  const fileInputRef = useRef(null);

  const loadInvoiceData = useCallback(async () => {
    try {
      setLoading(true);
      const response = await getInvoiceById(invoiceId);
      
      if (response.success) {
        setInvoice(response.data);
      } else {
        toast.error(t('loadingInvoiceData'));
        onClose();
      }
    } catch (error) {

      toast.error(t('loadingInvoiceData'));
      onClose();
    } finally {
      setLoading(false);
    }
  }, [invoiceId, onClose, t]);

  useEffect(() => {
    if (isOpen && invoiceId) {
      loadInvoiceData();
    }
  }, [isOpen, invoiceId, loadInvoiceData]);

  const formatCurrency = useCallback((amount, currency = 'AED') => {
    const currencyMap = {
      'AED': 'ar-AE',
      'USD': 'en-US',
      'EUR': 'de-DE',
      'GBP': 'en-GB',
      'SAR': 'ar-SA'
    };
    return new Intl.NumberFormat(currencyMap[currency] || 'ar-AE', {
      style: 'currency',
      currency: currency
    }).format(amount);
  }, []);

  const formatDate = useCallback((dateString) => {
    if (!dateString) return '-';
    try {
      return format(parseISO(dateString), "PPP", { locale: isRTL ? ar : enUS });
    } catch {
      return dateString;
    }
  }, [isRTL]);

  const getStatusBadge = useCallback((status) => {
    const statusConfig = {
      pending: { label: t('statusPending'), variant: 'secondary' },
      approved: { label: t('statusApproved'), variant: 'success' },
      rejected: { label: t('statusRejected'), variant: 'destructive' }
    };
    const config = statusConfig[status] || statusConfig.pending;
    return (
      <Badge variant={config.variant}>
        {config.label}
      </Badge>
    );
  }, [t]);

  const handleDownloadAttachment = useCallback((attachment) => {
    const link = document.createElement('a');
    link.href = attachment.attachment_url;
    link.download = attachment.attachment_name;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, []);

  const handleDeleteAttachment = useCallback(async (attachmentId) => {
    try {
      setDeletingAttachment(attachmentId);
      const response = await deleteInvoiceAttachment(attachmentId);
      
      if (response.success) {
        toast.success(tCommon('deleteSuccess'));
        loadInvoiceData();
      } else {
        toast.error(response.error || tCommon('deleteError'));
      }
    } catch {
      toast.error(tCommon('deleteError'));
    } finally {
      setDeletingAttachment(null);
    }
  }, [loadInvoiceData, tCommon]);

  const handleFileUpload = useCallback(async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    try {
      setUploadingAttachment(true);
      
      const formData = new FormData();
      files.forEach(file => {
        formData.append('files', file);
      });

      const result = await uploadInvoiceAttachments(invoiceId, formData);

      if (result.success) {
        toast.success(tCommon('uploadSuccess'));
        loadInvoiceData(); // Reload to get updated data
        e.target.value = ''; // Clear input
      } else {
        toast.error(result.error || tCommon('uploadError'));
      }
    } catch (error) {
      toast.error(error.response?.data?.error || tCommon('uploadError'));
    } finally {
      setUploadingAttachment(false);
    }
  }, [invoiceId, loadInvoiceData, tCommon]);

  const getFileIcon = useCallback((fileName) => {
    if (!fileName) {
      return <File className="h-5 w-5 " />;
    }
    const extension = fileName.split('.').pop().toLowerCase();
    if (['jpg', 'jpeg', 'png', 'gif', 'bmp'].includes(extension)) {
      return <FileText className="h-5 w-5 " />;
    }
    return <File className="h-5 w-5 " />;
  }, []);

  const handleUploadClick = useCallback(() => fileInputRef.current?.click(), []);

  const handleBackdropClick = useCallback((e) => {
    if (e.target === e.currentTarget && !loading) {
      onClose();
    }
  }, [loading, onClose]);

  if (!isOpen) return null;

  return (
    <CustomModal
      isOpen={isOpen}
      onClose={onClose}
      title={t('invoiceDetails')}
      size="lg"
    >
      {loading ? (
        <div className="flex items-center justify-center p-12">
          <Loader2 className="h-8 w-8 animate-spin " />
          <span className="me-3">{t('loadingData')}</span>
        </div>
      ) : invoice ? (
        <>
          <CustomModalBody>
            {/* Invoice Header Info */}
            <div className="grid grid-cols-2 gap-4 p-4  rounded-sg">
              <div>
                <label className="text-sm font-medium ">{t('invoiceNumber')}</label>
                <p className="text-lg font-bold font-mono">{invoice.invoice_number}</p>
              </div>
              <div>
                <label className="text-sm font-medium ">{t('date')}</label>
                <p className="text-lg font-semibold">{formatDate(invoice.invoice_date)}</p>
              </div>
              <div>
                <label className="text-sm font-medium ">{t('status')}</label>
                <div className="mt-1">
                  {getStatusBadge(invoice.status)}
                </div>
              </div>
              <div>
                <label className="text-sm font-medium ">{t('currency')}</label>
                <p className="text-lg font-semibold">{invoice.currency || 'AED'}</p>
              </div>
            </div>

            {/* Client & Branch Info */}
            <div className="space-y-3">
              <h3 className="font-bold text-lg border-b pb-2">{t('invoiceInfo')}</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium ">{t('client')}</label>
                  <p className="text-base">{invoice.client_name || '-'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium ">{t('branch')}</label>
                  <p className="text-base">{invoice.branch_name || '-'}</p>
                </div>
              </div>
            </div>

            {/* Bank Account Info */}
            {invoice.bank_name && (
              <div className="space-y-3">
                <h3 className="font-bold text-lg border-b pb-2">{t('bankAccount')}</h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium ">{t('bankName')}</label>
                    <p className="text-base">{invoice.bank_name}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium ">{t('accountNumber')}</label>
                    <p className="text-base font-mono">{invoice.account_number}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Invoice Items */}
            <div className="space-y-3">
              <h3 className="font-bold text-lg border-b pb-2">{t('invoiceDetails')}</h3>
              
              {invoice.items && invoice.items.length > 0 ? (
                <div className="space-y-2">
                  {invoice.items.map((item, index) => (
                    <div key={item.id || index} className="flex justify-between items-start p-3  rounded">
                      <div className="flex-1">
                        <span className="font-medium ">{index + 1}. </span>
                        <span>{item.description}</span>
                      </div>
                      <div className="font-semibold  me-4">
                        {formatCurrency(item.amount, invoice.currency)}
                      </div>
                    </div>
                  ))}
                  
                  {/* Subtotal */}
                  <div className="flex justify-between items-center p-3  rounded">
                    <span className="font-medium">{t('subtotal')}</span>
                    <span className="font-semibold">
                      {formatCurrency(
                        invoice.items.reduce((sum, item) => sum + parseFloat(item.amount), 0),
                        invoice.currency
                      )}
                    </span>
                  </div>
                  
                  {/* VAT */}
                  {invoice.vat > 0 && (
                    <div className="flex justify-between items-center p-3  rounded">
                      <span className="font-medium">{t('vatAmount').replace('{vat}', invoice.vat)}</span>
                      <span className="font-semibold">
                        {formatCurrency(
                          (invoice.items.reduce((sum, item) => sum + parseFloat(item.amount), 0) * invoice.vat) / 100,
                          invoice.currency
                        )}
                      </span>
                    </div>
                  )}
                  
                  {/* Total */}
                  <div className="flex justify-between items-center p-4  rounded font-bold text-lg border-t-2 border-blue-200 mt-4">
                    <span>{t('total')}</span>
                    <span className=" text-xl">{formatCurrency(invoice.amount, invoice.currency)}</span>
                  </div>
                </div>
              ) : (
                <p className=" text-center py-4">{tCommon('noData')}</p>
              )}
            </div>

            {/* Attachments */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-lg border-b pb-2 flex-1">{t('attachments')}</h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleUploadClick}
                  disabled={uploadingAttachment}
                  className="flex items-center gap-2"
                >
                  {uploadingAttachment ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>{tCommon('uploading')}</span>
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4" />
                      <span>{t('uploadFile')}</span>
                    </>
                  )}
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  onChange={handleFileUpload}
                  className="hidden"
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                />
              </div>
              
              {invoice.attachments && invoice.attachments.length > 0 ? (
                <div className="space-y-2">
                  {invoice.attachments.map((attachment) => (
                    <AttachmentRow
                      key={attachment.id}
                      attachment={attachment}
                      deletingAttachment={deletingAttachment}
                      onDownload={handleDownloadAttachment}
                      onDelete={handleDeleteAttachment}
                      getFileIcon={getFileIcon}
                      tCommon={tCommon}
                    />
                  ))}
                </div>
              ) : (
                <p className=" text-center py-4 text-sm">{tCommon('noAttachments')}</p>
              )}
            </div>

            {/* Metadata */}
            <div className="pt-4 border-t text-sm text-gray-600 dark:text-gray-400 space-y-1">
              <p>
                <span className="font-medium">{t('createdBy')}:</span> {invoice.created_by_name || '-'}
              </p>
              <p>
                <span className="font-medium">{t('createdAt')}:</span> {formatDate(invoice.created_at)}
              </p>
            </div>
          </CustomModalBody>

          <CustomModalFooter>
            <Button
              variant="outline"
              onClick={onClose}
            >
              {tCommon('close')}
            </Button>
          </CustomModalFooter>
        </>
      ) : (
        <div className="p-12 text-center ">
          {t('noInvoiceData')}
        </div>
      )}
    </CustomModal>
  );
}

