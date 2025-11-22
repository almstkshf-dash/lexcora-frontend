"use client"

import { useState } from "react"
import { useTranslations } from "@/hooks/useTranslations"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon, Upload, X } from "lucide-react"
import { format } from "date-fns"
import { ar } from "date-fns/locale"
import { cn } from "@/lib/utils"
import RichTextEditor from "@/components/RichTextEditor"
import { chatWithLegalAssistant } from "@/app/services/api/legalAssistant"
import { uploadFiles } from "@/../utils/fileUpload"

const MEMO_STATUSES = [
  { value: "Draft", label_key: "memos.statusDraft" },
  { value: "Approved", label_key: "memos.statusApproved" },
  { value: "Pending Approval", label_key: "memos.statusPendingApproval" },
  { value: "Submitted to Court", label_key: "memos.statusSubmittedToCourt" },
  { value: "Rejected", label_key: "memos.statusRejected" }
]

export default function AddMemoModal({ isOpen, onClose, onAdd }) {
  const { t } = useTranslations()
  const [formData, setFormData] = useState({
    title: "",
    submission_date: null,
    description: "",
    status: "",
    admin_note: "",
    files: []
  })
  const [isDrafting, setIsDrafting] = useState(false)
  const [draftError, setDraftError] = useState(null)

  const handleSubmit = (e) => {
    e.preventDefault()
    
    // Validate required fields
    if (!formData.title || !formData.submission_date || !formData.status) {
      alert(t('memos.fillAllRequired'))
      return
    }

    // Format date to YYYY-MM-DD for MySQL
    const formattedData = {
      ...formData,
      submission_date: formData.submission_date 
        ? format(formData.submission_date, 'yyyy-MM-dd')
        : null
    }

    onAdd(formattedData)
    handleClose()
  }

  const handleClose = () => {
    setFormData({
      title: "",
      submission_date: null,
      description: "",
      status: "",
      admin_note: "",
      files: []
    })
    onClose()
  }

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files)
    setFormData(prev => ({
      ...prev,
      files: [...prev.files, ...selectedFiles]
    }))
  }

  const handleRemoveFile = (indexToRemove) => {
    setFormData(prev => ({
      ...prev,
      files: prev.files.filter((_, index) => index !== indexToRemove)
    }))
  }

  const handleDraftWithAI = async () => {
    if (isDrafting) return
    setDraftError(null)
    setIsDrafting(true)
    try {
      const uploaded = formData.files?.length ? await uploadFiles(formData.files, 'memos') : []
      const prompt = `
Draft a concise legal memo with the following context.
Title: ${formData.title || 'N/A'}
Status: ${formData.status || 'N/A'}
Admin note: ${formData.admin_note || 'N/A'}
Submission date: ${formData.submission_date || 'N/A'}.
Return the memo body only in clear paragraphs.`
      const resp = await chatWithLegalAssistant({
        message: prompt,
        attachments: uploaded,
      })
      if (resp?.answer) {
        setFormData(prev => ({ ...prev, description: resp.answer }))
      }
    } catch (err) {
      setDraftError(err?.message || 'Failed to draft with AI')
    } finally {
      setIsDrafting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t('memos.addNewMemo')}</DialogTitle>
          <DialogDescription>
            {t('memos.enterMemoDetails')}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title">
                {t('memos.memoTitle')} <span className="text-red-500">*</span>
              </Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder={t('memos.titlePlaceholder')}
                required
              />
            </div>

            {/* Submission Date */}
            <div className="space-y-2">
              <Label>
                {t('memos.submissionDate')} <span className="text-red-500">*</span>
              </Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !formData.submission_date && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.submission_date ? (
                      format(formData.submission_date, "PPP", { locale: ar })
                    ) : (
                      <span>{t('memos.selectDate')}</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={formData.submission_date}
                    onSelect={(date) => setFormData(prev => ({ ...prev, submission_date: date }))}
                    initialFocus
                    locale={ar}
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Status */}
            <div className="space-y-2">
              <Label>
                {t('memos.status')} <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.status}
                onValueChange={(value) => setFormData(prev => ({ ...prev, status: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t('memos.selectStatus')} />
                </SelectTrigger>
                <SelectContent>
                  {MEMO_STATUSES.map((status) => (
                    <SelectItem key={status.value} value={status.value}>
                      {t(status.label_key)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">{t('memos.description')}</Label>
              <div className="flex justify-end">
                <Button type="button" variant="outline" size="sm" onClick={handleDraftWithAI} disabled={isDrafting}>
                  {isDrafting ? (t('common.loading') || 'Loading...') : 'Draft with AI'}
                </Button>
              </div>
              {draftError && <p className="text-xs text-destructive">{draftError}</p>}
              <RichTextEditor
                value={formData.description}
                onChange={(html) => setFormData(prev => ({ ...prev, description: html }))}
                placeholder={t('memos.descriptionPlaceholder')}
              />
            </div>

            {/* Admin Note */}
            <div className="space-y-2">
              <Label htmlFor="admin_note">{t('memos.adminNote')}</Label>
              <Textarea
                id="admin_note"
                value={formData.admin_note}
                onChange={(e) => setFormData(prev => ({ ...prev, admin_note: e.target.value }))}
                placeholder={t('memos.adminNotePlaceholder')}
                rows={3}
              />
            </div>

            {/* File Upload */}
            <div className="space-y-2">
              <Label>{t('memos.attachments')}</Label>
              <div className="border-2 border-dashed rounded-lg p-4">
                <div className="flex flex-col items-center justify-center space-y-2">
                  <Upload className="h-8 w-8 text-muted-foreground" />
                  <Label htmlFor="file-upload" className="cursor-pointer text-sm text-blue-600 hover:text-blue-700">
                    {t('memos.clickToUpload')}
                  </Label>
                  <Input
                    id="file-upload"
                    type="file"
                    multiple
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <p className="text-xs text-muted-foreground">
                    {t('memos.supportedFormats')}
                  </p>
                </div>

                {/* Display selected files */}
                {formData.files.length > 0 && (
                  <div className="mt-4 space-y-2">
                    <Label className="text-sm font-medium">{t('memos.selectedFiles')}:</Label>
                    <div className="space-y-2">
                      {formData.files.map((file, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-2 bg-muted rounded-md"
                        >
                          <span className="text-sm truncate flex-1">{file.name}</span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveFile(index)}
                            className="h-8 w-8 p-0"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>
              {t('memos.cancel')}
            </Button>
            <Button onClick={handleSubmit} type="button">
              {t('memos.saveMemo')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
