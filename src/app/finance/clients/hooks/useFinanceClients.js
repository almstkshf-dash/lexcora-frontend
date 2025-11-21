import { useState, useEffect, useMemo } from "react";
import useSWR from "swr";
import { getClientsForFinance } from "@/app/services/api/parties";
import { ITEMS_PER_PAGE, SEARCH_DEBOUNCE_DELAY } from "../constants";

/**
 * Custom hook for managing finance clients data and state
 * Handles data fetching, pagination, search, and client selection
 */
export const useFinanceClients = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedClient, setSelectedClient] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Debounce search term
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm.trim());
    }, SEARCH_DEBOUNCE_DELAY);

    return () => clearTimeout(handler);
  }, [searchTerm]);

  // Fetch clients data
  const { data, error, isLoading, isValidating } = useSWR(
    `/parties/finance-clients?page=${currentPage}&limit=${ITEMS_PER_PAGE}&search=${debouncedSearchTerm}`,
    () => getClientsForFinance(currentPage, ITEMS_PER_PAGE, debouncedSearchTerm),
    {
      keepPreviousData: true,
      revalidateOnFocus: false,
    }
  );

  const isInitialLoading = !data && isLoading;
  const isRefreshing = isValidating && !!data;

  // Derived state
  const clients = useMemo(() => data?.data || [], [data]);
  const pagination = useMemo(() => data?.pagination || {}, [data]);
  const hasClients = clients.length > 0;

  // Handlers
  const handleSearch = (value) => {
    setSearchTerm(value);
    setCurrentPage(1); // Reset to first page when searching
  };

  const handleViewClient = (client) => {
    setSelectedClient(client);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedClient(null);
  };

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, pagination.totalPages || 1));
  };

  const handlePreviousPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  const handlePageChange = (page) => {
    const target = Math.max(1, Math.min(page, data?.pagination?.totalPages || 1));
    setCurrentPage(target);
  };

  return {
    // Data
    clients,
    pagination,
    hasClients,
    selectedClient,
    
    // Loading states
    isInitialLoading,
    isRefreshing,
    error,
    
    // Search
    searchTerm,
    handleSearch,
    
    // Pagination
    currentPage,
    handleNextPage,
    handlePreviousPage,
    handlePageChange,
    
    // Modal
    isModalOpen,
    handleViewClient,
    handleCloseModal,
  };
};
