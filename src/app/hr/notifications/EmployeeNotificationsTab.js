"use client"

import React from 'react'
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Bell, User, Calendar, ExternalLink, Building2 } from 'lucide-react'
import { useRouter } from 'next/navigation'

function EmployeeNotificationsTab({ notifications, isArabic, getStatusIcon, getStatusBadgeVariant, getStatusText }) {
  const router = useRouter()

  const handleEmployeeClick = (employeeId) => {
    router.push(`/hr/employees/${employeeId}`)
  }

  if (!notifications || notifications.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <User className="h-12 w-12 mx-auto mb-4 opacity-50" />
        <p>{isArabic ? 'لا توجد تنبيهات للموظفين' : 'No employee notifications found'}</p>
      </div>
    )
  }

  // Group notifications by employee
  const groupedNotifications = notifications.reduce((acc, notification) => {
    const employeeId = notification.employee_id
    if (!acc[employeeId]) {
      acc[employeeId] = {
        employee: {
          id: notification.employee_id,
          name: notification.employee_name,
          department_name: notification.department_name
        },
        notifications: []
      }
    }
    acc[employeeId].notifications.push(notification)
    return acc
  }, {})

  return (
    <div className="space-y-4">
      {Object.values(groupedNotifications).map(({ employee, notifications: empNotifications }) => (
        <Card key={employee.id} className="p-4">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-3">
              <User className="h-5 w-5 text-blue-600" />
              <div>
                <h3 className="font-medium text-lg flex items-center gap-2">
                  {employee.name}
                  <button
                    onClick={() => handleEmployeeClick(employee.id)}
                    className="text-blue-600 hover:text-blue-800 transition-colors"
                    title={isArabic ? 'انتقل إلى صفحة الموظف' : 'Go to employee page'}
                  >
                    <ExternalLink className="h-4 w-4" />
                  </button>
                </h3>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Building2 className="h-4 w-4" />
                  <span>{isArabic ? 'القسم:' : 'Department:'} {employee.department_name || 'N/A'}</span>
                </div>
              </div>
            </div>
            <Badge variant="outline">
              {empNotifications.length} {isArabic ? 'تنبيه' : 'notifications'}
            </Badge>
          </div>
          
          <div className="grid gap-3 md:grid-cols-2">
            {empNotifications.map((notification) => (
              <div 
                key={notification.id} 
                className="flex items-center justify-between p-3 bg-gray-50 rounded-sg hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center gap-3">
                  {getStatusIcon(notification.status)}
                  <div>
                    <p className="font-medium text-sm">
                      {isArabic ? notification.document_type_ar : notification.document_type_en}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(notification.expiry_date).toLocaleDateString(isArabic ? 'ar-AE' : 'en-US')}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Badge variant={getStatusBadgeVariant(notification.status)}>
                    {getStatusText(notification.status, isArabic)}
                  </Badge>
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
              </div>
            ))}
          </div>
        </Card>
      ))}
    </div>
  )
}

export default EmployeeNotificationsTab
