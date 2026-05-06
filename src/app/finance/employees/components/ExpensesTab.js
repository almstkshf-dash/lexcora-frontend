'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import useSWR from 'swr';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Edit, Trash2, Plus, Download, Eye, Printer, ChevronLeft, ChevronRight } from 'lucide-react';
import { getAllEmployeeCashTransactions, deleteEmployeeCashTransaction } from '@/app/services/api/employeeCashTransactions';
import { useTranslations } from '@/hooks/useTranslations';
import { DEFAULT_CURRENCY, LOCALE, STATUS } from '@/app/finance/constants';
import ExpenseModal from './ExpenseModal';
import ExpenseDetailsModal from './ExpenseDetailsModal';
import { toast } from 'react-toastify';
import * as XLSX from 'xlsx';

const ExpensePageButton = React.memo(({ page, isActive, onClick }) => (
  <Button
    variant={isActive ? 'default' : 'outline'}
    size="sm"
    data-page={page}
    onClick={onClick}
    className="min-w-[2rem]"
  >
    {page}
  </Button>
));
ExpensePageButton.displayName = 'ExpensePageButton';

const ExpenseRow = React.memo(({ expense, index, currentPage, itemsPerPage, deleteLoading, t, tCommon, formatCurrency, formatDateTime, handleViewExpenseClick, handleEditExpenseClick, handleDeleteExpenseClick }) => (
  <TableRow key={expense.id}>
    <TableCell className="text-center font-medium">
      {((currentPage - 1) * itemsPerPage) + index + 1}
    </TableCell>
    <TableCell className="font-medium">{expense.employee_name || '-'}</TableCell>
    <TableCell className="font-mono">{expense.employee_phone || '-'}</TableCell>
    <TableCell>
      <span className={`font-semibold ${
        expense.employee_balance > 0 ? 'text-green-600' : expense.employee_balance < 0 ? 'text-red-600' : 'text-gray-600'
      }`}>
        {formatCurrency(expense.employee_balance || 0)}
      </span>
    </TableCell>
    <TableCell>
      <span className="text-red-600 font-semibold">- {formatCurrency(expense.amount)}</span>
    </TableCell>
    <TableCell>
      {expense.client_name ? (
        <div className="flex flex-col">
          <span className="font-medium">{expense.client_name}</span>
          {expense.client_phone && <span className="text-xs">{expense.client_phone}</span>}
        </div>
      ) : <span>-</span>}
    </TableCell>
    <TableCell className="max-w-xs truncate">{expense.description || '-'}</TableCell>
    <TableCell>
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
        expense.status === STATUS.APPROVED ? 'bg-green-100 text-green-800' : expense.status === STATUS.REJECTED ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
      }`}>
        {expense.status === STATUS.APPROVED ? t('approved') : expense.status === STATUS.REJECTED ? t('rejected') : t('pending')}
      </span>
    </TableCell>
    <TableCell>{expense.created_by_name || '-'}</TableCell>
    <TableCell className="text-sm">{formatDateTime(expense.created_at)}</TableCell>
    <TableCell>
      <div className="flex justify-center gap-2">
        <Button variant="ghost" size="sm" data-id={expense.id} onClick={handleViewExpenseClick} className="hover:bg-green-50" title={tCommon('view')}>
          <Eye className="h-4 w-4 text-green-600" />
        </Button>
        <Button variant="ghost" size="sm" data-id={expense.id} onClick={handleEditExpenseClick} className="hover:bg-blue-50" title={tCommon('edit')}>
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
              <AlertDialogAction data-id={expense.id} onClick={handleDeleteExpenseClick} className="bg-red-600 hover:bg-red-700" disabled={deleteLoading}>
                {deleteLoading ? tCommon('deleting') : tCommon('delete')}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </TableCell>
  </TableRow>
));
ExpenseRow.displayName = 'ExpenseRow';

const ExpensesTab = () => {
  const t = useTranslations('employeeFinance.expenses');
  const tCommon = useTranslations('common');
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState(null);
  const [selectedExpenseId, setSelectedExpenseId] = useState(null);
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
      ? `/api/employee-cash-transactions?page=${currentPage}&limit=${itemsPerPage}&search=${searchDebounce}&type=debit`
      : `/api/employee-cash-transactions?page=${currentPage}&limit=${itemsPerPage}&type=debit`,
    [currentPage, itemsPerPage, searchDebounce]
  );

  const fetcher = async (url) => {
    const response = await getAllEmployeeCashTransactions({
      page: currentPage,
      limit: itemsPerPage,
      search: searchDebounce,
      type: 'debit'
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

  const expenses = useMemo(() => data?.data || [], [data?.data]);
  const expensesPagination = data?.pagination || {};

  const handleAddExpense = useCallback(() => {
    setSelectedExpense(null);
    setShowExpenseModal(true);
  }, []);

  const handleEditExpense = useCallback((expense) => {
    setSelectedExpense(expense);
    setShowExpenseModal(true);
  }, []);

  const handleViewExpense = useCallback((expenseId) => {
    setSelectedExpenseId(expenseId);
    setShowDetailsModal(true);
  }, []);

  const handleSuccess = useCallback(() => {
    // Revalidate data after successful add/edit
    mutate();
  }, [mutate]);

  const handleDeleteExpense = useCallback(async (expenseId) => {
    try {
      setDeleteLoading(true);
      const response = await deleteEmployeeCashTransaction(expenseId);
      
      if (response.success) {
        toast.success(t('deleteSuccess'));
        // Revalidate data with SWR
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

  const handleSearchChange = useCallback((event) => {
    setSearchQuery(event.target.value);
  }, []);

  const handleRefresh = useCallback(() => {
    mutate();
  }, [mutate]);

  const handleViewExpenseClick = useCallback((event) => {
    const expenseId = Number(event.currentTarget.dataset.id);
    if (!expenseId) return;
    setSelectedExpenseId(expenseId);
    setShowDetailsModal(true);
  }, []);

  const handleEditExpenseClick = useCallback((event) => {
    const expenseId = Number(event.currentTarget.dataset.id);
    const expense = expenses.find((item) => item.id === expenseId);
    if (!expense) return;
    setSelectedExpense(expense);
    setShowExpenseModal(true);
  }, [expenses]);

  const handleDeleteExpenseClick = useCallback((event) => {
    const expenseId = Number(event.currentTarget.dataset.id);
    if (!expenseId) return;
    handleDeleteExpense(expenseId);
  }, [handleDeleteExpense]);

  const handlePreviousPage = useCallback(() => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  }, []);

  const handlePageClick = useCallback((event) => {
    const page = Number(event.currentTarget.dataset.page);
    if (!page) return;
    setCurrentPage(page);
  }, []);

  const pageNumbers = useMemo(() => {
    const total = expensesPagination.totalPages || 0;
    return Array.from({ length: Math.min(total, 10) }, (_, i) => {
      if (total <= 10) return i + 1;
      if (currentPage <= 5) return i + 1;
      if (currentPage >= total - 4) return total - 9 + i;
      return currentPage - 4 + i;
    });
  }, [currentPage, expensesPagination.totalPages]);

  const handleNextPage = useCallback(() => {
    setCurrentPage((prev) => Math.min(prev + 1, expensesPagination.totalPages));
  }, [expensesPagination.totalPages]);

  const handleCloseExpenseModal = useCallback(() => {
    setShowExpenseModal(false);
    setSelectedExpense(null);
  }, []);

  const handleCloseDetailsModal = useCallback(() => {
    setShowDetailsModal(false);
    setSelectedExpenseId(null);
  }, []);

  const formatCurrency = useCallback((amount) => {
    return new Intl.NumberFormat(LOCALE.ar, {
      style: 'currency',
      currency: DEFAULT_CURRENCY
    }).format(amount);
  }, []);

  const formatDateTime = useCallback((dateString) => {
    return new Date(dateString).toLocaleString(LOCALE.ar);
  }, []);

  const handleExportToExcel = useCallback(() => {
    try {
      // Prepare data for export
      const exportData = expenses.map((expense, index) => ({
        '#': index + 1,
        [t('colEmployeeName')]: expense.employee_name || '-',
        [t('colPhone')]: expense.employee_phone || '-',
        [t('colBalance')]: expense.employee_balance || 0,
        [t('colAmount')]: expense.amount,
        [t('colClient')]: expense.client_name || '-',
        [t('colDescription')]: expense.description || '-',
        [t('colAddedBy')]: expense.created_by_name || '-',
        [t('colDate')]: formatDateTime(expense.created_at)
      }));

      // Create worksheet
      const worksheet = XLSX.utils.json_to_sheet(exportData);
      
      // Set column widths
      worksheet['!cols'] = [
        { wch: 5 },   // #
        { wch: 20 },  // اسم الموظف
        { wch: 15 },  // رقم الهاتف
        { wch: 15 },  // الرصيد الحالي
        { wch: 12 },  // المبلغ
        { wch: 20 },  // العميل/الطرف
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
  }, [expenses, t, formatDateTime]);

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
                disabled={expenses.length === 0}
              >
                <Download className="h-4 w-4" />
                {tCommon('exportExcel') || 'Export Excel'}
              </Button>
              <Button 
                onClick={handleAddExpense}
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
              <span className="me-3">{t('loading')}</span>
            </div>
          ) : error ? (
            <div className="text-center p-8">
              <p className="text-red-500 mb-4">{tCommon('errorLoading')}</p>
              <Button onClick={handleRefresh}>{tCommon('refresh')}</Button>
            </div>
          ) : expenses.length === 0 ? (
            <div className="text-center p-8">
              <p className=" mb-4">
                {searchQuery ? t('noResults') : t('noData')}
              </p>
              {!searchQuery && (
                <Button onClick={handleAddExpense}>
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
                    <TableHead>{t('client') || 'Client'}</TableHead>
                    <TableHead>{t('description')}</TableHead>
                    <TableHead>{t('status')}</TableHead>
                    <TableHead>{t('addedBy')}</TableHead>
                    <TableHead>{t('addedAt')}</TableHead>
                    <TableHead className="text-center">{t('actions')}</TableHead>
                  </TableRow>
                </TableHeader>
                  <TableBody>
                    {expenses.map((expense, index) => (
                      <ExpenseRow
                        key={expense.id}
                        expense={expense}
                        index={index}
                        currentPage={currentPage}
                        itemsPerPage={itemsPerPage}
                        deleteLoading={deleteLoading}
                        t={t}
                        tCommon={tCommon}
                        formatCurrency={formatCurrency}
                        formatDateTime={formatDateTime}
                        handleViewExpenseClick={handleViewExpenseClick}
                        handleEditExpenseClick={handleEditExpenseClick}
                        handleDeleteExpenseClick={handleDeleteExpenseClick}
                      />
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              {expensesPagination.totalPages > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <div className="text-sm ">
                    {t('showing', { scope: 'employeeFinance.pagination' })} {((currentPage - 1) * itemsPerPage) + 1} {t('to', { scope: 'employeeFinance.pagination' })} {Math.min(currentPage * itemsPerPage, expensesPagination.total)} {t('of', { scope: 'employeeFinance.pagination' })} {expensesPagination.total}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handlePreviousPage}
                      disabled={currentPage === 1}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                    <div className="flex items-center gap-1">
                      {pageNumbers.map(page => (
                        <ExpensePageButton
                          key={page}
                          page={page}
                          isActive={currentPage === page}
                          onClick={handlePageClick}
                        />
                      ))}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleNextPage}
                      disabled={currentPage === expensesPagination.totalPages}
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

      {/* Expense Modal */}
      <ExpenseModal
        isOpen={showExpenseModal}
        onClose={handleCloseExpenseModal}
        onSuccess={handleSuccess}
        expenseId={selectedExpense?.id}
        expenseData={selectedExpense}
      />

      {/* Expense Details Modal */}
      <ExpenseDetailsModal
        isOpen={showDetailsModal}
        onClose={handleCloseDetailsModal}
        expenseId={selectedExpenseId}
      />
    </>
  );
};

export default ExpensesTab;

