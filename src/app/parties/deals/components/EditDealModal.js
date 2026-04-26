"use client"

import React, { useEffect, useState } from 'react'
import { format } from 'date-fns'
import useSWR from 'swr'
import { useSWRConfig } from 'swr'
import { useFormik } from 'formik'
import * as Yup from 'yup'
import { useTranslations } from "@/hooks/useTranslations"
import { useLanguage } from "@/contexts/LanguageContext"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DatePicker } from "@/components/ui/date-picker"
import { Badge } from "@/components/ui/badge"
import { Loader2, Save, X, AlertCircle, Upload, FileText, Image as ImageIcon, File, Trash2, ExternalLink } from 'lucide-react'
import { toast } from 'react-toastify'
import { getClientDealById, updateClientDeal, deleteDealDocument } from '@/app/services/api/clientsDeals'
import { cn } from "@/lib/utils"

const EditDealModal = ({ 
  isOpen, 
  onClose, 
  dealId, 
  onSuccess 
}) => {
  const { t } = useTranslations()
  const { language } = useLanguage()
  const isArabic = language === 'ar'
  const { mutate: globalMutate } = useSWRConfig()

  const [files, setFiles] = useState([])
  const [existingDocuments, setExistingDocuments] = useState([])

  // Validation schema
  const validationSchema = Yup.object({
    amount: Yup.number()
      .required(isArabic ? 'المبلغ مطلوب' : 'Amount is required')
      .positive(isArabic ? 'المبلغ يجب أن يكون أكبر من الصفر' : 'Amount must be greater than zero'),
    type: Yup.string().required(isArabic ? 'نوع الاتفاقية مطلوب' : 'Deal type is required'),
    status: Yup.string().required(isArabic ? 'الحالة مطلوبة' : 'Status is required'),
    start_date: Yup.date().nullable().transform((value, originalValue) => {
      return originalValue === '' || originalValue === 'null' ? null : value
    }),
    end_date: Yup.date().nullable()
      .transform((value, originalValue) => {
        return originalValue === '' || originalValue === 'null' ? null : value
      })
      .when('start_date', {
        is: (val) => val instanceof Date && !isNaN(val),
        then: (schema) => schema.min(
          Yup.ref('start_date'),
          isArabic ? 'تاريخ النهاية يجب أن يكون بعد تاريخ البداية' : 'End date must be after start date'
        ),
        otherwise: (schema) => schema
      })
  })

  // Formik setup
  const formik = useFormik({
    initialValues: {
      client_id: '',
      client_name: '',
      amount: '',
      type: 'normal',
      status: 'draft',
      start_date: null,
      end_date: null
    },
    validationSchema,
    validateOnMount: true,
    enableReinitialize: true,
    onSubmit: async (values, { setSubmitting }) => {
      try {
        const updateData = {
          client_id: parseInt(values.client_id),
          amount: parseFloat(values.amount),
          type: values.type,
          status: values.status,
          start_date: values.start_date ? format(values.start_date, 'yyyy-MM-dd') : null,
          end_date: values.end_date ? format(values.end_date, 'yyyy-MM-dd') : null
        }

        const response = await updateClientDeal(dealId, updateData, files)
        
        if (response.success) {
          toast.success(isArabic ? 'تم تحديث الاتفاقية بنجاح' : 'Deal updated successfully')
          
          // Mutate the current deal data to refresh
          await mutateDeal()
          
          // Also mutate all other deal caches (list views, view modals, etc.)
          globalMutate(key => typeof key === 'string' && (
            key.includes('clients-deals') || 
            key.includes(`deal-view-${dealId}`) ||
            key.includes(`deal-${dealId}`)
          ))
          
          // Reset files state since they're now saved
          setFiles([])
          
          onSuccess?.()
          onClose()
        } else {
          toast.error(response.error || (isArabic ? 'حدث خطأ أثناء تحديث الاتفاقية' : 'Error updating deal'))
        }
      } catch (error) {
        // Check if it's a permission error (403)
        const isPermissionError = error?.response?.status === 403
        const errorMessage = isPermissionError 
          ? (error?.response?.data?.message || (isArabic ? 'ليس لديك صلاحية لتحديث الاتفاقية' : 'You do not have permission to update this deal'))
          : (isArabic ? 'حدث خطأ أثناء تحديث الاتفاقية' : 'Error updating deal')
        
        toast.error(errorMessage)
      } finally {
        setSubmitting(false)
      }
    }
  })

  // Fetch deal data
  const { data: dealData, error: dealError, isLoading: dealLoading, mutate: mutateDeal } = useSWR(
    dealId && isOpen ? `deal-${dealId}` : null,
    () => getClientDealById(dealId),
    {
      revalidateOnFocus: false,
    }
  )

  // Status options
  const statusOptions = [
    { value: 'draft', label: isArabic ? 'مسودة' : 'Draft' },
    { value: 'completed', label: isArabic ? 'مكتمل' : 'Completed' }
  ]

  // Type options
  const typeOptions = [
    { value: 'normal', label: isArabic ? 'عادية' : 'Normal' },
    { value: 'yearly', label: isArabic ? 'سنوية' : 'Yearly' }
  ]

  // Load deal data into form when modal opens
  useEffect(() => {
    if (dealData?.success && dealData.data) {
      const deal = dealData.data
      formik.setValues({
        client_id: deal.client_id?.toString() || '',
        client_name: deal.client_name || '',
        amount: deal.amount?.toString() || '',
        type: deal.type || 'normal',
        status: deal.status || 'draft',
        start_date: deal.start_date ? new Date(deal.start_date) : null,
        end_date: deal.end_date ? new Date(deal.end_date) : null
      })
      
      // Set existing documents
      setExistingDocuments(deal.documents || [])
    }
  }, [dealData, formik.setValues])

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      formik.resetForm()
      setFiles([])
      setExistingDocuments([])
    }
  }, [isOpen, formik.resetForm])

  // File handling functions
  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files || [])
    if (selectedFiles.length > 0) {
      setFiles(prev => [...prev, ...selectedFiles])
    }
  }

  const removeFile = (index) => {
    setFiles(prev => prev.filter((_, i) => i !== index))
  }

  const handleDeleteExistingDocument = async (documentId) => {
    if (!confirm(isArabic ? 'هل أنت متأكد من حذف هذا المستند؟' : 'Are you sure you want to delete this document?')) {
      return
    }

    try {
      const response = await deleteDealDocument(dealId, documentId)
      if (response.success) {
        toast.success(isArabic ? 'تم حذف المستند بنجاح' : 'Document deleted successfully')
        
        // Update local state
        setExistingDocuments(prev => prev.filter(doc => doc.id !== documentId))
        
        // Also mutate to refresh data from server
        await mutateDeal()
      } else {
        toast.error(response.error || (isArabic ? 'حدث خطأ أثناء حذف المستند' : 'Error deleting document'))
      }
    } catch (error) {
      // Check if it's a permission error (403)
      const isPermissionError = error?.response?.status === 403
      const errorMessage = isPermissionError 
        ? (error?.response?.data?.message || (isArabic ? 'ليس لديك صلاحية لحذف المستند' : 'You do not have permission to delete this document'))
        : (isArabic ? 'حدث خطأ أثناء حذف المستند' : 'Error deleting document')
      
      toast.error(errorMessage)
    }
  }

  const getFileIcon = (fileType) => {
    if (fileType?.startsWith('image/')) return <ImageIcon className="h-5 w-5 text-blue-500" />
    if (fileType?.includes('pdf')) return <FileText className="h-5 w-5 text-red-500" />
    return <File className="h-5 w-5 text-gray-500" />
  }

  const formatFileSize = (bytes) => {
    if (!bytes || bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
  }

  // Helper function to get error message
  const getErrorMessage = (fieldName) => {
    return formik.touched[fieldName] && formik.errors[fieldName] ? formik.errors[fieldName] : null
  }

  if (dealError) {
    // Check if it's a permission error (403)
    const isPermissionError = dealError?.response?.status === 403
    const errorTitle = isPermissionError 
      ? (isArabic ? 'غير مصرح' : 'Unauthorized')
      : (isArabic ? 'خطأ' : 'Error')
    const errorMessage = isPermissionError 
      ? (dealError?.response?.data?.message || (isArabic ? 'ليس لديك صلاحية لعرض تفاصيل الاتفاقية' : 'You do not have permission to view this deal'))
      : (isArabic ? 'حدث خطأ أثناء تحميل بيانات الاتفاقية' : 'Error loading deal data')
    
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
          <DialogTitle className="flex items-center gap-2">
            <Save className="h-5 w-5" />
            {isArabic ? 'تعديل الاتفاقية' : 'Edit Deal'}
          </DialogTitle>
        </DialogHeader>

        {dealLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">
                {isArabic ? 'جاري تحميل البيانات...' : 'Loading data...'}
              </p>
            </div>
          </div>
        ) : (
          <form onSubmit={formik.handleSubmit}>
            <div className="grid gap-4 py-4">
              {/* Client Name (Read-only) */}
              <div className="space-y-2">
                <Label htmlFor="client_name">
                  {isArabic ? 'العميل' : 'Client'}
                </Label>
                <Input
                  id="client_name"
                  name="client_name"
                  value={formik.values.client_name}
                  disabled
                  className="bg-muted"
                />
              </div>

              {/* Amount */}
              <div className="space-y-2">
                <Label htmlFor="amount">
                  {isArabic ? 'المبلغ *' : 'Amount *'}
                </Label>
                <Input
                  id="amount"
                  name="amount"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder={isArabic ? 'أدخل المبلغ' : 'Enter amount'}
                  value={formik.values.amount}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  disabled={formik.isSubmitting}
                  className={getErrorMessage('amount') ? 'border-destructive' : ''}
                />
                {getErrorMessage('amount') && (
                  <div className="flex items-center gap-2 text-sm text-destructive">
                    <AlertCircle className="h-4 w-4" />
                    {getErrorMessage('amount')}
                  </div>
                )}
              </div>

              {/* Type and Status Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Type */}
                <div className="space-y-2">
                  <Label>
                    {isArabic ? 'نوع الاتفاقية *' : 'Deal Type *'}
                  </Label>
                  <Select
                    name="type"
                    value={formik.values.type}
                    onValueChange={(value) => formik.setFieldValue('type', value)}
                    disabled={formik.isSubmitting}
                  >
                    <SelectTrigger className={getErrorMessage('type') ? 'border-destructive' : ''}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {typeOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {getErrorMessage('type') && (
                    <div className="flex items-center gap-2 text-sm text-destructive">
                      <AlertCircle className="h-4 w-4" />
                      {getErrorMessage('type')}
                    </div>
                  )}
                </div>

                {/* Status */}
                <div className="space-y-2">
                  <Label>
                    {isArabic ? 'الحالة *' : 'Status *'}
                  </Label>
                  <Select
                    name="status"
                    value={formik.values.status}
                    onValueChange={(value) => formik.setFieldValue('status', value)}
                    disabled={formik.isSubmitting}
                  >
                    <SelectTrigger className={getErrorMessage('status') ? 'border-destructive' : ''}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {statusOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {getErrorMessage('status') && (
                    <div className="flex items-center gap-2 text-sm text-destructive">
                      <AlertCircle className="h-4 w-4" />
                      {getErrorMessage('status')}
                    </div>
                  )}
                </div>
              </div>

              {/* Date Range */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Start Date */}
                <div className="space-y-2">
                  <Label>
                    {isArabic ? 'تاريخ البداية' : 'Start Date'}
                  </Label>
                  <DatePicker
                    date={formik.values.start_date}
                    onDateChange={(date) => formik.setFieldValue('start_date', date)}
                    placeholder={isArabic ? 'اختر التاريخ' : 'Select date'}
                    disabled={formik.isSubmitting}
                  />
                  {getErrorMessage('start_date') && (
                    <div className="flex items-center gap-2 text-sm text-destructive">
                      <AlertCircle className="h-4 w-4" />
                      {getErrorMessage('start_date')}
                    </div>
                  )}
                </div>

                {/* End Date */}
                <div className="space-y-2">
                  <Label>
                    {isArabic ? 'تاريخ النهاية' : 'End Date'}
                  </Label>
                  <DatePicker
                    date={formik.values.end_date}
                    onDateChange={(date) => formik.setFieldValue('end_date', date)}
                    placeholder={isArabic ? 'اختر التاريخ' : 'Select date'}
                    minDate={formik.values.start_date}
                    disabled={formik.isSubmitting}
                  />
                  {getErrorMessage('end_date') && (
                    <div className="flex items-center gap-2 text-sm text-destructive">
                      <AlertCircle className="h-4 w-4" />
                      {getErrorMessage('end_date')}
                    </div>
                  )}
                </div>
              </div>

              {/* Existing Documents */}
              {existingDocuments.length > 0 && (
                <div className="space-y-2">
                  <Label>
                    {isArabic ? 'المستندات الحالية' : 'Existing Documents'}
                  </Label>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {existingDocuments.map((doc) => (
                      <div
                        key={doc.id}
                        className="flex items-center justify-between p-2 border rounded-lg bg-muted/30"
                      >
                        <div className="flex items-center space-x-2 flex-1 min-w-0">
                          <FileText className="h-5 w-5 text-blue-500" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{doc.document_name}</p>
                            <p className="text-xs text-muted-foreground">
                              {doc.created_by_name && `${isArabic ? 'بواسطة' : 'By'}: ${doc.created_by_name}`}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => window.open(doc.document_url, '_blank')}
                            className="h-8 w-8 p-0"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteExistingDocument(doc.id)}
                            disabled={formik.isSubmitting}
                            className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* File Upload Section */}
              <div className="space-y-2">
                <Label>
                  {isArabic ? 'إضافة مستندات جديدة' : 'Add New Documents'}
                </Label>
                
                {/* Upload Button */}
                <div className="flex items-center gap-2">
                  <input
                    type="file"
                    multiple
                    onChange={handleFileChange}
                    className="hidden"
                    id="deal-file-upload-edit"
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.txt"
                    disabled={formik.isSubmitting}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => document.getElementById('deal-file-upload-edit')?.click()}
                    disabled={formik.isSubmitting}
                    className="w-full"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    {isArabic ? 'رفع ملفات' : 'Upload Files'}
                  </Button>
                </div>

                {/* New Files List */}
                {files.length > 0 && (
                  <div className="space-y-2 mt-3">
                    <p className="text-sm text-muted-foreground">
                      {isArabic ? `ملفات جديدة (${files.length})` : `New Files (${files.length})`}
                    </p>
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {files.map((file, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-2 border rounded-lg bg-muted/30"
                        >
                          <div className="flex items-center space-x-2 flex-1 min-w-0">
                            {getFileIcon(file.type)}
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate">{file.name}</p>
                              <div className="flex items-center space-x-2 mt-1">
                                <Badge variant="secondary" className="text-xs">
                                  {file.type.split('/')[1]?.toUpperCase() || 'FILE'}
                                </Badge>
                                <span className="text-xs text-muted-foreground">
                                  {formatFileSize(file.size)}
                                </span>
                              </div>
                            </div>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeFile(index)}
                            disabled={formik.isSubmitting}
                            className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </form>
        )}

        <DialogFooter className="flex gap-2">
          <Button 
            type="button"
            variant="outline" 
            onClick={onClose}
            disabled={formik.isSubmitting}
          >
            <X className="h-4 w-4 mr-2" />
            {isArabic ? 'إلغاء' : 'Cancel'}
          </Button>
          <Button 
            type="button"
            onClick={formik.handleSubmit}
            disabled={formik.isSubmitting || dealLoading || !formik.isValid}
          >
            {formik.isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                {isArabic ? 'جاري التحديث...' : 'Updating...'}
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                {isArabic ? 'تحديث' : 'Update'}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default EditDealModal