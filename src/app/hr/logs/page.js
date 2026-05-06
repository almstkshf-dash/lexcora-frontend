'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, AlertCircle, RefreshCw } from 'lucide-react';
import { useTranslations } from '@/hooks/useTranslations';
import useSWR from 'swr';
import { getAllLogs } from '@/app/services/api/logs';

// Helper to format date from ISO string
const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('ar-AE', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
};

// Helper to format time from ISO string
const formatTime = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleTimeString('ar-AE', {
    hour: '2-digit',
    minute: '2-digit'
  });
};

// Helper to get status badge color
const getStatusColor = (action) => {
  switch (action) {
    case "login":
      return "text-white bg-green-600";
    case "logout":
      return "text-white bg-blue-600";
    case "add":
      return "text-white bg-green-500";
    case "update":
      return "text-white bg-blue-500";
    case "delete":
      return "text-white bg-red-600";
    case "error":
    case "failed_login":
      return "text-white bg-red-500";
    case "warning":
      return "text-white bg-yellow-500";
    case "other":
      return "text-white bg-gray-500";
    default:
      return "text-gray-600 bg-gray-200";
  }
};

// Helper to translate action types
const getActionLabel = (action) => {
  const actionLabels = {
    login: "تسجيل دخول",
    logout: "تسجيل خروج",
    add: "إضافة",
    update: "تحديث",
    delete: "حذف",
    error: "خطأ",
    failed_login: "فشل تسجيل دخول",
    warning: "تحذير",
    other: "آخر"
  };
  return actionLabels[action] || action;
};

export default function LogsPage() {
  const { t } = useTranslations();
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [page, setPage] = useState(1);

  // Fetch logs using SWR
  const { data, error, isLoading, mutate } = useSWR(
    ['all-logs', page, startDate, endDate],
    () => getAllLogs(page, 50, startDate, endDate),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      dedupingInterval: 30000,
    }
  );

  const logs = data?.data || [];
  const pagination = data?.pagination || {};

  // Filter logs by date range on the client side if API doesn't support it
  const filteredLogs = logs.filter((log) => {
    if (!startDate && !endDate) return true;
    
    const logDate = new Date(log.created_at);
    const start = startDate ? new Date(startDate) : null;
    const end = endDate ? new Date(endDate + 'T23:59:59') : null;
    
    if (start && logDate < start) return false;
    if (end && logDate > end) return false;
    
    return true;
  });

  const handleReset = () => {
    setStartDate('');
    setEndDate('');
    setPage(1);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">سجلات النشاطات</h1>
          <p className="text-sm text-gray-500 mt-1">عرض جميع سجلات نشاطات الموظفين</p>
        </div>
      </div>

      {/* Filters Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            تصفية حسب التاريخ
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 items-end flex-wrap">
            <div className="flex-1 min-w-[200px]">
              <label htmlFor="hr-logs-start-date" className="block text-sm font-medium text-gray-700 mb-2">
                من تاريخ
              </label>
              <input
                id="hr-logs-start-date"
                name="hr-logs-start-date"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                autoComplete="off"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div className="flex-1 min-w-[200px]">
              <label htmlFor="hr-logs-end-date" className="block text-sm font-medium text-gray-700 mb-2">
                إلى تاريخ
              </label>
              <input
                id="hr-logs-end-date"
                name="hr-logs-end-date"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                autoComplete="off"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={handleReset}
                className="flex items-center gap-2"
              >
                إعادة تعيين
              </Button>
              
              <Button
                variant="outline"
                onClick={() => mutate()}
                disabled={isLoading}
                className="flex items-center gap-2"
              >
                <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                تحديث
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Logs List Card */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>السجلات</CardTitle>
            {!isLoading && !error && (
              <span className="text-sm text-gray-500">
                عدد السجلات: {filteredLogs.length}
              </span>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center p-12">
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="text-gray-600">جاري تحميل السجلات...</span>
              </div>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center p-12">
              <div className="flex items-center gap-2 text-red-600">
                <AlertCircle className="w-6 h-6" />
                <span>حدث خطأ في تحميل السجلات. يرجى المحاولة مرة أخرى.</span>
              </div>
            </div>
          ) : filteredLogs.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 text-gray-500">
              <Clock className="w-16 h-16 mb-4 text-gray-300" />
              <h3 className="text-lg font-medium mb-2">لا توجد سجلات</h3>
              <p className="text-sm text-center">
                {startDate || endDate 
                  ? 'لم يتم العثور على سجلات في الفترة المحددة.'
                  : 'لا توجد سجلات حتى الآن.'}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredLogs.map((log) => (
                <div
                  key={log.id}
                  className="bg-gray-50 rounded-sg p-4 border border-gray-200 hover:bg-gray-100 transition-colors"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium text-gray-900">
                          {log.employee_name}
                        </h4>
                        <Badge className={getStatusColor(log.action)}>
                          {getActionLabel(log.action)}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-700 mb-2">
                        {log.description}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {formatDate(log.created_at)} - {formatTime(log.created_at)}
                    </span>
                    <span className="text-gray-400">#{log.id}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {!isLoading && !error && pagination.totalPages > 1 && (
            <div className="flex justify-between items-center mt-6 pt-6 border-t">
              <Button
                variant="outline"
                onClick={() => setPage(page - 1)}
                disabled={!pagination.hasPrev}
              >
                السابق
              </Button>
              
              <span className="text-sm text-gray-600">
                صفحة {pagination.currentPage} من {pagination.totalPages}
              </span>
              
              <Button
                variant="outline"
                onClick={() => setPage(page + 1)}
                disabled={!pagination.hasNext}
              >
                التالي
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

