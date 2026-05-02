"use client"

import React, { useState, useEffect } from 'react'
import { format } from 'date-fns'
import useSWR from 'swr'
import { useTranslations } from "@/hooks/useTranslations"
import { useLanguage } from "@/contexts/LanguageContext"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { DatePicker } from "@/components/ui/date-picker"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, Upload, X, FileText } from 'lucide-react'
import { toast } from 'react-toastify'
import { createAsset, updateAsset, deleteAssetDocument } from '@/app/services/api/assets'
import { getBranches } from '@/app/services/api/branches'
import { getAccounts } from '@/app/services/api/accounting'
import { uploadFiles } from '../../../../utils/fileUpload'

const AssetModal = ({ 
  isOpen, 
  onClose, 
  onSuccess,
  asset = null, // If provided, we're editing
  recordType = 'resource' // 'office' or 'resource'
}) => {
  const { t } = useTranslations()
  const { language } = useLanguage()
  const isArabic = language === 'ar'
  const isEditMode = !!asset

  const [isLoading, setIsLoading] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    type: '',
    branch_id: '',
    issue_date: null,
    expiry_date: null,
    note: '',
    purchase_cost: '',
    purchase_date: null,
    account_id: '',
    depreciation_rate: '',
    salvage_value: ''
  })
  const [selectedFiles, setSelectedFiles] = useState([])
  const [existingDocuments, setExistingDocuments] = useState([])

  // Fetch branches
  const branches = branchesData?.data || []
  
  // Fetch accounts
  const { data: accountsData } = useSWR('accounts', () => getAccounts({ type: 'asset' }))
  const accounts = accountsData?.data || []

  // Populate form when editing
  useEffect(() => {
    if (isEditMode && asset) {
      setFormData({
        name: asset.name || '',
        type: asset.type || '',
        branch_id: asset.branch_id || '',
        issue_date: asset.issue_date ? new Date(asset.issue_date) : null,
        expiry_date: asset.expiry_date ? new Date(asset.expiry_date) : null,
        note: asset.note || '',
        purchase_cost: asset.purchase_cost || '',
        purchase_date: asset.purchase_date ? new Date(asset.purchase_date) : null,
        account_id: asset.account_id || '',
        depreciation_rate: asset.depreciation_rate || '',
        salvage_value: asset.salvage_value || ''
      })
      setExistingDocuments(asset.documents || [])
    } else {
      setFormData({
        name: '',
        type: '',
        branch_id: '',
        issue_date: null,
        expiry_date: null,
        note: '',
        purchase_cost: '',
        purchase_date: null,
        account_id: '',
        depreciation_rate: '',
        salvage_value: ''
      })
      setExistingDocuments([])
    }
    setSelectedFiles([])
  }, [asset, isEditMode])

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      setFormData({
        name: '',
        type: '',
        branch_id: '',
        issue_date: null,
        expiry_date: null,
        note: '',
        purchase_cost: '',
        purchase_date: null,
        account_id: '',
        depreciation_rate: '',
        salvage_value: ''
      })
      setSelectedFiles([])
      setExistingDocuments([])
    }
  }, [isOpen])

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files || [])
    if (files.length > 0) {
      setSelectedFiles(prev => [...prev, ...files])
    }
    // Reset input value to allow selecting the same file again
    e.target.value = ''
  }

  const removeSelectedFile = (index) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index))
  }

  const handleDeleteExistingDocument = async (documentId) => {
    if (!window.confirm(isArabic ? 'هل أنت متأكد من حذف هذا المستند؟' : 'Are you sure you want to delete this document?')) {
      return
    }

    try {
      const response = await deleteAssetDocument(asset.id, documentId)
      if (response.success) {
        toast.success(isArabic ? 'تم حذف المستند بنجاح' : 'Document deleted successfully')
        setExistingDocuments(prev => prev.filter(doc => doc.id !== documentId))
      } else {
        toast.error(response.message || (isArabic ? 'حدث خطأ' : 'An error occurred'))
      }
    } catch (error) {

      toast.error(isArabic ? 'حدث خطأ أثناء حذف المستند' : 'Error deleting document')
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    // Validation
    if (!formData.name?.trim()) {
      toast.error(isArabic ? 'يرجى إدخال اسم الأصل' : 'Please enter asset name')
      return
    }

    if (!formData.type?.trim()) {
      toast.error(isArabic ? 'يرجى إدخال نوع الأصل' : 'Please enter asset type')
      return
    }

    if (!formData.branch_id) {
      toast.error(isArabic ? 'يرجى اختيار الفرع' : 'Please select branch')
      return
    }

    setIsLoading(true)

    try {
      let uploadedDocuments = []

      // Upload files if any
      if (selectedFiles.length > 0) {
        setIsUploading(true)
        try {
          uploadedDocuments = await uploadFiles(selectedFiles, 'assets')
        } catch (uploadError) {

          toast.error(isArabic ? 'حدث خطأ أثناء رفع الملفات' : 'Error uploading files')
          setIsLoading(false)
          setIsUploading(false)
          return
        }
        setIsUploading(false)
      }

      // Prepare data
      const assetData = {
        name: formData.name,
        type: formData.type,
        branch_id: formData.branch_id,
        issue_date: formData.issue_date ? format(formData.issue_date, 'yyyy-MM-dd') : null,
        expiry_date: formData.expiry_date ? format(formData.expiry_date, 'yyyy-MM-dd') : null,
        note: formData.note || null,
        purchase_cost: formData.purchase_cost || 0,
        purchase_date: formData.purchase_date ? format(formData.purchase_date, 'yyyy-MM-dd') : null,
        account_id: formData.account_id || null,
        depreciation_rate: formData.depreciation_rate || 0,
        salvage_value: formData.salvage_value || 0,
        documents: uploadedDocuments,
        record_type: recordType
      }

      // Create or update
      const response = isEditMode 
        ? await updateAsset(asset.id, assetData)
        : await createAsset(assetData)

      if (response.success) {
        toast.success(
          isEditMode
            ? (isArabic ? 'تم تحديث الأصل بنجاح' : 'Asset updated successfully')
            : (isArabic ? 'تم إضافة الأصل بنجاح' : 'Asset created successfully')
        )
        onSuccess()
        onClose()
      } else {
        toast.error(response.message || (isArabic ? 'حدث خطأ' : 'An error occurred'))
      }
    } catch (error) {

      toast.error(isArabic ? 'حدث خطأ أثناء الحفظ' : 'Error saving asset')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditMode 
              ? (isArabic ? 'تعديل الأصل' : 'Edit Asset')
              : (isArabic ? 'إضافة أصل جديد' : 'Add New Asset')
            }
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Asset Name */}
          <div className="space-y-2">
            <Label htmlFor="name">{isArabic ? 'اسم الأصل' : 'Asset Name'} *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder={isArabic ? 'أدخل اسم الأصل' : 'Enter asset name'}
              disabled={isLoading}
            />
          </div>

          {/* Asset Type */}
          <div className="space-y-2">
            <Label htmlFor="type">{isArabic ? 'نوع الأصل' : 'Asset Type'} *</Label>
            <Input
              id="type"
              value={formData.type}
              onChange={(e) => handleInputChange('type', e.target.value)}
              placeholder={isArabic ? 'مثال: سيارة، معدات، عقار' : 'e.g., Vehicle, Equipment, Property'}
              disabled={isLoading}
            />
          </div>

          {/* Branch */}
          <div className="space-y-2">
            <Label htmlFor="branch">{isArabic ? 'الفرع' : 'Branch'} *</Label>
            <Select
              value={formData.branch_id?.toString()}
              onValueChange={(value) => handleInputChange('branch_id', parseInt(value))}
              disabled={isLoading}
            >
              <SelectTrigger>
                <SelectValue placeholder={isArabic ? 'اختر الفرع' : 'Select branch'} />
              </SelectTrigger>
              <SelectContent>
                {branches.map((branch) => (
                  <SelectItem key={branch.id} value={branch.id.toString()}>
                    {isArabic ? branch.name_ar : branch.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Issue Date */}
          <div className="space-y-2">
            <Label>{isArabic ? 'تاريخ الإصدار' : 'Issue Date'}</Label>
            <DatePicker
              date={formData.issue_date}
              onDateChange={(date) => handleInputChange('issue_date', date)}
              placeholder={isArabic ? 'اختر التاريخ' : 'Select date'}
              disabled={isLoading}
            />
          </div>

          {/* Expiry Date */}
          <div className="space-y-2">
            <Label>{isArabic ? 'تاريخ الانتهاء' : 'Expiry Date'}</Label>
            <DatePicker
              date={formData.expiry_date}
              onDateChange={(date) => handleInputChange('expiry_date', date)}
              placeholder={isArabic ? 'اختر التاريخ' : 'Select date'}
              disabled={isLoading}
            />
          </div>

          {/* Note */}
          <div className="space-y-2">
            <Label htmlFor="note">{isArabic ? 'ملاحظات' : 'Notes'}</Label>
            <Textarea
              id="note"
              value={formData.note}
              onChange={(e) => handleInputChange('note', e.target.value)}
              placeholder={isArabic ? 'أدخل ملاحظات إضافية' : 'Enter additional notes'}
              rows={3}
              disabled={isLoading}
            />
          </div>

          <div className="border-t pt-4 mt-4">
            <h3 className="text-lg font-semibold mb-4">{isArabic ? 'المعلومات المالية' : 'Financial Information'}</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Purchase Cost */}
              <div className="space-y-2">
                <Label htmlFor="purchase_cost">{isArabic ? 'تكلفة الشراء' : 'Purchase Cost'}</Label>
                <Input
                  id="purchase_cost"
                  type="number"
                  step="0.01"
                  value={formData.purchase_cost}
                  onChange={(e) => handleInputChange('purchase_cost', e.target.value)}
                  placeholder="0.00"
                  disabled={isLoading}
                />
              </div>

              {/* Purchase Date */}
              <div className="space-y-2">
                <Label>{isArabic ? 'تاريخ الشراء' : 'Purchase Date'}</Label>
                <DatePicker
                  date={formData.purchase_date}
                  onDateChange={(date) => handleInputChange('purchase_date', date)}
                  placeholder={isArabic ? 'اختر التاريخ' : 'Select date'}
                  disabled={isLoading}
                />
              </div>

              {/* Account Link (Chart of Accounts) */}
              <div className="space-y-2">
                <Label htmlFor="account_id">{isArabic ? 'الحساب المرتبط' : 'Linked Account'}</Label>
                <Select
                  value={formData.account_id?.toString()}
                  onValueChange={(value) => handleInputChange('account_id', parseInt(value))}
                  disabled={isLoading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={isArabic ? 'اختر حساباً' : 'Select an account'} />
                  </SelectTrigger>
                  <SelectContent>
                    {accounts.map((account) => (
                      <SelectItem key={account.id} value={account.id.toString()}>
                        {account.code} - {isArabic ? account.name_ar : account.name_en}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Depreciation Rate */}
              <div className="space-y-2">
                <Label htmlFor="depreciation_rate">{isArabic ? 'نسبة الإهلاك (%)' : 'Depreciation Rate (%)'}</Label>
                <Input
                  id="depreciation_rate"
                  type="number"
                  step="0.01"
                  value={formData.depreciation_rate}
                  onChange={(e) => handleInputChange('depreciation_rate', e.target.value)}
                  placeholder="0.00"
                  disabled={isLoading}
                />
              </div>

              {/* Salvage Value */}
              <div className="space-y-2">
                <Label htmlFor="salvage_value">{isArabic ? 'القيمة المتبقية' : 'Salvage Value'}</Label>
                <Input
                  id="salvage_value"
                  type="number"
                  step="0.01"
                  value={formData.salvage_value}
                  onChange={(e) => handleInputChange('salvage_value', e.target.value)}
                  placeholder="0.00"
                  disabled={isLoading}
                />
              </div>
            </div>
          </div>

          {/* Existing Documents (Edit Mode) */}
          {isEditMode && existingDocuments.length > 0 && (
            <div className="space-y-2">
              <Label>{isArabic ? 'المستندات الحالية' : 'Existing Documents'}</Label>
              <div className="space-y-2">
                {existingDocuments.map((doc) => (
                  <div key={doc.id} className="flex items-center justify-between p-2 border rounded">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-gray-500" />
                      <a 
                        href={doc.document_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:underline"
                      >
                        {doc.document_name}
                      </a>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteExistingDocument(doc.id)}
                      disabled={isLoading}
                    >
                      <X className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* File Upload */}
          <div className="space-y-2">
            <Label>{isArabic ? 'إضافة مستندات' : 'Add Documents'}</Label>
            <div className="border-2 border-dashed rounded-lg p-4">
              <input
                type="file"
                multiple
                onChange={handleFileSelect}
                className="hidden"
                id="file-upload"
                disabled={isLoading}
              />
              <label
                htmlFor="file-upload"
                className="flex flex-col items-center cursor-pointer"
              >
                <Upload className="h-8 w-8 text-gray-400 mb-2" />
                <span className="text-sm text-gray-600">
                  {isArabic ? 'اضغط لاختيار الملفات' : 'Click to select files'}
                </span>
              </label>
            </div>

            {selectedFiles.length > 0 && (
              <div className="space-y-2 mt-2">
                {selectedFiles.map((file, index) => (
                  <div key={index} className="flex items-center justify-between p-2 border rounded">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-gray-500" />
                      <span className="text-sm">{file.name}</span>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeSelectedFile(index)}
                      disabled={isLoading}
                    >
                      <X className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
            >
              {isArabic ? 'إلغاء' : 'Cancel'}
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className={`h-4 w-4 animate-spin ${isArabic ? 'ml-2' : 'mr-2'}`} />
                  {isUploading 
                    ? (isArabic ? 'جاري رفع الملفات...' : 'Uploading files...')
                    : (isArabic ? 'جاري الحفظ...' : 'Saving...')
                  }
                </>
              ) : (
                isArabic ? 'حفظ' : 'Save'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default AssetModal
