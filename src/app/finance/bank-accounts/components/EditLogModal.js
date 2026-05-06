'use client';

import React, { useState, useEffect } from 'react';
import { useTranslations } from '@/hooks/useTranslations';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Upload, X, Download } from 'lucide-react';
import { toast } from 'react-toastify';
import { updateBankAccountLog } from '@/app/services/api/bankAccounts';

import { DEFAULT_CURRENCY, LOCALE, LOG_TYPE } from '@/app/finance/constants';

function EditLogModal({ isOpen, onClose, log, onSuccess }) {
  const t = useTranslations('BankAccountLogs');
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    type: '',
    amount: '',
    description: ''
  });
  const [existingAttachments, setExistingAttachments] = useState([]);
  const [newAttachments, setNewAttachments] = useState([]);
  const [attachmentsToDelete, setAttachmentsToDelete] = useState([]);

  useEffect(() => {
    if (log && isOpen) {
      setFormData({
        type: log.type || LOG_TYPE.DEPOSIT,
        amount: log.amount || '',
        description: log.description || ''
      });
      setExistingAttachments(log.attachments || []);
      setNewAttachments([]);
      setAttachmentsToDelete([]);
    }
  }, [log, isOpen]);

  // Early return after all hooks are declared
  if (!isOpen || !log) return null;

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setNewAttachments(prev => [...prev, ...files]);
  };

  const removeNewAttachment = (index) => {
    setNewAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const removeExistingAttachment = (attachmentId) => {
    setAttachmentsToDelete(prev => [...prev, attachmentId]);
    setExistingAttachments(prev => prev.filter(att => att.id !== attachmentId));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      toast.error(t('invalidAmount'));
      return;
    }

    try {
      setSubmitting(true);
      
      const formDataToSend = new FormData();
      formDataToSend.append('type', formData.type);
      formDataToSend.append('amount', formData.amount);
      formDataToSend.append('description', formData.description);
      
      // Add IDs of attachments to delete
      if (attachmentsToDelete.length > 0) {
        formDataToSend.append('delete_attachments', JSON.stringify(attachmentsToDelete));
      }
      
      // Add new attachments
      newAttachments.forEach((file) => {
        formDataToSend.append('attachments', file);
      });

      const response = await updateBankAccountLog(log.id, formDataToSend);
      
      if (response.success) {
        toast.success(t('logUpdatedSuccess'));
        onSuccess();
        onClose();
      } else {
        toast.error(response.error || t('errorUpdatingLog'));
      }
    } catch {
      toast.error(t('errorUpdatingLog'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50" onClick={onClose}>
      <div 
        className="bg-white dark:bg-gray-800 rounded-sg shadow-xl w-[90vw] max-w-5xl max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold">{t('editLog')}</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
          <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Type */}
            <div className="space-y-2">
              <Label htmlFor="type">{t('operationType')} *</Label>
              <Select
                value={formData.type}
                onValueChange={(value) => setFormData({ ...formData, type: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={LOG_TYPE.DEPOSIT}>{t('deposit')}</SelectItem>
                  <SelectItem value={LOG_TYPE.WITHDRAWAL}>{t('withdrawal')}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Amount */}
            <div className="space-y-2">
              <Label htmlFor="amount">{t('amount')} *</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="0"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                placeholder={t('enterAmount')}
                required
              />
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">{t('description')}</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder={t('enterDescription')}
              rows={3}
            />
          </div>

          {/* Existing Attachments */}
          {existingAttachments.length > 0 && (
            <div className="space-y-2">
              <Label>{t('currentAttachments')}</Label>
              <div className="space-y-2">
                {existingAttachments.map((attachment) => (
                  <div
                    key={attachment.id}
                    className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded border"
                  >
                    <a
                      href={attachment.document_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-blue-600 hover:text-blue-800"
                    >
                      <Download className="h-4 w-4" />
                      <span className="text-sm truncate">{attachment.document_name}</span>
                    </a>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeExistingAttachment(attachment.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* New Attachments */}
          <div className="space-y-2">
            <Label>{t('addNewAttachments')}</Label>
            <div className="border-2 border-dashed rounded-sg p-4">
              <Input
                type="file"
                multiple
                onChange={handleFileChange}
                className="hidden"
                id="file-upload-edit"
                accept="image/*,.pdf,.doc,.docx"
              />
              <label
                htmlFor="file-upload-edit"
                className="flex flex-col items-center justify-center cursor-pointer"
              >
                <Upload className="h-8 w-8 text-gray-400 mb-2" />
                <span className="text-sm text-gray-500">
                  {t('uploadFilesHint')}
                </span>
              </label>

              {newAttachments.length > 0 && (
                <div className="mt-4 space-y-2">
                  {newAttachments.map((file, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-2 bg-white dark:bg-gray-800 rounded border"
                    >
                      <span className="text-sm truncate">{file.name}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeNewAttachment(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={submitting}
            >
              {t('cancel')}
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? t('saving') : t('saveChanges')}
            </Button>
          </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default EditLogModal;

