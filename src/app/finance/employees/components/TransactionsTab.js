'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import useSWR from 'swr';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Edit, Trash2, Plus, Download, Eye, Printer, ChevronLeft, ChevronRight, FileText } from 'lucide-react';
import { getAllEmployeeCashTransactions, deleteEmployeeCashTransaction } from '@/app/services/api/employeeCashTransactions';
import TransactionModal from './TransactionModal';
import ViewTransactionModal from './ViewTransactionModal';
import PrintTransactionModal from './PrintTransactionModal';
import EmployeeStatementModal from './EmployeeStatementModal';
import { toast } from 'react-toastify';
import * as XLSX from 'xlsx';
import { useTranslations } from '@/hooks/useTranslations';
import { DEFAULT_CURRENCY, LOCALE, STATUS, TRANSACTION_TYPE } from '@/app/finance/constants';

function TransactionRowComponent({ transaction, index, currentPage, itemsPerPage, deleteLoading, t, tCommon, formatCurrency, formatDateTime, handleStatementClick, handleViewClick, handlePrintClick, handleEditClick, handleDeleteClick }) { return (
  <TableRow key={transaction.id}>
    <TableCell className="text-center font-medium">
      {((currentPage - 1) * itemsPerPage) + index + 1}
    </TableCell>
    <TableCell className="font-medium">{transaction.employee_name || '-'}</TableCell>
    <TableCell className="font-mono">{transaction.employee_phone || '-'}</TableCell>
    <TableCell>
      <span className={`font-semibold ${
        transaction.employee_balance > 0 ? 'text-green-600' : transaction.employee_balance < 0 ? 'text-red-600' : 'text-gray-600'
      }`}>
        {formatCurrency(transaction.employee_balance || 0)}
      </span>
    </TableCell>
    <TableCell>
      <span className={`font-semibold ${
        transaction.type === TRANSACTION_TYPE.CREDIT ? 'text-green-600' : 'text-red-600'
      }`}>
        {transaction.type === TRANSACTION_TYPE.CREDIT ? '+' : '-'} {formatCurrency(transaction.amount)}
      </span>
    </TableCell>
    <TableCell className="max-w-xs truncate">{transaction.description || '-'}</TableCell>
    <TableCell>
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
        transaction.status === STATUS.APPROVED ? 'bg-green-100 text-green-800' : transaction.status === STATUS.REJECTED ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
      }`}>
        {transaction.status === STATUS.APPROVED ? t('approved') : transaction.status === STATUS.REJECTED ? t('rejected') : t('pending')}
      </span>
    </TableCell>
    <TableCell>{transaction.created_by_name || '-'}</TableCell>
    <TableCell className="text-sm">{formatDateTime(transaction.created_at)}</TableCell>
    <TableCell>
      <div className="flex justify-center gap-2">
        <Button variant="ghost" size="sm" onClick={handleStatementClick} data-employee-id={transaction.employee_id} data-employee-name={transaction.employee_name} className="hover:bg-indigo-50" title={t('statementTitle')}>
          <FileText className="h-4 w-4 text-indigo-600" />
        </Button>
        <Button variant="ghost" size="sm" onClick={handleViewClick} data-transaction-id={transaction.id} className="hover:bg-green-50" title={t('viewDetails')}>
          <Eye className="h-4 w-4 text-green-600" />
        </Button>
        <Button variant="ghost" size="sm" onClick={handlePrintClick} data-transaction-id={transaction.id} className="hover:bg-purple-50" title={t('printVoucher')}>
          <Printer className="h-4 w-4 text-purple-600" />
        </Button>
        <Button variant="ghost" size="sm" onClick={handleEditClick} data-transaction-index={index} className="hover:bg-blue-50" title={t('editRecord')}>
          <Edit className="h-4 w-4 text-blue-600" />
        </Button>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="ghost" size="sm" className="hover:bg-red-50">
              <Trash2 className="h-4 w-4 text-red-600" />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{t('deleteConfirm')}</AlertDialogTitle>
              <AlertDialogDescription>{t('deleteMessage')}</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>{tCommon('cancel')}</AlertDialogCancel>
              <AlertDialogAction onClick={handleDeleteClick} data-transaction-id={transaction.id} className="bg-red-600 hover:bg-red-700" disabled={deleteLoading}>
                {deleteLoading ? tCommon('deleting') : tCommon('delete')}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </TableCell>
  </TableRow>
); }
const TransactionRow = React.memo(TransactionRowComponent);
TransactionRow.displayName = 'TransactionRow';

function PageButtonComponent({ page, isActive, onClick }) {
  return (
    <Button
      variant={isActive ? 'default' : 'outline'}
      size="sm"
      onClick={onClick}
      data-page={page}
      className="min-w-[2rem]"
    >
      {page}
    </Button>
  );
}
const PageButton = React.memo(PageButtonComponent);
PageButton.displayName = 'PageButton';

const TransactionsTab = () => {
  const t = useTranslations('employeeFinance.transactions');
  const tCommon = useTranslations('common');
  const [showModal, setShowModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [showStatementModal, setShowStatementModal] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [viewTransactionId, setViewTransactionId] = useState(null);
  const [printTransactionId, setPrintTransactionId] = useState(null);
  const [statementEmployee, setStatementEmployee] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  
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
      ? `/api/employee-cash-transactions?page=${currentPage}&limit=${itemsPerPage}&search=${searchDebounce}&type=credit`
      : `/api/employee-cash-transactions?page=${currentPage}&limit=${itemsPerPage}&type=credit`,
    [currentPage, itemsPerPage, searchDebounce]
  );

  const fetcher = async (url) => {
    const response = await getAllEmployeeCashTransactions({
      page: currentPage,
      limit: itemsPerPage,
      search: searchDebounce,
      type: 'credit'
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

  const handleAdd = useCallback(() => {
    setSelectedTransaction(null);
    setShowModal(true);
  }, []);

  const handleView = useCallback((transactionId) => {
    setViewTransactionId(transactionId);
    setShowViewModal(true);
  }, []);

  const handlePrint = useCallback((transactionId) => {
    setPrintTransactionId(transactionId);
    setShowPrintModal(true);
  }, []);

  const handleEdit = useCallback((transaction) => {
    setSelectedTransaction(transaction);
    setShowModal(true);
  }, []);

  const handleStatement = useCallback((employeeId, employeeName) => {
    setStatementEmployee({ id: employeeId, name: employeeName });
    setShowStatementModal(true);
  }, []);

  const handleDelete = useCallback(async (transactionId) => {
    try {
      setDeleteLoading(true);
      const response = await deleteEmployeeCashTransaction(transactionId);

      if (response.success) {
        toast.success(t('deleteSuccess'));
        await mutate();
      } else {
        toast.error(t('deleteError'));
      }
    } catch {
      toast.error(t('deleteError'));
    } finally {
      setDeleteLoading(false);
    }
  }, [mutate, t]);

  const handleSuccess = useCallback(() => {
    mutate();
  }, [mutate]);

  const handleSearchChange = useCallback((event) => {
    setSearchQuery(event.target.value);
  }, []);

  const handleRetry = useCallback(() => {
    mutate();
  }, [mutate]);

  const handlePrevPage = useCallback(() => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  }, []);

  const handleNextPage = useCallback(() => {
    setCurrentPage((prev) => Math.min(prev + 1, transactionsPagination.totalPages));
  }, [transactionsPagination.totalPages]);

  const handlePageChange = useCallback((event) => {
    const page = Number(event.currentTarget.dataset.page);
    if (!Number.isNaN(page)) {
      setCurrentPage(page);
    }
  }, []);

  const pageNumbers = useMemo(() => {
    const total = transactionsPagination.totalPages || 0;
    return Array.from({ length: Math.min(total, 10) }, (_, i) => {
      if (total <= 10) return i + 1;
      if (currentPage <= 5) return i + 1;
      if (currentPage >= total - 4) return total - 9 + i;
      return currentPage - 4 + i;
    });
  }, [currentPage, transactionsPagination.totalPages]);

  const handleStatementClick = useCallback((event) => {
    const employeeId = event.currentTarget.dataset.employeeId;
    const employeeName = event.currentTarget.dataset.employeeName || '';
    if (!employeeId) return;
    handleStatement(employeeId, employeeName);
  }, [handleStatement]);

  const handleViewClick = useCallback((event) => {
    const transactionId = event.currentTarget.dataset.transactionId;
    if (!transactionId) return;
    handleView(transactionId);
  }, [handleView]);

  const handlePrintClick = useCallback((event) => {
    const transactionId = event.currentTarget.dataset.transactionId;
    if (!transactionId) return;
    handlePrint(transactionId);
  }, [handlePrint]);

  const handleEditClick = useCallback((event) => {
    const index = Number(event.currentTarget.dataset.transactionIndex);
    if (!Number.isNaN(index)) {
      handleEdit(transactions[index]);
    }
  }, [handleEdit, transactions]);

  const handleDeleteClick = useCallback((event) => {
    const transactionId = event.currentTarget.dataset.transactionId;
    if (!transactionId) return;
    handleDelete(transactionId);
  }, [handleDelete]);

  const closeTransactionModal = useCallback(() => {
    setShowModal(false);
    setSelectedTransaction(null);
  }, []);

  const closeViewModal = useCallback(() => {
    setShowViewModal(false);
    setViewTransactionId(null);
    mutate();
  }, [mutate]);

  const closePrintModal = useCallback(() => {
    setShowPrintModal(false);
    setPrintTransactionId(null);
  }, []);

  const closeStatementModal = useCallback(() => {
    setShowStatementModal(false);
    setStatementEmployee(null);
  }, []);

  const formatCurrency = useCallback((amount) => {
    return new Intl.NumberFormat(LOCALE.ar, {
      style: 'currency',
      currency: DEFAULT_CURRENCY
    }).format(amount);
  }, []);

  const formatDate = useCallback((dateString) => {
    return new Date(dateString).toLocaleDateString(LOCALE.ar);
  }, []);

  const formatDateTime = useCallback((dateString) => {
    return new Date(dateString).toLocaleString(LOCALE.ar);
  }, []);

  const handleExportToExcel = useCallback(() => {
    try {
      const exportData = transactions.map((transaction, index) => ({
        '#': index + 1,
        [t('colEmployeeName')]: transaction.employee_name || '-',
        [t('colPhone')]: transaction.employee_phone || '-',
        [t('colAmount')]: transaction.amount,
        [t('colDescription')]: transaction.description || '-',
        [t('colAddedBy')]: transaction.created_by_name || '-',
        [t('colDate')]: formatDate(transaction.created_at)
      }));

      const worksheet = XLSX.utils.json_to_sheet(exportData);
      worksheet['!cols'] = [
        { wch: 5 }, { wch: 20 }, { wch: 15 },
        { wch: 12 }, { wch: 30 }, { wch: 20 }, { wch: 15 }
      ];

      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, t('sheetName'));

      const filename = `${t('fileName')}_${new Date().toLocaleDateString().replace(/\//g, '-')}.xlsx`;
      XLSX.writeFile(workbook, filename);
      toast.success(t('exportSuccess'));
    } catch {
      toast.error(t('exportError'));
    }
  }, [transactions, t, formatDate]);

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center mb-4">
            <CardTitle>{t('title')}</CardTitle>
            <div className="flex gap-2">
              <Button 
                onClick={handleExportToExcel}
                variant="outline"
                className="flex items-center gap-2"
                disabled={transactions.length === 0}
              >
                <Download className="h-4 w-4" />
                {t('exportExcel')}
              </Button>
              <Button 
                onClick={handleAdd}
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                {t('addNew')}
              </Button>
            </div>
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
              <span className="mr-3">{t('loading')}</span>
            </div>
          ) : error ? (
            <div className="text-center p-8">
              <p className="text-red-500 mb-4">{t('loadError')}</p>
              <Button onClick={handleRetry}>{tCommon('retry')}</Button>
            </div>
          ) : transactions.length === 0 ? (
            <div className="text-center p-8">
              <p className=" mb-4">
                {searchQuery ? t('noResults') : t('noData')}
              </p>
              {!searchQuery && (
                <Button onClick={handleAdd}>
                  {t('addNew')}
                </Button>
              )}
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
                      <TableHead>{t('amount')}</TableHead>
                      <TableHead>{t('description')}</TableHead>
                      <TableHead>{t('status')}</TableHead>
                      <TableHead>{t('addedBy')}</TableHead>
                      <TableHead>{t('addedAt')}</TableHead>
                      <TableHead className="text-center">{t('actions')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {transactions.map((transaction, index) => (
                      <TransactionRow
                        key={transaction.id}
                        transaction={transaction}
                        index={index}
                        currentPage={currentPage}
                        itemsPerPage={itemsPerPage}
                        deleteLoading={deleteLoading}
                        t={t}
                        tCommon={tCommon}
                        formatCurrency={formatCurrency}
                        formatDateTime={formatDateTime}
                        handleStatementClick={handleStatementClick}
                        handleViewClick={handleViewClick}
                        handlePrintClick={handlePrintClick}
                        handleEditClick={handleEditClick}
                        handleDeleteClick={handleDeleteClick}
                      />
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              {transactionsPagination.totalPages > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <div className="text-sm ">
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
                      {pageNumbers.map(page => (
                        <PageButton
                          key={page}
                          page={page}
                          isActive={currentPage === page}
                          onClick={handlePageChange}
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

      {/* Transaction Modal */}
      <TransactionModal
        isOpen={showModal}
        onClose={closeTransactionModal}
        onSuccess={handleSuccess}
        transactionId={selectedTransaction?.id}
        transactionData={selectedTransaction}
      />

      {/* View Transaction Modal */}
      <ViewTransactionModal
        isOpen={showViewModal}
        onClose={closeViewModal}
        transactionId={viewTransactionId}
      />

      {/* Print Transaction Modal */}
      <PrintTransactionModal
        isOpen={showPrintModal}
        onClose={closePrintModal}
        transactionId={printTransactionId}
      />

      {/* Employee Statement Modal */}
      <EmployeeStatementModal
        isOpen={showStatementModal}
        onClose={closeStatementModal}
        employeeId={statementEmployee?.id}
        employeeName={statementEmployee?.name}
        onViewTransaction={handleView}
        onViewExpense={handleView}
        onEditTransaction={handleEdit}
        onEditExpense={handleEdit}
        onPrintTransaction={handlePrint}
      />
    </>
  );
};

export default TransactionsTab;
