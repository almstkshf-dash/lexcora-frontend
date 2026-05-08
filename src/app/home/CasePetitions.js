'use client'

import useSWR from 'swr'
import { casePetitions } from "../services/api/CasePetitions"
import CasePetitionsItem from "./CasePetitionsItem"
import DashboardWidgetCard from "./DashboardWidgetCard"
import { useTranslations } from '@/hooks/useTranslations'

const SWR_OPTIONS = { revalidateOnFocus: false, errorRetryCount: 2 }

function CasePetitions() {
  const { t } = useTranslations()
  const { data, error, isLoading } = useSWR('case-petitions', casePetitions, SWR_OPTIONS)

  const petitions = data?.success && Array.isArray(data.data) ? data.data : []

  return (
    <DashboardWidgetCard
      theme="amber"
      title={t('home.newCasePetitions')}
      count={petitions.length}
      badgeAriaLabel={`${petitions.length} ${t('home.newCasePetitions')}`}
      isLoading={isLoading}
      error={error}
      errorMessage={t('home.errorLoadingData')}
      isEmpty={petitions.length === 0}
      emptyMessage={t('home.noNewCasePetitions')}
    >
      {petitions.map((petition) => (
        <CasePetitionsItem key={petition.id} petition={petition} />
      ))}
    </DashboardWidgetCard>
  )
}

export default CasePetitions