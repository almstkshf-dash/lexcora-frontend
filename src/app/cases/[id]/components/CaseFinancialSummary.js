'use client';

import React from 'react';
import useSWR from 'swr';
import { useTranslations } from '@/hooks/useTranslations';
import { useLanguage } from '@/contexts/LanguageContext';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getCaseFinancialSummary } from '@/app/services/api/accounting';
import { Wallet, ArrowDownCircle, ArrowUpCircle, Scale } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function CaseFinancialSummary({ caseId }) {
  const { isRTL } = useLanguage();
  const accT = useTranslations('Accounting');
  const commonT = useTranslations('common');

  const { data, error, isLoading } = useSWR(
    caseId ? `/accounting/case-summary/${caseId}` : null,
    () => getCaseFinancialSummary(caseId)
  );

  if (isLoading) return <div className="animate-pulse h-32 bg-muted rounded-lg" />;
  if (error || !data?.success) return null;

  const summary = data.data;

  return (
    <div className="space-y-6 print:space-y-4 print-avoid-break">
      <h2 className="text-2xl font-bold text-gray-900 border-b border-gray-200 pb-2 print:text-xl">
        {accT('caseFinancialSummary')}
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 print:gap-2">
        <Card className="border-none shadow-sm bg-blue-50/50">
          <CardContent className="pt-6 flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-600 font-medium">{commonT('totalCredits') || 'Total Deposits'}</p>
              <p className="text-2xl font-bold font-mono">{summary.total_deposits?.toLocaleString()}</p>
            </div>
            <ArrowDownCircle className="h-8 w-8 text-blue-500 opacity-20" />
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm bg-red-50/50">
          <CardContent className="pt-6 flex items-center justify-between">
            <div>
              <p className="text-sm text-red-600 font-medium">{commonT('totalDebits') || 'Total Expenses'}</p>
              <p className="text-2xl font-bold font-mono">{summary.total_expenses?.toLocaleString()}</p>
            </div>
            <ArrowUpCircle className="h-8 w-8 text-red-500 opacity-20" />
          </CardContent>
        </Card>

        <Card className={cn("border-none shadow-sm", summary.balance >= 0 ? "bg-green-50/50" : "bg-amber-50/50")}>
          <CardContent className="pt-6 flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground font-medium">{commonT('balance')}</p>
              <p className={cn("text-2xl font-bold font-mono", summary.balance >= 0 ? "text-green-600" : "text-amber-600")}>
                {summary.balance?.toLocaleString()}
              </p>
            </div>
            <Wallet className="h-8 w-8 text-muted-foreground opacity-20" />
          </CardContent>
        </Card>
      </div>

      <div className="border border-gray-200 rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50">
              <TableHead className={isRTL ? 'text-right' : 'text-left'}>{commonT('description')}</TableHead>
              <TableHead className="text-right">{commonT('amount')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
             {/* We can list top 5 recent transactions here if backend provided them */}
             <TableRow>
                <TableCell className="font-medium text-blue-600">Total Invoiced (Fees)</TableCell>
                <TableCell className="text-right font-mono">{summary.total_invoiced?.toLocaleString()}</TableCell>
             </TableRow>
             <TableRow>
                <TableCell className="font-medium text-muted-foreground">Outstanding Invoices</TableCell>
                <TableCell className="text-right font-mono text-red-600">{summary.outstanding_invoices?.toLocaleString()}</TableCell>
             </TableRow>
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
