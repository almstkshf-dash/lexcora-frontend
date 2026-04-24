"use client"

import React from 'react'
import { CheckCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { CardTitle } from '@/components/ui/card'
import { FILTER_OPTIONS } from './constants'

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
        case 'unread': return 'غير مقروءة'
        case 'read': return 'مقروءة'
        default: return filterOption
      }
    } else {
      return filterOption.charAt(0).toUpperCase() + filterOption.slice(1)
    }
  }

  return (
    <>
      <div className="flex items-center justify-between">
        <CardTitle className="text-base">
          {isArabic ? 'التنبيهات' : 'Notifications'}
        </CardTitle>
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onMarkAllAsRead}
              className="text-xs"
            >
              <CheckCheck className="h-4 w-4 mr-1" />
              {isArabic ? 'قراءة الكل' : 'Mark all read'}
            </Button>
          )}
        </div>
      </div>
      
      {/* Filter buttons */}
      <div className="flex gap-1 mt-2">
        {FILTER_OPTIONS.map((filterOption) => (
          <Button
            key={filterOption}
            variant={filter === filterOption ? "default" : "ghost"}
            size="sm"
            onClick={() => onFilterChange(filterOption)}
            className="text-xs"
          >
            {getFilterLabel(filterOption)}
          </Button>
        ))}
      </div>
    </>
  )
})

export default NotificationHeader
