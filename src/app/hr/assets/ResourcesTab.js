"use client"

import React, { useState } from 'react'
import { format } from 'date-fns'
import { useLanguage } from "@/contexts/LanguageContext"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Plus, Pencil, Trash2, Eye, FileText } from 'lucide-react'
import { toast } from 'react-toastify'
import AssetModal from './AssetModal'
import ViewAssetModal from './ViewAssetModal'
import { getAssetById, deleteAsset } from '@/app/services/api/assets'

const ResourcesTab = ({ resources, onMutate }) => {
  const { language } = useLanguage()
  const isArabic = language === 'ar'

  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [selectedAsset, setSelectedAsset] = useState(null)
  const [viewAsset, setViewAsset] = useState(null)

  const handleAddResource = () => {
    setSelectedAsset(null)
    setIsAddModalOpen(true)
  }

  const handleEditAsset = async (asset) => {
    try {
      const response = await getAssetById(asset.id)
      if (response.success) {
        setSelectedAsset(response.data)
        setIsEditModalOpen(true)
      } else {
        toast.error(response.message || (isArabic ? 'حدث خطأ' : 'An error occurred'))
      }
    } catch (error) {

      toast.error(isArabic ? 'حدث خطأ أثناء جلب بيانات الأصل' : 'Error fetching asset details')
    }
  }

  const handleViewAsset = async (asset) => {
    try {
      const response = await getAssetById(asset.id)
      if (response.success) {
        setViewAsset(response.data)
        setIsViewModalOpen(true)
      } else {
        toast.error(response.message || (isArabic ? 'حدث خطأ' : 'An error occurred'))
      }
    } catch (error) {

      toast.error(isArabic ? 'حدث خطأ أثناء جلب بيانات الأصل' : 'Error fetching asset details')
    }
  }

  const handleDeleteAsset = async (assetId) => {
    if (!window.confirm(isArabic ? 'هل أنت متأكد من حذف هذا المورد وجميع مستنداته؟' : 'Are you sure you want to delete this resource and all its documents?')) {
      return
    }

    try {
      const response = await deleteAsset(assetId)
      if (response.success) {
        toast.success(isArabic ? 'تم حذف المورد بنجاح' : 'Resource deleted successfully')
        onMutate()
      } else {
        toast.error(response.message || (isArabic ? 'حدث خطأ' : 'An error occurred'))
      }
    } catch (error) {

      toast.error(isArabic ? 'حدث خطأ أثناء حذف المورد' : 'Error deleting resource')
    }
  }

  const handleModalSuccess = () => {
    onMutate()
  }

  const handleViewModalDocumentDeleted = () => {
    onMutate()
    if (viewAsset) {
      getAssetById(viewAsset.id).then(response => {
        if (response.success) {
          setViewAsset(response.data)
        }
      })
    }
  }

  return (
    <>
      <div className="flex justify-end mb-4">
        <Button onClick={handleAddResource}>
          <Plus className={`h-4 w-4 me-2`} />
          {isArabic ? 'إضافة مورد' : 'Add Resource'}
        </Button>
      </div>

      {resources.length === 0 ? (
        <div className="text-center p-8 text-gray-500">
          {isArabic ? 'لا توجد موارد' : 'No resources found'}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{isArabic ? '#' : '#'}</TableHead>
                <TableHead>{isArabic ? 'الاسم' : 'Name'}</TableHead>
                <TableHead>{isArabic ? 'النوع' : 'Type'}</TableHead>
                <TableHead>{isArabic ? 'الفرع' : 'Branch'}</TableHead>
                <TableHead>{isArabic ? 'تاريخ الإصدار' : 'Issue Date'}</TableHead>
                <TableHead>{isArabic ? 'تاريخ الانتهاء' : 'Expiry Date'}</TableHead>
                <TableHead>{isArabic ? 'الملاحظات' : 'Notes'}</TableHead>
                <TableHead>{isArabic ? 'المستندات' : 'Documents'}</TableHead>
                <TableHead className="text-center">{isArabic ? 'الإجراءات' : 'Actions'}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {resources.map((asset, index) => (
                <TableRow key={asset.id}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell className="font-medium">{asset.name}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">{asset.type}</Badge>
                  </TableCell>
                  <TableCell>{asset.branch_name || '-'}</TableCell>
                  <TableCell>
                    {asset.issue_date 
                      ? format(new Date(asset.issue_date), 'yyyy-MM-dd')
                      : '-'
                    }
                  </TableCell>
                  <TableCell>
                    {asset.expiry_date 
                      ? format(new Date(asset.expiry_date), 'yyyy-MM-dd')
                      : '-'
                    }
                  </TableCell>
                  <TableCell>
                    <span className="text-sm line-clamp-1">
                      {asset.note || '-'}
                    </span>
                  </TableCell>
                  <TableCell>
                    {asset.documents_count > 0 ? (
                      <div className="flex items-center gap-1 text-blue-600">
                        <FileText className="h-4 w-4" />
                        <span className="text-sm">{asset.documents_count}</span>
                      </div>
                    ) : (
                      <span className="text-gray-400 text-sm">
                        {isArabic ? 'لا يوجد' : 'None'}
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleViewAsset(asset)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditAsset(asset)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteAsset(asset.id)}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Add/Edit Modal */}
      <AssetModal
        isOpen={isAddModalOpen || isEditModalOpen}
        onClose={() => {
          setIsAddModalOpen(false)
          setIsEditModalOpen(false)
          setSelectedAsset(null)
        }}
        onSuccess={handleModalSuccess}
        asset={selectedAsset}
        recordType="resource"
      />

      {/* View Modal */}
      <ViewAssetModal
        isOpen={isViewModalOpen}
        onClose={() => {
          setIsViewModalOpen(false)
          setViewAsset(null)
        }}
        asset={viewAsset}
        onDocumentDeleted={handleViewModalDocumentDeleted}
      />
    </>
  )
}

export default ResourcesTab

