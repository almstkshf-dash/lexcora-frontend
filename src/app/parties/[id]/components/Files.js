'use client'
import React, { useState, useCallback } from 'react'
import useSWR from 'swr'
import { getDocumentsByPartyId, deletePartyDocument, uploadPartyDocuments } from '@/app/services/api/partiesDocuments'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
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
import { FileText, Download, Trash2, Upload, X, Image as ImageIcon, File, Loader2, Plus, Eye } from 'lucide-react'
import { toast } from 'react-toastify'
import { cn } from '@/lib/utils'
import { useTranslations } from '@/hooks/useTranslations'

function Files({ partyId }) {
  const { t } = useTranslations()
  const [selectedFiles, setSelectedFiles] = useState([])
  const [isDragOver, setIsDragOver] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [documentToDelete, setDocumentToDelete] = useState(null)
  const [deletingDocId, setDeletingDocId] = useState(null)
  
  const { data, error, isLoading, mutate } = useSWR(
    partyId ? [`/parties-documents/party/${partyId}`] : null,
    () => getDocumentsByPartyId(partyId),
    {
      revalidateOnFocus: false,
    }
  )

  const handleFileSelect = useCallback((files) => {
    const filesArray = Array.from(files)
    setSelectedFiles(prev => [...prev, ...filesArray])
  }, [])

  const handleDragOver = useCallback((e) => {
    e.preventDefault()
    setIsDragOver(true)
  }, [])

  const handleDragLeave = useCallback((e) => {
    e.preventDefault()
    setIsDragOver(false)
  }, [])

  const handleDrop = useCallback((e) => {
    e.preventDefault()
    setIsDragOver(false)
    const droppedFiles = e.dataTransfer.files
    handleFileSelect(droppedFiles)
  }, [handleFileSelect])

  const handleFileInputChange = useCallback((e) => {
    const files = e.target.files
    if (files.length > 0) {
      handleFileSelect(files)
    }
  }, [handleFileSelect])

  const removeFile = useCallback((index) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index))
  }, [])

  const handleUpload = async () => {
    if (selectedFiles.length === 0) {
      toast.error(t('files.noFilesSelected'))
      return
    }

    try {
      setUploading(true)
      const formData = new FormData()
      formData.append('party_id', partyId)
      
      selectedFiles.forEach((file) => {
        formData.append('files', file)
      })

      const response = await uploadPartyDocuments(formData)
      
      // Check if the response indicates success
      if (response && response.success === false) {
        toast.error(response.message || t('files.uploadError'))
        return
      }
      
      toast.success(t('files.uploadSuccess'))
      setSelectedFiles([])
      mutate()
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || t('files.uploadError')
      toast.error(errorMessage)
    } finally {
      setUploading(false)
    }
  }

  const openDeleteDialog = (document) => {
    setDocumentToDelete(document)
    setDeleteDialogOpen(true)
  }

  const handleDelete = async () => {
    if (!documentToDelete) return

    try {
      setDeletingDocId(documentToDelete.id)
      await deletePartyDocument(documentToDelete.id)
      toast.success(t('common.deleteSuccess'))
      setDeleteDialogOpen(false)
      setDocumentToDelete(null)
      mutate()
    } catch (error) {
      toast.error(t('common.deleteError'))
    } finally {
      setDeletingDocId(null)
    }
  }

  const handleDownload = (fileUrl, fileName) => {
    window.open(fileUrl, '_blank')
  }

  const formatDate = (dateString) => {
    if (!dateString) return '-'
    return new Date(dateString).toLocaleDateString('ar-AE', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const getFileIcon = (fileName) => {
    const extension = fileName?.split('.').pop()?.toLowerCase()
    if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(extension)) {
      return <ImageIcon className="h-4 w-4 text-blue-500" />
    }
    if (extension === 'pdf') {
      return <FileText className="h-4 w-4 text-red-500" />
    }
    return <File className="h-4 w-4 text-gray-500" />
  }

  const formatFileSize = (bytes) => {
    if (!bytes) return '-'
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">{t('common.loading')}</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <p className="text-destructive">{t('common.errorLoading')}</p>
        </div>
      </div>
    )
  }

  const documents = data?.success && Array.isArray(data.data) ? data.data : (Array.isArray(data?.data) ? data.data : (Array.isArray(data) ? data : []))

  return (
    <>
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <FileText className="h-4 w-4" />
              {t('partyTabs.documents')}
              <Badge variant="secondary" className="text-xs">{documents.length}</Badge>
            </CardTitle>
            <div className="flex items-center gap-2">
              <input
                id="file-upload-input"
                type="file"
                multiple
                className="hidden"
                onChange={handleFileInputChange}
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
              />
              <Button
                onClick={() => document.getElementById('file-upload-input')?.click()}
                size="sm"
                variant="outline"
              >
                <Plus className="h-4 w-4 mr-1" />
                {t('common.add')}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          {/* Selected Files for Upload */}
          {selectedFiles.length > 0 && (
            <div className="mb-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-medium text-blue-900">
                  {selectedFiles.length} {t('files.filesSelected')}
                </p>
                <Button 
                  onClick={handleUpload}
                  disabled={uploading}
                  size="sm"
                  className="h-7"
                >
                  {uploading ? (
                    <>
                      <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                      {t('files.uploading')}
                    </>
                  ) : (
                    <>
                      <Upload className="h-3 w-3 mr-1" />
                      {t('files.upload')}
                    </>
                  )}
                </Button>
              </div>
              <div className="space-y-1">
                {selectedFiles.map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-1.5 bg-white rounded text-xs"
                  >
                    <div className="flex items-center gap-1.5 flex-1 min-w-0">
                      {getFileIcon(file.name)}
                      <span className="truncate">{file.name}</span>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-5 w-5 flex-shrink-0"
                      onClick={() => removeFile(index)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Documents List */}
          {documents.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground">
              <File className="h-8 w-8 mx-auto mb-2 opacity-40" />
              <p className="text-xs">{t('files.noDocuments')}</p>
            </div>
          ) : (
            <div className="space-y-2">
              {documents.map((doc) => (
                <div
                  key={doc.id}
                  className="flex items-center justify-between p-2 border rounded-lg hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <div className="w-7 h-7 rounded bg-primary/10 flex items-center justify-center flex-shrink-0">
                      {getFileIcon(doc.file_name)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-xs truncate">{doc.document_name || doc.file_name}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(doc.created_at)}
                        {doc.uploaded_by_name && ` • ${doc.uploaded_by_name}`}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-0.5 flex-shrink-0">
                    {doc.document_url && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                        onClick={() => handleDownload(doc.document_url, doc.document_name)}
                      >
                        <Eye className="h-3.5 w-3.5" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-red-600 hover:text-red-700 hover:bg-red-50"
                      onClick={() => openDeleteDialog(doc)}
                      disabled={deletingDocId === doc.id}
                    >
                      {deletingDocId === doc.id ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Trash2 className="h-3.5 w-3.5" />
                      )}
                    </Button>
                  </div>
                </div>
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
              {t('files.deleteDocument')}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t('files.confirmDeleteDocument')}
              {documentToDelete && (
                <div className="mt-2 p-2 bg-gray-50 rounded">
                  <div className="flex items-center gap-2">
                    {getFileIcon(documentToDelete.document_name)}
                    <span className="text-sm font-medium text-gray-900 truncate">
                      {documentToDelete.document_name || documentToDelete.file_name}
                    </span>
                  </div>
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deletingDocId !== null}>
              {t('common.cancel')}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deletingDocId !== null}
              className="bg-red-600 hover:bg-red-700"
            >
              {deletingDocId !== null ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {t('common.deleting')}
                </>
              ) : (
                t('common.delete')
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

export default Files
