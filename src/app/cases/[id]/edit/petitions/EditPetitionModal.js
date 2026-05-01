"use client"

import { useState, useCallback, useEffect } from "react"
import { format, addDays, formatISO, parseISO } from "date-fns"
import { ar } from "date-fns/locale"
import { useTranslations } from "@/hooks/useTranslations"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { CalendarIcon, Upload, X, FileText, ImageIcon, FileIcon, Trash2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { getCasePetitionById, deleteCasePetitionDocument } from '@/app/services/api/CasePetitions'

function EditPetitionModal({ 
  isOpen, 
  onClose, 
  onSubmit, 
  petitionId,
  title = "Edit Petition",
  isLoading = false
}) {
  const { t } = useTranslations()
  
  // State for petition data and loading
  const [petition, setPetition] = useState(null)
  const [isFetching, setIsFetching] = useState(false)
  const [fetchError, setFetchError] = useState(null)
  
  // Initialize form data with petition data when petition is provided
  const [formData, setFormData] = useState({
    submissionDate: null,
    orderType: "",
    judgeDecision: null,
    appealDate: null,
    files: []
  })

  const [isDragOver, setIsDragOver] = useState(false)
  const [existingDocuments, setExistingDocuments] = useState([])
  const [deletingDocumentId, setDeletingDocumentId] = useState(null)

  // Fetch petition data when petitionId changes
  useEffect(() => {
    const fetchPetition = async () => {
      if (!petitionId || !isOpen) return
      
      setIsFetching(true)
      setFetchError(null)
      
      try {
        const response = await getCasePetitionById(petitionId)
        // API returns { success: true, data: {...} }
        if (response.success && response.data) {
          setPetition(response.data)
        } else {
          setFetchError('Invalid response from server')
        }
      } catch (error) {
        setFetchError(error.message || 'Failed to fetch petition data')
      } finally {
        setIsFetching(false)
      }
    }

    fetchPetition()
  }, [petitionId, isOpen])

  // Initialize form data when petition changes
  useEffect(() => {
    if (petition) {
      setFormData({
        submissionDate: petition.date ? parseISO(petition.date) : null,
        orderType: petition.type || "",
        judgeDecision: petition.decision === 1 ? true : petition.decision === 0 ? false : null,
        appealDate: petition.appeal_date ? parseISO(petition.appeal_date) : null,
        files: [] // Note: existing files handling could be implemented here if needed
      })
      
      // Set existing documents
      setExistingDocuments(petition.documents || [])
    }
  }, [petition])

  // Automatically set appeal date based on judge decision and submission date
  useEffect(() => {
    if (formData.judgeDecision !== null && formData.submissionDate) {
      const daysToAdd = formData.judgeDecision ? 8 : 7 // 8 days if approved, 7 days if rejected
      const calculatedAppealDate = addDays(formData.submissionDate, daysToAdd)
      
      setFormData(prev => ({
        ...prev,
        appealDate: calculatedAppealDate
      }))
    } else {
      // Reset appeal date if no decision is made or no submission date
      setFormData(prev => ({
        ...prev,
        appealDate: null
      }))
    }
  }, [formData.judgeDecision, formData.submissionDate])

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

  // Get file icon from document name
  const getDocumentIcon = (fileName) => {
    if (!fileName) return <FileIcon className="h-4 w-4" />;
    const ext = fileName.toLowerCase().split('.').pop();
    if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext)) return <ImageIcon className="h-4 w-4" />;
    if (ext === 'pdf') return <FileText className="h-4 w-4" />;
    return <FileIcon className="h-4 w-4" />;
  };

  // Open document in new tab
  const handleOpenDocument = (url) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  // Delete document
  const handleDeleteDocument = async (e, documentId) => {
    e.stopPropagation(); // Prevent opening the document when clicking delete
    
    if (!confirm(t('petitions.confirmDeleteDocument') || 'Are you sure you want to delete this document?')) {
      return;
    }

    setDeletingDocumentId(documentId);
    
    try {
      const response = await deleteCasePetitionDocument(documentId);
      
      if (response.success) {
        // Remove document from local state
        setExistingDocuments(prev => prev.filter(doc => doc.id !== documentId));
        // You might want to show a success toast here
      }
    } catch (error) {
      // You might want to show an error toast here
      alert(t('petitions.errorDeletingDocument') || 'Failed to delete document');
    } finally {
      setDeletingDocumentId(null);
    }
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
      // Format dates to proper format for database and map to expected API fields
      const formattedData = {
        date: formatISO(formData.submissionDate, { representation: 'date' }),
        type: formData.orderType,
        appeal_date: formData.appealDate ? formatISO(formData.appealDate, { representation: 'date' }) : null,
        decision: formData.judgeDecision ? 1 : 0,
        files: formData.files
      }
      onSubmit(petitionId, formattedData)
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
    setPetition(null)
    setFetchError(null)
    setExistingDocuments([])
    setDeletingDocumentId(null)
    onClose()
  }

  if (!isOpen) return null

  // Show loading state while fetching
  if (isFetching) {
    return (
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="max-w-md p-8 text-center dark:bg-gray-900 dark:border-gray-700">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">{t('common.loading') || 'Loading petition data...'}</p>
        </DialogContent>
      </Dialog>
    )
  }

  // Show error state if fetch failed
  if (fetchError) {
    return (
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="max-w-md p-8 dark:bg-gray-900 dark:border-gray-700">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 dark:bg-red-950/30 mb-4">
              <X className="h-6 w-6 text-red-600 dark:text-red-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
              {t('common.error') || 'Error'}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">{fetchError}</p>
            <Button onClick={handleClose} variant="outline" className="dark:border-gray-600 dark:hover:bg-gray-800 dark:text-gray-300">
              {t('common.close') || 'Close'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    )
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
                    {t('petitions.submissionDate') || 'Submission Date'}
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
                            t('petitions.selectSubmissionDate') || 'Select submission date'
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
                    {t('petitions.orderType') || 'Order Type'}
                    <span className="text-red-500 ml-1">*</span>
                  </Label>
                  <Input
                    placeholder={t('petitions.orderTypePlaceholder') || 'Enter order type'}
                    value={formData.orderType}
                    onChange={(e) => handleInputChange("orderType", e.target.value)}
                    className="w-full border hover:border-blue-300 dark:hover:border-blue-600 focus:border-blue-500 dark:focus:border-blue-400 transition-colors h-10 text-sm"
                  />
                </div>
                
                {/* Judge Decision */}
                <div className="space-y-3">
                  <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {t('petitions.judgeDecision') || 'Judge Decision'}
                    <span className="text-red-500 ml-1">*</span>
                  </Label>
                  <RadioGroup
                    value={formData.judgeDecision === null ? "" : formData.judgeDecision.toString()}
                    onValueChange={(value) => handleInputChange("judgeDecision", value === "true")}
                    className="grid grid-cols-1 sm:grid-cols-2 gap-3"
                  >
                    <div className="flex items-center space-x-3 p-3 border dark:border-gray-600 rounded-lg hover:border-green-300 dark:hover:border-green-600 transition-colors cursor-pointer dark:bg-gray-800">
                      <RadioGroupItem value="true" id="approved" className="text-green-600" />
                      <Label htmlFor="approved" className="text-sm font-medium cursor-pointer flex-1 dark:text-gray-200">
                        {t('petitions.approved') || 'Approved'}
                      </Label>
                    </div>
                    <div className="flex items-center space-x-3 p-3 border dark:border-gray-600 rounded-lg hover:border-red-300 dark:hover:border-red-600 transition-colors cursor-pointer dark:bg-gray-800">
                      <RadioGroupItem value="false" id="rejected" className="text-red-600" />
                      <Label htmlFor="rejected" className="text-sm font-medium cursor-pointer flex-1 dark:text-gray-200">
                        {t('petitions.rejected') || 'Rejected'}
                      </Label>
                    </div>
                  </RadioGroup>
                </div>

                {/* Appeal Date - Only show if judgeDecision is not null */}
                {formData.judgeDecision !== null && (
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {formData.judgeDecision ? t('petitions.lastDateToRegisterCase') : t('petitions.lastDateToAppeal')}
                    </Label>
                    <Button
                      type="button"
                      variant="outline"
                      disabled
                      className={cn(
                        "w-full justify-start text-left font-normal border h-10 text-sm bg-gray-50 dark:bg-gray-800 cursor-not-allowed dark:border-gray-600",
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
                  </div>
                )}
                
                {/* Existing Documents Section */}
                {existingDocuments.length > 0 && (
                  <div className="space-y-3">
                    <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {t('petitions.existingDocuments') || 'Existing Documents'}
                    </Label>
                    <div className="border border-gray-200 dark:border-gray-700 rounded-lg">
                      <div className="max-h-40 overflow-y-auto scrollbar-thin">
                        <div className="p-3 space-y-2">
                          {existingDocuments.map((doc) => (
                            <div 
                              key={doc.id} 
                              className="flex items-center justify-between p-2 sm:p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800 hover:bg-blue-100 dark:hover:bg-blue-950/30 transition-colors group"
                            >
                              <div 
                                className="flex items-center space-x-2 sm:space-x-3 flex-1 min-w-0 cursor-pointer"
                                onClick={() => handleOpenDocument(doc.document_url)}
                              >
                                <div className="flex-shrink-0 text-blue-600 dark:text-blue-400">
                                  {getDocumentIcon(doc.document_name)}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium truncate text-gray-900 dark:text-gray-100">
                                    {doc.document_name}
                                  </p>
                                  <p className="text-xs text-gray-500 dark:text-gray-400">
                                    {t('petitions.clickToView') || 'Click to view'}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center space-x-2 flex-shrink-0">
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={(e) => handleDeleteDocument(e, doc.id)}
                                  disabled={deletingDocumentId === doc.id}
                                  className="p-2 text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                                  title={t('petitions.deleteDocument') || 'Delete document'}
                                >
                                  {deletingDocumentId === doc.id ? (
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600 dark:border-red-400"></div>
                                  ) : (
                                    <Trash2 className="h-4 w-4" />
                                  )}
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* File Upload Section */}
                <div className="space-y-3">
                  <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {t('petitions.attachFiles') || 'Attach New Files'}
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
                    <Upload className="h-6 w-6 sm:h-8 sm:w-8 mx-auto mb-2 sm:mb-3 text-gray-400 dark:text-gray-500" />
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                      {t('files.dragAndDrop')}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-500">
                      {t('petitions.supportedFormats')}
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
                                <X className="h-4 w-4" />
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
                className="w-full sm:w-auto px-4 py-2 text-sm dark:border-gray-600 dark:hover:bg-gray-800 dark:text-gray-300"
                disabled={isLoading}
              >
                {t('petitions.cancel')}
              </Button>
              <Button 
                type="button"
                onClick={handleSubmit}
                className="w-full sm:w-auto px-4 py-2 bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700 text-sm"
                disabled={!formData.submissionDate || !formData.orderType || formData.judgeDecision === null || isLoading}
              >
                {isLoading ? t('petitions.updating') : t('petitions.update')}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )
    }

export default EditPetitionModal