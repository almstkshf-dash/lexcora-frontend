'use client';

import React, { useState, useEffect } from 'react';
import { useTranslations } from '@/hooks/useTranslations';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { X, Upload, Check, AlertCircle, RefreshCw, FileSpreadsheet, Search, CheckCircle2 } from 'lucide-react';
import { toast } from 'react-toastify';
import { 
  importBankStatement, 
  autoMatchTransactions, 
  getUnreconciledLines, 
  reconcileTransaction,
  getBankAccountLogs
} from '@/app/services/api/bankAccounts';

import { DEFAULT_CURRENCY, LOCALE } from '@/app/finance/constants';

function BankReconciliationModal({ isOpen, onClose, accountId, accountName }) {
  const t = useTranslations('BankReconciliation');
  const [loading, setLoading] = useState(false);
  const [statementLines, setStatementLines] = useState([]);
  const [internalLogs, setInternalLogs] = useState([]);
  const [importing, setImporting] = useState(false);
  const [matching, setMatching] = useState(false);
  const [selectedLine, setSelectedLine] = useState(null);
  const [selectedLogId, setSelectedLogId] = useState(null);
  const [reconciling, setReconciling] = useState(false);

  const fetchUnreconciledData = async () => {
    if (!accountId) return;
    try {
      setLoading(true);
      const [linesRes, logsRes] = await Promise.all([
        getUnreconciledLines(accountId),
        getBankAccountLogs(accountId)
      ]);

      if (linesRes.success) {
        setStatementLines(linesRes.data);
      }
      
      if (logsRes.success) {
        // Only show internal logs that aren't reconciled (if we had a flag)
        // For now, let's just show all recent logs as potential candidates
        setInternalLogs(logsRes.data.filter(log => !log.is_reconciled));
      }
    } catch {
      toast.error(t('errorLoadingData'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && accountId) {
      fetchUnreconciledData();
    }
  }, [isOpen, accountId]);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setImporting(true);
      const formData = new FormData();
      formData.append('bank_account_id', accountId);
      formData.append('statement', file);

      const response = await importBankStatement(formData);
      if (response.success) {
        toast.success(t('statementImportedSuccess'));
        fetchUnreconciledData();
      } else {
        toast.error(response.error || t('importFailed'));
      }
    } catch (error) {
      toast.error(t('errorUploadingFile'));
    } finally {
      setImporting(false);
    }
  };

  const handleAutoMatch = async () => {
    try {
      setMatching(true);
      const response = await autoMatchTransactions(accountId);
      if (response.success) {
        toast.success(t('matchedTransactions', { count: response.matched_count }));
        fetchUnreconciledData();
      } else {
        toast.error(response.error || t('autoMatchFailed'));
      }
    } catch (error) {
      toast.error(t('errorAutoMatching'));
    } finally {
      setMatching(false);
    }
  };

  const handleManualReconcile = async () => {
    if (!selectedLine || !selectedLogId) {
      toast.error(t('selectStatementAndInternal'));
      return;
    }

    try {
      setReconciling(true);
      const response = await reconcileTransaction({
        statement_line_id: selectedLine.id,
        bank_account_log_id: selectedLogId,
        reconciliation_type: 'manual'
      });

      if (response.success) {
        toast.success(t('transactionReconciled'));
        setSelectedLine(null);
        setSelectedLogId(null);
        fetchUnreconciledData();
      } else {
        toast.error(response.error || t('reconciliationFailed'));
      }
    } catch (error) {
      toast.error(t('errorReconcilingTransaction'));
    } finally {
      setReconciling(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat(t('common.direction') === 'rtl' ? LOCALE.ar : LOCALE.en, {
      style: 'currency',
      currency: DEFAULT_CURRENCY
    }).format(amount);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
      <div 
        className="bg-white dark:bg-gray-900 rounded-lg shadow-2xl w-[98vw] max-w-7xl h-[90vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
        dir={t('common.direction') === 'rtl' ? 'rtl' : 'ltr'}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b bg-gray-50 dark:bg-gray-800">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <RefreshCw className="h-6 w-6 text-blue-600" />
              {t('title')}: {accountName}
            </h2>
            <p className="text-sm text-gray-500 mt-1">{t('matchSubtitle')}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-colors">
            <X className="h-6 w-6 text-gray-500" />
          </button>
        </div>

        {/* Action Bar */}
        <div className="p-4 border-b bg-white dark:bg-gray-900 flex flex-wrap gap-4 items-center justify-between">
          <div className="flex gap-2">
            <div className="relative">
              <Input
                type="file"
                id="statement-upload"
                className="hidden"
                accept=".xlsx,.csv"
                onChange={handleFileUpload}
                disabled={importing}
              />
              <Button 
                variant="outline" 
                asChild 
                className="cursor-pointer"
                disabled={importing}
              >
                <label htmlFor="statement-upload">
                  <Upload className="h-4 w-4 mr-2" />
                  {importing ? t('importing') : t('importStatement')}
                </label>
              </Button>
            </div>
            <Button 
              onClick={handleAutoMatch} 
              disabled={matching || statementLines.length === 0}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <CheckCircle2 className="h-4 w-4 mr-2" />
              {matching ? t('matching') : t('autoMatch')}
            </Button>
          </div>
          
          <div className="flex items-center gap-4 text-sm font-medium">
            <div className="flex items-center gap-1 text-orange-600">
              <AlertCircle className="h-4 w-4" />
              {statementLines.length} {t('unreconciledLines')}
            </div>
            <div className="flex items-center gap-1 text-blue-600">
              <FileSpreadsheet className="h-4 w-4" />
              {internalLogs.length} {t('internalRecords')}
            </div>
          </div>
        </div>

        {/* Main Content: Split View */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left: Statement Lines */}
          <div className="w-1/2 border-r flex flex-col overflow-hidden">
            <div className="p-4 bg-gray-50 dark:bg-gray-800 border-b font-semibold flex justify-between items-center">
              <span>{t('statementLines')}</span>
              <Badge variant="outline">{statementLines.length}</Badge>
            </div>
            <div className="flex-1 overflow-auto p-2">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('common.date') || 'Date'}</TableHead>
                    <TableHead>{t('common.description') || 'Description'}</TableHead>
                    <TableHead className="text-right">{t('common.amount') || 'Amount'}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {statementLines.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center py-10 text-gray-500">
                        {t('noUnreconciled')}
                      </TableCell>
                    </TableRow>
                  ) : (
                    statementLines.map((line) => (
                      <TableRow 
                        key={line.id} 
                        className={`cursor-pointer transition-colors ${selectedLine?.id === line.id ? 'bg-blue-50 dark:bg-blue-900/30 border-blue-200' : ''}`}
                        onClick={() => setSelectedLine(line)}
                      >
                        <TableCell className="text-xs whitespace-nowrap">
                          {new Date(line.transaction_date).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-sm font-medium max-w-[200px] truncate">
                          {line.description}
                        </TableCell>
                        <TableCell className={`text-right font-bold ${line.amount < 0 ? 'text-red-600' : 'text-green-600'}`}>
                          {formatCurrency(line.amount)}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>

          {/* Right: Internal Logs */}
          <div className="w-1/2 flex flex-col overflow-hidden bg-gray-50/30">
            <div className="p-4 bg-gray-50 dark:bg-gray-800 border-b font-semibold flex justify-between items-center">
              <span>{t('internalLedger')}</span>
              <Badge variant="outline">{internalLogs.length}</Badge>
            </div>
            <div className="flex-1 overflow-auto p-2">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('common.date') || 'Date'}</TableHead>
                    <TableHead>{t('common.type') || 'Type'}</TableHead>
                    <TableHead>{t('common.description') || 'Description'}</TableHead>
                    <TableHead className="text-right">{t('common.amount') || 'Amount'}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {internalLogs.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-10 text-gray-500">
                        {t('noInternalLogs')}
                      </TableCell>
                    </TableRow>
                  ) : (
                    internalLogs.map((log) => (
                      <TableRow 
                        key={log.id} 
                        className={`cursor-pointer transition-colors ${selectedLogId === log.id ? 'bg-green-50 dark:bg-green-900/30 border-green-200' : ''}`}
                        onClick={() => setSelectedLogId(log.id)}
                      >
                        <TableCell className="text-xs">
                          {new Date(log.created_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <Badge variant={log.type === 'deposit' ? 'default' : 'destructive'} className="text-[10px]">
                            {log.type === 'deposit' ? t('deposit') : t('withdrawal')}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm max-w-[150px] truncate">
                          {log.description || t('noDescription')}
                        </TableCell>
                        <TableCell className={`text-right font-bold ${log.type === 'withdrawal' ? 'text-red-600' : 'text-green-600'}`}>
                          {log.type === 'withdrawal' ? '-' : ''}{formatCurrency(log.amount)}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>

        {/* Footer: Matching Logic */}
        <div className="p-6 border-t bg-gray-50 dark:bg-gray-800 flex items-center justify-between">
          <div className="flex gap-10">
            <div className="flex flex-col">
              <span className="text-xs text-gray-500 uppercase tracking-wider">{t('selectedLine')}</span>
              <span className="font-bold text-gray-900 dark:text-white">
                {selectedLine ? `${selectedLine.description} (${formatCurrency(selectedLine.amount)})` : t('notSelected')}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-xs text-gray-500 uppercase tracking-wider">{t('selectedRecord')}</span>
              <span className="font-bold text-gray-900 dark:text-white">
                {selectedLogId ? internalLogs.find(l => l.id === selectedLogId)?.description || t('selected') : t('notSelected')}
              </span>
            </div>
          </div>

          <div className="flex gap-3">
            <Button variant="outline" onClick={() => { setSelectedLine(null); setSelectedLogId(null); }}>
              {t('resetSelection')}
            </Button>
            <Button 
              className="bg-green-600 hover:bg-green-700 text-white min-w-[150px]"
              disabled={!selectedLine || !selectedLogId || reconciling}
              onClick={handleManualReconcile}
            >
              {reconciling ? t('matching') : (
                <>
                  <Check className="h-4 w-4 mr-2" />
                  {t('confirmMatch')}
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>

  );
}

export default BankReconciliationModal;
