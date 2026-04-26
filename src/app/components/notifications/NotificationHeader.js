"use client"

import React from 'react'
import { CheckCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { FILTER_OPTIONS } from './constants'
import { cn } from '@/lib/utils'

const NotificationHeader = React.memo(function NotificationHeader({ 
  isArabic, 
  unreadCount, 
  filter, 
  onFilterChange, 
  onMarkAllAsRead 
}) {
  const getFilterLabel = (filterOption) => {
    if (isArabic) {
      switch (filterOption) {
        case 'all': return 'الكل'
        case 'unread': return 'غير مقروء'
        case 'read': return 'مقروء'
        default: return filterOption
      }
    } else {
      return filterOption.charAt(0).toUpperCase() + filterOption.slice(1)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <CardTitle className="text-xl font-bold tracking-tight text-foreground">
            {isArabic ? 'مركز التنبيهات' : 'Notifications'}
          </CardTitle>
          {unreadCount > 0 && (
            <Badge 
              variant="secondary" 
              className="rounded-full px-2 py-0 h-5 min-w-[20px] flex items-center justify-center text-[10px] font-bold bg-primary/10 text-primary border-none"
            >
              {unreadCount}
            </Badge>
          )}
        </div>
        
        {unreadCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onMarkAllAsRead}
            className="text-[11px] h-7 px-2 text-primary hover:bg-primary/10 transition-colors font-medium"
          >
            <CheckCheck className="h-3.5 w-3.5 mr-1.5 ml-1.5" />
            {isArabic ? 'قراءة الكل' : 'Mark all read'}
          </Button>
        )}
      </div>
      
      {/* Filter Tabs - Right aligned in RTL */}
      <div className="flex justify-start">
        <div className="flex items-center gap-1 p-1 bg-slate-200/50 dark:bg-slate-800/50 rounded-xl border border-slate-200/50 dark:border-slate-700/50">
          {FILTER_OPTIONS.map((filterOption) => {
            const isActive = filter === filterOption;
            return (
              <Button
                key={filterOption}
                variant="ghost"
                size="sm"
                onClick={() => onFilterChange(filterOption)}
                className={cn(
                  "text-xs h-8 px-4 rounded-lg transition-all duration-300",
                  isActive 
                    ? "bg-white dark:bg-slate-900 text-foreground shadow-md font-bold scale-[1.02]" 
                    : "text-muted-foreground hover:text-foreground hover:bg-white/50 dark:hover:bg-slate-700/50"
                )}
              >
                {getFilterLabel(filterOption)}
              </Button>
            )
          })}
        </div>
      </div>
    </div>
  )
})

export default NotificationHeader
