"use client"

import React from 'react'
import useSWR from 'swr'
import { useTranslations } from "@/hooks/useTranslations"
import { useLanguage } from "@/contexts/LanguageContext"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Skeleton } from "@/components/ui/skeleton"
import { Calendar, Clock, MapPin, FileText, Users } from 'lucide-react'
import { getEventById } from '@/app/services/api/events'
import { format } from 'date-fns'
import { ar } from 'date-fns/locale'

const ViewEventDialog = ({ 
  isOpen, 
  onClose, 
  eventId 
}) => {
  const { t } = useTranslations()
  const { language } = useLanguage()
  const isArabic = language === 'ar'

  const { data: event, isLoading } = useSWR(
    eventId && isOpen ? `event-${eventId}` : null,
    () => getEventById(eventId)
  )

  const formatDate = (date) => {
    if (!date) return '-'
    return format(new Date(date), 'dd MMMM yyyy', { 
      locale: isArabic ? ar : undefined 
    })
  }

  const formatTime = (time) => {
    if (!time) return '-'
    return time
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>
            {isArabic ? 'تفاصيل الحدث' : 'Event Details'}
          </DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
        ) : event ? (
          <ScrollArea dir={isArabic ? 'rtl' : 'ltr'}  className="max-h-[70vh] pe-4">
            <div className="space-y-6">
              {/* Title */}
              <div>
                <h2 className="text-2xl font-bold">{event.title}</h2>
              </div>

              <Separator />

              {/* Date and Time */}
              <div  className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-start gap-3">
                  <Calendar className="h-5 w-5 mt-0.5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      {isArabic ? 'التاريخ' : 'Date'}
                    </p>
                    <p className="text-base">{formatDate(event.event_date)}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Clock className="h-5 w-5 mt-0.5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      {isArabic ? 'الوقت' : 'Time'}
                    </p>
                    <p className="text-base">
                      {event.start_time && event.end_time
                        ? `${formatTime(event.start_time)} - ${formatTime(event.end_time)}`
                        : event.start_time || event.end_time || '-'
                      }
                    </p>
                  </div>
                </div>
              </div>

              {/* Place */}
              {event.place && (
                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 mt-0.5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      {isArabic ? 'المكان' : 'Place'}
                    </p>
                    <p className="text-base">{event.place}</p>
                  </div>
                </div>
              )}

              {/* Description */}
              {event.description && (
                <div className="flex items-start gap-3">
                  <FileText className="h-5 w-5 mt-0.5 text-muted-foreground" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-muted-foreground mb-1">
                      {isArabic ? 'الوصف' : 'Description'}
                    </p>
                    <p className="text-base whitespace-pre-wrap">{event.description}</p>
                  </div>
                </div>
              )}

              <Separator />

              {/* Attendees */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Users className="h-5 w-5 text-muted-foreground" />
                  <h3 className="text-lg font-semibold">
                    {isArabic ? 'الحضور' : 'Attendees'}
                  </h3>
                  <Badge variant="secondary">
                    {event.attendees?.length || 0}
                  </Badge>
                </div>

                {event.attendees && event.attendees.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {event.attendees.map((attendee) => (
                      <div
                        key={attendee.employee_id}
                        className="flex items-center gap-2 p-3 border rounded-sg bg-muted/50"
                      >
                        <div className="flex-1">
                          <p className="font-medium">{attendee.employee_name}</p>
                          {(attendee.role_ar || attendee.role_en) && (
                            <p className="text-sm text-muted-foreground">
                              {isArabic ? attendee.role_ar : attendee.role_en}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-4">
                    {isArabic ? 'لم يتم تحديد حضور' : 'No attendees selected'}
                  </p>
                )}
              </div>

              {/* Created Info */}
              <Separator />
              <div className="text-xs text-muted-foreground">
                {isArabic ? 'تم الإنشاء في: ' : 'Created at: '}
                {event.created_at && formatDate(event.created_at)}
              </div>
            </div>
          </ScrollArea>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            {isArabic ? 'لم يتم العثور على احداث' : 'Event not found'}
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

export default ViewEventDialog

