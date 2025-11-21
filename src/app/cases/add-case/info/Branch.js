"use client"

import { useState } from 'react'
import useSWR from 'swr'
import { createBranch, getBranches } from "@/app/services/api/branches"
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

function Branch() {
  const { values, setFieldValue, errors, touched, setFieldTouched } = useFormikContext()
  const { branchId } = values
  const { language } = useLanguage()
  const { t } = useTranslations()
  const { data, error, isLoading, mutate } = useSWR('branches', getBranches)
  
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
      toast.error(t('branches.pleaseFillBothNames'))
      return
    }

    setIsSubmitting(true)
    
    try {
      await createBranch(formData)
      toast.success(t('branches.branchCreatedSuccessfully'))
      
      // Refresh the data
      mutate()
      
      // Reset form and close dialog
      setFormData({ name_ar: '', name_en: '' })
      setIsDialogOpen(false)
    } catch (error) {
      toast.error(t('branches.failedToCreateBranch'))

    } finally {
      setIsSubmitting(false)
    }
  }

  if (error) {
    return <div className="text-red-500">{t('branches.failedToLoadBranches')}</div>
  }

  if (isLoading) {
    return <div className="text-gray-500">{t('branches.loadingBranches')}</div>
  }

  return (
    <FormField
      label={t('branches.selectBranch')}
      htmlFor="branchId"
      error={errors.branchId && touched.branchId ? errors.branchId : null}
      required
    >
      <div className="flex items-center gap-2">
        <Select dir={language === 'ar' ? 'rtl' : 'ltr'} value={branchId?.toString() || ''} onValueChange={(value) => {
          setFieldTouched('branchId', true)
          setFieldValue('branchId', parseInt(value))
        }}>
          <SelectTrigger className={`w-full ${errors.branchId && touched.branchId ? 'border-destructive' : ''}`}>
            <SelectValue placeholder={t('branches.selectBranch')} />
          </SelectTrigger>
          <SelectContent>
            {data?.data?.map((branch) => (
              <SelectItem key={branch.id} value={branch.id.toString()}>
                {language === 'ar' ? branch.name_ar : branch.name_en}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button type="button" variant="outline" size="icon" className="shrink-0">
              <Plus className="h-4 w-4" />
            </Button>
          </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle>{t('branches.addNewBranch')}</DialogTitle>
              <DialogDescription>
                {t('branches.addNewBranch')}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name_ar" className="text-right">
                  {t('branches.arabicName')}
                </Label>
                <Input
                  id="name_ar"
                  value={formData.name_ar}
                  onChange={(e) => handleInputChange('name_ar', e.target.value)}
                  className="col-span-3"
                  placeholder={t('branches.enterArabicName')}
                  disabled={isSubmitting}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name_en" className="text-right">
                  {t('branches.englishName')}
                </Label>
                <Input
                  id="name_en"
                  value={formData.name_en}
                  onChange={(e) => handleInputChange('name_en', e.target.value)}
                  className="col-span-3"
                  placeholder={t('branches.enterEnglishName')}
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
                {isSubmitting ? t('branches.creating') : t('branches.createBranch')}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      </div>
    </FormField>
  )
}

export default Branch
