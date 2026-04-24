'use client'

import { getAppealsAndChallenges } from "../services/api/sessions"
import AppealsAndChallengesItem from "./AppealsAndChallengesItem"
import useSWR from 'swr'
import { useTranslations } from '@/hooks/useTranslations'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

function AppealsAndChallenges() {
    const { t } = useTranslations()
    const { data, error, isLoading } = useSWR('appeals-challenges', getAppealsAndChallenges)

    if (isLoading) {
        return (
            <Card className="flex flex-col h-full bg-white dark:bg-gray-900 border-none shadow-sm hover:shadow-md transition-shadow">
                <CardHeader className="bg-gradient-to-r from-purple-50/50 to-purple-100/50 dark:from-purple-900/10 dark:to-purple-800/10 border-b border-purple-100 dark:border-purple-900/30 pb-4">
                    <CardTitle className="text-purple-900 dark:text-purple-100 text-lg flex items-center justify-between">
                        {t('home.appealAndCassationSessions')}
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
                <CardHeader className="bg-gradient-to-r from-purple-50/50 to-purple-100/50 dark:from-purple-900/10 dark:to-purple-800/10 border-b border-purple-100 dark:border-purple-900/30 pb-4">
                    <CardTitle className="text-purple-900 dark:text-purple-100 text-lg flex items-center justify-between">
                        {t('home.appealAndCassationSessions')}
                    </CardTitle>
                </CardHeader>
                <CardContent className="flex-1 p-4 flex items-center justify-center">
                    <div className="text-center text-red-500 dark:text-red-400">{t('home.errorLoadingData')}</div>
                </CardContent>
            </Card>
        )
    }

    const sessions = data?.success ? data.data : []

    return (
        <Card className="flex flex-col h-full bg-white dark:bg-gray-900 border-none shadow-sm hover:shadow-md transition-shadow overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-purple-50/50 to-purple-100/50 dark:from-purple-900/10 dark:to-purple-800/10 border-b border-purple-100 dark:border-purple-900/30 pb-4">
                <CardTitle className="text-purple-900 dark:text-purple-100 text-lg flex items-center justify-between">
                    <span>{t('home.appealAndCassationSessions')}</span>
                    {sessions.length > 0 && (
                        <span className="relative inline-flex items-center justify-center px-2.5 py-0.5 text-xs font-medium bg-purple-500 text-white rounded-full">
                            <span className="absolute inset-0 rounded-full bg-purple-500 animate-ping opacity-75"></span>
                            <span className="relative">{sessions.length}</span>
                        </span>
                    )}
                </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 p-4 overflow-y-auto max-h-[600px] space-y-3 bg-gray-50/50 dark:bg-gray-800/20">
                {sessions.length === 0 ? (
                    <div className="flex items-center justify-center h-full min-h-[200px] text-center text-gray-500 dark:text-gray-400 py-4">
                        {t('home.noAppealOrCassationSessions')}
                    </div>
                ) : (
                    sessions.map((session) => (
                        <AppealsAndChallengesItem 
                            key={session.id}
                            session={session}
                        />
                    ))
                )}
            </CardContent>
        </Card>
    )
}

export default AppealsAndChallenges;
