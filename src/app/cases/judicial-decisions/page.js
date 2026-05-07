"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "@/hooks/useTranslations";
import { useLanguage } from "@/contexts/LanguageContext";
import useSWR from "swr";
import { getJudicialDecisions } from "@/app/services/api/sessions";
import { getBranches } from "@/app/services/api/branches";
import { format } from "date-fns";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Eye, Search, CalendarIcon, X, ChevronLeft, ChevronRight, FileDown } from "lucide-react";
import { cn } from "@/lib/utils";

export default function JudicialDecisionsPage() {
  const { t } = useTranslations();
  const { language } = useLanguage();
  const router = useRouter();
  const isRtl = language === "ar";

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

  // Fetch judicial decisions data using SWR with query parameters
  const {
    data: decisionsData,
    error,
    isLoading,
  } = useSWR(
    ["judicial-decisions", buildQueryParams()],
    ([_, params]) => getJudicialDecisions(params)
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

  const decisions = decisionsData?.data || [];
  const branches = Array.isArray(branchesData?.data) ? branchesData.data : Array.isArray(branchesData) ? branchesData : [];
  const totalPages = decisionsData?.totalPages || 1;
  const totalDecisions = decisionsData?.total || 0;

  // Handle Excel export
  const handleExportToExcel = () => {
    // Create CSV content
    const headers = [
      isRtl ? "رقم الملف" : "File Number",
      isRtl ? "رقم القضية" : "Case Number",
      isRtl ? "السنة" : "Year",
      isRtl ? "الموكلين" : "Clients",
      isRtl ? "الخصوم" : "Opponents",
      isRtl ? "تاريخ الحكم" : "Decision Date",
      isRtl ? "منطوق الحكم" : "Decision Text"
    ];

    const csvRows = [
      headers.join(','),
      ...decisions.map(decision => {
        const clients = decision.clientParties?.join('; ') || (isRtl ? "لا يوجد" : "None");
        const opponents = decision.opponentParties?.join('; ') || (isRtl ? "لا يوجد" : "None");
        const decisionDate = new Date(decision.session_date).toLocaleDateString(
          isRtl ? "ar-AE" : "en-US",
          { year: 'numeric', month: 'short', day: 'numeric' }
        );
        const ruling = decision.ruling ? `"${decision.ruling.replace(/"/g, '""')}"` : '-';
        
        return [
          decision.file_number,
          decision.case_number,
          new Date(decision.session_date).getFullYear(),
          `"${clients.replace(/"/g, '""')}"`,
          `"${opponents.replace(/"/g, '""')}"`,
          decisionDate,
          ruling
        ].join(',');
      })
    ];

    const csvContent = '\uFEFF' + csvRows.join('\n'); // Add BOM for UTF-8
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `judicial_decisions_${format(new Date(), 'yyyy-MM-dd')}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Handle search button click
  const handleSearch = () => {
    setAppliedFilters({ ...filterParams });
    setCurrentPage(1);
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
    setAppliedFilters(resetFilters);
    setCurrentPage(1);
  };

  // Handle page change
  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  // Handle view case - redirect to edit page
  const handleViewCase = (caseId) => {
    router.push(`/cases/${caseId}/edit`);
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
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg text-red-500">{t("common.errorLoading")}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Page Header */}
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">
          {isRtl ? "الأحكام القضائية الصادرة" : "Judicial Decisions Issued"}
        </h1>
        <p className="text-muted-foreground">
          {isRtl
            ? "عرض جميع الأحكام القضائية الصادرة في القضايا"
            : "View all judicial decisions issued in cases"}
        </p>
      </div>

      {/* Decisions Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>{isRtl ? "قائمة الأحكام" : "Decisions List"}</span>
            <Badge variant="secondary">
              {totalDecisions} {isRtl ? "حكم" : "decisions"}
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

          {decisions.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">
                {Object.values(filterParams).some(val => val) 
                  ? (isRtl ? "لا توجد نتائج تطابق معايير البحث" : "No decisions match your search criteria")
                  : (isRtl ? "لا توجد أحكام قضائية" : "No judicial decisions found")
                }
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Export Button */}
              <div className={`flex ${isRtl ? 'justify-start' : 'justify-end'}`}>
                <Button
                  onClick={handleExportToExcel}
                  variant="outline"
                  className="gap-2"
                >
                  <FileDown className="h-4 w-4" />
                  {isRtl ? "تصدير إلى Excel" : "Export to Excel"}
                </Button>
              </div>

              {/* Decisions Table */}
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
                        {isRtl ? "السنة" : "Year"}
                      </TableHead>
                      <TableHead className={isRtl ? "text-right" : "text-left"}>
                        {isRtl ? "الموكلين" : "Clients"}
                      </TableHead>
                      <TableHead className={isRtl ? "text-right" : "text-left"}>
                        {isRtl ? "الخصوم" : "Opponents"}
                      </TableHead>
                      <TableHead className={isRtl ? "text-right" : "text-left"}>
                        {isRtl ? "تاريخ الحكم" : "Decision Date"}
                      </TableHead>
                      <TableHead className={isRtl ? "text-right" : "text-left"}>
                        {isRtl ? "منطوق الحكم" : "Decision Text"}
                      </TableHead>
                      <TableHead className="w-[100px]">
                        {isRtl ? "الإجراءات" : "Actions"}
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {decisions.map((decision) => (
                      <TableRow key={decision.id} className="hover:bg-muted/30">
                        <TableCell className="font-medium">
                          {decision.file_number}
                        </TableCell>
                        <TableCell className="font-medium">
                          {decision.case_number}
                        </TableCell>
                        <TableCell>
                          {new Date(decision.session_date).getFullYear()}
                        </TableCell>
                        {/* Clients Column */}
                        <TableCell>
                          <div className="space-y-2 max-w-xs">
                            {decision.clientParties?.length > 0 ? (
                              <div className="flex flex-col gap-1">
                                {decision.clientParties.map((client, index) => (
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
                            {decision.opponentParties?.length > 0 ? (
                              <div className="flex flex-col gap-1">
                                {decision.opponentParties.map((opponent, index) => (
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
                        {/* Decision Date */}
                        <TableCell>
                          {new Date(decision.session_date).toLocaleDateString(
                            isRtl ? "ar-AE" : "en-US",
                            {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric'
                            }
                          )}
                        </TableCell>
                        {/* Decision Text */}
                        <TableCell>
                          <div className="max-w-md">
                            {decision.ruling ? (
                              <p className="text-sm line-clamp-2">
                                {decision.ruling}
                              </p>
                            ) : (
                              <span className="text-muted-foreground text-sm">-</span>
                            )}
                          </div>
                        </TableCell>
                        {/* Actions */}
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewCase(decision.case_id)}
                            className="h-8 w-8 p-0"
                          >
                            <Eye className="h-4 w-4" />
                            <span className="sr-only">{isRtl ? "عرض القضية" : "View Case"}</span>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
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
    </div>
  );
}
