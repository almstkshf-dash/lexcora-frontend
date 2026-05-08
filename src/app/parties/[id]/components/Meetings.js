'use client'
import React, { useState } from 'react'
import useSWR from 'swr'
import meetingsApi from '@/app/services/api/meetings'
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
// import { useTranslations } from 'next-intl'
import { Calendar, Trash2, Clock, Users, FileText, Plus, Edit, Eye, MapPin } from 'lucide-react'
import { toast } from 'react-toastify'
import { useTranslations } from '@/hooks/useTranslations'
import { AddMeetingModal } from '@/app/meetings/AddMeetingModal'
import { EditMeetingModal } from '@/app/potential-clients/meetings/EditMeetingModal'
import { DeleteMeetingModal } from '@/app/potential-clients/meetings/DeleteMeetingModal'
import MeetingDocumentsModal from '@/app/meetings/MeetingDocumentsModal'
import ViewMeetingDialog from '@/app/meetings/ViewMeetingDialog'

function Meetings({ partyId }) {
  const { t } = useTranslations()
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [selectedMeetingId, setSelectedMeetingId] = useState(null)
  const [selectedMeetingForDelete, setSelectedMeetingForDelete] = useState(null)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [selectedMeetingForView, setSelectedMeetingForView] = useState(null)
  
  const { data, error, isLoading, mutate } = useSWR(
    partyId ? [`/meetings/party/${partyId}`] : null,
    () => meetingsApi.getMeetingsByPartyId(partyId),
    {
      revalidateOnFocus: false,
    }
  )

  const handleEditMeeting = (meetingId) => {
    setSelectedMeetingId(meetingId)
    setIsEditModalOpen(true)
  }

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false)
    setSelectedMeetingId(null)
  }

  const handleEditSuccess = () => {
    mutate()
  }

  const handleDeleteMeeting = (meeting) => {
    setSelectedMeetingForDelete(meeting)
    setIsDeleteModalOpen(true)
  }

  const handleCloseDeleteModal = () => {
    setIsDeleteModalOpen(false)
    setSelectedMeetingForDelete(null)
  }

  const handleDeleteSuccess = () => {
    mutate()
  }

  const handleViewMeeting = (meetingId) => {
    setSelectedMeetingForView(meetingId)
    setIsViewModalOpen(true)
  }

  const handleCloseViewModal = () => {
    setIsViewModalOpen(false)
    setSelectedMeetingForView(null)
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
          <p className="text-destructive">{t('meetings.messages.error')}</p>
        </div>
      </div>
    )
  }

  const meetings = Array.isArray(data?.data) ? data.data : []

  const formatDate = (dateString) => {
    if (!dateString) return '-'
    return new Date(dateString).toLocaleDateString('ar-AE', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    })
  }

  const formatTime = (timeString) => {
    if (!timeString) return '-'
    return timeString.substring(0, 5) // Extract HH:MM
  }

  const getResultBadge = (result) => {
    const resultMap = {
      'successful': { label: t('meetings.results.completed'), color: 'bg-green-100 text-green-800' },
      'failed': { label: t('meetings.results.cancelled'), color: 'bg-red-100 text-red-800' },
      'pending': { label: t('meetings.results.scheduled'), color: 'bg-yellow-100 text-yellow-800' },
      'cancelled': { label: t('meetings.results.cancelled'), color: 'bg-gray-100 text-gray-800' },
    }
    const resultInfo = resultMap[result] || resultMap['pending']
    return <Badge className={resultInfo.color}>{resultInfo.label}</Badge>
  }

  const getTypeBadge = (type) => {
    const typeMap = {
      'consultation': { label: t('potentialClientsPage.consultationType.legal'), color: 'bg-purple-100 text-purple-800' },
      'negotiation': { label: t('meetings.types.onsite'), color: 'bg-blue-100 text-blue-800' },
      'follow_up': { label: t('meetings.types.online'), color: 'bg-cyan-100 text-cyan-800' },
      'initial': { label: t('meetings.results.scheduled'), color: 'bg-indigo-100 text-indigo-800' },
      'other': { label: t('parties.other'), color: 'bg-gray-100 text-gray-800' },
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
              <Users className="h-5 w-5" />
              {t('partyTabs.meetings')} ({meetings.length})
            </CardTitle>
            <Button 
              onClick={() => setIsAddModalOpen(true)}
              size="sm"
              className="gap-2"
            >
              <Plus className="h-4 w-4" />
              {t('meetings.addMeeting') || 'إضافة اجتماع'}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
        {meetings.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>{t('meetings.messages.noResults')}</p>
          </div>
        ) : (
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead className="text-right font-semibold">{t('meetings.table.type')}</TableHead>
                  <TableHead className="text-right font-semibold">{t('meetings.table.date')}</TableHead>
                  <TableHead className="text-right font-semibold">{t('meetings.table.time')}</TableHead>
                  <TableHead className="text-right font-semibold">{t('meetings.table.address')}</TableHead>
                  <TableHead className="text-right font-semibold">{t('meetings.table.attendees')}</TableHead>
                  <TableHead className="text-right font-semibold">{t('meetings.table.status')}</TableHead>
                  <TableHead className="text-right font-semibold">{t('meetings.table.notes')}</TableHead>
                  <TableHead className="text-center font-semibold">{t('common.actions')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {meetings.map((meeting) => (
                  <TableRow key={meeting.id}>
                    <TableCell>{getTypeBadge(meeting.meeting_type)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        {formatDate(meeting.date)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        {formatTime(meeting.start_time)} - {formatTime(meeting.end_time)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        {meeting.address || '-'}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <Badge variant="secondary">
                          {meeting.attendees_count || 0}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>{getResultBadge(meeting.meet_result)}</TableCell>
                    <TableCell className="max-w-xs truncate">{meeting.note || '-'}</TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleViewMeeting(meeting.id)}
                          title={t('meetings.actions.view')}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <MeetingDocumentsModal 
                          meetingId={meeting.id}
                          meetingTitle={`${t('meetings.title')} - ${formatDate(meeting.date)}`}
                        >
                          <Button
                            variant="ghost"
                            size="icon"
                            title={t('meetings.actions.documents')}
                          >
                            <FileText className="h-4 w-4" />
                          </Button>
                        </MeetingDocumentsModal>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEditMeeting(meeting.id)}
                          title={t('meetings.actions.edit')}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteMeeting(meeting)}
                          title={t('meetings.actions.delete')}
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

    {/* Add Meeting Modal */}
    <AddMeetingModal
      isOpen={isAddModalOpen}
      onClose={() => setIsAddModalOpen(false)}
      onSuccess={handleAddSuccess}
      partyId={partyId}
    />

    {/* Edit Meeting Modal */}
    <EditMeetingModal 
      isOpen={isEditModalOpen}
      onClose={handleCloseEditModal}
      meetingId={selectedMeetingId}
      onSuccess={handleEditSuccess}
    />

    {/* Delete Meeting Modal */}
    <DeleteMeetingModal 
      isOpen={isDeleteModalOpen}
      onClose={handleCloseDeleteModal}
      meetingId={selectedMeetingForDelete?.id}
      meetingTitle={selectedMeetingForDelete ? `${t('meetings.title')} - ${formatDate(selectedMeetingForDelete.date)}` : ''}
      onSuccess={handleDeleteSuccess}
    />

    {/* View Meeting Dialog */}
    <ViewMeetingDialog
      isOpen={isViewModalOpen}
      onClose={handleCloseViewModal}
      meetingId={selectedMeetingForView}
    />
  </>
  )
}

export default Meetings
