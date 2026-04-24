"use client"

import React from 'react'
import { Check, Trash2, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { getTypeIcon, getRelatedIcon, formatTimeAgo } from './utils'

const NotificationItem = React.memo(function NotificationItem({ 
  notification, 
  isArabic, 
  onMarkAsRead, 
  onDelete 
}) {
  return (
    <div
      className={`p-3 hover:bg-gray-50 dark:hover:bg-gray-800 border-b border-gray-100 dark:border-gray-700 ${
        !notification.is_read ? 'bg-blue-50 dark:bg-blue-950/50 border-l-2 border-l-blue-500 dark:border-l-blue-400' : ''
      }`}
    >
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 mt-1">
          {getTypeIcon(notification.type)}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between mb-1">
            <h4 className="text-sm font-medium truncate dark:text-gray-100">
              {notification.title}
            </h4>
            <div className="flex items-center gap-1 ml-2">
              {!notification.is_read && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onMarkAsRead(notification.id)}
                  className="h-6 w-6 p-0"
                  title={isArabic ? 'وضع علامة كمقروء' : 'Mark as read'}
                >
                  <Check className="h-3 w-3" />
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDelete(notification.id)}
                className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                title={isArabic ? 'حذف' : 'Delete'}
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          </div>
          
          <p className="text-xs text-gray-600 dark:text-gray-400 mb-2 line-clamp-2">
            {notification.message}
          </p>
          
          <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
            <div className="flex items-center gap-2">
              <Clock className="h-3 w-3" />
              <span>{formatTimeAgo(notification.created_at, isArabic)}</span>
              {notification.related_type !== 'none' && (
                <div className="flex items-center gap-1">
                  {getRelatedIcon(notification.related_type)}
                  <span className="capitalize">{notification.related_type}</span>
                </div>
              )}
            </div>
            {notification.created_by_name && (
              <span className="text-xs text-gray-400 dark:text-gray-500">
                {isArabic ? 'بواسطة' : 'by'} {notification.created_by_name}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  )
})

export default NotificationItem
