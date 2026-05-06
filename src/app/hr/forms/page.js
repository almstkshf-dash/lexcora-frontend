"use client"

import React, { useState, useEffect, useCallback } from 'react'
import { useLanguage } from "@/contexts/LanguageContext"
import { useTranslations } from "@/hooks/useTranslations"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  FileText, 
  Download, 
  Search, 
  Filter,
  Car,
  Clock,
  CreditCard,
  User,
  AlertTriangle,
  Mail,
  CheckCircle,
  LogOut,
  DollarSign,
  Calendar,
  Heart,
  UserCheck,
  Plus,
  Trash2
} from 'lucide-react'
import { toast } from 'react-toastify'
import { getForms, downloadForm, deleteForm } from '@/app/services/api/forms'
import AddFormModal from './AddFormModal'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

// Icon mapping for different form types
const getFormIcon = (documentFor) => {
  const iconMap = {
    'early leave': <Clock className="w-6 h-6" />,
    'car acknowledgement letter': <Car className="w-6 h-6" />,
    'annual leave encashment': <CreditCard className="w-6 h-6" />,
    'employee information': <User className="w-6 h-6" />,
    'emergency leave': <AlertTriangle className="w-6 h-6" />,
    'email acknowledgement': <Mail className="w-6 h-6" />,
    'acknowledgement letter': <CheckCircle className="w-6 h-6" />,
    'end of service acknowledgement': <LogOut className="w-6 h-6" />,
    'loan': <DollarSign className="w-6 h-6" />,
    'leave application': <Calendar className="w-6 h-6" />,
    'sickness self certificate': <Heart className="w-6 h-6" />,
    'short absent': <Clock className="w-6 h-6" />,
    'salary advance': <CreditCard className="w-6 h-6" />,
    'new starter': <UserCheck className="w-6 h-6" />,
    'others': <FileText className="w-6 h-6" />
  }
  
  return iconMap[documentFor] || <FileText className="w-6 h-6" />
}

// Color mapping for different form types
const getFormColor = (documentFor) => {
  const colorMap = {
    'early leave': 'bg-orange-100 border-orange-200 text-orange-800',
    'car acknowledgement letter': 'bg-blue-100 border-blue-200 text-blue-800',
    'annual leave encashment': 'bg-green-100 border-green-200 text-green-800',
    'employee information': 'bg-purple-100 border-purple-200 text-purple-800',
    'emergency leave': 'bg-red-100 border-eed-200 text-red-800',
    'email acknowledgement': 'bg-cyan-100 border-cyan-200 text-cyan-800',
    'acknowledgement letter': 'bg-teal-100 border-teal-200 text-teal-800',
    'end of service acknowledgement': 'bg-gray-100 border-gray-200 text-gray-800',
    'loan': 'bg-yellow-100 border-yellow-200 text-yellow-800',
    'leave application': 'bg-indigo-100 border-indigo-200 text-indigo-800',
    'sickness self certificate': 'bg-pink-100 border-pink-200 text-pink-800',
    'short absent': 'bg-orange-100 border-orange-200 text-orange-800',
    'salary advance': 'bg-emerald-100 border-emerald-200 text-emerald-800',
    'new starter': 'bg-violet-100 border-violet-200 text-violet-800'
  }
  
  return colorMap[documentFor] || 'bg-gray-100 border-gray-200 text-gray-800'
}

export default function FormsPage() {
  const { language } = useLanguage()
  const { t } = useTranslations()
  const isArabic = language === 'ar'

  const [forms, setForms] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedType, setSelectedType] = useState('')
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [formToDelete, setFormToDelete] = useState(null)
  const [isDeleting, setIsDeleting] = useState(false)

  // Fetch forms data
  const fetchForms = useCallback(async () => {
    try {
      setLoading(true)
      const response = await getForms()
      if (response.success) {
        setForms(response.data)
      } else {
        toast.error(response.message || t('common.errorLoading'))
      }
    } catch (error) {

      toast.error(t('common.errorLoading'))
    } finally {
      setLoading(false)
    }
  }, [t])

  useEffect(() => {
    fetchForms()
  }, [fetchForms])

  // Handle form download
  const handleDownload = async (form) => {
    try {
      await downloadForm(form.id)
      toast.success(isArabic ? 'تم تحميل النموذج بنجاح' : 'Form downloaded successfully')
    } catch (error) {

      toast.error(isArabic ? 'خطأ في تحميل النموذج' : 'Error downloading form')
    }
  }

  // Handle delete click
  const handleDeleteClick = (form, e) => {
    e.stopPropagation()
    setFormToDelete(form)
    setDeleteDialogOpen(true)
  }

  // Handle delete confirm
  const handleDeleteConfirm = async () => {
    if (!formToDelete) return

    setIsDeleting(true)
    try {
      const response = await deleteForm(formToDelete.id)
      
      if (response.success) {
        toast.success(isArabic ? 'تم حذف النموذج بنجاح' : 'Form deleted successfully')
        setDeleteDialogOpen(false)
        setFormToDelete(null)
        // Refresh the forms list
        await fetchForms()
      } else {
        throw new Error(response.message || 'Failed to delete form')
      }
    } catch (error) {

      toast.error(isArabic ? 'خطأ في حذف النموذج' : 'Error deleting form')
    } finally {
      setIsDeleting(false)
    }
  }

  // Handle delete cancel
  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false)
    setFormToDelete(null)
  }

  // Filter forms based on search and type
  const filteredForms = forms.filter(form => {
    const matchesSearch = !searchTerm || 
      form.document_for.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t(`forms.types.${form.document_for.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase()}`, { defaultValue: form.document_for }).toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesType = !selectedType || selectedType === 'all' || form.document_for === selectedType
    
    return matchesSearch && matchesType
  })

  // Group forms by type for better organization
  const groupedForms = filteredForms.reduce((acc, form) => {
    if (!acc[form.document_for]) {
      acc[form.document_for] = []
    }
    acc[form.document_for].push(form)
    return acc
  }, {})

  // Get unique form types for filter
  const uniqueTypes = [...new Set(forms.map(form => form.document_for))]

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className={`${isArabic ? 'me-3' : 'ms-3'}`}>{t('common.loading')}</span>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <CardTitle className="text-2xl font-bold ">
                {isArabic ? 'النماذج والوثائق' : 'Forms & Documents'}
              </CardTitle>
              <p className=" mt-1">
                {isArabic ? 'تصفح وتحميل النماذج المطلوبة للموارد البشرية' : 'Browse and download required HR forms'}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant="outline" className="text-sm">
                {filteredForms.length} {isArabic ? 'نموذج' : 'forms'}
              </Badge>
              <AddFormModal onFormAdded={fetchForms} />
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Search and Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className={`absolute ${isArabic ? 'inset-inline-end-3' : 'inset-inline-start-3'} top-1/2 transform -translate-y-1/2  w-4 h-4`} />
              <Input
                placeholder={isArabic ? 'البحث في النماذج...' : 'Search forms...'}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`${isArabic ? 'pe-10' : 'ps-10'}`}
              />
            </div>
            <div className="relative min-w-[200px]">
              <Filter className={`absolute ${isArabic ? 'inset-inline-end-3' : 'inset-inline-start-3'} top-1/2 transform -translate-y-1/2  w-4 h-4 pointer-events-none z-10`} />
              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger className={`w-full ${isArabic ? 'pe-10' : 'ps-10'}`}>
                  <SelectValue placeholder={t('forms.allTypes')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('forms.allTypes')}</SelectItem>
                  {uniqueTypes.map(type => (
                    <SelectItem key={type} value={type}>
                      {t(`forms.types.${type.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase()}`, { defaultValue: type })}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Forms Grid */}
      <Card>
        <CardContent className="pt-6">
          {filteredForms.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="w-12 h-12  mx-auto mb-4" />
              <h3 className="text-lg font-medium  mb-2">
                {isArabic ? 'لا توجد نماذج' : 'No forms found'}
              </h3>
              <p className="">
                {isArabic ? 'لم يتم العثور على نماذج تطابق البحث' : 'No forms match your search criteria'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {Object.entries(groupedForms).map(([documentFor, formsList]) => (
                formsList.map((form) => (
                  <Card 
                    key={form.id} 
                    className={`hover:shadow-lg transition-shadow duration-200 relative ${getFormColor(documentFor)}`}
                  >
                    {/* Delete Button - Top Right Corner */}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute top-2 inset-inline-end-2 h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-full z-10"
                      onClick={(e) => handleDeleteClick(form, e)}
                      title={isArabic ? 'حذف النموذج' : 'Delete Form'}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>

                    <CardContent className="p-6 cursor-pointer" onClick={() => handleDownload(form)}>
                      <div className="flex flex-col items-center text-center space-y-4">
                        {/* Icon */}
                        <div className="p-3 rounded-full bg-white/50">
                          {getFormIcon(documentFor)}
                        </div>
                        
                        {/* Title */}
                        <div>
                          <h3 className="font-semibold text-sm mb-1">
                            {t(`forms.types.${documentFor.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase()}`, { defaultValue: documentFor })}
                          </h3>
                          <p className="text-xs opacity-75">
                            {isArabic ? 'انقر للتحميل' : 'Click to download'}
                          </p>
                        </div>
                        
                        {/* Download Button */}
                        <Button
                          size="sm"
                          variant="secondary"
                          className="w-full bg-white/20 hover:bg-white/30 text-current border-current/20"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleDownload(form)
                          }}
                        >
                          <Download className="w-4 h-4 me-2" />
                          {isArabic ? 'تحميل' : 'Download'}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {isArabic ? 'تأكيد الحذف' : 'Confirm Deletion'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {isArabic 
                ? `هل أنت متأكد من حذف نموذج "${formToDelete ? t(`forms.types.${formToDelete.document_for.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase()}`, { defaultValue: formToDelete.document_for }) : ''}"؟ هذا الإجراء لا يمكن التراجع عنه وسيتم حذف الملف من التخزين السحابي.`
                : `Are you sure you want to delete the "${formToDelete ? t(`forms.types.${formToDelete.document_for.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase()}`, { defaultValue: formToDelete.document_for }) : ''}" form? This action cannot be undone and will delete the file from cloud storage.`
              }
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleDeleteCancel} disabled={isDeleting}>
              {isArabic ? 'إلغاء' : 'Cancel'}
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting 
                ? (isArabic ? 'جاري الحذف...' : 'Deleting...') 
                : (isArabic ? 'حذف' : 'Delete')
              }
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

