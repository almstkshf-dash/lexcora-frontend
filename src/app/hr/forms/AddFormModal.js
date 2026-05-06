"use client"

import React, { useState } from 'react'
import { Plus, FileText, Upload, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useLanguage } from '@/contexts/LanguageContext'
import { useTranslations } from '@/hooks/useTranslations'
import { toast } from 'react-toastify'
import { createFormWithUpload } from '@/app/services/api/forms'

const AddFormModal = ({ onFormAdded }) => {
  const { language } = useLanguage()
  const { t } = useTranslations()
  const isArabic = language === 'ar'

  const [isOpen, setIsOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedFile, setSelectedFile] = useState(null)
  const [documentFor, setDocumentFor] = useState('')

  // Form types - must match backend ENUM
  const formTypes = [
    { value: 'early leave', label: isArabic ? 'إذن مبكر' : 'Early Leave' },
    { value: 'car acknowledgement letter', label: isArabic ? 'خطاب إقرار السيارة' : 'Car Acknowledgement Letter' },
    { value: 'annual leave encashment', label: isArabic ? 'صرف الإجازة السنوية' : 'Annual Leave Encashment' },
    { value: 'employee information', label: isArabic ? 'معلومات الموظف' : 'Employee Information' },
    { value: 'emergency leave', label: isArabic ? 'إجازة طارئة' : 'Emergency Leave' },
    { value: 'email acknowledgement', label: isArabic ? 'إقرار البريد الإلكتروني' : 'Email Acknowledgement' },
    { value: 'acknowledgement letter', label: isArabic ? 'خطاب إقرار' : 'Acknowledgement Letter' },
    { value: 'end of service acknowledgement', label: isArabic ? 'إقرار نهاية الخدمة' : 'End of Service Acknowledgement' },
    { value: 'loan', label: isArabic ? 'قرض' : 'Loan' },
    { value: 'leave application', label: isArabic ? 'طلب إجازة' : 'Leave Application' },
    { value: 'sickness self certificate', label: isArabic ? 'شهادة مرضية ذاتية' : 'Sickness Self Certificate' },
    { value: 'short absent', label: isArabic ? 'غياب قصير' : 'Short Absent' },
    { value: 'salary advance', label: isArabic ? 'سلفة راتب' : 'Salary Advance' },
    { value: 'new starter', label: isArabic ? 'موظف جديد' : 'New Starter' },
    { value: 'others', label: isArabic ? 'أخرى' : 'Others' },
  ]

  const handleFileChange = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validate file type (PDF, DOC, DOCX)
      const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
      if (!allowedTypes.includes(file.type)) {
        toast.error(isArabic ? 'يرجى تحميل ملف PDF أو Word فقط' : 'Please upload only PDF or Word files')
        return
      }
      
      // Validate file size (max 10MB)
      const maxSize = 10 * 1024 * 1024 // 10MB
      if (file.size > maxSize) {
        toast.error(isArabic ? 'حجم الملف كبير جدًا. الحد الأقصى 10 ميجابايت' : 'File size too large. Maximum 10MB')
        return
      }
      
      setSelectedFile(file)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!documentFor) {
      toast.error(isArabic ? 'يرجى اختيار نوع النموذج' : 'Please select form type')
      return
    }
    
    if (!selectedFile) {
      toast.error(isArabic ? 'يرجى اختيار ملف' : 'Please select a file')
      return
    }
    
    setIsSubmitting(true)
    
    try {
      const result = await createFormWithUpload(selectedFile, documentFor)
      
      if (result.success) {
        toast.success(isArabic ? 'تم إضافة النموذج بنجاح' : 'Form added successfully')
        setIsOpen(false)
        setSelectedFile(null)
        setDocumentFor('')
        if (onFormAdded) {
          onFormAdded()
        }
      } else {
        throw new Error(result.message || 'Failed to add form')
      }
    } catch (error) {
      console.error('Error adding form:', error)
      toast.error(isArabic ? 'خطأ في إضافة النموذج' : 'Error adding form')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    setIsOpen(false)
    setSelectedFile(null)
    setDocumentFor('')
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          {isArabic ? 'إضافة نموذج جديد' : 'Add New Form'}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]" dir={isArabic ? 'rtl' : 'ltr'}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            {isArabic ? 'إضافة نموذج جديد' : 'Add New Form'}
          </DialogTitle>
          <DialogDescription>
            {isArabic 
              ? 'اختر نوع النموذج وقم بتحميل الملف' 
              : 'Select the form type and upload the file'}
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Form Type Select */}
          <div className="space-y-2">
            <Label htmlFor="documentFor">
              {isArabic ? 'نوع النموذج' : 'Form Type'} *
            </Label>
            <Select value={documentFor} onValueChange={setDocumentFor}>
              <SelectTrigger id="documentFor">
                <SelectValue placeholder={isArabic ? 'اختر نوع النموذج' : 'Select form type'} />
              </SelectTrigger>
              <SelectContent>
                {formTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* File Upload */}
          <div className="space-y-2">
            <Label htmlFor="file">
              {isArabic ? 'الملف' : 'File'} * (PDF, DOC, DOCX)
            </Label>
            <div className="flex items-center gap-2">
              <Input
                id="file"
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={handleFileChange}
                className="flex-1"
              />
              {selectedFile && (
                <div className="flex items-center gap-1 text-sm text-green-600">
                  <Upload className="w-4 h-4" />
                  <span>{selectedFile.name}</span>
                </div>
              )}
            </div>
            {selectedFile && (
              <p className="text-xs text-muted-foreground">
                {isArabic ? 'حجم الملف' : 'File size'}: {(selectedFile.size / 1024).toFixed(2)} KB
              </p>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              {isArabic ? 'إلغاء' : 'Cancel'}
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 me-2 animate-spin" />
                  {isArabic ? 'جاري الإضافة...' : 'Adding...'}
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 me-2" />
                  {isArabic ? 'إضافة' : 'Add'}
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default AddFormModal

