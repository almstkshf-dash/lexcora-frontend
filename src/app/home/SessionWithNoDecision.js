'use client'

import SessionWithNoDecisionItem from "./SessionWithNoDecisionItem"
import DashboardWidgetCard from "./DashboardWidgetCard"
import useSWR from 'swr'
import { getSessionsNoDecision } from '../services/api/sessions'
import { useTranslations } from '@/hooks/useTranslations'

const SWR_OPTIONS = { revalidateOnFocus: false, errorRetryCount: 2 }

function SessionWithNoDecision() {
  const { t } = useTranslations()
  const { data, error, isLoading } = useSWR('sessions-no-decision', getSessionsNoDecision, SWR_OPTIONS)

  const sessions = data?.success ? data.data : []

  return (
    <DashboardWidgetCard
      theme="orange"
      title={t('home.delayedDecisions')}
      count={sessions.length}
      badgeAriaLabel={`${sessions.length} ${t('home.delayedDecisions')}`}
      isLoading={isLoading}
      error={error}
      errorMessage={t('home.errorLoadingData')}
      isEmpty={sessions.length === 0}
      emptyMessage={t('home.noDelayedDecisions')}
    >
      {sessions.map((session) => (
        <SessionWithNoDecisionItem key={session.id} session={session} />
      ))}
    </DashboardWidgetCard>
  )
}

export default SessionWithNoDecision