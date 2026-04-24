'use client'

import useSWR from 'swr'
import { casePetitions } from "../services/api/CasePetitions"
import CasePetitionsItem from "./CasePetitionsItem"
import { useTranslations } from '@/hooks/useTranslations'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

function CasePetitions() {
    const { t } = useTranslations()
    const { data, error, isLoading } = useSWR('case-petitions', casePetitions)

    if (isLoading) {
        return (
            <Card className="flex flex-col h-full bg-white dark:bg-gray-900 border-none shadow-sm hover:shadow-md transition-shadow">
                <CardHeader className="bg-gradient-to-r from-amber-50/50 to-amber-100/50 dark:from-amber-900/10 dark:to-amber-800/10 border-b border-amber-100 dark:border-amber-900/30 pb-4">
                    <CardTitle className="text-amber-900 dark:text-amber-100 text-lg flex items-center justify-between">
                        {t('home.newCasePetitions')}
                    </CardTitle>
                </CardHeader>
                <CardContent className="flex-1 p-4 space-y-4">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="space-y-3 p-4 border border-gray-100 dark:border-gray-800 rounded-xl">
                            <Skeleton className="h-4 w-3/4" />
                            <Skeleton className="h-4 w-1/2" />
                            <div className="pt-3 border-t border-gray-100 dark:border-gray-800">
                                <Skeleton className="h-4 w-1/3" />
                            </div>
                        </div>
                    ))}
                </CardContent>
            </Card>
        )
    }

    if (error) {
        return (
            <Card className="flex flex-col h-full bg-white dark:bg-gray-900 border-none shadow-sm hover:shadow-md transition-shadow">
                <CardHeader className="bg-gradient-to-r from-amber-50/50 to-amber-100/50 dark:from-amber-900/10 dark:to-amber-800/10 border-b border-amber-100 dark:border-amber-900/30 pb-4">
                    <CardTitle className="text-amber-900 dark:text-amber-100 text-lg flex items-center justify-between">
                        {t('home.newCasePetitions')}
                    </CardTitle>
                </CardHeader>
                <CardContent className="flex-1 p-4 flex items-center justify-center">
                    <div className="text-center text-red-500 dark:text-red-400">{t('home.errorLoadingData')}</div>
                </CardContent>
            </Card>
        )
    }

    const petitions = data?.success ? data.data : []

    return (
        <Card className="flex flex-col h-full bg-white dark:bg-gray-900 border-none shadow-sm hover:shadow-md transition-shadow overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-amber-50/50 to-amber-100/50 dark:from-amber-900/10 dark:to-amber-800/10 border-b border-amber-100 dark:border-amber-900/30 pb-4">
                <CardTitle className="text-amber-900 dark:text-amber-100 text-lg flex items-center justify-between">
                    <span>{t('home.newCasePetitions')}</span>
                    {petitions.length > 0 && (
                        <span 
                            className="relative inline-flex items-center justify-center px-2.5 py-0.5 text-xs font-medium bg-amber-600 text-white rounded-full"
                            aria-label={`${petitions.length} ${t('home.newCasePetitions')}`}
                        >
                            <span className="absolute inset-0 rounded-full bg-amber-500 animate-ping opacity-75" aria-hidden="true"></span>
                            <span className="relative" aria-hidden="true">{petitions.length}</span>
                        </span>
                    )}
                </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 p-4 overflow-y-auto max-h-[600px] space-y-3 bg-gray-50/50 dark:bg-gray-800/20">
                {petitions.length === 0 ? (
                    <div className="flex items-center justify-center h-full min-h-[200px] text-center text-gray-500 dark:text-gray-400 py-4">
                        {t('home.noNewCasePetitions')}
                    </div>
                ) : (
                    petitions.map((petition) => (
                        <CasePetitionsItem
                            key={petition.id}
                            petition={petition}
                        />
                    ))
                )}
            </CardContent>
        </Card>
    )
}

export default CasePetitions