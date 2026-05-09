'use client';

import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, Loader2, Eye } from 'lucide-react';
import { getAllEmployeeCashTransactions, updateEmployeeCashTransaction } from '@/app/services/api/employeeCashTransactions';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

export default function EmployeeTransactions() {
  const { isRTL, language } = useLanguage();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState({ id: null, action: null }); // Track both ID and action type
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [showDetails, setShowDetails] = useState(false);

  const t = {
    title: language === 'ar' ? 'العهد والمصروفات المعلقة' : 'Pending Advances & Expenses',
    employeeName: language === 'ar' ? 'اسم الموظف' : 'Employee Name',
    type: language === 'ar' ? 'النوع' : 'Type',
    amount: language === 'ar' ? 'المبلغ' : 'Amount',
    description: language === 'ar' ? 'الوصف' : 'Description',
    date: language === 'ar' ? 'التاريخ' : 'Date',
    actions: language === 'ar' ? 'الإجراءات' : 'Actions',
    approve: language === 'ar' ? 'موافقة' : 'Approve',
    reject: language === 'ar' ? 'رفض' : 'Reject',
    view: language === 'ar' ? 'عرض' : 'View',
    credit: language === 'ar' ? 'عهدة (دائن)' : 'Advance (Credit)',
    debit: language === 'ar' ? 'مصروف (مدين)' : 'Expense (Debit)',
    pending: language === 'ar' ? 'قيد الانتظار' : 'Pending',
    noTransactions: language === 'ar' ? 'لا توجد معاملات معلقة' : 'No pending transactions',
    loading: language === 'ar' ? 'جاري التحميل...' : 'Loading...',
    approveSuccess: language === 'ar' ? 'تم الموافقة بنجاح' : 'Approved successfully',
    rejectSuccess: language === 'ar' ? 'تم الرفض بنجاح' : 'Rejected successfully',
    error: language === 'ar' ? 'حدث خطأ' : 'An error occurred',
    transactionDetails: language === 'ar' ? 'تفاصيل المعاملة' : 'Transaction Details',
    createdBy: language === 'ar' ? 'أنشئ بواسطة' : 'Created By',
    phoneNumber: language === 'ar' ? 'رقم الهاتف' : 'Phone Number',
    currentBalance: language === 'ar' ? 'الرصيد الحالي' : 'Current Balance',
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const response = await getAllEmployeeCashTransactions({
        limit: 1000,
        // Filter for pending status if your API supports it
        // status: 'pending'
      });

      if (response.success && response.data) {
        // Filter pending transactions on the client side
        const pendingTransactions = Array.isArray(response.data) ? response.data.filter(
          transaction => transaction.status === 'pending' || !transaction.status
        ) : [];
        setTransactions(pendingTransactions);
      }
    } catch (error) {
      console.error('Error fetching transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (transactionId) => {
    try {
      setActionLoading({ id: transactionId, action: 'approve' });
      
      const response = await updateEmployeeCashTransaction(transactionId, {
        status: 'approved'
      });

      if (response.success) {
        // Show success message
        alert(t.approveSuccess);
        // Refresh the list
        fetchTransactions();
      } else {
        alert(t.error);
      }
    } catch (error) {
      console.error('Error approving transaction:', error);
      alert(t.error);
    } finally {
      setActionLoading({ id: null, action: null });
    }
  };

  const handleReject = async (transactionId) => {
    if (!confirm(language === 'ar' ? 'هل أنت متأكد من رفض هذه المعاملة؟' : 'Are you sure you want to reject this transaction?')) {
      return;
    }

    try {
      setActionLoading({ id: transactionId, action: 'reject' });
      
      const response = await updateEmployeeCashTransaction(transactionId, {
        status: 'rejected'
      });

      if (response.success) {
        alert(t.rejectSuccess);
        fetchTransactions();
      } else {
        alert(t.error);
      }
    } catch (error) {
      console.error('Error rejecting transaction:', error);
      alert(t.error);
    } finally {
      setActionLoading({ id: null, action: null });
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('ar-AE', {
      style: 'currency',
      currency: 'AED'
    }).format(amount || 0);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('ar-AE', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const viewDetails = (transaction) => {
    setSelectedTransaction(transaction);
    setShowDetails(true);
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex justify-center items-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <span className={`${isRTL ? 'mr-2' : 'ml-2'}`}>{t.loading}</span>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className={isRTL ? 'text-right' : 'text-left'}>
            {t.title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {transactions.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              {t.noTransactions}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table dir={isRTL ? 'rtl' : 'ltr'}>
                <TableHeader>
                  <TableRow>
                    <TableHead className={isRTL ? 'text-right' : 'text-left'}>{t.employeeName}</TableHead>
                    <TableHead className={isRTL ? 'text-right' : 'text-left'}>{t.type}</TableHead>
                    <TableHead className={isRTL ? 'text-right' : 'text-left'}>{t.amount}</TableHead>
                    <TableHead className={isRTL ? 'text-right' : 'text-left'}>{t.description}</TableHead>
                    <TableHead className={isRTL ? 'text-right' : 'text-left'}>{t.date}</TableHead>
                    <TableHead className={isRTL ? 'text-right' : 'text-left'}>{t.actions}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell className={isRTL ? 'text-right' : 'text-left'}>
                        {transaction.employee_name}
                      </TableCell>
                      <TableCell className={isRTL ? 'text-right' : 'text-left'}>
                        <Badge variant={transaction.type === 'credit' ? 'default' : 'secondary'}>
                          {transaction.type === 'credit' ? t.credit : t.debit}
                        </Badge>
                      </TableCell>
                      <TableCell className={isRTL ? 'text-right' : 'text-left'}>
                        <span className="font-semibold">{formatCurrency(transaction.amount)}</span>
                      </TableCell>
                      <TableCell className={isRTL ? 'text-right' : 'text-left'}>
                        {transaction.description || '-'}
                      </TableCell>
                      <TableCell className={isRTL ? 'text-right' : 'text-left'}>
                        {formatDate(transaction.created_at)}
                      </TableCell>
                      <TableCell className={isRTL ? 'text-right' : 'text-left'}>
                        <div className={`flex gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => viewDetails(transaction)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="default"
                            onClick={() => handleApprove(transaction.id)}
                            disabled={actionLoading.id === transaction.id}
                          >
                            {actionLoading.id === transaction.id && actionLoading.action === 'approve' ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <CheckCircle className="h-4 w-4" />
                            )}
                            <span className={isRTL ? 'mr-1' : 'ml-1'}>{t.approve}</span>
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleReject(transaction.id)}
                            disabled={actionLoading.id === transaction.id}
                          >
                            {actionLoading.id === transaction.id && actionLoading.action === 'reject' ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <XCircle className="h-4 w-4" />
                            )}
                            <span className={isRTL ? 'mr-1' : 'ml-1'}>{t.reject}</span>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Details Dialog */}
      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent dir={isRTL ? 'rtl' : 'ltr'}>
          <DialogHeader>
            <DialogTitle>{t.transactionDetails}</DialogTitle>
          </DialogHeader>
          {selectedTransaction && (
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium text-gray-500">{t.employeeName}</p>
                <p className="text-lg">{selectedTransaction.employee_name}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">{t.phoneNumber}</p>
                <p>{selectedTransaction.employee_phone}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">{t.currentBalance}</p>
                <p className="text-lg font-semibold">{formatCurrency(selectedTransaction.employee_balance)}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">{t.type}</p>
                <Badge variant={selectedTransaction.type === 'credit' ? 'default' : 'secondary'}>
                  {selectedTransaction.type === 'credit' ? t.credit : t.debit}
                </Badge>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">{t.amount}</p>
                <p className="text-xl font-bold">{formatCurrency(selectedTransaction.amount)}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">{t.description}</p>
                <p>{selectedTransaction.description || '-'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">{t.createdBy}</p>
                <p>{selectedTransaction.created_by_name}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">{t.date}</p>
                <p>{formatDate(selectedTransaction.created_at)}</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
