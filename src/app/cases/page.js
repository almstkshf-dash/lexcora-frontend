'use client';

import React, { useMemo, useState } from 'react';
import useSWR from 'swr';
import { useRouter } from 'next/navigation';
import { Edit, Trash2, MoreHorizontal, FileText, Calendar, CheckSquare, Gavel, FileSearch, User, Scale, Printer, Plus, RefreshCw } from 'lucide-react';
import { getCases } from '@/app/services/api/cases';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTranslations } from '@/hooks/useTranslations';
import { cn } from '@/lib/utils';
import PageHeader from '@/components/PageHeader';
import AddSessionModal from '@/app/cases/modals/AddSessionModal';
import AddTaskModal from '@/app/cases/modals/AddTaskModal';
import AddCaseDegreeModal from '@/app/cases/modals/AddCaseDegreeModal';
import AddExecutionModal from '@/app/cases/[id]/edit/executions/AddExecutionModal';
import AddMemoModal from '@/app/cases/[id]/edit/memos/AddMemoModal';
import DeleteCaseModal from '@/app/cases/modals/DeleteCaseModal';
import CasesSearchForm from '@/app/cases/CasesSearchForm';
import ExportButtons from '@/app/cases/ExportButtons';
import DataTable from '@/components/DataTable';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

const CasesPage = () => {
  const { isRTL, language } = useLanguage();
  const { t } = useTranslations();
  const router = useRouter();
  
  // Modal state
  const [isAddSessionModalOpen, setIsAddSessionModalOpen] = useState(false);
  const [isAddTaskModalOpen, setIsAddTaskModalOpen] = useState(false);
  const [isAddCaseDegreeModalOpen, setIsAddCaseDegreeModalOpen] = useState(false);
  const [isAddExecutionModalOpen, setIsAddExecutionModalOpen] = useState(false);
  const [isAddMemoModalOpen, setIsAddMemoModalOpen] = useState(false);
  const [isDeleteCaseModalOpen, setIsDeleteCaseModalOpen] = useState(false);
  const [selectedCaseId, setSelectedCaseId] = useState(null);
  const [selectedCaseForDelete, setSelectedCaseForDelete] = useState(null);
  
  // Pagination and search state
  const [currentPage, setCurrentPage] = useState(1);
  const [searchParams, setSearchParams] = useState({});
  const itemsPerPage = 10;
  
  // Build query parameters for API call
  const queryParams = useMemo(() => ({
    page: currentPage,
    limit: itemsPerPage,
    ...searchParams
  }), [currentPage, searchParams]);
  
  // Fetch cases data using SWR with query parameters
  const { data: casesData, error, isLoading, mutate } = useSWR(
    ['/cases', queryParams],
    ([url, params]) => getCases(params),
    {
      refreshInterval: 300000, // Refresh every 5 minutes
      revalidateOnFocus: true
    }
  );

  // Process cases data
  const cases = useMemo(() => {
    if (!casesData?.success || !casesData?.data) return [];
    return casesData.data;
  }, [casesData]);
  
  // Get pagination info
  const pagination = useMemo(() => {
    return casesData?.pagination || { total: 0, page: 1, limit: 10, totalPages: 1 };
  }, [casesData]);

  const lastSynced = useMemo(() => {
    if (!casesData) return null;
    try {
      return new Date().toLocaleTimeString(language === 'ar' ? 'ar-AE' : 'en-US');
    } catch (e) {
      return null;
    }
  }, [casesData, language]);

  // Helper function to get localized text
  const getLocalizedText = React.useCallback((arText, enText) => {
    if (language === 'ar') {
      return arText || enText || ''; // Fallback to English if Arabic is not available
    } else {
      return enText || arText || ''; // Fallback to Arabic if English is not available
    }
  }, [language]);

  // Helper function to mask sensitive data
  const maskSensitiveData = React.useCallback((data, isSecret) => {
    return isSecret ? '***' : data;
  }, []);

  // Helper function to format date
  const formatDate = React.useCallback((dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString(language === 'ar' ? 'ar-AE' : 'en-US');
  }, [language]);

  // Helper function to get status badge
  const getStatusBadge = (status) => {
    if (!status) return null;
    
    const statusLower = status.toLowerCase();
    let variant, text, color;
    
    switch (statusLower) {
      case 'active':
        variant = 'default';
        text = language === 'ar' ? 'نشطة' : 'Active';
        color = 'bg-green-100 text-green-800 hover:bg-green-100';
        break;
      case 'pending':
        variant = 'secondary';
        text = language === 'ar' ? 'قيد الانتظار' : 'Pending';
        color = 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100';
        break;
      case 'inactive':
        variant = 'outline';
        text = language === 'ar' ? 'غير نشطة' : 'Inactive';
        color = 'bg-gray-100 text-gray-800 hover:bg-gray-100';
        break;
      default:
        variant = 'outline';
        text = status;
        color = 'bg-gray-100 text-gray-800 hover:bg-gray-100';
    }
    
    return (
      <Badge variant={variant} className={color}>
        {text}
      </Badge>
    );
  };

  // Handle search
  const handleSearch = (params) => {
    setSearchParams({
      branchId: params.branchId || undefined,
      fromDate: params.fromDate || undefined,
      toDate: params.toDate || undefined,
      fileNumber: params.fileNumber || undefined,
      caseNumber: params.caseNumber || undefined,
    });
    setCurrentPage(1); // Reset to first page when searching
  };

  // Handle page change
  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Generate page numbers for pagination
  const getPageNumbers = () => {
    const pages = [];
    const { totalPages } = pagination;
    const current = currentPage;
    
    if (totalPages <= 7) {
      // Show all pages if 7 or fewer
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always show first page
      pages.push(1);
      
      if (current > 3) {
        pages.push('ellipsis-start');
      }
      
      // Show pages around current page
      for (let i = Math.max(2, current - 1); i <= Math.min(totalPages - 1, current + 1); i++) {
        pages.push(i);
      }
      
      if (current < totalPages - 2) {
        pages.push('ellipsis-end');
      }
      
      // Always show last page
      pages.push(totalPages);
    }
    
    return pages;
  };

  // Action handlers
  const handleView = (caseId) => {
    // TODO: Implement view functionality
  };

  const handleEdit = (caseId) => {
    router.push(`/cases/${caseId}/edit`);
  };

  const handleDelete = (case_) => {
    setSelectedCaseForDelete(case_);
    setIsDeleteCaseModalOpen(true);
  };

  const handleDeleteSuccess = () => {
    // Refresh the cases data after successful deletion
    mutate();
  };

  const handleAddNote = (caseId) => {
    setSelectedCaseId(caseId);
    setIsAddMemoModalOpen(true);
  };

  const handleAddSession = (caseId) => {
    setSelectedCaseId(caseId);
    setIsAddSessionModalOpen(true);
  };

  const handleSessionAdded = (newSession) => {
    // Refresh the cases data to show any updates
    mutate();
  };

  const handleAddTask = (caseId) => {
    setSelectedCaseId(caseId);
    setIsAddTaskModalOpen(true);
  };

  const handleTaskAdded = (newTask) => {
    // Refresh the cases data to show any updates
    mutate();
  };

  const handleAddExecution = (caseId) => {
    setSelectedCaseId(caseId);
    setIsAddExecutionModalOpen(true);
  };

  const handleAddPetition = (caseId) => {
    // TODO: Implement add petition functionality
  };

  const handleAddCourtLevel = (caseId) => {
    setSelectedCaseId(caseId);
    setIsAddCaseDegreeModalOpen(true);
  };

  const handleCaseDegreeAdded = (newCaseDegree) => {
    // Refresh the cases data to show any updates
    mutate();
  };

  const handleMemoAdded = () => {
    // Refresh the cases data to show any updates
    mutate();
  };

  const handlePrint = (caseId) => {
    router.push(`/cases/${caseId}`);
  };

  const resolveLabel = (key, fallback) => {
    const value = t(key);
    if (!value || value === key || value === key.toLowerCase() || value === key.toUpperCase()) {
      return fallback;
    }
    return value;
  };

  const caseNumberLabel = resolveLabel(
    'casesTable.caseNumber',
    language === 'ar' ? 'رقم القضية' : 'Case Number'
  );
  const fileNumberLabel = resolveLabel(
    'casesTable.fileNumber',
    language === 'ar' ? 'رقم الملف' : 'File Number'
  );
  const topicLabel = resolveLabel('casesTable.topic', language === 'ar' ? 'الموضوع' : 'Topic');
  const courtLabel = resolveLabel('casesTable.court', language === 'ar' ? 'المحكمة' : 'Court');
  const caseTypeLabel = resolveLabel(
    'casesTable.caseType',
    language === 'ar' ? 'نوع القضية' : 'Case Type'
  );
  const classificationLabel = resolveLabel(
    'casesTable.classification',
    language === 'ar' ? 'التصنيف' : 'Classification'
  );
  const clientPartiesLabel = resolveLabel(
    'casesTable.clientParties',
    language === 'ar' ? 'الطرف الموكل' : 'Client Parties'
  );
  const opponentPartiesLabel = resolveLabel(
    'casesTable.opponentParties',
    language === 'ar' ? 'الطرف الخصم' : 'Opponent Parties'
  );
  const startDateLabel = resolveLabel(
    'caseForm.startDate',
    language === 'ar' ? 'تاريخ بدء القضية' : 'Start Date'
  );

  const caseColumns = useMemo(() => [
    {
      id: 'case_number',
      header: caseNumberLabel,
      accessor: 'case_number',
      sortable: true,
      searchable: true,
      searchPlaceholder: caseNumberLabel,
      headerClassName: 'text-center whitespace-normal min-w-[80px]',
      cellClassName: 'font-medium whitespace-normal break-words text-center text-xs lg:text-sm',
    },
    {
      id: 'file_number',
      header: fileNumberLabel,
      sortable: true,
      searchable: true,
      searchPlaceholder: fileNumberLabel,
      headerClassName: 'text-center whitespace-normal min-w-[80px]',
      cellClassName: 'whitespace-normal break-words text-center',
      accessor: (row) => maskSensitiveData(row.file_number, row.is_secret),
    },
    {
      id: 'topic',
      header: topicLabel,
      sortable: true,
      searchable: true,
      searchPlaceholder: topicLabel,
      headerClassName: 'text-center whitespace-normal min-w-[100px]',
      cellClassName: 'text-center whitespace-normal break-words max-w-[150px] lg:max-w-[200px]',
      cell: (row) => {
        const val = maskSensitiveData(row.topic, row.is_secret);
        return (
          <div title={val} className="line-clamp-2 w-full">
            {val}
          </div>
        );
      },
    },
    {
      id: 'court',
      header: courtLabel,
      sortable: true,
      searchable: true,
      searchPlaceholder: courtLabel,
      headerClassName: 'text-center whitespace-normal min-w-[90px]',
      cellClassName: 'text-center whitespace-normal break-words max-w-[120px] lg:max-w-[150px]',
      cell: (row) => {
        const val = maskSensitiveData(getLocalizedText(row.court_ar, row.court_en), row.is_secret);
        return (
          <div title={val} className="line-clamp-2 w-full">
            {val}
          </div>
        );
      },
    },
    {
      id: 'case_type',
      header: caseTypeLabel,
      sortable: true,
      searchable: true,
      searchPlaceholder: caseTypeLabel,
      headerClassName: 'text-center whitespace-normal min-w-[80px]',
      cellClassName: 'text-center whitespace-normal break-words',
      accessor: (row) => maskSensitiveData(getLocalizedText(row.case_type_ar, row.case_type_en), row.is_secret),
    },
    {
      id: 'classification',
      header: classificationLabel,
      sortable: true,
      searchable: true,
      searchPlaceholder: classificationLabel,
      headerClassName: 'text-center whitespace-normal min-w-[90px]',
      cellClassName: 'text-center whitespace-normal break-words',
      accessor: (row) =>
        maskSensitiveData(
          getLocalizedText(row.case_classification_ar, row.case_classification_en),
          row.is_secret
        ),
    },
    {
      id: 'start_date',
      header: startDateLabel,
      sortable: true,
      headerClassName: 'text-center whitespace-normal min-w-[80px]',
      cellClassName: 'text-center whitespace-normal break-words',
      accessor: (row) => maskSensitiveData(formatDate(row.start_date), row.is_secret),
    },
    {
      id: 'clientParties',
      header: clientPartiesLabel,
      searchable: true,
      searchPlaceholder: clientPartiesLabel,
      headerClassName: 'text-center whitespace-normal min-w-[120px]',
      cellClassName: 'text-center whitespace-normal break-words max-w-[150px] lg:max-w-[200px]',
      accessor: (row) =>
        row.is_secret
          ? '***'
          : (row.clientParties || []).join(', '),
      cell: (row) => {
        if (row.is_secret) return <span className="text-muted-foreground">***</span>;
        const val = (row.clientParties || []).join(', ');
        return (
          <div title={val} className="flex items-center justify-center gap-1.5 w-full">
            <User className="h-3.5 w-3.5 text-blue-500 shrink-0" />
            <span className="text-xs line-clamp-1 text-center">{val || '-'}</span>
          </div>
        );
      },
    },
    {
      id: 'opponentParties',
      header: opponentPartiesLabel,
      searchable: true,
      searchPlaceholder: opponentPartiesLabel,
      headerClassName: 'text-center whitespace-normal min-w-[120px]',
      cellClassName: 'text-center whitespace-normal break-words max-w-[150px] lg:max-w-[200px]',
      accessor: (row) =>
        row.is_secret
          ? '***'
          : (row.opponentParties || []).join(', '),
      cell: (row) => {
        if (row.is_secret) return <span className="text-muted-foreground">***</span>;
        const val = (row.opponentParties || []).join(', ');
        return (
          <div title={val} className="flex items-center justify-center gap-1.5 w-full">
            <User className="h-3.5 w-3.5 text-amber-500 shrink-0" />
            <span className="text-xs line-clamp-1 text-center">{val || '-'}</span>
          </div>
        );
      },
    },
    {
      id: 'flags',
      header: t('casesTable.flags'),
      headerClassName: 'text-center',
      cell: (row) => (
        <div className="flex gap-1 flex-wrap">
          {row.is_important === 1 && (
            <Badge variant="destructive" className="text-xs">
              {t('caseToggles.isImportant')}
            </Badge>
          )}
          {row.is_secret === 1 && (
            <Badge variant="outline" className="text-xs">
              {t('caseToggles.isSecret')}
            </Badge>
          )}
          {row.is_archived === 1 && (
            <Badge variant="secondary" className="text-xs">
              {t('caseToggles.isArchived')}
            </Badge>
          )}
          {row.is_pending === 1 && (
            <Badge variant="outline" className="text-xs bg-orange-100 text-orange-800 border-orange-300">
              {t('caseToggles.isPending')}
            </Badge>
          )}
        </div>
      ),
    },
  ], [caseNumberLabel, caseTypeLabel, classificationLabel, clientPartiesLabel, courtLabel, fileNumberLabel, formatDate, getLocalizedText, maskSensitiveData, opponentPartiesLabel, startDateLabel, t, topicLabel]);

  if (error) {
    // Check if it's a permission error (403)
    const isPermissionError = error?.response?.status === 403;
    const errorMessage = isPermissionError 
      ? (error?.response?.data?.message || (language === 'ar' ? 'ليس لديك صلاحية لعرض القضايا' : 'You do not have permission to view cases'))
      : (language === 'ar' ? 'حدث خطأ أثناء تحميل البيانات' : 'An error occurred while loading data');
    
    return (
      <div className="container mx-auto p-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-destructive">
              {isPermissionError 
                ? (language === 'ar' ? 'غير مصرح' : 'Unauthorized')
                : t('common.error')
              }
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              {errorMessage}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-end">
            <Button variant="outline" onClick={() => mutate()}>
              {t('common.retry') || (language === 'ar' ? 'إعادة المحاولة' : 'Retry')}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const headerActions = (
    <div className="flex items-center gap-3">
      <Button
        size="sm"
        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white shadow-md transition-all hover:scale-105 active:scale-95"
        onClick={() => router.push('/cases/add-case')}
      >
        <Plus className="w-4 h-4" />
        {t('navigation.addCaseFile')}
      </Button>
      <Button
        size="sm"
        variant="outline"
        className="shadow-sm hover:bg-accent transition-all hover:scale-105 active:scale-95"
        onClick={() => router.push('/cases/my-tasks')}
      >
        {t('navigation.myTasks')}
      </Button>
    </div>
  );



  const renderCaseActions = (case_) => (
    <DropdownMenu dir={isRTL ? 'rtl' : 'ltr'}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <span className="sr-only">Open menu</span>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align={isRTL ? 'start' : 'end'}>
        <DropdownMenuItem onClick={() => handleEdit(case_.id)}>
          <Edit className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
          {t('casesTable.edit')}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handlePrint(case_.id)}>
          <Printer className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
          {language === 'ar' ? 'طباعة القضية' : 'Print Case'}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => handleAddNote(case_.id)}>
          <FileText className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
          {t('casesTable.addNote')}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleAddSession(case_.id)}>
          <Calendar className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
          {t('casesTable.addSession')}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleAddTask(case_.id)}>
          <CheckSquare className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
          {t('casesTable.addTask')}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleAddExecution(case_.id)}>
          <Gavel className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
          {t('casesTable.addExecution')}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleAddPetition(case_.id)}>
          <FileSearch className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
          {t('casesTable.addPetition')}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleAddCourtLevel(case_.id)}>
          <Scale className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
          {language === 'ar' ? 'إضافة مرحلة قضائية' : 'Add Court Level'}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem 
          onClick={() => handleDelete(case_)}
          className="text-destructive focus:text-destructive"
        >
          <Trash2 className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
          {t('casesTable.delete')}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  return (
    <div className={`container mx-auto p-4 md:p-6 space-y-8 ${isRTL ? 'text-right' : 'text-left'}`} dir={isRTL ? 'rtl' : 'ltr'}>
      <PageHeader
        title={t('navigation.cases')}
        description={t('casesTable.title')}
        breadcrumbs={[
          { label: t('navigation.dashboard'), href: '/' },
          { label: t('navigation.cases') },
        ]}
        actions={headerActions}
        contextMeta={{
          title: t('navigation.cases'),
          lastSynced: lastSynced || undefined,
          action: (
            <Button variant="ghost" size="sm" onClick={() => mutate()} className="h-7 px-2 hover:bg-transparent text-muted-foreground hover:text-foreground">
              <RefreshCw className="h-3 w-3 ml-1" />
              {t('common.refresh') || (language === 'ar' ? 'تحديث' : 'Refresh')}
            </Button>
          ),
        }}
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-blue-50/30 border-blue-100 dark:bg-blue-900/10 dark:border-blue-900/20">
          <CardHeader className="pb-2">
            <CardDescription className="text-blue-600 dark:text-blue-400 font-medium">
              {t('casesTable.totalCases')}
            </CardDescription>
            <CardTitle className="text-2xl font-bold">{pagination.total}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="bg-green-50/30 border-green-100 dark:bg-green-900/10 dark:border-green-900/20">
          <CardHeader className="pb-2">
            <CardDescription className="text-green-600 dark:text-green-400 font-medium">
              {language === 'ar' ? 'نشطة' : 'Active'}
            </CardDescription>
            <CardTitle className="text-2xl font-bold">
              {cases.filter(c => c.status?.toLowerCase() === 'active').length}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card className="bg-amber-50/30 border-amber-100 dark:bg-amber-900/10 dark:border-amber-900/20">
          <CardHeader className="pb-2">
            <CardDescription className="text-amber-600 dark:text-amber-400 font-medium">
              {language === 'ar' ? 'قيد الانتظار' : 'Pending'}
            </CardDescription>
            <CardTitle className="text-2xl font-bold">
              {cases.filter(c => c.status?.toLowerCase() === 'pending' || c.is_pending === 1).length}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card className="bg-rose-50/30 border-rose-100 dark:bg-rose-900/10 dark:border-rose-900/20">
          <CardHeader className="pb-2">
            <CardDescription className="text-rose-600 dark:text-rose-400 font-medium">
              {t('caseToggles.isImportant') || (language === 'ar' ? 'هامة' : 'Important')}
            </CardDescription>
            <CardTitle className="text-2xl font-bold">
              {cases.filter(c => c.is_important === 1).length}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Search Form */}
      <CasesSearchForm onSearch={handleSearch} />

      {/* Cases Table */}
      <Card>
        <CardHeader>
          <CardTitle>{t('navigation.cases')}</CardTitle>
          <CardDescription>
            {t('casesTable.totalCases')}: {pagination.total}
            {pagination.totalPages > 1 && (
              <span className={isRTL ? 'mr-2' : 'ml-2'}>
                ({language === 'ar' ? 'صفحة' : 'Page'} {currentPage} {language === 'ar' ? 'من' : 'of'} {pagination.totalPages})
              </span>
            )}
          </CardDescription>
        </CardHeader>
                <CardContent>
        <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
          <div className="flex items-center gap-3">
            <ExportButtons data={cases} t={t} language={language} />
          </div>
          {pagination.totalPages > 1 && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>
                {language === 'ar' ? 'الصفحة' : 'Page'} {currentPage} {language === 'ar' ? 'من' : 'of'} {pagination.totalPages}
              </span>
            </div>
          )}
        </div>
          <DataTable
            data={cases}
            columns={caseColumns}
            rowKey="id"
            isLoading={isLoading}
            emptyMessage={t('common.noData')}
            rowActions={renderCaseActions}
            actionsLabel={t('casesTable.actions')}
            dir={isRTL ? 'rtl' : 'ltr'}
            stickyHeader
            zebra
            density="normal"
            pagination={{
              page: currentPage,
              totalPages: pagination.totalPages || 1,
              onPageChange: handlePageChange,
            }}
          />
        </CardContent>
      </Card>

      {/* Add Session Modal */}
      <AddSessionModal
        isOpen={isAddSessionModalOpen}
        onClose={() => setIsAddSessionModalOpen(false)}
        caseId={selectedCaseId}
        onSessionAdded={handleSessionAdded}
      />

      {/* Add Task Modal */}
      <AddTaskModal
        isOpen={isAddTaskModalOpen}
        onClose={() => setIsAddTaskModalOpen(false)}
        caseId={selectedCaseId}
        onTaskAdded={handleTaskAdded}
      />

      {/* Add Case Degree Modal */}
      <AddCaseDegreeModal
        isOpen={isAddCaseDegreeModalOpen}
        onClose={() => setIsAddCaseDegreeModalOpen(false)}
        caseId={selectedCaseId}
        onCaseDegreeAdded={handleCaseDegreeAdded}
      />

      {/* Add Execution Modal */}
      <AddExecutionModal
        isOpen={isAddExecutionModalOpen}
        onClose={() => setIsAddExecutionModalOpen(false)}
        caseId={selectedCaseId}
      />

      {/* Add Memo Modal */}
      <AddMemoModal
        isOpen={isAddMemoModalOpen}
        onClose={() => setIsAddMemoModalOpen(false)}
        caseId={selectedCaseId}
        onSuccess={handleMemoAdded}
      />

      {/* Delete Case Modal */}
      <DeleteCaseModal
        isOpen={isDeleteCaseModalOpen}
        onClose={() => setIsDeleteCaseModalOpen(false)}
        caseData={selectedCaseForDelete}
        onSuccess={handleDeleteSuccess}
      />
    </div>
  );
};

export default CasesPage;

