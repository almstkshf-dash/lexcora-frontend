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
import { Loader2, Upload, X, FileText, Download } from 'lucide-react'
import { toast } from 'react-toastify'
import { createReview, updateReview, deleteReviewDocument } from '@/app/services/api/reviews'
import { uploadFiles } from '../../../../../../../utils/fileUpload'
// import { uploadFiles } from '@/utils/fileUpload'

const ReviewModal = ({ 
  isOpen, 
  onClose, 
  onSuccess,
  employeeId,
  review = null // If provided, we're editing
}) => {
  const { t } = useTranslations()
  const { language } = useLanguage()
  const isArabic = language === 'ar'
  const isEditMode = !!review

  const [isLoading, setIsLoading] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [formData, setFormData] = useState({
    employee_id: employeeId,
    type: '',
    date: null
  })
  const [selectedFiles, setSelectedFiles] = useState([])
  const [existingDocuments, setExistingDocuments] = useState([])


  const reviewTypeOptions = [
    { value: 'probation', label: isArabic ? 'شهري' : 'Monthly' },
    { value: 'quarterly', label: isArabic ? 'ربع سنوي' : 'Quarterly' },
    { value: 'annual', label: isArabic ? 'سنوي' : 'Annual' },
    { value: 'performance', label: isArabic ? 'رفع الأداء' : 'Performance' },
    { value: 'disciplinary', label: isArabic ? 'ذاتي' : 'Self' }
  ]

  // Populate form when editing
  useEffect(() => {
    if (isEditMode && review) {
      setFormData({
        employee_id: review.employee_id,
        type: review.type,
        date: review.date ? new Date(review.date) : null
      })
      setExistingDocuments(review.documents || [])
    } else {
      setFormData({
        employee_id: employeeId,
        type: '',
        date: null
      })
      setExistingDocuments([])
    }
    setSelectedFiles([])
  }, [review, isEditMode, employeeId])

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      setFormData({
        employee_id: employeeId,
        type: '',
        date: null
      })
      setSelectedFiles([])
      setExistingDocuments([])
    }
  }, [isOpen, employeeId])

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files || [])
    if (files.length > 0) {
      setSelectedFiles(prev => [...prev, ...files])
    }
    // Reset input value to allow selecting the same file again
    e.target.value = ''
  }

  const removeSelectedFile = (index) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index))
  }

  const handleDeleteExistingDocument = async (documentId) => {
    if (!window.confirm(isArabic ? 'هل أنت متأكد من حذف هذا المستند؟' : 'Are you sure you want to delete this document?')) {
      return
    }

    try {
      const response = await deleteReviewDocument(review.id, documentId)
      if (response.success) {
        toast.success(isArabic ? 'تم حذف المستند بنجاح' : 'Document deleted successfully')
        setExistingDocuments(prev => prev.filter(doc => doc.id !== documentId))
      } else {
        toast.error(response.message || (isArabic ? 'حدث خطأ' : 'An error occurred'))
      }
    } catch (error) {
      toast.error(isArabic ? 'حدث خطأ أثناء حذف المستند' : 'Error deleting document')
    }
  }

  const validateForm = () => {
    if (!formData.type) {
      toast.error(isArabic ? 'يرجى اختيار نوع التقييم' : 'Please select review type')
      return false
    }
    if (!formData.date) {
      toast.error(isArabic ? 'يرجى اختيار التاريخ' : 'Please select date')
      return false
    }
    return true
  }

  const handleSubmit = async () => {
    if (!validateForm()) return

    setIsLoading(true)
    try {
      let uploadedDocuments = []

      // Upload new files if any
      if (selectedFiles.length > 0) {
        setIsUploading(true)
        try {
          uploadedDocuments = await uploadFiles(selectedFiles, 'reviews')
          setIsUploading(false)
        } catch (uploadError) {
          setIsUploading(false)
          toast.error(isArabic ? 'فشل رفع الملفات' : 'Failed to upload files')
          setIsLoading(false)
          return
        }
      }

      const submitData = {
        employee_id: formData.employee_id,
        type: formData.type,
        date: format(formData.date, 'yyyy-MM-dd'),
        documents: uploadedDocuments
      }

      let response
      if (isEditMode) {
        response = await updateReview(review.id, submitData)
      } else {
        response = await createReview(submitData)
      }

      if (response.success) {
        toast.success(
          isArabic 
            ? (isEditMode ? 'تم تحديث التقييم بنجاح' : 'تم إضافة التقييم بنجاح')
            : (isEditMode ? 'Review updated successfully' : 'Review added successfully')
        )
        onSuccess?.()
        onClose()
      } else {
        toast.error(response.message || (isArabic ? 'حدث خطأ' : 'An error occurred'))
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message || 
        (isArabic ? 'حدث خطأ أثناء حفظ البيانات' : 'Error saving review')
      )
    } finally {
      setIsLoading(false)
      setIsUploading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px]">
        <DialogHeader>
          <DialogTitle>
            {isArabic 
              ? (isEditMode ? 'تعديل تقييم' : 'إضافة تقييم جديدة')
              : (isEditMode ? 'Edit Review' : 'Add New Review')
            }
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4 max-h-[70vh] overflow-y-auto">
          {/* Review Type */}
          <div className="space-y-2">
            <div className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              {isArabic ? 'نوع التقييم' : 'Review Type'} <span className="text-red-500">*</span>
            </div>
            <Select
              value={formData.type}
              onValueChange={(value) => handleInputChange('type', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder={isArabic ? 'اختر نوع التقييم' : 'Select review type'} />
              </SelectTrigger>
              <SelectContent>
                {reviewTypeOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Date */}
          <div className="space-y-2">
            <div className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              {isArabic ? 'التاريخ' : 'Date'} <span className="text-red-500">*</span>
            </div>
            <DatePicker
              date={formData.date}
              onDateChange={(date) => handleInputChange('date', date)}
              placeholder={isArabic ? 'اختر التاريخ' : 'Select date'}
            />
          </div>

          {/* Existing Documents */}
          {isEditMode && existingDocuments.length > 0 && (
            <div className="space-y-2">
              <Label>{isArabic ? 'المستندات الحالية' : 'Existing Documents'}</Label>
              <div className="space-y-2 max-h-40 overflow-y-auto border rounded-md p-2">
                {existingDocuments.map((doc) => (
                  <div key={doc.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <div className="flex items-center gap-2 flex-1">
                      <FileText className="h-4 w-4 text-blue-500" />
                      <span className="text-sm truncate">{doc.document_name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => window.open(doc.document_url, '_blank')}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteExistingDocument(doc.id)}
                      >
                        <X className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* File Upload */}
          <div className="space-y-2">
            <Label htmlFor="file-upload">
              {isArabic ? 'المستندات' : 'Documents'}
            </Label>
            <div className="border-2 border-dashed rounded-md p-4">
              <input
                type="file"
                id="file-upload"
                multiple
                onChange={handleFileSelect}
                className="hidden"
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
              />
              <label
                htmlFor="file-upload"
                className="flex flex-col items-center justify-center cursor-pointer"
              >
                <Upload className="h-8 w-8 text-gray-400 mb-2" />
                <span className="text-sm text-gray-600">
                  {isArabic ? 'انقر لاختيار الملفات' : 'Click to select files'}
                </span>
                <span className="text-xs text-gray-400 mt-1">
                  {isArabic ? 'PDF, DOC, DOCX, JPG, PNG' : 'PDF, DOC, DOCX, JPG, PNG'}
                </span>
              </label>
            </div>

            {/* Selected Files List */}
            {selectedFiles.length > 0 && (
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {selectedFiles.map((file, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-blue-50 rounded">
                    <div className="flex items-center gap-2 flex-1">
                      <FileText className="h-4 w-4 text-blue-500" />
                      <span className="text-sm truncate">{file.name}</span>
                      <span className="text-xs text-gray-500">
                        ({(file.size / 1024).toFixed(1)} KB)
                      </span>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeSelectedFile(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={onClose}
            disabled={isLoading || isUploading}
          >
            {isArabic ? 'إلغاء' : 'Cancel'}
          </Button>
          <Button 
            onClick={handleSubmit}
            disabled={isLoading || isUploading}
          >
            {isUploading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {isArabic ? 'جاري الرفع...' : 'Uploading...'}
              </>
            ) : isLoading ? (
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

export default ReviewModal
