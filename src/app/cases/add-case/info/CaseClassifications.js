"use client"

import { useState } from 'react'
import { useFormikContext } from '../FormikContext'
import useSWR from 'swr'
import { caseClassifications, createCaseClassification } from "@/app/services/api/cases"
import { useLanguage } from "@/contexts/LanguageContext"
import { useTranslations } from "@/hooks/useTranslations"
import { toast } from 'react-toastify'
import { Plus } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import FormField from "@/components/forms/FormField"

function CaseClassifications() {
  const { values, setFieldValue, errors, touched, setFieldTouched } = useFormikContext()
  const { caseClassificationId } = values
  const { language } = useLanguage()
  const { t } = useTranslations()
  const { data, error, isLoading, mutate } = useSWR('case-classifications', caseClassifications)
  
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    name_ar: '',
    name_en: ''
  })

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!formData.name_ar.trim() || !formData.name_en.trim()) {
      toast.error(t('caseClassifications.pleaseFillBothNames'))
      return
    }

    setIsSubmitting(true)
    
    try {
      const response = await createCaseClassification(formData)
      
      // Check if response indicates failure (permission or other errors)
      if (response?.success === false) {
        toast.error(response?.message || t('caseClassifications.failedToCreateCaseClassification'))
        return
      }
      
      toast.success(t('caseClassifications.caseClassificationCreatedSuccessfully'))
      
      // Refresh the data
      mutate()
      
      // Reset form and close dialog
      setFormData({ name_ar: '', name_en: '' })
      setIsDialogOpen(false)
    } catch (error) {
      // Check if it's a permission error (403)
      const isPermissionError = error?.response?.status === 403
      
      if (isPermissionError) {
        // Show permission error message
        const permissionMessage = error?.response?.data?.message || t('caseClassifications.permissionCreate')
        toast.error(permissionMessage)
      } else {
        // Show general error message (try to get from backend first)
        const generalMessage = error?.response?.data?.message || t('caseClassifications.failedToCreateCaseClassification')
        toast.error(generalMessage)
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  if (error) {
    // Check if it's a permission error (403)
    const isPermissionError = error?.response?.status === 403
    const errorMessage = isPermissionError 
      ? (error?.response?.data?.message || t('caseClassifications.permissionView'))
      : t('caseClassifications.failedToLoadCaseClassifications')
    
    return <div className="text-red-500">{errorMessage}</div>
  }

  if (isLoading) {
    return <div className="text-gray-500">{t('caseClassifications.loadingCaseClassifications')}</div>
  }

  return (
    <FormField
      label={t('caseClassifications.selectCaseClassification')}
      htmlFor="caseClassificationId"
      error={errors.caseClassificationId && touched.caseClassificationId ? errors.caseClassificationId : null}
      required
    >
      <div className="flex items-center gap-2">
        <Select  dir={language === 'ar' ? 'rtl' : 'ltr'} value={caseClassificationId?.toString() || ''} onValueChange={(value) => {
          setFieldTouched('caseClassificationId', true)
          setFieldValue('caseClassificationId', parseInt(value))
        }}>
          <SelectTrigger className={`w-full ${errors.caseClassificationId && touched.caseClassificationId ? 'border-destructive' : ''}`}>
            <SelectValue placeholder={t('caseClassifications.selectCaseClassification')} />
          </SelectTrigger>
          <SelectContent>
            {data?.data?.map((caseClassification) => (
              <SelectItem key={caseClassification.id} value={caseClassification.id.toString()}>
                {language === 'ar' ? caseClassification.name_ar : caseClassification.name_en}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button  type="button" variant="outline" size="icon" className="shrink-0">
              <Plus className="h-4 w-4" />
            </Button>
          </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle>{t('caseClassifications.addNewCaseClassification')}</DialogTitle>
              <DialogDescription>
                {t('caseClassifications.addNewCaseClassification')}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name_ar" className="text-right">
                  {t('caseClassifications.arabicName')}
                </Label>
                <Input
                  id="name_ar"
                  value={formData.name_ar}
                  onChange={(e) => handleInputChange('name_ar', e.target.value)}
                  className="col-span-3"
                  placeholder={t('caseClassifications.enterArabicName')}
                  disabled={isSubmitting}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name_en" className="text-right">
                  {t('caseClassifications.englishName')}
                </Label>
                <Input
                  id="name_en"
                  value={formData.name_en}
                  onChange={(e) => handleInputChange('name_en', e.target.value)}
                  className="col-span-3"
                  placeholder={t('caseClassifications.enterEnglishName')}
                  disabled={isSubmitting}
                />
              </div>
            </div>
            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setIsDialogOpen(false)}
                disabled={isSubmitting}
              >
                {t('buttons.cancel')}
              </Button>
              <Button type="button" onClick={handleSubmit} disabled={isSubmitting}>
                {isSubmitting ? t('caseClassifications.creating') : t('caseClassifications.createCaseClassification')}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      </div>
    </FormField>
  )
}

export default CaseClassifications
