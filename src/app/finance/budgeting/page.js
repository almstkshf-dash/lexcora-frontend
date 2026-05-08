'use client';

import { useState } from 'react';
import useSWR from 'swr';
import { useTranslations } from '@/hooks/useTranslations';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Clock, Calendar, PieChart, Plus, Check, Lock, Unlock, AlertCircle, Loader2 } from 'lucide-react';
import PageHeader from '@/components/PageHeader';
import { 
  getFiscalPeriods, 
  updateFiscalPeriodStatus, 
  createFiscalPeriod,
  getBudgetVsActual,
  setBudget,
  getAccountsTree
} from '@/app/services/api/accounting';
import { toast } from 'react-toastify';
import React from 'react';
import { cn } from '@/lib/utils';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter 
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';

const AccountBudgetRow = ({ account, level, fiscalYear, isRTL, accT, commonT }) => {
  const [amount, setAmount] = useState(account.budget_amount || 0);
  const [saving, setSaving] = useState(false);
  const [hasChanged, setHasChanged] = useState(false);

  const handleUpdateBudget = async () => {
    try {
      setSaving(true);
      await setBudget({
        account_id: account.id,
        amount: parseFloat(amount),
        fiscal_year: fiscalYear,
        branch_id: null // System-wide budget for now
      });
      setHasChanged(false);
      toast.success(`${isRTL ? account.name_ar : account.name_en}: ${commonT('success')}`);
    } catch (error) {
      toast.error(commonT('error'));
    } finally {
      setSaving(false);
    }
  };

  const isCategory = Array.isArray(account.children) && account.children.length > 0;

  return (
    <>
      <TableRow className={cn(level === 0 ? "bg-muted/5 font-bold" : "", isCategory ? "text-primary/80" : "")}>
        <TableCell 
          style={{ [isRTL ? 'paddingRight' : 'paddingLeft']: `${level * 24 + 16}px` }}
          className="py-3"
        >
          <div className="flex items-center gap-2">
            {isCategory && <Calendar className="h-3 w-3 opacity-50" />}
            {isRTL ? account.name_ar : account.name_en}
            <span className="text-[10px] opacity-40 font-mono ms-2">#{account.code}</span>
          </div>
        </TableCell>
        <TableCell>
          <Badge variant="outline" className="text-[10px] uppercase font-bold tracking-tighter opacity-70">
            {accT(account.type) || account.type}
          </Badge>
        </TableCell>
        <TableCell className="text-end">
          {!isCategory && (
            <div className="flex items-center justify-end gap-2 max-w-[200px] ms-auto">
              <Input
                type="number"
                value={amount}
                onChange={(e) => {
                  setAmount(e.target.value);
                  setHasChanged(true);
                }}
                className="h-8 text-end font-mono text-sm border-muted-foreground/20 focus:border-primary"
              />
              {hasChanged && (
                <Button 
                  size="icon" 
                  variant="ghost" 
                  className="h-8 w-8 text-green-600 hover:text-green-700 hover:bg-green-50"
                  onClick={handleUpdateBudget}
                  disabled={saving}
                >
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                </Button>
              )}
            </div>
          )}
          {isCategory && (
             <span className="text-xs text-muted-foreground italic">
               {accT('categoryTotal')}
             </span>
          )}
        </TableCell>
        <TableCell className="text-end">
          {!isCategory && !hasChanged && (
            <div className="h-8 w-8 inline-flex items-center justify-center opacity-20">
              <Check className="h-4 w-4 text-green-600" />
            </div>
          )}
        </TableCell>
      </TableRow>
      {Array.isArray(account.children) && account.children.map(child => (
        <AccountBudgetRow 
          key={child.id} 
          account={child} 
          level={level + 1} 
          fiscalYear={fiscalYear}
          isRTL={isRTL}
          accT={accT}
          commonT={commonT}
        />
      ))}
    </>
  );
};

export default function BudgetingPage() {
  const { isRTL } = useLanguage();
  const navT = useTranslations('navigation');
  const accT = useTranslations('Accounting');
  const commonT = useTranslations('common');

  const [activeTab, setActiveTab] = useState('periods');
  const [fiscalYear, setFiscalYear] = useState(new Date().getFullYear());

  // Add Period State
  const [isAddPeriodOpen, setIsAddPeriodOpen] = useState(false);
  const [newPeriod, setNewPeriod] = useState({
    name: '',
    start_date: '',
    end_date: ''
  });
  const [creatingPeriod, setCreatingPeriod] = useState(false);

  const { data: periodsData, mutate: mutatePeriods } = useSWR('/accounting/fiscal-periods', () => getFiscalPeriods());
  const { data: budgetData } = useSWR(activeTab === 'bva' ? [`/accounting/reports/budget-vs-actual`, fiscalYear] : null, () => getBudgetVsActual({ fiscal_year: fiscalYear }));
  const { data: accountsData } = useSWR(activeTab === 'planning' ? '/accounting/accounts/tree' : null, () => getAccountsTree());

  const handleTogglePeriod = async (id, currentStatus) => {
    const newStatus = currentStatus === 'open' ? 'closed' : 'open';
    try {
      await updateFiscalPeriodStatus(id, newStatus);
      toast.success(commonT('success'));
      mutatePeriods();
    } catch (error) {
      toast.error(commonT('error'));
    }
  };

  const handleCreatePeriod = async (e) => {
    e.preventDefault();
    if (!newPeriod.name || !newPeriod.start_date || !newPeriod.end_date) {
      toast.error(commonT('pleaseFillAllFields') || 'Please fill all fields');
      return;
    }

    try {
      setCreatingPeriod(true);
      await createFiscalPeriod(newPeriod);
      toast.success(commonT('success'));
      setIsAddPeriodOpen(false);
      setNewPeriod({ name: '', start_date: '', end_date: '' });
      mutatePeriods();
    } catch (error) {
      toast.error(commonT('error'));
    } finally {
      setCreatingPeriod(false);
    }
  };

  return (
    <div className="p-6 space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      <PageHeader
        title={navT('budgeting')}
        icon={Clock}
        breadcrumbs={[
          { label: navT('dashboard'), href: '/' },
          { label: navT('finance') },
          { label: navT('budgeting') }
        ]}
      />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full" dir={isRTL ? 'rtl' : 'ltr'}>
        <TabsList className="grid w-full grid-cols-3 mb-8">
          <TabsTrigger value="periods" className="gap-2"><Calendar className="h-4 w-4" /> {accT('fiscalPeriods')}</TabsTrigger>
          <TabsTrigger value="planning" className="gap-2"><Plus className="h-4 w-4" /> {accT('budgeting')}</TabsTrigger>
          <TabsTrigger value="bva" className="gap-2"><PieChart className="h-4 w-4" /> {accT('budgetVsActual')}</TabsTrigger>
        </TabsList>

        <TabsContent value="periods">
          <Card className="border-none shadow-xl bg-card/60 backdrop-blur-md">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>{accT('fiscalPeriods')}</CardTitle>
                <CardDescription>{accT('fiscalPeriodsDescription')}</CardDescription>
              </div>
              
              <Dialog open={isAddPeriodOpen} onOpenChange={setIsAddPeriodOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" className="gap-2">
                    <Plus className="h-4 w-4" /> {commonT('add')}
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>{accT('addFiscalPeriod')}</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleCreatePeriod} className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label>{commonT('name')}</Label>
                      <Input 
                        value={newPeriod.name} 
                        onChange={(e) => setNewPeriod({...newPeriod, name: e.target.value})}
                        placeholder={commonT('name')}
                        required
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>{commonT('startDate')}</Label>
                        <Input 
                          type="date"
                          value={newPeriod.start_date} 
                          onChange={(e) => setNewPeriod({...newPeriod, start_date: e.target.value})}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>{commonT('endDate')}</Label>
                        <Input 
                          type="date"
                          value={newPeriod.end_date} 
                          onChange={(e) => setNewPeriod({...newPeriod, end_date: e.target.value})}
                          required
                        />
                      </div>
                    </div>
                    <DialogFooter className="pt-4">
                      <Button type="button" variant="outline" onClick={() => setIsAddPeriodOpen(false)}>
                        {commonT('cancel')}
                      </Button>
                      <Button type="submit" disabled={creatingPeriod}>
                        {creatingPeriod ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                        {commonT('save')}
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{commonT('name')}</TableHead>
                    <TableHead>{commonT('startDate')}</TableHead>
                    <TableHead>{commonT('endDate')}</TableHead>
                    <TableHead>{commonT('status')}</TableHead>
                    <TableHead className="text-end">{commonT('actions')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(Array.isArray(periodsData?.data) ? periodsData.data : Array.isArray(periodsData) ? periodsData : []).map((period) => (
                    <TableRow key={period.id}>
                      <TableCell className="font-semibold">{period.name}</TableCell>
                      <TableCell>{new Date(period.start_date).toLocaleDateString()}</TableCell>
                      <TableCell>{new Date(period.end_date).toLocaleDateString()}</TableCell>
                      <TableCell>
                        {period.status === 'open' ? (
                          <Badge className="bg-green-500 hover:bg-green-600 gap-1"><Unlock className="h-3 w-3" /> {commonT('open')}</Badge>
                        ) : (
                          <Badge variant="secondary" className="gap-1"><Lock className="h-3 w-3" /> {commonT('closed')}</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-end">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => handleTogglePeriod(period.id, period.status)}
                        >
                          {period.status === 'open' ? accT('closePeriod') : accT('openPeriod')}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="planning">
          <Card className="border-none shadow-xl overflow-hidden">
            <CardHeader className="bg-muted/30 pb-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <CardTitle>{accT('budgeting')}</CardTitle>
                  <CardDescription>{accT('budgetingDescription')}</CardDescription>
                </div>
                <div className="flex items-center gap-3">
                  <Input 
                    type="number" 
                    value={fiscalYear} 
                    onChange={(e) => setFiscalYear(Number(e.target.value))}
                    className="w-24 font-bold text-center"
                  />
                  <Button variant="outline" size="sm" onClick={() => mutatePeriods()} className="gap-2">
                    <Clock className="h-4 w-4" /> {accT('history')}
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
               <div className="overflow-x-auto">
                 <Table>
                   <TableHeader className="bg-muted/50 border-y">
                     <TableRow>
                       <TableHead className="w-[40%]">{commonT('account')}</TableHead>
                       <TableHead className="w-[20%]">{commonT('type')}</TableHead>
                       <TableHead className="w-[30%] text-end">{accT('budgetAmount')}</TableHead>
                       <TableHead className="w-[10%] text-end"></TableHead>
                     </TableRow>
                   </TableHeader>
                   <TableBody>
                     {(Array.isArray(accountsData?.data) ? accountsData.data : Array.isArray(accountsData) ? accountsData : []).map(account => (
                       <AccountBudgetRow 
                         key={account.id} 
                         account={account} 
                         level={0} 
                         fiscalYear={fiscalYear} 
                         isRTL={isRTL}
                         accT={accT}
                         commonT={commonT}
                       />
                     ))}
                   </TableBody>
                 </Table>
               </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="bva">
          <Card className="border-none shadow-xl">
            <CardHeader>
              <CardTitle>{accT('budgetVsActual')}</CardTitle>
              <CardDescription>{accT('budgetPerformanceFY')} {fiscalYear}</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{commonT('name')}</TableHead>
                    <TableHead className="text-end">{accT('budgetAmount')}</TableHead>
                    <TableHead className="text-end">{accT('actualAmount')}</TableHead>
                    <TableHead className="text-end">{accT('variance')}</TableHead>
                    <TableHead className="text-end">%</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(Array.isArray(budgetData?.data) ? budgetData.data : Array.isArray(budgetData) ? budgetData : []).map((row) => (
                    <TableRow key={row.id}>
                      <TableCell className="font-medium">{isRTL ? row.name_ar : row.name_en}</TableCell>
                      <TableCell className="text-end font-mono">{row.amount?.toLocaleString()}</TableCell>
                      <TableCell className="text-end font-mono">{row.actual_amount?.toLocaleString()}</TableCell>
                      <TableCell className={cn("text-end font-mono", row.variance >= 0 ? "text-green-600" : "text-red-600")}>
                        {row.variance?.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-end">
                         <div className="w-full bg-muted rounded-full h-2 max-w-[100px] ms-auto">
                            <div 
                              className={cn("h-2 rounded-full", row.performance_pct > 100 ? "bg-red-500" : "bg-primary")} 
                              style={{ width: `${Math.min(row.performance_pct, 100)}%` }} 
                            />
                         </div>
                         <span className="text-[10px] text-muted-foreground">{row.performance_pct?.toFixed(1)}%</span>
                      </TableCell>
                    </TableRow>
                  ))}
                  {(!budgetData?.data || budgetData.data.length === 0) && (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-12 text-muted-foreground">
                        {commonT('noData')}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

