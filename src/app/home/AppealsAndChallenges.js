'use client'

import { getAppealsAndChallenges } from "../services/api/sessions"
import AppealsAndChallengesItem from "./AppealsAndChallengesItem"
import DashboardWidgetCard from "./DashboardWidgetCard"
import useSWR from 'swr'
import { useTranslations } from '@/hooks/useTranslations'

const SWR_OPTIONS = { revalidateOnFocus: false, errorRetryCount: 2 }

function AppealsAndChallenges() {
  const { t } = useTranslations()
  const { data, error, isLoading } = useSWR('appeals-challenges', getAppealsAndChallenges, SWR_OPTIONS)

  const sessions = data?.success && Array.isArray(data.data) ? data.data : []

  return (
    <DashboardWidgetCard
      theme="purple"
      title={t('home.appealAndCassationSessions')}
      count={sessions.length}
      badgeAriaLabel={`${sessions.length} ${t('home.appealAndCassationSessions')}`}
      isLoading={isLoading}
      error={error}
      errorMessage={t('home.errorLoadingData')}
      isEmpty={sessions.length === 0}
      emptyMessage={t('home.noAppealOrCassationSessions')}
    >
      {sessions.map((session) => (
        <AppealsAndChallengesItem key={session.id} session={session} />
      ))}
    </DashboardWidgetCard>
  )
}

export default AppealsAndChallenges
