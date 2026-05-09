
'use client';

import React, { useState } from 'react';
import useSWR, { mutate } from 'swr';
import { getJudicialOrdersByCaseId, deleteJudicialOrder } from '@/app/services/api/judicialOrders';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTranslations } from '@/hooks/useTranslations';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Loader2, Plus, Pencil, Trash2 } from 'lucide-react';
import AddJudicialOrderModal from './AddJudicialOrderModal';
import EditJudicialOrderModal from './EditJudicialOrderModal';

function Notifications({ caseId }) {
  const { language, isRTL } = useLanguage();
  const { t } = useTranslations();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editOrderId, setEditOrderId] = useState(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deleteOrderId, setDeleteOrderId] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch judicial orders data using SWR
  const { data: ordersData, error, isLoading } = useSWR(
    caseId ? `/judicial-orders/case/${caseId}` : null,
    () => getJudicialOrdersByCaseId(caseId),
    {
      refreshInterval: 300000, // Refresh every 5 minutes
      revalidateOnFocus: true
    }
  );

  // Helper function to translate status
  const translateStatus = (status) => {
    const statusLower = status?.toLowerCase();
    if (language === 'ar') {
      switch (statusLower) {
        case 'pending':
          return 'معلق';
        case 'executed':
          return 'منفذ';
        case 'appealed':
          return 'مستأنف';
        case 'cancelled':
          return 'ملغي';
        default:
          return status;
      }
    } else {
      switch (statusLower) {
        case 'pending':
          return 'Pending';
        case 'executed':
          return 'Executed';
        case 'appealed':
          return 'Appealed';
        case 'cancelled':
          return 'Cancelled';
        default:
          return status;
      }
    }
  };

  // Helper function to get status badge color
  const getStatusBadgeColor = (status) => {
    const statusLower = status?.toLowerCase();
    switch (statusLower) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100';
      case 'executed':
        return 'bg-green-100 text-green-800 hover:bg-green-100';
      case 'appealed':
        return 'bg-blue-100 text-blue-800 hover:bg-blue-100';
      case 'cancelled':
        return 'bg-red-100 text-red-800 hover:bg-red-100';
      default:
        return 'bg-gray-100 text-gray-800 hover:bg-gray-100';
    }
  };

  // Helper function to convert 0/1 to Yes/No
  const convertBooleanValue = (value) => {
    return value === 1 || value === true ? t('judicialOrders.yes') : t('judicialOrders.no');
  };

  // Helper function to format date
  const formatDate = (dateString) => {
    if (!dateString) return t('common.notSpecified');
    const date = new Date(dateString);
    return date.toLocaleDateString(language === 'ar' ? 'ar-AE' : 'en-US');
  };

  // Process orders data
  const orders = React.useMemo(() => {
    if (!ordersData?.success || !Array.isArray(ordersData?.data)) return [];
    return ordersData.data;
  }, [ordersData]);

  // Handle edit order
  const handleEditOrder = (orderId) => {
    setEditOrderId(orderId);
    setIsEditModalOpen(true);
  };

  // Handle delete order
  const handleDeleteOrder = (orderId) => {
    setDeleteOrderId(orderId);
    setIsDeleteDialogOpen(true);
  };

  // Confirm delete order
  const confirmDeleteOrder = async () => {
    if (deleteOrderId) {
      setIsDeleting(true);
      try {
        await deleteJudicialOrder(deleteOrderId);
        // Refresh the data
        mutate(`/judicial-orders/case/${caseId}`);
        setIsDeleteDialogOpen(false);
        setDeleteOrderId(null);
      } catch (error) {
        // You might want to show a toast notification here
      } finally {
        setIsDeleting(false);
      }
    }
  };

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t('judicialOrders.title')}</CardTitle>
          <CardDescription>{t('common.errorLoading')}</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>{t('judicialOrders.title')}</CardTitle>
            <CardDescription>{t('judicialOrders.description')}</CardDescription>
          </div>
          <Button onClick={() => setIsModalOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            {language === 'ar' ? 'إشعار قضائي جديد' : 'Add New Order'}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center p-8">
            <Loader2 className="h-8 w-8 animate-spin" />
            <span className="ml-2">{t('common.loading')}</span>
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            {t('judicialOrders.noOrders')}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className={isRTL ? 'text-right' : 'text-left'}>
                    {t('common.id')}
                  </TableHead>
                  <TableHead className={isRTL ? 'text-right' : 'text-left'}>
                    {t('judicialOrders.date')}
                  </TableHead>
                  <TableHead className={isRTL ? 'text-right' : 'text-left'}>
                    {t('judicialOrders.status')}
                  </TableHead>
                  <TableHead className={isRTL ? 'text-right' : 'text-left'}>
                    {t('judicialOrders.serviceCompleted')}
                  </TableHead>
                  <TableHead className={isRTL ? 'text-right' : 'text-left'}>
                    {t('judicialOrders.notificationPeriodDays')}
                  </TableHead>
                  <TableHead className={isRTL ? 'text-right' : 'text-left'}>
                    {t('judicialOrders.caseFiled')}
                  </TableHead>
                  <TableHead className={isRTL ? 'text-right' : 'text-left'}>
                    {t('judicialOrders.createdAt')}
                  </TableHead>
                  <TableHead className={isRTL ? 'text-right' : 'text-left'}>
                    {t('common.actions')}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className={isRTL ? 'text-right' : 'text-left'}>
                      {order.id}
                    </TableCell>
                    <TableCell className={isRTL ? 'text-right' : 'text-left'}>
                      {formatDate(order.date)}
                    </TableCell>
                    <TableCell className={isRTL ? 'text-right' : 'text-left'}>
                      <Badge className={getStatusBadgeColor(order.status)}>
                        {translateStatus(order.status)}
                      </Badge>
                    </TableCell>
                    <TableCell className={isRTL ? 'text-right' : 'text-left'}>
                      <Badge 
                        variant={order.service_completed === 1 ? 'default' : 'outline'}
                        className={order.service_completed === 1 ? 'bg-green-100 text-green-800 hover:bg-green-100' : ''}
                      >
                        {convertBooleanValue(order.service_completed)}
                      </Badge>
                    </TableCell>
                    <TableCell className={isRTL ? 'text-right' : 'text-left'}>
                      {order.notification_period_days || t('common.notSpecified')}
                    </TableCell>
                    <TableCell className={isRTL ? 'text-right' : 'text-left'}>
                      <Badge 
                        variant={order.case_filed === 1 ? 'default' : 'outline'}
                        className={order.case_filed === 1 ? 'bg-green-100 text-green-800 hover:bg-green-100' : ''}
                      >
                        {convertBooleanValue(order.case_filed)}
                      </Badge>
                    </TableCell>
                    <TableCell className={isRTL ? 'text-right' : 'text-left'}>
                      {formatDate(order.created_at)}
                    </TableCell>
                    <TableCell className={isRTL ? 'text-right' : 'text-left'}>
                      <div className="flex items-center space-x-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditOrder(order.id)}
                          className="h-8 w-8 p-0"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteOrder(order.id)}
                          className="h-8 w-8 p-0 text-red-600 hover:text-red-800 hover:bg-red-50"
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
      
      <AddJudicialOrderModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        caseId={caseId}
      />
      
      <EditJudicialOrderModal 
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditOrderId(null);
        }}
        caseId={caseId}
        orderId={editOrderId}
      />

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {language === 'ar' ? 'تأكيد الحذف' : 'Confirm Delete'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {language === 'ar' 
                ? 'هل أنت متأكد من أنك تريد حذف هذا الإشعار القضائي؟ هذا الإجراء لا يمكن التراجع عنه.' 
                : 'Are you sure you want to delete this judicial order? This action cannot be undone.'
              }
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>
              {language === 'ar' ? 'إلغاء' : 'Cancel'}
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDeleteOrder}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting 
                ? (language === 'ar' ? 'جاري الحذف...' : 'Deleting...') 
                : (language === 'ar' ? 'حذف' : 'Delete')
              }
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}

export default Notifications;