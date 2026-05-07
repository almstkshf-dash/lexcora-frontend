"use client"

import { format } from "date-fns"
import { ar } from "date-fns/locale"
import { useTranslations } from "@/hooks/useTranslations"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
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
import { CalendarIcon, Upload, File as FileIcon, X, FileText, Image as ImageIcon, FileSpreadsheet, ExternalLink, Trash2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { toast } from "react-toastify"
import { getExecutionById, updateExecution, deleteExecutionDocument } from "@/app/services/api/executions"
import React, { useState, useEffect, useCallback } from "react"
import { mutate } from "swr"

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
      return <FileIcon className="w-4 h-4" />
  }
}

const EditExecutionModal = ({ 
  isOpen, 
  onClose, 
  executionId,
  caseId
}) => {
  const t = useTranslations('executions')
  const tc = useTranslations('common')
  
  // Internal state management
  const [formData, setFormData] = useState({
    date: null,
    type: "",
    status: "",
    amount: "",
    number: "",
    attachedFiles: [],
    existingDocuments: []
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isDeleteDocDialogOpen, setIsDeleteDocDialogOpen] = useState(false)
  const [deleteDocumentId, setDeleteDocumentId] = useState(null)
  const [isDeletingDoc, setIsDeletingDoc] = useState(false)

  // Execution statuses
  const executionStatuses = [
    { value: "pending", label: t('pending') },
    { value: "in_progress", label: t('inProgress') },
    { value: "completed", label: t('completed') },
    { value: "cancelled", label: t('cancelled') },
  ]

  // Fetch execution data when modal opens
  useEffect(() => {
    if (isOpen && executionId) {
      fetchExecutionData()
    }
  }, [isOpen, executionId, fetchExecutionData])

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      setFormData({
        date: null,
        type: "",
        status: "",
        amount: "",
        number: "",
        attachedFiles: [],
        existingDocuments: []
      })
      setIsLoading(false)
      setIsSubmitting(false)
    }
  }, [isOpen])

  const fetchExecutionData = useCallback(async () => {
    if (!executionId) return
    
    setIsLoading(true)
    try {
      const response = await getExecutionById(executionId)
      const execution = response.data
      
      setFormData({
        date: execution.date ? new Date(execution.date) : null,
        type: execution.type || "",
        status: execution.status || "",
        amount: execution.amount || "",
        number: execution.number || "",
        attachedFiles: [],
        existingDocuments: execution.documents || []
      })
    } catch (error) {
      toast.error(tc('errorLoading'))
    } finally {
      setIsLoading(false)
    }
  }, [executionId, tc])

  const handleInputChange = useCallback((field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }, [])

  const handleFileChange = useCallback((e) => {
    const files = Array.from(e.target.files)
    if (files.length > 0) {
      setFormData(prev => ({
        ...prev,
        attachedFiles: [...prev.attachedFiles, ...files]
      }))
    }
    e.target.value = ''
  }, [])

  const removeFile = useCallback((indexToRemove) => {
    setFormData(prev => ({
      ...prev,
      attachedFiles: prev.attachedFiles.filter((_, index) => index !== indexToRemove)
    }))
  }, [])

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault()
    
    if (!formData.date || !formData.type || !formData.status || !formData.amount || !executionId) {
      return
    }

    setIsSubmitting(true)
    try {
      const updateData = {
        case_id: caseId,
        date: format(formData.date, "yyyy-MM-dd"),
        type: formData.type,
        status: formData.status,
        amount: formData.amount,
        number: formData.number,
        files: formData.attachedFiles
      }
      
      await updateExecution(executionId, updateData)
      
      // Refresh the data
      mutate(`executions-${caseId}`)
      
      // Show success toast
      toast.success(t('updateSuccess'))
      
      // Close modal
      onClose()
    } catch (error) {
      toast.error(t('updateError'))
    } finally {
      setIsSubmitting(false)
    }
  }, [formData, caseId, executionId, t, onClose])

  const handleDeleteDocument = useCallback((documentId) => {
    setDeleteDocumentId(documentId)
    setIsDeleteDocDialogOpen(true)
  }, [])

  const confirmDeleteDocument = useCallback(async () => {
    if (deleteDocumentId) {
      setIsDeletingDoc(true)
      try {
        await deleteExecutionDocument(deleteDocumentId)
        
        // Remove the document from formData.existingDocuments
        const updatedDocuments = formData.existingDocuments.filter(doc => doc.id !== deleteDocumentId)
        handleInputChange('existingDocuments', updatedDocuments)
        
        // Show success toast
        toast.success(t('documentDeletedSuccessfully'))
        
        setIsDeleteDocDialogOpen(false)
        setDeleteDocumentId(null)
      } catch (error) {
        toast.error(t('documentDeleteError'))
      } finally {
        setIsDeletingDoc(false)
      }
    }
  }, [deleteDocumentId, formData.existingDocuments, handleInputChange, t]);

  return (
    <Dialog open={isOpen} onOpenChange={isSubmitting ? undefined : onClose}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t('editExecution')}</DialogTitle>
        </DialogHeader>
        
        {isLoading ? (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            <span className="ml-2">{tc('loading')}</span>
          </div>
        ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Execution Date */}
          <div className="space-y-2">
            <Label>{t('date')}</Label>
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
                  {formData.date ? format(formData.date, "PPP", { locale: ar }) : t('selectDate')}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={formData.date}
                  onSelect={(date) => handleInputChange('date', date)}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Execution Number */}
          {/* <div className="space-y-2">
            <Label htmlFor="edit-number">{t('number')}</Label>
            <Input
              id="edit-number"
              placeholder={t('numberPlaceholder')}
              value={formData.number || ""}
              onChange={(e) => handleInputChange('number', e.target.value)}
            />
          </div> */}

          {/* Execution Type */}
          <div className="space-y-2">
            <Label htmlFor="edit-type">{t('type')}</Label>
            <Input
              id="edit-type"
              placeholder={t('typePlaceholder')}
              value={formData.type}
              onChange={(e) => handleInputChange('type', e.target.value)}
            />
          </div>

          {/* Execution Status */}
          <div className="space-y-2">
            <Label htmlFor="edit-status">{t('status')}</Label>
            <Select
              value={formData.status}
              onValueChange={(value) => handleInputChange('status', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder={t('selectStatus')} />
              </SelectTrigger>
              <SelectContent>
                {executionStatuses.map((status) => (
                  <SelectItem key={status.value} value={status.value}>
                    {status.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Execution Amount */}
          <div className="space-y-2">
            <Label htmlFor="edit-amount">{t('amount')}</Label>
            <Input
              id="edit-amount"
              type="number"
              placeholder={t('amountPlaceholder')}
              value={formData.amount}
              onChange={(e) => handleInputChange('amount', e.target.value)}
            />
          </div>

          {/* Existing Documents Section */}
          {formData.existingDocuments && formData.existingDocuments.length > 0 && (
            <div className="space-y-3">
              <Label className="text-sm font-medium">
                {t('existingDocuments')}
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
                          {t('existingFile')}
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
                        type="button"
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

          {/* File Upload */}
          <div className="space-y-2">
            <Label>{t('attachedFiles')}</Label>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Input
                  type="file"
                  onChange={handleFileChange}
                  multiple
                  className="flex-1"
                  accept="*/*"
                />
                <Button type="button" size="sm" variant="outline" onClick={() => document.querySelector(`input[type="file"]`).click()}>
                  <Upload className="h-4 w-4 mr-2" />
                  {t('upload')}
                </Button>
              </div>
              
              {/* Display selected files */}
              {formData.attachedFiles && formData.attachedFiles.length > 0 && (
                <div className="space-y-2 max-h-24 overflow-y-auto">
                  {formData.attachedFiles.map((file, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded-md">
                      <div className="flex items-center space-x-2 flex-1 min-w-0">
                        <FileIcon className="h-4 w-4 text-blue-600 flex-shrink-0" />
                        <span className="text-sm text-gray-700 truncate">
                          {file.name || file.fileName || 'Unknown file'}
                        </span>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFile(index)}
                        className="h-8 w-8 p-0 text-red-600 hover:text-red-800"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
              {tc('cancel')}
            </Button>
            <Button 
              type="submit"
              disabled={!formData.date || !formData.type || !formData.status || !formData.amount || isSubmitting}
            >
              {isSubmitting ? tc('saving') : t('update')}
            </Button>
          </div>
        </form>
        )}
      </DialogContent>

      {/* Delete Document Confirmation Dialog */}
      <AlertDialog open={isDeleteDocDialogOpen} onOpenChange={setIsDeleteDocDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('confirmDeleteDocument')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('confirmDeleteDocumentMessage')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeletingDoc}>
              {tc('cancel')}
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDeleteDocument}
              disabled={isDeletingDoc}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeletingDoc ? tc('deleting') : tc('delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Dialog>
  )
}

export default EditExecutionModal