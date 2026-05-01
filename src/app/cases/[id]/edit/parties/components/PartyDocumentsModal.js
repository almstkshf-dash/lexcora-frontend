import React, { useState } from 'react'
import useSWR from 'swr'
import { getCasePartyDocuments, deleteCasePartyDocument, addCasePartyDocument } from '@/app/services/api/parties'
import { useLanguage } from '@/contexts/LanguageContext'
import { useTranslations } from '@/hooks/useTranslations'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
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
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  FileText, 
  Download, 
  Trash2, 
  Loader2,
  AlertCircle,
  Eye,
  ExternalLink,
  Upload,
  X
} from 'lucide-react'
import { toast } from 'react-toastify'
import Link from 'next/link';

function PartyDocumentsModal({ children, caseId, partyId, partyName }) {
  const { language } = useLanguage()
  const { t } = useTranslations()
  const [open, setOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [documentToDelete, setDocumentToDelete] = useState(null)
  const [isDeleting, setIsDeleting] = useState(false)
  
  // File upload states
  const [selectedFiles, setSelectedFiles] = useState([])
  const [isUploading, setIsUploading] = useState(false)
  const [uploadError, setUploadError] = useState(null)

  // Fetch documents using SWR
  const { 
    data: documentsResponse, 
    error, 
    isLoading, 
    mutate 
  } = useSWR(
    open && caseId && partyId ? `case-party-documents-${caseId}-${partyId}` : null,
    () => getCasePartyDocuments(caseId, partyId)
  )

  const documents = documentsResponse?.data || []

  // Handle document deletion
  const handleDeleteDocument = async (document) => {
    setDocumentToDelete(document)
    setDeleteDialogOpen(true)
  }

  const confirmDeleteDocument = async () => {
    if (!documentToDelete) return

    setIsDeleting(true)
    try {
      await deleteCasePartyDocument(caseId, partyId, documentToDelete.id)
      
      // Optimistically update the cache
      mutate()
      
      toast.success(
        t('documents.deleteSuccess') || 'Document deleted successfully'
      )
      setDeleteDialogOpen(false)
      setDocumentToDelete(null)
    } catch (error) {
      toast.error(
        t('documents.deleteError') || 'Failed to delete document'
      )
    } finally {
      setIsDeleting(false)
    }
  }

  // Format file size
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  // Get file type icon
  const getFileIcon = (fileName) => {
    const extension = fileName?.split('.').pop()?.toLowerCase()
    return <FileText className="h-8 w-8 text-blue-500" />
  }

  // Handle file download/view
  const handleViewDocument = (document) => {
    if (document.file_url) {
      window.open(document.file_url, '_blank')
    }
  }

  // Handle file selection
  const handleFileSelect = (event) => {
    const files = Array.from(event.target.files)
    
    // Validate file sizes (10MB limit per file)
    const maxFileSize = 10 * 1024 * 1024; // 10MB
    const oversizedFiles = files.filter(file => file.size > maxFileSize);
    
    if (oversizedFiles.length > 0) {
      const fileNames = oversizedFiles.map(f => f.name).join(', ');
      setUploadError(`Files exceed 10MB limit: ${fileNames}`);
      toast.error('Some files are too large. Maximum file size is 10MB.');
      return;
    }
    
    setSelectedFiles(prev => [...prev, ...files])
    setUploadError(null)
  }

  // Handle file removal
  const removeFile = (index) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index))
  }

  // Handle file upload
  const handleUploadFiles = async () => {
    if (selectedFiles.length === 0) return

    setIsUploading(true)
    setUploadError(null)

    try {
      const documentData = {
        files: selectedFiles
      }

      await addCasePartyDocument(caseId, partyId, documentData)
      
      // Clear selected files and refresh documents
      setSelectedFiles([])
      mutate()
      
      toast.success(
        t('documents.uploadSuccess') || 'Documents uploaded successfully'
      )
    } catch (error) {
      console.error('Upload error:', error);
      
      // Provide more specific error messages
      let errorMessage = error.message || 'Failed to upload documents';
      
      if (error.message?.includes('timeout') || error.message?.includes('timed out')) {
        errorMessage = 'Upload timed out. Please try uploading fewer or smaller files.';
      } else if (error.message?.includes('Network Error')) {
        errorMessage = 'Network error. Please check your connection and try again.';
      } else if (error.message?.includes('10MB')) {
        errorMessage = error.message;
      }
      
      setUploadError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          {children}
        </DialogTrigger>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              {t('documents.title') || 'Party Documents'}
            </DialogTitle>
            <DialogDescription>
              {t('documents.description') || 'Documents for'} {partyName}
            </DialogDescription>
          </DialogHeader>

          {/* File Upload Section */}
          <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 mb-6">
            <div className="flex flex-col items-center gap-4">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Upload className="h-6 w-6" />
                <span className="font-medium">
                  {t('documents.addNew') || 'Add New Documents'}
                </span>
              </div>
              
              <div className="flex gap-2">
                <input
                  type="file"
                  id="document-upload"
                  multiple
                  onChange={handleFileSelect}
                  className="hidden"
                  accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png"
                />
                <Button
                  variant="outline"
                  onClick={() => document.getElementById('document-upload').click()}
                  disabled={isUploading}
                >
                  {t('documents.selectFiles') || 'Select Files'}
                </Button>
                
                {selectedFiles.length > 0 && (
                  <Button
                    onClick={handleUploadFiles}
                    disabled={isUploading}
                    className="bg-primary text-primary-foreground"
                  >
                    {isUploading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        {t('documents.uploading') || 'Uploading...'}
                      </>
                    ) : (
                      <>
                        <Upload className="h-4 w-4 mr-2" />
                        {t('documents.upload') || `Upload ${selectedFiles.length} file(s)`}
                      </>
                    )}
                  </Button>
                )}
              </div>

              {/* Selected Files Preview */}
              {selectedFiles.length > 0 && (
                <div className="w-full">
                  <div className="text-sm font-medium mb-2">
                    {t('documents.selectedFiles') || 'Selected Files:'}
                  </div>
                  <div className="space-y-2">
                    {selectedFiles.map((file, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-muted rounded-md">
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-blue-500" />
                          <span className="text-sm truncate">{file.name}</span>
                          <span className="text-xs text-muted-foreground">
                            ({formatFileSize(file.size)})
                          </span>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0 hover:bg-destructive hover:text-destructive-foreground"
                          onClick={() => removeFile(index)}
                          disabled={isUploading}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Upload Error */}
              {uploadError && (
                <div className="w-full p-2 bg-destructive/10 border border-destructive/20 rounded-md">
                  <div className="flex items-center gap-2 text-destructive">
                    <AlertCircle className="h-4 w-4" />
                    <span className="text-sm">{uploadError}</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="mt-4">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                <span className="ml-2 text-muted-foreground">
                  {t('documents.loading') || 'Loading documents...'}
                </span>
              </div>
            ) : error ? (
              <div className="flex items-center justify-center py-8 text-destructive">
                <AlertCircle className="h-8 w-8 mr-2" />
                <span>{t('documents.loadingError') || 'Error loading documents'}</span>
              </div>
            ) : documents.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                <FileText className="h-16 w-16 mb-4 opacity-50" />
                <div className="text-lg font-medium mb-2">
                  {t('documents.noDocuments') || 'No documents found'}
                </div>
                <div className="text-sm">
                  {t('documents.noDocumentsDescription') || 'This party has no documents attached.'}
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {documents.map((document) => (
                  <div key={document.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      {getFileIcon(document.document_name)}
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm truncate" title={document.document_name}>
                          {document.document_name || document.original_name}
                        </div>
                        {document.file_size && (
                          <div className="text-xs text-muted-foreground">
                            {formatFileSize(document.file_size)}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        asChild
                      >
                        <Link
                          href={document.document_url || '#'}
                          download={document.original_name || document.document_name}
                          className="flex items-center"
                        >
                          <Download className="h-4 w-4 mr-1" />
                          {t('documents.download') || 'Download'}
                        </Link>
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={() => handleDeleteDocument(document)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {t('documents.confirmDelete') || 'Delete Document'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t('documents.confirmDeleteDescription') || 'Are you sure you want to delete this document? This action cannot be undone.'}
              {documentToDelete && (
                <div className="mt-2 p-2 bg-muted rounded text-sm">
                  <strong>{documentToDelete.document_name || documentToDelete.original_name}</strong>
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>
              {t('common.cancel') || 'Cancel'}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteDocument}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {t('documents.deleting') || 'Deleting...'}
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4 mr-2" />
                  {t('documents.delete') || 'Delete'}
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

export default PartyDocumentsModal
