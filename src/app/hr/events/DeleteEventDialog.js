"use client"

import React, { useState } from 'react'
import { useTranslations } from "@/hooks/useTranslations"
import { useLanguage } from "@/contexts/LanguageContext"
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
import { Loader2 } from 'lucide-react'
import { toast } from 'react-toastify'
import { deleteEvent } from '@/app/services/api/events'

const DeleteEventDialog = ({ 
  isOpen, 
  onClose, 
  onSuccess,
  event = null 
}) => {
  const { t } = useTranslations()
  const { language } = useLanguage()
  const isArabic = language === 'ar'
  const [isLoading, setIsLoading] = useState(false)

  const handleDelete = async () => {
    if (!event?.id) return

    setIsLoading(true)
    try {
      await deleteEvent(event.id)
      toast.success(isArabic ? 'تم حذف الحدث بنجاح' : 'Event deleted successfully')
      onSuccess?.()
      onClose()
    } catch (error) {

      toast.error(
        isArabic 
          ? error.response?.data?.message || 'حدث خطأ أثناء حذف الحدث'
          : error.response?.data?.message || 'Error deleting event'
      )
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {isArabic ? 'تأكيد الحذف' : 'Confirm Deletion'}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {isArabic 
              ? `هل أنت متأكد من حذف الحدث "${event?.title}"؟ لا يمكن التراجع عن هذا الإجراء.`
              : `Are you sure you want to delete the event "${event?.title}"? This action cannot be undone.`
            }
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>
            {isArabic ? 'إلغاء' : 'Cancel'}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={isLoading}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isLoading && <Loader2 className="ms-2 h-4 w-4 animate-spin" />}
            {isArabic ? 'حذف' : 'Delete'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

export default DeleteEventDialog

