'use client';

import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTranslations } from '@/hooks/useTranslations';
import BankAccountsOverview from './components/BankAccountsOverview';
import LastInvoices from './components/LastInvoices';
import Transactions from './components/Transactions';
import PageHeader from '@/components/PageHeader';
import { BarChart3 } from 'lucide-react';

const FinanceStatisticsPage = () => {
  const { isRTL } = useLanguage();
  const t = useTranslations('financeStatistics');
  const navT = useTranslations('navigation');

  return (
    <div className="container mx-auto py-6 space-y-6">
      <PageHeader
        title={t('title')}
        description={t('description')}
        icon={BarChart3}
        breadcrumbs={[
          { label: navT('dashboard'), href: '/' },
          { label: navT('finance') },
          { label: navT('statistics') }
        ]}
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
