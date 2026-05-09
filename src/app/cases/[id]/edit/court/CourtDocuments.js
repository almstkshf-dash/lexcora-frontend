"use client";

import React, { useState } from 'react';
import useSWR from 'swr';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { 
  Trash2, 
  Download, 
  FileText, 
  Calendar,
  AlertTriangle
} from 'lucide-react';
import { useTranslations } from '@/hooks/useTranslations';
import { useLanguage } from '@/contexts/LanguageContext';
import { getCaseCourtDocuments, deleteCaseCourtDocument } from '@/app/services/api/cases';
import { toast } from 'react-toastify';

function CourtDocuments({ caseId }) {
  const { t } = useTranslations();
  const { language } = useLanguage();
  const isArabic = language === 'ar';

  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    documentId: null,
    documentName: ''
  });
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch court documents using SWR
  const { 
    data: documentsResponse, 
    error, 
    isLoading,
    mutate: mutateDocuments
  } = useSWR(
    caseId ? `case-court-documents-${caseId}` : null,
    () => getCaseCourtDocuments(caseId),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      errorRetryCount: 3,
      errorRetryInterval: 1000
    }
  );

  // Extract documents data from API response
  const documents = (documentsResponse?.success && Array.isArray(documentsResponse.data)) ? documentsResponse.data : [];

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    const options = {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    
    return date.toLocaleDateString(isArabic ? 'ar-AE' : 'en-US', options);
  };

  // Handle document deletion
  const handleDeleteDocument = async () => {
    if (!deleteModal.documentId) return;

    setIsDeleting(true);
    try {
      await deleteCaseCourtDocument(caseId, deleteModal.documentId);
      
      // Show success toast
      toast.success(
        isArabic 
          ? 'تم حذف مستند المحكمة بنجاح' 
          : 'Court document deleted successfully'
      );

      // Refresh the documents list
      mutateDocuments();

      // Close the modal
      setDeleteModal({
        isOpen: false,
        documentId: null,
        documentName: ''
      });
    } catch (error) {
      toast.error(
        isArabic 
          ? 'فشل في حذف مستند المحكمة' 
          : 'Failed to delete court document'
      );
    } finally {
      setIsDeleting(false);
    }
  };

  // Open delete confirmation modal
  const openDeleteModal = (documentId, documentName) => {
    setDeleteModal({
      isOpen: true,
      documentId,
      documentName
    });
  };

  // Close delete modal
  const closeDeleteModal = () => {
    setDeleteModal({
      isOpen: false,
      documentId: null,
      documentName: ''
    });
  };

  // Handle document download
  const handleDownloadDocument = (documentUrl, documentName) => {
    if (!documentUrl) return;
    
    // Create a temporary link element and trigger download
    const link = document.createElement('a');
    link.href = documentUrl;
    link.download = documentName || 'court-document';
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-red-500 text-center">
            <AlertTriangle className="w-8 h-8 mx-auto mb-2" />
            <p>{isArabic ? 'خطأ في تحميل مستندات المحكمة' : 'Error loading court documents'}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className={isArabic ? 'text-right' : 'text-left'}>
            {isArabic ? 'مستندات المحكمة' : 'Court Documents'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">
                {isArabic ? 'جار تحميل المستندات...' : 'Loading documents...'}
              </p>
            </div>
          ) : documents.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                {isArabic ? 'لا توجد مستندات للمحكمة' : 'No court documents found'}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {documents.map((document) => (
                <div
                  key={document.id}
                  className="border rounded-lg p-4 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <FileText className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                        <h4 className="font-medium text-sm truncate">
                          {document.document_name}
                        </h4>
                      </div>
                      
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          <span>{formatDate(document.created_at)}</span>
                        </div>
                        
                        {document.uploaded_by && (
                          <Badge variant="secondary" className="text-xs">
                            {isArabic ? 'رُفع بواسطة:' : 'Uploaded by:'} {document.uploaded_by}
                          </Badge>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 ml-4">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => handleDownloadDocument(document.document_url, document.document_name)}
                        className="h-8 px-3"
                        title={isArabic ? 'تحميل المستند' : 'Download document'}
                      >
                        <Download className="w-3 h-3" />
                      </Button>
                      
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => openDeleteModal(document.id, document.document_name)}
                        className="h-8 px-3 text-red-600 hover:text-red-700 hover:bg-red-50"
                        title={isArabic ? 'حذف المستند' : 'Delete document'}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Modal */}
      <Dialog open={deleteModal.isOpen} onOpenChange={closeDeleteModal}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className={isArabic ? 'text-right' : 'text-left'}>
              {isArabic ? 'تأكيد الحذف' : 'Confirm Delete'}
            </DialogTitle>
            <DialogDescription className={isArabic ? 'text-right' : 'text-left'}>
              {isArabic 
                ? `هل أنت متأكد من حذف مستند المحكمة "${deleteModal.documentName}"؟ لا يمكن التراجع عن هذا الإجراء.`
                : `Are you sure you want to delete the court document "${deleteModal.documentName}"? This action cannot be undone.`
              }
            </DialogDescription>
          </DialogHeader>
          
          <DialogFooter className={isArabic ? 'flex-row-reverse' : ''}>
            <Button
              type="button"
              variant="outline"
              onClick={closeDeleteModal}
              disabled={isDeleting}
            >
              {isArabic ? 'إلغاء' : 'Cancel'}
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleDeleteDocument}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  {isArabic ? 'جار الحذف...' : 'Deleting...'}
                </>
              ) : (
                isArabic ? 'حذف' : 'Delete'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default CourtDocuments;