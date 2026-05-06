"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CustomModal } from "@/components/ui/custom-modal";
import { useTranslations } from "@/hooks/useTranslations";
import { Wallet, TrendingDown, FileText, Receipt } from "lucide-react";
import DepositsTab from "./DepositsTab";
import ExpensesTab from "./ExpensesTab";
import InvoicesTab from "./InvoicesTab";
import AccountStatementTab from "./AccountStatementTab";
import { useLanguage } from "@/contexts/LanguageContext";

export default function ClientFinanceModal({ isOpen, onClose, clientId, clientName, clientBalance }) {
  const { t } = useTranslations();
  const { isRTL } = useLanguage();

  return (
    <CustomModal
      isOpen={isOpen}
      onClose={onClose}
      title={`${t("clientFinance.financialDetails")} - ${clientName}`}
      size="large"
    >
      <Tabs dir={isRTL ? "rtl" : "ltr"} defaultValue="deposits" className="w-full min-h-[90vh]">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="deposits">
            <Wallet className="h-4 w-4 me-2" />
            {t("clientFinance.deposits")}
          </TabsTrigger>
          <TabsTrigger value="expenses">
            <TrendingDown className="h-4 w-4 me-2" />
            {t("clientFinance.expenses")}
          </TabsTrigger>
          <TabsTrigger value="invoices">
            <FileText className="h-4 w-4 me-2" />
            {t("clientFinance.invoices")}
          </TabsTrigger>
          <TabsTrigger value="statement">
            <Receipt className="h-4 w-4 me-2" />
            {t("clientFinance.accountStatement") || "كشف الحساب"}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="deposits">
          <DepositsTab clientBalance={clientBalance} clientId={clientId} clientName={clientName} />
        </TabsContent>

        <TabsContent value="expenses">
          <ExpensesTab clientBalance={clientBalance} clientId={clientId} clientName={clientName} />
        </TabsContent>

        <TabsContent value="invoices">
          <InvoicesTab clientBalance={clientBalance} clientId={clientId} clientName={clientName} />
        </TabsContent>

        <TabsContent value="statement">
          <AccountStatementTab clientId={clientId} clientName={clientName} />
        </TabsContent>
      </Tabs>
    </CustomModal>
  );
}

