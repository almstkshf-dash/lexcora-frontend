"use client"

import { useState, useCallback, useEffect } from "react"
import { format } from "date-fns"
import { ar } from "date-fns/locale"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CalendarIcon, Plus, Minus, File, FileText, ImageIcon, FileSpreadsheet } from "lucide-react"
import { cn } from "@/lib/utils"
import AddLegalPeriodModal from "./AddLegalPeriodModal"
import { getLegalPeriods } from "@/app/services/api/legalPeriods"

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

// Helper function to get time string from date
const getTimeFromDate = (date) => {
  if (!date) return ""
  const dateObj = typeof date === 'string' ? new Date(date) : date
  if (isNaN(dateObj.getTime())) return ""
  return format(dateObj, "HH:mm")
}

// Helper function to set time on date
const setTimeOnDate = (date, timeString) => {
  if (!timeString) return date
  
  const dateObj = date ? (typeof date === 'string' ? new Date(date) : new Date(date)) : new Date()
  const [hours, minutes] = timeString.split(':').map(Number)
  dateObj.setHours(hours, minutes, 0, 0)
  return dateObj
}

function EditSessionModal({ open, onOpenChange, onUpdate, session, t }) {
  const [isDragOver, setIsDragOver] = useState(false)
  const [legalPeriods, setLegalPeriods] = useState([])
  const [isAddLegalPeriodOpen, setIsAddLegalPeriodOpen] = useState(false)
  const [formData, setFormData] = useState({
    date: null,
    link: "",
    decision: "",
    isExpertSession: false,
    hasRuling: false,
    ruling: "",
    rulingDate: "",
    legalPeriodId: "",
    files: []
  })

  // Fetch legal periods
  useEffect(() => {
    if (open) {
      fetchLegalPeriods()
    }
  }, [open])

  const fetchLegalPeriods = async () => {
    try {
      const data = await getLegalPeriods()
      if (data.success) {
        setLegalPeriods(data.data || [])
      }
    } catch (error) {
      console.error('Error fetching legal periods:', error)
    }
  }

  // Update form data when session changes
  useEffect(() => {
    if (session && open) {
      setFormData({
        date: session.session_date ? new Date(session.session_date) : null,
        link: session.link || "",
        decision: session.decision || "",
        isExpertSession: session.is_expert_session === 1 || session.is_expert_session === true,
        hasRuling: session.has_ruling === 1 || session.has_ruling === true,
        ruling: session.ruling || "",
        rulingDate: session.ruling_date || "",
        legalPeriodId: session.legal_period_id || "",
        files: session.files || []
      })
    }
  }, [session, open])

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

  const handleDrop = useCallback(async (e) => {
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
    if (field === "time") {
      setFormData(prev => ({
        ...prev,
        date: setTimeOnDate(prev.date || new Date(), value)
      }))
    } else if (field === "hasRuling") {
      setFormData(prev => ({
        ...prev,
        hasRuling: value,
        // Clear ruling, ruling date and legal period if unchecked
        ruling: value ? prev.ruling : "",
        rulingDate: value ? prev.rulingDate : "",
        legalPeriodId: value ? prev.legalPeriodId : ""
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }))
    }
  }

  const handleFileChange = async (e) => {
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

  const handleSubmit = () => {
    if (formData.date && session) {
      const formattedDate = format(formData.date, 'yyyy-MM-dd HH:mm:ss')
      
      const updatedSession = {
        ...session,
        session_date: formattedDate,
        link: formData.link,
        decision: formData.decision,
        is_expert_session: formData.isExpertSession,
        has_ruling: formData.hasRuling,
        ruling: formData.ruling,
        ruling_date: formData.rulingDate,
        legal_period_id: formData.legalPeriodId,
        files: formData.files
      }
      
      onUpdate(updatedSession)
      onOpenChange(false)
    }
  }

  const handleCancel = () => {
    onOpenChange(false)
  }

  const handleAddLegalPeriod = () => {
    setIsAddLegalPeriodOpen(true)
  }

  const handleLegalPeriodAdded = () => {
    fetchLegalPeriods()
    setIsAddLegalPeriodOpen(false)
  }

  const selectedPeriod = legalPeriods.find(p => p.id === parseInt(formData.legalPeriodId))

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle>{t('sessions.editSession')}</DialogTitle>
        </DialogHeader>
        
        <div className="flex-1 overflow-y-auto px-1 -mx-1">
          <div className="space-y-4 py-2">
            {/* Date Picker */}
            <div className="space-y-2">
              <Label htmlFor="edit-date">{t('sessions.date')}</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button type="button"
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !formData.date && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.date ? (
                      format(formData.date, "PPP", { locale: ar })
                    ) : (
                      <span>{t('sessions.selectDate')}</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 z-[9999]" align="start">
                  <Calendar
                    mode="single"
                    selected={formData.date}
                    onSelect={(date) => handleInputChange("date", date)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            
            {/* Time Input */}
            <div className="space-y-2">
              <Label htmlFor="edit-time">{t('sessions.time') || 'Time'}</Label>
              <Input
                id="edit-time"
                type="time"
                value={getTimeFromDate(formData.date)}
                onChange={(e) => handleInputChange("time", e.target.value)}
              />
            </div>
            
            {/* Link Input */}
            <div className="space-y-2">
              <Label htmlFor="edit-link">{t('sessions.link')}</Label>
              <Input
                id="edit-link"
                type="url"
                placeholder={t('sessions.linkPlaceholder')}
                value={formData.link}
                onChange={(e) => handleInputChange("link", e.target.value)}
              />
            </div>
            
            {/* Decision Input */}
            <div className="space-y-2">
              <Label htmlFor="edit-decision">{t('sessions.decision') || 'القرار'}</Label>
              <Input
                id="edit-decision"
                type="text"
                placeholder={t('sessions.decisionPlaceholder') || 'أدخل القرار'}
                value={formData.decision}
                onChange={(e) => handleInputChange("decision", e.target.value)}
              />
            </div>
            
            {/* Expert Session Checkbox */}
            <div className="flex items-center space-x-2 space-x-reverse">
              <Checkbox
                id="edit-isExpertSession"
                checked={formData.isExpertSession}
                onCheckedChange={(checked) => handleInputChange("isExpertSession", checked)}
              />
              <Label htmlFor="edit-isExpertSession" className="cursor-pointer">
                {t('sessions.expertSession')}
              </Label>
            </div>

            {/* Has Ruling Switch */}
            <div className="flex items-center justify-between space-x-2 space-x-reverse p-3 border rounded-lg">
              <Label htmlFor="edit-hasRuling" className="cursor-pointer">
                {t('sessions.hasRuling')}
              </Label>
              <Switch
                id="edit-hasRuling"
                checked={formData.hasRuling}
                onCheckedChange={(checked) => handleInputChange("hasRuling", checked)}
              />
            </div>

            {/* Ruling Input - Shows when hasRuling is true */}
            {formData.hasRuling && (
              <>
                <div className="space-y-2 bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <Label htmlFor="edit-ruling">{t('sessions.ruling')}</Label>
                  <Textarea
                    id="edit-ruling"
                    placeholder={t('sessions.rulingPlaceholder')}
                    value={formData.ruling}
                    onChange={(e) => handleInputChange("ruling", e.target.value)}
                    rows={3}
                    className="resize-none"
                  />
                </div>

                {/* Ruling Date */}
                <div className="space-y-2">
                  <Label htmlFor="edit-rulingDate">{t('sessions.rulingDate')}</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button type="button"
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !formData.rulingDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {formData.rulingDate ? (
                          format(new Date(formData.rulingDate), "PPP", { locale: ar })
                        ) : (
                          <span>{t('sessions.selectRulingDate')}</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 z-[9999]" align="start">
                      <Calendar
                        mode="single"
                        selected={formData.rulingDate ? new Date(formData.rulingDate) : null}
                        onSelect={(date) => handleInputChange("rulingDate", date ? format(date, 'yyyy-MM-dd') : "")}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                {/* Legal Period Selection */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label htmlFor="edit-legalPeriod">{t('sessions.legalPeriod')}</Label>
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="sm"
                      onClick={handleAddLegalPeriod}
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      {t('sessions.addNewPeriod')}
                    </Button>
                  </div>
                  <Select 
                    value={formData.legalPeriodId?.toString()} 
                    onValueChange={(value) => handleInputChange("legalPeriodId", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={t('sessions.selectLegalPeriod')} />
                    </SelectTrigger>
                    <SelectContent>
                      {legalPeriods.map((period) => (
                        <SelectItem key={period.id} value={period.id.toString()}>
                          <div className="flex flex-col">
                            <span className="font-medium">{period.name}</span>
                            <span className="text-xs text-muted-foreground">
                              {period.objection_days && `${t('sessions.objectionLabel')}: ${period.objection_days} ${t('sessions.daysLabel')}`}
                              {period.objection_days && (period.appeal_days || period.cassation_days) && ' - '}
                              {period.appeal_days && `${t('sessions.appealLabel')}: ${period.appeal_days} ${t('sessions.daysLabel')}`}
                              {period.appeal_days && period.cassation_days && ' - '}
                              {period.cassation_days && `${t('sessions.cassationLabel')}: ${period.cassation_days} ${t('sessions.daysLabel')}`}
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  
                  {/* Show selected period details */}
                  {selectedPeriod && (
                    <div className="text-sm text-muted-foreground bg-gray-50 p-2 rounded border">
                      {selectedPeriod.objection_days && (
                        <div>{t('sessions.objectionLabel')}: {selectedPeriod.objection_days} {t('sessions.daysLabel')}</div>
                      )}
                      {selectedPeriod.appeal_days && (
                        <div>{t('sessions.appealLabel')}: {selectedPeriod.appeal_days} {t('sessions.daysLabel')}</div>
                      )}
                      {selectedPeriod.cassation_days && (
                        <div>{t('sessions.cassationLabel')}: {selectedPeriod.cassation_days} {t('sessions.daysLabel')}</div>
                      )}
                    </div>
                  )}
                </div>
              </>
            )}
            
            {/* File Upload Section */}
            <div className="space-y-3">
              <Label htmlFor="editSessionsFileUpload" className="text-sm font-medium">
                {t('sessions.attachFiles')}
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
                  id="editSessionsFileUpload"
                  type="file"
                  multiple
                  onChange={handleFileChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png"
                />
                <div className={cn(
                  "flex items-center justify-center w-full h-20 sm:h-24 border-2 border-dashed rounded-lg transition-colors cursor-pointer",
                  isDragOver 
                    ? "border-blue-500 bg-blue-50" 
                    : "border-gray-300 bg-gray-50 hover:bg-gray-100"
                )}>
                  <div className="flex flex-col items-center space-y-1 sm:space-y-2 text-gray-500 px-2">
                    <Plus className="w-5 h-5 sm:w-6 sm:h-6" />
                    <div className="text-xs sm:text-sm text-center">
                      <span className="font-medium">
                        {isDragOver ? t('sessions.dropFiles') : t('sessions.clickToAddFiles')}
                      </span>
                      <br />
                      <span className="text-xs hidden sm:inline">{t('sessions.supportedFormats')}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Display Selected Files */}
              {formData.files.length > 0 && (
                <div className="space-y-2 max-h-32 sm:max-h-40 overflow-y-auto">
                  <div className="text-sm font-medium text-gray-700">
                    {t('sessions.selectedFiles')} ({formData.files.length})
                  </div>
                  {formData.files.map((file, index) => (
                    <div key={index} className="flex items-center justify-between p-2 sm:p-3 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors">
                      <div className="flex items-center space-x-2 sm:space-x-3 space-x-reverse flex-1 min-w-0">
                        <div className="text-blue-600 flex-shrink-0">
                          {getFileIcon(file.name)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-xs sm:text-sm font-medium text-blue-800 truncate">
                            {file.name}
                          </div>
                          <div className="text-xs text-blue-600">
                            {formatFileSize(file.size)}
                          </div>
                        </div>
                      </div>
                      <Button type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFile(index)}
                        className="h-7 w-7 sm:h-8 sm:w-8 p-0 text-blue-600 hover:text-red-600 hover:bg-red-50 flex-shrink-0"
                      >
                        <Minus className="w-3 h-3 sm:w-4 sm:h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Footer with buttons */}
        <div className="flex justify-end space-x-2 space-x-reverse pt-4 border-t flex-shrink-0">
          <Button type="button" variant="outline" onClick={handleCancel}>
            {t('sessions.cancel')}
          </Button>
          <Button type="button" onClick={handleSubmit} disabled={!formData.date }>
            {t('sessions.update')}
          </Button>
        </div>
      </DialogContent>
    </Dialog>

    <AddLegalPeriodModal
      open={isAddLegalPeriodOpen}
      onOpenChange={setIsAddLegalPeriodOpen}
      onSuccess={handleLegalPeriodAdded}
    />
  </>
  )
}

export default EditSessionModal
