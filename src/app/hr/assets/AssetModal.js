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
import { createAsset, updateAsset, deleteAssetDocument, getDepreciationMethods, getDepreciationPreview } from '@/app/services/api/assets'
import { getBranches } from '@/app/services/api/branches'
import { getAccounts, getBudgets } from '@/app/services/api/accounting'
import { getEmployees } from '@/app/services/api/employees'
import { uploadFiles } from '../../../../utils/fileUpload'
import DepreciationSchedule from './DepreciationSchedule'

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
  const [isPreviewLoading, setIsPreviewLoading] = useState(false)
  const [previewSchedule, setPreviewSchedule] = useState(null)
  const currentYear = new Date().getFullYear()
  const [formData, setFormData] = useState({
    name: '',
    type: '',
    category: '',
    branch_id: '',
    custodian_id: '',
    budget_id: '',
    serial_number: '',
    physical_location: '',
    issue_date: null,
    expiry_date: null,
    note: '',
    purchase_cost: '',
    purchase_date: null,
    account_id: '',
    depreciation_method: 'straight_line',
    depreciation_rate: '',
    useful_life: '',
    salvage_value: '',
    current_value: ''
  })
  const [selectedFiles, setSelectedFiles] = useState([])
  const [existingDocuments, setExistingDocuments] = useState([])

  const { data: branchesData } = useSWR('branches', getBranches)
  const branches = branchesData?.data || []

  const { data: accountsData } = useSWR('accounts', () => getAccounts({ type: 'asset' }))
  const accounts = accountsData?.data || []

  const { data: depreciationMethodsData } = useSWR('depreciation-methods', getDepreciationMethods)
  const depreciationMethods = depreciationMethodsData?.data || []

  const { data: employeesData } = useSWR('employees', getEmployees)
  const employees = employeesData?.data || []

  const { data: budgetsData } = useSWR(
    ['accounting/budgets', currentYear],
    () => getBudgets({ fiscal_year: currentYear })
  )
  const budgets = budgetsData?.data || []

  // Populate form when editing
  useEffect(() => {
    if (isEditMode && asset) {
      setFormData({
        name: asset.name || '',
        type: asset.type || '',
        category: asset.category || '',
        branch_id: asset.branch_id || '',
        custodian_id: asset.custodian_id || '',
        budget_id: asset.budget_id || '',
        serial_number: asset.serial_number || '',
        physical_location: asset.physical_location || '',
        issue_date: asset.issue_date ? new Date(asset.issue_date) : null,
        expiry_date: asset.expiry_date ? new Date(asset.expiry_date) : null,
        note: asset.note || '',
        purchase_cost: asset.purchase_cost || '',
        purchase_date: asset.purchase_date ? new Date(asset.purchase_date) : null,
        account_id: asset.account_id || '',
        depreciation_method: asset.depreciation_method || 'straight_line',
        depreciation_rate: asset.depreciation_rate || '',
        useful_life: asset.useful_life || '',
        salvage_value: asset.salvage_value || '',
        current_value: asset.current_value || ''
      })
      setExistingDocuments(asset.documents || [])
    } else {
      setFormData({
        name: '',
        type: '',
        category: '',
        branch_id: '',
        custodian_id: '',
        budget_id: '',
        serial_number: '',
        physical_location: '',
        issue_date: null,
        expiry_date: null,
        note: '',
        purchase_cost: '',
        purchase_date: null,
        account_id: '',
        depreciation_method: 'straight_line',
        depreciation_rate: '',
        useful_life: '',
        salvage_value: '',
        current_value: ''
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
        category: '',
        branch_id: '',
        custodian_id: '',
        budget_id: '',
        serial_number: '',
        physical_location: '',
        issue_date: null,
        expiry_date: null,
        note: '',
        purchase_cost: '',
        purchase_date: null,
        account_id: '',
        depreciation_method: 'straight_line',
        depreciation_rate: '',
        useful_life: '',
        salvage_value: '',
        current_value: ''
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
    if ([
      'purchase_cost',
      'salvage_value',
      'depreciation_rate',
      'useful_life',
      'depreciation_method',
      'purchase_date'
    ].includes(field)) {
      setPreviewSchedule(null)
    }
  }

  const handleDepreciationPreview = async () => {
    if (!formData.purchase_cost || Number(formData.purchase_cost) <= 0) {
      toast.error(isArabic ? 'يرجى إدخال تكلفة الشراء الصحيحة' : 'Please enter a valid purchase cost')
      return
    }

    setIsPreviewLoading(true)
    setPreviewSchedule(null)

    try {
      const response = await getDepreciationPreview({
        purchase_cost: Number(formData.purchase_cost),
        salvage_value: Number(formData.salvage_value) || 0,
        depreciation_rate: Number(formData.depreciation_rate) || 0,
        useful_life: Number(formData.useful_life) || 0,
        depreciation_method: formData.depreciation_method,
        purchase_date: formData.purchase_date ? format(formData.purchase_date, 'yyyy-MM-dd') : null
      })

      if (response.success) {
        setPreviewSchedule(response.data.schedule)
      } else {
        toast.error(response.message || (isArabic ? 'حدث خطأ في المعاينة' : 'Preview error occurred'))
      }
    } catch (error) {
      toast.error(isArabic ? 'حدث خطأ أثناء جلب المعاينة' : 'Error loading preview')
    } finally {
      setIsPreviewLoading(false)
    }
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
        category: formData.category || null,
        branch_id: formData.branch_id,
        custodian_id: formData.custodian_id || null,
        budget_id: formData.budget_id || null,
        serial_number: formData.serial_number || null,
        physical_location: formData.physical_location || null,
        issue_date: formData.issue_date ? format(formData.issue_date, 'yyyy-MM-dd') : null,
        expiry_date: formData.expiry_date ? format(formData.expiry_date, 'yyyy-MM-dd') : null,
        note: formData.note || null,
        purchase_cost: Number(formData.purchase_cost) || 0,
        purchase_date: formData.purchase_date ? format(formData.purchase_date, 'yyyy-MM-dd') : null,
        account_id: formData.account_id || null,
        depreciation_method: formData.depreciation_method || 'straight_line',
        depreciation_rate: Number(formData.depreciation_rate) || 0,
        useful_life: formData.useful_life !== '' ? Number(formData.useful_life) : null,
        salvage_value: Number(formData.salvage_value) || 0,
        current_value: formData.current_value !== '' ? Number(formData.current_value) : null,
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Category */}
            <div className="space-y-2">
              <Label htmlFor="category">{isArabic ? 'الفئة' : 'Category'}</Label>
              <Input
                id="category"
                value={formData.category}
                onChange={(e) => handleInputChange('category', e.target.value)}
                placeholder={isArabic ? 'مثال: أصول ثابتة' : 'e.g., Fixed Assets'}
                disabled={isLoading}
              />
            </div>

            {/* Custodian */}
            <div className="space-y-2">
              <Label htmlFor="custodian_id">{isArabic ? 'المسؤول' : 'Custodian'}</Label>
              <Select
                value={formData.custodian_id?.toString()}
                onValueChange={(value) => handleInputChange('custodian_id', parseInt(value))}
                disabled={isLoading}
              >
                <SelectTrigger>
                  <SelectValue placeholder={isArabic ? 'اختر المسؤول' : 'Select custodian'} />
                </SelectTrigger>
                <SelectContent>
                  {employees.map((employee) => (
                    <SelectItem key={employee.id} value={employee.id.toString()}>
                      {isArabic ? employee.name_ar || employee.name : employee.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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

            {/* Budget */}
            <div className="space-y-2">
              <Label htmlFor="budget_id">{isArabic ? 'الميزانية' : 'Budget'}</Label>
              <Select
                value={formData.budget_id?.toString()}
                onValueChange={(value) => handleInputChange('budget_id', parseInt(value))}
                disabled={isLoading}
              >
                <SelectTrigger>
                  <SelectValue placeholder={isArabic ? 'اختر الميزانية' : 'Select budget'} />
                </SelectTrigger>
                <SelectContent>
                  {budgets.map((budget) => (
                    <SelectItem key={budget.id} value={budget.id.toString()}>
                      {budget.code} - {isArabic ? budget.name_ar : budget.name_en} ({budget.fiscal_year}{budget.fiscal_month ? `/${budget.fiscal_month}` : ''})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Serial Number */}
            <div className="space-y-2">
              <Label htmlFor="serial_number">{isArabic ? 'الرقم التسلسلي' : 'Serial Number'}</Label>
              <Input
                id="serial_number"
                value={formData.serial_number}
                onChange={(e) => handleInputChange('serial_number', e.target.value)}
                placeholder={isArabic ? 'أدخل الرقم التسلسلي' : 'Enter serial number'}
                disabled={isLoading}
              />
            </div>

            {/* Physical Location */}
            <div className="space-y-2">
              <Label htmlFor="physical_location">{isArabic ? 'الموقع الفعلي' : 'Physical Location'}</Label>
              <Input
                id="physical_location"
                value={formData.physical_location}
                onChange={(e) => handleInputChange('physical_location', e.target.value)}
                placeholder={isArabic ? 'أدخل الموقع' : 'Enter location'}
                disabled={isLoading}
              />
            </div>
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

              {/* Depreciation Method */}
              <div className="space-y-2">
                <Label htmlFor="depreciation_method">{isArabic ? 'طريقة الإهلاك' : 'Depreciation Method'}</Label>
                <Select
                  value={formData.depreciation_method}
                  onValueChange={(value) => handleInputChange('depreciation_method', value)}
                  disabled={isLoading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={isArabic ? 'اختر طريقة' : 'Select method'} />
                  </SelectTrigger>
                  <SelectContent>
                    {depreciationMethods.map((method) => (
                      <SelectItem key={method.value} value={method.value}>
                        {method.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Useful Life */}
              <div className="space-y-2">
                <Label htmlFor="useful_life">{isArabic ? 'العمر الافتراضي (سنوات)' : 'Useful Life (years)'}</Label>
                <Input
                  id="useful_life"
                  type="number"
                  step="1"
                  min="0"
                  value={formData.useful_life}
                  onChange={(e) => handleInputChange('useful_life', e.target.value)}
                  placeholder={isArabic ? '0' : '0'}
                  disabled={isLoading}
                />
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

              {/* Current Value */}
              <div className="space-y-2">
                <Label htmlFor="current_value">{isArabic ? 'القيمة الحالية' : 'Current Value'}</Label>
                <Input
                  id="current_value"
                  type="number"
                  step="0.01"
                  value={formData.current_value}
                  onChange={(e) => handleInputChange('current_value', e.target.value)}
                  placeholder="0.00"
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="mt-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div className="text-sm text-muted-foreground">
                {isArabic ? 'يمكنك معاينة جدول الإهلاك قبل حفظ الأصل.' : 'Preview the depreciation schedule before saving the asset.'}
              </div>
              <Button
                type="button"
                variant="outline"
                onClick={handleDepreciationPreview}
                disabled={isLoading || isPreviewLoading}
              >
                {isPreviewLoading
                  ? (isArabic ? 'جارٍ التحميل...' : 'Loading preview...')
                  : (isArabic ? 'معاينة الإهلاك' : 'Preview Depreciation')}
              </Button>
            </div>
          </div>

          {previewSchedule && (
            <div className="border-t pt-4 mt-4">
              <h3 className="text-lg font-semibold mb-4">{isArabic ? 'معاينة جدول الإهلاك' : 'Depreciation Preview'}</h3>
              <DepreciationSchedule schedule={previewSchedule} />
            </div>
          )}

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
            <div className="border-2 border-dashed rounded-sg p-4">
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
                  <Loader2 className={`h-4 w-4 animate-spin me-2`} />
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


