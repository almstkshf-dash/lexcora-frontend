"use client"

import React from 'react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import NotificationHeader from './NotificationHeader'
import NotificationItem from './NotificationItem'
import NotificationEmpty from './NotificationEmpty'

function NotificationList({ 
  isArabic, 
  unreadCount, 
  filter, 
  onFilterChange, 
  onMarkAllAsRead, 
  notifications, 
  handleMarkAsRead, 
  handleDelete,
  onClose
}) {
  return (
    <Card className="border-0 shadow-none bg-transparent">
      <CardHeader className="p-6 pb-5 bg-slate-50/50 dark:bg-slate-900/30 border-b border-border/50">
        <NotificationHeader
          isArabic={isArabic}
          unreadCount={unreadCount}
          filter={filter}
          onFilterChange={onFilterChange}
          onMarkAllAsRead={onMarkAllAsRead}
        />
      </CardHeader>

      <CardContent dir={isArabic ? 'rtl' : 'ltr'} className="p-0">
        <ScrollArea dir={isArabic ? 'rtl' : 'ltr'} className="h-[450px]">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full py-20 px-6 opacity-60">
               <NotificationEmpty isArabic={isArabic} />
            </div>
          ) : (
            <div className="divide-y divide-border/30">
              {notifications.map((notification) => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  isArabic={isArabic}
                  onMarkAsRead={handleMarkAsRead}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
      
      {notifications.length > 0 && (
        <div className="p-2 border-t border-border/50 bg-muted/20">
          <button
            type="button"
            className="w-full py-2 text-xs font-medium hover:text-primary transition-colors rounded-md hover:bg-primary/5"
            onClick={onClose}
          >
            {isArabic ? 'إغلاق' : 'Close'}
          </button>
        </div>
      )}
    </Card>
  )
}

export default NotificationList
