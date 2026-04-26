"use client"

import { useState, useEffect } from "react"
import { format } from "date-fns"
import { ar } from "date-fns/locale"
import { useTranslations } from "@/hooks/useTranslations"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon, Upload, File as FileIcon, X, FileText, Image as ImageIcon, FileSpreadsheet } from "lucide-react"
import { cn } from "@/lib/utils"
import { createExecution } from "@/app/services/api/executions"
import { toast } from 'react-toastify'

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

const AddExecutionModal = ({ 
  isOpen, 
  onClose, 
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
    attachedFiles: []
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Execution status options
  const executionStatuses = [
    { value: "pending", label: t('pending') },
    { value: "in_progress", label: t('inProgress') },
    { value: "completed", label: t('completed') },
    { value: "cancelled", label: t('cancelled') },
  ]

  // Reset form when modal closes
  const resetForm = () => {
    setFormData({
      date: null,
      type: "",
      status: "",
      amount: "",
      attachedFiles: []
    })
  }



  // Handle input changes
  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  // Handle file selection
  const handleFileChange = (e) => {
    const files = Array.from(e.target.files)
    setFormData(prev => ({
      ...prev,
      attachedFiles: [...prev.attachedFiles, ...files]
    }))
  }

  // Remove file
  const removeFile = (index) => {
    setFormData(prev => ({
      ...prev,
      attachedFiles: prev.attachedFiles.filter((_, i) => i !== index)
    }))
  }

  // Handle modal close
  const handleClose = () => {
    if (!isSubmitting) {
      resetForm()
      onClose()
    }
  }

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!caseId) {
      return
    }

    setIsSubmitting(true)
    
    try {
      const executionData = {
        case_id: caseId,
        date: formData.date ? formData.date.toISOString().split('T')[0] : null,
        type: formData.type,
        status: formData.status,
        amount: parseFloat(formData.amount) || 0,
        files: formData.attachedFiles
      }

      await createExecution(executionData)
      
      // Success: show success toast, reset form and close modal
      toast.success(t('addSuccess') || 'Execution added successfully')
      resetForm()
      onClose()
      
    } catch (error) {
      toast.error(t('addError') || 'Error adding execution. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{t('addExecution')}</DialogTitle>
        </DialogHeader>
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
            <Label htmlFor={`${mode}-number`}>{t('number')}</Label>
            <Input
              id={`${mode}-number`}
              placeholder={t('numberPlaceholder')}
              value={formData.number || ""}
              onChange={(e) => onInputChange('number', e.target.value)}
            />
          </div> */}

          {/* Execution Type */}
          <div className="space-y-2">
            <Label htmlFor="execution-type">{t('type')}</Label>
            <Input
              id="execution-type"
              placeholder={t('typePlaceholder')}
              value={formData.type}
              onChange={(e) => handleInputChange('type', e.target.value)}
            />
          </div>

          {/* Execution Status */}
          <div className="space-y-2">
            <Label htmlFor="execution-status">{t('status')}</Label>
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
            <Label htmlFor="execution-amount">{t('amount')}</Label>
            <Input
              id="execution-amount"
              type="number"
              placeholder={t('amountPlaceholder')}
              value={formData.amount}
              onChange={(e) => handleInputChange('amount', e.target.value)}
            />
          </div>

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
            <Button type="button" variant="outline" onClick={handleClose} disabled={isSubmitting}>
              {tc('cancel')}
            </Button>
            <Button 
              type="submit"
              disabled={!formData.date || !formData.type || !formData.status  || isSubmitting}
            >
              {isSubmitting ? tc('saving') : tc('save')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default AddExecutionModal