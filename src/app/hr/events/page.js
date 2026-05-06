"use client"

import React, { useState } from 'react'
import useSWR from 'swr'
import { useTranslations } from "@/hooks/useTranslations"
import { useLanguage } from "@/contexts/LanguageContext"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Plus, 
  TableIcon,
  Calendar as CalendarIcon
} from 'lucide-react'
import ExportButtons from '@/components/ui/export-buttons'
import { getEvents } from '@/app/services/api/events'
import AddEventModal from './AddEventModal'
import EditEventModal from './EditEventModal'
import ViewEventDialog from './ViewEventDialog'
import DeleteEventDialog from './DeleteEventDialog'
import EventsTable from './EventsTable'
import EventsCalendar from './EventsCalendar'

function EventsPage() {
  const { t } = useTranslations()
  const { language } = useLanguage()
  const isArabic = language === 'ar'

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState(null)
  const [activeTab, setActiveTab] = useState('table')

  // Fetch events
  const { data: events, isLoading, mutate } = useSWR('events', getEvents)

  const handleCreate = () => {
    setSelectedEvent(null)
    setIsCreateModalOpen(true)
  }

  const handleView = (event) => {
    setSelectedEvent(event)
    setIsViewDialogOpen(true)
  }

  const handleEdit = (event) => {
    setSelectedEvent(event)
    setIsEditModalOpen(true)
  }

  const handleDelete = (event) => {
    setSelectedEvent(event)
    setIsDeleteDialogOpen(true)
  }

  const handleSuccess = () => {
    mutate()
  }

  // Column configuration for export
  const eventsColumnConfig = {
    id: {
      ar: 'المعرف',
      en: 'ID',
      dataKey: 'id'
    },
    title: {
      ar: 'العنوان',
      en: 'Title',
      dataKey: 'title'
    },
    description: {
      ar: 'الوصف',
      en: 'Description',
      dataKey: 'description'
    },
    date: {
      ar: 'التاريخ',
      en: 'Date',
      dataKey: 'date',
      type: 'date'
    },
    start_time: {
      ar: 'وقت البداية',
      en: 'Start Time',
      dataKey: 'start_time'
    },
    end_time: {
      ar: 'وقت النهاية',
      en: 'End Time',
      dataKey: 'end_time'
    },
    location: {
      ar: 'المكان',
      en: 'Location',
      dataKey: 'location'
    },
    attendees: {
      ar: 'الحضور',
      en: 'Attendees',
      dataKey: 'attendees'
    },
    status: {
      ar: 'الحالة',
      en: 'Status',
      dataKey: 'status',
      type: 'status',
      statusMap: {
        'scheduled': { ar: 'مجدول', en: 'Scheduled' },
        'completed': { ar: 'مكتمل', en: 'Completed' },
        'cancelled': { ar: 'ملغي', en: 'Cancelled' }
      }
    },
    priority: {
      ar: 'الأولوية',
      en: 'Priority',
      dataKey: 'priority',
      formatter: (value) => {
        const priorityMap = {
          'low': isArabic ? 'منخفض' : 'Low',
          'medium': isArabic ? 'متوسط' : 'Medium',
          'high': isArabic ? 'عالي' : 'High'
        }
        return priorityMap[value] || value
      }
    },
    created_by: {
      ar: 'أنشئ بواسطة',
      en: 'Created By',
      dataKey: 'created_by'
    },
    created_at: {
      ar: 'تاريخ الإنشاء',
      en: 'Created At',
      dataKey: 'created_at',
      type: 'date'
    }
  }

  return (
    <div className="space-y-6">
      <Tabs dir={isArabic ? 'rtl' : 'ltr'} value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="flex items-center justify-between gap-4 mb-6">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="table" className="flex items-center gap-2">
              <TableIcon className="h-4 w-4" />
              {isArabic ? 'جدول' : 'Table'}
            </TabsTrigger>
            <TabsTrigger value="calendar" className="flex items-center gap-2">
              <CalendarIcon className="h-4 w-4" />
              {isArabic ? 'تقويم' : 'Calendar'}
            </TabsTrigger>
          </TabsList>

          <Button onClick={handleCreate}>
            <Plus className="h-4 w-4 me-2" />
            {isArabic ? 'إضافة حدث' : 'Add Event'}
          </Button>
        </div>

        <TabsContent value="table" className="mt-6">
          {/* Export Buttons */}
          {events && events.length > 0 && !isLoading && (
            <div className="mb-4">
              <ExportButtons
                data={events}
                columnConfig={eventsColumnConfig}
                language={language}
                exportName="hr-events"
                sheetName={language === 'ar' ? 'فعاليات الموارد البشرية' : 'HR Events'}
              />
            </div>
          )}
          
          <EventsTable
            events={events}
            isLoading={isLoading}
            onView={handleView}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onCreate={handleCreate}
          />
        </TabsContent>

        <TabsContent value="calendar" className="mt-6">
          <EventsCalendar
            events={events}
            isLoading={isLoading}
            onSelectEvent={handleView}
          />
        </TabsContent>
      </Tabs>

      {/* Modals */}
      <AddEventModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={handleSuccess}
      />

      <EditEventModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSuccess={handleSuccess}
        event={selectedEvent}
      />

      <ViewEventDialog
        isOpen={isViewDialogOpen}
        onClose={() => setIsViewDialogOpen(false)}
        eventId={selectedEvent?.id}
      />

      <DeleteEventDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onSuccess={handleSuccess}
        event={selectedEvent}
      />
    </div>
  )
}

export default EventsPage
