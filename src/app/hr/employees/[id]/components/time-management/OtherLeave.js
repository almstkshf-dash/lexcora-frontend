"use client"

import React, { useState } from 'react'
import useSWR, { mutate } from 'swr'
import { useTranslations } from "@/hooks/useTranslations"
import { useLanguage } from "@/contexts/LanguageContext"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Plus, Pencil, Trash2, Loader2 } from 'lucide-react'
import { toast } from 'react-toastify'
import { format } from 'date-fns'
import { getOtherLeaves, deleteOtherLeave } from '@/app/services/api/otherLeaves'
import OtherLeaveModal from './OtherLeaveModal'

function OtherLeave({ employeeId }) {
  const { t } = useTranslations()
  const { language } = useLanguage()
  const isArabic = language === 'ar'

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedOtherLeave, setSelectedOtherLeave] = useState(null)

  // SWR fetcher function
  const fetcher = async (url) => {
    const response = await getOtherLeaves(employeeId)
    if (response.success) {
      return response.data
    } else {
      throw new Error(response.message || (isArabic ? 'حدث خطأ' : 'An error occurred'))
    }
  }

  // Use SWR for data fetching
  const { data: otherLeaves, error, isLoading } = useSWR(
    employeeId ? `/api/other-leaves?employee_id=${employeeId}` : null,
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    }
  )

  // Show error toast if there's an error
  if (error) {
    toast.error(error.message || (isArabic ? 'حدث خطأ أثناء تحميل البيانات' : 'Error loading other leaves'))
  }

  const handleAddOtherLeave = () => {
    setSelectedOtherLeave(null)
    setIsModalOpen(true)
  }

  const handleEditOtherLeave = (otherLeave) => {
    setSelectedOtherLeave(otherLeave)
    setIsModalOpen(true)
  }

  const handleDeleteOtherLeave = async (id) => {
    if (!window.confirm(isArabic ? 'هل أنت متأكد من حذف هذه الإجازة؟' : 'Are you sure you want to delete this leave?')) {
      return
    }

    try {
      const response = await deleteOtherLeave(id)
      if (response.success) {
        toast.success(isArabic ? 'تم حذف الإجازة بنجاح' : 'Leave deleted successfully')
        // Mutate the SWR cache to refetch data
        mutate(`/api/other-leaves?employee_id=${employeeId}`)
      } else {
        toast.error(response.message || (isArabic ? 'حدث خطأ' : 'An error occurred'))
      }
    } catch (error) {
      toast.error(isArabic ? 'حدث خطأ أثناء حذف الإجازة' : 'Error deleting leave')
    }
  }

  const handleModalSuccess = () => {
    // Mutate the SWR cache to refetch data
    mutate(`/api/other-leaves?employee_id=${employeeId}`)
  }

  const getLeaveReasonBadge = (leaveReason) => {
    const reasonConfig = {
      maternity: { color: 'bg-pink-500', label: isArabic ? 'اجازة الأمومة' : 'Maternity Leave' },
      study: { color: 'bg-purple-500', label: isArabic ? 'اجازة دراسية' : 'Study Leave' },
      paternity: { color: 'bg-blue-500', label: isArabic ? 'اجازة الأبوة' : 'Paternity Leave' },
      emergency: { color: 'bg-orange-500', label: isArabic ? 'اجازة طارئة' : 'Emergency Leave' },
      others: { color: 'bg-gray-500', label: isArabic ? 'أخرى' : 'Others' }
    }

    const config = reasonConfig[leaveReason] || { color: 'bg-gray-500', label: leaveReason }

    return (
      <Badge variant="default" className={config.color}>
        {config.label}
      </Badge>
    )
  }

  const getLeaveTypeBadge = (leaveType) => {
    if (leaveType === 'paid') {
      return (
        <Badge variant="default" className="bg-green-500">
          {isArabic ? 'مدفوعة' : 'Paid'}
        </Badge>
      )
    } else {
      return (
        <Badge variant="secondary">
          {isArabic ? 'غير مدفوعة' : 'Unpaid'}
        </Badge>
      )
    }
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>{isArabic ? 'إجازات أخرى' : 'Other Leaves'}</CardTitle>
              <CardDescription>
                {isArabic ? 'إدارة الإجازات الأخرى للموظف ' : 'Manage other employee leaves (Maternity, Paternity, Study, Emergency)'}
              </CardDescription>
            </div>
            <Button onClick={handleAddOtherLeave}>
              <Plus className="h-4 w-4 mr-2" />
              {isArabic ? 'إضافة إجازة' : 'Add Leave'}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
            </div>
          ) : !otherLeaves || otherLeaves.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              {isArabic ? 'لا توجد إجازات' : 'No leaves found'}
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{isArabic ? 'تاريخ الطلب' : 'Request Date'}</TableHead>
                    <TableHead>{isArabic ? 'اسم الموظف' : 'Employee Name'}</TableHead>
                    <TableHead>{isArabic ? 'من تاريخ' : 'From Date'}</TableHead>
                    <TableHead>{isArabic ? 'إلى تاريخ' : 'To Date'}</TableHead>
                    <TableHead>{isArabic ? 'عدد الأيام' : 'Total Days'}</TableHead>
                    <TableHead>{isArabic ? 'المتبقي' : 'Remaining'}</TableHead>
                    <TableHead>{isArabic ? 'سبب الإجازة' : 'Leave Reason'}</TableHead>
                    <TableHead>{isArabic ? 'نوع الإجازة' : 'Leave Type'}</TableHead>
                    <TableHead>{isArabic ? 'تم الإنشاء بواسطة' : 'Created By'}</TableHead>
                    <TableHead className="text-right">{isArabic ? 'الإجراءات' : 'Actions'}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {otherLeaves.map((leave) => (
                    <TableRow key={leave.id}>
                      <TableCell>
                        {leave.date ? format(new Date(leave.date), 'yyyy-MM-dd') : '-'}
                      </TableCell>
                      <TableCell className="font-medium">
                        {leave.employee_name || '-'}
                      </TableCell>
                      <TableCell>
                        {leave.from_date ? format(new Date(leave.from_date), 'yyyy-MM-dd') : '-'}
                      </TableCell>
                      <TableCell>
                        {leave.to_date ? format(new Date(leave.to_date), 'yyyy-MM-dd') : '-'}
                      </TableCell>
                      <TableCell className="font-semibold">
                        {leave.total_days}
                      </TableCell>
                      <TableCell className="text-blue-600">
                        {leave.remaining_days}
                      </TableCell>
                      <TableCell>
                        {getLeaveReasonBadge(leave.leave_reason)}
                      </TableCell>
                      <TableCell>
                        {getLeaveTypeBadge(leave.leave_type)}
                      </TableCell>
                      <TableCell>
                        {leave.created_by_name || '-'}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEditOtherLeave(leave)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteOtherLeave(leave.id)}
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

      {/* Other Leave Modal */}
      <OtherLeaveModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleModalSuccess}
        employeeId={employeeId}
        otherLeave={selectedOtherLeave}
      />
    </div>
  )
}

export default OtherLeave