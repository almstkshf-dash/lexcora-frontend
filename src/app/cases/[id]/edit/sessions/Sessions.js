import React, { useState } from 'react'
import useSWR from 'swr'
import { getCaseSessions, deleteSession } from '@/app/services/api/sessions'
import { useTranslations } from '@/hooks/useTranslations'
import { format } from 'date-fns'
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar, Clock, ExternalLink, FileText, Plus, Eye, Trash2 } from 'lucide-react'
import AddSessionModal from '@/app/cases/modals/AddSessionModal'
import EditSessionModal from '@/app/cases/sessions/EditSessionModal'
import DeleteSessionDialog from '@/app/cases/sessions/DeleteSessionDialog'

function Sessions({ caseId }) {
  const { t } = useTranslations()
  
  const [isAddSessionModalOpen, setIsAddSessionModalOpen] = useState(false)
  const [editingSessionId, setEditingSessionId] = useState(null)
  const [deletingSession, setDeletingSession] = useState(null)
  const [isDeleting, setIsDeleting] = useState(false)
  
  // Fetch sessions using SWR
  const { data: sessionsResponse, error, isLoading, mutate } = useSWR(
    caseId ? `case-sessions-${caseId}` : null,
    () => getCaseSessions(caseId)
  )

  const sessions = Array.isArray(sessionsResponse?.data) ? sessionsResponse.data : []

  const formatDate = (dateString) => {
    if (!dateString) return '-'
    return format(new Date(dateString), 'PPP')
  }

  const formatTime = (dateString) => {
    if (!dateString) return '-'
    return format(new Date(dateString), 'p')
  }

  const getDecisionBadge = (decision) => {
    if (decision === null) {
      return (
        <Badge variant="secondary" className="bg-gray-100 text-gray-600">
          {t('sessions.noDecision')}
        </Badge>
      )
    }
    return (
      <Badge variant={decision ? "success" : "destructive"}>
        {decision ? t('sessions.approved') : t('sessions.rejected')}
      </Badge>
    )
  }

  const getSessionTypeBadge = (isExpertSession) => {
    return isExpertSession ? (
      <Badge variant="outline" className="bg-blue-50 text-blue-600 border-blue-200">
        {t('sessions.expertSession')}
      </Badge>
    ) : null
  }

  const handleDeleteSession = async (sessionId) => {
    setIsDeleting(true)
    try {
      await deleteSession(sessionId)
      mutate() // Refresh the sessions list
      setDeletingSession(null)
    } catch (error) {
      // You might want to show an error toast here
    } finally {
      setIsDeleting(false)
    }
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-red-500">
            <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>{t('sessions.failedToLoad')}</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            <CardTitle>{t('sessions.caseSessions')}</CardTitle>
          </div>
          <Button size="sm" className="gap-2" onClick={() => setIsAddSessionModalOpen(true)}>
            <Plus className="h-4 w-4" />
            {t('sessions.addSession')}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
            <p className="mt-4 text-gray-500">{t('sessions.loading')}</p>
          </div>
        ) : sessions.length === 0 ? (
          <div className="text-center py-8">
            <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="text-gray-500">{t('sessions.noSessions')}</p>
            <Button variant="outline" className="mt-4 gap-2" onClick={() => setIsAddSessionModalOpen(true)}>
              <Plus className="h-4 w-4" />
              {t('sessions.addFirstSession')}
            </Button>
          </div>
        ) : (
          <Table>
            <TableCaption>
              {t('sessions.totalSessions', { count: sessions.length })}
            </TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead>{t('sessions.date')}</TableHead>
                <TableHead>{t('sessions.time')}</TableHead>
                <TableHead>{t('sessions.type')}</TableHead>
                <TableHead>{t('sessions.decision')}</TableHead>
                <TableHead>{t('sessions.link')}</TableHead>
                <TableHead>{t('sessions.note')}</TableHead>
                <TableHead>{t('sessions.actions')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sessions.map((session) => (
                <TableRow key={session.id}>
                  <TableCell className="font-medium">
                    {formatDate(session.session_date)}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 opacity-50" />
                      {formatTime(session.session_date)}
                    </div>
                  </TableCell>
                  <TableCell>
                    {getSessionTypeBadge(session.is_expert_session)}
                  </TableCell>
                  <TableCell>
                    {getDecisionBadge(session.decision)}
                  </TableCell>
                  <TableCell>
                    {session.link ? (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="gap-2"
                        onClick={() => window.open(session.link, '_blank')}
                      >
                        <ExternalLink className="h-4 w-4" />
                        {t('sessions.viewLink')}
                      </Button>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </TableCell>
                  <TableCell className="max-w-xs">
                    {session.note ? (
                      <div className="truncate" title={session.note}>
                        {session.note}
                      </div>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="sm" onClick={() => setEditingSessionId(session.id)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => setDeletingSession(session)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
      <AddSessionModal
        isOpen={isAddSessionModalOpen}
        onClose={() => setIsAddSessionModalOpen(false)}
        caseId={caseId}
        onSessionAdded={() => {
          setIsAddSessionModalOpen(false)
          mutate() // Refresh the sessions list
        }}
      />
      <EditSessionModal
        isOpen={!!editingSessionId}
        onClose={() => setEditingSessionId(null)}
        sessionId={editingSessionId}
      />
      <DeleteSessionDialog
        isOpen={!!deletingSession}
        onClose={() => setDeletingSession(null)}
        session={deletingSession}
        onConfirm={handleDeleteSession}
        isDeleting={isDeleting}
      />
    </Card>
  )
}

export default Sessions