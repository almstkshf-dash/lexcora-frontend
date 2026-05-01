"use client"

import { useState, useCallback } from "react"
import { format } from "date-fns"
import { ar } from "date-fns/locale"
import { useTranslations } from "@/hooks/useTranslations"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { CalendarIcon, Plus, CircleX, FileText, ImageIcon, FileIcon } from "lucide-react"
import { cn } from "@/lib/utils"

function PetitionModal({ 
  isOpen, 
  onClose, 
  onSubmit, 
  initialData = null,
  title
}) {
  const { t } = useTranslations()
  
  // Initialize form data
  const [formData, setFormData] = useState({
    submissionDate: initialData?.submissionDate || null,
    orderType: initialData?.orderType || "",
    judgeDecision: initialData?.judgeDecision || null,
    appealDate: initialData?.appealDate || null,
    files: initialData?.files || []
  })

  const [isDragOver, setIsDragOver] = useState(false)

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

  // Handle file selection - store files directly
  const handleFileSelect = useCallback((selectedFiles) => {
    const filesArray = Array.from(selectedFiles);
    
    // Store files directly without base64 conversion
    const newFiles = filesArray.map(file => file);
    
    setFormData(prev => ({
      ...prev,
      files: [...prev.files, ...newFiles]
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

  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 z-50 transition-opacity backdrop-blur-sm"
        onClick={handleClose}
      />
      
      {/* Modal */}
      <div className="fixed inset-0 z-100 flex items-center justify-center p-2 sm:p-4">
        <div 
          className="relative w-full max-w-md sm:max-w-lg lg:max-w-xl transform overflow-hidden rounded-2xl bg-white shadow-xl transition-all h-[90vh] max-h-[600px] flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
            {/* Header */}
            <div className="flex-shrink-0 z-10 flex items-center justify-between bg-white px-4 sm:px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 truncate pr-4">
                {title}
              </h3>
              <button
                onClick={handleClose}
                className="flex-shrink-0 p-1 text-gray-400 hover:text-gray-600 transition-colors rounded-full hover:bg-gray-100"
              >
                <CircleX className="h-5 w-5" />
              </button>
            </div>

            {/* Body - Scrollable */}
            <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
              <div className="px-4 sm:px-6 py-4 sm:py-6 space-y-4 sm:space-y-6">
                {/* Submission Date */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">
                    {t('petitions.submissionDate')}
                    <span className="text-red-500 ml-1">*</span>
                  </Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                                      type="button"

                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal border hover:border-blue-300 transition-colors h-10 text-sm",
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
                  <Label className="text-sm font-medium text-gray-700">
                    {t('petitions.orderType')}
                    <span className="text-red-500 ml-1">*</span>
                  </Label>
                  <Input
                    placeholder={t('petitions.orderTypePlaceholder')}
                    value={formData.orderType}
                    onChange={(e) => handleInputChange("orderType", e.target.value)}
                    className="w-full border hover:border-blue-300 focus:border-blue-500 transition-colors h-10 text-sm"
                  />
                </div>
                
                {/* Judge Decision */}
                <div className="space-y-3">
                  <Label className="text-sm font-medium text-gray-700">
                    {t('petitions.judgeDecision')}
                    <span className="text-red-500 ml-1">*</span>
                  </Label>
                  <RadioGroup
                    value={formData.judgeDecision === null ? "" : formData.judgeDecision.toString()}
                    onValueChange={(value) => handleInputChange("judgeDecision", value === "true")}
                    className="grid grid-cols-1 sm:grid-cols-2 gap-3"
                  >
                    <div className="flex items-center space-x-3 p-3 border rounded-lg hover:border-green-300 transition-colors cursor-pointer">
                      <RadioGroupItem value="true" id="approved" className="text-green-600" />
                      <Label htmlFor="approved" className="text-sm font-medium cursor-pointer flex-1">
                        {t('petitions.approved') || '?????'}
                      </Label>
                    </div>
                    <div className="flex items-center space-x-3 p-3 border rounded-lg hover:border-red-300 transition-colors cursor-pointer">
                      <RadioGroupItem value="false" id="rejected" className="text-red-600" />
                      <Label htmlFor="rejected" className="text-sm font-medium cursor-pointer flex-1">
                        {t('petitions.rejected') || '?????'}
                      </Label>
                    </div>
                  </RadioGroup>
                </div>

                {/* Appeal Date */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">
                    {t('petitions.appealDate')}
                  </Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                                      type="button"

                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal border hover:border-blue-300 transition-colors h-10 text-sm",
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
                  <Label className="text-sm font-medium text-gray-700">
                    {t('petitions.attachFiles')}
                  </Label>
                  
                  {/* Enhanced File Upload Area */}
                  <div
                    className={cn(
                      "border-2 border-dashed rounded-lg p-4 sm:p-6 text-center transition-all cursor-pointer",
                      isDragOver
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-300 hover:border-gray-400 hover:bg-gray-50"
                    )}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => document.getElementById('petitionFileUpload').click()}
                  >
                    <Plus className="h-6 w-6 sm:h-8 sm:w-8 mx-auto mb-2 sm:mb-3 text-gray-400" />
                    <p className="text-sm text-gray-600 mb-1">
                      {t('files.dragAndDrop')}
                    </p>
                    <p className="text-xs text-gray-500">
                      PDF, DOC, TXT, ?? ????
                    </p>
                  </div>

                  {/* Hidden File Input */}
                  <input
                    id="petitionFileUpload"
                    type="file"
                    multiple
                    className="hidden"
                    onChange={handleFileChange}
                    accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png"
                  />

                  {/* Display Selected Files */}
                  {formData.files.length > 0 && (
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-gray-700">
                        {t('files.uploadedFiles')} ({formData.files.length})
                      </Label>
                      <div className="max-h-32 sm:max-h-36 overflow-y-auto border border-gray-200 rounded-lg scrollbar-thin">
                        <div className="p-3 space-y-2">
                          {formData.files.map((file, index) => (
                            <div key={file.name + index} className="flex items-center justify-between p-2 sm:p-3 bg-gray-50 rounded-lg border">
                              <div className="flex items-center space-x-2 sm:space-x-3 flex-1 min-w-0">
                                <div className="flex-shrink-0">
                                  {getFileIcon(file.type)}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium truncate">{file.name}</p>
                                  <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                                </div>
                              </div>
                              <Button
                                              type="button"

                                variant="ghost"
                                size="sm"
                                onClick={() => removeFile(index)}
                                className="flex-shrink-0 text-red-600 hover:text-red-800 hover:bg-red-50 p-1"
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

            {/* Footer - Sticky */}
            <div className="flex-shrink-0 bg-white border-t border-gray-200 px-4 sm:px-6 py-3 sm:py-4 flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3">
              <Button 
                              type="button"

                variant="outline" 
                onClick={handleClose}
                className="w-full sm:w-auto px-4 py-2 text-sm"
              >
                {t('petitions.cancel')}
              </Button>
              <Button 
                              type="button"

                onClick={handleSubmit}
                className="w-full sm:w-auto px-4 py-2 bg-blue-600 hover:bg-blue-700 text-sm"
                disabled={!formData.submissionDate || !formData.orderType || formData.judgeDecision === null}
              >
                {initialData ? t('petitions.update') : t('petitions.add')}
              </Button>
            </div>
          </div>
      </div>
    </>
  )
}

export default PetitionModal