"use client"

import React, { useState, useMemo } from 'react'
import { format } from 'date-fns'
import useSWR from 'swr'
import { useTranslations } from "@/hooks/useTranslations"
import { useLanguage } from "@/contexts/LanguageContext"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, Pencil, Trash2, Loader2, FileText, Search, ChevronLeft, ChevronRight, DollarSign, BookOpen } from 'lucide-react'
import { toast } from 'react-toastify'
import ExportButtons from '@/components/ui/export-buttons'
import RequestModal from './components/RequestModal'
import { Skeleton } from "@/components/ui/skeleton"
import { getEmployeeRequests, deleteEmployeeRequest } from '@/app/services/api/employeeRequests'
import { getRequestTypes } from './constants/requestTypes'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

function RequestsPage() {
  const { t } = useTranslations()
  const { language } = useLanguage()
  const isArabic = language === 'ar'

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedRequest, setSelectedRequest] = useState(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [requestToDelete, setRequestToDelete] = useState(null)
  const [activeTab, setActiveTab] = useState('leaves')

  // Handle tab change and reset filters
  const handleTabChange = (tab) => {
    setActiveTab(tab)
    // Reset filters when switching tabs
    setSearchTerm('')
    setManagerApprovalFilter('')
    setHrApprovalFilter('')
    setTypeFilter('')
    setAppliedSearch('')
    setAppliedManagerApproval('')
    setAppliedHrApproval('')
    setAppliedType('')
    setCurrentPage(1)
  }

  // Request types (same as in RequestModal)
  const requestTypes = getRequestTypes(isArabic)

  // Column configuration for export - Leave requests (with manager approval)
  const leaveRequestsColumnConfig = {
    id: {
      ar: 'المعرف',
      en: 'ID',
      dataKey: 'id'
    },
    employee_name: {
      ar: 'اسم الموظف',
      en: 'Employee Name',
      dataKey: 'employee_name'
    },
    type: {
      ar: 'النوع',
      en: 'Type',
      dataKey: 'type',
      formatter: (value) => {
        const type = requestTypes.find(t => t.value === value)
        return type ? type.label : value
      }
    },
    start_date: {
      ar: 'تاريخ البداية',
      en: 'Start Date',
      dataKey: 'start_date',
      type: 'date'
    },
    end_date: {
      ar: 'تاريخ النهاية',
      en: 'End Date',
      dataKey: 'end_date',
      type: 'date'
    },
    days: {
      ar: 'الأيام',
      en: 'Days',
      dataKey: 'days'
    },
    manager_approval: {
      ar: 'موافقة المدير',
      en: 'Manager Approval',
      dataKey: 'manager_approval',
      type: 'status',
      statusMap: {
        'approved': { ar: 'موافق', en: 'Approved' },
        'rejected': { ar: 'مرفوض', en: 'Rejected' },
        'pending': { ar: 'قيد الانتظار', en: 'Pending' }
      }
    },
    hr_approval: {
      ar: 'موافقة الموارد البشرية',
      en: 'HR Approval',
      dataKey: 'hr_approval',
      type: 'status',
      statusMap: {
        'approved': { ar: 'موافق', en: 'Approved' },
        'rejected': { ar: 'مرفوض', en: 'Rejected' },
        'pending': { ar: 'قيد الانتظار', en: 'Pending' }
      }
    },
    reason: {
      ar: 'السبب',
      en: 'Reason',
      dataKey: 'reason'
    },
    notes: {
      ar: 'الملاحظات',
      en: 'Notes',
      dataKey: 'notes'
    },
    created_at: {
      ar: 'تاريخ الإنشاء',
      en: 'Created At',
      dataKey: 'created_at',
      type: 'date'
    }
  }

  // Column configuration for export - Other requests (no manager approval)
  const otherRequestsColumnConfig = {
    id: {
      ar: 'المعرف',
      en: 'ID',
      dataKey: 'id'
    },
    employee_name: {
      ar: 'اسم الموظف',
      en: 'Employee Name',
      dataKey: 'employee_name'
    },
    type: {
      ar: 'النوع',
      en: 'Type',
      dataKey: 'type',
      formatter: (value) => {
        const type = requestTypes.find(t => t.value === value)
        return type ? type.label : value
      }
    },
    start_date: {
      ar: 'تاريخ البداية',
      en: 'Start Date',
      dataKey: 'start_date',
      type: 'date'
    },
    end_date: {
      ar: 'تاريخ النهاية',
      en: 'End Date',
      dataKey: 'end_date',
      type: 'date'
    },
    days: {
      ar: 'الأيام',
      en: 'Days',
      dataKey: 'days'
    },
    hr_approval: {
      ar: 'موافقة الموارد البشرية',
      en: 'HR Approval',
      dataKey: 'hr_approval',
      type: 'status',
      statusMap: {
        'approved': { ar: 'موافق', en: 'Approved' },
        'rejected': { ar: 'مرفوض', en: 'Rejected' },
        'pending': { ar: 'قيد الانتظار', en: 'Pending' }
      }
    },
    reason: {
      ar: 'السبب',
      en: 'Reason',
      dataKey: 'reason'
    },
    notes: {
      ar: 'الملاحظات',
      en: 'Notes',
      dataKey: 'notes'
    },
    created_at: {
      ar: 'تاريخ الإنشاء',
      en: 'Created At',
      dataKey: 'created_at',
      type: 'date'
    }
  }

  // Pagination and filter states
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)
  
  // Filter input states (not applied yet)
  const [searchTerm, setSearchTerm] = useState('')
  const [managerApprovalFilter, setManagerApprovalFilter] = useState('')
  const [hrApprovalFilter, setHrApprovalFilter] = useState('')
  const [typeFilter, setTypeFilter] = useState('')

  // Applied filters (actual API params)
  const [appliedSearch, setAppliedSearch] = useState('')
  const [appliedManagerApproval, setAppliedManagerApproval] = useState('')
  const [appliedHrApproval, setAppliedHrApproval] = useState('')
  const [appliedType, setAppliedType] = useState('')

  // Build query params with applied filters
  const queryParams = useMemo(() => {
    let baseParams = {
      page: currentPage,
      limit: pageSize,
      search: appliedSearch || null,
      hr_approval: (appliedHrApproval && appliedHrApproval !== 'all') ? appliedHrApproval : null,
      type: (appliedType && appliedType !== 'all') ? appliedType : null,
    }

    // Only include manager_approval for leave requests
    if (activeTab === 'leaves') {
      baseParams.manager_approval = (appliedManagerApproval && appliedManagerApproval !== 'all') ? appliedManagerApproval : null
      // Filter to only include leave types
      const leaveTypes = requestTypes.filter(type => type.isLeave).map(type => type.value)
      if (!appliedType || appliedType === 'all') {
        baseParams.type_in = leaveTypes
      }
    } else {
      // Filter to only include non-leave types
      const otherTypes = requestTypes.filter(type => !type.isLeave).map(type => type.value)
      if (!appliedType || appliedType === 'all') {
        baseParams.type_in = otherTypes
      }
    }

    return baseParams
  }, [currentPage, pageSize, appliedSearch, appliedManagerApproval, appliedHrApproval, appliedType, activeTab, requestTypes])

  // Fetch requests data with pagination and filters
  const { data: requestsData, error, mutate, isLoading } = useSWR(
    ['employee-requests', queryParams],
    () => getEmployeeRequests(queryParams)
  )

  const requests = Array.isArray(requestsData?.data) ? requestsData.data : []
  const pagination = requestsData?.pagination || { total: 0, page: 1, totalPages: 1 }

  // Filter requests by type (leaves vs other requests)
  const leaveRequests = requests.filter(request => {
    const requestType = requestTypes.find(type => type.value === request.type)
    return requestType?.isLeave === true
  })

  const otherRequests = requests.filter(request => {
    const requestType = requestTypes.find(type => type.value === request.type)
    return requestType?.isLeave === false
  })

  // Get current requests based on active tab
  const currentRequests = activeTab === 'leaves' ? leaveRequests : otherRequests
  
  // Get request types for current tab
  const currentRequestTypes = requestTypes.filter(type => 
    activeTab === 'leaves' ? type.isLeave === true : type.isLeave === false
  )

  const handleAddRequest = () => {
    setSelectedRequest(null)
    setIsModalOpen(true)
  }

  const handleEditRequest = (request) => {
    setSelectedRequest(request)
    setIsModalOpen(true)
  }

  const handleDeleteClick = (request) => {
    setRequestToDelete(request)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!requestToDelete) return

    const requestId = requestToDelete.id

    const optimisticRemove = (current) => {
      if (!current || !Array.isArray(current.data)) return current
      const filtered = current.data.filter((item) => item.id !== requestId)
      return {
        ...current,
        data: filtered,
        pagination: current.pagination
          ? { ...current.pagination, total: Math.max(0, (current.pagination.total || filtered.length)) }
          : current.pagination
      }
    }

    try {
      await mutate(
        async (current) => {
          await deleteEmployeeRequest(requestId)
          return optimisticRemove(current)
        },
        {
          optimisticData: optimisticRemove(requestsData),
          rollbackOnError: true,
          populateCache: true,
          revalidate: false
        }
      )

      if (requestsData?.success !== false) {
        toast.success(isArabic ? 'تم حذف الطلب بنجاح' : 'Request deleted successfully')
      } else {
        toast.error(isArabic ? 'حدث خطأ' : 'An error occurred')
      }
    } catch (error) {

      toast.error(isArabic ? 'حدث خطأ أثناء حذف الطلب' : 'Error deleting request')
    } finally {
      setDeleteDialogOpen(false)
      setRequestToDelete(null)
    }
  }

  const handleModalSuccess = () => {
    mutate()
  }

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage)
  }

  const handleApplyFilters = () => {
    // Apply all filters and reset to page 1
    setAppliedSearch(searchTerm)
    setAppliedManagerApproval(managerApprovalFilter)
    setAppliedHrApproval(hrApprovalFilter)
    setAppliedType(typeFilter)
    setCurrentPage(1)
  }

  const handleResetFilters = () => {
    // Reset input states
    setSearchTerm('')
    setManagerApprovalFilter('')
    setHrApprovalFilter('')
    setTypeFilter('')
    // Reset applied states
    setAppliedSearch('')
    setAppliedManagerApproval('')
    setAppliedHrApproval('')
    setAppliedType('')
    setCurrentPage(1)
  }

  // Allow Enter key to apply filters
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleApplyFilters()
    }
  }

  const getApprovalBadge = (status) => {
    if (status === 'approved') {
      return (
        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
          {isArabic ? 'موافق' : 'Approved'}
        </Badge>
      )
    } else if (status === 'rejected') {
      return (
        <Badge variant="outline" className="bg-red-50 text-red-700 border-eed-200">
          {isArabic ? 'مرفوض' : 'Rejected'}
        </Badge>
      )
    } else {
      return (
        <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
          {isArabic ? 'قيد الانتظار' : 'Pending'}
        </Badge>
      )
    }
  }

  const getFinanceBadge = (request) => {
    const status = request.finance_approval
    const hasValue = +request.leave_value_aed > 0
    const hasJournal = !!request.journal_entry_id
    return (
      <div className="flex flex-col gap-1 items-start">
        {status === 'approved' ? (
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            {isArabic ? 'موافق مالياً' : 'Finance OK'}
          </Badge>
        ) : status === 'rejected' ? (
          <Badge variant="outline" className="bg-red-50 text-red-700 border-eed-200">
            {isArabic ? 'مرفوض مالياً' : 'Finance Rejected'}
          </Badge>
        ) : (
          <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
            {isArabic ? 'بانتظار المالية' : 'Awaiting Finance'}
          </Badge>
        )}
        {hasValue && (
          <span className="text-xs text-blue-700 font-medium flex items-center gap-1">
            <DollarSign className="h-3 w-3" />
            {(+request.leave_value_aed).toLocaleString('en-AE', { minimumFractionDigits: 2 })} AED
          </span>
        )}
        {hasJournal && (
          <span className="text-xs text-green-600 flex items-center gap-1">
            <BookOpen className="h-3 w-3" />
            {isArabic ? `قيد #${request.journal_entry_id}` : `JE #${request.journal_entry_id}`}
          </span>
        )}
      </div>
    )
  }

  const renderTableSkeleton = (columns = 6, rows = 6) => (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            {Array.from({ length: columns }).map((_, idx) => (
              <TableHead key={idx}>
                <Skeleton className="h-4 w-24" />
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array.from({ length: rows }).map((_, rowIdx) => (
            <TableRow key={rowIdx}>
              {Array.from({ length: columns }).map((__, colIdx) => (
                <TableCell key={colIdx}>
                  <Skeleton className="h-4 w-full" />
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );

  if (isLoading) {
    return (
      <div className="space-y-6 p-4">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-64" />
          </div>
          <Skeleton className="h-10 w-32" />
        </div>
        {renderTableSkeleton(6, 6)}
        {renderTableSkeleton(5, 4)}
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center p-8 text-red-500">
        {isArabic ? 'حدث خطأ أثناء تحميل البيانات' : 'Error loading data'}
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-sg">
              <FileText className="h-6 w-6 text-primary" />
            </div>
            <div>
              <CardTitle className="text-2xl">
                {isArabic ? 'طلبات الموظفين' : 'Employee Requests'}
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                {isArabic 
                  ? `إجمالي الطلبات: ${pagination.total}` 
                  : `Total Requests: ${pagination.total}`
                }
              </p>
            </div>
          </div>
          <Button onClick={handleAddRequest}>
            <Plus className={`h-4 w-4 me-2`} />
            {isArabic ? 'إضافة طلب' : 'Add Request'}
          </Button>
        </CardHeader>

        <CardContent>
          <Tabs dir={isArabic ? 'rtl' : 'ltr'} value={activeTab} onValueChange={handleTabChange} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="leaves">
                {isArabic ? 'الاجازات' : 'Leaves'}
              </TabsTrigger>
              <TabsTrigger value="others">
                {isArabic ? 'طلبات أخرى' : 'Other Requests'}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="leaves">
              {/* Export Buttons for Leaves */}
              {leaveRequests && leaveRequests.length > 0 && (
                <div className="mb-4">
                  <ExportButtons
                    data={leaveRequests}
                    columnConfig={leaveRequestsColumnConfig}
                    language={language}
                    exportName="leave-requests"
                    sheetName={language === 'ar' ? 'طلبات الاجازات' : 'Leave Requests'}
                  />
                </div>
              )}

              {/* Filters Section for Leaves */}
              <div className="mb-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
                  {/* Search Input */}
                  <div className="relative lg:col-span-2">
                    <Search className={`absolute ${isArabic ? 'inset-inline-end-3' : 'inset-inline-start-3'} top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400`} />
                    <Input
                      placeholder={isArabic ? 'ابحث عن موظف أو نوع...' : 'Search employee or type...'}
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      onKeyPress={handleKeyPress}
                      className={`${isArabic ? 'pe-10' : 'ps-10'}`}
                    />
                  </div>

                  {/* Type Filter */}
                  <Select value={typeFilter} onValueChange={setTypeFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder={isArabic ? 'نوع الطلب' : 'Request Type'} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{isArabic ? 'الكل' : 'All Types'}</SelectItem>
                      {currentRequestTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {/* Manager Approval Filter */}
                  <Select value={managerApprovalFilter} onValueChange={setManagerApprovalFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder={isArabic ? 'موافقة المدير' : 'Manager Approval'} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{isArabic ? 'الكل' : 'All'}</SelectItem>
                      <SelectItem value="pending">{isArabic ? 'قيد الانتظار' : 'Pending'}</SelectItem>
                      <SelectItem value="approved">{isArabic ? 'موافق' : 'Approved'}</SelectItem>
                      <SelectItem value="rejected">{isArabic ? 'مرفوض' : 'Rejected'}</SelectItem>
                    </SelectContent>
                  </Select>

                  {/* HR Approval Filter */}
                  <Select value={hrApprovalFilter} onValueChange={setHrApprovalFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder={isArabic ? 'موافقة HR' : 'HR Approval'} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{isArabic ? 'الكل' : 'All'}</SelectItem>
                      <SelectItem value="pending">{isArabic ? 'قيد الانتظار' : 'Pending'}</SelectItem>
                      <SelectItem value="approved">{isArabic ? 'موافق' : 'Approved'}</SelectItem>
                      <SelectItem value="rejected">{isArabic ? 'مرفوض' : 'Rejected'}</SelectItem>
                    </SelectContent>
                  </Select>

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <Button onClick={handleApplyFilters} className="flex-1">
                      <Search className={`h-4 w-4 me-2`} />
                      {isArabic ? 'بحث' : 'Search'}
                    </Button>
                    <Button variant="outline" onClick={handleResetFilters}>
                      {isArabic ? 'إعادة' : 'Reset'}
                    </Button>
                  </div>
                </div>
              </div>

              {leaveRequests.length === 0 ? (
                <div className="text-center p-12">
                  <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 text-lg">
                    {isArabic ? 'لا توجد طلبات اجازات' : 'No leave requests found'}
                  </p>
                  <p className="text-gray-400 text-sm mt-2">
                    {isArabic 
                      ? 'ابدأ بإضافة طلب إجازة جديد باستخدام الزر أعلاه' 
                      : 'Start by adding a new leave request using the button above'
                    }
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[50px]">{isArabic ? '#' : '#'}</TableHead>
                        <TableHead>{isArabic ? 'الموظف' : 'Employee'}</TableHead>
                        <TableHead>{isArabic ? 'النوع' : 'Type'}</TableHead>
                        <TableHead>{isArabic ? 'تاريخ الطلب' : 'Request Date'}</TableHead>
                        <TableHead>{isArabic ? 'موافقة المدير' : 'Manager'}</TableHead>
                        <TableHead>{isArabic ? 'موافقة HR' : 'HR'}</TableHead>
                        <TableHead>
                          <span className="flex items-center gap-1">
                            <DollarSign className="h-3 w-3 text-blue-600" />
                            {isArabic ? 'الشؤون المالية' : 'Finance'}
                          </span>
                        </TableHead>
                        <TableHead className="text-center">{isArabic ? 'الإجراءات' : 'Actions'}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {Array.isArray(leaveRequests) && leaveRequests.map((request, index) => (
                        <TableRow key={request.id}>
                          <TableCell className="font-medium">
                            {index + 1}
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col">
                              <span className="font-medium">
                                {request.employee_name || '-'}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <span className="text-sm font-medium">{request.type || '-'}</span>
                          </TableCell>
                          <TableCell>
                            {request.date 
                              ? format(new Date(request.date), 'yyyy-MM-dd')
                              : '-'
                            }
                          </TableCell>
                          <TableCell>
                            {getApprovalBadge(request.manager_approval)}
                          </TableCell>
                          <TableCell>
                            {getApprovalBadge(request.hr_approval)}
                          </TableCell>
                          <TableCell>
                            {getFinanceBadge(request)}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center justify-center gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEditRequest(request)}
                                className="hover:bg-blue-50 hover:text-blue-600"
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteClick(request)}
                                className="hover:bg-red-50 hover:text-red-600"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </TabsContent>

            <TabsContent value="others">
              {/* Export Buttons for Other Requests */}
              {otherRequests && otherRequests.length > 0 && (
                <div className="mb-4">
                  <ExportButtons
                    data={otherRequests}
                    columnConfig={otherRequestsColumnConfig}
                    language={language}
                    exportName="other-requests"
                    sheetName={language === 'ar' ? 'طلبات أخرى' : 'Other Requests'}
                  />
                </div>
              )}

              {/* Filters Section for Other Requests */}
              <div className="mb-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                  {/* Search Input */}
                  <div className="relative lg:col-span-2">
                    <Search className={`absolute ${isArabic ? 'inset-inline-end-3' : 'inset-inline-start-3'} top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400`} />
                    <Input
                      placeholder={isArabic ? 'ابحث عن موظف أو نوع...' : 'Search employee or type...'}
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      onKeyPress={handleKeyPress}
                      className={`${isArabic ? 'pe-10' : 'ps-10'}`}
                    />
                  </div>

                  {/* Type Filter */}
                  <Select value={typeFilter} onValueChange={setTypeFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder={isArabic ? 'نوع الطلب' : 'Request Type'} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{isArabic ? 'الكل' : 'All Types'}</SelectItem>
                      {currentRequestTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {/* HR Approval Filter - Only HR approval for other requests */}
                  <Select value={hrApprovalFilter} onValueChange={setHrApprovalFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder={isArabic ? 'موافقة HR' : 'HR Approval'} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{isArabic ? 'الكل' : 'All'}</SelectItem>
                      <SelectItem value="pending">{isArabic ? 'قيد الانتظار' : 'Pending'}</SelectItem>
                      <SelectItem value="approved">{isArabic ? 'موافق' : 'Approved'}</SelectItem>
                      <SelectItem value="rejected">{isArabic ? 'مرفوض' : 'Rejected'}</SelectItem>
                    </SelectContent>
                  </Select>

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <Button onClick={handleApplyFilters} className="flex-1">
                      <Search className={`h-4 w-4 me-2`} />
                      {isArabic ? 'بحث' : 'Search'}
                    </Button>
                    <Button variant="outline" onClick={handleResetFilters}>
                      {isArabic ? 'إعادة' : 'Reset'}
                    </Button>
                  </div>
                </div>
              </div>

              {otherRequests.length === 0 ? (
                <div className="text-center p-12">
                  <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 text-lg">
                    {isArabic ? 'لا توجد طلبات أخرى' : 'No other requests found'}
                  </p>
                  <p className="text-gray-400 text-sm mt-2">
                    {isArabic 
                      ? 'ابدأ بإضافة طلب جديد باستخدام الزر أعلاه' 
                      : 'Start by adding a new request using the button above'
                    }
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[50px]">{isArabic ? '#' : '#'}</TableHead>
                        <TableHead>{isArabic ? 'الموظف' : 'Employee'}</TableHead>
                        <TableHead>{isArabic ? 'النوع' : 'Type'}</TableHead>
                        <TableHead>{isArabic ? 'تاريخ الطلب' : 'Request Date'}</TableHead>
                        <TableHead>{isArabic ? 'موافقة HR' : 'HR Approval'}</TableHead>
                        <TableHead className="text-center">{isArabic ? 'الإجراءات' : 'Actions'}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {Array.isArray(otherRequests) && otherRequests.map((request, index) => (
                        <TableRow key={request.id}>
                          <TableCell className="font-medium">
                            {index + 1}
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col">
                              <span className="font-medium">
                                {request.employee_name || '-'}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <span className="text-sm font-medium">{request.type || '-'}</span>
                          </TableCell>
                          <TableCell>
                            {request.date 
                              ? format(new Date(request.date), 'yyyy-MM-dd')
                              : '-'
                            }
                          </TableCell>
                          <TableCell>
                            {getApprovalBadge(request.hr_approval)}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center justify-center gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEditRequest(request)}
                                className="hover:bg-blue-50 hover:text-blue-600"
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteClick(request)}
                                className="hover:bg-red-50 hover:text-red-600"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Request Modal */}
      <RequestModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleModalSuccess}
        request={selectedRequest}
        activeTab={activeTab}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {isArabic ? 'تأكيد الحذف' : 'Confirm Deletion'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {isArabic 
                ? 'هل أنت متأكد من حذف هذا الطلب؟ لا يمكن التراجع عن هذا الإجراء.'
                : 'Are you sure you want to delete this request? This action cannot be undone.'
              }
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>
              {isArabic ? 'إلغاء' : 'Cancel'}
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} className="bg-red-600 hover:bg-red-700">
              {isArabic ? 'حذف' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

export default RequestsPage


