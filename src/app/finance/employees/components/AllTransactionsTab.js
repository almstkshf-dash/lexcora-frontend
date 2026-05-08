'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import useSWR from 'swr';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Download, Eye, Edit, FileText, Printer } from 'lucide-react';
import { getAllEmployeeCashTransactions } from '@/app/services/api/employeeCashTransactions';
import { useTranslations } from '@/hooks/useTranslations';
import { DEFAULT_CURRENCY, LOCALE, STATUS, TRANSACTION_TYPE } from '@/app/finance/constants';
import { toast } from 'react-toastify';
import * as XLSX from 'xlsx';
import ViewTransactionModal from './ViewTransactionModal';
import ExpenseDetailsModal from './ExpenseDetailsModal';
import TransactionModal from './TransactionModal';
import ExpenseModal from './ExpenseModal';
import EmployeeStatementModal from './EmployeeStatementModal';
import PrintTransactionModal from './PrintTransactionModal';

const PageButton = React.memo(({ page, isActive, onClick }) => {
  const handleClick = useCallback(() => onClick(page), [onClick, page]);
  return (
    <Button
      variant={isActive ? 'default' : 'outline'}
      size="sm"
      onClick={handleClick}
      className="min-w-[2rem]"
    >
      {page}
    </Button>
  );
});
PageButton.displayName = 'PageButton';

const TransactionActionButtons = React.memo(({ transaction, onStatement, onView, onPrint, onEdit, statementTitle, viewTitle, printTitle, editTitle }) => {
  const handleStatement = useCallback(() => onStatement(transaction), [onStatement, transaction]);
  const handleView = useCallback(() => onView(transaction), [onView, transaction]);
  const handlePrint = useCallback(() => onPrint(transaction.id), [onPrint, transaction.id]);
  const handleEdit = useCallback(() => onEdit(transaction), [onEdit, transaction]);
  return (
    <>
      <Button variant="ghost" size="sm" onClick={handleStatement} className="hover:bg-indigo-50" title={statementTitle}>
        <FileText className="h-4 w-4 text-indigo-600" />
      </Button>
      <Button variant="ghost" size="sm" onClick={handleView} className="hover:bg-green-50" title={viewTitle}>
        <Eye className="h-4 w-4 text-green-600" />
      </Button>
      {transaction.type === 'credit' && (
        <Button variant="ghost" size="sm" onClick={handlePrint} className="hover:bg-purple-50" title={printTitle}>
          <Printer className="h-4 w-4 text-purple-600" />
        </Button>
      )}
      <Button variant="ghost" size="sm" onClick={handleEdit} className="hover:bg-blue-50" title={editTitle}>
        <Edit className="h-4 w-4 text-blue-600" />
      </Button>
    </>
  );
});
TransactionActionButtons.displayName = 'TransactionActionButtons';

const TransactionRow = React.memo(({ transaction, index, currentPage, itemsPerPage, formatCurrency, formatDateTime, getTransactionTypeLabel, getTransactionTypeColor, t, onStatement, onView, onPrint, onEdit }) => (
  <TableRow key={transaction.id}>
    <TableCell className="text-center font-medium">
      {((currentPage - 1) * itemsPerPage) + index + 1}
    </TableCell>
    <TableCell className="font-medium">{transaction.employee_name || '-'}</TableCell>
    <TableCell className="font-mono">{transaction.employee_phone || '-'}</TableCell>
    <TableCell>
      <span className={`font-semibold ${
        transaction.employee_balance > 0 ? 'text-green-600'
        : transaction.employee_balance < 0 ? 'text-red-600'
        : 'text-gray-600'
      }`}>
        {formatCurrency(transaction.employee_balance || 0)}
      </span>
    </TableCell>
    <TableCell>
      <span className={`font-semibold ${getTransactionTypeColor(transaction.type)}`}>
        {getTransactionTypeLabel(transaction.type)}
      </span>
    </TableCell>
    <TableCell>
      <span className={`font-semibold ${getTransactionTypeColor(transaction.type)}`}>
        {transaction.type === TRANSACTION_TYPE.CREDIT ? '+ ' : '- '}
        {formatCurrency(transaction.amount)}
      </span>
    </TableCell>
    <TableCell className="max-w-xs truncate">{transaction.description || '-'}</TableCell>
    <TableCell>
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
        transaction.status === STATUS.APPROVED ? 'bg-green-100 text-green-800'
        : transaction.status === STATUS.REJECTED ? 'bg-red-100 text-red-800'
        : 'bg-yellow-100 text-yellow-800'
      }`}>
        {transaction.status === STATUS.APPROVED ? t('approved') : transaction.status === STATUS.REJECTED ? t('rejected') : t('pending')}
      </span>
    </TableCell>
    <TableCell>{transaction.created_by_name || '-'}</TableCell>
    <TableCell className="text-sm text-gray-600">{formatDateTime(transaction.created_at)}</TableCell>
    <TableCell>
      <div className="flex justify-center gap-2">
        <TransactionActionButtons
          transaction={transaction}
          onStatement={onStatement}
          onView={onView}
          onPrint={onPrint}
          onEdit={onEdit}
          statementTitle={t('statementTitle')}
          viewTitle={t('viewDetails')}
          printTitle={t('print')}
          editTitle={t('edit')}
        />
      </div>
    </TableCell>
  </TableRow>
));
TransactionRow.displayName = 'TransactionRow';

const AllTransactionsTab = () => {
  const t = useTranslations('employeeFinance.allTransactions');
  
  // Modal states
  const [showViewModal, setShowViewModal] = useState(false);
  const [showExpenseDetailsModal, setShowExpenseDetailsModal] = useState(false);
  const [showEditTransactionModal, setShowEditTransactionModal] = useState(false);
  const [showEditExpenseModal, setShowEditExpenseModal] = useState(false);
  const [showStatementModal, setShowStatementModal] = useState(false);
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [selectedTransactionId, setSelectedTransactionId] = useState(null);
  const [selectedExpenseId, setSelectedExpenseId] = useState(null);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [selectedExpense, setSelectedExpense] = useState(null);
  const [statementEmployee, setStatementEmployee] = useState(null);
  const [printTransactionId, setPrintTransactionId] = useState(null);
  
  // Pagination & Filter states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchDebounce, setSearchDebounce] = useState('');

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchDebounce(searchQuery);
      setCurrentPage(1); // Reset to first page on search
    }, 500);
    
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // SWR key and fetcher with best practices
  const swrKey = useMemo(() => 
    searchDebounce || currentPage !== 1 
      ? `/api/employee-cash-transactions-all?page=${currentPage}&limit=${itemsPerPage}&search=${searchDebounce}`
      : `/api/employee-cash-transactions-all?page=${currentPage}&limit=${itemsPerPage}`,
    [currentPage, itemsPerPage, searchDebounce]
  );

  const fetcher = async (url) => {
    const response = await getAllEmployeeCashTransactions({
      page: currentPage,
      limit: itemsPerPage,
      search: searchDebounce
    });
    
    if (!response.success) {
      throw new Error(t('loadError'));
    }
    
    return {
      data: response.data,
      pagination: response.pagination || {}
    };
  };

  // Use SWR with best practices
  const { data, error, isLoading, mutate } = useSWR(
    swrKey,
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      dedupingInterval: 5000,
      errorRetryCount: 3,
      onError: (err) => {
        toast.error(err.message || t('loadError'));
      }
    }
  );

  const transactions = useMemo(() => data?.data || [], [data?.data]);
  const transactionsPagination = data?.pagination || {};

  const handleViewTransaction = useCallback((transaction) => {
    if (transaction.type === 'credit') {
      setSelectedTransactionId(transaction.id);
      setShowViewModal(true);
    } else {
      setSelectedExpenseId(transaction.id);
      setShowExpenseDetailsModal(true);
    }
  }, []);

  const handleEditTransaction = useCallback((transaction) => {
    if (transaction.type === 'credit') {
      setSelectedTransaction(transaction);
      setShowEditTransactionModal(true);
    } else {
      setSelectedExpense(transaction);
      setShowEditExpenseModal(true);
    }
  }, []);

  const handleStatement = useCallback((transaction) => {
    setStatementEmployee({
      id: transaction.employee_id,
      name: transaction.employee_name
    });
    setShowStatementModal(true);
  }, []);

  const handlePrint = useCallback((transactionId) => {
    setPrintTransactionId(transactionId);
    setShowPrintModal(true);
  }, []);

  const handleSuccess = useCallback(() => {
    mutate();
  }, [mutate]);

  const handleCloseViewModal = useCallback(() => {
    setShowViewModal(false);
    setSelectedTransactionId(null);
    mutate();
  }, [mutate]);

  const handleCloseExpenseDetailsModal = useCallback(() => {
    setShowExpenseDetailsModal(false);
    setSelectedExpenseId(null);
  }, []);

  const handleCloseEditTransactionModal = useCallback(() => {
    setShowEditTransactionModal(false);
    setSelectedTransaction(null);
  }, []);

  const handleCloseEditExpenseModal = useCallback(() => {
    setShowEditExpenseModal(false);
    setSelectedExpense(null);
  }, []);

  const handleCloseStatementModal = useCallback(() => {
    setShowStatementModal(false);
    setStatementEmployee(null);
  }, []);

  const handleClosePrintModal = useCallback(() => {
    setShowPrintModal(false);
    setPrintTransactionId(null);
  }, []);

  const handleStatementViewTransaction = useCallback((transactionId) => {
    setSelectedTransactionId(transactionId);
    setShowViewModal(true);
  }, []);

  const handleStatementViewExpense = useCallback((expenseId) => {
    setSelectedExpenseId(expenseId);
    setShowExpenseDetailsModal(true);
  }, []);

  const handleStatementEditTransaction = useCallback((transaction) => {
    setSelectedTransaction(transaction);
    setShowEditTransactionModal(true);
  }, []);

  const handleStatementEditExpense = useCallback((expense) => {
    setSelectedExpense(expense);
    setShowEditExpenseModal(true);
  }, []);

  const handleStatementPrintTransaction = useCallback((transaction) => {
    setPrintTransactionId(transaction.id);
    setShowPrintModal(true);
  }, []);

  const handleSearchChange = useCallback((e) => setSearchQuery(e.target.value), []);

  const handleRetry = useCallback(() => mutate(), [mutate]);

  const handlePrevPage = useCallback(() => setCurrentPage(prev => Math.max(prev - 1, 1)), []);

  const handleNextPage = useCallback(
    () => setCurrentPage(prev => Math.min(prev + 1, transactionsPagination.totalPages)),
    [transactionsPagination.totalPages]
  );

  const pageNumbers = useMemo(() => {
    const total = transactionsPagination.totalPages;
    if (!total) return [];
    return Array.from({ length: Math.min(total, 10) }, (_, i) => {
      if (total <= 10) return i + 1;
      if (currentPage <= 5) return i + 1;
      if (currentPage >= total - 4) return total - 9 + i;
      return currentPage - 4 + i;
    });
  }, [transactionsPagination.totalPages, currentPage]);

  const formatCurrency = useCallback((amount) => {
    return new Intl.NumberFormat(LOCALE.ar, {
      style: 'currency',
      currency: DEFAULT_CURRENCY
    }).format(amount);
  }, []);

  const formatDateTime = useCallback((dateString) => {
    return new Date(dateString).toLocaleString(LOCALE.ar);
  }, []);

  const getTransactionTypeColor = useCallback((type) => {
    return type === 'credit' ? 'text-green-600' : 'text-red-600';
  }, []);

  const getTransactionTypeLabel = useCallback((type) => {
    return type === 'credit' ? t('credit') : t('debit');
  }, [t]);

  const handleExportToExcel = useCallback(() => {
    try {
      // Prepare data for export
      const exportData = (Array.isArray(transactions) ? transactions : []).map((transaction, index) => ({
        '#': index + 1,
        [t('colEmployeeName')]: transaction.employee_name || '-',
        [t('colPhone')]: transaction.employee_phone || '-',
        [t('colBalance')]: transaction.employee_balance || 0,
        [t('colType')]: getTransactionTypeLabel(transaction.type),
        [t('colAmount')]: transaction.amount,
        [t('colDescription')]: transaction.description || '-',
        [t('colAddedBy')]: transaction.created_by_name || '-',
        [t('colDate')]: formatDateTime(transaction.created_at)
      }));

      // Create worksheet
      const worksheet = XLSX.utils.json_to_sheet(exportData);
      
      // Set column widths
      worksheet['!cols'] = [
        { wch: 5 },   // #
        { wch: 20 },  // اسم الموظف
        { wch: 15 },  // رقم الهاتف
        { wch: 15 },  // الرصيد الحالي
        { wch: 12 },  // نوع المعاملة
        { wch: 12 },  // المبلغ
        { wch: 30 },  // الوصف
        { wch: 20 },  // أضيف بواسطة
        { wch: 15 }   // تاريخ الإضافة
      ];

      // Create workbook
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, t('sheetName'));

      const filename = `${t('fileName')}_${new Date().toLocaleDateString().replace(/\//g, '-')}.xlsx`;

      // Save file
      XLSX.writeFile(workbook, filename);
      
      toast.success(t('exportSuccess'));
    } catch {
      toast.error(t('exportError'));
    }
  }, [transactions, t, getTransactionTypeLabel, formatDateTime]);


  return (
    <>
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center mb-4">
          <CardTitle>{t('title')}</CardTitle>
          <Button 
            onClick={handleExportToExcel}
            variant="outline"
            className="flex items-center gap-2"
            disabled={transactions.length === 0}
          >
            <Download className="h-4 w-4" />
            تصدير Excel
          </Button>
        </div>
        {/* Search Filter */}
        <div className="mb-4">
          <Input
            type="text"
            placeholder={t('searchPlaceholder')}
            value={searchQuery}
            onChange={handleSearchChange}
            className="max-w-md"
          />
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            <span className="me-3">{t('loading')}</span>
          </div>
        ) : error ? (
          <div className="text-center p-8">
                      <p className="text-red-500 mb-4">{t('loadError')}</p>
            <Button onClick={handleRetry}>{t('retry')}</Button>
          </div>
        ) : transactions.length === 0 ? (
          <div className="text-center p-8">
            <p className="text-gray-500 mb-4">
              {searchQuery ? t('noResults') : t('noData')}
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-center">#</TableHead>
                    <TableHead>{t('employeeName')}</TableHead>
                    <TableHead>{t('phoneNumber')}</TableHead>
                    <TableHead>{t('currentBalance')}</TableHead>
                    <TableHead>{t('type')}</TableHead>
                    <TableHead>{t('amount')}</TableHead>
                    <TableHead>{t('description')}</TableHead>
                    <TableHead>{t('status')}</TableHead>
                    <TableHead>{t('addedBy')}</TableHead>
                    <TableHead>{t('addedAt')}</TableHead>
                    <TableHead className="text-center">{t('actions')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {Array.isArray(transactions) && transactions.map((transaction, index) => (
                    <TransactionRow
                      key={transaction.id}
                      transaction={transaction}
                      index={index}
                      currentPage={currentPage}
                      itemsPerPage={itemsPerPage}
                      formatCurrency={formatCurrency}
                      formatDateTime={formatDateTime}
                      getTransactionTypeLabel={getTransactionTypeLabel}
                      getTransactionTypeColor={getTransactionTypeColor}
                      t={t}
                      onStatement={handleStatement}
                      onView={handleViewTransaction}
                      onPrint={handlePrint}
                      onEdit={handleEditTransaction}
                    />
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Pagination */}
            {transactionsPagination.totalPages > 1 && (
              <div className="flex items-center justify-between mt-4">
                <div className="text-sm text-gray-600">
                  {t('showing')} {((currentPage - 1) * itemsPerPage) + 1} {t('to')} {Math.min(currentPage * itemsPerPage, transactionsPagination.total)} {t('of')} {transactionsPagination.total}
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handlePrevPage}
                    disabled={currentPage === 1}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                  <div className="flex items-center gap-1">
                    {Array.isArray(pageNumbers) && pageNumbers.map(page => (
                      <PageButton
                        key={page}
                        page={page}
                        isActive={currentPage === page}
                        onClick={setCurrentPage}
                      />
                    ))}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleNextPage}
                    disabled={currentPage === transactionsPagination.totalPages}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>

      <ViewTransactionModal
        isOpen={showViewModal}
        onClose={handleCloseViewModal}
        transactionId={selectedTransactionId}
      />

      <ExpenseDetailsModal
        isOpen={showExpenseDetailsModal}
        onClose={handleCloseExpenseDetailsModal}
        expenseId={selectedExpenseId}
      />

      <TransactionModal
        isOpen={showEditTransactionModal}
        onClose={handleCloseEditTransactionModal}
        onSuccess={handleSuccess}
        transactionId={selectedTransaction?.id}
        transactionData={selectedTransaction}
      />

      <ExpenseModal
        isOpen={showEditExpenseModal}
        onClose={handleCloseEditExpenseModal}
        onSuccess={handleSuccess}
        expenseId={selectedExpense?.id}
        expenseData={selectedExpense}
      />

      <EmployeeStatementModal
        isOpen={showStatementModal}
        onClose={handleCloseStatementModal}
        employeeId={statementEmployee?.id}
        employeeName={statementEmployee?.name}
        onViewTransaction={handleStatementViewTransaction}
        onViewExpense={handleStatementViewExpense}
        onEditTransaction={handleStatementEditTransaction}
        onEditExpense={handleStatementEditExpense}
        onPrintTransaction={handleStatementPrintTransaction}
      />

      <PrintTransactionModal
        isOpen={showPrintModal}
        onClose={handleClosePrintModal}
        transactionId={printTransactionId}
      />
    </>
  );
};

export default AllTransactionsTab;

