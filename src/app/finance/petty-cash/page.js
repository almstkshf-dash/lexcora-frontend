'use client';

import React, { useState, useEffect } from 'react';
import { useTranslations } from '@/hooks/useTranslations';
import { useLanguage } from '@/contexts/LanguageContext';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription,
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Plus, Wallet, ArrowUpCircle, ArrowDownCircle, Search } from 'lucide-react';
import { pettyCashService } from '@/app/services/api/pettyCash';
import { toast } from 'react-toastify';
import PageHeader from '@/components/PageHeader';
import { DEFAULT_CURRENCY, LOCALE, LOG_TYPE } from '@/app/finance/constants';


export default function PettyCashPage() {
  const { language, isRTL } = useLanguage();
  const t = useTranslations('PettyCash');
  const commonT = useTranslations('common');
  const navT = useTranslations('navigation');
  
  const [funds, setFunds] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedFund, setSelectedFund] = useState(null);
  const [isAddFundOpen, setIsAddFundOpen] = useState(false);
  const [isAddTxOpen, setIsAddTxOpen] = useState(false);
  
  const [newFund, setNewFund] = useState({ name: '', responsible_employee_id: '', initial_balance: '' });
  const [newTx, setNewTx] = useState({ fund_id: '', type: LOG_TYPE.DISBURSEMENT, amount: '', description: '', date: new Date().toISOString().split('T')[0] });

  const toArray = (payload) => {
    if (Array.isArray(payload)) return payload;
    if (Array.isArray(payload?.data)) return payload.data;
    return [];
  };

  const formatCurrency = (value, currency = DEFAULT_CURRENCY) => {
    return new Intl.NumberFormat(language === 'ar' ? LOCALE.ar : LOCALE.en, {
      style: 'currency',
      currency,
    }).format(Number(value) || 0);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString(language === 'ar' ? LOCALE.ar : LOCALE.en);
  };

  useEffect(() => {
    fetchFunds();
  }, []);

  const fetchFunds = async () => {
    try {
      setLoading(true);
      const data = await pettyCashService.getFunds();
      const normalizedFunds = toArray(data);
      setFunds(normalizedFunds);
      const nextSelectedFund = normalizedFunds.find((fund) => fund.id === selectedFund?.id) || normalizedFunds[0] || null;
      setSelectedFund(nextSelectedFund);
      if (nextSelectedFund) {
        fetchTransactions(nextSelectedFund.id);
      }
      if (normalizedFunds.length === 0) {
        setSelectedFund(null);
        setTransactions([]);
      }
    } catch (error) {
      toast.error(commonT('errorLoading'));
    } finally {
      setLoading(false);
    }
  };

  const fetchTransactions = async (fundId) => {
    try {
      const data = await pettyCashService.getTransactions(fundId);
      setTransactions(toArray(data));
    } catch (error) {
      toast.error(commonT('errorLoading'));
    }
  };

  const handleCreateFund = async () => {
    try {
      const initialBalance = Number(newFund.initial_balance);
      await pettyCashService.createFund({
        ...newFund,
        initial_balance: Number.isFinite(initialBalance) ? initialBalance : 0
      });
      toast.success(commonT('success'));
      setIsAddFundOpen(false);
      setNewFund({ name: '', responsible_employee_id: '', initial_balance: '' });
      fetchFunds();
    } catch (error) {
      toast.error(commonT('error'));
    }
  };

  const handleAddTransaction = async () => {
    try {
      await pettyCashService.createTransaction({
        ...newTx,
        fund_id: selectedFund.id
      });
      toast.success(commonT('success'));
      setIsAddTxOpen(false);
      fetchTransactions(selectedFund.id);
      fetchFunds(); // Refresh balance
    } catch (error) {
      toast.error(commonT('error'));
    }
  };

  return (
    <div className="p-6 space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      <PageHeader
        title={t('title')}
        icon={Wallet}
        breadcrumbs={[
          { label: navT('dashboard'), href: '/' },
          { label: navT('finance') },
          { label: navT('pettyCash') }
        ]}
      />

      <div className="flex justify-end items-center gap-2">
          <Dialog open={isAddFundOpen} onOpenChange={setIsAddFundOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Wallet className="me-2 h-4 w-4" />
                {t('addNewFund')}
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{t('addNewFund')}</DialogTitle>
                <DialogDescription>
                  {t('addNewFund')}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <label>{t('fundName')}</label>
                  <Input 
                    value={newFund.name} 
                    onChange={(e) => setNewFund({...newFund, name: e.target.value})} 
                  />
                </div>
                <div className="space-y-2">
                  <label>{commonT('amount')}</label>
                  <Input 
                    type="number"
                    value={newFund.initial_balance} 
                    onChange={(e) => setNewFund({...newFund, initial_balance: e.target.value})} 
                  />
                </div>
                <Button onClick={handleCreateFund} className="w-full">{commonT('save')}</Button>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={isAddTxOpen} onOpenChange={setIsAddTxOpen}>
            <DialogTrigger asChild>
              <Button disabled={!selectedFund}>
                <Plus className="me-2 h-4 w-4" />
                {t('addTransaction')}
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{t('addTransaction')}</DialogTitle>
                <DialogDescription>
                  {t('addTransaction')}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <label>{commonT('type')}</label>
                  <Select 
                    value={newTx.type} 
                    onValueChange={(val) => setNewTx({...newTx, type: val})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={LOG_TYPE.DISBURSEMENT}>{t('disbursement')}</SelectItem>
                      <SelectItem value={LOG_TYPE.REPLENISHMENT}>{t('replenishment')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label>{commonT('amount')}</label>
                  <Input 
                    type="number"
                    value={newTx.amount} 
                    onChange={(e) => setNewTx({...newTx, amount: e.target.value})} 
                  />
                </div>
                <div className="space-y-2">
                  <label>{commonT('description')}</label>
                  <Input 
                    value={newTx.description} 
                    onChange={(e) => setNewTx({...newTx, description: e.target.value})} 
                  />
                </div>
                <Button onClick={handleAddTransaction} className="w-full">{commonT('save')}</Button>
              </div>
            </DialogContent>
          </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="md:col-span-1 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">{t('title')}</CardTitle>
            </CardHeader>
            <CardContent className="p-2">
              <div className="space-y-1">
                {funds.map((fund) => (
                  <button
                    key={fund.id}
                    onClick={() => {
                      setSelectedFund(fund);
                      fetchTransactions(fund.id);
                    }}
                    className={`w-full flex flex-col items-start p-3 rounded-sg text-sm transition-colors ${
                      selectedFund?.id === fund.id 
                        ? 'bg-primary text-primary-foreground' 
                        : 'hover:bg-muted'
                    }`}
                  >
                    <span className="font-semibold">{fund.name}</span>
                    <span className={selectedFund?.id === fund.id ? 'text-primary-foreground/80' : 'text-muted-foreground'}>
                      {formatCurrency(fund.balance, fund.currency || DEFAULT_CURRENCY)}
                    </span>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-3 space-y-6">
          {selectedFund ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Card className="bg-primary/5 border-primary/20">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-xs font-medium text-muted-foreground uppercase">{t('currentBalance')}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{formatCurrency(selectedFund.balance, selectedFund.currency || DEFAULT_CURRENCY)}</div>
                    <p className="text-xs text-muted-foreground mt-1">{selectedFund.name}</p>
                  </CardContent>
                </Card>
                {/* Additional summary cards could go here */}
              </div>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>{commonT('actions')}</CardTitle>
                  <div className="relative w-64">
                    <Search className="absolute start-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input placeholder={commonT('search')} className="ps-8" />
                  </div>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>{commonT('date')}</TableHead>
                        <TableHead>{commonT('type')}</TableHead>
                        <TableHead>{commonT('description')}</TableHead>
                        <TableHead className="text-end">{commonT('amount')}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {transactions.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={4} className="text-center py-10 text-muted-foreground">
                            {commonT('noData')}
                          </TableCell>
                        </TableRow>
                      ) : (
                        transactions.map((tx) => (
                          <TableRow key={tx.id}>
                            <TableCell>{formatDate(tx.date)}</TableCell>
                            <TableCell>
                              <div className="flex items-center">
                                {tx.type === LOG_TYPE.REPLENISHMENT ? (
                                  <ArrowUpCircle className="me-2 h-4 w-4 text-green-500" />
                                ) : (
                                  <ArrowDownCircle className="me-2 h-4 w-4 text-red-500" />
                                )}
                                {t(tx.type)}
                              </div>
                            </TableCell>
                            <TableCell>{tx.description}</TableCell>
                            <TableCell className={`text-end font-medium ${
                              tx.type === LOG_TYPE.REPLENISHMENT ? 'text-green-600' : 'text-red-600'
                            }`}>
                              {tx.type === LOG_TYPE.REPLENISHMENT ? '+' : '-'}
                              {formatCurrency(tx.amount, selectedFund?.currency || DEFAULT_CURRENCY)}
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-64 border-2 border-dashed rounded-sg text-muted-foreground">
              <Wallet className="h-12 w-12 mb-4 opacity-20" />
              <p>{commonT('noData')}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

