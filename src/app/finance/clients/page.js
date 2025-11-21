"use client";

import { useMemo } from "react";
import { useTranslations } from "@/hooks/useTranslations";
import { useLanguage } from "@/contexts/LanguageContext";
import { useFinanceClients } from "./hooks/useFinanceClients";
import { getExportColumnConfig } from "./constants";
import PageHeader from "@/components/PageHeader";
import SearchBar from "./components/SearchBar";
import ClientsTable from "./components/ClientsTable";
import PaginationControls from "./components/PaginationControls";
import ClientFinanceModal from "./components/ClientFinanceModal";
import { Users } from "lucide-react";

export default function FinanceClientsPage() {
  const t = useTranslations("common");
  const tNav = useTranslations("navigation");
  const { language } = useLanguage();

  // Use custom hook for all business logic and state management
  const {
    clients,
    pagination,
    hasClients,
    selectedClient,
    isInitialLoading,
    isRefreshing,
    error,
    searchTerm,
    handleSearch,
    currentPage,
    handleNextPage,
    handlePreviousPage,
    isModalOpen,
    handleViewClient,
    handleCloseModal,
  } = useFinanceClients();

  // Memoize export configuration
  const exportColumnConfig = useMemo(
    () => getExportColumnConfig(t, language),
    [language, t]
  );

  // Handle loading and error states
  if (isInitialLoading) {
    return <div className="p-8 text-center">{t("loading")}</div>;
  }

  if (error) {
    return <div className="p-8 text-center text-red-500">{t("errorLoading")}</div>;
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header Section */}
      <PageHeader
        title={t("financeClients")}
        description={`${t("managingClients")} (${pagination.total || 0})`}
        icon={Users}
        breadcrumbs={[
          { label: tNav("dashboard"), href: '/' },
          { label: tNav("finance") },
          { label: tNav("financeClients") },
        ]}
        sticky
      />

      {/* Search & Export Section */}
      <SearchBar
        searchTerm={searchTerm}
        onSearchChange={handleSearch}
        isRefreshing={isRefreshing}
        exportData={clients}
        exportColumnConfig={exportColumnConfig}
        language={language}
        placeholder={t("search")}
        hasData={hasClients}
        exportName="finance_clients"
        sheetName={t("financeClients")}
      />

      {/* Table Section */}
      <ClientsTable
        clients={clients}
        onViewClient={handleViewClient}
        translations={t}
      />

      {/* Pagination Section */}
      <PaginationControls
        currentPage={currentPage}
        totalPages={pagination.totalPages || 1}
        onNextPage={handleNextPage}
        onPreviousPage={handlePreviousPage}
        translations={t}
      />

      {/* Modal Section */}
      {selectedClient && (
        <ClientFinanceModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          clientId={selectedClient.id}
          clientName={selectedClient.name}
          clientBalance={selectedClient.balance}
        />
      )}
    </div>
  );
}
