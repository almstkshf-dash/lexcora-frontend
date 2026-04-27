'use client';

import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTranslations } from '@/hooks/useTranslations';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Edit, Trash2, Plus, Eye, FileCheck } from 'lucide-react';
import { getAllBankAccounts, deleteBankAccount } from '@/app/services/api/bankAccounts';
import AddAccountModal from './components/AddAccountModal';
import EditAccountModal from './components/EditAccountModal';
import BankAccountLogsModal from './components/BankAccountLogsModal';
import BankReconciliationModal from './components/BankReconciliationModal';
import { toast } from 'react-toastify';
import PageHeader from '@/components/PageHeader';
import { Landmark } from 'lucide-react';

function BankAccountsPage() {
  const { isRTL } = useLanguage();
  const t = useTranslations('BankAccountsPage');
  const navT = useTranslations('navigation');
  const [bankAccounts, setBankAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showLogsModal, setShowLogsModal] = useState(false);
  const [showReconcileModal, setShowReconcileModal] = useState(false);
  const [selectedAccountId, setSelectedAccountId] = useState(null);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Fetch bank accounts
  const fetchBankAccounts = async () => {
    try {
      setLoading(true);
      const response = await getAllBankAccounts();
      if (response.success) {
        setBankAccounts(response.data);
      } else {
        toast.error(t('errorLoadingAccounts'));
      }
    } catch (error) {

      toast.error(t('errorLoadingAccounts'));
    } finally {
      setLoading(false);
    }
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    fetchBankAccounts();
  }, []);

  const handleEdit = (accountId) => {
    setSelectedAccountId(accountId);
    setShowEditModal(true);
  };

  const handleViewLogs = (account) => {
    setSelectedAccount(account);
    setShowLogsModal(true);
  };

  const handleReconcile = (account) => {
    setSelectedAccount(account);
    setShowReconcileModal(true);
  };

  const handleDelete = async (accountId) => {
    try {
      setDeleteLoading(true);
      const response = await deleteBankAccount(accountId);
      
      if (response.success) {
        toast.success(t('accountDeletedSuccess'));
        fetchBankAccounts(); // Refresh the list
      } else {
        toast.error(t('errorDeletingAccount'));
      }
    } catch (error) {

      toast.error(t('errorDeletingAccount'));
    } finally {
      setDeleteLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat(t('common.direction') === 'rtl' ? 'ar-AE' : 'en-US', {
      style: 'currency',
      currency: 'AED'
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString(t('common.direction') === 'rtl' ? 'ar-AE' : 'en-US');
  };

  return (
    <div className="p-6" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <PageHeader
          title={t('title')}
          icon={Landmark}
          breadcrumbs={[
            { label: navT('dashboard'), href: '/' },
            { label: navT('finance') },
            { label: navT('bankAccounts') }
          ]}
        />



        {/* Bank Accounts Card */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>{t('accountsList')}</CardTitle>
              <Button 
                onClick={() => setShowAddModal(true)}
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                {t('addNewAccount')}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center p-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                <span className="mr-3">{t('loading')}</span>
              </div>
            ) : bankAccounts.length === 0 ? (
              <div className="text-center p-8">
                <p className="text-gray-500 mb-4">{t('noAccountsFound')}</p>
                <Button onClick={() => setShowAddModal(true)}>
                  {t('addNewAccount')}
                </Button>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('bankName')}</TableHead>
                    <TableHead>{t('accountName')}</TableHead>
                    <TableHead>{t('accountNumber')}</TableHead>
                    <TableHead>IBAN</TableHead>
                    <TableHead>{t('branch')}</TableHead>
                    <TableHead>{t('currentBalance')}</TableHead>
                    <TableHead>{t('status')}</TableHead>
                    <TableHead>{t('createdAt')}</TableHead>
                    <TableHead>{t('actions')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {bankAccounts.map((account) => (
                    <TableRow key={account.id}>
                      <TableCell className="font-medium">
                        {account.bank_name}
                      </TableCell>
                      <TableCell>{account.account_name}</TableCell>
                      <TableCell className="font-mono">
                        {account.account_number}
                      </TableCell>
                      <TableCell className="font-mono text-sm">
                        {account.iban || '-'}
                      </TableCell>
                      <TableCell>
                        {account.branch_name_ar || '-'}
                      </TableCell>
                      <TableCell>
                        {formatCurrency(account.current_balance)}
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={account.status === 'active' ? 'default' : 'secondary'}
                        >
                          {account.status === 'active' ? t('active') : t('inactive')}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {formatDate(account.created_at)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewLogs(account)}
                            title={t('viewLogs')}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>

                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleReconcile(account)}
                            title={t('reconcile')}
                            className="text-blue-600 border-blue-200 hover:bg-blue-50"
                          >
                            <FileCheck className="h-4 w-4" />
                          </Button>
                          
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(account.id)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                disabled={deleteLoading}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>{t('confirmDelete')}</AlertDialogTitle>
                                <AlertDialogDescription>
                                  {t('deleteConfirmMessage', { accountName: account.account_name })}
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>{t('cancel')}</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDelete(account.id)}
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
          </CardContent>
        </Card>

        {/* Modals */}
        <AddAccountModal
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          onSuccess={fetchBankAccounts}
        />

        <EditAccountModal
          isOpen={showEditModal}
          onClose={() => {
            setShowEditModal(false);
            setSelectedAccountId(null);
          }}
          onSuccess={fetchBankAccounts}
          accountId={selectedAccountId}
        />

        <BankAccountLogsModal
          isOpen={showLogsModal}
          onClose={() => {
            setShowLogsModal(false);
            setSelectedAccount(null);
          }}
          accountId={selectedAccount?.id}
          accountName={selectedAccount?.account_name}
        />

        <BankReconciliationModal
          isOpen={showReconcileModal}
          onClose={() => {
            setShowReconcileModal(false);
            setSelectedAccount(null);
          }}
          accountId={selectedAccount?.id}
          accountName={selectedAccount?.account_name}
        />
      </div>
    </div>
  );
}

export default BankAccountsPage;