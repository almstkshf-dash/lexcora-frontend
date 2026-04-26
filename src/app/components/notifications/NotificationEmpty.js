"use client"

import React from 'react'
import { BellOff } from 'lucide-react'

const NotificationEmpty = React.memo(function NotificationEmpty({ isArabic }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-6 text-center animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4 transition-transform hover:scale-110 duration-300">
        <BellOff className="h-8 w-8 text-muted-foreground/60" />
      </div>
      <h3 className="text-sm font-semibold text-foreground mb-1">
        {isArabic ? 'لا توجد تنبيهات' : 'No notifications'}
      </h3>
      <p className="text-xs text-muted-foreground max-w-[180px]">
        {isArabic 
          ? 'ستظهر التنبيهات الجديدة هنا فور وصولها' 
          : 'New notifications will appear here as they arrive'}
      </p>
    </div>
  )
})

export default NotificationEmpty
