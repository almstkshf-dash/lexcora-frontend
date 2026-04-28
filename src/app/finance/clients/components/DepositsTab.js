"use client";

import { useState } from "react";
import useSWR from "swr";
import { Plus, Pencil, Trash2, DollarSign, FileText, User, Calendar, Printer, CreditCard, Banknote, FileCheck } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useTranslations } from "@/hooks/useTranslations";
import { getDepositsByPartyId } from "@/app/services/api/clientsDeposits";
import AddDepositModal from "./AddDepositModal";
import EditDepositModal from "./EditDepositModal";
import DeleteDepositModal from "./DeleteDepositModal";
import PrintDepositReceiptModal from "./PrintDepositReceiptModal";

export default function DepositsTab({ clientId, clientName }) {
  const { t } = useTranslations();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [selectedDeposit, setSelectedDeposit] = useState(null);
  const normalizedClientId = Number(clientId);
  const hasValidClientId = Number.isInteger(normalizedClientId) && normalizedClientId > 0;

  // Get payment type icon and label
  const getPaymentTypeInfo = (type) => {
    switch(type) {
      case 'card':
        return { icon: CreditCard, label: t("clientFinance.card"), color: "bg-blue-100 text-blue-800" };
      case 'check':
        return { icon: FileCheck, label: t("clientFinance.check"), color: "bg-purple-100 text-purple-800" };
      case 'cash':
      default:
        return { icon: Banknote, label: t("clientFinance.cash"), color: "bg-green-100 text-green-800" };
    }
  };

  const { data: deposits, error, isLoading, mutate } = useSWR(
    hasValidClientId ? `/clients-deposits/party/${normalizedClientId}` : null,
    () => getDepositsByPartyId(normalizedClientId)
  );

  const handleAddSuccess = () => {
    mutate();
  };

  const handleEditClick = (deposit) => {
    setSelectedDeposit(deposit);
    setIsEditModalOpen(true);
  };

  const handleDeleteClick = (deposit) => {
    setSelectedDeposit(deposit);
    setIsDeleteModalOpen(true);
  };

  const handlePrintClick = (deposit) => {
    setSelectedDeposit(deposit);
    setIsPrintModalOpen(true);
  };

  if (isLoading) {
    return <div className="py-8 text-center">{t("loading")}</div>;
  }

  if (error) {
    return <div className="py-8 text-center text-red-500">{t("errorLoading")}</div>;
  }

  const depositsList = deposits?.data || [];

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">{t("clientFinance.deposits")}</h3>
        <Button onClick={() => setIsAddModalOpen(true)} size="sm">
          <Plus className="h-4 w-4 mr-2" />
          {t("clientFinance.addDeposit")}
        </Button>
      </div>

      {depositsList.length === 0 ? (
        <div className="border rounded-lg p-8 text-center text-gray-500">
          {t("clientFinance.noDeposits")}
        </div>
      ) : (
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4" />
                    {t("clientFinance.amount")}
                  </div>
                </TableHead>
                <TableHead>
                  <div className="flex items-center gap-2">
                    <CreditCard className="h-4 w-4" />
                    {t("clientFinance.paymentType")}
                  </div>
                </TableHead>
                <TableHead>
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    {t("clientFinance.description")}
                  </div>
                </TableHead>
                <TableHead>
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    {t("clientFinance.createdBy")}
                  </div>
                </TableHead>
                <TableHead>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    {t("clientFinance.createdAt")}
                  </div>
                </TableHead>
                <TableHead className="text-center">{t("actions")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {depositsList.map((deposit) => {
                const paymentInfo = getPaymentTypeInfo(deposit.type);
                const PaymentIcon = paymentInfo.icon;
                
                return (
                  <TableRow key={deposit.id}>
                    <TableCell>{deposit.amount}</TableCell>
                    <TableCell>
                      <Badge className={`${paymentInfo.color} flex items-center gap-1 w-fit`} variant="secondary">
                        <PaymentIcon className="h-3 w-3" />
                        {paymentInfo.label}
                      </Badge>
                      {deposit.type === 'check' && deposit.check_number && (
                        <div className="text-xs text-gray-500 mt-1">
                          #{deposit.check_number}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>{deposit.description || "-"}</TableCell>
                    <TableCell>{deposit.created_by_name || "-"}</TableCell>
                    <TableCell>
                      {new Date(deposit.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex justify-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handlePrintClick(deposit)}
                          title={t("print")}
                        >
                          <Printer className="h-4 w-4 text-green-600" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditClick(deposit)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteClick(deposit)}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}

      <AddDepositModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        clientId={clientId}
        clientName={clientName}
        onSuccess={handleAddSuccess}
      />

      {selectedDeposit && (
        <>
          <EditDepositModal
            isOpen={isEditModalOpen}
            onClose={() => {
              setIsEditModalOpen(false);
              setSelectedDeposit(null);
            }}
            deposit={selectedDeposit}
            clientName={clientName}
            onSuccess={handleAddSuccess}
          />

          <DeleteDepositModal
            isOpen={isDeleteModalOpen}
            onClose={() => {
              setIsDeleteModalOpen(false);
              setSelectedDeposit(null);
            }}
            deposit={selectedDeposit}
            onSuccess={handleAddSuccess}
          />

          <PrintDepositReceiptModal
            isOpen={isPrintModalOpen}
            onClose={() => {
              setIsPrintModalOpen(false);
              setSelectedDeposit(null);
            }}
            deposit={selectedDeposit}
            clientName={clientName}
          />
        </>
      )}
    </div>
  );
}
