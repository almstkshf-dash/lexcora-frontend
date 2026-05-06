"use client"

import React from 'react'
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Package, Building2, Calendar } from 'lucide-react'

function AssetNotificationsTab({ notifications, isArabic, getStatusIcon, getStatusBadgeVariant, getStatusText }) {
  if (!notifications || notifications.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
        <p>{isArabic ? 'لا توجد تنبيهات للأصول' : 'No asset notifications found'}</p>
      </div>
    )
  }

  // Group notifications by record type
  const groupedByType = notifications.reduce((acc, notification) => {
    const type = notification.record_type || 'unknown'
    if (!acc[type]) {
      acc[type] = []
    }
    acc[type].push(notification)
    return acc
  }, {})

  const getRecordTypeIcon = (recordType) => {
    switch (recordType) {
      case 'office':
        return <Building2 className="h-5 w-5 text-blue-600" />
      case 'resource':
        return <Package className="h-5 w-5 text-green-600" />
      default:
        return <Package className="h-5 w-5 text-gray-600" />
    }
  }

  const getRecordTypeTitle = (recordType, isArabic) => {
    switch (recordType) {
      case 'office':
        return isArabic ? 'المكاتب' : 'Offices'
      case 'resource':
        return isArabic ? 'الموارد' : 'Resources'
      default:
        return isArabic ? 'أخرى' : 'Other'
    }
  }

  return (
    <div className="space-y-6">
      {Object.entries(groupedByType).map(([recordType, typeNotifications]) => (
        <div key={recordType}>
          <div className="flex items-center gap-2 mb-4">
            {getRecordTypeIcon(recordType)}
            <h3 className="text-lg font-semibold">
              {getRecordTypeTitle(recordType, isArabic)}
            </h3>
            <Badge variant="outline">
              {typeNotifications.length}
            </Badge>
          </div>
          
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {typeNotifications.map((notification) => (
              <Card key={notification.id} className="p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-start gap-3">
                    {getStatusIcon(notification.status)}
                    <div className="flex-1">
                      <h4 className="font-medium text-sm mb-1">
                        {notification.asset_name}
                      </h4>
                      <p className="text-xs text-gray-600">
                        {isArabic ? 'الفرع:' : 'Branch:'} {notification.branch_name || 'N/A'}
                      </p>
                    </div>
                  </div>
                  <Badge variant={getStatusBadgeVariant(notification.status)} className="text-xs">
                    {getStatusText(notification.status, isArabic)}
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <p className="text-sm">
                      {new Date(notification.expiry_date).toLocaleDateString(isArabic ? 'ar-AE' : 'en-US')}
                    </p>
                  </div>
                  
                  <div className="text-end">
                    <p className={`text-xs font-medium ${
                      notification.days_remaining < 0 
                        ? 'text-red-600' 
                        : notification.days_remaining <= 7 
                          ? 'text-red-600' 
                          : 'text-gray-500'
                    }`}>
                      {notification.days_remaining < 0 
                        ? `${Math.abs(notification.days_remaining)} ${isArabic ? 'يوم متأخر' : 'days overdue'}`
                        : `${notification.days_remaining} ${isArabic ? 'يوم متبقي' : 'days left'}`
                      }
                    </p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

export default AssetNotificationsTab
