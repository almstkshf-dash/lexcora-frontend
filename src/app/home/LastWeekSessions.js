'use client'

import LastWeekSessionsItem from "./LastWeekSessionsItem"
import DashboardWidgetCard from "./DashboardWidgetCard"
import useSWR from 'swr'
import { getSessionsThisWeek } from '../services/api/sessions'
import { useTranslations } from '@/hooks/useTranslations'

const SWR_OPTIONS = { revalidateOnFocus: false, errorRetryCount: 2 }

function LastWeekSessions() {
  const { t } = useTranslations()
  const { data, error, isLoading } = useSWR('sessions-this-week', getSessionsThisWeek, SWR_OPTIONS)

  const sessions = data?.success ? data.data : []

  return (
    <DashboardWidgetCard
      theme="blue"
      title={t('home.weekSessions')}
      count={sessions.length}
      badgeAriaLabel={`${sessions.length} ${t('home.weekSessions')}`}
      isLoading={isLoading}
      error={error}
      errorMessage={t('home.errorLoadingData')}
      isEmpty={sessions.length === 0}
      emptyMessage={t('home.noSessionsThisWeek')}
    >
      {sessions.map((session) => (
        <LastWeekSessionsItem key={session.id} session={session} />
      ))}
    </DashboardWidgetCard>
  )
}

export default LastWeekSessions