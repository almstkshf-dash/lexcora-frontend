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

const PERIOD_OPTIONS = ['monthly', 'quarterly', 'yearly'];

export default function CashFlowPage() {
  const { language } = useLanguage();
  const t = useTranslations('Accounting');
  const commonT = useTranslations('common');
  const navT = useTranslations('navigation');
  
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('monthly'); // monthly, quarterly, yearly
  const latestRequestRef = useRef(0);

  const fetchCashFlow = useCallback(async (selectedPeriod) => {
    const requestId = ++latestRequestRef.current;

    try {
      setLoading(true);
      const result = await accountingService.getCashFlow(selectedPeriod);

      if (requestId === latestRequestRef.current) {
        setData(result);
      }
    } catch {
      if (requestId === latestRequestRef.current) {
        toast.error(commonT('errorLoading'));
      }
    } finally {
      if (requestId === latestRequestRef.current) {
        setLoading(false);
      }
    }
  }, [commonT]);

  useEffect(() => {
    fetchCashFlow(period);
  }, [period, fetchCashFlow]);

  const formatCurrency = (val) => {
    return new Intl.NumberFormat(language === 'ar' ? 'ar-AE' : 'en-US', {
      style: 'currency',
      currency: 'AED'
    }).format(val);
  };

  const handleExport = () => {
    if (!data) {
      toast.error(commonT('errorLoading'));
      return;
    }

    try {
      const escapeCsvValue = (value) => {
        const stringValue = String(value ?? '');
        if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
          return `"${stringValue.replace(/"/g, '""')}"`;
        }

        return stringValue;
      };

      const summary = data?.summary || {};
      const chartData = data?.chartData || [];

      const summaryRows = [
        ['metric', 'value'],
        ['period', period],
        ['inflow', summary.inflow ?? 0],
        ['outflow', summary.outflow ?? 0],
        ['net', summary.net ?? 0],
      ];

      const trendRows = [
        ['name', 'inflow', 'outflow'],
        ...chartData.map((item) => [
          item?.name ?? '',
          item?.inflow ?? 0,
          item?.outflow ?? 0,
        ]),
      ];

      const csvContent = [
        ...summaryRows.map((row) => row.map(escapeCsvValue).join(',')),
        '',
        ...trendRows.map((row) => row.map(escapeCsvValue).join(',')),
      ].join('\n');

      const blob = new Blob([`\uFEFF${csvContent}`], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      const date = new Date().toISOString().split('T')[0];
      link.href = url;
      link.setAttribute('download', `cash_flow_${period}_${date}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
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
