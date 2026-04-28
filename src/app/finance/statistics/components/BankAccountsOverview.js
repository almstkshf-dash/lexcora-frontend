'use client';

import React from 'react';
import useSWR from 'swr';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Building2, Loader2, TrendingUp, TrendingDown } from 'lucide-react';
import { getAllBankAccounts } from '@/app/services/api/bankAccounts';

const BankAccountsOverview = () => {
  const { isRTL, language } = useLanguage();
  
  const { data: accountsData, isLoading } = useSWR(
    '/bank-accounts-stats',
    getAllBankAccounts,
    { refreshInterval: 300000 }
  );

  const accounts = React.useMemo(() => {
    if (!accountsData?.success || !accountsData?.data) return [];
    return accountsData.data;
  }, [accountsData]);

  const totalBalance = React.useMemo(() => {
    return accounts.reduce((sum, acc) => sum + (parseFloat(acc.current_balance) || 0), 0);
  }, [accounts]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('ar-AE', {
      style: 'currency',
      currency: 'AED'
    }).format(amount || 0);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className={isRTL ? 'text-right' : 'text-left'}>
          {t('bankAccountsOverview')}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center items-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          </div>
        ) : accounts.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            {t('noBankAccounts')}
          </div>
        ) : (
          <>
            {/* Total Balance Card */}
            <div className="mb-6 p-6 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg text-white">
              <div className={isRTL ? 'text-right' : 'text-left'}>
                <p className="text-sm opacity-90 mb-2">
                  {t('totalBalance')}
                </p>
                <p className="text-3xl font-bold">
                  {formatCurrency(totalBalance)}
                </p>
                <p className="text-sm opacity-75 mt-2">
                  {accounts.length} {t('accountsCount')}
                </p>
              </div>
            </div>

            {/* Accounts Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {accounts.map((account) => (
                <div
                  key={account.id}
                  className="p-4 border rounded-lg hover:shadow-md transition-shadow"
                >
                  <div className={`flex items-start justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
                    <div className={`flex items-start gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
                      <div className="p-2 rounded-full bg-blue-100">
                        <Building2 className="h-5 w-5 text-blue-600" />
                      </div>
                      <div className={isRTL ? 'text-right' : 'text-left'}>
                        <p className="font-semibold">{account.bank_name}</p>
                        <p className="text-sm text-gray-500" dir="ltr">
                          {account.account_number}
                        </p>
                        {account.iban && (
                          <p className="text-xs text-gray-400 mt-1" dir="ltr">
                            {account.iban}
                          </p>
                        )}
                      </div>
                    </div>
                    <Badge 
                      variant={account.status === 'active' ? 'default' : 'secondary'}
                      className="mt-1"
                    >
                      {account.status === 'active' 
                        ? t('active')
                        : t('inactive')}
                    </Badge>
                  </div>
                  
                  <div className={`mt-4 pt-4 border-t ${isRTL ? 'text-right' : 'text-left'}`}>
                    <p className="text-sm text-gray-500 mb-1">
                      {t('currentBalance')}
                    </p>
                    <p className="text-xl font-bold text-blue-600">
                      {formatCurrency(account.current_balance)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default BankAccountsOverview;
