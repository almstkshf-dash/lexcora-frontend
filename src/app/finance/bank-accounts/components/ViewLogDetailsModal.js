'use client';

import React from 'react';
import { useTranslations } from '@/hooks/useTranslations';
import { Badge } from '@/components/ui/badge';
import { Download, X } from 'lucide-react';

import { DEFAULT_CURRENCY, LOCALE, LOG_TYPE } from '@/app/finance/constants';

function ViewLogDetailsModal({ isOpen, onClose, log }) {
  const t = useTranslations('BankAccountLogs');
  
  // Early return after all hooks are declared
  if (!isOpen || !log) return null;

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat(LOCALE.ar, {
      style: 'currency',
      currency: DEFAULT_CURRENCY
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString(LOCALE.ar, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50" onClick={onClose}>
      <div 
        className="bg-white dark:bg-gray-800 rounded-sg shadow-xl w-[90vw] max-w-4xl max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold">{t('logDetails')}</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
          <div className="space-y-6">
          {/* Log Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Type */}
            <div>
              <label className="text-sm font-medium text-gray-500">{t('operationType')}</label>
              <div className="mt-1">
                <Badge variant={log.type === LOG_TYPE.DEPOSIT ? 'default' : 'destructive'}>
                  {log.type === LOG_TYPE.DEPOSIT ? t('deposit') : t('withdrawal')}
                </Badge>
              </div>
            </div>

            {/* Amount */}
            <div>
              <label className="text-sm font-medium text-gray-500">{t('amount')}</label>
              <div className="mt-1 text-lg font-semibold">
                {formatCurrency(log.amount)}
              </div>
            </div>

            {/* Created By */}
            <div>
              <label className="text-sm font-medium text-gray-500">{t('addedBy')}</label>
              <div className="mt-1">
                {log.employee_name || t('unknown')}
              </div>
            </div>

            {/* Created At */}
            <div>
              <label className="text-sm font-medium text-gray-500">{t('addedDate')}</label>
              <div className="mt-1">
                {formatDate(log.created_at)}
              </div>
            </div>
          </div>

          {/* Description */}
          {log.description && (
            <div>
              <label className="text-sm font-medium text-gray-500">{t('description')}</label>
              <div className="mt-1 p-3 bg-gray-50 dark:bg-gray-900 rounded-sg">
                {log.description}
              </div>
            </div>
          )}

          {/* Attachments */}
          {log.attachments && log.attachments.length > 0 && (
            <div>
              <label className="text-sm font-medium text-gray-500 mb-2 block">
                {t('attachments')} ({log.attachments.length})
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {log.attachments.map((attachment, index) => (
                  <a
                    key={attachment.id}
                    href={attachment.document_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-3 border rounded-sg hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors"
                  >
                    <Download className="h-5 w-5 text-blue-600" />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">
                        {attachment.document_name || `${t('attachment')} ${index + 1}`}
                      </div>
                      <div className="text-xs text-gray-500">
                        {new Date(attachment.uploaded_at).toLocaleDateString('ar-AE')}
                      </div>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* No Attachments Message */}
          {(!log.attachments || log.attachments.length === 0) && (
            <div>
              <label className="text-sm font-medium text-gray-500">{t('attachments')}</label>
              <div className="mt-1 text-gray-400">
                {t('noAttachments')}
              </div>
            </div>
          )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ViewLogDetailsModal;

