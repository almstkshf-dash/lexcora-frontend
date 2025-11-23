
'use client';

import { use } from 'react';
import { getAllCaseDetails } from '@/app/services/api/cases';
import useSWR from 'swr';
import { useTranslations } from '@/hooks/useTranslations';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AlertTriangle, Printer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import CaseAssistantLauncher from '@/app/components/ai/CaseAssistantLauncher';

function CaseDetailsPage({ params }) {
  const { id } = use(params);
  const { t } = useTranslations();

  const { data: caseData, error, isLoading } = useSWR(
    `case-details-${id}`,
    () => getAllCaseDetails(id),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
    }
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white p-8">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse space-y-4">
            <div className="h-6 bg-gray-200 rounded w-1/2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/3"></div>
            <div className="space-y-2">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="h-4 bg-gray-200 rounded w-full"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white p-8">
        <div className="max-w-4xl mx-auto">
          <div className="border border-red-200 bg-red-50 p-4 rounded">
            <div className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="h-5 w-5" />
              <span>خطأ في تحميل تفاصيل القضية</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!caseData?.success || !caseData?.data) {
    return (
      <div className="min-h-screen bg-white p-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center text-gray-500 p-8">
            <p>لا توجد بيانات قضية</p>
          </div>
        </div>
      </div>
    );
  }

  const { info, parties, sessions, tasks, executions, judicial, petitions, degrees, petition } = caseData.data;
  const caseId = id || info?.case_id || info?.id;

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('ar-AE', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      active: { label: 'نشط', variant: 'default', className: 'bg-green-100 text-green-800' },
      pending: { label: 'معلق', variant: 'secondary', className: 'bg-yellow-100 text-yellow-800' },
      completed: { label: 'مكتمل', variant: 'outline', className: 'bg-blue-100 text-blue-800' },
      in_progress: { label: 'قيد التنفيذ', variant: 'default', className: 'bg-blue-100 text-blue-800' },
    };
    
    const statusInfo = statusMap[status] || { label: status, variant: 'outline', className: 'bg-gray-100 text-gray-800' };
    return <Badge className={statusInfo.className}>{statusInfo.label}</Badge>;
  };

  const getPriorityBadge = (priority) => {
    const priorityMap = {
      high: { label: 'عالية', className: 'bg-red-100 text-red-800' },
      normal: { label: 'عادية', className: 'bg-gray-100 text-gray-800' },
      low: { label: 'منخفضة', className: 'bg-green-100 text-green-800' },
    };
    
    const priorityInfo = priorityMap[priority] || { label: priority, className: 'bg-gray-100 text-gray-800' };
    return <Badge className={priorityInfo.className}>{priorityInfo.label}</Badge>;
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-white p-8 print:p-6 print:min-h-0 print:h-auto print-container print-full-width" dir="rtl">
      <div className="max-w-4xl mx-auto space-y-8 print:space-y-6 print:max-w-full">
        <div className="flex justify-end print:hidden">
          <CaseAssistantLauncher caseId={caseId} align="left" />
        </div>
        {/* Header */}
        <div className="text-center border-b-2 border-gray-300 pb-6 print:pb-4">
            <div className='flex justify-between items-center'>
              <h1 className="text-2xl font-bold text-gray-900 mb-2 print:text-3xl">تفاصيل القضية</h1>
              <Button variant={"outline"} onClick={handlePrint} className="print-hide">
                <Printer />
                <span className="mr-2">طباعة</span>
              </Button>
            </div>
          <div className="flex justify-between items-center mt-4 print:mt-3">
            <div className="text-right">
              <p className="text-xl text-gray-600">رقم الملف: <span className="font-semibold text-gray-900">{info.file_number}</span></p>
            </div>
            <div className="text-left">
              <p className="text-xl font-bold text-blue-600 print:text-xl">رقم القضية: #{info.case_number}</p>
              {/* <p className="text-sm text-gray-600 mt-1">الحالة: <span className="font-medium">{info.status === 'active' ? 'نشط' : info.status}</span></p> */}
            </div>
          </div>
        </div>

        {/* Case Basic Information */}
        <div className="space-y-6 print:space-y-4">
          <h2 className="text-xl font-bold text-gray-900 border-b border-gray-200 pb-2 print:text-xl">معلومات القضية الأساسية</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 print:gap-4">
            <div className="space-y-4 print:space-y-3">
              <div className="flex gap-x-2 py-2 border-b border-gray-100">
                <span className="text-gray-600">تاريخ البداية:</span>
                <span className="font-medium">{formatDate(info.start_date)}</span>
              </div>
              <div className="flex gap-x-2 py-2 border-b border-gray-100">
                <span className="text-gray-600">الموضوع:</span>
                <span className="font-medium">{info.topic}</span>
              </div>
              <div className="flex gap-x-2 py-2 border-b border-gray-100">
                <span className="text-gray-600">الرسوم:</span>
                <span className="font-medium">{parseFloat(info.fees).toLocaleString('ar-AE')} درهم</span>
              </div>
              <div className="flex gap-x-2 py-2 border-b border-gray-100">
                <span className="text-gray-600">المحكمة:</span>
                <span className="font-medium">{info.court_ar}</span>
              </div>
            </div>
            
            <div className="space-y-4 print:space-y-3">
              <div className="flex gap-x-2 py-2 border-b border-gray-100">
                <span className="text-gray-600">نوع القضية:</span>
                <span className="font-medium">{info.case_type_ar}</span>
              </div>
              <div className="flex gap-x-2 py-2 border-b border-gray-100">
                <span className="text-gray-600">تصنيف القضية:</span>
                <span className="font-medium">{info.case_classification_ar}</span>
              </div>
              <div className="flex gap-x-2 py-2 border-b border-gray-100">
                <span className="text-gray-600">الفرع:</span>
                <span className="font-medium">{info.branch_ar}</span>
              </div>
              <div className="flex gap-x-2 py-2 border-b border-gray-100">
                <span className="text-gray-600">مركز الشرطة:</span>
                <span className="font-medium">{info.police_station_ar}</span>
              </div>
            </div>
          </div>

          <div className="flex gap-x-2 py-2 border-b border-gray-100">
            <span className="text-gray-600">النيابة العامة:</span>
            <span className="font-medium">{info.public_prosecution_ar}</span>
          </div>

          {info.additional_note && (
            <div className="mt-4 print:mt-3">
              <h3 className="font-semibold text-gray-900 mb-2">ملاحظات إضافية:</h3>
              <p className="p-4 bg-gray-50 print:bg-gray-100 rounded-lg text-gray-800 leading-relaxed">{info.additional_note}</p>
            </div>
          )}
        </div>

        {/* Team Information */}
        <div className="space-y-6 print:space-y-4">
          <h2 className="text-2xl font-bold text-gray-900 border-b border-gray-200 pb-2 print:text-xl">فريق العمل</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 print:gap-3">
            <div className="flex gap-x-2 py-3 px-4 bg-blue-50 print:bg-gray-100 rounded-lg">
              <span className="text-gray-700">المحامي:</span>
              <span className="font-medium text-blue-900 print:text-gray-900">{info.lawyer_name}</span>
            </div>
            <div className="flex gap-x-2 py-3 px-4 bg-green-50 print:bg-gray-100 rounded-lg">
              <span className="text-gray-700">السكرتير:</span>
              <span className="font-medium text-green-900 print:text-gray-900">{info.secretary_name}</span>
            </div>
            <div className="flex gap-x-2 py-3 px-4 bg-purple-50 print:bg-gray-100 rounded-lg">
              <span className="text-gray-700">المستشار القانوني:</span>
              <span className="font-medium text-purple-900 print:text-gray-900">{info.legal_advisor_name}</span>
            </div>
            <div className="flex gap-x-2 py-3 px-4 bg-orange-50 print:bg-gray-100 rounded-lg">
              <span className="text-gray-700">الباحث القانوني:</span>
              <span className="font-medium text-orange-900 print:text-gray-900">{info.legal_researcher_name}</span>
            </div>
          </div>
        </div>

        {/* Parties */}
        <div className="space-y-6 print:space-y-4 print-avoid-break">
          <h2 className="text-2xl font-bold text-gray-900 border-b border-gray-200 pb-2 print:text-xl">الأطراف ({parties?.length || 0})</h2>
          
          {parties && parties.length > 0 ? (
            <div className="border border-gray-200 rounded-lg overflow-hidden print-no-shadow">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50 print:bg-gray-100">
                    <TableHead className="text-right font-semibold">اسم الطرف</TableHead>
                    <TableHead className="text-right font-semibold">النوع</TableHead>
                    <TableHead className="text-right font-semibold">الهاتف</TableHead>
                    <TableHead className="text-right font-semibold">البريد الإلكتروني</TableHead>
                    <TableHead className="text-right font-semibold">الجنسية</TableHead>
                    <TableHead className="text-right font-semibold">العنوان</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {parties.map((party, index) => (
                    <TableRow key={index} className="hover:bg-gray-50 print:hover:bg-transparent">
                      <TableCell className="font-medium">{party.party_name}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="print:border-gray-400">
                          {party.type === 'opponent' ? 'خصم' : party.type}
                        </Badge>
                      </TableCell>
                      <TableCell>{party.phone}</TableCell>
                      <TableCell className="text-left" dir="ltr">{party.email}</TableCell>
                      <TableCell>{party.nationality}</TableCell>
                      <TableCell className="max-w-xs">
                        {party.address ? (
                          <div className="text-sm text-gray-600 truncate" title={party.address}>
                            {party.address}
                          </div>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="border border-gray-200 rounded-lg p-8 text-center">
              <p className="text-gray-500">لا توجد أطراف مسجلة</p>
            </div>
          )}
        </div>

        {/* Sessions */}
        <div className="space-y-6 print:space-y-4 print-avoid-break">
          <h2 className="text-2xl font-bold text-gray-900 border-b border-gray-200 pb-2 print:text-xl">الجلسات ({sessions?.length || 0})</h2>
          
          {sessions && sessions.length > 0 ? (
            <div className="border border-gray-200 rounded-lg overflow-hidden print-no-shadow">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50 print:bg-gray-100">
                    <TableHead className="text-right font-semibold">رقم الجلسة</TableHead>
                    <TableHead className="text-right font-semibold">التاريخ</TableHead>
                    <TableHead className="text-right font-semibold">النوع</TableHead>
                    <TableHead className="text-right font-semibold">القرار</TableHead>
                    <TableHead className="text-right font-semibold">ملاحظة</TableHead>
                    <TableHead className="text-right font-semibold print:hidden">الرابط</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sessions.map((session, index) => (
                    <TableRow key={index} className="hover:bg-gray-50 print:hover:bg-transparent">
                      <TableCell className="font-medium">جلسة {index + 1}</TableCell>
                      <TableCell>{formatDate(session.session_date)}</TableCell>
                      <TableCell>
                        <Badge variant={session.is_expert_session ? "default" : "outline"} 
                               className={session.is_expert_session ? "bg-purple-100 text-purple-800 print:bg-gray-200 print:text-gray-800" : ""}>
                          {session.is_expert_session ? 'جلسة خبير' : 'جلسة عادية'}
                        </Badge>
                      </TableCell>

                      <TableCell className="max-w-xs">
                        {session.decision ? (
                          <div className="text-sm truncate" title={session.decision}>
                            {session.decision}
                          </div>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </TableCell>
                      <TableCell className="max-w-xs">
                        {session.note ? (
                          <div className="text-sm text-gray-600 truncate" title={session.note}>
                            {session.note}
                          </div>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </TableCell>
                      <TableCell className="print:hidden">
                        {session.link ? (
                          <a href={session.link} target="_blank" rel="noopener noreferrer" 
                             className="text-blue-600 hover:text-blue-800 text-sm">
                            رابط الجلسة
                          </a>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="border border-gray-200 rounded-lg p-8 text-center">
              <p className="text-gray-500">لا توجد جلسات مسجلة</p>
            </div>
          )}
        </div>

        {/* Tasks */}
        <div className="space-y-6 print:space-y-4 print-avoid-break">
          <h2 className="text-2xl font-bold text-gray-900 border-b border-gray-200 pb-2 print:text-xl">المهام ({tasks?.length || 0})</h2>
          
          {tasks && tasks.length > 0 ? (
            <div className="border border-gray-200 rounded-lg overflow-hidden print-no-shadow">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50 print:bg-gray-100">
                    <TableHead className="text-right font-semibold">عنوان المهمة</TableHead>
                    <TableHead className="text-right font-semibold">الوصف</TableHead>
                    <TableHead className="text-right font-semibold">الحالة</TableHead>
                    <TableHead className="text-right font-semibold">الأولوية</TableHead>
                    <TableHead className="text-right font-semibold">تاريخ الاستحقاق</TableHead>
                    <TableHead className="text-right font-semibold">مسند إلى</TableHead>
                    <TableHead className="text-right font-semibold">مسند من</TableHead>
                    <TableHead className="text-right font-semibold">تاريخ الإنشاء</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tasks.map((task, index) => (
                    <TableRow key={index} className="hover:bg-gray-50 print:hover:bg-transparent">
                      <TableCell className="font-medium">{task.title}</TableCell>
                      <TableCell className="max-w-xs">
                        <div className="text-sm text-gray-600 truncate" title={task.description}>
                          {task.description}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={
                          task.status === 'pending' ? 'bg-yellow-100 text-yellow-800 print:bg-gray-200 print:text-gray-800' :
                          task.status === 'completed' ? 'bg-green-100 text-green-800 print:bg-gray-200 print:text-gray-800' :
                          'bg-gray-100 text-gray-800'
                        }>
                          {task.status === 'pending' ? 'معلق' : task.status === 'completed' ? 'مكتمل' : task.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={
                          task.priority === 'high' ? 'bg-red-100 text-red-800 print:bg-gray-200 print:text-gray-800' :
                          task.priority === 'normal' ? 'bg-gray-100 text-gray-800' :
                          'bg-green-100 text-green-800 print:bg-gray-200 print:text-gray-800'
                        }>
                          {task.priority === 'high' ? 'عالية' : task.priority === 'normal' ? 'عادية' : 'منخفضة'}
                        </Badge>
                      </TableCell>
                      <TableCell>{formatDate(task.due_date)}</TableCell>
                      <TableCell>{task.assigned_to_name}</TableCell>
                      <TableCell>{task.assigned_by_name}</TableCell>
                      <TableCell>{formatDate(task.created_at)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="border border-gray-200 rounded-lg p-8 text-center">
              <p className="text-gray-500">لا توجد مهام مسجلة</p>
            </div>
          )}
        </div>

        {/* Executions */}
        <div className="space-y-6 print:space-y-4 print-avoid-break">
          <h2 className="text-2xl font-bold text-gray-900 border-b border-gray-200 pb-2 print:text-xl">التنفيذ ({executions?.length || 0})</h2>
          
          {executions && executions.length > 0 ? (
            <div className="border border-gray-200 rounded-lg overflow-hidden print-no-shadow">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50 print:bg-gray-100">
                    <TableHead className="text-right font-semibold">رقم التنفيذ</TableHead>
                    <TableHead className="text-right font-semibold">النوع</TableHead>
                    <TableHead className="text-right font-semibold">المبلغ</TableHead>
                    <TableHead className="text-right font-semibold">الحالة</TableHead>
                    <TableHead className="text-right font-semibold">التاريخ</TableHead>
                    <TableHead className="text-right font-semibold">الموظف</TableHead>
                    <TableHead className="text-right font-semibold">ملاحظة</TableHead>
                    <TableHead className="text-right font-semibold">تاريخ الإنشاء</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {executions.map((execution, index) => (
                    <TableRow key={index} className="hover:bg-gray-50 print:hover:bg-transparent">
                      <TableCell className="font-medium">تنفيذ {index + 1}</TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {execution.type === 'almulaa' ? 'الملاء' : execution.type}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className="bg-green-100 text-green-800 print:bg-gray-200 print:text-gray-800">
                          {parseFloat(execution.amount).toLocaleString('ar-AE')} درهم
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={
                          execution.status === 'in_progress' ? 'bg-blue-100 text-blue-800 print:bg-gray-200 print:text-gray-800' :
                          execution.status === 'completed' ? 'bg-green-100 text-green-800 print:bg-gray-200 print:text-gray-800' :
                          'bg-gray-100 text-gray-800'
                        }>
                          {execution.status === 'in_progress' ? 'قيد التنفيذ' : execution.status === 'completed' ? 'مكتمل' : execution.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{formatDate(execution.date)}</TableCell>
                      <TableCell>{execution.employee_name || 'غير محدد'}</TableCell>
                      <TableCell className="max-w-xs">
                        {execution.note ? (
                          <div className="text-sm text-gray-600 truncate" title={execution.note}>
                            {execution.note}
                          </div>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </TableCell>
                      <TableCell>{formatDate(execution.created_at)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="border border-gray-200 rounded-lg p-8 text-center">
              <p className="text-gray-500">لا توجد سجلات تنفيذ</p>
            </div>
          )}
        </div>

        {/* Judicial Notices */}
        <div className="space-y-6 print:space-y-4 print-avoid-break">
          <h2 className="text-2xl font-bold text-gray-900 border-b border-gray-200 pb-2 print:text-xl">الإشعارات القضائية ({judicial?.length || 0})</h2>
          
          {judicial && judicial.length > 0 ? (
            <div className="border border-gray-200 rounded-lg overflow-hidden print-no-shadow">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50 print:bg-gray-100">
                    <TableHead className="text-right font-semibold">رقم الإشعار</TableHead>
                    <TableHead className="text-right font-semibold">تاريح التصديق</TableHead>
                    <TableHead className="text-right font-semibold">اتمام الاعلان</TableHead>
                    <TableHead className="text-right font-semibold">فترة الإشعار</TableHead>
                    <TableHead className="text-right font-semibold">رفع الدعوى</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {judicial.map((notice, index) => (
                    <TableRow key={index} className="hover:bg-gray-50 print:hover:bg-transparent">
                      <TableCell className="font-medium">إشعار قضائي {index + 1}</TableCell>
                      <TableCell>{formatDate(notice.date)}</TableCell>
                      <TableCell>
                        <Badge className={
                          notice.service_completed === 'yes' 
                            ? 'bg-green-100 text-green-800 print:bg-gray-200 print:text-gray-800' 
                            : 'bg-red-100 text-red-800 print:bg-gray-200 print:text-gray-800'
                        }>
                          {notice.service_completed === 'yes' ? 'نعم' : 'لا'}
                        </Badge>
                      </TableCell>
                      <TableCell>{notice.notification_period_days} يوم</TableCell>
                      <TableCell>
                        <Badge className={
                          notice.case_filed === 'yes' 
                            ? 'bg-green-100 text-green-800 print:bg-gray-200 print:text-gray-800' 
                            : 'bg-red-100 text-red-800 print:bg-gray-200 print:text-gray-800'
                        }>
                          {notice.case_filed === 'yes' ? 'نعم' : 'لا'}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="border border-gray-200 rounded-lg p-8 text-center">
              <p className="text-gray-500">لا توجد إشعارات قضائية</p>
            </div>
          )}
        </div>

        {/* Petitions */}
        <div className="space-y-6 print:space-y-4 print-avoid-break">
          <h2 className="text-2xl font-bold text-gray-900 border-b border-gray-200 pb-2 print:text-xl">
            العرائض ({(petitions?.length || 0) + (petition?.length || 0)})
          </h2>
          
          {((petitions && petitions.length > 0) || (petition && petition.length > 0)) ? (
            <div className="border border-gray-200 rounded-lg overflow-hidden print-no-shadow">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50 print:bg-gray-100">
                    <TableHead className="text-right font-semibold">العريضة</TableHead>
                    <TableHead className="text-right font-semibold">نوع الامر</TableHead>
                    <TableHead className="text-right font-semibold">حالة- القرار</TableHead>
                    {/* <TableHead className="text-right font-semibold">المستندات</TableHead> */}
                    <TableHead className="text-right font-semibold">التاريخ</TableHead>
                    <TableHead className="text-right font-semibold">تاريخ الاستئناف</TableHead>
                    <TableHead className="text-right font-semibold">تاريخ الإنشاء</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
               
                  
                  {petition?.map((petitionDetail, index) => (
                    <TableRow key={`detail-${index}`} className="hover:bg-gray-50 print:hover:bg-transparent">
                      <TableCell className="font-medium"> العريضة {index + 1}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{petitionDetail.type_title}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={
                          petitionDetail.decision_status === 'accepted' ? 'bg-green-100 text-green-800 print:bg-gray-200 print:text-gray-800' :
                          petitionDetail.decision_status === 'not accepted' ? 'bg-red-100 text-red-800 print:bg-gray-200 print:text-gray-800' :
                          'bg-yellow-100 text-yellow-800 print:bg-gray-200 print:text-gray-800'
                        }>
                          {petitionDetail.decision_status === 'accepted' ? 'مقبول' :
                           petitionDetail.decision_status === 'not accepted' ? 'غير مقبول' :
                           petitionDetail.decision_status}
                        </Badge>
                      </TableCell>
                      <TableCell>{formatDate(petitionDetail.date)}</TableCell>
                      <TableCell>{formatDate(petitionDetail.appeal_date)}</TableCell>
                      <TableCell>{formatDate(petitionDetail.created_at)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="border border-gray-200 rounded-lg p-8 text-center">
              <p className="text-gray-500">لا توجد عرائض مسجلة</p>
            </div>
          )}
        </div>

        {/* Degrees */}
        <div className="space-y-6 print:space-y-4 print-avoid-break">
          <h2 className="text-2xl font-bold text-gray-900 border-b border-gray-200 pb-2 print:text-xl">الدرجات ({degrees?.length || 0})</h2>
          
          {degrees && degrees.length > 0 ? (
            <div className="border border-gray-200 rounded-lg overflow-hidden print-no-shadow">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50 print:bg-gray-100">
                    <TableHead className="text-right font-semibold">رقم الدرجة</TableHead>
                    <TableHead className="text-right font-semibold">السنة</TableHead>
                    <TableHead className="text-right font-semibold">تاريخ الإحالة</TableHead>
                    <TableHead className="text-right font-semibold">رقم القضية</TableHead>
                    <TableHead className="text-right font-semibold">تاريخ الإنشاء</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {degrees.map((degree, index) => (
                    <TableRow key={index} className="hover:bg-gray-50 print:hover:bg-transparent">
                      <TableCell className="font-medium">درجة {index + 1}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{degree.year}</Badge>
                      </TableCell>
                      <TableCell>{formatDate(degree.referral_date)}</TableCell>
                      <TableCell>{degree.case_number}</TableCell>
                      <TableCell>{formatDate(degree.created_at)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="border border-gray-200 rounded-lg p-8 text-center">
              <p className="text-gray-500">لا توجد درجات مسجلة</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default CaseDetailsPage;
