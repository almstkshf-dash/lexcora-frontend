'use client';

import React, { useState, useMemo } from 'react';
import useSWR from 'swr';
import { useTranslations } from '@/hooks/useTranslations';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  BarChartIcon, 
  TrendingUp, 
  Landmark, 
  ArrowDownRight, 
  ArrowUpRight, 
  FileBarChart, 
  ChevronRight, 
  ChevronDown, 
  Target, 
  Briefcase,
  PieChart as PieChartIcon,
  Search,
  AlertTriangle,
  CheckCircle2,
  DollarSign,
  Printer,
  Download,
  Package
} from 'lucide-react';
import PageHeader from '@/components/PageHeader';
import { Progress } from '@/components/ui/progress';
import { SearchableCombobox } from '@/components/ui/searchable-combobox';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { 
  getProfitAndLoss, 
  getBalanceSheet, 
  getAgingReceivables, 
  getAgingPayables,
  getBudgetVsActual,
  getCaseFinancialSummary,
  getProjectFinancialSummary,
  getDepartmentFinancialSummary,
  getTrialBalance,
  getAccountingCashFlow,
  getAssetsReport,
  getVatReturn
} from '@/app/services/api/accounting';
import { getDepartments } from '@/app/services/api/departments';
import { searchCases } from '@/app/services/api/cases';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

// --- Components ---

const HierarchicalRow = ({ node, level = 0, isRTL, accT }) => {
  const [isOpen, setIsOpen] = useState(level < 1); // Expand first level by default
  const hasChildren = node.children && node.children.length > 0;
  
  return (
    <>
      <TableRow 
        className={cn(
          "transition-colors",
          level === 0 ? "font-bold bg-muted/30" : "font-medium",
          hasChildren && "cursor-pointer hover:bg-muted/50"
        )}
        onClick={() => hasChildren && setIsOpen(!isOpen)}
      >
        <TableCell className="py-3" style={{ paddingInlineStart: `${level * 24 + 12}px` }}>
          <div className="flex items-center gap-2">
            {hasChildren ? (
              isOpen ? <ChevronDown className="h-4 w-4 text-muted-foreground" /> : <ChevronRight className={cn("h-4 w-4 text-muted-foreground", isRTL && "rotate-180")} />
            ) : (
              <span className="w-4" />
            )}
            {isRTL ? node.name_ar : node.name_en}
            <span className="text-xs text-muted-foreground font-mono ms-2">({node.code})</span>
          </div>
        </TableCell>
        <TableCell className="text-end font-mono">
          <span className={cn(
            node.total_balance < 0 ? "text-red-500" : (node.total_balance > 0 ? "text-green-600" : "")
          )}>
            {Math.abs(node.total_balance).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            {node.total_balance < 0 ? ` (${accT('dr')})` : (node.total_balance > 0 ? ` (${accT('cr')})` : '')}
          </span>
        </TableCell>
      </TableRow>
      {hasChildren && isOpen && node.children.map(child => (
        <HierarchicalRow key={child.account_id} node={child} level={level + 1} isRTL={isRTL} accT={accT} />
      ))}
    </>
  );
};

const HierarchicalTable = ({ data, isRTL, commonT, accT }) => (
  <div className="rounded-xl border border-border/50 bg-card/50 backdrop-blur-sm overflow-hidden">
    <Table>
      <TableHeader className="bg-muted/50">
        <TableRow>
          <TableHead>{commonT('account')}</TableHead>
          <TableHead className="text-end">{commonT('balance')}</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map(node => (
          <HierarchicalRow key={node.account_id} node={node} isRTL={isRTL} accT={accT} />
        ))}
        {data.length === 0 && (
          <TableRow>
            <TableCell colSpan={2} className="text-center py-10 text-muted-foreground italic">
              {commonT('noData')}
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  </div>
);

const AgingCard = ({ party, isRTL, commonT }) => (
  <Card className="overflow-hidden border-none shadow-md bg-card/60 backdrop-blur-md">
    <CardHeader className="pb-2 text-start rtl:text-right">
      <CardTitle className="text-lg flex justify-between items-center">
        {party.party_name}
        <span className="text-sm font-bold text-primary">{party.total_balance.toLocaleString()} {commonT('currencySymbol')}</span>
      </CardTitle>
    </CardHeader>
    <CardContent>
      <div className="grid grid-cols-4 gap-2 text-center text-xs">
        <div className="p-2 rounded bg-green-500/10">
          <p className="text-muted-foreground mb-1">0-30</p>
          <p className="font-bold text-green-600">{party['0-30'].toLocaleString()}</p>
        </div>
        <div className="p-2 rounded bg-amber-500/10">
          <p className="text-muted-foreground mb-1">31-60</p>
          <p className="font-bold text-amber-600">{party['31-60'].toLocaleString()}</p>
        </div>
        <div className="p-2 rounded bg-orange-500/10">
          <p className="text-muted-foreground mb-1">61-90</p>
          <p className="font-bold text-orange-700">{party['61-90'].toLocaleString()}</p>
        </div>
        <div className="p-2 rounded bg-red-500/10">
          <p className="text-muted-foreground mb-1">90+</p>
          <p className="font-bold text-red-600">{party['90+'].toLocaleString()}</p>
        </div>
      </div>
      <div className="mt-4 h-2 w-full bg-muted rounded-full flex overflow-hidden">
        {['0-30', '31-60', '61-90', '90+'].map((bucket, i) => {
          const colors = ['bg-green-500', 'bg-amber-500', 'bg-orange-500', 'bg-red-500'];
          const width = (party[bucket] / party.total_balance) * 100;
          return width > 0 ? <div key={bucket} className={cn(colors[i])} style={{ width: `${width}%` }} /> : null;
        })}
      </div>
    </CardContent>
  </Card>
);
const CashFlowSection = ({ title, data, type, isRTL, accT, commonT }) => (
  <div className="space-y-4">
    <div className="flex justify-between items-center px-1">
      <h3 className="text-lg font-bold flex items-center gap-2">
        <span className={cn(
          "w-1.5 h-6 rounded-full",
          type === 'operating' ? "bg-blue-500" : (type === 'investing' ? "bg-amber-500" : "bg-purple-500")
        )} />
        {title}
      </h3>
      <Badge variant="secondary" className="font-mono">
        {data.reduce((sum, a) => sum + parseFloat(a.balance), 0).toLocaleString(undefined, { minimumFractionDigits: 2 })} {commonT('currencySymbol')}
      </Badge>
    </div>
    <div className="rounded-xl border border-border/40 bg-card/30 overflow-hidden">
      <Table>
        <TableBody>
          {data.map(acc => (
            <TableRow key={acc.account_id} className="hover:bg-muted/30 transition-colors">
              <TableCell className="py-3">
                <p className="font-medium text-sm">{isRTL ? acc.name_ar : acc.name_en}</p>
                <p className="text-xs text-muted-foreground font-mono">{acc.code}</p>
              </TableCell>
              <TableCell className="text-end font-mono">
                {parseFloat(acc.balance).toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </TableCell>
            </TableRow>
          ))}
          {data.length === 0 && (
            <TableRow>
              <TableCell className="text-center py-6 text-muted-foreground italic">{accT('noActivities')}</TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  </div>
);

// --- Main Page ---

export default function ReportsPage() {
  const { isRTL } = useLanguage();
  const navT = useTranslations('navigation');
  const accT = useTranslations('Accounting');
  const commonT = useTranslations('common');
  const vatT = useTranslations('vat');

  const [selectedCase, setSelectedCase] = useState(null);
  const [selectedProject, setSelectedProject] = useState(null);
  const [selectedDept, setSelectedDept] = useState(null);

  // Data fetching
  const { data: plData } = useSWR('/accounting/reports/profit-loss', () => getProfitAndLoss());
  const { data: bsData } = useSWR('/accounting/reports/balance-sheet', () => getBalanceSheet());
  const { data: tbData } = useSWR('/accounting/reports/trial-balance', () => getTrialBalance());
  const { data: cfData } = useSWR('/accounting/reports/cash-flow-statement', () => getAccountingCashFlow());
  const { data: arData } = useSWR('/accounting/reports/aging-receivables', () => getAgingReceivables());
  const { data: apData } = useSWR('/accounting/reports/aging-payables', () => getAgingPayables());
  const { data: budgetData } = useSWR('/accounting/reports/budget-vs-actual', () => getBudgetVsActual());
  const { data: assetsData } = useSWR('/accounting/reports/assets', () => getAssetsReport());
  const { data: vatData } = useSWR('/accounting/reports/vat-return', () => getVatReturn());
  const { data: deptsData } = useSWR('/departments', () => getDepartments());

  const { data: caseSummary } = useSWR(
    selectedCase ? `/accounting/reports/case-summary/${selectedCase.id}` : null,
    () => getCaseFinancialSummary(selectedCase.id)
  );

  const { data: projectSummary } = useSWR(
    selectedProject ? `/accounting/reports/project-summary/${selectedProject.id}` : null,
    () => getProjectFinancialSummary(selectedProject.id)
  );

  const { data: deptSummary } = useSWR(
    selectedDept ? `/accounting/reports/department-summary/${selectedDept.id}` : null,
    () => getDepartmentFinancialSummary(selectedDept.id)
  );

  const formatCurrency = (val) => (val || 0).toLocaleString(undefined, { minimumFractionDigits: 2 });

  return (
    <div className="p-6 space-y-8 animate-in fade-in duration-700 print:p-0 print:space-y-4" dir={isRTL ? 'rtl' : 'ltr'}>
      <PageHeader
        title={navT('reports')}
        icon={FileBarChart}
        breadcrumbs={[
          { label: navT('dashboard'), href: '/' },
          { label: navT('finance'), href: '/finance' },
          { label: navT('reports') }
        ]}
        actions={
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => window.print()} className="gap-2">
              <Printer className="h-4 w-4" /> {commonT('print')}
            </Button>
            <Button variant="default" onClick={() => window.print()} className="gap-2">
              <Download className="h-4 w-4" /> {commonT('export')}
            </Button>
          </div>
        }
      />

      <Tabs defaultValue="pl" className="w-full" dir={isRTL ? 'rtl' : 'ltr'}>
        <TabsList className="flex w-full overflow-x-auto bg-muted/20 p-1 mb-8 rounded-xl border border-border/50 justify-start">
          <TabsTrigger value="pl" className="flex-1 gap-2 rounded-sg data-[state=active]:bg-card data-[state=active]:shadow-sm">
            <TrendingUp className="h-4 w-4" /> {accT('profitLoss')}
          </TabsTrigger>
          <TabsTrigger value="bs" className="flex-1 gap-2 rounded-sg data-[state=active]:bg-card data-[state=active]:shadow-sm">
            <Landmark className="h-4 w-4" /> {accT('balanceSheet')}
          </TabsTrigger>
          <TabsTrigger value="tb" className="flex-1 gap-2 rounded-sg data-[state=active]:bg-card data-[state=active]:shadow-sm">
            <BarChartIcon className="h-4 w-4" /> {accT('trialBalance')}
          </TabsTrigger>
          <TabsTrigger value="cf" className="flex-1 gap-2 rounded-sg data-[state=active]:bg-card data-[state=active]:shadow-sm">
            <DollarSign className="h-4 w-4" /> {accT('cashFlowStatement')}
          </TabsTrigger>
          <TabsTrigger value="budget" className="flex-1 gap-2 rounded-sg data-[state=active]:bg-card data-[state=active]:shadow-sm">
            <Target className="h-4 w-4" /> {accT('budgeting')}
          </TabsTrigger>
          <TabsTrigger value="aging" className="flex-1 gap-2 rounded-sg data-[state=active]:bg-card data-[state=active]:shadow-sm">
            <PieChartIcon className="h-4 w-4" /> {accT('aging')}
          </TabsTrigger>
          <TabsTrigger value="assets" className="flex-1 gap-2 rounded-sg data-[state=active]:bg-card data-[state=active]:shadow-sm">
            <Package className="h-4 w-4" /> {isRTL ? 'سجل الأصول' : 'Assets Register'}
          </TabsTrigger>
          <TabsTrigger value="profitability" className="flex-1 gap-2 rounded-sg data-[state=active]:bg-card data-[state=active]:shadow-sm">
            <Briefcase className="h-4 w-4" /> {accT('profitability')}
          </TabsTrigger>
          <TabsTrigger value="vat" className="flex-1 gap-2 rounded-sg data-[state=active]:bg-card data-[state=active]:shadow-sm">
            <DollarSign className="h-4 w-4" /> {vatT('reportTitle')}
          </TabsTrigger>
        </TabsList>

        {/* VAT Return Tab */}
        <TabsContent value="vat" className="space-y-6">
          {vatData?.success ? (
            <VatReturnView 
              data={vatData.data} 
              isRTL={isRTL} 
              commonT={commonT} 
              accT={accT} 
              vatT={vatT}
              formatCurrency={formatCurrency} 
            />
          ) : (
            <div className="text-center py-20">
              <Skeleton className="h-64 w-full rounded-xl" />
            </div>
          )}
        </TabsContent>

        {/* Profit & Loss */}
        <TabsContent value="pl" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <h3 className="text-lg font-bold flex items-center gap-2 px-1">
                <span className="w-1 h-5 bg-green-500 rounded-full" />
                {accT('income')}
              </h3>
              {plData ? <HierarchicalTable data={plData.data?.revenue || []} isRTL={isRTL} commonT={commonT} accT={accT} /> : <Skeleton className="h-[400px] w-full" />}
            </div>
            <div className="space-y-4">
              <h3 className="text-lg font-bold flex items-center gap-2 px-1">
                <span className="w-1 h-5 bg-red-500 rounded-full" />
                {accT('expenses')}
              </h3>
              {plData ? <HierarchicalTable data={plData.data?.expenses || []} isRTL={isRTL} commonT={commonT} accT={accT} /> : <Skeleton className="h-[400px] w-full" />}
            </div>
          </div>
          
          <Card className="border-none shadow-xl bg-gradient-to-br from-primary/10 to-primary/5 border-t-2 border-t-primary/20">
            <CardContent className="py-8 flex flex-col md:flex-row justify-between items-center gap-6">
              <div>
                <p className="text-muted-foreground text-sm uppercase tracking-wider mb-1">{accT('netProfit')}</p>
                <h2 className={cn(
                  "text-4xl font-black font-mono",
                  plData?.data?.netProfit >= 0 ? "text-green-600" : "text-red-600"
                )}>
                  {formatCurrency(plData?.data?.netProfit)} <span className="text-lg font-sans">{commonT('currencySymbol')}</span>
                </h2>
              </div>
              <div className="flex gap-4">
                <div className="text-center bg-card/50 p-4 rounded-2xl border border-border/50">
                   <p className="text-xs text-muted-foreground mb-1">{accT('totalRevenue')}</p>
                   <p className="font-bold text-green-600">{formatCurrency(plData?.data?.totalRevenue)}</p>
                </div>
                <div className="text-center bg-card/50 p-4 rounded-2xl border border-border/50">
                   <p className="text-xs text-muted-foreground mb-1">{accT('totalExpenses')}</p>
                   <p className="font-bold text-red-600">{formatCurrency(plData?.data?.totalExpenses)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Balance Sheet */}
        <TabsContent value="bs" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <h3 className="text-lg font-bold flex items-center gap-2 px-1">
                <span className="w-1 h-5 bg-blue-500 rounded-full" />
                {accT('assets')}
              </h3>
              {bsData ? <HierarchicalTable data={bsData.data?.assets || []} isRTL={isRTL} commonT={commonT} accT={accT} /> : <Skeleton className="h-[400px] w-full" />}
            </div>
            <div className="space-y-8">
              <div className="space-y-4">
                <h3 className="text-lg font-bold flex items-center gap-2 px-1">
                  <span className="w-1 h-5 bg-amber-500 rounded-full" />
                  {accT('liabilities')}
                </h3>
                {bsData ? <HierarchicalTable data={bsData.data?.liabilities || []} isRTL={isRTL} commonT={commonT} accT={accT} /> : <Skeleton className="h-[200px] w-full" />}
              </div>
              <div className="space-y-4">
                <h3 className="text-lg font-bold flex items-center gap-2 px-1">
                  <span className="w-1 h-5 bg-purple-500 rounded-full" />
                  {accT('equity')}
                </h3>
                {bsData ? <HierarchicalTable data={bsData.data?.equity || []} isRTL={isRTL} commonT={commonT} accT={accT} /> : <Skeleton className="h-[200px] w-full" />}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="bg-card/40 backdrop-blur-sm border-none shadow-md">
              <CardContent className="p-6">
                <p className="text-xs text-muted-foreground mb-1">{accT('totalAssets')}</p>
                <p className="text-2xl font-bold text-blue-600">{formatCurrency(bsData?.data?.totalAssets)} {commonT('currencySymbol')}</p>
              </CardContent>
            </Card>
            <Card className="bg-card/40 backdrop-blur-sm border-none shadow-md">
              <CardContent className="p-6">
                <p className="text-xs text-muted-foreground mb-1">{accT('totalLiabilities')}</p>
                <p className="text-2xl font-bold text-amber-600">{formatCurrency(bsData?.data?.totalLiabilities)} {commonT('currencySymbol')}</p>
              </CardContent>
            </Card>
            <Card className={cn(
              "border-none shadow-md",
              bsData?.data?.isBalanced ? "bg-green-500/10 border-s-4 border-s-green-500" : "bg-red-500/10 border-s-4 border-s-red-500"
            )}>
              <CardContent className="p-6 flex justify-between items-center">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">{accT('netEquity')}</p>
                  <p className="text-2xl font-bold">{formatCurrency(bsData?.data?.totalEquity)} {commonT('currencySymbol')}</p>
                </div>
                {bsData?.data?.isBalanced ? (
                  <CheckCircle2 className="h-8 w-8 text-green-500" />
                ) : (
                  <AlertTriangle className="h-8 w-8 text-red-500" />
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Budget vs Actual */}
        <TabsContent value="budget" className="space-y-6">
           <div className="grid grid-cols-1 gap-4">
             {budgetData?.success ? (Array.isArray(budgetData.data) ? budgetData.data : []).map((item, idx) => {
               const percentage = item.budget_amount > 0 ? (item.actual_amount / item.budget_amount) * 100 : 0;
               const isOverBudget = percentage > 100;
               return (
                 <Card key={idx} className="border-none shadow-sm hover:shadow-md transition-all bg-card/50">
                    <CardContent className="p-6 flex flex-col md:flex-row items-center gap-8">
                       <div className="w-full md:w-1/3">
                          <h4 className="font-bold text-lg">{isRTL ? item.name_ar : item.name_en}</h4>
                          <p className="text-sm text-muted-foreground">{item.code}</p>
                       </div>
                       <div className="flex-1 w-full space-y-2">
                          <div className="flex justify-between text-sm mb-1">
                             <span className="text-muted-foreground">{accT('progress')}</span>
                             <span className={cn("font-bold", isOverBudget ? "text-red-500" : "text-primary")}>{percentage.toFixed(1)}%</span>
                          </div>
                          <Progress value={Math.min(percentage, 100)} className={cn("h-3", isOverBudget ? "bg-red-100" : "bg-primary/10")} 
                                    indicatorClassName={isOverBudget ? "bg-red-500" : "bg-primary"} />
                       </div>
                       <div className="w-full md:w-1/4 grid grid-cols-2 gap-4 text-center md:text-end">
                          <div>
                             <p className="text-xs text-muted-foreground uppercase">{accT('budget')}</p>
                             <p className="font-mono font-bold">{item.budget_amount.toLocaleString()}</p>
                          </div>
                          <div>
                             <p className="text-xs text-muted-foreground uppercase">{accT('actual')}</p>
                             <p className="font-mono font-bold">{item.actual_amount.toLocaleString()}</p>
                          </div>
                       </div>
                    </CardContent>
                 </Card>
               );
             }) : <div className="text-center py-20 text-muted-foreground italic">{commonT('noData')}</div>}
           </div>
        </TabsContent>

        {/* Aging Reports */}
        <TabsContent value="aging" className="space-y-8">
          <div className="space-y-6">
             <h3 className="text-xl font-bold flex items-center gap-2">
                <ArrowDownRight className="h-6 w-6 text-green-500" />
                {accT('agedReceivables')}
             </h3>
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {arData?.success && arData.data.map((party, idx) => (
                  <AgingCard key={idx} party={party} isRTL={isRTL} commonT={commonT} />
                ))}
             </div>
          </div>

          <div className="space-y-6 pt-8 border-t border-border/50">
             <h3 className="text-xl font-bold flex items-center gap-2">
                <ArrowUpRight className="h-6 w-6 text-red-500" />
                {accT('agedPayables')}
             </h3>
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {apData?.success && apData.data.map((party, idx) => (
                  <AgingCard key={idx} party={party} isRTL={isRTL} commonT={commonT} />
                ))}
             </div>
          </div>
        </TabsContent>

        {/* Trial Balance */}
        <TabsContent value="tb" className="space-y-6">
           <Card className="border-none shadow-lg">
              <CardHeader className="text-start rtl:text-right">
                 <CardTitle>{accT('trialBalance')}</CardTitle>
                 <CardDescription>{accT('trialBalanceDescription')}</CardDescription>
              </CardHeader>
              <CardContent>
                 <div className="rounded-xl border overflow-hidden">
                    <Table>
                       <TableHeader className="bg-muted/50">
                          <TableRow>
                             <TableHead>{commonT('account')}</TableHead>
                             <TableHead className="text-end">{accT('debit')}</TableHead>
                             <TableHead className="text-end">{accT('credit')}</TableHead>
                             <TableHead className="text-end">{commonT('balance')}</TableHead>
                          </TableRow>
                       </TableHeader>
                       <TableBody>
                          {tbData?.success && Array.isArray(tbData.data) ? tbData.data.map(acc => (
                            <TableRow key={acc.account_id} className="hover:bg-muted/20">
                               <TableCell>
                                  <div className="font-medium">{isRTL ? acc.name_ar : acc.name_en}</div>
                                  <div className="text-xs text-muted-foreground font-mono">{acc.code}</div>
                               </TableCell>
                               <TableCell className="text-end font-mono">{formatCurrency(acc.total_debit)}</TableCell>
                               <TableCell className="text-end font-mono">{formatCurrency(acc.total_credit)}</TableCell>
                               <TableCell className={cn(
                                 "text-end font-bold font-mono",
                                 acc.balance > 0 ? "text-green-600" : (acc.balance < 0 ? "text-red-600" : "")
                               )}>
                                  {formatCurrency(Math.abs(acc.balance))}
                                  {acc.balance > 0 ? ` (${accT('cr')})` : (acc.balance < 0 ? ` (${accT('dr')})` : '')}
                               </TableCell>
                            </TableRow>
                          )) : <TableRow><TableCell colSpan={4} className="text-center py-10"><Skeleton className="h-20 w-full" /></TableCell></TableRow>}
                       </TableBody>
                    </Table>
                 </div>
              </CardContent>
           </Card>
        </TabsContent>

        {/* Cash Flow Statement */}
        <TabsContent value="cf" className="space-y-8">
           <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <CashFlowSection title={accT('operating')} data={cfData?.data?.operating || []} type="operating" isRTL={isRTL} accT={accT} commonT={commonT} />
              <CashFlowSection title={accT('investing')} data={cfData?.data?.investing || []} type="investing" isRTL={isRTL} accT={accT} commonT={commonT} />
              <CashFlowSection title={accT('financing')} data={cfData?.data?.financing || []} type="financing" isRTL={isRTL} accT={accT} commonT={commonT} />
           </div>

           <Card className="bg-primary/5 border-none shadow-xl">
              <CardContent className="p-8 flex flex-col md:flex-row justify-between items-center gap-8">
                 <div className="space-y-4 w-full md:w-auto">
                    <div>
                       <p className="text-sm text-muted-foreground uppercase tracking-widest">{accT('netCashFlow')}</p>
                       <h2 className="text-4xl font-black font-mono">{formatCurrency(cfData?.data?.netCashFlow)} AED</h2>
                    </div>
                    <div className="flex gap-2">
                       <Badge variant={cfData?.data?.netCashFlow >= 0 ? "success" : "destructive"}>
                          {cfData?.data?.netCashFlow >= 0 ? <TrendingUp className="h-3 w-3 me-1" /> : <TrendingUp className="h-3 w-3 me-1 rotate-180" />}
                          {cfData?.data?.netCashFlow >= 0 ? accT('positiveFlow') : accT('negativeFlow')}
                       </Badge>
                    </div>
                 </div>
                 <div className="grid grid-cols-3 gap-4 flex-1 max-w-lg w-full">
                    <div className="text-center p-4 bg-card rounded-2xl shadow-sm border border-border/50">
                       <p className="text-[10px] text-muted-foreground uppercase mb-1">{accT('operating')}</p>
                       <p className="font-bold text-blue-600">{formatCurrency(cfData?.data?.netOperating)}</p>
                    </div>
                    <div className="text-center p-4 bg-card rounded-2xl shadow-sm border border-border/50">
                       <p className="text-[10px] text-muted-foreground uppercase mb-1">{accT('investing')}</p>
                       <p className="font-bold text-amber-600">{formatCurrency(cfData?.data?.netInvesting)}</p>
                    </div>
                    <div className="text-center p-4 bg-card rounded-2xl shadow-sm border border-border/50">
                       <p className="text-[10px] text-muted-foreground uppercase mb-1">{accT('financing')}</p>
                       <p className="font-bold text-purple-600">{formatCurrency(cfData?.data?.netFinancing)}</p>
                    </div>
                 </div>
              </CardContent>
           </Card>
        </TabsContent>

         {/* Assets Register */}
        <TabsContent value="assets" className="space-y-6">
           <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold flex items-center gap-2">
                 <Package className="h-6 w-6 text-primary" />
                 {isRTL ? 'سجل الأصول الثابتة' : 'Fixed Assets Register'}
              </h3>
              <div className="flex gap-4">
                 <div className="text-end">
                    <p className="text-xs text-muted-foreground uppercase">{isRTL ? 'إجمالي التكلفة' : 'Total Cost'}</p>
                    <p className="text-lg font-bold">
                       {assetsData?.data?.reduce((sum, a) => sum + parseFloat(a.purchase_cost || 0), 0).toLocaleString()} AED
                    </p>
                 </div>
                 <div className="text-end">
                    <p className="text-xs text-muted-foreground uppercase">{isRTL ? 'القيمة الحالية' : 'Current Value'}</p>
                    <p className="text-lg font-bold text-primary">
                       {assetsData?.data?.reduce((sum, a) => sum + parseFloat(a.current_value || 0), 0).toLocaleString()} AED
                    </p>
                 </div>
              </div>
           </div>
           {assetsData ? <AssetsRegister data={assetsData.data || []} isRTL={isRTL} commonT={commonT} accT={accT} /> : <Skeleton className="h-[400px] w-full" />}
        </TabsContent>

        {/* Profitability Analysis */}
        <TabsContent value="profitability" className="space-y-12">
           <Tabs defaultValue="case-p" className="w-full" dir={isRTL ? 'rtl' : 'ltr'}>
              <TabsList className="flex w-full bg-muted/30 p-1 rounded-sg mb-8 justify-start">
                 <TabsTrigger value="case-p" className="px-8">{accT('caseProfitability')}</TabsTrigger>
                 <TabsTrigger value="dept-p" className="px-8">{accT('costCenterProfitability')}</TabsTrigger>
              </TabsList>

              <TabsContent value="case-p" className="space-y-8">
                 <div className="max-w-xl mx-auto">
                    <Card className="border-none shadow-lg bg-card/80 backdrop-blur-xl">
                       <CardHeader className="text-start">
                          <CardTitle>{accT('selectCase')}</CardTitle>
                          <CardDescription>{accT('caseProfitabilityDescription')}</CardDescription>
                       </CardHeader>
                       <CardContent>
                          <SearchableCombobox 
                             onSearch={async (term) => {
                               const res = await searchCases(term);
                               return (res.data || []).map(c => ({ value: c.id, label: `${c.case_number} - ${c.topic}`, item: c }));
                             }}
                             onSelect={(val, item) => setSelectedCase(item)}
                             placeholder={commonT('search')}
                             emptyMessage={commonT('noResults')}
                          />
                       </CardContent>
                    </Card>
                 </div>

                 {selectedCase && (
                   <ProfitabilityView title={selectedCase.topic} subtitle={`File: ${selectedCase.file_number}`} data={caseSummary?.data} accT={accT} formatCurrency={formatCurrency} isRTL={isRTL} />
                 )}
              </TabsContent>

              <TabsContent value="dept-p" className="space-y-8">
                 <div className="max-w-xl mx-auto">
                    <Card className="border-none shadow-lg bg-card/80 backdrop-blur-xl">
                       <CardHeader className="text-start rtl:text-right">
                          <CardTitle>{accT('selectDepartment')}</CardTitle>
                          <CardDescription>{accT('costCenterProfitabilityDescription')}</CardDescription>
                       </CardHeader>
                       <CardContent>
                          <SearchableCombobox 
                             options={(() => { const list = Array.isArray(deptsData) ? deptsData : Array.isArray(deptsData?.data) ? deptsData.data : []; return list.map(d => ({ value: d.id, label: isRTL ? d.name_ar : d.name_en, item: d })); })()}
                             onSelect={(val, item) => setSelectedDept(item)}
                             placeholder={commonT('search')}
                          />
                       </CardContent>
                    </Card>
                 </div>

                 {selectedDept && (
                   <ProfitabilityView title={isRTL ? selectedDept.name_ar : selectedDept.name_en} subtitle={accT('costCenterProfitabilityDescription')} data={deptSummary?.data} accT={accT} formatCurrency={formatCurrency} isRTL={isRTL} />
                 )}
               </TabsContent>
            </Tabs>
         </TabsContent>
         
      </Tabs>
    </div>
  );
}
const AssetsRegister = ({ data, isRTL, commonT, accT }) => (
  <div className="rounded-xl border border-border/50 bg-card/50 backdrop-blur-sm overflow-hidden">
    <Table>
      <TableHeader className="bg-muted/50">
        <TableRow>
          <TableHead>{isRTL ? 'الأصل' : 'Asset'}</TableHead>
          <TableHead>{isRTL ? 'الحساب' : 'Account'}</TableHead>
          <TableHead className="text-end">{isRTL ? 'تكلفة الشراء' : 'Purchase Cost'}</TableHead>
          <TableHead className="text-end">{isRTL ? 'نسبة الإهلاك' : 'Depreciation %'}</TableHead>
          <TableHead className="text-end">{isRTL ? 'القيمة الحالية' : 'Current Value'}</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map(asset => (
          <TableRow key={asset.id} className="hover:bg-muted/30 transition-colors">
            <TableCell>
              <p className="font-medium">{asset.name}</p>
              <p className="text-xs text-muted-foreground">{asset.type}</p>
            </TableCell>
            <TableCell>
              {asset.account_id ? (
                <div>
                  <p className="text-sm">{isRTL ? asset.account_name_ar : asset.account_name_en}</p>
                  <p className="text-xs text-muted-foreground font-mono">{asset.account_code}</p>
                </div>
              ) : (
                <span className="text-muted-foreground italic text-xs">{isRTL ? 'غير مربوط' : 'Not linked'}</span>
              )}
            </TableCell>
            <TableCell className="text-end font-mono">
              {asset.purchase_cost?.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </TableCell>
            <TableCell className="text-end font-mono">
              {asset.depreciation_rate}%
            </TableCell>
            <TableCell className="text-end font-mono font-bold text-primary">
              {asset.current_value?.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </TableCell>
          </TableRow>
        ))}
        {data.length === 0 && (
          <TableRow>
            <TableCell colSpan={5} className="text-center py-10 text-muted-foreground italic">
              {commonT('noData')}
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  </div>
);

const ProfitabilityView = ({ title, subtitle, data, accT, formatCurrency, isRTL }) => (
  <div className="animate-in slide-in-from-bottom-4 duration-500 space-y-6">
     <Card className="border-primary/20 shadow-xl overflow-hidden">
        <CardHeader className="bg-primary/5 text-start rtl:text-right">
           <CardTitle className="text-2xl">{title}</CardTitle>
           <CardDescription>{subtitle}</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
           <div className={cn(
             "grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x border-b",
             isRTL && "md:divide-x-reverse"
           )}>
              <div className="p-8 text-center group transition-colors hover:bg-green-50/30">
                 <p className="text-sm text-muted-foreground uppercase mb-2">{accT('income')}</p>
                 <p className="text-3xl font-black text-green-600 font-mono">{formatCurrency(data?.income)}</p>
              </div>
              <div className="p-8 text-center group transition-colors hover:bg-red-50/30">
                 <p className="text-sm text-muted-foreground uppercase mb-2">{accT('expenses')}</p>
                 <p className="text-3xl font-black text-red-600 font-mono">{formatCurrency(data?.expense)}</p>
              </div>
              <div className="p-8 text-center group transition-colors hover:bg-primary/5">
                 <p className="text-sm text-muted-foreground uppercase mb-2">{accT('netProfit')}</p>
                 <p className={cn(
                   "text-3xl font-black font-mono",
                   data?.profit >= 0 ? "text-primary" : "text-red-500"
                 )}>{formatCurrency(data?.profit)}</p>
              </div>
           </div>
           
           <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-8 bg-muted/20">
              <div className="space-y-4">
                 <h4 className="font-bold flex items-center gap-2"><DollarSign className="h-4 w-4" /> {accT('outstandingBalance')}</h4>
                 <div className="grid grid-cols-2 gap-4">
                    <div className="bg-card p-4 rounded-xl border border-border/50">
                       <p className="text-xs text-muted-foreground mb-1">{accT('receivable')}</p>
                       <p className="text-xl font-bold text-blue-600">{formatCurrency(data?.receivable)}</p>
                    </div>
                    <div className="bg-card p-4 rounded-xl border border-border/50">
                       <p className="text-xs text-muted-foreground mb-1">{accT('payable')}</p>
                       <p className="text-xl font-bold text-amber-600">{formatCurrency(data?.payable)}</p>
                    </div>
                 </div>
              </div>
              <div className="flex flex-col justify-center items-center p-4 border-2 border-dashed border-border/50 rounded-2xl">
                 <p className="text-muted-foreground text-center text-sm">
                    {data?.profit >= 0 ? accT('profitableMessage') : accT('lossMessage')}
                 </p>
              </div>
           </div>
        </CardContent>
     </Card>
  </div>
);

const VatReturnView = ({ data, isRTL, commonT, accT, vatT, formatCurrency }) => (
  <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
      <div>
        <h3 className="text-2xl font-black">{vatT('reportTitle')}</h3>
        <p className="text-muted-foreground">{vatT('reportSubtitle')}</p>
      </div>
      <Badge variant="outline" className="px-4 py-2 border-primary/20 bg-primary/5">
        {vatT('taxPeriod')}: {data?.reportingPeriod?.start_date || 'N/A'} - {data?.reportingPeriod?.end_date || 'N/A'}
      </Badge>
    </div>

    {/* Output Tax Section */}
    <div className="space-y-4">
      <div className="bg-primary/5 p-4 rounded-xl border-s-4 border-s-primary">
        <h4 className="font-bold text-lg">{vatT('outputTax')}</h4>
      </div>
      <div className="rounded-xl border overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead>{vatT('descriptionEmirates')}</TableHead>
              <TableHead className="text-end">{vatT('taxableAmount')}</TableHead>
              <TableHead className="text-end">{vatT('vatAmount')}</TableHead>
              <TableHead className="text-end">{vatT('adjustments')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data?.outputTax?.standardRatedSupplies?.map((row, i) => (
              <TableRow key={i}>
                <TableCell className="font-medium">{row.emirate}</TableCell>
                <TableCell className="text-end font-mono">{formatCurrency(row.amount)}</TableCell>
                <TableCell className="text-end font-mono">{formatCurrency(row.vat_amount)}</TableCell>
                <TableCell className="text-end font-mono">0.00</TableCell>
              </TableRow>
            ))}
            <TableRow className="bg-muted/20">
              <TableCell className="font-bold">{vatT('zeroRatedSupplies')}</TableCell>
              <TableCell className="text-end font-mono">{formatCurrency(data?.outputTax?.zeroRatedSupplies)}</TableCell>
              <TableCell className="text-end font-mono">0.00</TableCell>
              <TableCell className="text-end font-mono">-</TableCell>
            </TableRow>
            <TableRow className="bg-muted/20">
              <TableCell className="font-bold">{vatT('exemptSupplies')}</TableCell>
              <TableCell className="text-end font-mono">{formatCurrency(data?.outputTax?.exemptSupplies)}</TableCell>
              <TableCell className="text-end font-mono">0.00</TableCell>
              <TableCell className="text-end font-mono">-</TableCell>
            </TableRow>
            <TableRow className="bg-primary/10 font-black">
              <TableCell>{vatT('totalOutputTax')}</TableCell>
              <TableCell className="text-end font-mono">{formatCurrency(data?.outputTax?.totalOutputAmount)}</TableCell>
              <TableCell className="text-end font-mono text-primary">{formatCurrency(data?.outputTax?.totalOutputVat)}</TableCell>
              <TableCell className="text-end font-mono">0.00</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    </div>

    {/* Input Tax Section */}
    <div className="space-y-4">
      <div className="bg-red-500/5 p-4 rounded-xl border-s-4 border-s-red-500">
        <h4 className="font-bold text-lg">{vatT('inputTax')}</h4>
      </div>
      <div className="rounded-xl border overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead>{vatT('description')}</TableHead>
              <TableHead className="text-end">{vatT('taxableAmount')}</TableHead>
              <TableHead className="text-end">{vatT('recoverableVat')}</TableHead>
              <TableHead className="text-end">{vatT('adjustments')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell className="font-medium">{vatT('standardRatedExpenses')}</TableCell>
              <TableCell className="text-end font-mono">{formatCurrency(data?.inputTax?.standardRatedExpenses)}</TableCell>
              <TableCell className="text-end font-mono">{formatCurrency(data?.inputTax?.recoverableVat)}</TableCell>
              <TableCell className="text-end font-mono">0.00</TableCell>
            </TableRow>
            <TableRow className="bg-red-500/10 font-black">
              <TableCell>{vatT('totalInputTax')}</TableCell>
              <TableCell className="text-end font-mono">{formatCurrency(data?.inputTax?.standardRatedExpenses)}</TableCell>
              <TableCell className="text-end font-mono text-red-600">{formatCurrency(data?.inputTax?.recoverableVat)}</TableCell>
              <TableCell className="text-end font-mono">0.00</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    </div>

    {/* Summary Section */}
    <Card className="bg-primary/5 border-none shadow-2xl">
      <CardContent className="p-10 flex flex-col md:flex-row justify-between items-center gap-8">
        <div className="space-y-2 text-center md:text-start">
          <p className="text-sm text-muted-foreground uppercase tracking-widest">{vatT('netVatPayable')}</p>
          <h2 className={cn(
            "text-5xl font-black font-mono",
            data?.netVat >= 0 ? "text-primary" : "text-green-600"
          )}>
            {formatCurrency(Math.abs(data?.netVat || 0))} <span className="text-xl font-sans">{commonT('currencySymbol')}</span>
          </h2>
          <p className="text-xs italic text-muted-foreground">
            {data?.netVat >= 0 ? vatT('payableToFta') : vatT('creditBalance')}
          </p>
        </div>
        <div className="flex gap-4">
           <Button className="h-12 px-8 rounded-full shadow-lg hover:shadow-primary/20 transition-all gap-2">
              <Download className="h-5 w-5" /> {vatT('downloadDeclaration')}
           </Button>
        </div>
      </CardContent>
    </Card>
  </div>
);

