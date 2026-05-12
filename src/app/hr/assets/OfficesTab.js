"use client"

import React, { useState } from 'react'
import { format } from 'date-fns'
import { useLanguage } from "@/contexts/LanguageContext"
import { useTranslations } from "@/hooks/useTranslations"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Plus, Pencil, Trash2, Eye, FileText } from 'lucide-react'
import { toast } from 'react-toastify'
import AssetModal from './AssetModal'
import ViewAssetModal from './ViewAssetModal'
import { getAssetById, deleteAsset } from '@/app/services/api/assets'

const OfficesTab = ({ offices, onMutate }) => {
  const { t } = useTranslations()
  const { language } = useLanguage()
  const isArabic = language === 'ar'

  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [selectedAsset, setSelectedAsset] = useState(null)
  const [viewAsset, setViewAsset] = useState(null)

  const handleAddOffice = () => {
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
        toast.error(response.message || t('common.error'))
      }
    } catch (error) {
      toast.error(t('assets.errorFetchingDetails') || t('common.error'))
    }
  }

  const handleDeleteAsset = async (assetId) => {
    if (!window.confirm(t('assets.confirmDeleteAsset'))) {
      return
    }

    try {
      const response = await deleteAsset(assetId)
      if (response.success) {
        toast.success(t('assets.deleteSuccess'))
        onMutate()
      } else {
        toast.error(response.message || t('common.error'))
      }
    } catch (error) {
      toast.error(t('assets.deleteError') || t('common.error'))
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
        <Button onClick={handleAddOffice}>
          <Plus className={`h-4 w-4 me-2`} />
          {t('assets.addOffice')}
        </Button>
      </div>

      {offices.length === 0 ? (
        <div className="text-center p-8 text-gray-500">
          {t('assets.noOffices')}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{isArabic ? '#' : '#'}</TableHead>
                <TableHead>{t('assets.assetName')}</TableHead>
                <TableHead>{t('assets.type')}</TableHead>
                <TableHead>{t('assets.branch')}</TableHead>
                <TableHead>{t('assets.issueDate')}</TableHead>
                <TableHead>{t('assets.expiryDate')}</TableHead>
                <TableHead>{t('assets.notes')}</TableHead>
                <TableHead>{t('assets.documents')}</TableHead>
                <TableHead className="text-center">{t('common.actions')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {offices.map((asset, index) => (
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
                        {t('assets.none')}
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
        recordType="office"
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

export default OfficesTab

