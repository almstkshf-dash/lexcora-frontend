'use client';

import React, { useMemo, useState } from 'react';
import useSWR from 'swr';
import { useRouter } from 'next/navigation';
import { Eye, Edit, Trash2, MoreHorizontal, Phone, User, Scale, IdCard, FileText, Crown } from 'lucide-react';
import { getAllParties } from '@/app/services/api/parties';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTranslations } from '@/hooks/useTranslations';
import { cn } from '@/lib/utils';
import ExportButtons from '@/components/ui/export-buttons';
import PartiesSearchForm from '@/app/parties/PartiesSearchForm';
import AddPartyModal from '@/app/parties/AddPartyModal';
import EditPartyModal from '@/app/parties/EditPartyModal';
import DeletePartyModal from '@/app/parties/DeletePartyModal';
import CreateClientDealModal from '@/app/parties/deals/CreateClientDealModal';
import { AddMeetingModal } from '@/app/meetings/AddMeetingModal';
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

const Parties = () => {
  const { isRTL, language } = useLanguage();
  const { t } = useTranslations();
  const router = useRouter();
  
  // Pagination and search state
  const [currentPage, setCurrentPage] = useState(1);
  const [searchParams, setSearchParams] = useState({});
  const itemsPerPage = 10;
  
  const [isAddMeetingModalOpen, setIsAddMeetingModalOpen] = useState(false);
  const [selectedMeetingPartyId, setSelectedMeetingPartyId] = useState(null);
  
  // Build query parameters for API call
  const queryParams = useMemo(() => ({
    page: currentPage,
    limit: itemsPerPage,
    ...searchParams
  }), [currentPage, searchParams]);
  
  // Fetch parties data using SWR with query parameters
  const { data: partiesData, error, isLoading, mutate } = useSWR(
    ['/parties', queryParams],
    ([url, params]) => getAllParties(params),
    {
      refreshInterval: 300000, // Refresh every 5 minutes
      revalidateOnFocus: true
    }
  );

  // Process parties data
  const parties = useMemo(() => {
    if (!partiesData?.success || !partiesData?.data) return [];
    return partiesData.data;
  }, [partiesData]);
  
  // Get pagination info
  const pagination = useMemo(() => {
    return partiesData?.pagination || { total: 0, page: 1, limit: 10, totalPages: 1 };
  }, [partiesData]);

  // Helper function to get status badge
  const getStatusBadge = (status) => {
    if (!status) return null;
    
    const statusLower = status.toLowerCase();
    let variant, text, color;
    
    switch (statusLower) {
      case 'active':
        variant = 'default';
        text = language === 'ar' ? 'نشط' : 'Active';
        color = 'bg-green-100 text-green-800 hover:bg-green-100';
        break;
      case 'inactive':
        variant = 'outline';
        text = language === 'ar' ? 'غير نشط' : 'Inactive';
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

  // Helper function to get party type badge
  const getPartyTypeBadge = (partyType) => {
    if (!partyType) return null;
    
    let color, text;
    if (partyType === 'client') {
      color = 'bg-green-100 text-green-800 hover:bg-green-100';
      text = language === 'ar' ? 'موكل' : partyType;
    } else if (partyType === 'opponent') {
      color = 'bg-orange-100 text-orange-800 hover:bg-orange-100';
      text = language === 'ar' ? 'خصم' : partyType;
    } else {
      color = 'bg-gray-100 text-gray-800 hover:bg-gray-100';
      text = partyType;
    }
    
    return (
      <Badge variant="outline" className={color}>
        {text}
      </Badge>
    );
  };

  // Helper function to get VIP badge
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
  const partiesColumnConfig = {
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
      formatter: (value) => {
        if (value === 'client') {
          return language === 'ar' ? 'موكل' : 'Client'
        } else if (value === 'opponent') {
          return language === 'ar' ? 'خصم' : 'Opponent'
        }
        return value
      }
    },
    emirates_id: {
      ar: 'الهوية الإماراتية',
      en: 'Emirates ID',
      dataKey: 'emirates_id'
    },
    passport_number: {
      ar: 'رقم جواز السفر',
      en: 'Passport Number',
      dataKey: 'passport_number'
    },
    branch_name: {
      ar: 'الفرع',
      en: 'Branch',
      dataKey: 'branch_name'
    },
    nationality: {
      ar: 'الجنسية',
      en: 'Nationality',
      dataKey: 'nationality'
    },
    address: {
      ar: 'العنوان',
      en: 'Address',
      dataKey: 'address'
    },
    status: {
      ar: 'الحالة',
      en: 'Status',
      dataKey: 'status',
      type: 'status',
      statusMap: {
        'active': { ar: 'نشط', en: 'Active' },
        'inactive': { ar: 'غير نشط', en: 'Inactive' }
      }
    },
    created_at: {
      ar: 'تاريخ الإنشاء',
      en: 'Created At',
      dataKey: 'created_at',
      type: 'date'
    }
  };

  // Handle search
  const handleSearch = (params) => {
    setSearchParams({
      name: params.name || undefined,
      phone: params.phone || undefined,
      party_type: params.party_type || undefined,
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
  const handleView = (partyId) => {
    router.push(`/parties/${partyId}`);
  };

  const handleAddMeeting = (partyId) => {
    setSelectedMeetingPartyId(partyId);
    setIsAddMeetingModalOpen(true);
  };

  if (error) {
    const isPermissionError = error?.response?.status === 403;
    const errorMessage = isPermissionError 
      ? (error?.response?.data?.message || (language === 'ar' ? 'ليس لديك صلاحية لعرض الأطراف' : 'You do not have permission to view parties'))
      : (language === 'ar' ? 'حدث خطأ في تحميل البيانات' : 'Error loading data');
    
    return (
      <div className="container mx-auto p-2">
        <Card>
          <CardHeader>
            <CardTitle className={isPermissionError ? "text-amber-600" : "text-destructive"}>
              {t('common.error')}
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
      <div className={`flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0 ${isRTL ? 'text-right' : 'text-left'}`}>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t('partiesPage.title')}</h1>
          <p className="text-muted-foreground">
            {t('partiesPage.description')}
          </p>
        </div>
        <AddPartyModal onPartyAdded={() => mutate()} />
      </div>

      {/* Search Form */}
      <PartiesSearchForm onSearch={handleSearch} />

      {/* Export Buttons */}
      {parties && parties.length > 0 && !isLoading && (
        <Card>
          <CardContent className="pt-6">
            <ExportButtons
              data={parties}
              columnConfig={partiesColumnConfig}
              language={language}
              exportName="parties"
              sheetName={language === 'ar' ? 'العملاء والخصوم' : 'Clients & Opponents'}
            />
          </CardContent>
        </Card>
      )}

      {/* Parties Table */}
      <Card>
        <CardHeader>
          <CardTitle>{t('partiesPage.title')}</CardTitle>
          <CardDescription>
            {t('partiesPage.totalParties')}: {pagination.total}
            {pagination.totalPages > 1 && (
              <span className={isRTL ? 'mr-2' : 'ml-2'}>
                ({language === 'ar' ? 'صفحة' : 'Page'} {currentPage} {language === 'ar' ? 'من' : 'of'} {pagination.totalPages})
              </span>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
          ) : parties.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
              <User className="w-12 h-12 mb-4" />
              <p>{t('partiesPage.noParties')}</p>
            </div>
          ) : (
            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className={cn("font-bold", isRTL && "text-right")}>
                      {t('partiesPage.id')}
                    </TableHead>
                    <TableHead className={cn("font-bold", isRTL && "text-right")}>
                      {t('partiesPage.name')}
                    </TableHead>
                    <TableHead className={cn("font-bold", isRTL && "text-right")}>
                      {t('partiesPage.phone')}
                    </TableHead>
                    <TableHead className={cn("font-bold", isRTL && "text-right")}>
                      {t('partiesPage.partyType')}
                    </TableHead>
                    <TableHead className={cn("font-bold", isRTL && "text-right")}>
                      {t('partiesPage.vipStatus') || 'VIP'}
                    </TableHead>
                    <TableHead className={cn("font-bold", isRTL && "text-right")}>
                      {t('partiesPage.idNumber')}
                    </TableHead>
                    <TableHead className={cn("font-bold", isRTL && "text-right")}>
                      {language === 'ar' ? 'رقم جواز السفر' : 'Passport Number'}
                    </TableHead>
                    <TableHead className={cn("font-bold", isRTL && "text-right")}>
                      {language === 'ar' ? 'الفرع' : 'Branch'}
                    </TableHead>
                    <TableHead className={cn("font-bold", isRTL && "text-right")}>
                      {t('partiesPage.nationality')}
                    </TableHead>
                    <TableHead className={cn("font-bold", isRTL && "text-right")}>
                      {t('partiesPage.status')}
                    </TableHead>
                    <TableHead className={cn("font-bold text-center", isRTL && "text-right")}>
                      {t('partiesPage.actions')}
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {parties.map((party) => (
                    <TableRow 
                      key={party.id} 
                      className={cn(
                        "hover:bg-muted/50",
                        party.is_vip === 1 && "bg-gradient-to-r from-amber-50/30 to-yellow-50/30 border-l-4 border-l-amber-400"
                      )}
                    >
                      <TableCell className={cn("font-medium", isRTL && "text-right")}>
                        {party.id}
                      </TableCell>
                      <TableCell className={cn(isRTL && "text-right")}>
                        <div className="flex items-center gap-2">
                          {party.name || '-'}
                          {party.is_vip === 1 && <Crown className="w-4 h-4 text-amber-500" />}
                        </div>
                      </TableCell>
                      <TableCell className={cn(isRTL && "text-right")}>
                        <div className="flex items-center gap-2">
                          <Phone className="w-4 h-4 text-muted-foreground" />
                          {party.phone || '-'}
                        </div>
                      </TableCell>
                      <TableCell className={cn(isRTL && "text-right")}>
                        {getPartyTypeBadge(party.party_type)}
                      </TableCell>
                      <TableCell className={cn(isRTL && "text-right")}>
                        {getVipBadge(party.is_vip)}
                      </TableCell>
                      <TableCell className={cn(isRTL && "text-right")}>
                        <div className="flex items-center gap-2">
                          <IdCard className="w-4 h-4 text-muted-foreground" />
                          {party.e_id || '-'}
                        </div>
                      </TableCell>
                      <TableCell className={cn(isRTL && "text-right")}>
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-muted-foreground" />
                          {party.passport || '-'}
                        </div>
                      </TableCell>
                      <TableCell className={cn(isRTL && "text-right")}>
                        {party.branch_name || '-'}
                      </TableCell>
                      <TableCell className={cn(isRTL && "text-right")}>
                        {party.nationality || '-'}
                      </TableCell>
                      <TableCell className={cn(isRTL && "text-right")}>
                        {getStatusBadge(party.status)}
                      </TableCell>
                      <TableCell className="text-center">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align={isRTL ? "start" : "end"}>
                            <DropdownMenuItem onClick={() => handleView(party.id)}>
                              <Eye className={cn("w-4 h-4", isRTL ? "ml-2" : "mr-2")} />
                              {t('buttons.view')}
                            </DropdownMenuItem>
                            <EditPartyModal 
                              partyId={party.id} 
                              onPartyUpdated={() => mutate()}
                            >
                              <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                <Edit className={cn("w-4 h-4", isRTL ? "ml-2" : "mr-2")} />
                                {t('buttons.edit')}
                              </DropdownMenuItem>
                            </EditPartyModal>
                            <CreateClientDealModal 
                              clientId={party.id}
                              onDealCreated={() => mutate()}
                            >
                              <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                <FileText className={cn("w-4 h-4", isRTL ? "ml-2" : "mr-2")} />
                                {language === 'ar' ? 'اضافة اتفاقية جديدة' : 'Add New Deal'}
                              </DropdownMenuItem>
                            </CreateClientDealModal>
                            <DropdownMenuItem onClick={() => handleAddMeeting(party.id)}>
                              <Calendar className={cn("w-4 h-4", isRTL ? "ml-2" : "mr-2")} />
                              {t('meetings.addModal.title')}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DeletePartyModal 
                              partyId={party.id}
                              partyName={party.name}
                              onPartyDeleted={() => mutate()}
                            >
                              <DropdownMenuItem 
                                onSelect={(e) => e.preventDefault()}
                                  className="text-destructive focus:text-destructive"
                                >
                                  <Trash2 className={cn("w-4 h-4", isRTL ? "ml-2" : "mr-2")} />
                                  {t('buttons.delete')}
                                </DropdownMenuItem>
                              </DeletePartyModal>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="mt-4">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious 
                      onClick={() => currentPage > 1 && handlePageChange(currentPage - 1)}
                      className={cn(
                        currentPage === 1 && "pointer-events-none opacity-50",
                        "cursor-pointer"
                      )}
                    />
                  </PaginationItem>
                  
                  {getPageNumbers().map((pageNum, index) => {
                    if (typeof pageNum === 'string') {
                      return (
                        <PaginationItem key={`ellipsis-${index}`}>
                          <PaginationEllipsis />
                        </PaginationItem>
                      );
                    }
                    
                    return (
                      <PaginationItem key={pageNum}>
                        <PaginationLink
                          onClick={() => handlePageChange(pageNum)}
                          isActive={currentPage === pageNum}
                          className="cursor-pointer"
                        >
                          {pageNum}
                        </PaginationLink>
                      </PaginationItem>
                    );
                  })}
                  
                  <PaginationItem>
                    <PaginationNext 
                      onClick={() => currentPage < pagination.totalPages && handlePageChange(currentPage + 1)}
                      className={cn(
                        currentPage === pagination.totalPages && "pointer-events-none opacity-50",
                        "cursor-pointer"
                      )}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </CardContent>
      </Card>

      <AddMeetingModal 
        isOpen={isAddMeetingModalOpen}
        onClose={() => setIsAddMeetingModalOpen(false)}
        partyId={selectedMeetingPartyId}
        onSuccess={() => mutate()}
      />
    </div>
  );
};

export default Parties;
