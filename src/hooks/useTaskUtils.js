import { useMemo } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTranslations } from '@/hooks/useTranslations';
import { format, isPast, isToday, isTomorrow } from 'date-fns';
import { arSA, enUS } from 'date-fns/locale';

export function useTaskUtils() {
  const { language, isRTL } = useLanguage();
  const { t } = useTranslations();

  const PRIORITY_COLORS = {
    low: 'bg-green-100 text-green-800 border-green-200 hover:bg-green-100',
    medium: 'bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-100',
    normal: 'bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-100',
    high: 'bg-yellow-100 text-yellow-800 border-yellow-200 hover:bg-yellow-100',
    urgent: 'bg-red-100 text-red-800 border-red-200 hover:bg-red-100'
  };

  const STATUS_COLORS = {
    completed: 'bg-green-100 text-green-800 border-green-200 hover:bg-green-100',
    in_progress: 'bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-100',
    pending: 'bg-yellow-100 text-yellow-800 border-yellow-200 hover:bg-yellow-100',
    cancelled: 'bg-red-100 text-red-800 border-red-200 hover:bg-red-100'
  };

  const PRIORITY_LABELS = {
    urgent: 'tasks.priorityUrgent',
    high: 'tasks.priorityHigh',
    normal: 'tasks.priorityNormal'
  };

  const STATUS_LABELS = {
    pending: 'tasks.statusPending',
    in_progress: 'tasks.statusInProgress',
    completed: 'tasks.statusCompleted',
    cancelled: 'tasks.statusCancel'
  };

  const getPriorityBadgeColor = (priority) => PRIORITY_COLORS[priority] || 'outline';
  
  const getStatusBadgeColor = (status) => STATUS_COLORS[status] || 'outline';

  const getPriorityLabel = (priority) => {
    const key = PRIORITY_LABELS[priority];
    return key ? t(key) : priority;
  };

  const getStatusLabel = (status) => {
    const key = STATUS_LABELS[status];
    return key ? t(key) : status;
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    const locale = language === 'ar' ? arSA : enUS;

    if (isToday(date)) return t('common.today');
    if (isTomorrow(date)) return t('common.tomorrow');

    return format(date, 'PPP', { locale });
  };

  const isOverdue = (dateString, status) => {
    if (!dateString || status === 'completed' || status === 'cancelled') return false;
    const date = new Date(dateString);
    return isPast(date) && !isToday(date);
  };

  return {
    getPriorityBadgeColor,
    getStatusBadgeColor,
    getPriorityLabel,
    getStatusLabel,
    formatDate,
    isOverdue,
    isRTL,
    t
  };
}
