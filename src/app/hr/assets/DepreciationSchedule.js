"use client"

import { format } from 'date-fns'
import { useTranslations } from "@/hooks/useTranslations"
import { useLanguage } from "@/contexts/LanguageContext"
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  TableCaption,
} from '@/components/ui/table'

const DepreciationSchedule = ({ schedule }) => {
  const { t } = useTranslations()
  const { language } = useLanguage()
  const isArabic = language === 'ar'

  if (!schedule || schedule.length === 0) {
    return null
  }

  return (
    <div className="mt-4">
      <Table className="border" dir={isArabic ? 'rtl' : 'ltr'}>
        <TableCaption>{t('assets.scheduleCaption', { count: schedule.length })}</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead className={isArabic ? 'text-right' : 'text-left'}>{t('assets.period')}</TableHead>
            <TableHead className={isArabic ? 'text-right' : 'text-left'}>{t('assets.purchaseDate')}</TableHead>
            <TableHead className={isArabic ? 'text-right' : 'text-left'}>{t('assets.depreciation')}</TableHead>
            <TableHead className={isArabic ? 'text-right' : 'text-left'}>{t('assets.totalDepreciation')}</TableHead>
            <TableHead className={isArabic ? 'text-right' : 'text-left'}>{t('assets.bookValue')}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {schedule.map((row) => {
            const dateObj = row.date ? new Date(row.date) : null;
            const isValidDate = dateObj && !isNaN(dateObj.getTime());
            return (
              <TableRow key={row.period}>
                <TableCell>{row.period}</TableCell>
                <TableCell>{isValidDate ? format(dateObj, 'yyyy-MM-dd') : '-'}</TableCell>
                <TableCell>{row.depreciation.toLocaleString(undefined, { minimumFractionDigits: 2 })}</TableCell>
                <TableCell>{row.totalDepreciation.toLocaleString(undefined, { minimumFractionDigits: 2 })}</TableCell>
                <TableCell>{row.bookValue.toLocaleString(undefined, { minimumFractionDigits: 2 })}</TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  )
}

export default DepreciationSchedule

