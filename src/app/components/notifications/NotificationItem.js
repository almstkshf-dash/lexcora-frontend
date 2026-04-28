"use client"

import React, { useMemo } from 'react'
import { useTranslations } from '@/hooks/useTranslations'
import { Check, Trash2, Clock, MoreHorizontal } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { getTypeIcon, getRelatedIcon, formatTimeAgo } from './utils'
import { cn } from '@/lib/utils'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const NotificationItem = React.memo(function NotificationItem({ 
  notification, 
  isArabic, 
  onMarkAsRead, 
  onDelete 
}) {
  const t = useTranslations();
  const timeAgo = useMemo(() => formatTimeAgo(notification.created_at, isArabic), [notification.created_at, isArabic]);

  return (
    <div
      className={cn(
        "group relative p-4 transition-all duration-200 border-b border-border/50",
        !notification.is_read 
          ? "bg-primary/5 hover:bg-primary/10 border-r-4 border-r-primary shadow-sm" 
          : "hover:bg-accent/50"
      )}
    >
      <div className="flex items-start gap-4">
        {/* Icon with status-specific background */}
        <div className={cn(
          "flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center transition-transform group-hover:scale-110 duration-200",
          !notification.is_read ? "bg-primary/20" : "bg-muted"
        )}>
          {getTypeIcon(notification.type)}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 mb-1">
            <h4 className={cn(
              "text-sm font-semibold truncate transition-colors",
              !notification.is_read ? "text-foreground" : "text-muted-foreground group-hover:text-foreground"
            )}>
              {notification.title}
            </h4>
            
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              {!notification.is_read && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={(e) => {
                    e.stopPropagation();
                    onMarkAsRead(notification.id);
                  }}
                  className="h-7 w-7 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-950/30"
                  title={t('notifications.markAsRead')}
                >
                  <Check className="h-4 w-4" />
                </Button>
              )}
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-7 w-7">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align={isArabic ? "start" : "end"}>
                  <DropdownMenuItem 
                    className="text-destructive focus:text-destructive"
                    onClick={() => onDelete(notification.id)}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    <span>{t('buttons.delete')}</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
          
          <p className={cn(
            "text-xs leading-relaxed mb-3 line-clamp-2",
            !notification.is_read ? "text-foreground/80" : "text-muted-foreground"
          )}>
            {notification.message}
          </p>
          
          <div className="flex items-center justify-between text-[10px] sm:text-xs text-muted-foreground">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-muted/50">
                <Clock className="h-3 w-3" />
                <span>{timeAgo}</span>
              </div>
              
              {notification.related_type !== 'none' && (
                <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">
                  {getRelatedIcon(notification.related_type)}
                  <span className="capitalize">{notification.related_type}</span>
                </div>
              )}
            </div>
            
            {notification.created_by_name && (
              <span className="font-medium bg-muted/30 px-2 py-0.5 rounded-full">
                {t('notifications.by')} {notification.created_by_name}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  )
})

export default NotificationItem
