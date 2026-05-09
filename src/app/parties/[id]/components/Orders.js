'use client'
import React, { useState } from 'react'
import useSWR from 'swr'
import { getOrdersByPartyId, deletePartyOrder } from '@/app/services/api/partiesOrders'
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
import { useTranslations } from '@/hooks/useTranslations'
import { FileText, Trash2, Calendar, ClipboardList, Plus, Edit } from 'lucide-react'
import { toast } from 'react-toastify'
import AddOrderModal from './AddOrderModal'
import EditOrderModal from './EditOrderModal'
import DeleteOrderModal from './DeleteOrderModal'

function Orders({ partyId }) {
  const { t } = useTranslations()
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [selectedOrderId, setSelectedOrderId] = useState(null)
  const [isDeleting, setIsDeleting] = useState(false)
  
  const { data, error, isLoading, mutate } = useSWR(
    partyId ? [`/parties-orders/party/${partyId}`] : null,
    () => getOrdersByPartyId(partyId),
    {
      revalidateOnFocus: false,
    }
  )

  const handleDelete = (orderId) => {
    setSelectedOrderId(orderId)
    setIsDeleteModalOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (!selectedOrderId) return

    setIsDeleting(true)
    try {
      await deletePartyOrder(selectedOrderId)
      toast.success(t('orders.deleteSuccess') || 'تم حذف الطلب بنجاح')
      mutate()
      setIsDeleteModalOpen(false)
      setSelectedOrderId(null)
    } catch (error) {
      toast.error(t('orders.deleteError') || 'حدث خطأ أثناء حذف الطلب')
    } finally {
      setIsDeleting(false)
    }
  }

  const handleEdit = (orderId) => {
    setSelectedOrderId(orderId)
    setIsEditModalOpen(true)
  }

  const handleAddSuccess = () => {
    mutate()
  }

  const handleEditSuccess = () => {
    mutate()
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">{t('orders.loading') || 'جاري التحميل...'}</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <p className="text-destructive">{t('common.error') || 'حدث خطأ في تحميل البيانات'}</p>
        </div>
      </div>
    )
  }

  const orders = data?.success && Array.isArray(data.data) ? data.data : (Array.isArray(data?.data) ? data.data : (Array.isArray(data) ? data : []))

  const formatDate = (dateString) => {
    if (!dateString) return '-'
    return new Date(dateString).toLocaleDateString('ar-AE', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    })
  }

  const getStatusBadge = (status) => {
    const statusMap = {
      'pending': { label: t('orders.pending') || 'قيد الانتظار', color: 'bg-yellow-100 text-yellow-800' },
      'in_progress': { label: t('orders.inProgress') || 'قيد التنفيذ', color: 'bg-blue-100 text-blue-800' },
      'completed': { label: t('orders.completed') || 'مكتمل', color: 'bg-green-100 text-green-800' },
      'cancelled': { label: t('orders.cancelled') || 'ملغي', color: 'bg-red-100 text-red-800' },
      'approved': { label: t('orders.approved') || 'موافق عليه', color: 'bg-green-100 text-green-800' },
      'rejected': { label: t('orders.rejected') || 'مرفوض', color: 'bg-red-100 text-red-800' },
    }
    const statusInfo = statusMap[status] || statusMap['pending']
    return <Badge className={statusInfo.color}>{statusInfo.label}</Badge>
  }

  const getTypeBadge = (type) => {
    const typeMap = {
      'consultation': { label: t('orders.consultation') || 'استشارة', color: 'bg-purple-100 text-purple-800' },
      'litigation': { label: t('orders.litigation') || 'ترافع', color: 'bg-indigo-100 text-indigo-800' },
      'legal_advice': { label: t('orders.legalAdvice') || 'مشورة قانونية', color: 'bg-cyan-100 text-cyan-800' },
      'contract': { label: t('orders.contract') || 'عقد', color: 'bg-pink-100 text-pink-800' },
      'document_request': { label: t('orders.documentRequest') || 'طلب مستندات', color: 'bg-blue-100 text-blue-800' },
      'case_details': { label: t('orders.caseDetails') || 'تفاصيل عن القضية', color: 'bg-teal-100 text-teal-800' },
      'other': { label: t('orders.other') || 'أخرى', color: 'bg-gray-100 text-gray-800' },
    }
    const typeInfo = typeMap[type] || typeMap['other']
    return <Badge className={typeInfo.color}>{typeInfo.label}</Badge>
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <ClipboardList className="h-5 w-5" />
            {t('partyTabs.orders') || 'الطلبات'} ({orders.length})
          </CardTitle>
          <Button 
            onClick={() => setIsAddModalOpen(true)}
            size="sm"
            className="gap-2"
          >
            <Plus className="h-4 w-4" />
            {t('orders.addOrder') || 'إضافة طلب'}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {orders.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="font-medium">{t('orders.noOrders') || 'لا توجد طلبات'}</p>
            <p className="text-sm mt-1">{t('orders.noOrdersDescription') || 'لا توجد طلبات مسجلة لهذا الطرف'}</p>
          </div>
        ) : (
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead className="text-right font-semibold">{t('orders.type') || 'النوع'}</TableHead>
                  <TableHead className="text-right font-semibold">{t('orders.caseNumber') || 'رقم القضية'}</TableHead>
                  <TableHead className="text-right font-semibold">{t('orders.status') || 'الحالة'}</TableHead>
                  <TableHead className="text-right font-semibold">{t('orders.date') || 'التاريخ'}</TableHead>
                  <TableHead className="text-right font-semibold">{t('orders.details') || 'التفاصيل'}</TableHead>
                  <TableHead className="text-center font-semibold">{t('common.actions') || 'الإجراءات'}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell>{getTypeBadge(order.type)}</TableCell>
                    <TableCell className="font-medium">{order.case_number || '-'}</TableCell>
                    <TableCell>{getStatusBadge(order.status)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        {formatDate(order.date)}
                      </div>
                    </TableCell>
                    <TableCell className="max-w-xs truncate">{order.details || '-'}</TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(order.id)}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(order.id)}
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

      {/* Add Order Modal */}
      <AddOrderModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={handleAddSuccess}
        partyId={partyId}
      />

      {/* Edit Order Modal */}
      <EditOrderModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSuccess={handleEditSuccess}
        orderId={selectedOrderId}
      />

      {/* Delete Order Modal */}
      <DeleteOrderModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        isDeleting={isDeleting}
      />
    </Card>
  )
}

export default Orders
