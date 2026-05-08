"use client";

import { useState } from "react";
import { useTranslations } from "@/hooks/useTranslations";
import { useLanguage } from "@/contexts/LanguageContext";
import useSWR from "swr";
import { getAllSessions } from "@/app/services/api/sessions";
import { getBranches } from "@/app/services/api/branches";
import { format } from "date-fns";
import { toast } from "react-toastify";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MoreHorizontal, Eye, Edit, Trash2, Search, Filter, ExternalLink, CalendarIcon, X, ChevronLeft, ChevronRight, Plus, UserCheck, FileText } from "lucide-react";
import { cn } from "@/lib/utils";
import EditSessionModal from "./EditSessionModal";
import DeleteSessionDialog from "./DeleteSessionDialog";
import SessionsExportButtons from "./SessionsExportButtons";
import AddSessionModal from "@/app/cases/modals/AddSessionModal";
import { deleteSession } from "@/app/services/api/sessions";
import { useRouter } from "next/navigation";

export default function SessionsPage() {
  const { t } = useTranslations();
  const { language } = useLanguage();
  const isRtl = language === "ar";
  const router = useRouter();
  
  // Modal state
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedSessionId, setSelectedSessionId] = useState(null);
  
  // Add session modal state
  const [isAddSessionModalOpen, setIsAddSessionModalOpen] = useState(false);
  const [selectedCaseId, setSelectedCaseId] = useState(null);
  
  // Delete dialog state
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [sessionToDelete, setSessionToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Filter state
  const [filterParams, setFilterParams] = useState({
    caseNumber: '',
    fileNumber: '',
    fromDate: undefined,
    toDate: undefined,
    branchId: ''
  });

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);

  // Applied filters (actually used in API call)
  const [appliedFilters, setAppliedFilters] = useState({
    caseNumber: '',
    fileNumber: '',
    fromDate: undefined,
    toDate: undefined,
    branchId: ''
  });

  // Build query parameters for API
  const buildQueryParams = () => {
    const params = {
      page: currentPage,
      limit: pageSize
    };

    if (appliedFilters.caseNumber) {
      params.caseNumber = appliedFilters.caseNumber;
    }
    if (appliedFilters.fileNumber) {
      params.fileNumber = appliedFilters.fileNumber;
    }
    if (appliedFilters.fromDate) {
      params.fromDate = format(appliedFilters.fromDate, 'yyyy-MM-dd');
    }
    if (appliedFilters.toDate) {
      params.toDate = format(appliedFilters.toDate, 'yyyy-MM-dd');
    }
    if (appliedFilters.branchId) {
      params.branchId = appliedFilters.branchId;
    }

    return params;
  };

  // Fetch sessions data using SWR with query parameters
  const {
    data: sessionsData,
    error,
    isLoading,
    mutate,
  } = useSWR(
    ["sessions", buildQueryParams()],
    ([_, params]) => getAllSessions(params)
  );

  // Fetch branches data
  const { data: branchesData, isLoading: branchesLoading } = useSWR(
    '/branches',
    getBranches,
    {
      refreshInterval: 300000,
      revalidateOnFocus: false
    }
  );

  const sessions = sessionsData?.data || [];
  const branches = Array.isArray(branchesData?.data) ? branchesData.data : Array.isArray(branchesData) ? branchesData : [];
  const totalPages = sessionsData?.totalPages || 1;
  const totalSessions = sessionsData?.total || 0;

  // Handle search button click
  const handleSearch = () => {
    setAppliedFilters({ ...filterParams }); // Apply the filters
    setCurrentPage(1); // Reset to first page when searching
  };

  // Handle reset button click
  const handleReset = () => {
    const resetFilters = {
      caseNumber: '',
      fileNumber: '',
      fromDate: undefined,
      toDate: undefined,
      branchId: ''
    };
    setFilterParams(resetFilters);
    setAppliedFilters(resetFilters); // Also reset applied filters
    setCurrentPage(1);
  };

  // Handle page change
  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  // Group sessions by date and sort by most recent first
  const groupSessionsByDate = () => {
    const grouped = {};
    
    sessions.forEach(session => {
      // Extract just the date part (YYYY-MM-DD) from session_date
      // Handle different date formats and ensure consistent extraction
      let dateStr;
      if (session.session_date.includes('T')) {
        dateStr = session.session_date.split('T')[0];
      } else if (session.session_date.includes(' ')) {
        dateStr = session.session_date.split(' ')[0];
      } else {
        dateStr = session.session_date.substring(0, 10);
      }
      
      if (!grouped[dateStr]) {
        grouped[dateStr] = [];
      }
      grouped[dateStr].push(session);
    });
    
    // Convert to array and sort by date (most recent first)
    return Object.entries(grouped)
      .sort((a, b) => {
        const dateA = new Date(a[0]);
        const dateB = new Date(b[0]);
        return dateB - dateA; // Most recent first (descending order)
      })
      .map(([date, sessions]) => ({
        date,
        sessions: sessions.sort((a, b) => {
          const timeA = new Date(a.session_date);
          const timeB = new Date(b.session_date);
          return timeB - timeA; // Most recent time first (descending order)
        })
      }));
  };

  const sessionsByDate = groupSessionsByDate();

  const formatDateHeader = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString(isRtl ? "ar-AE" : "en-US", {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleView = (session) => {
    // TODO: Implement view functionality
  };

  const handleShowFile = (session) => {
    router.push(`/cases/${session.case_id}/edit`);
  };

  const handleAddSession = (session) => {
    setSelectedCaseId(session.case_id);
    setIsAddSessionModalOpen(true);
  };

  const handleEdit = (session) => {
    setSelectedSessionId(session.id);
    setIsEditModalOpen(true);
  };

  const handleDelete = (session) => {
    setSessionToDelete(session);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async (sessionId) => {
    try {
      setIsDeleting(true);
      await deleteSession(sessionId);
      
      // Refresh the sessions data
      mutate();
      
      // Close the dialog and reset state
      setIsDeleteDialogOpen(false);
      setSessionToDelete(null);
      
      toast.success(language === 'ar' ? 'تم حذف الجلسة بنجاح' : 'Session deleted successfully');
    } catch (error) {
      // Check if it's a permission error (403)
      const isPermissionError = error?.response?.status === 403;
      const errorMessage = isPermissionError 
        ? (error?.response?.data?.message || (language === 'ar' ? 'ليس لديك صلاحية لحذف الجلسة' : 'You do not have permission to delete this session'))
        : (error?.response?.data?.message || (language === 'ar' ? 'حدث خطأ أثناء حذف الجلسة' : 'Error deleting session'));
      
      toast.error(errorMessage);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteCancel = () => {
    setIsDeleteDialogOpen(false);
    setSessionToDelete(null);
  };

  const handleModalClose = () => {
    setIsEditModalOpen(false);
    setSelectedSessionId(null);
  };

  const handleAddSessionClose = () => {
    setIsAddSessionModalOpen(false);
    setSelectedCaseId(null);
  };

  const handleSessionAdded = () => {
    // Refresh the sessions data
    mutate();
    handleAddSessionClose();
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">{t("common.loading")}</div>
        </div>
      </div>
    );
  }

  if (error) {
    const isPermissionError = error?.response?.status === 403;
    const errorMessage = isPermissionError 
      ? (error?.response?.data?.message || (language === 'ar' ? 'ليس لديك صلاحية لعرض الجلسات' : 'You do not have permission to view sessions'))
      : (language === 'ar' ? 'حدث خطأ أثناء تحميل البيانات' : 'Error loading data');
    
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className={`text-lg ${isPermissionError ? 'text-amber-600' : 'text-red-500'}`}>
            {errorMessage}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Page Header */}
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">
          {isRtl ? "جلسات القضايا" : "Case Sessions"}
        </h1>
        <p className="text-muted-foreground">
          {isRtl
            ? "إدارة ومراقبة جلسات القضايا المختلفة"
            : "Manage and monitor different case sessions"}
        </p>
      </div>

      {/* Sessions Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>{isRtl ? "قائمة الجلسات" : "Sessions List"}</span>
            <Badge variant="secondary">
              {totalSessions} {isRtl ? "جلسة" : "sessions"}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Search and Filter Section */}
          <Card className="mb-6 bg-muted/20">
            <CardContent className="pt-6">
              <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 ${isRtl ? 'text-right' : 'text-left'}`} dir={isRtl ? 'rtl' : 'ltr'}>
                
                {/* File Number Input */}
                <div className="space-y-2">
                  <Label htmlFor="fileNumber" className="text-sm font-medium">
                    {isRtl ? "رقم الملف" : "File Number"}
                  </Label>
                  <Input
                    id="fileNumber"
                    type="text"
                    placeholder={isRtl ? "أدخل رقم الملف" : "Enter file number"}
                    value={filterParams.fileNumber}
                    onChange={(e) => setFilterParams({ ...filterParams, fileNumber: e.target.value })}
                    className={isRtl ? 'text-right' : 'text-left'}
                  />
                </div>

                {/* Case Number Input */}
                <div className="space-y-2">
                  <Label htmlFor="caseNumber" className="text-sm font-medium">
                    {isRtl ? "رقم القضية" : "Case Number"}
                  </Label>
                  <Input
                    id="caseNumber"
                    type="text"
                    placeholder={isRtl ? "أدخل رقم القضية" : "Enter case number"}
                    value={filterParams.caseNumber}
                    onChange={(e) => setFilterParams({ ...filterParams, caseNumber: e.target.value })}
                    className={isRtl ? 'text-right' : 'text-left'}
                  />
                </div>

                {/* From Date */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">
                    {isRtl ? "من تاريخ" : "From Date"}
                  </Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !filterParams.fromDate && "text-muted-foreground",
                          isRtl && "text-right justify-end"
                        )}
                      >
                        <CalendarIcon className={`h-4 w-4 ${isRtl ? 'ml-2' : 'mr-2'}`} />
                        {filterParams.fromDate ? (
                          format(filterParams.fromDate, 'PPP')
                        ) : (
                          <span>{isRtl ? "اختر التاريخ" : "Pick a date"}</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={filterParams.fromDate}
                        onSelect={(date) => setFilterParams({ ...filterParams, fromDate: date })}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                {/* To Date */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">
                    {isRtl ? "إلى تاريخ" : "To Date"}
                  </Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !filterParams.toDate && "text-muted-foreground",
                          isRtl && "text-right justify-end"
                        )}
                      >
                        <CalendarIcon className={`h-4 w-4 ${isRtl ? 'ml-2' : 'mr-2'}`} />
                        {filterParams.toDate ? (
                          format(filterParams.toDate, 'PPP')
                        ) : (
                          <span>{isRtl ? "اختر التاريخ" : "Pick a date"}</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={filterParams.toDate}
                        onSelect={(date) => setFilterParams({ ...filterParams, toDate: date })}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                {/* Branch Select */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">
                    {isRtl ? "الفرع" : "Branch"}
                  </Label>
                  <Select value={filterParams.branchId} onValueChange={(value) => setFilterParams({ ...filterParams, branchId: value })}>
                    <SelectTrigger className={isRtl ? 'text-right' : 'text-left'}>
                      <SelectValue 
                        placeholder={
                          branchesLoading 
                            ? (isRtl ? "جاري التحميل..." : "Loading...")
                            : (isRtl ? "اختر الفرع" : "Select branch")
                        } 
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {branchesLoading ? (
                        <SelectItem value="loading" disabled>
                          {isRtl ? "جاري التحميل..." : "Loading..."}
                        </SelectItem>
                      ) : branches.length === 0 ? (
                        <SelectItem value="empty" disabled>
                          {isRtl ? "لا توجد فروع متاحة" : "No branches available"}
                        </SelectItem>
                      ) : (
                        branches.map((branch) => (
                          <SelectItem key={branch.id} value={branch.id.toString()}>
                            {isRtl ? branch.name_ar : branch.name_en}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col space-y-2 justify-end">
                  <Button 
                    onClick={handleSearch}
                    className="w-full"
                    disabled={branchesLoading}
                  >
                    <Search className={`h-4 w-4 ${isRtl ? 'ml-2' : 'mr-2'}`} />
                    {isRtl ? "بحث" : "Search"}
                  </Button>
                  <Button 
                    onClick={handleReset}
                    variant="outline"
                    className="w-full"
                  >
                    <X className={`h-4 w-4 ${isRtl ? 'ml-2' : 'mr-2'}`} />
                    {isRtl ? "إعادة تعيين" : "Clear"}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Export Buttons Section */}
          <div className="mb-4 pb-4 border-b">
            <SessionsExportButtons data={sessions} language={language} />
          </div>

          {sessions.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">
                {Object.values(filterParams).some(val => val) 
                  ? (isRtl ? "لا توجد نتائج تطابق معايير البحث" : "No sessions match your search criteria")
                  : t("common.noData")
                }
              </p>
            </div>
          ) : (
            <div className="space-y-8">
              {sessionsByDate.map(({ date, sessions: dateSessions }) => (
                <div key={date} className="space-y-4">
                  {/* Date Header */}
                  <div className="flex items-center gap-3">
                    <div className="flex-1">
                      <h2 className="text-xl font-bold text-primary">
                        {formatDateHeader(date)}
                      </h2>
                      <div className="h-1 bg-gradient-to-r from-primary/50 to-transparent rounded mt-1" />
                    </div>
                    <Badge variant="outline" className="text-sm">
                      {dateSessions.length} {isRtl ? "جلسة" : "sessions"}
                    </Badge>
                  </div>

                  {/* Sessions Table for this date */}
                  <div className="overflow-x-auto rounded-lg border">
                    <Table>
                      <TableHeader>
                        <TableRow className='text-center bg-muted/50'>
                          <TableHead className={isRtl ? "text-right" : "text-left"}>
                            {isRtl ? "رقم الملف" : "File Number"}
                          </TableHead>
                          <TableHead className={isRtl ? "text-right" : "text-left"}>
                            {isRtl ? "رقم القضية" : "Case Number"}
                          </TableHead>
                          <TableHead className={isRtl ? "text-right" : "text-left"}>
                            {isRtl ? "تاريخ الجلسة" : "Session Date"}
                          </TableHead>
                          <TableHead className={isRtl ? "text-right" : "text-left"}>
                            {isRtl ? "السنة" : "Year"}
                          </TableHead>
                          <TableHead className={isRtl ? "text-right" : "text-left"}>
                            {isRtl ? "النوع" : "Type"}
                          </TableHead>
                          <TableHead className={isRtl ? "text-right" : "text-left"}>
                            {isRtl ? "الموضوع" : "Topic"}
                          </TableHead>
                          <TableHead className={isRtl ? "text-right" : "text-left"}>
                            {isRtl ? "الموكلين" : "Clients"}
                          </TableHead>
                          <TableHead className={isRtl ? "text-right" : "text-left"}>
                            {isRtl ? "الخصوم" : "Opponents"}
                          </TableHead>
                          <TableHead className={isRtl ? "text-right" : "text-left"}>
                            {isRtl ? "الرابط" : "Link"}
                          </TableHead>
                          <TableHead className={isRtl ? "text-right" : "text-left"}>
                            {isRtl ? "القرار" : "Decision"}
                          </TableHead>
                          <TableHead className="w-[100px]">
                            {isRtl ? "الإجراءات" : "Actions"}
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {dateSessions.map((session) => (
                          <TableRow key={session.id} className="hover:bg-muted/30">
                            <TableCell className="font-medium">
                              {session.file_number}
                            </TableCell>
                            <TableCell className="font-medium">
                              {session.case_number}
                            </TableCell>
                            <TableCell>
                              {new Date(session.session_date).toLocaleString(
                                isRtl ? "ar-AE" : "en-US",
                                {
                                  year: 'numeric',
                                  month: 'short',
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                }
                              )}
                            </TableCell>
                            <TableCell>
                              {new Date(session.session_date).getFullYear()}
                            </TableCell>
                            {/* Session Type Column */}
                            <TableCell>
                              {session.is_expert_session === 1 ? (
                                <Badge 
                                  variant="outline" 
                                  className="w-fit bg-purple-50 text-purple-700 border-purple-200 gap-1"
                                >
                                  <UserCheck className="h-3 w-3" />
                                  {isRtl ? "جلسة خبرة" : "Expert"}
                                </Badge>
                              ) : (
                                <Badge 
                                  variant="outline" 
                                  className="w-fit bg-gray-50 text-gray-700 border-gray-200"
                                >
                                  {isRtl ? "عادية" : "Regular"}
                                </Badge>
                              )}
                            </TableCell>
                            <TableCell>{session.case_topic}</TableCell>
                            {/* Clients Column */}
                            <TableCell>
                              <div className="space-y-2 max-w-xs">
                                {Array.isArray(session.clientParties) && session.clientParties.length > 0 ? (
                                  <div className="flex flex-col gap-1">
                                    {session.clientParties.map((client, index) => (
                                      <Badge
                                        key={index}
                                        variant="outline"
                                        className="w-fit bg-blue-50 text-blue-700 border-blue-200 text-xs"
                                      >
                                        {client}
                                      </Badge>
                                    ))}
                                  </div>
                                ) : (
                                  <span className="text-muted-foreground text-sm">
                                    {isRtl ? "لا يوجد" : "None"}
                                  </span>
                                )}
                              </div>
                            </TableCell>
                            {/* Opponents Column */}
                            <TableCell>
                              <div className="space-y-2 max-w-xs">
                                {Array.isArray(session.opponentParties) && session.opponentParties.length > 0 ? (
                                  <div className="flex flex-col gap-1">
                                    {session.opponentParties.map((opponent, index) => (
                                      <Badge
                                        key={index}
                                        variant="outline"
                                        className="w-fit bg-red-50 text-red-700 border-red-200 text-xs"
                                      >
                                        {opponent}
                                      </Badge>
                                    ))}
                                  </div>
                                ) : (
                                  <span className="text-muted-foreground text-sm">
                                    {isRtl ? "لا يوجد" : "None"}
                                  </span>
                                )}
                              </div>
                            </TableCell>
                            {/* Link Column */}
                            <TableCell>
                              {session.link ? (
                                <a
                                  href={session.link}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 text-primary hover:underline"
                                >
                                  <ExternalLink className="h-4 w-4" />
                                </a>
                              ) : (
                                <span className="text-muted-foreground text-sm">-</span>
                              )}
                            </TableCell>
                            {/* Decision Column */}
                            <TableCell>
                              <div className="max-w-xs">
                                {session.decision ? (
                                  <Badge
                                    variant="outline"
                                    className="w-fit bg-green-50 text-green-700 border-green-200 text-xs"
                                  >
                                    {session.decision}
                                  </Badge>
                                ) : (
                                  <span className="text-muted-foreground text-sm">
                                    {isRtl ? "لم يتم اتخاذ قرار بعد" : "No decision yet"}
                                  </span>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" className="h-8 w-8 p-0">
                                    <span className="sr-only">Open menu</span>
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem
                                    onClick={() => handleShowFile(session)}
                                    className="cursor-pointer"
                                  >
                                    <FileText className="mr-2 h-4 w-4" />
                                    <span>{isRtl ? "عرض الملف" : "Show File"}</span>
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() => handleAddSession(session)}
                                    className="cursor-pointer"
                                  >
                                    <Plus className="mr-2 h-4 w-4" />
                                    <span>{isRtl ? "إضافة جلسة" : "Add Session"}</span>
                                  </DropdownMenuItem>
                                  {/* <DropdownMenuItem
                                    onClick={() => handleView(session)}
                                    className="cursor-pointer"
                                  >
                                    <Eye className="mr-2 h-4 w-4" />
                                    <span>{isRtl ? "عرض" : "View"}</span>
                                  </DropdownMenuItem> */}
                                  <DropdownMenuItem
                                    onClick={() => handleEdit(session)}
                                    className="cursor-pointer"
                                  >
                                    <Edit className="mr-2 h-4 w-4" />
                                    <span>{isRtl ? "تعديل" : "Edit"}</span>
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() => handleDelete(session)}
                                    className="cursor-pointer text-red-600"
                                  >
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    <span>{isRtl ? "حذف" : "Delete"}</span>
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-6 pt-6 border-t">
              <div className="text-sm text-muted-foreground">
                {isRtl 
                  ? `صفحة ${currentPage} من ${totalPages}`
                  : `Page ${currentPage} of ${totalPages}`
                }
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  <ChevronRight className={`h-4 w-4 ${isRtl ? '' : 'rotate-180'}`} />
                  {isRtl ? "السابق" : "Previous"}
                </Button>
                
                {/* Page numbers */}
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }
                    
                    return (
                      <Button
                        key={pageNum}
                        variant={currentPage === pageNum ? "default" : "outline"}
                        size="sm"
                        onClick={() => handlePageChange(pageNum)}
                        className="w-8 h-8 p-0"
                      >
                        {pageNum}
                      </Button>
                    );
                  })}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  {isRtl ? "التالي" : "Next"}
                  <ChevronLeft className={`h-4 w-4 ${isRtl ? '' : 'rotate-180'}`} />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Session Modal */}
      <EditSessionModal
        isOpen={isEditModalOpen}
        onClose={handleModalClose}
        sessionId={selectedSessionId}
      />

      {/* Add Session Modal */}
      <AddSessionModal
        isOpen={isAddSessionModalOpen}
        onClose={handleAddSessionClose}
        caseId={selectedCaseId}
        onSessionAdded={handleSessionAdded}
      />

      {/* Delete Session Dialog */}
      <DeleteSessionDialog
        isOpen={isDeleteDialogOpen}
        onClose={handleDeleteCancel}
        session={sessionToDelete}
        onConfirm={handleDeleteConfirm}
        isDeleting={isDeleting}
      />
    </div>
  );
}