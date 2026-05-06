"use client"

import React, { useState, useCallback, useTransition, useEffect, useRef, lazy, Suspense } from 'react'
import { Bell } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useLanguage } from '@/contexts/LanguageContext'
import { cn } from '@/lib/utils'
import { 
  getAppNotifications, 
  getUnreadCount, 
  markAsRead, 
  markAllAsRead, 
  deleteNotification 
} from '@/app/services/api/appNotifications'
import useSWR from 'swr'
import { REFRESH_INTERVALS, FETCH_LIMITS } from './constants'
import { playNotificationSound } from './utils'

// Lazy-load the heavy list component so it doesn't block the initial main thread
// when the dropdown opens.
const NotificationList = lazy(() => import('./NotificationList'))

function NotificationMenu() {
  const { language } = useLanguage()
  const isArabic = language === 'ar'
  
  const [isOpen, setIsOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [filter, setFilter] = useState('all')
  const prevUnreadCountRef = useRef(0)

  const handleOpenChange = useCallback((open) => {
    // startTransition keeps the click/open interaction instant
    // while React handles the potentially expensive re-render at lower priority.
    startTransition(() => {
      setIsOpen(open)
    })
  }, [])

  const handleFilterChange = useCallback((newFilter) => {
    setFilter(newFilter)
  }, [])

  // Fetch notifications
  const { data: notificationsData, mutate } = useSWR(
    ['app-notifications', filter],
    () => getAppNotifications({
      limit: FETCH_LIMITS.DEFAULT,
      is_read: filter === 'all' ? undefined : filter === 'unread' ? false : true
    }),
    {
      refreshInterval: REFRESH_INTERVALS.NOTIFICATIONS,
      revalidateOnFocus: true
    }
  )

  // Fetch unread count
  const { data: unreadData, mutate: mutateUnreadCount } = useSWR(
    'unread-count',
    getUnreadCount,
    {
      refreshInterval: REFRESH_INTERVALS.UNREAD_COUNT,
      revalidateOnFocus: true
    }
  )

  const notifications = notificationsData?.data?.notifications || []
  const unreadCount = unreadData?.data?.unread_count || 0

  // Handle sound alert on new notifications
  useEffect(() => {
    if (unreadCount > prevUnreadCountRef.current) {
      playNotificationSound()
    }
    prevUnreadCountRef.current = unreadCount
  }, [unreadCount])

  const handleMarkAsRead = useCallback(async (notificationId) => {
    try {
      await markAsRead(notificationId)
      mutate()
      mutateUnreadCount()
    } catch (error) {
      console.error('Error marking as read:', error)
    }
  }, [mutate, mutateUnreadCount])

  const handleMarkAllAsRead = useCallback(async () => {
    try {
      await markAllAsRead()
      mutate()
      mutateUnreadCount()
    } catch (error) {
      console.error('Error marking all as read:', error)
    }
  }, [mutate, mutateUnreadCount])

  const handleDelete = useCallback(async (notificationId) => {
    try {
      await deleteNotification(notificationId)
      mutate()
      mutateUnreadCount()
    } catch (error) {
      console.error('Error deleting notification:', error)
    }
  }, [mutate, mutateUnreadCount])

  return (
    <DropdownMenu dir={isArabic ? 'rtl' : 'ltr'} open={isOpen} onOpenChange={handleOpenChange}>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon" 
          className="relative h-10 w-10 rounded-full hover:bg-primary/10 transition-all duration-300 group"
          aria-label={isArabic ? 'التنبيهات' : 'Notifications'}
        >
          <span className="sr-only">{isArabic ? 'التنبيهات' : 'Notifications'}</span>
          <Bell className={cn(
            "h-5 w-5 transition-transform duration-300 group-hover:scale-110", 
            isPending && "opacity-50",
            unreadCount > 0 ? "text-primary animate-wiggle" : "text-muted-foreground"
          )} />
          
          {unreadCount > 0 && (
            <div className="absolute top-1.5 right-1.5 flex items-center justify-center">
              <Badge 
                variant="destructive" 
                className="h-4.5 min-w-[18px] px-1 flex items-center justify-center text-[10px] font-bold border-2 border-background animate-in zoom-in duration-300"
              >
                {unreadCount > 99 ? '99+' : unreadCount}
              </Badge>
              <span className="absolute inset-0 h-full w-full bg-destructive rounded-full animate-ping-slow opacity-40 scale-150" />
            </div>
          )}
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent 
        align={isArabic ? "start" : "end"} 
        className="w-[320px] sm:w-[400px] p-0 overflow-hidden rounded-2xl shadow-2xl border-border/50 bg-background/95 backdrop-blur-xl animate-in fade-in zoom-in-95 duration-200"
        dir={isArabic ? 'rtl' : 'ltr'}
      >
        <Suspense fallback={
          <div className="p-8 flex items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        }>
          {isOpen && (
            <NotificationList
              isArabic={isArabic}
              unreadCount={unreadCount}
              filter={filter}
              onFilterChange={handleFilterChange}
              onMarkAllAsRead={handleMarkAllAsRead}
              notifications={notifications}
              handleMarkAsRead={handleMarkAsRead}
              handleDelete={handleDelete}
              onClose={() => handleOpenChange(false)}
            />
          )}
        </Suspense>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default NotificationMenu