'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useTranslations } from '@/hooks/useTranslations';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend
} from 'recharts';
import { TrendingUp, TrendingDown, DollarSign, Download, RefreshCcw } from 'lucide-react';
import { accountingService } from '@/app/services/api/accounting';
import { toast } from 'react-toastify';
import PageHeader from '@/components/PageHeader';
import { exportCashFlowCsv, fetchLatestCashFlow } from './cashFlowLogic';
import { DEFAULT_CURRENCY, LOCALE } from '@/app/finance/constants';

const PERIOD_OPTIONS = ['monthly', 'quarterly', 'yearly'];

export default function CashFlowPage() {
  const { language } = useLanguage();
  const t = useTranslations('Accounting');
  const commonT = useTranslations('common');
  const navT = useTranslations('navigation');
  const { t: tRaw } = useTranslations();
  
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('monthly'); // monthly, quarterly, yearly
  const latestRequestRef = useRef(0);

  const fetchCashFlow = useCallback(async (selectedPeriod) => {
    await fetchLatestCashFlow({
      selectedPeriod,
      latestRequestRef,
      getCashFlow: accountingService.getCashFlow,
      setData,
      setLoading,
      onError: () => toast.error(commonT('errorLoading')),
    });
  }, [commonT]);

  useEffect(() => {
    fetchCashFlow(period);
  }, [period, fetchCashFlow]);

  const formatCurrency = (val) => {
    return new Intl.NumberFormat(language === 'ar' ? LOCALE.ar : LOCALE.en, {
      style: 'currency',
      currency: DEFAULT_CURRENCY
    }).format(val);
  };

  const handleExport = () => {
    if (!data) {
      toast.error(commonT('errorLoading'));
      return;
    }

    try {
      exportCashFlowCsv({ data, period, t: tRaw });
    } catch {
      toast.error(commonT('errorLoading'));
    }
  };

  if (loading && !data) {
    return (
      <div className="flex items-center justify-center h-full">
        <RefreshCcw className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <PageHeader
        title={t('cashFlow')}
        icon={TrendingUp}
        breadcrumbs={[
          { label: navT('dashboard'), href: '/' },
          { label: navT('finance') },
          { label: navT('cashFlow') }
        ]}
      />

      <div className="flex justify-between items-center">
        <div className="flex bg-muted p-1 rounded-lg">
          {PERIOD_OPTIONS.map((p) => (
            <Button
              key={p}
              variant={period === p ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setPeriod(p)}
              className="capitalize"
            >
              {t(p)}
            </Button>
          ))}
        </div>
        <Button variant="outline" size="sm" onClick={handleExport} disabled={!data}>
          <Download className="mr-2 h-4 w-4" />
          {commonT('export')}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">{t('totalInflow')}</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(data?.summary?.inflow || 0)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">{t('totalOutflow')}</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {formatCurrency(data?.summary?.outflow || 0)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">{t('netCashFlow')}</CardTitle>
            <DollarSign className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${(data?.summary?.net || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(data?.summary?.net || 0)}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t('cashFlowTrend')}</CardTitle>
          <CardDescription>{t('cashFlowDescription')}</CardDescription>
        </CardHeader>
        <CardContent className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data?.chartData || []}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" />
              <YAxis tickFormatter={(val) => formatCurrency(val)} />
              <Tooltip 
                formatter={(val) => formatCurrency(val)}
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
              />
              <Legend />
              <Bar dataKey="inflow" fill="#22c55e" radius={[4, 4, 0, 0]} name={t('inflow')} />
              <Bar dataKey="outflow" fill="#ef4444" radius={[4, 4, 0, 0]} name={t('outflow')} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
