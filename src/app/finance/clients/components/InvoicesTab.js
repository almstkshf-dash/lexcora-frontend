"use client";

import { useState } from "react";
import useSWR from "swr";
import { Eye, FileText, Edit, Trash2, Printer, Plus, Hash, DollarSign, Receipt, Globe, Building2, CreditCard, CheckCircle, Calendar, User } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useTranslations } from "@/hooks/useTranslations";
import { getInvoicesByClientId } from "@/app/services/api/invoices";
import AddInvoiceModal from "../../invoices/components/AddInvoiceModal";
import ShowInvoiceModal from "../../invoices/components/ShowInvoiceModal";
import EditInvoiceModal from "../../invoices/components/EditInvoiceModal";
import DeleteInvoiceModal from "../../invoices/components/DeleteInvoiceModal";
import PrintInvoiceModal from "../../invoices/components/PrintInvoiceModal";

export default function InvoicesTab({ clientId, clientName }) {
  const { t } = useTranslations();
  const [showAddModal, setShowAddModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [selectedInvoiceId, setSelectedInvoiceId] = useState(null);

  const { data: invoices, error, isLoading, mutate } = useSWR(
    `/invoices/client/${clientId}`,
    () => getInvoicesByClientId(clientId)
  );

  const handleView = (invoiceId) => {
    setSelectedInvoiceId(invoiceId);
    setShowViewModal(true);
  };

  const handleEdit = (invoiceId) => {
    setSelectedInvoiceId(invoiceId);
    setShowEditModal(true);
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
    mutate();
  };

  if (isLoading) {
    return <div className="py-8 text-center">{t("loading")}</div>;
  }

  if (error) {
    return <div className="py-8 text-center text-red-500">{t("errorLoading")}</div>;
  }

  const invoicesList = invoices?.data || [];

  const getStatusBadge = (status) => {
    const statusConfig = {
      approved: { label: t("invoices.statusApproved"), variant: "default", className: "bg-green-500" },
      rejected: { label: t("invoices.statusRejected"), variant: "destructive" },
      pending: { label: t("invoices.statusPending"), variant: "secondary" }
    };
    const config = statusConfig[status] || { label: status, variant: "outline" };
    return <Badge variant={config.variant} className={config.className}>{config.label}</Badge>;
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">{t("clientFinance.invoices")}</h3>
        <Button onClick={() => setShowAddModal(true)} size="sm">
          <Plus className="h-4 w-4 me-2" />
          {t("invoices.addNewInvoice")}
        </Button>
      </div>

      {invoicesList.length === 0 ? (
        <div className="border rounded-sg p-8 text-center ">
          {t("invoices.noInvoices")}
        </div>
      ) : (
        <div className="border rounded-sg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>
                  <div className="flex items-center gap-2">
                    <Hash className="h-4 w-4" />
                    {t("invoices.invoiceNumber")}
                  </div>
                </TableHead>
                <TableHead>
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4" />
                    {t("invoices.amount")}
                  </div>
                </TableHead>
                <TableHead>
                  <div className="flex items-center gap-2">
                    <Receipt className="h-4 w-4" />
                    {t("invoices.vat")}
                  </div>
                </TableHead>
                <TableHead>
                  <div className="flex items-center gap-2">
                    <Globe className="h-4 w-4" />
                    {t("invoices.currency")}
                  </div>
                </TableHead>
                <TableHead>
                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4" />
                    {t("invoices.branch")}
                  </div>
                </TableHead>
                <TableHead>
                  <div className="flex items-center gap-2">
                    <CreditCard className="h-4 w-4" />
                    {t("invoices.bankAccount")}
                  </div>
                </TableHead>
                <TableHead>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4" />
                    {t("invoices.status")}
                  </div>
                </TableHead>
                <TableHead>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    {t("invoices.invoiceDate")}
                  </div>
                </TableHead>
                <TableHead>
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    {t("invoices.createdBy")}
                  </div>
                </TableHead>
                <TableHead className="text-center">{t("invoices.actions")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoicesList.map((invoice) => (
                <TableRow key={invoice.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 " />
                      {invoice.invoice_number || "-"}
                    </div>
                  </TableCell>
                  <TableCell className="font-semibold">{invoice.amount}</TableCell>
                  <TableCell>{invoice.vat}%</TableCell>
                  <TableCell>{invoice.currency || "AED"}</TableCell>
                  <TableCell>{invoice.branch_name || "-"}</TableCell>
                  <TableCell>
                    {invoice.bank_name ? (
                      <div className="text-sm">
                        <div>{invoice.bank_name}</div>
                        <div className="">{invoice.account_number}</div>
                      </div>
                    ) : "-"}
                  </TableCell>
                  <TableCell>{getStatusBadge(invoice.status)}</TableCell>
                  <TableCell>
                    {invoice.invoice_date ? new Date(invoice.invoice_date).toLocaleDateString() : "-"}
                  </TableCell>
                  <TableCell>{invoice.created_by_name || "-"}</TableCell>
                  <TableCell className="text-center">
                    <div className="flex justify-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleView(invoice.id)}
                        title={t('invoices.view')}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePrint(invoice.id)}
                        title={t('invoices.print')}
                      >
                        <Printer className="h-4 w-4 text-blue-600" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(invoice.id)}
                        title={t('invoices.edit')}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(invoice.id)}
                        title={t('invoices.delete')}
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

      {/* Modals */}
      <AddInvoiceModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSuccess={handleSuccess}
        defaultClientId={clientId}
      />

      <ShowInvoiceModal
        isOpen={showViewModal}
        onClose={() => {
          setShowViewModal(false);
          setSelectedInvoiceId(null);
        }}
        invoiceId={selectedInvoiceId}
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
  );
}


