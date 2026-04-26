"use client"

import { useState } from 'react'
import useSWR from 'swr'
import { caseTypes, createCaseType } from "@/app/services/api/cases"
import { useLanguage } from "@/contexts/LanguageContext"
import { useTranslations } from "@/hooks/useTranslations"
import { toast } from 'react-toastify'
import { Plus } from 'lucide-react'
import { useFormikContext } from '../FormikContext'
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

function CaseType() {
  const { values, setFieldValue, errors, touched, setFieldTouched } = useFormikContext()
  const { caseTypeId } = values
  const { language } = useLanguage()
  const { t } = useTranslations()
  const { data, error, isLoading, mutate } = useSWR('case-types', caseTypes)
  
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
      toast.error(t('caseTypes.pleaseFillBothNames'))
      return
    }

    setIsSubmitting(true)
    
    try {
      const response = await createCaseType(formData)
      
      // Check if response indicates failure (permission or other errors)
      if (response?.success === false) {
        toast.error(response?.message || t('caseTypes.failedToCreateCaseType'))
        return
      }
      
      toast.success(t('caseTypes.caseTypeCreatedSuccessfully'))
      
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
        const permissionMessage = error?.response?.data?.message || t('caseTypes.permissionCreate')
        toast.error(permissionMessage)
      } else {
        // Show general error message (try to get from backend first)
        const generalMessage = error?.response?.data?.message || t('caseTypes.failedToCreateCaseType')
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
      ? (error?.response?.data?.message || t('caseTypes.permissionView'))
      : t('caseTypes.failedToLoadCaseTypes')
    
    return <div className="text-red-500">{errorMessage}</div>
  }

  if (isLoading) {
    return <div className="text-gray-500">{t('caseTypes.loadingCaseTypes')}</div>
  }

  return (
    <FormField
      label={t('caseTypes.selectCaseType')}
      htmlFor="caseTypeId"
      error={errors.caseTypeId && touched.caseTypeId ? errors.caseTypeId : null}
      required
    >
      <div className="flex items-center gap-2">
        <Select dir={language === 'ar' ? 'rtl' : 'ltr'} value={caseTypeId?.toString() || ''} onValueChange={(value) => {
          setFieldTouched('caseTypeId', true)
          setFieldValue('caseTypeId', parseInt(value))
        }}>
          <SelectTrigger className={`w-full ${errors.caseTypeId && touched.caseTypeId ? 'border-destructive' : ''}`}>
            <SelectValue placeholder={t('caseTypes.selectCaseType')} />
          </SelectTrigger>
          <SelectContent>
            {data?.data?.map((caseType) => (
              <SelectItem key={caseType.id} value={caseType.id.toString()}>
                {language === 'ar' ? caseType.name_ar : caseType.name_en}
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
              <DialogTitle>{t('caseTypes.addNewCaseType')}</DialogTitle>
              <DialogDescription>
                {t('caseTypes.addNewCaseType')}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name_ar" className="text-right">
                  {t('caseTypes.arabicName')}
                </Label>
                <Input
                  id="name_ar"
                  value={formData.name_ar}
                  onChange={(e) => handleInputChange('name_ar', e.target.value)}
                  className="col-span-3"
                  placeholder={t('caseTypes.enterArabicName')}
                  disabled={isSubmitting}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name_en" className="text-right">
                  {t('caseTypes.englishName')}
                </Label>
                <Input
                  id="name_en"
                  value={formData.name_en}
                  onChange={(e) => handleInputChange('name_en', e.target.value)}
                  className="col-span-3"
                  placeholder={t('caseTypes.enterEnglishName')}
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
                {isSubmitting ? t('caseTypes.creating') : t('caseTypes.createCaseType')}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      </div>
    </FormField>
  )
}

export default CaseType
