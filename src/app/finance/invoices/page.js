'use client';

import React, { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTranslations } from '@/hooks/useTranslations';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Edit, Trash2, Plus, Eye, Printer, ReceiptText } from 'lucide-react';
import { getAllInvoices } from '@/app/services/api/invoices';
import AddInvoiceModal from './components/AddInvoiceModal';
import EditInvoiceModal from './components/EditInvoiceModal';
import ShowInvoiceModal from './components/ShowInvoiceModal';
import DeleteInvoiceModal from './components/DeleteInvoiceModal';
import PrintInvoiceModal from './components/PrintInvoiceModal';
import ExportButtons from '@/components/ui/export-buttons';
import { toast } from 'react-toastify';
import useSWR from 'swr';
import PageHeader from '@/components/PageHeader';
import { DEFAULT_CURRENCY, LOCALE, STATUS } from '@/app/finance/constants';

function InvoicesPage() {
  const { isRTL, language } = useLanguage();
  const t = useTranslations('invoices');
  const navT = useTranslations('navigation');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [selectedInvoiceId, setSelectedInvoiceId] = useState(null);

  // Fetch invoices using SWR
  const { data: invoicesData, error, mutate } = useSWR('/invoices', getAllInvoices);

  const invoices = invoicesData?.data || [];
  const loading = !invoicesData && !error;

  const handleEdit = (invoiceId) => {
    setSelectedInvoiceId(invoiceId);
    setShowEditModal(true);
  };

  const handleView = (invoiceId) => {
    setSelectedInvoiceId(invoiceId);
    setShowViewModal(true);
  };

  const handleDelete = (invoiceId) => {
    setSelectedInvoiceId(invoiceId);
    setShowDeleteModal(true);
  };

  const handlePrint = (invoiceId) => {
    setSelectedInvoiceId(invoiceId);
    setShowPrintModal(true);
  };

  const handleSuccess = () => {
    mutate(); // Refresh the list
  };

  const formatCurrency = (amount, currency = DEFAULT_CURRENCY) => {
    return new Intl.NumberFormat(isRTL ? LOCALE.ar : LOCALE.en, {
      style: 'currency',
      currency: currency
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString(isRTL ? LOCALE.ar : LOCALE.en);
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      [STATUS.PENDING]: { label: t('statusPending'), variant: 'secondary' },
      [STATUS.APPROVED]: { label: t('statusApproved'), variant: 'success' },
      [STATUS.REJECTED]: { label: t('statusRejected'), variant: 'destructive' }
    };

    const config = statusConfig[status] || statusConfig[STATUS.PENDING];
    
    return (
      <Badge variant={config.variant}>
        {config.label}
      </Badge>
    );
  };

  // Column configuration for export
  const invoiceColumnConfig = {
    invoice_number: {
      en: 'Invoice Number',
      ar: 'رقم الفاتورة',
      dataKey: 'invoice_number'
    },
    invoice_date: {
      en: 'Date',
      ar: 'التاريخ',
      dataKey: 'invoice_date',
      type: 'date'
    },
    client_name: {
      en: 'Client',
      ar: 'الموكل',
      dataKey: 'client_name'
    },
    branch_name: {
      en: 'Branch',
      ar: 'الفرع',
      dataKey: 'branch_name'
    },
    bank_name: {
      en: 'Bank Account',
      ar: 'الحساب البنكي',
      dataKey: 'bank_name',
      formatter: (value, item) => item.bank_name ? `${item.bank_name} - ${item.account_number}` : '-'
    },
    amount: {
      en: 'Amount',
      ar: 'المبلغ',
      dataKey: 'amount',
      formatter: (value, item) => `${value} ${item.currency || DEFAULT_CURRENCY}`
    },
    vat: {
      en: 'VAT %',
      ar: 'ضريبة القيمة المضافة %',
      dataKey: 'vat'
    },
    currency: {
      en: 'Currency',
      ar: 'العملة',
      dataKey: 'currency'
    },
    status: {
      en: 'Status',
      ar: 'الحالة',
      dataKey: 'status',
      type: 'status',
      statusMap: {
        pending: { en: 'Pending', ar: 'قيد الانتظار' },
        approved: { en: 'Approved', ar: 'معتمدة' },
        rejected: { en: 'Rejected', ar: 'مرفوضة' }
      }
    },
    created_by_name: {
      en: 'Created By',
      ar: 'أضيف بواسطة',
      dataKey: 'created_by_name'
    }
  };

  return (
    <div className="p-6" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="max-w-7xl mx-auto">
        <PageHeader
          title={t('pageTitle')}
          icon={ReceiptText}
          breadcrumbs={[
            { label: navT('dashboard'), href: '/' },
            { label: navT('finance') },
            { label: navT('invoices') }
          ]}
        />

        {/* Invoices Card */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center flex-wrap gap-3">
              <CardTitle>{t('listTitle')}</CardTitle>
              <div className="flex items-center gap-2 flex-wrap">
                <ExportButtons
                  data={invoices}
                  columnConfig={invoiceColumnConfig}
                  language={language}
                  exportName="invoices"
                  sheetName={t('sheetName')}
                />
                <Button 
                  onClick={() => setShowAddModal(true)}
                  className="flex items-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  {t('addNewInvoice')}
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center p-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                <span className="ms-3">{t('loading')}</span>
              </div>
            ) : invoices.length === 0 ? (
              <div className="text-center p-8">
                <p className=" mb-4">{t('noInvoices')}</p>
                <Button onClick={() => setShowAddModal(true)}>
                  {t('addNewInvoice')}
                </Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t('invoiceNumber')}</TableHead>
                      <TableHead>{t('date')}</TableHead>
                      <TableHead>{t('clientName')}</TableHead>
                      <TableHead>{t('branchName')}</TableHead>
                      <TableHead>{t('bankAccount')}</TableHead>
                      <TableHead>{t('amount')}</TableHead>
                      <TableHead>{t('vatPercent')}</TableHead>
                      <TableHead>{t('status')}</TableHead>
                      <TableHead>{t('createdBy')}</TableHead>
                      <TableHead>{t('actions')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {invoices.map((invoice) => (
                      <TableRow key={invoice.id}>
                        <TableCell className="font-medium font-mono">
                          {invoice.invoice_number}
                        </TableCell>
                        <TableCell>
                          {formatDate(invoice.invoice_date)}
                        </TableCell>
                        <TableCell>
                          {invoice.client_name || '-'}
                        </TableCell>
                        <TableCell>
                          {invoice.branch_name || '-'}
                        </TableCell>
                        <TableCell>
                          {invoice.bank_name ? (
                            <div className="text-xs">
                              <div className="font-medium">{invoice.bank_name}</div>
                              <div className="">{invoice.account_number}</div>
                            </div>
                          ) : '-'}
                        </TableCell>
                        <TableCell className="font-semibold">
                          {formatCurrency(invoice.amount, invoice.currency)}
                        </TableCell>
                        <TableCell className="text-center">
                          {invoice.vat ? `${invoice.vat}%` : '-'}
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(invoice.status)}
                        </TableCell>
                        <TableCell>
                          {invoice.created_by_name || '-'}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleView(invoice.id)}
                              title={t('view')}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handlePrint(invoice.id)}
                              title={t('print')}
                            >
                              <Printer className="h-4 w-4 text-blue-600" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEdit(invoice.id)}
                              title={t('edit')}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDelete(invoice.id)}
                              title={t('delete')}
                            >
                              <Trash2 className="h-4 w-4 text-red-600" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Modals */}
        <AddInvoiceModal
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          onSuccess={handleSuccess}
        />

        <EditInvoiceModal
          isOpen={showEditModal}
          onClose={() => {
            setShowEditModal(false);
            setSelectedInvoiceId(null);
          }}
          invoiceId={selectedInvoiceId}
          onSuccess={handleSuccess}
        />

        <ShowInvoiceModal
          isOpen={showViewModal}
          onClose={() => {
            setShowViewModal(false);
            setSelectedInvoiceId(null);
          }}
          invoiceId={selectedInvoiceId}
        />

        <DeleteInvoiceModal
          isOpen={showDeleteModal}
          onClose={() => {
            setShowDeleteModal(false);
            setSelectedInvoiceId(null);
          }}
          invoiceId={selectedInvoiceId}
          onSuccess={handleSuccess}
        />

        <PrintInvoiceModal
          isOpen={showPrintModal}
          onClose={() => {
            setShowPrintModal(false);
            setSelectedInvoiceId(null);
          }}
          invoiceId={selectedInvoiceId}
        />
      </div>
    </div>
  );
}

export default InvoicesPage;
