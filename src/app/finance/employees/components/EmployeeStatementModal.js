'use client';

import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTranslations } from '@/hooks/useTranslations';
import { Edit, Trash2, Printer, Calendar, Eye, Download, ChevronDown, X } from 'lucide-react';
import { getAllEmployeeCashTransactions, deleteEmployeeCashTransaction } from '@/app/services/api/employeeCashTransactions';
import { toast } from 'react-toastify';
import * as XLSX from 'xlsx';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

const EmployeeStatementModal = ({ 
  isOpen, 
  onClose, 
  employeeId, 
  employeeName,
  onEditTransaction,
  onEditExpense,
  onPrintTransaction,
  onViewTransaction,
  onViewExpense
}) => {
  const { isRTL } = useLanguage();
  const t = useTranslations('employeeFinance.statementModal');
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Set default dates (current month)
  useEffect(() => {
    if (isOpen) {
      const today = new Date();
      const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
      const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);
      
      setDateFrom(firstDay.toISOString().split('T')[0]);
      setDateTo(lastDay.toISOString().split('T')[0]);
    }
  }, [isOpen]);

  const fetchTransactions = async () => {
    if (!employeeId || !dateFrom || !dateTo) {
      toast.error(t('dateRequired') || 'يرجى تحديد التواريخ');
      return;
    }

    setLoading(true);
    try {
      const response = await getAllEmployeeCashTransactions({
        employee_id: employeeId,
        date_from: dateFrom,
        date_to: dateTo,
        limit: 1000 // Get all transactions in date range
      });

      if (response.success) {
        setTransactions(response.data || []);
      } else {
        toast.error(t('loadError') || 'حدث خطأ في تحميل المعاملات');
      }
    } catch (error) {
      console.error('Error fetching transactions:', error);
      toast.error(t('loadError') || 'حدث خطأ في تحميل المعاملات');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (transaction) => {
    try {
      setDeleteLoading(true);
      
      const response = await deleteEmployeeCashTransaction(transaction.id);
      
      if (response.success) {
        toast.success(t('deleteSuccess'));
        // Refresh transactions
        fetchTransactions();
      } else {
        toast.error(t('deleteError'));
      }
    } catch (error) {
      console.error('Error deleting transaction:', error);
      toast.error(t('deleteError'));
    } finally {
      setDeleteLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('ar-AE', {
      style: 'currency',
      currency: 'AED'
    }).format(amount || 0);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('ar-AE', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleDateString('ar-AE', {
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTransactionTypeLabel = (type) => {
    return type === 'credit' ? t('credit') : t('debit');
  };

  const getTransactionTypeColor = (type) => {
    return type === 'credit' ? 'text-green-600' : 'text-red-600';
  };

  // Calculate totals
  const totalCredit = transactions
    .filter(t => t.type === 'credit')
    .reduce((sum, t) => sum + parseFloat(t.amount), 0);
  
  const totalDebit = transactions
    .filter(t => t.type === 'debit')
    .reduce((sum, t) => sum + parseFloat(t.amount), 0);
  
  const balance = totalCredit - totalDebit;

  const handlePrintStatement = () => {
    if (transactions.length === 0) {
      toast.error(t('noDataToExport'));
      return;
    }

    const printWindow = window.open('', '', 'width=800,height=600');
    const printContent = `
      <!DOCTYPE html>
      <html dir="rtl">
      <head>
        <meta charset="UTF-8">
        <title>كشف حساب ${employeeName}</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            padding: 20px;
            direction: rtl;
            text-align: right;
          }
          .header {
            text-align: center;
            margin-bottom: 30px;
            border-bottom: 2px solid #333;
            padding-bottom: 15px;
          }
          .header h1 {
            margin: 0;
            color: #333;
            font-size: 24px;
          }
          .header .subtitle {
            margin-top: 10px;
            color: #666;
            font-size: 14px;
          }
          .summary {
            display: flex;
            justify-content: space-around;
            margin: 20px 0;
            padding: 15px;
            background-color: #f5f5f5;
            border-eadius: 8px;
          }
          .summary-item {
            text-align: center;
          }
          .summary-label {
            font-size: 12px;
            color: #666;
            margin-bottom: 5px;
          }
          .summary-value {
            font-size: 18px;
            font-weight: bold;
          }
          .summary-value.credit {
            color: #16a34a;
          }
          .summary-value.debit {
            color: #dc2626;
          }
          .summary-value.balance {
            color: #2563eb;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
          }
          th, td {
            border: 1px solid #ddd;
            padding: 10px;
            text-align: right;
          }
          th {
            background-color: #f8f9fa;
            font-weight: bold;
            font-size: 14px;
          }
          td {
            font-size: 13px;
          }
          .amount-credit {
            color: #16a34a;
            font-weight: bold;
          }
          .amount-debit {
            color: #dc2626;
            font-weight: bold;
          }
          .footer {
            margin-top: 30px;
            text-align: center;
            color: #666;
            font-size: 12px;
            padding-top: 20px;
            border-top: 1px solid #ddd;
          }
          @media print {
            body {
              padding: 10px;
            }
            .no-print {
              display: none;
            }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>كشف حساب الموظف</h1>
          <div class="subtitle">
            <strong>الموظف:</strong> ${employeeName}<br>
            <strong>من:</strong> ${formatDate(dateFrom)} <strong>إلى:</strong> ${formatDate(dateTo)}
          </div>
        </div>

        <div class="summary">
          <div class="summary-item">
            <div class="summary-label">إجمالي العهد</div>
            <div class="summary-value credit">${formatCurrency(totalCredit)}</div>
          </div>
          <div class="summary-item">
            <div class="summary-label">إجمالي المصروفات</div>
            <div class="summary-value debit">${formatCurrency(totalDebit)}</div>
          </div>
          <div class="summary-item">
            <div class="summary-label">الرصيد</div>
            <div class="summary-value balance">${formatCurrency(balance)}</div>
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>التاريخ</th>
              <th>النوع</th>
              <th>المبلغ</th>
              <th>الوصف</th>
              <th>أضيف بواسطة</th>
            </tr>
          </thead>
          <tbody>
            ${transactions.map((transaction, index) => `
              <tr>
                <td>${index + 1}</td>
                <td>${formatDateTime(transaction.created_at)}</td>
                <td>${getTransactionTypeLabel(transaction.type)}</td>
                <td class="${transaction.type === 'credit' ? 'amount-credit' : 'amount-debit'}">
                  ${transaction.type === 'credit' ? '+ ' : '- '}${formatCurrency(transaction.amount)}
                </td>
                <td>${transaction.description || '-'}</td>
                <td>${transaction.created_by_name || '-'}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <div class="footer">
          تم الطباعة في: ${new Date().toLocaleDateString('ar-AE', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })}
        </div>

        <script>
          window.onload = function() {
            window.print();
            window.onafterprint = function() {
              window.close();
            };
          };
        </script>
      </body>
      </html>
    `;

    printWindow.document.write(printContent);
    printWindow.document.close();
  };

  const handleExportToExcel = () => {
    if (transactions.length === 0) {
      toast.error(t('noDataToExport'));
      return;
    }

    try {
      // Prepare data for export
      const exportData = transactions.map((transaction, index) => ({
        '#': index + 1,
        'التاريخ': formatDateTime(transaction.created_at),
        'النوع': getTransactionTypeLabel(transaction.type),
        'المبلغ': transaction.amount,
        'الوصف': transaction.description || '-',
        'أضيف بواسطة': transaction.created_by_name || '-'
      }));

      // Add summary rows
      exportData.push({});
      exportData.push({
        '#': '',
        'التاريخ': '',
        'النوع': 'إجمالي العهد',
        'المبلغ': totalCredit,
        'الوصف': '',
        'أضيف بواسطة': ''
      });
      exportData.push({
        '#': '',
        'التاريخ': '',
        'النوع': 'إجمالي المصروفات',
        'المبلغ': totalDebit,
        'الوصف': '',
        'أضيف بواسطة': ''
      });
      exportData.push({
        '#': '',
        'التاريخ': '',
        'النوع': 'الرصيد',
        'المبلغ': balance,
        'الوصف': '',
        'أضيف بواسطة': ''
      });

      // Create worksheet
      const worksheet = XLSX.utils.json_to_sheet(exportData);
      
      // Set column widths
      worksheet['!cols'] = [
        { wch: 5 },   // #
        { wch: 20 },  // التاريخ
        { wch: 12 },  // النوع
        { wch: 12 },  // المبلغ
        { wch: 30 },  // الوصف
        { wch: 20 }   // أضيف بواسطة
      ];

      // Create workbook
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'كشف حساب الموظف');

      // Generate filename with employee name and date
      const filename = `كشف_حساب_${employeeName}_${dateFrom}_${dateTo}.xlsx`;
      
      // Save file
      XLSX.writeFile(workbook, filename);
      
      toast.success(t('exportSuccess'));
    } catch (error) {
      console.error('Error exporting to Excel:', error);
      toast.error(t('exportError'));
    }
  };

  const handleClose = () => {
    setTransactions([]);
    setDateFrom('');
    setDateTo('');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-[95vw] w-full h-[95vh] p-0 gap-0">
        <DialogHeader className="px-6 py-4 border-b shrink-0">
          <DialogTitle className="text-xl font-semibold">
            {t('title')} - {employeeName}
          </DialogTitle>
        </DialogHeader>
        
        <div className="flex-1 overflow-y-auto px-6 py-4">
          <div className={`space-y-4 ${isRTL ? 'rtl' : 'ltr'}`}>
          {/* Date Range Filter */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4  rounded-sg">
            <div className="space-y-2">
              <Label htmlFor="dateFrom" className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                {t('dateFrom')}
              </Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-start font-normal",
                      !dateFrom && "text-muted-foreground"
                    )}
                  >
                    {dateFrom ? format(new Date(dateFrom), "PPP") : t('dateFrom')}
                    <ChevronDown className="ms-auto h-4 w-4 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <CalendarComponent
                    mode="single"
                    selected={dateFrom ? new Date(dateFrom) : undefined}
                    onSelect={(date) => setDateFrom(date ? format(date, 'yyyy-MM-dd') : '')}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div className="space-y-2">
              <Label htmlFor="dateTo" className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                {t('dateTo')}
              </Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-start font-normal",
                      !dateTo && "text-muted-foreground"
                    )}
                  >
                    {dateTo ? format(new Date(dateTo), "PPP") : t('dateTo')}
                    <ChevronDown className="ms-auto h-4 w-4 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <CalendarComponent
                    mode="single"
                    selected={dateTo ? new Date(dateTo) : undefined}
                    onSelect={(date) => setDateTo(date ? format(date, 'yyyy-MM-dd') : '')}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div className="flex items-end">
              <Button 
                onClick={fetchTransactions} 
                disabled={loading || !dateFrom || !dateTo}
                className="w-full"
              >
                {loading ? t('loading') : t('show')}
              </Button>
            </div>
          </div>

          {/* Export and Print Buttons */}
          {transactions.length > 0 && (
            <div className="flex justify-end gap-2">
              <Button 
                onClick={handlePrintStatement}
                variant="outline"
                className="flex items-center gap-2"
              >
                <Printer className="h-4 w-4" />
                {t('print')}
              </Button>
              <Button 
                onClick={handleExportToExcel}
                variant="outline"
                className="flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                {t('export')}
              </Button>
            </div>
          )}

          {/* Summary Cards */}
          {transactions.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-green-50 rounded-sg border border-green-200">
                <div className="text-sm text-green-700 mb-1">{t('totalCredit')}</div>
                <div className="text-2xl font-bold text-green-600">{formatCurrency(totalCredit)}</div>
              </div>
              <div className="p-4 bg-red-50 rounded-sg border border-eed-200">
                <div className="text-sm text-red-700 mb-1">{t('totalDebit')}</div>
                <div className="text-2xl font-bold text-red-600">{formatCurrency(totalDebit)}</div>
              </div>
              <div className={`p-4 rounded-sg border ${balance >= 0 ? 'bg-blue-50 border-blue-200' : 'bg-orange-50 border-orange-200'}`}>
                <div className={`text-sm mb-1 ${balance >= 0 ? 'text-blue-700' : 'text-orange-700'}`}>{t('balance')}</div>
                <div className={`text-2xl font-bold ${balance >= 0 ? 'text-blue-600' : 'text-orange-700'}`}>
                  {formatCurrency(balance)}
                </div>
              </div>
            </div>
          )}

          {/* Transactions Table */}
          {loading ? (
            <div className="text-center p-8">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-e-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
              <p className="mt-2 ">{t('loading')}</p>
            </div>
          ) : transactions.length === 0 ? (
            <div className="text-center p-8">
              <p className="">{t('noTransactions')}</p>
            </div>
          ) : (
            <div className="border rounded-sg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-center">#</TableHead>
                    <TableHead>{t('date')}</TableHead>
                    <TableHead>{t('type')}</TableHead>
                    <TableHead>{t('amount')}</TableHead>
                    <TableHead>{t('description')}</TableHead>
                    <TableHead>{t('addedBy')}</TableHead>
                    <TableHead className="text-center">{t('actions')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.map((transaction, index) => (
                    <TableRow key={transaction.id}>
                      <TableCell className="text-center font-medium">
                        {index + 1}
                      </TableCell>
                      <TableCell className="text-sm">
                        {formatDateTime(transaction.created_at)}
                      </TableCell>
                      <TableCell>
                        <span className={`font-semibold ${getTransactionTypeColor(transaction.type)}`}>
                          {getTransactionTypeLabel(transaction.type)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className={`font-semibold ${getTransactionTypeColor(transaction.type)}`}>
                          {transaction.type === 'credit' ? '+ ' : '- '}
                          {formatCurrency(transaction.amount)}
                        </span>
                      </TableCell>
                      <TableCell className="max-w-xs truncate">
                        {transaction.description || '-'}
                      </TableCell>
                      <TableCell>
                        {transaction.created_by_name || '-'}
                      </TableCell>
                      <TableCell>
                        <div className="flex justify-center gap-2">
                          {/* View Details */}
                          {transaction.type === 'credit' ? (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                onViewTransaction(transaction.id);
                                setTimeout(() => handleClose(), 100);
                              }}
                              className="hover:bg-green-50"
                              title={t('view')}
                            >
                              <Eye className="h-4 w-4 text-green-600" />
                            </Button>
                          ) : (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                onViewExpense(transaction.id);
                                setTimeout(() => handleClose(), 100);
                              }}
                              className="hover:bg-green-50"
                              title={t('view')}
                            >
                              <Eye className="h-4 w-4 text-green-600" />
                            </Button>
                          )}

                          {/* Edit - Only for credit transactions */}
                          {transaction.type === 'credit' && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                onEditTransaction(transaction);
                                setTimeout(() => handleClose(), 100);
                              }}
                              className="hover:bg-blue-50"
                              title={t('edit')}
                            >
                              <Edit className="h-4 w-4 text-blue-600" />
                            </Button>
                          )}

                          {/* Edit for expenses */}
                          {transaction.type === 'debit' && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                onEditExpense(transaction);
                                setTimeout(() => handleClose(), 100);
                              }}
                              className="hover:bg-blue-50"
                              title={t('edit')}
                            >
                              <Edit className="h-4 w-4 text-blue-600" />
                            </Button>
                          )}

                          {/* Print - Only for credit transactions */}
                          {transaction.type === 'credit' && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                onPrintTransaction(transaction);
                                setTimeout(() => handleClose(), 100);
                              }}
                              className="hover:bg-purple-50"
                              title={t('print')}
                            >
                              <Printer className="h-4 w-4 text-purple-600" />
                            </Button>
                          )}

                          {/* Delete */}
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="hover:bg-red-50"
                                title={t('delete')}
                                disabled={deleteLoading}
                              >
                                <Trash2 className="h-4 w-4 text-red-600" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>{t('deleteConfirm')}</AlertDialogTitle>
                                <AlertDialogDescription>
                                  {t('deleteMessage')}
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>{t('modal.cancel')}</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDelete(transaction)}
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
            </div>
          )}

          {/* Close Button */}
          <div className="flex justify-end pt-4 border-t mt-4">
            <Button variant="outline" onClick={handleClose}>
              {t('close')}
            </Button>
          </div>
        </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EmployeeStatementModal;

