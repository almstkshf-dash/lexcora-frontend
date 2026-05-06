"use client"

import React from 'react'
import { useTranslations } from "@/hooks/useTranslations"
import { useLanguage } from "@/contexts/LanguageContext"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { 
  Plus, 
  Eye, 
  Pencil, 
  Trash2, 
  Calendar,
  MapPin,
  Clock,
  Users
} from 'lucide-react'
import { format } from 'date-fns'
import { ar } from 'date-fns/locale'

function EventsTable({ events, isLoading, onView, onEdit, onDelete, onCreate }) {
  const { t } = useTranslations()
  const { language } = useLanguage()
  const isArabic = language === 'ar'

  const formatDate = (date) => {
    if (!date) return '-'
    return format(new Date(date), 'dd MMM yyyy', { 
      locale: isArabic ? ar : undefined 
    })
  }

  const formatTime = (startTime, endTime) => {
    if (!startTime && !endTime) return '-'
    if (startTime && endTime) return `${startTime} - ${endTime}`
    return startTime || endTime
  }

  return (
    <div className="bg-card rounded-sg border shadow-sm">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[300px]">
              {isArabic ? 'العنوان' : 'Title'}
            </TableHead>
            <TableHead>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                {isArabic ? 'المكان' : 'Place'}
              </div>
            </TableHead>
            <TableHead>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                {isArabic ? 'التاريخ' : 'Date'}
              </div>
            </TableHead>
            <TableHead>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                {isArabic ? 'الوقت' : 'Time'}
              </div>
            </TableHead>
            <TableHead>
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                {isArabic ? 'الحضور' : 'Attendees'}
              </div>
            </TableHead>
            <TableHead className="text-end">
              {isArabic ? 'الإجراءات' : 'Actions'}
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            Array.from({ length: 5 }).map((_, index) => (
              <TableRow key={index}>
                <TableCell><Skeleton className="h-5 w-full" /></TableCell>
                <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                <TableCell><Skeleton className="h-5 w-28" /></TableCell>
                <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                <TableCell><Skeleton className="h-5 w-32" /></TableCell>
              </TableRow>
            ))
          ) : events && events.length > 0 ? (
            events.map((event) => (
              <TableRow key={event.id} className="hover:bg-muted/50">
                <TableCell className="font-medium">
                  {event.title}
                </TableCell>
                <TableCell>
                  {event.place || '-'}
                </TableCell>
                <TableCell>
                  {formatDate(event.event_date)}
                </TableCell>
                <TableCell className="text-sm">
                  {formatTime(event.start_time, event.end_time)}
                </TableCell>
                <TableCell>
                  <Badge variant="secondary">
                    {event.attendees_count || 0}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onView(event)}
                      title={isArabic ? 'عرض' : 'View'}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onEdit(event)}
                      title={isArabic ? 'تعديل' : 'Edit'}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onDelete(event)}
                      className="text-destructive hover:text-destructive hover:bg-destructive/10"
                      title={isArabic ? 'حذف' : 'Delete'}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
                <div className="flex flex-col items-center gap-2">
                  <Calendar className="h-12 w-12 opacity-20" />
                  <p>{isArabic ? 'لا توجد أحداث' : 'No events found'}</p>
                  <Button onClick={onCreate} variant="outline" size="sm">
                    <Plus className="h-4 w-4 me-2" />
                    {isArabic ? 'إضافة أول حدث' : 'Add first event'}
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}

export default EventsTable


