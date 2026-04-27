'use client';

import React, { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/app/components/ui/table';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/app/components/ui/dialog';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/app/components/ui/select';
import { Plus, Wallet, ArrowUpCircle, ArrowDownCircle, Search } from 'lucide-react';
import { pettyCashService } from '@/app/services/api/pettyCash';
import { toast } from 'react-hot-toast';

export default function PettyCashPage() {
  const t = useTranslations('PettyCash');
  const commonT = useTranslations('common');
  
  const [funds, setFunds] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedFund, setSelectedFund] = useState(null);
  const [isAddFundOpen, setIsAddFundOpen] = useState(false);
  const [isAddTxOpen, setIsAddTxOpen] = useState(false);
  
  const [newFund, setNewFund] = useState({ name: '', responsible_employee_id: '', initial_balance: 0 });
  const [newTx, setNewTx] = useState({ fund_id: '', type: 'disbursement', amount: '', description: '', date: new Date().toISOString().split('T')[0] });

  useEffect(() => {
    fetchFunds();
  }, []);

  const fetchFunds = async () => {
    try {
      setLoading(true);
      const data = await pettyCashService.getFunds();
      setFunds(data);
      if (data.length > 0 && !selectedFund) {
        setSelectedFund(data[0]);
        fetchTransactions(data[0].id);
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
      setTransactions(data);
    } catch (error) {
      toast.error(commonT('errorLoading'));
    }
  };

  const handleCreateFund = async () => {
    try {
      await pettyCashService.createFund(newFund);
      toast.success(commonT('success'));
      setIsAddFundOpen(false);
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
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">{t('title')}</h1>
        <div className="flex gap-2">
          <Dialog open={isAddFundOpen} onOpenChange={setIsAddFundOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Wallet className="mr-2 h-4 w-4" />
                {t('addNewFund')}
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{t('addNewFund')}</DialogTitle>
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
                    onChange={(e) => setNewFund({...newFund, initial_balance: parseFloat(e.target.value)})} 
                  />
                </div>
                <Button onClick={handleCreateFund} className="w-full">{commonT('save')}</Button>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={isAddTxOpen} onOpenChange={setIsAddTxOpen}>
            <DialogTrigger asChild>
              <Button disabled={!selectedFund}>
                <Plus className="mr-2 h-4 w-4" />
                {t('addTransaction')}
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{t('addTransaction')}</DialogTitle>
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
                      <SelectItem value="disbursement">{t('disbursement')}</SelectItem>
                      <SelectItem value="replenishment">{t('replenishment')}</SelectItem>
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
                    className={`w-full flex flex-col items-start p-3 rounded-lg text-sm transition-colors ${
                      selectedFund?.id === fund.id 
                        ? 'bg-primary text-primary-foreground' 
                        : 'hover:bg-muted'
                    }`}
                  >
                    <span className="font-semibold">{fund.name}</span>
                    <span className={selectedFund?.id === fund.id ? 'text-primary-foreground/80' : 'text-muted-foreground'}>
                      {fund.balance.toLocaleString()} {fund.currency || 'AED'}
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
                    <div className="text-2xl font-bold">{selectedFund.balance.toLocaleString()}</div>
                    <p className="text-xs text-muted-foreground mt-1">{selectedFund.name}</p>
                  </CardContent>
                </Card>
                {/* Additional summary cards could go here */}
              </div>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>{commonT('actions')}</CardTitle>
                  <div className="relative w-64">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input placeholder={commonT('search')} className="pl-8" />
                  </div>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>{commonT('date')}</TableHead>
                        <TableHead>{commonT('type')}</TableHead>
                        <TableHead>{commonT('description')}</TableHead>
                        <TableHead className="text-right">{commonT('amount')}</TableHead>
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
                            <TableCell>{new Date(tx.date).toLocaleDateString()}</TableCell>
                            <TableCell>
                              <div className="flex items-center">
                                {tx.type === 'replenishment' ? (
                                  <ArrowUpCircle className="mr-2 h-4 w-4 text-green-500" />
                                ) : (
                                  <ArrowDownCircle className="mr-2 h-4 w-4 text-red-500" />
                                )}
                                {t(tx.type)}
                              </div>
                            </TableCell>
                            <TableCell>{tx.description}</TableCell>
                            <TableCell className={`text-right font-medium ${
                              tx.type === 'replenishment' ? 'text-green-600' : 'text-red-600'
                            }`}>
                              {tx.type === 'replenishment' ? '+' : '-'}
                              {parseFloat(tx.amount).toLocaleString()}
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
            <div className="flex flex-col items-center justify-center h-64 border-2 border-dashed rounded-lg text-muted-foreground">
              <Wallet className="h-12 w-12 mb-4 opacity-20" />
              <p>{commonT('noData')}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
