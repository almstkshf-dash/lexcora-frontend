"use client"

import React, { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import { format } from 'date-fns'
import useSWR from 'swr'
import { useLanguage } from "@/contexts/LanguageContext"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { DatePicker } from "@/components/ui/date-picker"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Loader2, DollarSign, BookOpen, AlertCircle } from 'lucide-react'
import { toast } from 'react-toastify'
import {
  createEmployeeRequest,
  updateEmployeeRequest,
  updateManagerApproval,
  updateHrApproval,
  updateFinanceApproval,
  updateLeaveFinancialValues
} from '@/app/services/api/employeeRequests'
import { getEmployees } from '@/app/services/api/employees'
import { getRequestTypes } from '../constants/requestTypes'

const APPROVAL_OPTIONS = (isArabic) => [
  { value: 'pending',  label: isArabic ? 'قيد الانتظار' : 'Pending' },
  { value: 'approved', label: isArabic ? 'موافق'        : 'Approved' },
  { value: 'rejected', label: isArabic ? 'مرفوض'        : 'Rejected' },
]

const PAY_TYPE_OPTIONS = (isArabic) => [
  { value: 'paid',    label: isArabic ? 'مدفوعة'       : 'Paid' },
  { value: 'unpaid',  label: isArabic ? 'غير مدفوعة'   : 'Unpaid' },
  { value: 'partial', label: isArabic ? 'جزئية'         : 'Partial' },
]

const RequestModal = ({
  isOpen,
  onClose,
  onSuccess,
  request = null,
  activeTab = 'leaves'
}) => {
  const { language } = useLanguage()
  const isArabic = language === 'ar'
  const isEditMode = !!request

  const employeeRole       = useSelector((s) => s.auth.roleEn)
  const userPermissions    = useSelector((s) => s.auth.permissions || [])
  const departmentAr       = useSelector((s) => s.auth.departmentAr)
  const departmentEn       = useSelector((s) => s.auth.departmentEn)

  const isAdmin    = employeeRole?.toLowerCase() === 'admin'
  const isManager  = employeeRole?.toLowerCase() === 'manager'
  const isHR       = departmentAr?.includes('موارد بشرية') || departmentEn?.toLowerCase().includes('hr') || employeeRole?.toLowerCase() === 'hr'
  const isFinance  = departmentAr?.includes('المالية') || departmentEn?.toLowerCase().includes('finance') || employeeRole?.toLowerCase() === 'finance'

  // Fine-grained permission checks (from DB permissions array)
  const hasPermission = (en) => isAdmin || userPermissions.some(p => p.permission_en === en)
  const canEditPaidValue   = hasPermission('Edit Paid Leave Value')
  const canEditUnpaidValue = hasPermission('Edit Unpaid Leave Value')
  const canEditPayType     = hasPermission('Edit Leave Pay Type')
  const canFinanceApprove  = hasPermission('Finance Approve HR Request')
  const canEditFinancials  = canEditPaidValue || canEditUnpaidValue || canEditPayType || isAdmin

  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    employee_id: '', type: '',
    from_date: null, to_date: null,
    reason: '', notes: '',
    manager_approval: 'pending',
    hr_approval: 'pending',
    finance_approval: 'pending',
    finance_notes: '',
    // Financial fields
    leave_pay_type: 'paid',
    days_count: 0,
    daily_rate: 0,
    leave_value_aed: 0,
    account_id: null,
    contra_account_id: null,
  })

  const { data: employeesData } = useSWR('employees-list', getEmployees)
  const employees = employeesData?.data || []

  const allRequestTypes    = getRequestTypes(isArabic)
  const requestTypes       = allRequestTypes.filter(t => activeTab === 'leaves' ? t.isLeave : !t.isLeave)
  const isLeaveType        = allRequestTypes.find(rt => rt.value === formData.type)?.isLeave || false
  const hasFinancialImpact = isLeaveType && formData.leave_value_aed > 0

  useEffect(() => {
    if (isEditMode && request) {
      setFormData({
        employee_id:       request.employee_id,
        type:              request.type,
        from_date:         request.from_date ? new Date(request.from_date) : null,
        to_date:           request.to_date   ? new Date(request.to_date)   : null,
        reason:            request.reason    || '',
        notes:             request.notes     || '',
        manager_approval:  request.manager_approval  || 'pending',
        hr_approval:       request.hr_approval       || 'pending',
        finance_approval:  request.finance_approval  || 'pending',
        finance_notes:     request.finance_notes     || '',
        leave_pay_type:    request.leave_pay_type    || 'paid',
        days_count:        request.days_count        || 0,
        daily_rate:        request.daily_rate        || 0,
        leave_value_aed:   request.leave_value_aed   || 0,
        account_id:        request.account_id        || null,
        contra_account_id: request.contra_account_id || null,
      })
    } else {
      setFormData({
        employee_id: '', type: '',
        from_date: null, to_date: null,
        reason: '', notes: '',
        manager_approval: 'pending', hr_approval: 'pending',
        finance_approval: 'pending', finance_notes: '',
        leave_pay_type: 'paid', days_count: 0,
        daily_rate: 0, leave_value_aed: 0,
        account_id: null, contra_account_id: null,
      })
    }
  }, [request, isEditMode])

  useEffect(() => { if (!isOpen) { setFormData(f => ({ ...f, employee_id: '', type: '' })) } }, [isOpen])

  // Auto-compute leave_value_aed when days/rate/payType changes
  useEffect(() => {
    if (!canEditFinancials) return
    const value = formData.leave_pay_type === 'paid'
      ? parseFloat((formData.daily_rate * formData.days_count).toFixed(2))
      : formData.leave_pay_type === 'unpaid' ? 0
      : formData.leave_value_aed // partial — keep manual value
    setFormData(f => ({ ...f, leave_value_aed: value }))
  }, [formData.leave_pay_type, formData.daily_rate, formData.days_count])

  const set = (field, value) => setFormData(f => {
    const n = { ...f, [field]: value }
    if (field === 'from_date' && f.to_date && value > f.to_date) n.to_date = null
    return n
  })

  const validate = () => {
    if (!formData.employee_id) { toast.error(isArabic ? 'يرجى اختيار الموظف' : 'Select employee'); return false }
    if (!formData.type)        { toast.error(isArabic ? 'يرجى اختيار نوع الطلب' : 'Select request type'); return false }
    if (isLeaveType) {
      if (!formData.from_date) { toast.error(isArabic ? 'يرجى اختيار تاريخ البداية' : 'Select from date'); return false }
      if (!formData.to_date)   { toast.error(isArabic ? 'يرجى اختيار تاريخ النهاية' : 'Select to date');   return false }
      if (formData.from_date > formData.to_date) { toast.error(isArabic ? 'تاريخ البداية يجب أن يكون قبل النهاية' : 'From date must be before to date'); return false }
    }
    return true
  }

  const handleSubmit = async () => {
    if (!validate()) return
    setIsLoading(true)
    try {
      const base = {
        employee_id: formData.employee_id,
        type: formData.type,
        from_date: isLeaveType && formData.from_date ? format(formData.from_date, 'yyyy-MM-dd') : null,
        to_date:   isLeaveType && formData.to_date   ? format(formData.to_date,   'yyyy-MM-dd') : null,
        reason: formData.reason || null,
        notes:  formData.notes  || null,
      }

      let response
      if (isEditMode) {
        response = await updateEmployeeRequest(request.id, base)

        // Approval updates (only if changed)
        const calls = []
        if ((isAdmin || isManager) && activeTab === 'leaves' && formData.manager_approval !== request.manager_approval)
          calls.push(updateManagerApproval(request.id, formData.manager_approval))
        if (formData.hr_approval !== request.hr_approval)
          calls.push(updateHrApproval(request.id, formData.hr_approval))
        if (canFinanceApprove && formData.finance_approval !== request.finance_approval)
          calls.push(updateFinanceApproval(request.id, formData.finance_approval, formData.finance_notes))

        // Financial values (only if changed and user has permission)
        if (canEditFinancials && isLeaveType) {
          const fChanged =
            formData.leave_pay_type  !== request.leave_pay_type  ||
            +formData.days_count     !== +request.days_count     ||
            +formData.daily_rate     !== +request.daily_rate     ||
            +formData.leave_value_aed !== +request.leave_value_aed
          if (fChanged) calls.push(updateLeaveFinancialValues(request.id, {
            leave_pay_type:    formData.leave_pay_type,
            days_count:        formData.days_count,
            daily_rate:        formData.daily_rate,
            leave_value_aed:   formData.leave_value_aed,
            account_id:        formData.account_id,
            contra_account_id: formData.contra_account_id,
          }))
        }
        await Promise.all(calls)
      } else {
        response = await createEmployeeRequest(base)
      }

      if (response?.success !== false) {
        toast.success(isArabic ? (isEditMode ? 'تم التحديث' : 'تم الإضافة') : (isEditMode ? 'Updated' : 'Added'))
        onSuccess?.()
        onClose()
      } else {
        toast.error(response?.message || (isArabic ? 'حدث خطأ' : 'Error'))
      }
    } catch (err) {
      toast.error(err.response?.data?.message || (isArabic ? 'حدث خطأ' : 'Error saving'))
    } finally {
      setIsLoading(false)
    }
  }

  const approvalBadgeVariant = (status) =>
    status === 'approved' ? 'bg-green-100 text-green-800' :
    status === 'rejected' ? 'bg-red-100 text-red-800'    :
    'bg-yellow-100 text-yellow-800'

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[750px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {isArabic ? (isEditMode ? 'تعديل الطلب' : 'إضافة طلب جديد') : (isEditMode ? 'Edit Request' : 'Add New Request')}
            {isEditMode && hasFinancialImpact && (
              <Badge className="bg-blue-100 text-blue-800 text-xs">
                <DollarSign className="h-3 w-3 me-1" />
                {isArabic ? 'له أثر مالي' : 'Financial Impact'}
              </Badge>
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Employee */}
          <div className="space-y-1">
            <Label>{isArabic ? 'الموظف' : 'Employee'} <span className="text-red-500">*</span></Label>
            <Select value={formData.employee_id?.toString()} onValueChange={(v) => set('employee_id', parseInt(v))} disabled={isEditMode}>
              <SelectTrigger><SelectValue placeholder={isArabic ? 'اختر الموظف' : 'Select employee'} /></SelectTrigger>
              <SelectContent>
                {employees.map(e => <SelectItem key={e.id} value={e.id.toString()}>{e.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          {/* Type */}
          <div className="space-y-1">
            <Label>{isArabic ? 'نوع الطلب' : 'Request Type'} <span className="text-red-500">*</span></Label>
            <Select value={formData.type} onValueChange={(v) => set('type', v)}>
              <SelectTrigger><SelectValue placeholder={isArabic ? 'اختر النوع' : 'Select type'} /></SelectTrigger>
              <SelectContent>
                {requestTypes.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          {/* Dates */}
          {isLeaveType && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label>{isArabic ? 'من تاريخ' : 'From Date'} <span className="text-red-500">*</span></Label>
                <DatePicker date={formData.from_date} onDateChange={(d) => set('from_date', d)} />
              </div>
              <div className="space-y-1">
                <Label>{isArabic ? 'إلى تاريخ' : 'To Date'} <span className="text-red-500">*</span></Label>
                <DatePicker date={formData.to_date} onDateChange={(d) => set('to_date', d)} minDate={formData.from_date} />
              </div>
            </div>
          )}

          {/* Reason / Notes */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label>{isArabic ? 'السبب' : 'Reason'}</Label>
              <Textarea rows={2} value={formData.reason} onChange={(e) => set('reason', e.target.value)} placeholder={isArabic ? 'سبب الطلب...' : 'Reason for request...'} />
            </div>
            <div className="space-y-1">
              <Label>{isArabic ? 'ملاحظات' : 'Notes'}</Label>
              <Textarea rows={2} value={formData.notes} onChange={(e) => set('notes', e.target.value)} placeholder={isArabic ? 'ملاحظات إضافية...' : 'Additional notes...'} />
            </div>
          </div>

          {/* ── FINANCIAL SECTION (Leave types only) ─────────────────── */}
          {isLeaveType && (
            <>
              <Separator />
              <div className="rounded-lg border border-blue-200 bg-blue-50/50 p-4 space-y-3">
                <h4 className="font-semibold text-blue-900 flex items-center gap-2 text-sm">
                  <DollarSign className="h-4 w-4" />
                  {isArabic ? 'الربط المالي — قانون العمل الإماراتي' : 'Financial Link — UAE Labour Law'}
                </h4>

                {/* Pay Type */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs">{isArabic ? 'نوع الدفع' : 'Pay Type'}</Label>
                    <Select
                      value={formData.leave_pay_type}
                      onValueChange={(v) => set('leave_pay_type', v)}
                      disabled={!canEditPayType}
                    >
                      <SelectTrigger className="h-8 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {PAY_TYPE_OPTIONS(isArabic).map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1">
                    <Label className="text-xs">{isArabic ? 'عدد الأيام' : 'Days Count'}</Label>
                    <Input
                      type="number" min="0" step="0.5"
                      value={formData.days_count}
                      onChange={(e) => set('days_count', parseFloat(e.target.value) || 0)}
                      disabled={!canEditFinancials}
                      className="h-8 text-xs"
                    />
                  </div>

                  <div className="space-y-1">
                    <Label className="text-xs">{isArabic ? 'المعدل اليومي (درهم)' : 'Daily Rate (AED)'}</Label>
                    <Input
                      type="number" min="0" step="0.01"
                      value={formData.daily_rate}
                      onChange={(e) => set('daily_rate', parseFloat(e.target.value) || 0)}
                      disabled={!canEditPaidValue && !canEditUnpaidValue}
                      className="h-8 text-xs"
                    />
                  </div>
                </div>

                {/* Total value */}
                <div className="flex items-center justify-between rounded-md bg-white border px-3 py-2">
                  <span className="text-sm font-medium text-muted-foreground">
                    {isArabic ? 'القيمة المالية الإجمالية' : 'Total Financial Value'}
                  </span>
                  <span className="text-lg font-bold text-blue-700">
                    {formData.leave_pay_type === 'unpaid'
                      ? (isArabic ? 'بدون راتب' : 'Unpaid')
                      : `${(+formData.leave_value_aed || 0).toLocaleString('en-AE', { minimumFractionDigits: 2 })} AED`
                    }
                  </span>
                </div>

                {/* CoA display (read-only for non-finance users) */}
                {(request?.debit_account_name_en || request?.credit_account_name_en) && (
                  <div className="grid grid-cols-2 gap-3 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <BookOpen className="h-3 w-3 text-red-500" />
                      <span>{isArabic ? 'مدين:' : 'Dr:'}</span>
                      <span className="font-medium text-foreground">
                        {isArabic ? request.debit_account_name_ar : request.debit_account_name_en}
                        {' '}({request.debit_account_code})
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <BookOpen className="h-3 w-3 text-green-500" />
                      <span>{isArabic ? 'دائن:' : 'Cr:'}</span>
                      <span className="font-medium text-foreground">
                        {isArabic ? request.credit_account_name_ar : request.credit_account_name_en}
                        {' '}({request.credit_account_code})
                      </span>
                    </div>
                  </div>
                )}

                {/* Journal Entry link */}
                {request?.journal_entry_id && (
                  <div className="flex items-center gap-2 text-xs text-green-700 bg-green-50 rounded px-2 py-1">
                    <BookOpen className="h-3 w-3" />
                    {isArabic
                      ? `تم إنشاء قيد يومية رقم #${request.journal_entry_id}`
                      : `Journal Entry #${request.journal_entry_id} posted`
                    }
                  </div>
                )}

                {!canEditFinancials && (
                  <div className="flex items-center gap-2 text-xs text-amber-700 bg-amber-50 rounded px-2 py-1">
                    <AlertCircle className="h-3 w-3" />
                    {isArabic
                      ? 'يمكن تعديل القيم المالية من قِبل مدير الموارد البشرية أو الشؤون المالية فقط'
                      : 'Financial values can only be edited by HR/Finance managers'
                    }
                  </div>
                )}
              </div>
            </>
          )}

          {/* ── APPROVAL SECTION (Edit mode only) ─────────────────────── */}
          {isEditMode && (
            <>
              <Separator />
              <div className="space-y-3">
                <h4 className="font-semibold text-sm">{isArabic ? 'حالة الموافقات' : 'Approval Status'}</h4>

                <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                  {/* Manager Approval */}
                  {activeTab === 'leaves' && (
                    <div className="space-y-1">
                      <Label className="text-xs">{isArabic ? 'موافقة المدير' : 'Manager Approval'}</Label>
                      <Select
                        value={formData.manager_approval}
                        onValueChange={(v) => set('manager_approval', v)}
                        disabled={!isAdmin && !isManager}
                      >
                        <SelectTrigger className="h-8">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {APPROVAL_OPTIONS(isArabic).map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {/* HR Approval */}
                  <div className="space-y-1">
                    <Label className="text-xs">{isArabic ? 'موافقة الموارد البشرية' : 'HR Approval'}</Label>
                    <Select value={formData.hr_approval} onValueChange={(v) => set('hr_approval', v)}>
                      <SelectTrigger className="h-8"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {APPROVAL_OPTIONS(isArabic).map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Finance Approval */}
                  <div className="space-y-1">
                    <Label className="text-xs flex items-center gap-1">
                      <DollarSign className="h-3 w-3 text-blue-600" />
                      {isArabic ? 'موافقة الشؤون المالية' : 'Finance Approval'}
                    </Label>
                    <Select
                      value={formData.finance_approval}
                      onValueChange={(v) => set('finance_approval', v)}
                      disabled={!canFinanceApprove}
                    >
                      <SelectTrigger className="h-8"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {APPROVAL_OPTIONS(isArabic).map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Finance notes */}
                {canFinanceApprove && (
                  <div className="space-y-1">
                    <Label className="text-xs">{isArabic ? 'ملاحظات الشؤون المالية' : 'Finance Notes'}</Label>
                    <Textarea
                      rows={2}
                      value={formData.finance_notes}
                      onChange={(e) => set('finance_notes', e.target.value)}
                      placeholder={isArabic ? 'ملاحظات القيد اليومي...' : 'Journal entry notes...'}
                      className="text-xs"
                    />
                  </div>
                )}

                {/* Finance approval info */}
                {request?.finance_approved_by_name && (
                  <p className="text-xs text-muted-foreground">
                    {isArabic ? 'اعتمد من:' : 'Approved by:'}{' '}
                    <span className="font-medium">{request.finance_approved_by_name}</span>
                    {request.finance_approved_at && (
                      <> — {format(new Date(request.finance_approved_at), 'yyyy-MM-dd')}</>
                    )}
                  </p>
                )}
              </div>
            </>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            {isArabic ? 'إلغاء' : 'Cancel'}
          </Button>
          <Button onClick={handleSubmit} disabled={isLoading}>
            {isLoading ? <><Loader2 className="me-2 h-4 w-4 animate-spin" />{isArabic ? 'جاري الحفظ...' : 'Saving...'}</> : (isArabic ? 'حفظ' : 'Save')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default RequestModal
