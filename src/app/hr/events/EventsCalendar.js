"use client"

import React, { useMemo } from 'react'
import { Calendar, momentLocalizer } from 'react-big-calendar'
import moment from 'moment'
import 'react-big-calendar/lib/css/react-big-calendar.css'
import { useLanguage } from "@/contexts/LanguageContext"
import { Badge } from "@/components/ui/badge"
import { MapPin, Clock, Users } from 'lucide-react'

// Setup the localizer for react-big-calendar
const localizer = momentLocalizer(moment)

function EventsCalendar({ events, isLoading, onSelectEvent }) {
  const { language } = useLanguage()
  const isArabic = language === 'ar'

  // Configure moment locale
  useMemo(() => {
    if (isArabic) {
      moment.locale('ar')
    } else {
      moment.locale('en')
    }
  }, [isArabic])

  // Transform events data for react-big-calendar
  const calendarEvents = useMemo(() => {
    if (!events || events.length === 0) return []

    return events.map(event => {
      const eventDate = new Date(event.event_date)
      
      // Parse start and end times if available
      let startDateTime = new Date(eventDate)
      let endDateTime = new Date(eventDate)

      if (event.start_time) {
        const [startHours, startMinutes] = event.start_time.split(':')
        startDateTime.setHours(parseInt(startHours), parseInt(startMinutes))
      }

      if (event.end_time) {
        const [endHours, endMinutes] = event.end_time.split(':')
        endDateTime.setHours(parseInt(endHours), parseInt(endMinutes))
      } else {
        // If no end time, make it 1 hour after start
        endDateTime = new Date(startDateTime.getTime() + 60 * 60 * 1000)
      }

      return {
        id: event.id,
        title: event.title,
        start: startDateTime,
        end: endDateTime,
        resource: event // Store original event data
      }
    })
  }, [events])

  // Custom event style
  const eventStyleGetter = (event) => {
    return {
      style: {
        backgroundColor: '#3b82f6',
        borderRadius: '6px',
        opacity: 0.9,
        color: 'white',
        border: 'none',
        display: 'block',
        padding: '4px 8px',
        fontSize: '14px',
        cursor: 'pointer'
      }
    }
  }

  // Custom event component
  const EventComponent = ({ event }) => {
    return (
      <div className="flex flex-col gap-0.5">
        <strong className="text-sm truncate">{event.title}</strong>
        {event.resource.place && (
          <div className="flex items-center gap-1 text-xs opacity-90">
            <MapPin className="h-3 w-3" />
            <span className="truncate">{event.resource.place}</span>
          </div>
        )}
      </div>
    )
  }

  // Localization messages
  const messages = {
    allDay: isArabic ? 'طوال اليوم' : 'All Day',
    previous: isArabic ? 'السابق' : 'Previous',
    next: isArabic ? 'التالي' : 'Next',
    today: isArabic ? 'اليوم' : 'Today',
    month: isArabic ? 'شهر' : 'Month',
    week: isArabic ? 'أسبوع' : 'Week',
    day: isArabic ? 'يوم' : 'Day',
    agenda: isArabic ? 'جدول الأعمال' : 'Agenda',
    date: isArabic ? 'التاريخ' : 'Date',
    time: isArabic ? 'الوقت' : 'Time',
    event: isArabic ? 'حدث' : 'Event',
    noEventsInRange: isArabic ? 'لا توجد أحداث في هذا النطاق' : 'No events in this range',
    showMore: (total) => isArabic ? `+${total} المزيد` : `+${total} more`
  }

  if (isLoading) {
    return (
      <div className="bg-card rounded-sg border shadow-sm p-8 flex items-center justify-center h-[600px]">
        <div className="text-muted-foreground">
          {isArabic ? 'جاري التحميل...' : 'Loading...'}
        </div>
      </div>
    )
  }

  return (
    <div className="bg-card rounded-sg border shadow-sm p-4" style={{ minHeight: '600px' }}>
      <Calendar
        localizer={localizer}
        events={calendarEvents}
        startAccessor="start"
        endAccessor="end"
        style={{ height: '100%', minHeight: '550px' }}
        onSelectEvent={(event) => onSelectEvent(event.resource)}
        eventPropGetter={eventStyleGetter}
        messages={messages}
        components={{
          event: EventComponent
        }}
        rtl={isArabic}
        views={['month', 'week', 'day', 'agenda']}
        defaultView="month"
        popup={true}
        selectable={true}
        toolbar={true}
      />
    </div>
  )
}

export default EventsCalendar

