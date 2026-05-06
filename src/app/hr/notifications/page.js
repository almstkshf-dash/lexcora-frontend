"use client"

import React, { useState } from 'react'
import useSWR from 'swr'
import { useTranslations } from "@/hooks/useTranslations"
import { useLanguage } from "@/contexts/LanguageContext"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, Bell, AlertTriangle, Clock, XCircle, CalendarDays, ExternalLink, User } from 'lucide-react'
import { useRouter } from 'next/navigation'
import EmployeeNotificationsTab from './EmployeeNotificationsTab'
import AssetNotificationsTab from './AssetNotificationsTab'
import { getHrNotifications } from '@/app/services/api/hrNotifications'

function NotificationsPage() {
  const { t } = useTranslations()
  const { language } = useLanguage()
  const isArabic = language === 'ar'
  const router = useRouter()

  const [activeTab, setActiveTab] = useState('all')
  const [daysThreshold, setDaysThreshold] = useState(30)

  // Fetch HR notifications data
  const { data: notificationsData, error, mutate, isLoading } = useSWR(
    ['hr-notifications', daysThreshold],
    ([_, threshold]) => getHrNotifications(threshold)
  )

  const notifications = notificationsData?.data || {}
  const { 
    notifications: allNotifications = [], 
    employee_notifications = [], 
    asset_notifications = [],
    summary = {}
  } = notifications

  const getStatusIcon = (status) => {
    switch (status) {
      case 'expired':
        return <XCircle className="h-4 w-4 text-red-500" />
      case 'critical':
        return <AlertTriangle className="h-4 w-4 text-red-600" />
      case 'warning':
        return <Clock className="h-4 w-4 text-orange-500" />
      default:
        return <Bell className="h-4 w-4 text-blue-500" />
    }
  }

  const getStatusBadgeVariant = (status) => {
    switch (status) {
      case 'expired':
        return 'destructive'
      case 'critical':
        return 'destructive'
      case 'warning':
        return 'secondary'
      default:
        return 'outline'
    }
  }

  const getStatusText = (status, isArabic) => {
    switch (status) {
      case 'expired':
        return isArabic ? 'منتهية الصلاحية' : 'Expired'
      case 'critical':
        return isArabic ? 'حرجة' : 'Critical'
      case 'warning':
        return isArabic ? 'تحذير' : 'Warning'
      default:
        return isArabic ? 'قادمة' : 'Upcoming'
    }
  }

  const handleEmployeeClick = (employeeId) => {
    router.push(`/hr/employees/${employeeId}`)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        <span className="ms-2 text-gray-600">
          {isArabic ? 'جاري تحميل التنبيهات...' : 'Loading notifications...'}
        </span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center p-8 text-red-500">
        <XCircle className="h-12 w-12 mx-auto mb-4" />
        <p>{isArabic ? 'حدث خطأ أثناء تحميل التنبيهات' : 'Error loading notifications'}</p>
      </div>
    )
  }

  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Bell className="h-6 w-6 text-blue-600" />
            <CardTitle className="text-xl">
              {isArabic ? 'التنبيهات' : 'Notifications'}
            </CardTitle>
          </div>
          <div className="flex items-center gap-3">
            <Select value={daysThreshold.toString()} onValueChange={(value) => setDaysThreshold(Number(value))}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">
                  {isArabic ? '7 أيام' : '7 days'}
                </SelectItem>
                <SelectItem value="15">
                  {isArabic ? '15 يوم' : '15 days'}
                </SelectItem>
                <SelectItem value="30">
                  {isArabic ? '30 يوم' : '30 days'}
                </SelectItem>
                <SelectItem value="60">
                  {isArabic ? '60 يوم' : '60 days'}
                </SelectItem>
                <SelectItem value="90">
                  {isArabic ? '90 يوم' : '90 days'}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-4">
          <Card className="p-3">
            <div className="flex items-center gap-2">
              <XCircle className="h-4 w-4 text-red-500" />
              <div>
                <p className="text-sm text-gray-600">{isArabic ? 'منتهية' : 'Expired'}</p>
                <p className="text-xl font-bold text-red-600">{summary.expired || 0}</p>
              </div>
            </div>
          </Card>
          <Card className="p-3">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <div>
                <p className="text-sm text-gray-600">{isArabic ? 'حرجة' : 'Critical'}</p>
                <p className="text-xl font-bold text-red-700">{summary.critical || 0}</p>
              </div>
            </div>
          </Card>
          <Card className="p-3">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-orange-500" />
              <div>
                <p className="text-sm text-gray-600">{isArabic ? 'تحذير' : 'Warning'}</p>
                <p className="text-xl font-bold text-orange-600">{summary.warning || 0}</p>
              </div>
            </div>
          </Card>
          <Card className="p-3">
            <div className="flex items-center gap-2">
              <CalendarDays className="h-4 w-4 text-blue-500" />
              <div>
                <p className="text-sm text-gray-600">{isArabic ? 'الموظفين' : 'Employees'}</p>
                <p className="text-xl font-bold text-blue-600">{summary.employees || 0}</p>
              </div>
            </div>
          </Card>
          <Card className="p-3">
            <div className="flex items-center gap-2">
              <CalendarDays className="h-4 w-4 text-green-500" />
              <div>
                <p className="text-sm text-gray-600">{isArabic ? 'الأصول' : 'Assets'}</p>
                <p className="text-xl font-bold text-green-600">{summary.assets || 0}</p>
              </div>
            </div>
          </Card>
        </div>
      </CardHeader>
      
      <CardContent>
        <Tabs dir={isArabic ? 'rtl' : 'ltr'} value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="all" className="flex items-center gap-2">
              <Bell className="h-4 w-4" />
              {isArabic ? 'جميع التنبيهات' : 'All Notifications'}
              <Badge variant="outline">{summary.total || 0}</Badge>
            </TabsTrigger>
            <TabsTrigger value="employees" className="flex items-center gap-2">
              <CalendarDays className="h-4 w-4" />
              {isArabic ? 'الموظفين' : 'Employees'}
              <Badge variant="outline">{summary.employees || 0}</Badge>
            </TabsTrigger>
            <TabsTrigger value="assets" className="flex items-center gap-2">
              <CalendarDays className="h-4 w-4" />
              {isArabic ? 'الأصول' : 'Assets'}
              <Badge variant="outline">{summary.assets || 0}</Badge>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all">
            <div className="space-y-3">
              {allNotifications.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Bell className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>{isArabic ? 'لا توجد تنبيهات' : 'No notifications found'}</p>
                </div>
              ) : (
                allNotifications.map((notification) => (
                  <Card key={notification.id} className="p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        {getStatusIcon(notification.status)}
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-medium flex items-center gap-2">
                              {notification.type === 'employee' ? (
                                <>
                                  {notification.employee_name}
                                  <button
                                    onClick={() => handleEmployeeClick(notification.employee_id)}
                                    className="text-blue-600 hover:text-blue-800 transition-colors"
                                    title={isArabic ? 'انتقل إلى صفحة الموظف' : 'Go to employee page'}
                                  >
                                    <ExternalLink className="h-4 w-4" />
                                  </button>
                                </>
                              ) : (
                                notification.asset_name
                              )}
                            </h4>
                            <Badge variant={getStatusBadgeVariant(notification.status)}>
                              {getStatusText(notification.status, isArabic)}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600 mb-1">
                            {notification.type === 'employee' 
                              ? (isArabic ? notification.document_type_ar : notification.document_type_en)
                              : `${isArabic ? 'نوع الأصل:' : 'Asset Type:'} ${notification.record_type}`
                            }
                          </p>
                          <p className="text-sm text-gray-500">
                            {notification.type === 'employee' 
                              ? `${isArabic ? 'القسم:' : 'Department:'} ${notification.department_name || 'N/A'}`
                              : `${isArabic ? 'الفرع:' : 'Branch:'} ${notification.branch_name || 'N/A'}`
                            }
                          </p>
                        </div>
                      </div>
                      <div className="text-end">
                        <p className="text-sm font-medium">
                          {new Date(notification.expiry_date).toLocaleDateString(isArabic ? 'ar-AE' : 'en-US')}
                        </p>
                        <p className={`text-xs ${
                          notification.days_remaining < 0 
                            ? 'text-red-600' 
                            : notification.days_remaining <= 7 
                              ? 'text-red-600' 
                              : 'text-gray-500'
                        }`}>
                          {notification.days_remaining < 0 
                            ? `${Math.abs(notification.days_remaining)} ${isArabic ? 'يوم متأخر' : 'days overdue'}`
                            : `${notification.days_remaining} ${isArabic ? 'يوم متبقي' : 'days remaining'}`
                          }
                        </p>
                      </div>
                    </div>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="employees">
            <EmployeeNotificationsTab 
              notifications={employee_notifications} 
              isArabic={isArabic}
              getStatusIcon={getStatusIcon}
              getStatusBadgeVariant={getStatusBadgeVariant}
              getStatusText={getStatusText}
            />
          </TabsContent>

          <TabsContent value="assets">
            <AssetNotificationsTab 
              notifications={asset_notifications} 
              isArabic={isArabic}
              getStatusIcon={getStatusIcon}
              getStatusBadgeVariant={getStatusBadgeVariant}
              getStatusText={getStatusText}
            />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}

export default NotificationsPage

