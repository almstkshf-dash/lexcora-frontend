"use client"

import React, { useState, useEffect } from 'react'
import { format } from 'date-fns'
import { useTranslations } from "@/hooks/useTranslations"
import { useLanguage } from "@/contexts/LanguageContext"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DatePicker } from "@/components/ui/date-picker"
import { Loader2 } from 'lucide-react'
import { toast } from 'react-toastify'
import { createOtherLeave, updateOtherLeave } from '@/app/services/api/otherLeaves'

const OtherLeaveModal = ({ 
  isOpen, 
  onClose, 
  onSuccess,
  employeeId,
  otherLeave = null // If provided, we're editing
}) => {
  const { t } = useTranslations()
  const { language } = useLanguage()
  const isArabic = language === 'ar'
  const isEditMode = !!otherLeave

  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    employee_id: employeeId,
    date: null,
    from_date: null,
    to_date: null,
    total_days: '',
    remaining_days: '',
    leave_reason: '',
    leave_type: ''
  })

  // Leave reason options
  const leaveReasonOptions = [
    { value: 'maternity', label: isArabic ? 'اجازة الأمومة' : 'Maternity Leave' },
    { value: 'paternity', label: isArabic ? 'اجازة الأبوة' : 'Paternity Leave' },
    { value: 'study', label: isArabic ? 'اجازة دراسية' : 'Study Leave' },
    { value: 'emergency', label: isArabic ? 'اجازة طارئة' : 'Emergency Leave' },
    { value: 'others', label: isArabic ? 'أخرى' : 'Others' }
  ]

  // Leave type options
  const leaveTypeOptions = [
    { value: 'paid', label: isArabic ? 'مدفوعة' : 'Paid' },
    { value: 'unpaid', label: isArabic ? 'غير مدفوعة' : 'Unpaid' }
  ]

  // Populate form when editing
  useEffect(() => {
    if (isEditMode && otherLeave) {
      setFormData({
        employee_id: otherLeave.employee_id,
        date: otherLeave.date ? new Date(otherLeave.date) : null,
        from_date: otherLeave.from_date ? new Date(otherLeave.from_date) : null,
        to_date: otherLeave.to_date ? new Date(otherLeave.to_date) : null,
        total_days: otherLeave.total_days.toString(),
        remaining_days: otherLeave.remaining_days.toString(),
        leave_reason: otherLeave.leave_reason,
        leave_type: otherLeave.leave_type
      })
    } else {
      setFormData({
        employee_id: employeeId,
        date: null,
        from_date: null,
        to_date: null,
        total_days: '',
        remaining_days: '',
        leave_reason: '',
        leave_type: ''
      })
    }
  }, [otherLeave, isEditMode, employeeId])

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      setFormData({
        employee_id: employeeId,
        date: null,
        from_date: null,
        to_date: null,
        total_days: '',
        remaining_days: '',
        leave_reason: '',
        leave_type: ''
      })
    }
  }, [isOpen, employeeId])

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  // Auto-calculate total days when from_date and to_date change
  useEffect(() => {
    if (formData.from_date && formData.to_date) {
      const from = new Date(formData.from_date)
      const to = new Date(formData.to_date)
      
      if (to >= from) {
        const diffTime = Math.abs(to - from)
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1 // +1 to include both start and end dates
        handleInputChange('total_days', diffDays.toString())
      }
    }
  }, [formData.from_date, formData.to_date])

  const validateForm = () => {
    if (!formData.date) {
      toast.error(isArabic ? 'يرجى اختيار تاريخ الطلب' : 'Please select request date')
      return false
    }
    if (!formData.from_date) {
      toast.error(isArabic ? 'يرجى اختيار تاريخ البداية' : 'Please select from date')
      return false
    }
    if (!formData.to_date) {
      toast.error(isArabic ? 'يرجى اختيار تاريخ النهاية' : 'Please select to date')
      return false
    }
    if (new Date(formData.to_date) < new Date(formData.from_date)) {
      toast.error(isArabic ? 'تاريخ النهاية يجب أن يكون بعد تاريخ البداية' : 'To date must be after from date')
      return false
    }
    if (!formData.total_days || isNaN(parseInt(formData.total_days))) {
      toast.error(isArabic ? 'يرجى إدخال عدد الأيام' : 'Please enter total days')
      return false
    }
    if (parseInt(formData.total_days) <= 0) {
      toast.error(isArabic ? 'عدد الأيام يجب أن يكون أكبر من الصفر' : 'Total days must be greater than zero')
      return false
    }
    if (formData.remaining_days === '' || isNaN(parseInt(formData.remaining_days))) {
      toast.error(isArabic ? 'يرجى إدخال عدد الأيام المتبقية' : 'Please enter remaining days')
      return false
    }
    if (parseInt(formData.remaining_days) < 0) {
      toast.error(isArabic ? 'عدد الأيام المتبقية لا يمكن أن يكون سالباً' : 'Remaining days cannot be negative')
      return false
    }
    if (!formData.leave_reason) {
      toast.error(isArabic ? 'يرجى اختيار سبب الإجازة' : 'Please select leave reason')
      return false
    }
    if (!formData.leave_type) {
      toast.error(isArabic ? 'يرجى اختيار نوع الإجازة' : 'Please select leave type')
      return false
    }
    return true
  }

  const handleSubmit = async () => {
    if (!validateForm()) return

    setIsLoading(true)
    try {
      const submitData = {
        employee_id: formData.employee_id,
        date: format(formData.date, 'yyyy-MM-dd'),
        from_date: format(formData.from_date, 'yyyy-MM-dd'),
        to_date: format(formData.to_date, 'yyyy-MM-dd'),
        total_days: parseInt(formData.total_days),
        remaining_days: parseInt(formData.remaining_days),
        leave_reason: formData.leave_reason,
        leave_type: formData.leave_type
      }

      let response
      if (isEditMode) {
        response = await updateOtherLeave(otherLeave.id, submitData)
      } else {
        response = await createOtherLeave(submitData)
      }

      if (response.success) {
        toast.success(
          isArabic 
            ? (isEditMode ? 'تم تحديث الإجازة بنجاح' : 'تم إضافة الإجازة بنجاح')
            : (isEditMode ? 'Leave updated successfully' : 'Leave added successfully')
        )
        onSuccess?.()
        onClose()
      } else {
        toast.error(response.message || (isArabic ? 'حدث خطأ' : 'An error occurred'))
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message || 
        (isArabic ? 'حدث خطأ أثناء حفظ البيانات' : 'Error saving leave')
      )
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>
            {isArabic 
              ? (isEditMode ? 'تعديل إجازة أخرى' : 'إضافة إجازة أخرى جديدة')
              : (isEditMode ? 'Edit Other Leave' : 'Add New Other Leave')
            }
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4 max-h-[70vh] overflow-y-auto">
          {/* Request Date */}
          <div className="space-y-2">
            <Label htmlFor="date">
              {isArabic ? 'تاريخ الطلب' : 'Request Date'} <span className="text-red-500">*</span>
            </Label>
            <DatePicker
              date={formData.date}
              onDateChange={(date) => handleInputChange('date', date)}
              placeholder={isArabic ? 'اختر تاريخ الطلب' : 'Select request date'}
            />
          </div>

          {/* From Date */}
          <div className="space-y-2">
            <Label htmlFor="from_date">
              {isArabic ? 'من تاريخ' : 'From Date'} <span className="text-red-500">*</span>
            </Label>
            <DatePicker
              date={formData.from_date}
              onDateChange={(date) => handleInputChange('from_date', date)}
              placeholder={isArabic ? 'اختر تاريخ البداية' : 'Select from date'}
            />
          </div>

          {/* To Date */}
          <div className="space-y-2">
            <Label htmlFor="to_date">
              {isArabic ? 'إلى تاريخ' : 'To Date'} <span className="text-red-500">*</span>
            </Label>
            <DatePicker
              date={formData.to_date}
              onDateChange={(date) => handleInputChange('to_date', date)}
              placeholder={isArabic ? 'اختر تاريخ النهاية' : 'Select to date'}
            />
          </div>

          {/* Total Days */}
          <div className="space-y-2">
            <Label htmlFor="total_days">
              {isArabic ? 'عدد الأيام' : 'Total Days'} <span className="text-red-500">*</span>
            </Label>
            <Input
              id="total_days"
              type="number"
              min="0"
              value={formData.total_days}
              onChange={(e) => handleInputChange('total_days', e.target.value)}
              placeholder={isArabic ? 'أدخل عدد الأيام' : 'Enter total days'}
              disabled={formData.from_date && formData.to_date} // Auto-calculated
            />
            {formData.from_date && formData.to_date && (
              <p className="text-xs text-muted-foreground">
                {isArabic ? 'محسوب تلقائياً من التواريخ المحددة' : 'Auto-calculated from selected dates'}
              </p>
            )}
          </div>

          {/* Remaining Days */}
          <div className="space-y-2">
            <Label htmlFor="remaining_days">
              {isArabic ? 'المتبقي' : 'Remaining Days'} <span className="text-red-500">*</span>
            </Label>
            <Input
              id="remaining_days"
              type="number"
              min="0"
              value={formData.remaining_days}
              onChange={(e) => handleInputChange('remaining_days', e.target.value)}
              placeholder={isArabic ? 'أدخل عدد الأيام المتبقية' : 'Enter remaining days'}
            />
          </div>

          {/* Leave Reason */}
          <div className="space-y-2">
            <Label htmlFor="leave_reason">
              {isArabic ? 'سبب الإجازة' : 'Leave Reason'} <span className="text-red-500">*</span>
            </Label>
            <Select
              value={formData.leave_reason}
              onValueChange={(value) => handleInputChange('leave_reason', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder={isArabic ? 'اختر سبب الإجازة' : 'Select leave reason'} />
              </SelectTrigger>
              <SelectContent>
                {leaveReasonOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Leave Type */}
          <div className="space-y-2">
            <Label htmlFor="leave_type">
              {isArabic ? 'نوع الإجازة' : 'Leave Type'} <span className="text-red-500">*</span>
            </Label>
            <Select
              value={formData.leave_type}
              onValueChange={(value) => handleInputChange('leave_type', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder={isArabic ? 'اختر نوع الإجازة' : 'Select leave type'} />
              </SelectTrigger>
              <SelectContent>
                {leaveTypeOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={onClose}
            disabled={isLoading}
          >
            {isArabic ? 'إلغاء' : 'Cancel'}
          </Button>
          <Button 
            onClick={handleSubmit}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {isArabic ? 'جاري الحفظ...' : 'Saving...'}
              </>
            ) : (
              isArabic ? 'حفظ' : 'Save'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default OtherLeaveModal
