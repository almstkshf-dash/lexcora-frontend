"use client";

import { useMemo, useCallback } from "react";
import { useTranslations } from "@/hooks/useTranslations";
import { useLanguage } from "@/contexts/LanguageContext";
import { useFinanceClients } from "./hooks/useFinanceClients";
import { getExportColumnConfig } from "./constants";
import PageHeader from "@/components/PageHeader";
import SearchBar from "./components/SearchBar";
import ClientFinanceModal from "./components/ClientFinanceModal";
import { Eye, Users } from "lucide-react";
import DataTable from "@/components/DataTable";
import { Button } from "@/components/ui/button";

export default function FinanceClientsPage() {
  const t = useTranslations("common");
  const tNav = useTranslations("navigation");
  const { language, isRTL } = useLanguage();

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
    handlePageChange,
    isModalOpen,
    handleViewClient,
    handleCloseModal,
  } = useFinanceClients();

  // Memoize export configuration
  const exportColumnConfig = useMemo(
    () => getExportColumnConfig(t, language),
    [language, t]
  );

  const columns = useMemo(() => [
    {
      id: "name",
      header: t("name"),
      accessor: (row) => row.name || "-",
      sortable: true,
      searchable: true,
      searchPlaceholder: t("name"),
    },
    {
      id: "balance",
      header: t("balance"),
      sortable: true,
      accessor: (row) => row.balance ?? 0,
      cell: (row) => {
        const balance = row.balance ?? 0;
        const color =
          balance > 0 ? "text-green-600" : balance < 0 ? "text-red-600" : "text-muted-foreground";
        return <span className={`font-semibold ${color}`}>{balance}</span>;
      },
    },
    {
      id: "phone",
      header: t("phone"),
      accessor: (row) => row.phone || "-",
      searchable: true,
      searchPlaceholder: t("phone"),
    },
    {
      id: "nationality",
      header: t("nationality"),
      accessor: (row) => row.nationality || "-",
      searchable: true,
      searchPlaceholder: t("nationality"),
    },
  ], [t]);

  const renderActions = useCallback((row) => (
    <Button
      variant="outline"
      size="sm"
      onClick={() => handleViewClient(row)}
      className="hover:bg-blue-50 hover:text-blue-600 hover:border-blue-300"
    >
      <Eye className="h-4 w-4 me-2" />
      {t("view")}
    </Button>
  ), [handleViewClient, t]);

  // Handle loading and error states
  if (isInitialLoading) {
    return <div className="p-8 text-center">{t("loading")}</div>;
  }

  if (error) {
    return <div className="p-8 text-center text-red-500">{t("errorLoading")}</div>;
  }

  return (
    <div className="p-6 space-y-6" dir={isRTL ? "rtl" : "ltr"}>
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

      <DataTable
        data={clients}
        columns={columns}
        rowKey="id"
        isLoading={isInitialLoading}
        loadingMessage={t("loading")}
        emptyMessage={t("noData")}
        rowActions={renderActions}
        actionsLabel={t("actions")}
        dir={language === "ar" ? "rtl" : "ltr"}
        enableColumnSearch={false}
        pagination={{
          page: currentPage,
          totalPages: pagination.totalPages || 1,
          onPageChange: handlePageChange,
          onNext: handleNextPage,
          onPrevious: handlePreviousPage,
        }}
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
