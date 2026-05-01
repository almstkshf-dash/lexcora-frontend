'use client';

import useSWR from 'swr';
import { useTranslations } from '@/hooks/useTranslations';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { FileText } from 'lucide-react';
import PageHeader from '@/components/PageHeader';
import { getLedgerEntries } from '@/app/services/api/ledger';
import { LOCALE } from '@/app/finance/constants';

export default function LedgerPage() {
  const { isRTL } = useLanguage();
  const navT = useTranslations('navigation');
  const commonT = useTranslations('common');

  const { data, error } = useSWR('/ledger', getLedgerEntries);
  const ledgerEntries = data?.data || [];
  const loading = !data && !error;

  const formatDate = (value) => {
    if (!value) return '-';
    return new Date(value).toLocaleDateString(isRTL ? LOCALE.ar : LOCALE.en);
  };

  const renderStatus = (status) => {
    if (!status) return <Badge>{commonT('noData')}</Badge>;
    return (
      <Badge variant="secondary" className="capitalize">
        {status}
      </Badge>
    );
  };

  return (
    <div className="p-6" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="max-w-7xl mx-auto space-y-6">
        <PageHeader
          title={navT('ledger')}
          icon={FileText}
          breadcrumbs={[
            { label: navT('dashboard'), href: '/' },
            { label: navT('finance') },
            { label: navT('ledger') }
          ]}
        />

        <Card>
          <CardHeader>
            <CardTitle>{navT('ledger')}</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center p-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-white"></div>
                <span className="ms-3">{commonT('loading')}</span>
              </div>
            ) : ledgerEntries.length === 0 ? (
              <div className="text-center p-8">
                <p className="mb-4">{commonT('noData')}</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{commonT('date')}</TableHead>
                      <TableHead>{commonT('description')}</TableHead>
                      <TableHead>{commonT('currency')}</TableHead>
                      <TableHead>{navT('bankAccounts')}</TableHead>
                      <TableHead>{commonT('createdBy')}</TableHead>
                      <TableHead>{commonT('status')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {ledgerEntries.map((entry) => (
                      <TableRow key={entry.id}>
                        <TableCell>{formatDate(entry.entry_date)}</TableCell>
                        <TableCell>{entry.description || entry.reference_number || '-'}</TableCell>
                        <TableCell>{entry.currency_name || '-'}</TableCell>
                        <TableCell>{entry.branch_name || '-'}</TableCell>
                        <TableCell>{entry.creator_name || '-'}</TableCell>
                        <TableCell>{renderStatus(entry.status)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
