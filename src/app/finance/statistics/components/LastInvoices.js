'use client';

import React from 'react';
import useSWR from 'swr';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTranslations } from '@/hooks/useTranslations';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FileText, Loader2, Eye } from 'lucide-react';
import { getAllInvoices } from '@/app/services/api/invoices';
import { DEFAULT_CURRENCY, LOCALE, STATS_REFRESH_INTERVAL } from '@/app/finance/constants';

const LastInvoices = () => {
  const { isRTL } = useLanguage();
  const t = useTranslations('financeStatistics');
  
  const { data: invoicesData, isLoading } = useSWR(
    '/invoices-recent',
    getAllInvoices,
    { refreshInterval: STATS_REFRESH_INTERVAL }
  );

  const invoices = React.useMemo(() => {
    if (!invoicesData?.success || !Array.isArray(invoicesData?.data)) return [];
    // Get last 5 invoices
    return [...invoicesData.data]
      .sort((a, b) => new Date(b.invoice_date) - new Date(a.invoice_date))
      .slice(0, 5);
  }, [invoicesData]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat(LOCALE.ar, {
      style: 'currency',
      currency: DEFAULT_CURRENCY
    }).format(amount || 0);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString(LOCALE.ar, {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      paid: { label: t('paid'), variant: 'default', color: 'bg-green-100 text-green-700' },
      pending: { label: t('pending'), variant: 'secondary', color: 'bg-yellow-100 text-yellow-700' },
      cancelled: { label: t('cancelled'), variant: 'destructive', color: 'bg-red-100 text-red-700' },
    };
    
    const statusInfo = statusMap[status] || statusMap.pending;
    return (
      <span className={`px-2 py-1 text-xs rounded-full ${statusInfo.color}`}>
        {statusInfo.label}
      </span>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-start">
          {t('recentInvoices')}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center items-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          </div>
        ) : invoices.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            {t('noInvoicesFound')}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="py-3 px-2 text-sm font-medium text-start">
                    {t('invoiceNumber')}
                  </th>
                  <th className="py-3 px-2 text-sm font-medium text-start">
                    {t('client')}
                  </th>
                  <th className="py-3 px-2 text-sm font-medium text-start">
                    {t('date')}
                  </th>
                  <th className="py-3 px-2 text-sm font-medium text-start">
                    {t('amount')}
                  </th>
                  <th className="py-3 px-2 text-sm font-medium text-start">
                    {t('status')}
                  </th>
                </tr>
              </thead>
              <tbody>
                {Array.isArray(invoices) && invoices.map((invoice) => (
                  <tr 
                    key={invoice.id}
                    className="border-b hover:bg-gray-50 transition-colors"
                  >
                    <td className="py-3 px-2 text-start">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-blue-600" />
                        <span className="font-medium text-sm">
                          {invoice.invoice_number || `INV-${invoice.id}`}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-2 text-sm text-start">
                      {invoice.client_name || '-'}
                    </td>
                    <td className="py-3 px-2 text-sm text-gray-600 text-start">
                      {formatDate(invoice.invoice_date)}
                    </td>
                    <td className="py-3 px-2 text-start">
                      <span className="font-semibold text-blue-600">
                        {formatCurrency(invoice.amount)}
                      </span>
                    </td>
                    <td className="py-3 px-2 text-start">
                      {getStatusBadge(invoice.status)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default LastInvoices;
