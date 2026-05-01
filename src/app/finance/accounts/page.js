'use client';

import { useState } from 'react';
import useSWR from 'swr';
import { useTranslations } from '@/hooks/useTranslations';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronRight, ListTree, Plus, FileText, Check, X } from 'lucide-react';
import PageHeader from '@/components/PageHeader';
import { getAccountsTree } from '@/app/services/api/accounting';
import { cn } from '@/lib/utils';

const AccountRow = ({ account, level = 0 }) => {
  const [isOpen, setIsOpen] = useState(level === 0); // Root levels open by default
  const { isRTL } = useLanguage();
  const accT = useTranslations('Accounting');
  const commonT = useTranslations('common');
  
  const hasChildren = account.children && account.children.length > 0;

  return (
    <>
      <TableRow className={cn(level > 0 ? "bg-muted/30" : "font-semibold")}>
        <TableCell className="py-2">
          <div className="flex items-center" style={{ [isRTL ? 'marginRight' : 'marginLeft']: `${level * 24}px` }}>
            {hasChildren ? (
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-6 w-6 p-0 hover:bg-transparent" 
                onClick={() => setIsOpen(!isOpen)}
              >
                {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className={cn("h-4 w-4", isRTL && "rotate-180")} />}
              </Button>
            ) : (
              <div className="w-6" />
            )}
            <span className="mx-2 font-mono text-xs text-muted-foreground">{account.code}</span>
            <span>{isRTL ? account.name_ar : account.name_en}</span>
          </div>
        </TableCell>
        <TableCell className="capitalize">{account.type}</TableCell>
        <TableCell>
          {account.is_reconcilable ? (
            <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50">
              <Check className="h-3 w-3 me-1" /> {accT('reconcilable')}
            </Badge>
          ) : (
            <span className="text-muted-foreground">-</span>
          )}
        </TableCell>
        <TableCell>
          {account.allow_manual_posting ? (
            <Badge variant="outline" className="text-blue-600 border-blue-200 bg-blue-50">
              <Check className="h-3 w-3 me-1" /> {accT('allowManualPosting')}
            </Badge>
          ) : (
            <Badge variant="outline" className="text-amber-600 border-amber-200 bg-amber-50">
              <X className="h-3 w-3 me-1" /> {commonT('restricted')}
            </Badge>
          )}
        </TableCell>
        <TableCell className="text-right font-mono">
           {/* Balances could be added here if we join with ledger summary */}
        </TableCell>
      </TableRow>
      {hasChildren && isOpen && (
        account.children.map(child => (
          <AccountRow key={child.id} account={child} level={level + 1} />
        ))
      )}
    </>
  );
};

export default function AccountsPage() {
  const { isRTL } = useLanguage();
  const navT = useTranslations('navigation');
  const commonT = useTranslations('common');
  const accT = useTranslations('Accounting');

  const { data, error, mutate } = useSWR('/accounting/accounts/tree', () => getAccountsTree());
  const accountsTree = data?.data || [];
  const loading = !data && !error;

  return (
    <div className="p-6" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="max-w-7xl mx-auto space-y-6">
        <PageHeader
          title={navT('accounts')}
          icon={ListTree}
          breadcrumbs={[
            { label: navT('dashboard'), href: '/' },
            { label: navT('finance') },
            { label: navT('accounts') }
          ]}
          actions={
            <Button onClick={() => {}} className="gap-2">
              <Plus className="h-4 w-4" /> {commonT('add')}
            </Button>
          }
        />

        <Card className="border-none shadow-xl bg-card/60 backdrop-blur-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              {accT('chartOfAccounts')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex flex-col items-center justify-center p-12 space-y-4">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                <p className="text-muted-foreground animate-pulse">{commonT('loading')}</p>
              </div>
            ) : accountsTree.length === 0 ? (
              <div className="text-center p-12 border-2 border-dashed rounded-xl">
                <p className="text-muted-foreground">{commonT('noData')}</p>
              </div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader className="bg-muted/50">
                    <TableRow>
                      <TableHead className="w-[40%]">{commonT('name')}</TableHead>
                      <TableHead>{commonT('type')}</TableHead>
                      <TableHead>{accT('reconcilable')}</TableHead>
                      <TableHead>{accT('allowManualPosting')}</TableHead>
                      <TableHead className="text-right">{commonT('balance')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {accountsTree.map((account) => (
                      <AccountRow key={account.id} account={account} />
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
