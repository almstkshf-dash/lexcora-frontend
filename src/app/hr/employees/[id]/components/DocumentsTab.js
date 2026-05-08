'use client'
import React, { useState, useRef } from 'react'
import useSWR from 'swr'
import { Button } from '@/components/ui/button'
import { FileText, Upload, Trash2, FileUser, CreditCard, Plane, Shield, FolderOpen, FileSignature, Award, Briefcase, GraduationCap } from 'lucide-react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { 
  getEmployeeDocuments, 
  uploadEmployeeDocument, 
  deleteEmployeeDocument 
} from '@/app/services/api/employees'
import { useTranslations } from '@/hooks/useTranslations'

function DocumentsTab({ employeeId }) {
  const { t } = useTranslations()
  const [uploading, setUploading] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [documentToDelete, setDocumentToDelete] = useState(null)
  const fileInputRefs = useRef({})

  // Fetcher function for SWR
  const fetcher = async (url) => {
    const result = await getEmployeeDocuments(employeeId)
    if (result.success) {
      return result.data
    }
    throw new Error(result.error || 'Failed to fetch documents')
  }

  // Use SWR for data fetching with revalidation
  const { data: documents = [], error, isLoading, mutate } = useSWR(
    employeeId ? `/employees/${employeeId}/documents` : null,
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
    }
  )

  const fileTypes = [
    { value: 'cv', label: t('employees.documents.cv'), icon: FileUser },
    { value: 'id', label: t('employees.documents.id'), icon: CreditCard },
    { value: 'passport', label: t('employees.documents.passport'), icon: Plane },
    { value: 'insurance', label: t('employees.documents.insurance'), icon: Shield },
    { value: 'contract', label: t('employees.documents.contract'), icon: FileSignature },
    { value: 'good_conduct', label: t('employees.documents.goodConduct'), icon: Award },
    { value: 'work_permit', label: t('employees.documents.workPermit'), icon: Briefcase },
    { value: 'education_certificate', label: t('employees.documents.educationCertificate'), icon: GraduationCap },
  ]

  const handleFileSelect = (type) => {
    if (!fileInputRefs.current[type]) {
      fileInputRefs.current[type] = document.createElement('input')
      fileInputRefs.current[type].type = 'file'
      fileInputRefs.current[type].onchange = (e) => handleFileChange(e, type)
    }
    fileInputRefs.current[type].click()
  }

  const handleFileChange = async (event, type) => {
    const file = event.target.files[0]
    if (!file) return

    try {
      setUploading(true)
      
      // Upload using the service that uses uploadFiles utility
      const result = await uploadEmployeeDocument(employeeId, type, file)

      if (result.success) {
        // Revalidate the cache with mutate
        await mutate()
      } else {
        alert(t('employees.documents.uploadFailed') + ': ' + result.error)
      }
    } catch (error) {
      alert(t('employees.documents.uploadError'))
    } finally {
      setUploading(false)
      // Reset file input
      event.target.value = ''
    }
  }

  const openDeleteDialog = (doc) => {
    setDocumentToDelete(doc)
    setDeleteDialogOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (!documentToDelete) return

    try {
      // Optimistic update - remove from cache immediately
      await mutate(
        Array.isArray(documents) ? documents.filter(doc => doc.id !== documentToDelete.id) : [],
        false // Don't revalidate yet
      )

      const result = await deleteEmployeeDocument(documentToDelete.id)

      if (result.success) {
        // Revalidate to confirm the deletion
        await mutate()
        setDeleteDialogOpen(false)
        setDocumentToDelete(null)
      } else {
        // Revert on error
        await mutate()
        alert(t('employees.documents.deleteFailed') + ': ' + result.error)
      }
    } catch (error) {
      // Revert on error
      await mutate()
      alert(t('employees.documents.deleteError'))
    }
  }

  const getDocumentsByType = (type) => {
    return Array.isArray(documents) ? documents.filter(doc => doc.document_type === type) : []
  }

  const getIconComponent = (type) => {
    const fileType = fileTypes.find(ft => ft.value === type)
    return fileType ? fileType.icon : FileText
  }

  if (isLoading) {
    return (
      <div className="p-6 flex justify-center items-center">
        <p className="text-muted-foreground">{t('employees.documents.loadingDocuments')}</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6 flex justify-center items-center">
        <p className="text-destructive">{t('employees.documents.errorLoading')}: {error.message}</p>
      </div>
    )
  }

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">{t('employees.documents.title')}</h2>

      {uploading && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg text-blue-700">
          {t('employees.documents.uploadingDocument')}
        </div>
      )}

      {/* File Type Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {Array.isArray(fileTypes) && fileTypes.map((type) => {
          const Icon = type.icon
          const typeDocs = getDocumentsByType(type.value)
          
          return (
            <div
              key={type.value}
              className="border rounded-lg p-6 hover:shadow-lg transition-shadow cursor-pointer bg-card"
              onClick={() => handleFileSelect(type.value)}
            >
              <div className="flex flex-col items-center gap-3">
                <div className="p-3 bg-primary/10 rounded-full">
                  <Icon className="h-8 w-8 text-primary" />
                </div>
                <h3 className="font-semibold text-lg">{type.label}</h3>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Upload className="h-4 w-4" />
                  <span>{t('employees.documents.clickToUpload')}</span>
                </div>
                {typeDocs.length > 0 && (
                  <div className="mt-2 text-sm font-medium text-green-600">
                    {typeDocs.length} {typeDocs.length > 1 ? t('employees.documents.filesUploadedPlural') : t('employees.documents.filesUploaded')}
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Documents List */}
      {Array.isArray(documents) && documents.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-4">{t('employees.documents.uploadedDocuments')}</h3>
          <div className="grid gap-3">
            {documents.map((doc) => {
              const Icon = getIconComponent(doc.document_type)
              const typeLabel = fileTypes.find(t => t.value === doc.document_type)?.label || t('employees.documents.others')
              
              return (
                <div
                  key={doc.id}
                  className="flex items-center justify-between p-4 border rounded-lg bg-card"
                >
                  <div className="flex items-center gap-3">
                    <Icon className="h-6 w-6 text-primary" />
                    <div>
                      <p className="font-medium">{typeLabel}</p>
                      <div className="flex flex-col gap-0.5">
                        <p className="text-xs text-muted-foreground">
                          {t('employees.documents.uploaded')}: {new Date(doc.created_at).toLocaleDateString()}
                        </p>
                        {doc.uploaded_by_name && (
                          <p className="text-xs text-muted-foreground">
                            {t('employees.documents.uploadedBy')}: {doc.uploaded_by_name}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(doc.document_url, '_blank')}
                    >
                      {t('employees.documents.view')}
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => openDeleteDialog(doc)}
                      className="text-destructive hover:text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Add Other File Button */}
      <div className="flex justify-center pt-4 border-t">
        <Button
          variant="outline"
          size="lg"
          className="gap-2"
          onClick={() => handleFileSelect('others')}
          disabled={uploading}
        >
          <FolderOpen className="h-5 w-5" />
          {t('employees.documents.addOtherFile')}
        </Button>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('employees.documents.confirmDelete')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('employees.documents.confirmDeleteMessage')}
              {documentToDelete && (
                <span className="font-semibold block mt-2">
                  {fileTypes.find(t => t.value === documentToDelete.document_type)?.label || t('employees.documents.others')}
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('employees.documents.cancel')}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {t('employees.documents.delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

export default DocumentsTab