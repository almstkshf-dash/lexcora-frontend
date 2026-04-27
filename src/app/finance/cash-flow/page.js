'use client';

import React, { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  Legend, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Calendar, 
  Filter,
  ArrowUpRight,
  ArrowDownRight,
  Wallet
} from 'lucide-react';
import { bankAccountsService } from '@/app/services/api/bankAccounts';
import { toast } from 'react-hot-toast';

const COLORS = ['#10b981', '#ef4444', '#f59e0b', '#3b82f6', '#8b5cf6'];

export default function CashFlowPage() {
  const t = useTranslations('CashFlow');
  const commonT = useTranslations('common');
  
  const [data, setData] = useState({
    summary: { totalInflow: 0, totalOutflow: 0, netCashFlow: 0 },
    dailyTrend: [],
    sourceDistribution: []
  });
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('30d');

  useEffect(() => {
    fetchCashFlowData();
  }, [period]);

  const fetchCashFlowData = async () => {
    try {
      setLoading(true);
      const res = await bankAccountsService.getCashFlowData({ period });
      setData(res);
    } catch (error) {
      toast.error(commonT('errorLoading'));
    } finally {
      setLoading(false);
    }
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border rounded-lg p-3 shadow-lg">
          <p className="font-semibold mb-2">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} style={{ color: entry.color }} className="text-sm">
              {entry.name}: {entry.value.toLocaleString()} AED
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t('title')}</h1>
          <p className="text-muted-foreground">{commonT('today')}: {new Date().toLocaleDateString()}</p>
        </div>
        <div className="flex gap-2">
          <Button variant={period === '7d' ? 'default' : 'outline'} size="sm" onClick={() => setPeriod('7d')}>7 Days</Button>
          <Button variant={period === '30d' ? 'default' : 'outline'} size="sm" onClick={() => setPeriod('30d')}>30 Days</Button>
          <Button variant={period === '90d' ? 'default' : 'outline'} size="sm" onClick={() => setPeriod('90d')}>90 Days</Button>
          <Button variant="outline" size="sm">
            <Filter className="mr-2 h-4 w-4" />
            {commonT('clearFilters')}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <Card className="relative overflow-hidden border-none bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/20 dark:to-green-900/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-green-600 dark:text-green-400 uppercase tracking-wider">{t('totalInflow')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-700 dark:text-green-300">
              {data.summary.totalInflow.toLocaleString()} 
              <span className="text-sm font-normal ml-1">AED</span>
            </div>
            <div className="flex items-center text-xs text-green-600 mt-2">
              <TrendingUp className="h-3 w-3 mr-1" />
              <span>+12.5% vs last period</span>
            </div>
            <ArrowUpRight className="absolute top-4 right-4 h-8 w-8 text-green-500/20" />
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden border-none bg-gradient-to-br from-red-50 to-red-100 dark:from-red-950/20 dark:to-red-900/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-red-600 dark:text-red-400 uppercase tracking-wider">{t('totalOutflow')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-700 dark:text-red-300">
              {data.summary.totalOutflow.toLocaleString()}
              <span className="text-sm font-normal ml-1">AED</span>
            </div>
            <div className="flex items-center text-xs text-red-600 mt-2">
              <TrendingDown className="h-3 w-3 mr-1" />
              <span>+5.2% vs last period</span>
            </div>
            <ArrowDownRight className="absolute top-4 right-4 h-8 w-8 text-red-500/20" />
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden border-none bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/20 dark:to-blue-900/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-blue-600 dark:text-blue-400 uppercase tracking-wider">{t('netCashFlow')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-3xl font-bold ${data.summary.netCashFlow >= 0 ? 'text-blue-700 dark:text-blue-300' : 'text-orange-700 dark:text-orange-300'}`}>
              {data.summary.netCashFlow.toLocaleString()}
              <span className="text-sm font-normal ml-1">AED</span>
            </div>
            <div className="flex items-center text-xs text-blue-600 mt-2">
              <Wallet className="h-3 w-3 mr-1" />
              <span>Available Liquidity</span>
            </div>
            <DollarSign className="absolute top-4 right-4 h-8 w-8 text-blue-500/20" />
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>{t('dailyTrend')}</CardTitle>
            <CardDescription>Visualizing inflows and outflows over time</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.dailyTrend}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
                  <XAxis dataKey="date" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `${val/1000}k`} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend verticalAlign="top" align="right" iconType="circle" />
                  <Bar name="Inflow" dataKey="inflow" fill="#10b981" radius={[4, 4, 0, 0]} />
                  <Bar name="Outflow" dataKey="outflow" fill="#ef4444" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t('cashBySource')}</CardTitle>
            <CardDescription>Distribution of cash movements by category</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col sm:flex-row items-center justify-center">
            <div className="h-[300px] w-full sm:w-1/2">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data.sourceDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {data.sourceDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="w-full sm:w-1/2 space-y-4">
              {data.sourceDistribution.map((entry, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                    <span className="text-sm font-medium">{entry.name}</span>
                  </div>
                  <span className="text-sm text-muted-foreground">{entry.value.toLocaleString()} AED</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Net Cumulative Flow</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.dailyTrend}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
                <XAxis dataKey="date" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Line 
                  type="monotone" 
                  dataKey="balance" 
                  stroke="#3b82f6" 
                  strokeWidth={2} 
                  dot={false}
                  activeDot={{ r: 6 }} 
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
