"use client"

import React, { useState, useEffect } from 'react'
import { format } from 'date-fns'
import { useTranslations } from "@/hooks/useTranslations"
import { useLanguage } from "@/contexts/LanguageContext"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { FileText, Download, Trash2, Loader2 } from 'lucide-react'
import { toast } from 'react-toastify'
import { deleteAssetDocument, getDepreciationPreview } from '@/app/services/api/assets'
import DepreciationSchedule from './DepreciationSchedule'

const ViewAssetModal = ({ 
  isOpen, 
  onClose, 
  asset,
  onDocumentDeleted
}) => {
  const { t } = useTranslations()
  const { language } = useLanguage()
  const isArabic = language === 'ar'

  const [deletingDocId, setDeletingDocId] = useState(null)
  const [isPreviewLoading, setIsPreviewLoading] = useState(false)
  const [previewSchedule, setPreviewSchedule] = useState(null)
  const [previewError, setPreviewError] = useState('')

  if (!asset) return null

  const handleDeleteDocument = async (documentId) => {
    if (!window.confirm(isArabic ? 'هل أنت متأكد من حذف هذا المستند؟' : 'Are you sure you want to delete this document?')) {
      return
    }

    setDeletingDocId(documentId)

    try {
      const response = await deleteAssetDocument(asset.id, documentId)
      if (response.success) {
        toast.success(isArabic ? 'تم حذف المستند بنجاح' : 'Document deleted successfully')
        if (onDocumentDeleted) {
          onDocumentDeleted()
        }
      } else {
        toast.error(response.message || (isArabic ? 'حدث خطأ' : 'An error occurred'))
      }
    } catch (error) {

      toast.error(isArabic ? 'حدث خطأ أثناء حذف المستند' : 'Error deleting document')
    } finally {
      setDeletingDocId(null)
    }
  }

  const loadDepreciationPreview = async () => {
    if (!asset.purchase_cost || Number(asset.purchase_cost) <= 0) {
      setPreviewError(isArabic ? 'لا يمكن إنشاء معاينة بدون تكلفة شراء صحيحة' : 'Cannot create preview without valid purchase cost')
      setPreviewSchedule(null)
      return
    }

    setIsPreviewLoading(true)
    setPreviewError('')
    setPreviewSchedule(null)

    try {
      const response = await getDepreciationPreview({
        purchase_cost: Number(asset.purchase_cost),
        salvage_value: Number(asset.salvage_value) || 0,
        depreciation_rate: Number(asset.depreciation_rate) || 0,
        useful_life: Number(asset.useful_life) || 0,
        depreciation_method: asset.depreciation_method || 'straight_line',
        purchase_date: asset.purchase_date || null
      })

      if (response.success) {
        setPreviewSchedule(response.data.schedule)
      } else {
        setPreviewError(response.message || (isArabic ? 'حدث خطأ أثناء تحميل المعاينة' : 'Unable to load preview'))
      }
    } catch (error) {
      setPreviewError(isArabic ? 'حدث خطأ أثناء تحميل المعاينة' : 'Unable to load preview')
    } finally {
      setIsPreviewLoading(false)
    }
  }

  React.useEffect(() => {
    if (isOpen && asset) {
      loadDepreciationPreview()
    }
  }, [isOpen, asset])

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isArabic ? 'تفاصيل الأصل' : 'Asset Details'}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">
                {isArabic ? 'اسم الأصل' : 'Asset Name'}
              </p>
              <p className="text-base font-semibold">{asset.name}</p>
            </div>

            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">
                {isArabic ? 'النوع' : 'Type'}
              </p>
              <Badge variant="secondary">{asset.type}</Badge>
            </div>

            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">
                {isArabic ? 'الفرع' : 'Branch'}
              </p>
              <p className="text-base">{asset.branch_name || '-'}</p>
            </div>

            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">
                {isArabic ? 'أنشئ بواسطة' : 'Created By'}
              </p>
              <p className="text-base">{asset.created_by_name || '-'}</p>
            </div>

            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">
                {isArabic ? 'الفئة' : 'Category'}
              </p>
              <p className="text-base">{asset.category || '-'}</p>
            </div>

            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">
                {isArabic ? 'المسؤول' : 'Custodian'}
              </p>
              <p className="text-base">{asset.custodian_name || '-'}</p>
            </div>

            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">
                {isArabic ? 'الرقم التسلسلي' : 'Serial Number'}
              </p>
              <p className="text-base">{asset.serial_number || '-'}</p>
            </div>

            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">
                {isArabic ? 'الموقع الفعلي' : 'Physical Location'}
              </p>
              <p className="text-base">{asset.physical_location || '-'}</p>
            </div>
          </div>

          <Separator />

          {/* Dates */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">
                {isArabic ? 'تاريخ الإصدار' : 'Issue Date'}
              </p>
              <p className="text-base">
                {asset.issue_date 
                  ? format(new Date(asset.issue_date), 'yyyy-MM-dd')
                  : '-'
                }
              </p>
            </div>

            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">
                {isArabic ? 'تاريخ الانتهاء' : 'Expiry Date'}
              </p>
              <p className="text-base">
                {asset.expiry_date 
                  ? format(new Date(asset.expiry_date), 'yyyy-MM-dd')
                  : '-'
                }
              </p>
            </div>

            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">
                {isArabic ? 'تاريخ الإنشاء' : 'Created At'}
              </p>
              <p className="text-base">
                {asset.created_at 
                  ? format(new Date(asset.created_at), 'yyyy-MM-dd HH:mm')
                  : '-'
                }
              </p>
            </div>
          </div>

          <Separator />

          {/* Financial Information */}
          <div>
            <h3 className="text-lg font-semibold mb-4">{isArabic ? 'المعلومات المالية' : 'Financial Information'}</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">
                  {isArabic ? 'تكلفة الشراء' : 'Purchase Cost'}
                </p>
                <p className="text-base font-semibold">
                  {asset.purchase_cost ? Number(asset.purchase_cost).toLocaleString(undefined, { minimumFractionDigits: 2 }) : '0.00'}
                </p>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">
                  {isArabic ? 'تاريخ الشراء' : 'Purchase Date'}
                </p>
                <p className="text-base">
                  {asset.purchase_date 
                    ? format(new Date(asset.purchase_date), 'yyyy-MM-dd')
                    : '-'
                  }
                </p>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">
                  {isArabic ? 'الحساب المرتبط' : 'Linked Account'}
                </p>
                <p className="text-base">
                  {asset.account_code ? `${asset.account_code} - ${isArabic ? asset.account_name_ar : asset.account_name_en}` : '-'}
                </p>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">
                  {isArabic ? 'الميزانية' : 'Budget'}
                </p>
                <p className="text-base">
                  {isArabic
                    ? asset.budget_name_ar || asset.budget_name || asset.budget_code
                    : asset.budget_name_en || asset.budget_name || asset.budget_code || '-'}
                </p>
                {asset.budget_fiscal_year && (
                  <p className="text-xs text-gray-500">
                    {asset.budget_fiscal_year}{asset.budget_fiscal_month ? `/${asset.budget_fiscal_month}` : ''}
                  </p>
                )}
              </div>

                  <div>
                <p className="text-sm font-medium text-gray-500 mb-1">
                  {isArabic ? 'نسبة الإهلاك' : 'Depreciation Rate'}
                </p>
                <p className="text-base">{asset.depreciation_rate || 0}%</p>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">
                  {isArabic ? 'طريقة الإهلاك' : 'Depreciation Method'}
                </p>
                <p className="text-base">{asset.depreciation_method ? asset.depreciation_method.replace('_', ' ') : '-'}</p>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">
                  {isArabic ? 'العمر الافتراضي (سنوات)' : 'Useful Life (years)'}
                </p>
                <p className="text-base">{asset.useful_life || '-'}</p>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">
                  {isArabic ? 'القيمة المتبقية' : 'Salvage Value'}
                </p>
                <p className="text-base">
                  {asset.salvage_value ? Number(asset.salvage_value).toLocaleString(undefined, { minimumFractionDigits: 2 }) : '0.00'}
                </p>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">
                  {isArabic ? 'القيمة الحالية' : 'Current Value'}
                </p>
                <p className="text-base font-semibold text-green-600">
                  {asset.current_value ? Number(asset.current_value).toLocaleString(undefined, { minimumFractionDigits: 2 }) : '0.00'}
                </p>
              </div>
            </div>
          </div>

          <Separator />

          <div>
            <h3 className="text-lg font-semibold mb-4">{isArabic ? 'جدول الإهلاك' : 'Depreciation Schedule'}</h3>
            {isPreviewLoading && (
              <div className="text-sm text-gray-500">{isArabic ? 'جارٍ تحميل المعاينة...' : 'Loading preview...'}</div>
            )}
            {previewError && (
              <div className="text-sm text-red-500">{previewError}</div>
            )}
            {previewSchedule && previewSchedule.length > 0 ? (
              <DepreciationSchedule schedule={previewSchedule} />
            ) : !isPreviewLoading && !previewError ? (
              <div className="text-sm text-gray-500">{isArabic ? 'لا توجد بيانات جدول الإهلاك لعرضها.' : 'No depreciation schedule data to display.'}</div>
            ) : null}
          </div>

          {/* Notes */}
          {asset.note && (
            <>
              <Separator />
              <div>
                <p className="text-sm font-medium text-gray-500 mb-2">
                  {isArabic ? 'ملاحظات' : 'Notes'}
                </p>
                <p className="text-base whitespace-pre-wrap bg-gray-50 p-3 rounded">
                  {asset.note}
                </p>
              </div>
            </>
          )}

          {/* Documents */}
          {asset.documents && asset.documents.length > 0 && (
            <>
              <Separator />
              <div>
                <p className="text-sm font-medium text-gray-500 mb-3">
                  {isArabic ? 'المستندات' : 'Documents'} ({asset.documents.length})
                </p>
                <div className="space-y-2">
                  {asset.documents.map((doc) => (
                    <div 
                      key={doc.id} 
                      className="flex items-center justify-between p-3 border rounded hover:bg-gray-50"
                    >
                      <div className="flex items-center gap-3 flex-1">
                        <FileText className="h-5 w-5 text-gray-500" />
                        <div className="flex-1">
                          <a 
                            href={doc.document_url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-sm font-medium text-blue-600 hover:underline block"
                          >
                            {doc.document_name}
                          </a>
                          <p className="text-xs text-gray-500">
                            {isArabic ? 'أضيف بواسطة' : 'Added by'}: {doc.created_by_name || '-'}
                            {' • '}
                            {doc.created_at 
                              ? format(new Date(doc.created_at), 'yyyy-MM-dd')
                              : ''
                            }
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          asChild
                        >
                          <a 
                            href={doc.document_url} 
                            download
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <Download className="h-4 w-4" />
                          </a>
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDeleteDocument(doc.id)}
                          disabled={deletingDocId === doc.id}
                        >
                          {deletingDocId === doc.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4 text-red-500" />
                          )}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {(!asset.documents || asset.documents.length === 0) && (
            <>
              <Separator />
              <div className="text-center py-8">
                <FileText className="h-12 w-12 text-gray-300 mx-auto mb-2" />
                <p className="text-gray-500">
                  {isArabic ? 'لا توجد مستندات' : 'No documents'}
                </p>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default ViewAssetModal
