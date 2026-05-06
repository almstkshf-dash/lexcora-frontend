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
import { createPartiesFormWithUpload } from '@/app/services/api/partiesForms'

const AddFormModal = ({ onFormAdded }) => {
  const { language } = useLanguage()
  const { t } = useTranslations()
  const isArabic = language === 'ar'

  const [isOpen, setIsOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedFile, setSelectedFile] = useState(null)
  const [formTitle, setFormTitle] = useState('')
  const [formType, setFormType] = useState('')

  // Form types - must match backend ENUM
  const formTypes = [
    { value: 'welcome_message', label: t('navigation.welcomeMessages') },
    { value: 'price_quote', label: t('navigation.priceQuotes') },
  ]

  const handleFileChange = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validate file type (PDF, DOC, DOCX)
      const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
      if (!allowedTypes.includes(file.type)) {
        toast.error(t('clientForms.errorAdding'))
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
    
    if (!formTitle.trim()) {
      toast.error(isArabic ? 'يرجى إدخال عنوان النموذج' : 'Please enter form title')
      return
    }
    
    if (!formType) {
      toast.error(isArabic ? 'يرجى اختيار نوع النموذج' : 'Please select form type')
      return
    }
    
    if (!selectedFile) {
      toast.error(isArabic ? 'يرجى اختيار ملف' : 'Please select a file')
      return
    }
    
    setIsSubmitting(true)
    
    try {
      const result = await createPartiesFormWithUpload(selectedFile, formTitle, formType)
      
      if (result.success) {
        toast.success(t('clientForms.formAdded'))
        setIsOpen(false)
        setSelectedFile(null)
        setFormTitle('')
        setFormType('')
        if (onFormAdded) {
          onFormAdded()
        }
      } else {
        throw new Error(result.message || 'Failed to add form')
      }
    } catch (error) {
      console.error('Error adding form:', error)
      toast.error(t('clientForms.errorAdding'))
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    setIsOpen(false)
    setSelectedFile(null)
    setFormTitle('')
    setFormType('')
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          {t('clientForms.addNewForm')}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]" dir={isArabic ? 'rtl' : 'ltr'}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            {t('clientForms.addNewForm')}
          </DialogTitle>
          <DialogDescription>
            {isArabic 
              ? 'أدخل عنوان النموذج، اختر النوع وقم بتحميل الملف' 
              : 'Enter form title, select type and upload the file'}
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Form Title */}
          <div className="space-y-2">
            <Label htmlFor="formTitle">
              {t('clientForms.formTitle')} *
            </Label>
            <Input
              id="formTitle"
              type="text"
              value={formTitle}
              onChange={(e) => setFormTitle(e.target.value)}
              placeholder={isArabic ? 'أدخل عنوان النموذج' : 'Enter form title'}
            />
          </div>

          {/* Form Type Select */}
          <div className="space-y-2">
            <Label htmlFor="formType">
              {t('clientForms.formType')} *
            </Label>
            <Select value={formType} onValueChange={setFormType}>
              <SelectTrigger id="formType">
                <SelectValue placeholder={t('clientForms.selectType')} />
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
              {t('clientForms.document')} * (PDF, DOC, DOCX)
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
              {t('common.cancel')}
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
                  {t('common.add')}
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
