'use client'
import React, { useState } from 'react'
import useSWR from 'swr'
import { getClientDealsByClientId, deleteClientDeal } from '@/app/services/api/clientsDeals'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
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
import { Handshake, Trash2, Calendar, DollarSign, FileText, Plus, Eye, Edit, Loader2 } from 'lucide-react'
import { toast } from 'react-toastify'
import { useTranslations } from '@/hooks/useTranslations'
import AddDealModal from '@/app/parties/deals/components/AddDealModal'
import EditDealModal from '@/app/parties/deals/components/EditDealModal'
import ViewDealModal from '@/app/parties/deals/components/ViewDealModal'

function Deals({ partyId }) {
  const { t } = useTranslations()
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [selectedDealId, setSelectedDealId] = useState(null)
  const [deleteModal, setDeleteModal] = useState({ 
    isOpen: false, 
    dealId: null, 
    dealInfo: null,
    isDeleting: false 
  })
  
  const { data, error, isLoading, mutate } = useSWR(
    partyId ? [`/clients-deals/client/${partyId}`] : null,
    () => getClientDealsByClientId(partyId),
    {
      revalidateOnFocus: false,
    }
  )

  const handleViewDeal = (dealId) => {
    setSelectedDealId(dealId)
    setIsViewModalOpen(true)
  }

  const handleEditDeal = (dealId) => {
    setSelectedDealId(dealId)
    setIsEditModalOpen(true)
  }

  const handleDeleteDeal = (deal) => {
    setDeleteModal({
      isOpen: true,
      dealId: deal.id,
      dealInfo: deal,
      isDeleting: false
    })
  }

  const handleConfirmDelete = async () => {
    if (!deleteModal.dealId) return

    setDeleteModal(prev => ({ ...prev, isDeleting: true }))
    
    try {
      const response = await deleteClientDeal(deleteModal.dealId)
      
      if (response.success) {
        toast.success(t('common.deleteSuccess'))
        mutate()
        setDeleteModal({ isOpen: false, dealId: null, dealInfo: null, isDeleting: false })
      } else {
        toast.error(response.error || t('common.deleteError'))
      }
    } catch (error) {
      toast.error(t('common.deleteError'))
    } finally {
      setDeleteModal(prev => ({ ...prev, isDeleting: false }))
    }
  }

  const handleCancelDelete = () => {
    setDeleteModal({ isOpen: false, dealId: null, dealInfo: null, isDeleting: false })
  }

  const handleCloseViewModal = () => {
    setIsViewModalOpen(false)
    setSelectedDealId(null)
  }

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false)
    setSelectedDealId(null)
  }

  const handleEditSuccess = () => {
    mutate()
    setIsEditModalOpen(false)
    setSelectedDealId(null)
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

  const deals = data?.success && Array.isArray(data.data) ? data.data : (Array.isArray(data?.data) ? data.data : (Array.isArray(data) ? data : []))

  const formatDate = (dateString) => {
    if (!dateString) return '-'
    return new Date(dateString).toLocaleDateString('ar-AE', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    })
  }

  const formatCurrency = (amount) => {
    if (!amount) return '-'
    return new Intl.NumberFormat('ar-AE', {
      style: 'currency',
      currency: 'AED',
    }).format(amount)
  }

  const getStatusBadge = (status) => {
    const statusMap = {
      'active': { label: t('common.active'), color: 'bg-green-100 text-green-800' },
      'pending': { label: t('orders.pending'), color: 'bg-yellow-100 text-yellow-800' },
      'completed': { label: t('orders.completed'), color: 'bg-blue-100 text-blue-800' },
      'cancelled': { label: t('orders.cancelled'), color: 'bg-red-100 text-red-800' },
    }
    const statusInfo = statusMap[status] || statusMap['pending']
    return <Badge className={statusInfo.color}>{statusInfo.label}</Badge>
  }

  const getTypeBadge = (type) => {
    const typeMap = {
      'consultation': { label: t('orders.consultation'), color: 'bg-purple-100 text-purple-800' },
      'contract': { label: t('orders.contract'), color: 'bg-indigo-100 text-indigo-800' },
      'litigation': { label: t('orders.litigation'), color: 'bg-cyan-100 text-cyan-800' },
      'retainer': { label: t('orders.legalAdvice'), color: 'bg-pink-100 text-pink-800' },
      'other': { label: t('orders.other'), color: 'bg-gray-100 text-gray-800' },
    }
    const typeInfo = typeMap[type] || typeMap['other']
    return <Badge className={typeInfo.color}>{typeInfo.label}</Badge>
  }

  const handleAddSuccess = () => {
    mutate()
    setIsAddModalOpen(false)
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Handshake className="h-5 w-5" />
              {t('partyTabs.deals')} ({deals.length})
            </CardTitle>
            <Button 
              onClick={() => setIsAddModalOpen(true)}
              size="sm"
              className="gap-2"
            >
              <Plus className="h-4 w-4" />
              {t('deals.addDeal') || 'إضافة صفقة'}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
        {deals.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>{t('orders.noOrders')}</p>
          </div>
        ) : (
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead className="text-right font-semibold">{t('orders.type')}</TableHead>
                  <TableHead className="text-right font-semibold">{t('forms.amount')}</TableHead>
                  <TableHead className="text-right font-semibold">{t('orders.status')}</TableHead>
                  <TableHead className="text-right font-semibold">{t('contracts.startDate')}</TableHead>
                  <TableHead className="text-right font-semibold">{t('contracts.endDate')}</TableHead>
                  <TableHead className="text-center font-semibold">{t('common.actions')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {deals.map((deal) => (
                  <TableRow key={deal.id}>
                    <TableCell>{getTypeBadge(deal.type)}</TableCell>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-1">
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                        {formatCurrency(deal.amount)}
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(deal.status)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        {formatDate(deal.start_date)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        {formatDate(deal.end_date)}
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleViewDeal(deal.id)}
                          title={t('common.view')}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEditDeal(deal.id)}
                          title={t('common.edit')}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteDeal(deal)}
                          title={t('common.delete')}
                          className="text-red-600 hover:text-red-800"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>

    {/* Add Deal Modal */}
    <AddDealModal
      isOpen={isAddModalOpen}
      onClose={() => setIsAddModalOpen(false)}
      onSuccess={handleAddSuccess}
      partyId={partyId}
    />

    {/* View Deal Modal */}
    <ViewDealModal
      isOpen={isViewModalOpen}
      onClose={handleCloseViewModal}
      dealId={selectedDealId}
    />

    {/* Edit Deal Modal */}
    <EditDealModal
      isOpen={isEditModalOpen}
      onClose={handleCloseEditModal}
      dealId={selectedDealId}
      onSuccess={handleEditSuccess}
    />

    {/* Delete Confirmation Dialog */}
    <AlertDialog open={deleteModal.isOpen} onOpenChange={handleCancelDelete}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <Trash2 className="h-5 w-5 text-red-600" />
            {t('common.confirmDelete')}
          </AlertDialogTitle>
          <AlertDialogDescription className="text-left">
            {t('common.deleteMessage') || 'Are you sure you want to delete this deal?'}
            {deleteModal.dealInfo && (
              <div className="mt-3 p-3 bg-muted rounded-md">
                <div className="text-sm space-y-1">
                  <div><strong>{t('common.id')}:</strong> #{deleteModal.dealInfo.id}</div>
                  {deleteModal.dealInfo.type && (
                    <div><strong>{t('orders.type')}:</strong> {deleteModal.dealInfo.type}</div>
                  )}
                  {deleteModal.dealInfo.amount && (
                    <div><strong>{t('forms.amount')}:</strong> {formatCurrency(deleteModal.dealInfo.amount)}</div>
                  )}
                </div>
              </div>
            )}
            <div className="mt-3 text-sm text-muted-foreground">
              {t('common.cannotUndo') || 'This action cannot be undone.'}
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel 
            onClick={handleCancelDelete}
            disabled={deleteModal.isDeleting}
          >
            {t('common.cancel')}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirmDelete}
            disabled={deleteModal.isDeleting}
            className="bg-red-600 text-white hover:bg-red-700"
          >
            {deleteModal.isDeleting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                {t('common.deleting')}
              </>
            ) : (
              <>
                <Trash2 className="h-4 w-4 mr-2" />
                {t('common.delete')}
              </>
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  </>
  )
}

export default Deals
