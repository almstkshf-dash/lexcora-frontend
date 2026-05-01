"use client"

import { useState, useCallback, useEffect } from "react"
import { format } from "date-fns"
import { ar } from "date-fns/locale"
import useSWR from 'swr'
import { useTranslations } from "@/hooks/useTranslations"
import { useLanguage } from '@/contexts/LanguageContext'
import { getJudicialOrderById, updateJudicialOrder, deleteJudicialOrderDocument } from '@/app/services/api/judicialOrders'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Plus, CalendarIcon, Upload, File, X, FileText, ImageIcon, FileSpreadsheet, ExternalLink, Trash2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { mutate } from 'swr'

// Helper function to get file type icon
const getFileIcon = (fileName) => {
  const extension = fileName.split('.').pop()?.toLowerCase() || 'unknown'
  
  switch (extension) {
    case 'pdf':
    case 'doc':
    case 'docx':
    case 'txt':
      return <FileText className="w-4 h-4" />
    case 'jpg':
    case 'jpeg':
    case 'png':
    case 'gif':
    case 'bmp':
      return <ImageIcon className="w-4 h-4" />
    case 'xls':
    case 'xlsx':
    case 'csv':
      return <FileSpreadsheet className="w-4 h-4" />
    default:
      return <File className="w-4 h-4" />
  }
}

// Helper function to format file size
const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

function EditJudicialOrderModal({ isOpen, onClose, caseId, orderId }) {
  const { t } = useTranslations()
  const { language } = useLanguage()
  const [isDragOver, setIsDragOver] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDeleteDocDialogOpen, setIsDeleteDocDialogOpen] = useState(false)
  const [deleteDocumentId, setDeleteDocumentId] = useState(null)
  const [isDeletingDoc, setIsDeletingDoc] = useState(false)

  // Status options
  const statusOptions = [
    { value: 'pending', label: language === 'ar' ? 'معلق' : 'Pending' },
    { value: 'executed', label: language === 'ar' ? 'منفذ' : 'Executed' },
    { value: 'appealed', label: language === 'ar' ? 'مستأنف' : 'Appealed' },
    { value: 'cancelled', label: language === 'ar' ? 'ملغي' : 'Cancelled' }
  ]
  const [formData, setFormData] = useState({
    date: null,
    notification_period_days: "",
    service_completed: false,
    case_filed: false,
    files: [],
    status: "pending"
  })

  // Fetch order data using SWR
  const { data: orderData, error, isLoading } = useSWR(
    isOpen && orderId ? `/judicial-orders/${orderId}` : null,
    () => getJudicialOrderById(orderId),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false
    }
  )

  // Populate form data when order data is loaded
  useEffect(() => {
    if (orderData?.success && orderData?.data) {
      const order = orderData.data
      setFormData({
        date: order.date ? new Date(order.date) : null,
        notification_period_days: order.notification_period_days || "",
        service_completed: order.service_completed === 1,
        case_filed: order.case_filed === 1,
        files: [],
        status: order.status || "pending",
        existingDocuments: order.documents || []
      })
    }
  }, [orderData])

  // Reset form when modal is closed
  useEffect(() => {
    if (!isOpen) {
      setFormData({
        date: null,
        notification_period_days: "",
        service_completed: false,
        case_filed: false,
        files: [],
        status: "pending"
      })
    }
  }, [isOpen])

  // Drag and drop handlers
  const handleDragOver = useCallback((e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(true)
  }, [])

  const handleDragLeave = useCallback((e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(false)
  }, [])

  const handleDrop = useCallback((e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(false)
    
    const files = Array.from(e.dataTransfer.files)
    if (files.length > 0) {
      setFormData(prev => ({
        ...prev,
        files: [...prev.files, ...files]
      }))
    }
  }, [])

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files)
    if (files.length > 0) {
      setFormData(prev => ({
        ...prev,
        files: [...prev.files, ...files]
      }))
    }
    e.target.value = ''
  }

  const removeFile = (indexToRemove) => {
    setFormData(prev => ({
      ...prev,
      files: prev.files.filter((_, index) => index !== indexToRemove)
    }))
  }

  // Handle delete document
  const handleDeleteDocument = (documentId) => {
    setDeleteDocumentId(documentId)
    setIsDeleteDocDialogOpen(true)
  }

  // Confirm delete document
  const confirmDeleteDocument = async () => {
    if (deleteDocumentId) {
      setIsDeletingDoc(true)
      try {
        await deleteJudicialOrderDocument(deleteDocumentId)
        // Refresh the order data to update the documents list
        mutate(`/judicial-orders/${orderId}`)
        setIsDeleteDocDialogOpen(false)
        setDeleteDocumentId(null)
      } catch (error) {
        // You might want to show a toast notification here
      } finally {
        setIsDeletingDoc(false)
      }
    }
  }

  const handleSave = async () => {
    if (formData.date && formData.notification_period_days && orderId) {
      setIsSubmitting(true)
      try {
        const updateData = {
          case_id: caseId,
          date: formData.date.toISOString().split('T')[0],
          notification_period_days: formData.notification_period_days,
          service_completed: formData.service_completed ? 1 : 0,
          case_filed: formData.case_filed ? 1 : 0,
          status: formData.status,
          files: formData.files
        }
        
        await updateJudicialOrder(orderId, updateData)
        
        // Refresh the data in the parent component
        mutate(`/judicial-orders/case/${caseId}`)
        mutate(`/judicial-orders/${orderId}`)
        
        onClose()
      } catch (error) {
        // You might want to show a toast notification here
      } finally {
        setIsSubmitting(false)
      }
    }
  }

  const handleCancel = () => {
    onClose()
  }

  if (isLoading) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-md">
          <div className="flex items-center justify-center p-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-sm text-gray-600">{t('common.loading')}</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  if (error) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-md">
          <div className="text-center p-8">
            <p className="text-red-600">{t('common.errorLoading')}</p>
            <Button onClick={onClose} className="mt-4">
              {t('common.close')}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t('judicialOrders.title')} - تعديل الإشعار القضائي</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {/* Date */}
          <div className="space-y-2">
            <Label htmlFor="orderDate">{t('judicialOrders.date')}</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !formData.date && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {formData.date ? (
                    format(formData.date, "PPP", { locale: language === 'ar' ? ar : undefined })
                  ) : (
                    <span>اختر التاريخ</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={formData.date}
                  onSelect={(date) => handleInputChange("date", date)}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
          
          {/* Notification Period */}
          <div className="space-y-2">
            <Label htmlFor="notificationPeriod">{t('judicialOrders.notificationPeriodDays')}</Label>
            <Input
              id="notificationPeriod"
              type="number"
              placeholder="أدخل مدة الإعلان بالأيام"
              value={formData.notification_period_days}
              onChange={(e) => handleInputChange("notification_period_days", e.target.value)}
            />
          </div>

          {/* Status Select */}
          <div className="space-y-2">
            <Label htmlFor="status">{t('judicialOrders.status')}</Label>
            <Select
              value={formData.status}
              onValueChange={(value) => handleInputChange("status", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="اختر حالة الإشعار" />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {/* Service Completed Checkbox */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="serviceCompleted"
              checked={formData.service_completed}
              onCheckedChange={(checked) => handleInputChange("service_completed", checked)}
            />
            <Label htmlFor="serviceCompleted" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              {t('judicialOrders.serviceCompleted')}
            </Label>
          </div>

          {/* Case Filed Checkbox */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="caseFiled"
              checked={formData.case_filed}
              onCheckedChange={(checked) => handleInputChange("case_filed", checked)}
            />
            <Label htmlFor="caseFiled" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              {t('judicialOrders.caseFiled')}
            </Label>
          </div>

          {/* Existing Documents Section */}
          {formData.existingDocuments && formData.existingDocuments.length > 0 && (
            <div className="space-y-3">
              <Label className="text-sm font-medium">
                المرفقات الموجودة
              </Label>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {formData.existingDocuments.map((doc, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center space-x-3 flex-1 min-w-0">
                      <div className="text-green-600 flex-shrink-0">
                        {getFileIcon(doc.document_name)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-green-800 truncate">
                          {doc.document_name}
                        </div>
                        <div className="text-xs text-green-600">
                          ملف موجود
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => window.open(doc.document_url, '_blank')}
                        className="h-8 w-8 p-0 text-green-600 hover:text-green-800 hover:bg-green-100 flex-shrink-0"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteDocument(doc.id)}
                        className="h-8 w-8 p-0 text-red-600 hover:text-red-800 hover:bg-red-50 flex-shrink-0"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* File Upload Section */}
          <div className="space-y-3">
            <Label htmlFor="judicialOrderFileUpload" className="text-sm font-medium">
              إضافة مرفقات جديدة
            </Label>
            
            {/* File Upload Area */}
            <div 
              className={cn(
                "relative transition-colors duration-200",
                isDragOver && "ring-2 ring-blue-500"
              )}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <input
                id="judicialOrderFileUpload"
                type="file"
                multiple
                onChange={handleFileChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png"
              />
              <div className={cn(
                "flex items-center justify-center w-full h-24 border-2 border-dashed rounded-lg transition-colors cursor-pointer",
                isDragOver 
                  ? "border-blue-500 bg-blue-50" 
                  : "border-gray-300 bg-gray-50 hover:bg-gray-100"
              )}>
                <div className="flex flex-col items-center space-y-2 text-gray-500">
                  <Upload className="w-6 h-6" />
                  <div className="text-sm text-center">
                    <span className="font-medium">
                      {isDragOver ? 'إسقط الملفات هنا' : 'انقر لإضافة الملفات'}
                    </span>
                    <br />
                    <span className="text-xs">PDF, DOC, TXT, أو الصور</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Display New Selected Files */}
            {formData.files.length > 0 && (
              <div className="space-y-2 max-h-32 overflow-y-auto">
                <div className="text-sm font-medium text-gray-700">
                  الملفات الجديدة ({formData.files.length})
                </div>
                {formData.files.map((file, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors">
                    <div className="flex items-center space-x-3 flex-1 min-w-0">
                      <div className="text-blue-600 flex-shrink-0">
                        {getFileIcon(file.name)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-blue-800 truncate">
                          {file.name}
                        </div>
                        <div className="text-xs text-blue-600">
                          {formatFileSize(file.size)}
                        </div>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFile(index)}
                      className="h-8 w-8 p-0 text-blue-600 hover:text-red-600 hover:bg-red-50 flex-shrink-0"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={handleCancel} disabled={isSubmitting}>
              {t('common.cancel')}
            </Button>
            <Button onClick={handleSave} disabled={isSubmitting || !formData.date || !formData.notification_period_days}>
              {isSubmitting ? t('common.saving') : t('common.save')}
            </Button>
          </div>
        </div>
      </DialogContent>

      {/* Delete Document Confirmation Dialog */}
      <AlertDialog open={isDeleteDocDialogOpen} onOpenChange={setIsDeleteDocDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {language === 'ar' ? 'تأكيد حذف المستند' : 'Confirm Delete Document'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {language === 'ar' 
                ? 'هل أنت متأكد من أنك تريد حذف هذا المستند؟ هذا الإجراء لا يمكن التراجع عنه.' 
                : 'Are you sure you want to delete this document? This action cannot be undone.'
              }
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeletingDoc}>
              {language === 'ar' ? 'إلغاء' : 'Cancel'}
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDeleteDocument}
              disabled={isDeletingDoc}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeletingDoc 
                ? (language === 'ar' ? 'جاري الحذف...' : 'Deleting...') 
                : (language === 'ar' ? 'حذف' : 'Delete')
              }
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Dialog>
  )
}

export default EditJudicialOrderModal