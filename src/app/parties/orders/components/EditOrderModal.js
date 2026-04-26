"use client"

import React, { useEffect } from 'react'
import { format } from 'date-fns'
import useSWR from 'swr'
import { useFormik } from 'formik'
import * as Yup from 'yup'
import { useTranslations } from "@/hooks/useTranslations"
import { useLanguage } from "@/contexts/LanguageContext"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DatePicker } from "@/components/ui/date-picker"
import { Loader2, Save } from 'lucide-react'
import { toast } from 'react-toastify'
import { getPartyOrderById, updatePartyOrder } from '@/app/services/api/partiesOrders'

const EditOrderModal = ({ 
  isOpen, 
  onClose, 
  orderId, 
  onSuccess 
}) => {
  const { t } = useTranslations()
  const { language } = useLanguage()
  const isArabic = language === 'ar'

  // Validation schema
  const validationSchema = Yup.object({
    date: Yup.date().required(isArabic ? 'التاريخ مطلوب' : 'Date is required').nullable(),
    status: Yup.string().required(isArabic ? 'الحالة مطلوبة' : 'Status is required')
  })

  // Formik setup
  const formik = useFormik({
    initialValues: {
      party_id: '',
      party_name: '',
      type: '',
      date: null,
      status: '',
      case_number: '',
      details: ''
    },
    validationSchema,
    onSubmit: async (values, { setSubmitting }) => {
      try {
        const updateData = {
          party_id: parseInt(values.party_id),
          type: values.type,
          date: values.date ? format(values.date, 'yyyy-MM-dd') : null,
          status: values.status,
          case_number: values.case_number || null,
          details: values.details || null
        }

        const response = await updatePartyOrder(orderId, updateData)
        
        if (response.message) {
          toast.success(isArabic ? 'تم تحديث الطلب بنجاح' : 'Request updated successfully')
          onSuccess?.()
          onClose()
        } else {
          toast.error(response.error || (isArabic ? 'حدث خطأ أثناء تحديث الطلب' : 'Error updating request'))
        }
      } catch (error) {
        // Check if it's a permission error (403)
        const isPermissionError = error?.response?.status === 403
        const errorMessage = isPermissionError 
          ? (error?.response?.data?.message || (isArabic ? 'ليس لديك صلاحية لتحديث الطلب' : 'You do not have permission to update this request'))
          : (isArabic ? 'حدث خطأ أثناء تحديث الطلب' : 'Error updating request')
        
        toast.error(errorMessage)
      } finally {
        setSubmitting(false)
      }
    }
  })

  // Fetch order data
  const { data: orderData, error: orderError, isLoading: orderLoading } = useSWR(
    orderId && isOpen ? `party-order-${orderId}` : null,
    () => getPartyOrderById(orderId),
    {
      revalidateOnFocus: false,
    }
  )

  // Status options
  const statusOptions = [
    { value: 'pending', label: isArabic ? 'قيد الانتظار' : 'Pending' },
    { value: 'approved', label: isArabic ? 'موافق عليه' : 'Approved' },
    { value: 'rejected', label: isArabic ? 'مرفوض' : 'Rejected' },
  ]

  // Load order data into form when modal opens
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (orderData && !orderLoading) {
      const order = orderData
      formik.setValues({
        party_id: order.party_id?.toString() || '',
        party_name: order.party_name || '',
        type: order.type || '',
        date: order.date ? new Date(order.date) : null,
        status: order.status ,
        case_number: order.case_number || '',
        details: order.details || ''
      })
    }
  }, [orderData, orderLoading])

  // Reset form when modal closes
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (!isOpen) {
      formik.resetForm()
    }
  }, [isOpen])

  // Helper function to get error message
  const getErrorMessage = (fieldName) => {
    return formik.touched[fieldName] && formik.errors[fieldName] ? formik.errors[fieldName] : null
  }

  if (orderError) {
    // Check if it's a permission error (403)
    const isPermissionError = orderError?.response?.status === 403
    const errorTitle = isPermissionError 
      ? (isArabic ? 'غير مصرح' : 'Unauthorized')
      : (isArabic ? 'خطأ' : 'Error')
    const errorMessage = isPermissionError 
      ? (orderError?.response?.data?.message || (isArabic ? 'ليس لديك صلاحية لعرض تفاصيل الطلب' : 'You do not have permission to view this request'))
      : (isArabic ? 'حدث خطأ أثناء تحميل بيانات الطلب' : 'Error loading request data')
    
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-destructive">
              {errorTitle}
            </DialogTitle>
          </DialogHeader>
          <div className="text-center py-4">
            <p className="text-muted-foreground">
              {errorMessage}
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={onClose}>
              {isArabic ? 'إغلاق' : 'Close'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className={isArabic ? 'text-right' : 'text-left'}>
            {isArabic ? 'تعديل الطلب' : 'Edit Request'}
          </DialogTitle>
        </DialogHeader>

        {orderLoading ? (
          <div className="flex justify-center items-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <form onSubmit={formik.handleSubmit} className="space-y-4 py-4">
            {/* Party Name (read-only) */}
            <div className="space-y-2">
              <Label htmlFor="party_name" className={isArabic ? 'text-right block' : ''}>
                {isArabic ? 'الطرف' : 'Party'}
              </Label>
              <Input
                id="party_name"
                value={formik.values.party_name}
                disabled
                className={isArabic ? 'text-right bg-muted' : 'bg-muted'}
              />
            </div>
<div className='flex gap-4'>

            {/* Status */}
             <div className="space-y-2">
              <Label htmlFor="status" className={isArabic ? 'text-right block' : ''}>
                {isArabic ? 'الحالة' : 'Status'} <span className="text-red-500">*</span>
              </Label>
              <Select
                key={`status-${formik.values.status}`}
                value={formik.values.status}
                onValueChange={(value) => formik.setFieldValue('status', value)}
              >
                <SelectTrigger className={getErrorMessage('status') ? 'border-red-500' : ''}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {getErrorMessage('status') && (
                <p className="text-sm text-red-500">{getErrorMessage('status')}</p>
              )}
            </div>
            </div>

            {/* Date */}
            <div className="space-y-2">
              <Label htmlFor="date" className={isArabic ? 'text-right block' : ''}>
                {isArabic ? 'التاريخ' : 'Date'} <span className="text-red-500">*</span>
              </Label>
              <DatePicker
                date={formik.values.date}
                onDateChange={(date) => formik.setFieldValue('date', date)}
                placeholder={isArabic ? 'اختر التاريخ' : 'Select date'}
              />
              {getErrorMessage('date') && (
                <p className="text-sm text-red-500">{getErrorMessage('date')}</p>
              )}
            </div>

            {/* Case Number */}
            <div className="space-y-2">
              <Label htmlFor="case_number" className={isArabic ? 'text-right block' : ''}>
                {isArabic ? 'رقم القضية' : 'Case Number'}
              </Label>
              <Input
                id="case_number"
                name="case_number"
                value={formik.values.case_number}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                placeholder={isArabic ? 'أدخل رقم القضية' : 'Enter case number'}
                className={isArabic ? 'text-right' : ''}
              />
            </div>

            {/* Details */}
            <div className="space-y-2">
              <Label htmlFor="details" className={isArabic ? 'text-right block' : ''}>
                {isArabic ? 'التفاصيل' : 'Details'}
              </Label>
              <Textarea
                id="details"
                name="details"
                value={formik.values.details}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                placeholder={isArabic ? 'أدخل التفاصيل...' : 'Enter details...'}
                rows={4}
                className={isArabic ? 'text-right' : ''}
              />
            </div>

            <DialogFooter className={isArabic ? 'flex-row-reverse' : ''}>
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={formik.isSubmitting}
              >
                {isArabic ? 'إلغاء' : 'Cancel'}
              </Button>
              <Button
                type="submit"
                disabled={formik.isSubmitting || !formik.isValid}
              >
                {formik.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                <Save className="mr-2 h-4 w-4" />
                {isArabic ? 'حفظ' : 'Save'}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}

export default EditOrderModal
