"use client"

import React, { useState } from 'react'
import { format } from 'date-fns'
import useSWR from 'swr'
import { useTranslations } from "@/hooks/useTranslations"
import { useLanguage } from "@/contexts/LanguageContext"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Plus, Pencil, Trash2, Loader2 } from 'lucide-react'
import { toast } from 'react-toastify'
import RequestModal from './RequestModal'
import { getRequestsByEmployeeId, deleteEmployeeRequest } from '@/app/services/api/employeeRequests'

function Requests({ employeeId }) {
  const { t } = useTranslations()
  const { language } = useLanguage()
  const isArabic = language === 'ar'

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedRequest, setSelectedRequest] = useState(null)

  // Fetch requests data
  const { data: requestsData, error, mutate, isLoading } = useSWR(
    employeeId ? ['employee-requests', employeeId] : null,
    () => getRequestsByEmployeeId(employeeId)
  )

  const requests = Array.isArray(requestsData?.data) ? requestsData.data : []

  const handleAddRequest = () => {
    setSelectedRequest(null)
    setIsModalOpen(true)
  }

  const handleEditRequest = (request) => {
    setSelectedRequest(request)
    setIsModalOpen(true)
  }

  const handleDeleteRequest = async (requestId) => {
    if (!window.confirm(isArabic ? 'هل أنت متأكد من حذف هذا الطلب؟' : 'Are you sure you want to delete this request?')) {
      return
    }

    try {
      const response = await deleteEmployeeRequest(requestId)
      if (response.success) {
        toast.success(isArabic ? 'تم حذف الطلب بنجاح' : 'Request deleted successfully')
        mutate()
      } else {
        toast.error(response.message || (isArabic ? 'حدث خطأ' : 'An error occurred'))
      }
    } catch (error) {
      toast.error(isArabic ? 'حدث خطأ أثناء حذف الطلب' : 'Error deleting request')
    }
  }

  const handleModalSuccess = () => {
    mutate()
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
        <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
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


  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
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
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>{isArabic ? 'الطلبات' : 'Requests'}</CardTitle>
          <Button onClick={handleAddRequest}>
            <Plus className={`h-4 w-4 ${isArabic ? 'ml-2' : 'mr-2'}`} />
            {isArabic ? 'إضافة طلب' : 'Add Request'}
          </Button>
        </CardHeader>
        <CardContent>
          {requests.length === 0 ? (
            <div className="text-center p-8 text-gray-500">
              {isArabic ? 'لا توجد طلبات' : 'No requests'}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{isArabic ? '#' : '#'}</TableHead>
                    <TableHead>{isArabic ? 'النوع' : 'Type'}</TableHead>
                    <TableHead>{isArabic ? 'التاريخ' : 'Date'}</TableHead>
                    <TableHead>{isArabic ? 'موافقة المدير' : 'Manager'}</TableHead>
                    <TableHead>{isArabic ? 'موافقة HR' : 'HR'}</TableHead>
                    <TableHead className="text-center">{isArabic ? 'الإجراءات' : 'Actions'}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {Array.isArray(requests) && requests.map((request, index) => (
                    <TableRow key={request.id}>
                      <TableCell>{index + 1}</TableCell>
                      <TableCell>
                        <span className="text-sm">{request.type || '-'}</span>
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
                        <div className="flex items-center justify-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditRequest(request)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteRequest(request.id)}
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Request Modal */}
      <RequestModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleModalSuccess}
        employeeId={employeeId}
        request={selectedRequest}
      />
    </>
  )
}

export default Requests
