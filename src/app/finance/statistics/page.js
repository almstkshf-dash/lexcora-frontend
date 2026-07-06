'use client';

import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTranslations } from '@/hooks/useTranslations';
import BankAccountsOverview from './components/BankAccountsOverview';
import LastInvoices from './components/LastInvoices';
import Transactions from './components/Transactions';
import PageHeader from '@/components/PageHeader';
import { BarChart3, Printer, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';

const FinanceStatisticsPage = () => {
  const { isRTL } = useLanguage();
  const t = useTranslations('financeStatistics');
  const navT = useTranslations('navigation');
  const commonT = useTranslations('common');

  return (
    <div className="container mx-auto py-6 space-y-6 print-container" dir={isRTL ? 'rtl' : 'ltr'}>
      <PageHeader
        title={t('title')}
        description={t('description')}
        icon={BarChart3}
        breadcrumbs={[
          { label: navT('dashboard'), href: '/' },
          { label: navT('finance') },
          { label: navT('statistics') }
        ]}
        actions={
          <div className="flex gap-2 print-hide">
            <Button variant="outline" onClick={() => window.print()} className="gap-2">
              <Printer className="h-4 w-4" /> {commonT('print')}
            </Button>
            <Button variant="default" onClick={() => window.print()} className="gap-2">
              <Download className="h-4 w-4" /> {commonT('export')}
            </Button>
          </div>
        }
      />

      <div className="grid grid-cols-1 gap-6">
        <Transactions />
        <BankAccountsOverview />
        <LastInvoices />
      </div>
    </div>
  );
};

export default FinanceStatisticsPage;
