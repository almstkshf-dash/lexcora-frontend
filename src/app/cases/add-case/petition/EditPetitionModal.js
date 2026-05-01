"use client"

import { useState, useCallback, useEffect } from "react"
import { format } from "date-fns"
import { ar } from "date-fns/locale"
import { useTranslations } from "@/hooks/useTranslations"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { CalendarIcon, Plus, CircleX, FileText, ImageIcon, FileIcon } from "lucide-react"
import { cn } from "@/lib/utils"

function EditPetitionModal({ 
  isOpen, 
  onClose, 
  onSubmit, 
  initialData = null,
  title
}) {
  const { t } = useTranslations()
  
  // Initialize form data for editing existing petition
  const [formData, setFormData] = useState({
    submissionDate: null,
    orderType: "",
    judgeDecision: null,
    appealDate: null,
    files: []
  })

  const [isDragOver, setIsDragOver] = useState(false)

  // Update form data when initialData changes
  useEffect(() => {
    if (initialData) {
      setFormData({
        submissionDate: initialData.submissionDate || null,
        orderType: initialData.orderType || "",
        judgeDecision: initialData.judgeDecision || null,
        appealDate: initialData.appealDate || null,
        files: initialData.files || []
      })
    }
  }, [initialData])

  // No need for base64 conversion - we'll store File objects directly

  // Format file size
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Get file icon
  const getFileIcon = (type) => {
    if (type.startsWith('image/')) return <ImageIcon className="h-4 w-4" />;
    if (type.includes('pdf')) return <FileText className="h-4 w-4" />;
    return <FileIcon className="h-4 w-4" />;
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files)
    if (files.length > 0) {
      handleFileSelect(files)
    }
    // Clear the input so the same file can be selected again
    e.target.value = ''
  }

  // Handle file selection - store File objects directly
  const handleFileSelect = useCallback((selectedFiles) => {
    const filesArray = Array.from(selectedFiles);
    
    setFormData(prev => ({
      ...prev,
      files: [...prev.files, ...filesArray]
    }));
  }, []);

  // Handle drag events
  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragOver(false);
    const droppedFiles = e.dataTransfer.files;
    handleFileSelect(droppedFiles);
  }, [handleFileSelect]);

  const removeFile = (indexToRemove) => {
    setFormData(prev => ({
      ...prev,
      files: prev.files.filter((_, index) => index !== indexToRemove)
    }))
  }

  const handleSubmit = () => {
    if (formData.submissionDate && formData.orderType && formData.judgeDecision !== null) {
      onSubmit(formData)
      handleClose()
    }
  }

  const handleClose = () => {
    // Reset form data
    setFormData({
      submissionDate: null,
      orderType: "",
      judgeDecision: null,
      appealDate: null,
      files: []
    })
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md sm:max-w-lg lg:max-w-xl max-h-[95vh] p-0 overflow-hidden flex flex-col dark:bg-gray-900 dark:border-gray-700">
        {/* Header */}
        <DialogHeader className="px-4 sm:px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
          <DialogTitle className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-gray-100">
            {title}
          </DialogTitle>
        </DialogHeader>

        {/* Body - Scrollable */}
        <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-gray-100 dark:scrollbar-track-gray-800">
          <div className="px-4 sm:px-6 py-4 sm:py-6 space-y-4 sm:space-y-6">
            {/* Submission Date */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {t('petitions.submissionDate')}
                <span className="text-red-500 ml-1">*</span>
              </Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal border hover:border-blue-300 dark:hover:border-blue-600 transition-colors h-10 text-sm dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100",
                      !formData.submissionDate && "text-muted-foreground"
                    )}
                  >
                        <CalendarIcon className="mr-2 h-4 w-4 flex-shrink-0" />
                        <span className="truncate">
                          {formData.submissionDate ? (
                            format(formData.submissionDate, "PPP", { locale: ar })
                          ) : (
                            t('petitions.selectSubmissionDate')
                          )}
                        </span>
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={formData.submissionDate}
                        onSelect={(date) => handleInputChange("submissionDate", date)}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                
            {/* Order Type */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {t('petitions.orderType')}
                <span className="text-red-500 ml-1">*</span>
              </Label>
              <Input
                placeholder={t('petitions.orderTypePlaceholder')}
                value={formData.orderType}
                onChange={(e) => handleInputChange("orderType", e.target.value)}
                className="w-full border hover:border-blue-300 dark:hover:border-blue-600 focus:border-blue-500 dark:focus:border-blue-400 transition-colors h-10 text-sm"
              />
            </div>
                
            {/* Judge Decision */}
            <div className="space-y-3">
              <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {t('petitions.judgeDecision')}
                <span className="text-red-500 ml-1">*</span>
              </Label>
              <RadioGroup
                value={formData.judgeDecision === null ? "" : formData.judgeDecision.toString()}
                onValueChange={(value) => handleInputChange("judgeDecision", value === "true")}
                className="grid grid-cols-1 sm:grid-cols-2 gap-3"
              >
                <div className="flex items-center space-x-3 p-3 border dark:border-gray-600 rounded-lg hover:border-green-300 dark:hover:border-green-600 transition-colors cursor-pointer dark:bg-gray-800">
                  <RadioGroupItem value="true" id="edit-approved" className="text-green-600" />
                  <Label htmlFor="edit-approved" className="text-sm font-medium cursor-pointer flex-1 dark:text-gray-200">
                    {t('petitions.approved') || 'موافق'}
                  </Label>
                </div>
                <div className="flex items-center space-x-3 p-3 border dark:border-gray-600 rounded-lg hover:border-red-300 dark:hover:border-red-600 transition-colors cursor-pointer dark:bg-gray-800">
                  <RadioGroupItem value="false" id="edit-rejected" className="text-red-600" />
                  <Label htmlFor="edit-rejected" className="text-sm font-medium cursor-pointer flex-1 dark:text-gray-200">
                    {t('petitions.rejected') || 'مرفوض'}
                  </Label>
                </div>
              </RadioGroup>
            </div>

            {/* Appeal Date */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {t('petitions.appealDate')}
              </Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal border hover:border-blue-300 dark:hover:border-blue-600 transition-colors h-10 text-sm dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100",
                      !formData.appealDate && "text-muted-foreground"
                    )}
                  >
                        <CalendarIcon className="mr-2 h-4 w-4 flex-shrink-0" />
                        <span className="truncate">
                          {formData.appealDate ? (
                            format(formData.appealDate, "PPP", { locale: ar })
                          ) : (
                            t('petitions.selectAppealDate')
                          )}
                        </span>
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={formData.appealDate}
                        onSelect={(date) => handleInputChange("appealDate", date)}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                
            {/* File Upload Section */}
            <div className="space-y-3">
              <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {t('petitions.attachFiles')}
              </Label>
              
              {/* Enhanced File Upload Area */}
              <div
                className={cn(
                  "border-2 border-dashed rounded-lg p-4 sm:p-6 text-center transition-all cursor-pointer",
                  isDragOver
                    ? "border-blue-500 bg-blue-50 dark:bg-blue-950/20"
                    : "border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800"
                )}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => document.getElementById('editPetitionFileUpload').click()}
              >
                <Plus className="h-6 w-6 sm:h-8 sm:w-8 mx-auto mb-2 sm:mb-3 text-gray-400 dark:text-gray-500" />
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                  {t('files.dragAndDrop')}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-500">
                  PDF, DOC, TXT, أو صورة
                </p>
              </div>

                  {/* Hidden File Input */}
                  <input
                    id="editPetitionFileUpload"
                    type="file"
                    multiple
                    className="hidden"
                    onChange={handleFileChange}
                    accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png"
                  />

              {/* Display Selected Files */}
              {formData.files.length > 0 && (
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {t('files.uploadedFiles')} ({formData.files.length})
                  </Label>
                  <div className="max-h-32 sm:max-h-36 overflow-y-auto border border-gray-200 dark:border-gray-700 rounded-lg scrollbar-thin">
                    <div className="p-3 space-y-2">
                      {formData.files.map((file, index) => (
                        <div key={file.name + index} className="flex items-center justify-between p-2 sm:p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border dark:border-gray-700">
                          <div className="flex items-center space-x-2 sm:space-x-3 flex-1 min-w-0">
                            <div className="flex-shrink-0 text-gray-600 dark:text-gray-400">
                              {getFileIcon(file.type)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate dark:text-gray-200">{file.name}</p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">{formatFileSize(file.size)}</p>
                            </div>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeFile(index)}
                            className="flex-shrink-0 text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-950/30 p-1"
                          >
                            <CircleX className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <DialogFooter className="border-t border-gray-200 dark:border-gray-700 px-4 sm:px-6 py-3 sm:py-4 flex-shrink-0">
          <Button 
            type="button"
            variant="outline" 
            onClick={handleClose}
          >
            {t('petitions.cancel')}
          </Button>
          <Button 
            type="button"
            onClick={handleSubmit}
            disabled={!formData.submissionDate || !formData.orderType || formData.judgeDecision === null}
          >
            {t('petitions.update')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default EditPetitionModal