'use client';

import React, { useMemo, useState } from 'react';
import useSWR from 'swr';
import { useRouter } from 'next/navigation';
import { Eye, Edit, Trash2, MoreHorizontal, FileText, Calendar, CheckSquare, Gavel, FileSearch, User, Scale, Printer } from 'lucide-react';
import { getCases } from '@/app/services/api/cases';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTranslations } from '@/hooks/useTranslations';
import { cn } from '@/lib/utils';
import AddSessionModal from '@/app/cases/modals/AddSessionModal';
import AddTaskModal from '@/app/cases/modals/AddTaskModal';
import AddCaseDegreeModal from '@/app/cases/modals/AddCaseDegreeModal';
import AddExecutionModal from '@/app/cases/[id]/edit/executions/AddExecutionModal';
import AddMemoModal from '@/app/cases/[id]/edit/memos/AddMemoModal';
import DeleteCaseModal from '@/app/cases/modals/DeleteCaseModal';
import CasesSearchForm from '@/app/cases/CasesSearchForm';
import ExportButtons from '@/app/cases/ExportButtons';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
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
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
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
  }, [casesData, language]);
  
  // Get pagination info
  const pagination = useMemo(() => {
    return casesData?.pagination || { total: 0, page: 1, limit: 10, totalPages: 1 };
  }, [casesData]);

  // Helper function to get localized text
  const getLocalizedText = (arText, enText) => {
    if (language === 'ar') {
      return arText || enText || ''; // Fallback to English if Arabic is not available
    } else {
      return enText || arText || ''; // Fallback to Arabic if English is not available
    }
  };

  // Helper function to mask sensitive data
  const maskSensitiveData = (data, isSecret) => {
    return isSecret ? '***' : data;
  };

  // Helper function to format date
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString(language === 'ar' ? 'ar-AE' : 'en-US');
  };

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

  const renderSkeletonRows = (rows = 8) => (
    <TableRow>
      <TableCell colSpan={9}>
        <div className="space-y-3">
          {Array.from({ length: rows }).map((_, idx) => (
            <div key={idx} className="grid grid-cols-9 gap-3 items-center">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <div className="flex justify-center gap-2">
                <Skeleton className="h-8 w-8 rounded-full" />
                <Skeleton className="h-8 w-8 rounded-full" />
                <Skeleton className="h-8 w-8 rounded-full" />
              </div>
            </div>
          ))}
        </div>
      </TableCell>
    </TableRow>
  );

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
          </CardHeader>
          <CardContent>
            <p>{errorMessage}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className={`container mx-auto p-2 space-y-6 ${isRTL ? 'text-right' : 'text-left'}`} dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Page Header */}
      <div className={`flex flex-col space-y-2 ${isRTL ? 'text-right' : 'text-left'}`}>
        <h1 className="text-3xl font-bold tracking-tight">{t('navigation.cases')}</h1>
        <p className="text-muted-foreground">
          {t('casesTable.title')}
        </p>
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
          {/* Export Buttons Section */}
          <div className="mb-4 pb-4 border-b">
            <ExportButtons data={cases} t={t} language={language} />
          </div>

          {isLoading ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="text-center">
                  <TableRow>
                    <TableHead className="text-center">{t('caseForm.caseNumber')}</TableHead>
                    <TableHead className="text-center">{t('casesTable.fileNumber')}</TableHead>
                    <TableHead className="text-center">{t('casesTable.topic')}</TableHead>
                    <TableHead className="text-center">{t('casesTable.court')}</TableHead>
                    <TableHead className="text-center">{t('casesTable.caseType')}</TableHead>
                    <TableHead className="text-center">{t('casesTable.classification')}</TableHead>
                    <TableHead className="text-center">{t('caseForm.startDate')}</TableHead>
                    <TableHead className="text-center">{t('casesTable.opponents')}</TableHead>
                    <TableHead className="text-center">{t('common.actions')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>{renderSkeletonRows(6)}</TableBody>
              </Table>
            </div>
          ) : cases.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {t('common.noData')}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className='text-center'>
                  <TableRow>
                    <TableHead className='text-center'>
                      {t('caseForm.caseNumber')}
                    </TableHead>
                    <TableHead className='text-center'>
                      {t('casesTable.fileNumber')}
                    </TableHead>
                    <TableHead className='text-center'>
                      {t('casesTable.topic')}
                    </TableHead>
                    <TableHead className='text-center'>
                      {t('casesTable.court')}
                    </TableHead>
                    <TableHead className='text-center'>
                      {t('casesTable.caseType')}
                    </TableHead>
                    <TableHead className='text-center'>
                      {t('casesTable.classification')}
                    </TableHead>
                    <TableHead className='text-center'>
                      {t('caseForm.startDate')}
                    </TableHead>
                    <TableHead className='text-center'>
                      {t('casesTable.clientParties')}
                    </TableHead>
                    <TableHead className='text-center'>
                      {t('casesTable.opponentParties')}
                    </TableHead>
                    <TableHead className='text-center'>
                      {t('casesTable.flags')}
                    </TableHead>
                    <TableHead className='text-center'>
                      {t('casesTable.actions')}
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {cases.map((case_) => (
                    <TableRow key={case_.id}>
                      <TableCell className="font-medium">
                        {case_.case_number}
                      </TableCell>
                      <TableCell>
                        {maskSensitiveData(case_.file_number, case_.is_secret)}
                      </TableCell>
                      <TableCell>
                        {maskSensitiveData(case_.topic, case_.is_secret)}
                      </TableCell>
                      <TableCell>
                        {maskSensitiveData(
                          getLocalizedText(case_.court_ar, case_.court_en),
                          case_.is_secret
                        )}
                      </TableCell>
                      <TableCell>
                        {maskSensitiveData(
                          getLocalizedText(case_.case_type_ar, case_.case_type_en),
                          case_.is_secret
                        )}
                      </TableCell>
                      <TableCell>
                        {maskSensitiveData(
                          getLocalizedText(case_.case_classification_ar, case_.case_classification_en),
                          case_.is_secret
                        )}
                      </TableCell>
                      <TableCell>
                        {maskSensitiveData(formatDate(case_.start_date), case_.is_secret)}
                      </TableCell>
                      <TableCell>
                        {case_.is_secret ? (
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-muted-foreground" />
                            <span>***</span>
                          </div>
                        ) : (
                          <div className="space-y-1">
                            {case_.clientParties?.map((party, index) => (
                              <div key={index} className="flex items-center gap-2">
                                <User className="h-4 w-4 text-blue-600" />
                                <span className="text-sm">{party}</span>
                              </div>
                            )) || (
                              <div className="flex items-center gap-2 text-muted-foreground">
                                <User className="h-4 w-4" />
                                <span className="text-sm">-</span>
                              </div>
                            )}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        {case_.is_secret ? (
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-muted-foreground" />
                            <span>***</span>
                          </div>
                        ) : (
                          <div className="space-y-1">
                            {case_.opponentParties?.map((party, index) => (
                              <div key={index} className="flex items-center gap-2">
                                <User className="h-4 w-4 text-red-600" />
                                <span className="text-sm">{party}</span>
                              </div>
                            )) || (
                              <div className="flex items-center gap-2 text-muted-foreground">
                                <User className="h-4 w-4" />
                                <span className="text-sm">-</span>
                              </div>
                            )}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1 flex-wrap">
                          {case_.is_important === 1 && (
                            <Badge variant="destructive" className="text-xs">
                              {t('caseToggles.isImportant')}
                            </Badge>
                          )}
                          {case_.is_secret === 1 && (
                            <Badge variant="outline" className="text-xs">
                              {t('caseToggles.isSecret')}
                            </Badge>
                          )}
                          {case_.is_archived === 1 && (
                            <Badge variant="secondary" className="text-xs">
                              {t('caseToggles.isArchived')}
                            </Badge>
                          )}
                          {case_.is_pending === 1 && (
                            <Badge variant="outline" className="text-xs bg-orange-100 text-orange-800 border-orange-300">
                              {t('caseToggles.isPending')}
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu dir={isRTL ? 'rtl' : 'ltr'}>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <span className="sr-only">Open menu</span>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align={isRTL ? 'start' : 'end'}>
                            {/* <DropdownMenuItem onClick={() => handleView(case_.id)}>
                              <Eye className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                              {t('casesTable.view')}
                            </DropdownMenuItem> */}
                            <DropdownMenuItem onClick={() => handleEdit(case_.id)}>
                              <Edit className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                              {t('casesTable.edit')}
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handlePrint(case_.id)}>
                              <Printer className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                              {language === 'ar' ? 'طباعة الملف' : 'Print Case'}
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
                              {language === 'ar' ? 'اضافة درجة تقاضي' : 'Add Court Level'}
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
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
          
          {/* Pagination Controls */}
          {!isLoading && cases.length > 0 && pagination.totalPages > 1 && (
            <div className="mt-6 flex items-center justify-center">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      onClick={() => currentPage > 1 && handlePageChange(currentPage - 1)}
                      className={cn(
                        currentPage === 1 && 'pointer-events-none opacity-50',
                        'cursor-pointer'
                      )}
                    >
                      {language === 'ar' ? 'السابق' : 'Previous'}
                    </PaginationPrevious>
                  </PaginationItem>
                  
                  {getPageNumbers().map((page, index) => {
                    if (page === 'ellipsis-start' || page === 'ellipsis-end') {
                      return (
                        <PaginationItem key={`ellipsis-${index}`}>
                          <PaginationEllipsis />
                        </PaginationItem>
                      );
                    }
                    
                    return (
                      <PaginationItem key={page}>
                        <PaginationLink
                          onClick={() => handlePageChange(page)}
                          isActive={currentPage === page}
                          className="cursor-pointer"
                        >
                          {page}
                        </PaginationLink>
                      </PaginationItem>
                    );
                  })}
                  
                  <PaginationItem>
                    <PaginationNext
                      onClick={() => currentPage < pagination.totalPages && handlePageChange(currentPage + 1)}
                      className={cn(
                        currentPage === pagination.totalPages && 'pointer-events-none opacity-50',
                        'cursor-pointer'
                      )}
                    >
                      {language === 'ar' ? 'التالي' : 'Next'}
                    </PaginationNext>
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
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
