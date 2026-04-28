'use client';

import React, { useState, useEffect } from 'react';
import { useTranslations } from '@/hooks/useTranslations';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Plus, Upload, X, Download, Eye, Edit, Trash2, FileSpreadsheet, Search } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { toast } from 'react-toastify';
import { getBankAccountLogs, createBankAccountLog, deleteBankAccountLog } from '@/app/services/api/bankAccounts';
import ViewLogDetailsModal from './ViewLogDetailsModal';
import EditLogModal from './EditLogModal';
import * as XLSX from 'xlsx';

function BankAccountLogsModal({ isOpen, onClose, accountId, accountName }) {
  const t = useTranslations('BankAccountLogs');
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedLog, setSelectedLog] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  
  // Get current month start and end dates
  const getCurrentMonthDates = () => {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    
    const formatDate = (date) => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };
    
    return {
      start: formatDate(start),
      end: formatDate(end)
    };
  };
  
  const defaultDates = getCurrentMonthDates();
  const [dateRange, setDateRange] = useState({
    from: defaultDates.start,
    to: defaultDates.end
  });
  
  // Form state
  const [formData, setFormData] = useState({
    type: 'deposit',
    amount: '',
    description: ''
  });
  const [attachments, setAttachments] = useState([]);

  const fetchLogs = async (fromDate = null, toDate = null) => {
    try {
      setLoading(true);
      const response = await getBankAccountLogs(accountId);
      if (response.success) {
        let filteredLogs = response.data;
        
        // Filter by date range if provided
        if (fromDate && toDate) {
          filteredLogs = filteredLogs.filter(log => {
            const logDate = new Date(log.created_at).toISOString().split('T')[0];
            return logDate >= fromDate && logDate <= toDate;
          });
        }
        
        setLogs(filteredLogs);
      } else {
        toast.error(t('errorLoadingLogs'));
      }
    } catch (error) {
      console.error('Error fetching logs:', error);
      toast.error(t('errorLoadingLogs'));
    } finally {
      setLoading(false);
    }
  };

  // Fetch logs when modal opens with default current month dates
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (isOpen && accountId) {
      fetchLogs(dateRange.from, dateRange.to);
    }
  }, [isOpen, accountId]);

  const handleDateFilter = () => {
    if (!dateRange.from || !dateRange.to) {
      toast.error(t('pleaseSelectDateRange'));
      return;
    }
    
    if (dateRange.from > dateRange.to) {
      toast.error(t('startDateAfterEndDate'));
      return;
    }
    
    fetchLogs(dateRange.from, dateRange.to);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('ar-AE', {
      style: 'currency',
      currency: 'AED'
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('ar-AE', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleExportToExcel = () => {
    if (logs.length === 0) {
      toast.error(t('noDataToExport'));
      return;
    }

    const descriptionHeader = t('common.description');
    const exportData = logs.map(log => ({
      [t('common.date')]: formatDate(log.created_at),
      [t('operationType')]: log.type === 'deposit' ? t('deposit') : t('withdrawal'),
      [t('common.amount')]: log.amount,
      [descriptionHeader]: log.description || t('noDescription'),
      [t('addedBy')]: log.employee_name || t('unknown'),
      [t('attachments')]: log.attachments && log.attachments.length > 0 ? log.attachments.length : 0
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, t('exportSheetName'));
    
    // Auto-size columns
    const maxWidth = exportData.reduce((w, r) => Math.max(w, r[descriptionHeader]?.length || 0), 10);
    worksheet['!cols'] = [
      { wch: 20 }, // Date
      { wch: 15 }, // Type
      { wch: 15 }, // Amount
      { wch: Math.min(maxWidth, 50) }, // Description
      { wch: 20 }, // Added By
      { wch: 12 }  // Attachments
    ];

    const fileName = `${accountName}_logs_${dateRange.from}_to_${dateRange.to}.xlsx`;
    XLSX.writeFile(workbook, fileName);
    toast.success(t('exportSuccess'));
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setAttachments(prev => [...prev, ...files]);
  };

  const removeAttachment = (index) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
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
      formDataToSend.append('bank_account_id', accountId);
      formDataToSend.append('type', formData.type);
      formDataToSend.append('amount', formData.amount);
      formDataToSend.append('description', formData.description);
      
      // Add attachments
      attachments.forEach((file) => {
        formDataToSend.append('attachments', file);
      });

      const response = await createBankAccountLog(formDataToSend);
      
      if (response.success) {
        toast.success(t('logAddedSuccess'));
        setFormData({ type: 'deposit', amount: '', description: '' });
        setAttachments([]);
        setShowAddForm(false);
        fetchLogs(dateRange.from, dateRange.to); // Refresh logs with current date range
      } else {
        toast.error(response.error || t('errorAddingLog'));
      }
    } catch (error) {
      console.error('Error creating log:', error);
      toast.error(t('errorAddingLog'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleViewLog = (log) => {
    setSelectedLog(log);
    setShowViewModal(true);
  };

  const handleEditLog = (log) => {
    setSelectedLog(log);
    setShowEditModal(true);
  };

  const handleDeleteLog = async (logId) => {
    try {
      setDeleteLoading(true);
      const response = await deleteBankAccountLog(logId);
      
      if (response.success) {
        toast.success(t('logDeletedSuccess'));
        fetchLogs(); // Refresh logs
      } else {
        toast.error(response.error || t('errorDeletingLog'));
      }
    } catch (error) {
      console.error('Error deleting log:', error);
      toast.error(t('errorDeletingLog'));
    } finally {
      setDeleteLoading(false);
    }
  };

  // Early return after all hooks are declared
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
      <div 
        className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-[95vw] max-w-7xl max-h-[95vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold">
            {t('title')}: {accountName}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(95vh-80px)]">
          <div className="space-y-6">
          {/* Add New Log Button */}
          {!showAddForm && (
            <Button
              onClick={() => setShowAddForm(true)}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              {t('addNewLog')}
            </Button>
          )}

          {/* Add New Log Form */}
          {showAddForm && (
            <div className="border rounded-lg p-4 bg-gray-50 dark:bg-gray-900">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">{t('addNewLog')}</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setShowAddForm(false);
                    setFormData({ type: 'deposit', amount: '', description: '' });
                    setAttachments([]);
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

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
                        <SelectItem value="deposit">{t('deposit')}</SelectItem>
                        <SelectItem value="withdrawal">{t('withdrawal')}</SelectItem>
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

                {/* Attachments */}
                <div className="space-y-2">
                  <Label>{t('attachments')}</Label>
                  <div className="border-2 border-dashed rounded-lg p-4">
                    <Input
                      type="file"
                      multiple
                      onChange={handleFileChange}
                      className="hidden"
                      id="file-upload"
                      accept="image/*,.pdf,.doc,.docx"
                    />
                    <label
                      htmlFor="file-upload"
                      className="flex flex-col items-center justify-center cursor-pointer"
                    >
                      <Upload className="h-8 w-8 text-gray-400 mb-2" />
                      <span className="text-sm text-gray-500">
                        {t('uploadFilesHint')}
                      </span>
                    </label>

                    {attachments.length > 0 && (
                      <div className="mt-4 space-y-2">
                        {attachments.map((file, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between p-2 bg-white dark:bg-gray-800 rounded border"
                          >
                            <span className="text-sm truncate">{file.name}</span>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeAttachment(index)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Submit Button */}
                <div className="flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowAddForm(false);
                      setFormData({ type: 'deposit', amount: '', description: '' });
                      setAttachments([]);
                    }}
                  >
                    {t('cancel')}
                  </Button>
                  <Button type="submit" disabled={submitting}>
                    {submitting ? t('saving') : t('saveLog')}
                  </Button>
                </div>
              </form>
            </div>
          )}

          {/* Logs Table */}
          <div className="border rounded-lg">
            <div className="p-4 border-b bg-gray-50 dark:bg-gray-900">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-4">
                <h3 className="text-lg font-semibold">{t('operationLogs')}</h3>
                
                {/* Export to Excel Button */}
                <Button
                  onClick={handleExportToExcel}
                  variant="outline"
                  className="flex items-center gap-2"
                  disabled={logs.length === 0}
                >
                  <FileSpreadsheet className="h-4 w-4" />
                  {t('exportToExcel')}
                </Button>
              </div>
              
              {/* Date Range Filter */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
                <div className="space-y-2">
                  <Label htmlFor="date-from">{t('fromDate')}</Label>
                  <Input
                    id="date-from"
                    type="date"
                    value={dateRange.from}
                    onChange={(e) => setDateRange({ ...dateRange, from: e.target.value })}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="date-to">{t('toDate')}</Label>
                  <Input
                    id="date-to"
                    type="date"
                    value={dateRange.to}
                    onChange={(e) => setDateRange({ ...dateRange, to: e.target.value })}
                  />
                </div>
                
                <Button
                  onClick={handleDateFilter}
                  className="flex items-center gap-2"
                >
                  <Search className="h-4 w-4" />
                  {t('filterLogs')}
                </Button>
              </div>
            </div>
            <div className="p-4">
              {loading ? (
                <div className="flex items-center justify-center p-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                  <span className="mr-3">{t('loadingLogs')}</span>
                </div>
              ) : logs.length === 0 ? (
                <div className="text-center p-8 text-gray-500">
                  {t('noLogsFound')}
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t('common.date')}</TableHead>
                      <TableHead>{t('operationType')}</TableHead>
                      <TableHead>{t('common.amount')}</TableHead>
                      <TableHead>{t('common.description')}</TableHead>
                      <TableHead>{t('addedBy')}</TableHead>
                      <TableHead>{t('attachments')}</TableHead>
                      <TableHead>{t('actions')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {logs.map((log) => (
                      <TableRow key={log.id}>
                        <TableCell>{formatDate(log.created_at)}</TableCell>
                        <TableCell>
                          <Badge
                            variant={log.type === 'deposit' ? 'default' : 'destructive'}
                          >
                            {log.type === 'deposit' ? t('deposit') : t('withdrawal')}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-semibold">
                          {formatCurrency(log.amount)}
                        </TableCell>
                        <TableCell>{log.description || '-'}</TableCell>
                        <TableCell>{log.employee_name || t('unknown')}</TableCell>
                        <TableCell>
                          {log.attachments && log.attachments.length > 0 ? (
                            <div className="flex flex-wrap gap-1">
                              {log.attachments.map((attachment, index) => (
                                <a
                                  key={index}
                                  href={attachment.document_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-600 hover:text-blue-800 text-sm flex items-center gap-1"
                                >
                                  <Download className="h-3 w-3" />
                                  {t('attachment')} {index + 1}
                                </a>
                              ))}
                            </div>
                          ) : (
                            <span className="text-gray-400">{t('none')}</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleViewLog(log)}
                              title={t('viewDetails')}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEditLog(log)}
                              title={t('edit')}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  disabled={deleteLoading}
                                  title={t('delete')}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>{t('confirmDelete')}</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    {t('deleteConfirmMessage')}
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>{t('cancel')}</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleDeleteLog(log.id)}
                                    className="bg-red-600 hover:bg-red-700"
                                  >
                                    {t('delete')}
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </div>
          </div>
          </div>
        </div>

        {/* View Log Details Modal */}
        <ViewLogDetailsModal
          isOpen={showViewModal}
          onClose={() => {
            setShowViewModal(false);
            setSelectedLog(null);
          }}
          log={selectedLog}
        />

        {/* Edit Log Modal */}
        <EditLogModal
          isOpen={showEditModal}
          onClose={() => {
            setShowEditModal(false);
            setSelectedLog(null);
          }}
          log={selectedLog}
          onSuccess={fetchLogs}
        />
      </div>
    </div>
  );
}

export default BankAccountLogsModal;
