"use client";

import { useState } from "react";
import useSWR from "swr";
import { getPotentialClients } from "../services/api/parties";
import { SearchBar } from "./SearchBar";
import { Pagination } from "./Pagination";
import { ClientDetailsModal } from "./ClientDetailsModal";
import { EditClientModal } from "./EditClientModal";
import { AddClientModal } from "./AddClientModal";
import { AddMeetingModal } from "../meetings/AddMeetingModal";
import ActionsDropdown from "./ActionsDropdown";
import ExportButtons from "@/components/ui/export-buttons";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Crown } from "lucide-react";
import { useTranslations } from "@/hooks/useTranslations";
import { useLanguage } from "@/contexts/LanguageContext";

function PotentialClients() {
  const { t } = useTranslations();
  const { language } = useLanguage();
  const [page, setPage] = useState(1);
  const [searchFilters, setSearchFilters] = useState({
    searchTerm: "",
    status: undefined,
    type: undefined,
  });
  const [selectedClientId, setSelectedClientId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEditClientId, setSelectedEditClientId] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedMeetingClientId, setSelectedMeetingClientId] = useState(null);
  const [isAddMeetingModalOpen, setIsAddMeetingModalOpen] = useState(false);
  const limit = 10;

  // SWR fetcher function
  const fetcher = () => {
    const params = {
      page,
      limit,
    };

    // Add search parameters if they exist
    if (searchFilters.searchTerm) {
      // Send the same search term to both name and phone for broader search
      params.name = searchFilters.searchTerm;
      params.phone = searchFilters.searchTerm;
    }
    if (searchFilters.status) {
      params.status = searchFilters.status;
    }
    if (searchFilters.type) {
      params.party_type = searchFilters.type;
    }

    return getPotentialClients(params);
  };

  // Use SWR for data fetching
  const { data, error, isLoading, mutate } = useSWR(
    [`/parties/potential-clients`, page, searchFilters.searchTerm, searchFilters.status],
    fetcher,
    {
      revalidateOnFocus: false,
      keepPreviousData: true,
    }
  );

  const handleSearch = (filters) => {
    setSearchFilters(filters);
    setPage(1); // Reset to first page on new search
  };

  const handlePageChange = (newPage) => {
    setPage(newPage);
  };

  const handleViewDetails = (id) => {
    setSelectedClientId(id);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedClientId(null);
  };

  const handleEditClient = (id) => {
    setSelectedEditClientId(id);
    setIsEditModalOpen(true);
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setSelectedEditClientId(null);
  };

  const handleEditSuccess = () => {
    // Refresh the data after successful edit
    // SWR will automatically revalidate due to mutate in EditClientModal
  };

  const handleAddNew = () => {
    setIsAddModalOpen(true);
  };

  const handleCloseAddModal = () => {
    setIsAddModalOpen(false);
  };

  const handleAddSuccess = () => {
    // Refresh the data after successful add
    // SWR will automatically revalidate due to mutate in AddClientModal
  };

  const handleAddMeeting = (clientId) => {
    setSelectedMeetingClientId(clientId);
    setIsAddMeetingModalOpen(true);
  };

  const handleCloseMeetingModal = () => {
    setIsAddMeetingModalOpen(false);
    setSelectedMeetingClientId(null);
  };

  const handleMeetingSuccess = () => {
    // Refresh the data after successful meeting add if needed
    // You can add SWR revalidation here if necessary
  };

  const handleClientDeleted = () => {
    // Refresh the data after successful deletion
    mutate();
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getTranslatedPartyType = (partyType) => {
    if (!partyType) return "-";
    const lowerType = partyType.toLowerCase();
    const typeMap = {
      "new": t("potentialClientsPage.partyType.new"),
      "contacted": t("potentialClientsPage.partyType.contacted"),
      "qualified": t("potentialClientsPage.partyType.qualified"),
      "unqualified": t("potentialClientsPage.partyType.unqualified"),
    };
    return typeMap[lowerType] || partyType;
  };

  const getTranslatedCategory = (category) => {
    if (!category) return "-";
    const lowerCategory = category.toLowerCase();
    const categoryMap = {
      "individual": t("potentialClientsPage.category.individual"),
      "company": t("potentialClientsPage.category.company"),
    };
    return categoryMap[lowerCategory] || category;
  };

  const getVipBadge = (isVip) => {
    if (isVip !== 1) return null;
    
    return (
      <Badge 
        variant="outline" 
        className="bg-gradient-to-r from-yellow-400 to-amber-500 text-white hover:from-yellow-500 hover:to-amber-600 border-0 animate-pulse"
      >
        <Crown className="w-3 h-3 mr-1" />
        {language === 'ar' ? 'VIP' : 'VIP'}
      </Badge>
    );
  };

  // Column configuration for export
  const potentialClientsColumnConfig = {
    id: {
      ar: 'المعرف',
      en: 'ID',
      dataKey: 'id'
    },
    name: {
      ar: 'الاسم',
      en: 'Name',
      dataKey: 'name'
    },
    phone: {
      ar: 'رقم الهاتف',
      en: 'Phone',
      dataKey: 'phone'
    },
    email: {
      ar: 'البريد الإلكتروني',
      en: 'Email',
      dataKey: 'email'
    },
    party_type: {
      ar: 'نوع الطرف',
      en: 'Party Type',
      dataKey: 'party_type',
      formatter: (value) => getTranslatedPartyType(value)
    },
    source: {
      ar: 'المصدر',
      en: 'Source',
      dataKey: 'source'
    },
    category: {
      ar: 'الفئة',
      en: 'Category',
      dataKey: 'category',
      formatter: (value) => getTranslatedCategory(value)
    },
    is_vip: {
      ar: 'VIP',
      en: 'VIP',
      dataKey: 'is_vip',
      formatter: (value) => value === 1 ? 'VIP' : ''
    },
    nationality: {
      ar: 'الجنسية',
      en: 'Nationality',
      dataKey: 'nationality'
    },
    created_by_name: {
      ar: 'أنشئ بواسطة',
      en: 'Created By',
      dataKey: 'created_by_name'
    },
    created_at: {
      ar: 'تاريخ الإنشاء',
      en: 'Created At',
      dataKey: 'created_at',
      type: 'date'
    }
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold">
            {t("potentialClientsPage.title")}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search Bar */}
          <div className="flex justify-between items-center">
            <SearchBar onSearch={handleSearch} onAddNew={handleAddNew} />
          </div>

          {/* Export Buttons */}
          {data?.data && data.data.length > 0 && (
            <div className="border-b pb-4">
              <ExportButtons
                data={data.data}
                columnConfig={potentialClientsColumnConfig}
                language={language}
                exportName="potential-clients"
                sheetName={language === 'ar' ? 'العملاء المحتملون' : 'Potential Clients'}
              />
            </div>
          )}

          {/* Table */}
          <div className="rounded-md border">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                <span className="ml-2">{t("potentialClientsPage.messages.loading")}</span>
              </div>
            ) : error ? (
              <div className="flex items-center justify-center py-12 text-destructive">
                <p>{t("potentialClientsPage.messages.error")}</p>
              </div>
            ) : !Array.isArray(data?.data) || data.data.length === 0 ? (
              <div className="flex items-center justify-center py-12 text-muted-foreground">
                <p>{t("potentialClientsPage.messages.noResults")}</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t("potentialClientsPage.table.id")}</TableHead>
                    <TableHead>{t("potentialClientsPage.table.name")}</TableHead>
                    <TableHead>{t("potentialClientsPage.table.phone")}</TableHead>
                    <TableHead>{t("potentialClientsPage.table.source")}</TableHead>
                    <TableHead>{t("potentialClientsPage.table.category")}</TableHead>
                    <TableHead>{t("potentialClientsPage.table.partyType")}</TableHead>
                    <TableHead>{t("potentialClientsPage.vipStatus") || 'VIP'}</TableHead>
                    <TableHead>{t("potentialClientsPage.table.nationality")}</TableHead>
                    <TableHead>{t("potentialClientsPage.table.createdBy")}</TableHead>
                    <TableHead className="text-center">{t("potentialClientsPage.table.actions")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {Array.isArray(data?.data) && data.data.map((client) => (
                    <TableRow key={client.id}>
                      <TableCell className="font-medium">{client.id}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {client.name}
                          {client.is_vip === 1 && <Crown className="w-4 h-4 text-amber-500" />}
                        </div>
                      </TableCell>
                      <TableCell>{client.phone || "-"}</TableCell>
                      <TableCell>{client.source || "-"}</TableCell>
                      <TableCell>{getTranslatedCategory(client.category)}</TableCell>
                      <TableCell>
                        <span
                          className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${
                            client.party_type === "Qualified"
                              ? "bg-green-50 text-green-700 ring-green-600/20"
                              : client.party_type === "New"
                              ? "bg-blue-50 text-blue-700 ring-blue-600/20"
                              : client.party_type === "Contacted"
                              ? "bg-yellow-50 text-yellow-700 ring-yellow-600/20"
                              : client.party_type === "Unqualified"
                              ? "bg-red-50 text-red-700 ring-red-600/20"
                              : "bg-gray-50 text-gray-600 ring-gray-500/10"
                          }`}
                        >
                          {getTranslatedPartyType(client.party_type)}
                        </span>
                      </TableCell>
                      <TableCell>{getVipBadge(client.is_vip)}</TableCell>
                      <TableCell>{client.nationality || "-"}</TableCell>
                      <TableCell>{client.created_by_name || "-"}</TableCell>
                      <TableCell className="text-center">
                        <ActionsDropdown
                          client={client}
                          onViewDetails={handleViewDetails}
                          onEdit={handleEditClient}
                          onAddMeeting={handleAddMeeting}
                          onDeleted={handleClientDeleted}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>

          {/* Pagination */}
          {data?.pagination && (
            <Pagination
              currentPage={data.pagination.page}
              totalPages={data.pagination.totalPages}
              onPageChange={handlePageChange}
            />
          )}

          {/* Results info */}
          {data?.pagination && (
            <div className="text-sm text-muted-foreground text-center">
              {t("potentialClientsPage.pagination.showing", {
                count: data.data.length,
                total: data.pagination.total
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Client Details Modal */}
      <ClientDetailsModal 
        clientId={selectedClientId}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />

      {/* Edit Client Modal */}
      <EditClientModal 
        clientId={selectedEditClientId}
        isOpen={isEditModalOpen}
        onClose={handleCloseEditModal}
        onSuccess={handleEditSuccess}
      />

      {/* Add Client Modal */}
      <AddClientModal 
        isOpen={isAddModalOpen}
        onClose={handleCloseAddModal}
        onSuccess={handleAddSuccess}
      />

      {/* Add Meeting Modal */}
      <AddMeetingModal 
        isOpen={isAddMeetingModalOpen}
        onClose={handleCloseMeetingModal}
        partyId={selectedMeetingClientId}
        onSuccess={handleMeetingSuccess}
      />
    </div>
  );
}

export default PotentialClients;
