'use client';

import { use } from 'react';
import useSWR from 'swr';
import { AlertTriangle, Printer } from 'lucide-react';
import { getAllCaseDetails } from '@/app/services/api/cases';
import { useTranslations } from '@/hooks/useTranslations';
import { useLanguage } from '@/contexts/LanguageContext';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import CaseAssistantLauncher from '@/app/components/ai/CaseAssistantLauncher';
import CaseFinancialSummary from './components/CaseFinancialSummary';

function CaseDetailsPage({ params }) {
  const { id } = use(params);
  const { t } = useTranslations();
  const { language, isRTL } = useLanguage();
  const locale = language === 'ar' ? 'ar-AE' : 'en-US';
  const direction = isRTL ? 'rtl' : 'ltr';
  const textAlignClass = isRTL ? 'text-right' : 'text-left';

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
              {[...Array(8)].map((_, index) => (
                <div key={index} className="h-4 bg-gray-200 rounded w-full"></div>
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
              <span>{t('caseDetailsPage.errorLoading')}</span>
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
            <p>{t('caseDetailsPage.noData')}</p>
          </div>
        </div>
      </div>
    );
  }

  const { info, parties, sessions, tasks, executions, judicial, degrees, petition, relatedFiles, relatedCases } = caseData.data;
  const caseId = id || info?.case_id || info?.id;

  const noValue = t('common.notSpecified');

  const getLocalizedValue = (arabicValue, englishValue, fallbackValue = null) => {
    const localized = language === 'ar' ? arabicValue || englishValue : englishValue || arabicValue;
    return localized || fallbackValue || t('common.notSpecified');
  };

  const formatDate = (dateString) => {
    if (!dateString) return t('common.notSpecified');

    return new Date(dateString).toLocaleDateString(locale, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatCurrency = (value) => {
    if (value === null || value === undefined || value === '') {
      return t('common.notSpecified');
    }

    return `${Number(value).toLocaleString(locale)} ${t('caseDetailsPage.currency')}`;
  };

  const getTaskStatusLabel = (status) => {
    const statusLabels = {
      active: t('caseDetailsPage.status.active'),
      pending: t('caseDetailsPage.status.pending'),
      completed: t('caseDetailsPage.status.completed'),
      in_progress: t('caseDetailsPage.status.inProgress'),
    };

    return statusLabels[status] || status || t('common.notSpecified');
  };

  const getPriorityLabel = (priority) => {
    const priorityLabels = {
      high: t('caseDetailsPage.priority.high'),
      normal: t('caseDetailsPage.priority.normal'),
      low: t('caseDetailsPage.priority.low'),
    };

    return priorityLabels[priority] || priority || t('common.notSpecified');
  };

  const getPartyTypeLabel = (type) => {
    if (type === 'opponent') return t('caseDetailsPage.partyType.opponent');
    if (type === 'client') return t('caseDetailsPage.partyType.client');
    return type || noValue;
  };

  const getSessionTypeLabel = (isExpert) => {
    return isExpert ? t('caseDetailsPage.sessionType.expert') : t('caseDetailsPage.sessionType.regular');
  };

  const getExecutionTypeLabel = (type) => {
    if (type === 'almulaa') return t('caseDetailsPage.executionType.almulaa');
    return type || noValue;
  };

  const getDecisionStatusLabel = (status) => {
    if (status === 'accepted') return t('caseDetailsPage.decisionStatus.accepted');
    if (status === 'not accepted') return t('caseDetailsPage.decisionStatus.notAccepted');
    return status || noValue;
  };

  const getBooleanBadge = (value) => (
    <Badge
      variant="outline"
      className={
        value === 'yes'
          ? 'bg-green-50 text-green-700 border-green-200'
          : 'bg-red-50 text-red-700 border-red-200'
      }
    >
      {value === 'yes' ? t('caseDetailsPage.yes') : t('caseDetailsPage.no')}
    </Badge>
  );

  const casePartyRows = Array.isArray(parties) ? parties : [];
  const sessionRows = Array.isArray(sessions) ? sessions : [];
  const taskRows = Array.isArray(tasks) ? tasks : [];
  const executionRows = Array.isArray(executions) ? executions : [];
  const judicialRows = Array.isArray(judicial) ? judicial : [];
  const degreeRows = Array.isArray(degrees) ? degrees : [];
  const petitionRows = Array.isArray(petition) ? petition : [];
  const relatedFileRows = Array.isArray(relatedFiles) ? relatedFiles : [];
  const relatedCaseRows = Array.isArray(relatedCases) ? relatedCases : [];

  return (
    <div className="min-h-screen bg-white p-8 print:p-6 print:min-h-0 print:h-auto print-container print-full-width" dir={direction}>
      <div className="max-w-4xl mx-auto space-y-8 print:space-y-6 print:max-w-full">
        <div className="flex justify-end print:hidden">
          <CaseAssistantLauncher caseId={caseId} align="left" />
        </div>

        <div className="text-center border-b-2 border-gray-300 pb-6 print:pb-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-2 print:text-3xl">{t('caseDetailsPage.title')}</h1>
            <Button variant="outline" onClick={() => window.print()} className="print-hide">
              <Printer />
              <span className={isRTL ? 'mr-2' : 'ml-2'}>{t('common.print')}</span>
            </Button>
          </div>
          <div className="flex justify-between items-center mt-4 print:mt-3">
            <div className={textAlignClass}>
              <p className="text-xl text-gray-600">
                {t('caseDetailsPage.fileNumber')}: <span className="font-semibold text-gray-900">{info.file_number || noValue}</span>
              </p>
            </div>
            <div className={isRTL ? 'text-left' : 'text-right'}>
              <p className="text-xl font-bold text-blue-600 print:text-xl">
                {t('caseDetailsPage.caseNumber')}: #{info.case_number || noValue}
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-6 print:space-y-4">
          <h2 className="text-xl font-bold text-gray-900 border-b border-gray-200 pb-2 print:text-xl">
            {t('caseDetailsPage.basicInformation')}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 print:gap-4">
            <div className="space-y-4 print:space-y-3">
              <InfoRow label={t('caseDetailsPage.startDate')} value={formatDate(info.start_date)} />
              <InfoRow label={t('caseDetailsPage.topic')} value={info.topic || noValue} />
              <InfoRow label={t('caseDetailsPage.fees')} value={formatCurrency(info.fees)} />
              <InfoRow label={t('caseDetailsPage.court')} value={getLocalizedValue(info.court_ar, info.court_en)} />
            </div>

            <div className="space-y-4 print:space-y-3">
              <InfoRow label={t('caseDetailsPage.caseType')} value={getLocalizedValue(info.case_type_ar, info.case_type_en)} />
              <InfoRow
                label={t('caseDetailsPage.caseClassification')}
                value={getLocalizedValue(info.case_classification_ar, info.case_classification_en)}
              />
              <InfoRow label={t('caseDetailsPage.branch')} value={getLocalizedValue(info.branch_ar, info.branch_en)} />
              <InfoRow
                label={t('caseDetailsPage.policeStation')}
                value={getLocalizedValue(info.police_station_ar, info.police_station_en)}
              />
            </div>
          </div>

          <InfoRow
            label={t('caseDetailsPage.publicProsecution')}
            value={getLocalizedValue(info.public_prosecution_ar, info.public_prosecution_en)}
          />

          {info.additional_note && (
            <div className="mt-4 print:mt-3">
              <h3 className="font-semibold text-gray-900 mb-2">{t('caseDetailsPage.additionalNotes')}:</h3>
              <p className="p-4 bg-gray-50 print:bg-gray-100 rounded-lg text-gray-800 leading-relaxed">{info.additional_note}</p>
            </div>
          )}
        </div>

        <div className="space-y-6 print:space-y-4">
          <h2 className="text-2xl font-bold text-gray-900 border-b border-gray-200 pb-2 print:text-xl">{t('caseDetailsPage.team')}</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 print:gap-3">
            <TeamRow label={t('caseDetailsPage.lawyer')} value={info.lawyer_name || noValue} tone="blue" />
            <TeamRow label={t('caseDetailsPage.secretary')} value={info.secretary_name || noValue} tone="green" />
            <TeamRow label={t('caseDetailsPage.legalAdvisor')} value={info.legal_advisor_name || noValue} tone="purple" />
            <TeamRow label={t('caseDetailsPage.legalResearcher')} value={info.legal_researcher_name || noValue} tone="orange" />
          </div>
        </div>

        <CaseFinancialSummary caseId={caseId} />

        <div className="space-y-6 print:space-y-4 print-avoid-break">
          <h2 className="text-2xl font-bold text-gray-900 border-b border-gray-200 pb-2 print:text-xl">
            {t('caseDetailsPage.partiesTitle', { count: String(casePartyRows.length) })}
          </h2>

          {casePartyRows.length > 0 ? (
            <div className="border border-gray-200 rounded-lg overflow-x-auto print-no-shadow print:overflow-visible">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50 print:bg-gray-100">
                    <TableHead className={`${textAlignClass} font-semibold min-w-[150px]`}>{t('caseDetailsPage.partyName')}</TableHead>
                    <TableHead className={`${textAlignClass} font-semibold min-w-[100px]`}>{t('common.type')}</TableHead>
                    <TableHead className={`${textAlignClass} font-semibold min-w-[120px]`}>{t('common.phone')}</TableHead>
                    <TableHead className={`${textAlignClass} font-semibold min-w-[180px]`}>{t('profile.email')}</TableHead>
                    <TableHead className={`${textAlignClass} font-semibold min-w-[120px]`}>{t('common.nationality')}</TableHead>
                    <TableHead className={`${textAlignClass} font-semibold min-w-[200px]`}>{t('caseDetailsPage.address')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {casePartyRows.map((party, index) => (
                    <TableRow key={index} className="hover:bg-gray-50 print:hover:bg-transparent">
                      <TableCell className={`${textAlignClass} font-medium`}>{party.party_name || noValue}</TableCell>
                      <TableCell className={`${textAlignClass}`}>
                        <Badge variant="outline" className="print:border-gray-400">
                          {getPartyTypeLabel(party.type)}
                        </Badge>
                      </TableCell>
                      <TableCell className={`${textAlignClass}`}>{party.phone || noValue}</TableCell>
                      <TableCell className={`${textAlignClass}`} dir="ltr">{party.email || noValue}</TableCell>
                      <TableCell className={`${textAlignClass}`}>{party.nationality || noValue}</TableCell>
                      <TableCell className={`${textAlignClass}`}>
                        {party.address ? (
                          <div className="text-sm text-gray-600 line-clamp-2" title={party.address}>
                            {party.address}
                          </div>
                        ) : (
                          <span className="text-gray-400">{noValue}</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <EmptyState message={t('caseDetailsPage.noParties')} />
          )}
        </div>

        <div className="space-y-6 print:space-y-4 print-avoid-break">
          <h2 className="text-2xl font-bold text-gray-900 border-b border-gray-200 pb-2 print:text-xl">
            {t('caseDetailsPage.sessionsTitle', { count: String(sessionRows.length) })}
          </h2>

          {sessionRows.length > 0 ? (
            <div className="border border-gray-200 rounded-lg overflow-x-auto print-no-shadow print:overflow-visible">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50 print:bg-gray-100">
                    <TableHead className={`${textAlignClass} font-semibold min-w-[120px]`}>{t('caseDetailsPage.sessionNumber')}</TableHead>
                    <TableHead className={`${textAlignClass} font-semibold min-w-[120px]`}>{t('common.date')}</TableHead>
                    <TableHead className={`${textAlignClass} font-semibold min-w-[120px]`}>{t('common.type')}</TableHead>
                    <TableHead className={`${textAlignClass} font-semibold min-w-[200px]`}>{t('caseDetailsPage.decision')}</TableHead>
                    <TableHead className={`${textAlignClass} font-semibold min-w-[200px]`}>{t('common.note')}</TableHead>
                    <TableHead className={`${textAlignClass} font-semibold min-w-[100px] print:hidden`}>{t('caseDetailsPage.link')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sessionRows.map((session, index) => (
                    <TableRow key={index} className="hover:bg-gray-50 print:hover:bg-transparent">
                      <TableCell className={`${textAlignClass} font-medium`}>{t('caseDetailsPage.sessionLabel', { number: String(index + 1) })}</TableCell>
                      <TableCell className={`${textAlignClass}`}>{formatDate(session.session_date)}</TableCell>
                      <TableCell className={`${textAlignClass}`}>
                        <Badge
                          variant={session.is_expert_session ? 'default' : 'outline'}
                          className={session.is_expert_session ? 'bg-purple-100 text-purple-800 print:bg-gray-200 print:text-gray-800' : ''}
                        >
                          {getSessionTypeLabel(session.is_expert_session)}
                        </Badge>
                      </TableCell>
                      <TableCell className={`${textAlignClass}`}>
                        {session.decision ? (
                          <div className="text-sm line-clamp-2" title={session.decision}>
                            {session.decision}
                          </div>
                        ) : (
                          <span className="text-gray-400">{noValue}</span>
                        )}
                      </TableCell>
                      <TableCell className={`${textAlignClass}`}>
                        {session.note ? (
                          <div className="text-sm text-gray-600 line-clamp-2" title={session.note}>
                            {session.note}
                          </div>
                        ) : (
                          <span className="text-gray-400">{noValue}</span>
                        )}
                      </TableCell>
                      <TableCell className={`${textAlignClass} print:hidden`}>
                        {session.link ? (
                          <a href={session.link} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 text-sm">
                            {t('caseDetailsPage.sessionLink')}
                          </a>
                        ) : (
                          <span className="text-gray-400">{noValue}</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <EmptyState message={t('caseDetailsPage.noSessions')} />
          )}
        </div>

        <div className="space-y-6 print:space-y-4 print-avoid-break">
          <h2 className="text-2xl font-bold text-gray-900 border-b border-gray-200 pb-2 print:text-xl">
            {t('caseDetailsPage.tasksTitle', { count: String(taskRows.length) })}
          </h2>

          {taskRows.length > 0 ? (
            <div className="border border-gray-200 rounded-lg overflow-x-auto print-no-shadow print:overflow-visible">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50 print:bg-gray-100">
                    <TableHead className={`${textAlignClass} font-semibold min-w-[150px]`}>{t('caseDetailsPage.taskTitle')}</TableHead>
                    <TableHead className={`${textAlignClass} font-semibold min-w-[200px]`}>{t('common.description')}</TableHead>
                    <TableHead className={`${textAlignClass} font-semibold min-w-[120px]`}>{t('caseDetailsPage.statusLabel')}</TableHead>
                    <TableHead className={`${textAlignClass} font-semibold min-w-[120px]`}>{t('caseDetailsPage.priorityLabel')}</TableHead>
                    <TableHead className={`${textAlignClass} font-semibold min-w-[120px]`}>{t('caseDetailsPage.dueDate')}</TableHead>
                    <TableHead className={`${textAlignClass} font-semibold min-w-[150px]`}>{t('caseDetailsPage.assignedTo')}</TableHead>
                    <TableHead className={`${textAlignClass} font-semibold min-w-[150px]`}>{t('caseDetailsPage.assignedBy')}</TableHead>
                    <TableHead className={`${textAlignClass} font-semibold min-w-[120px]`}>{t('common.createdAt')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {taskRows.map((task, index) => (
                    <TableRow key={index} className="hover:bg-gray-50 print:hover:bg-transparent">
                      <TableCell className={`${textAlignClass} font-medium`}>{task.title || noValue}</TableCell>
                      <TableCell className={`${textAlignClass}`}>
                        <div className="text-sm text-gray-600 line-clamp-2" title={task.description || noValue}>
                          {task.description || noValue}
                        </div>
                      </TableCell>
                      <TableCell className={`${textAlignClass}`}>
                        <Badge
                          className={
                            task.status === 'pending'
                              ? 'bg-yellow-100 text-yellow-800 print:bg-gray-200 print:text-gray-800'
                              : task.status === 'completed'
                                ? 'bg-green-100 text-green-800 print:bg-gray-200 print:text-gray-800'
                                : 'bg-gray-100 text-gray-800'
                          }
                        >
                          {getTaskStatusLabel(task.status)}
                        </Badge>
                      </TableCell>
                      <TableCell className={`${textAlignClass}`}>
                        <Badge
                          className={
                            task.priority === 'high'
                              ? 'bg-red-100 text-red-800 print:bg-gray-200 print:text-gray-800'
                              : task.priority === 'normal'
                                ? 'bg-gray-100 text-gray-800'
                                : 'bg-green-100 text-green-800 print:bg-gray-200 print:text-gray-800'
                          }
                        >
                          {getPriorityLabel(task.priority)}
                        </Badge>
                      </TableCell>
                      <TableCell className={`${textAlignClass}`}>{formatDate(task.due_date)}</TableCell>
                      <TableCell className={`${textAlignClass}`}>{task.assigned_to_name || noValue}</TableCell>
                      <TableCell className={`${textAlignClass}`}>{task.assigned_by_name || noValue}</TableCell>
                      <TableCell className={`${textAlignClass}`}>{formatDate(task.created_at)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <EmptyState message={t('caseDetailsPage.noTasks')} />
          )}
        </div>

        <div className="space-y-6 print:space-y-4 print-avoid-break">
          <h2 className="text-2xl font-bold text-gray-900 border-b border-gray-200 pb-2 print:text-xl">
            {t('caseDetailsPage.executionsTitle', { count: String(executionRows.length) })}
          </h2>

          {executionRows.length > 0 ? (
            <div className="border border-gray-200 rounded-lg overflow-x-auto print-no-shadow print:overflow-visible">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50 print:bg-gray-100">
                    <TableHead className={`${textAlignClass} font-semibold min-w-[100px]`}>{t('caseDetailsPage.executionNumber')}</TableHead>
                    <TableHead className={`${textAlignClass} font-semibold min-w-[120px]`}>{t('common.type')}</TableHead>
                    <TableHead className={`${textAlignClass} font-semibold min-w-[150px]`}>{t('common.amount')}</TableHead>
                    <TableHead className={`${textAlignClass} font-semibold min-w-[120px]`}>{t('caseDetailsPage.statusLabel')}</TableHead>
                    <TableHead className={`${textAlignClass} font-semibold min-w-[120px]`}>{t('common.date')}</TableHead>
                    <TableHead className={`${textAlignClass} font-semibold min-w-[150px]`}>{t('common.employee')}</TableHead>
                    <TableHead className={`${textAlignClass} font-semibold min-w-[200px]`}>{t('common.note')}</TableHead>
                    <TableHead className={`${textAlignClass} font-semibold min-w-[120px]`}>{t('common.createdAt')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {executionRows.map((execution, index) => (
                    <TableRow key={index} className="hover:bg-gray-50 print:hover:bg-transparent">
                      <TableCell className={`${textAlignClass} font-medium`}>{t('caseDetailsPage.executionLabel', { number: String(index + 1) })}</TableCell>
                      <TableCell className={`${textAlignClass}`}>
                        <Badge variant="outline">{getExecutionTypeLabel(execution.type)}</Badge>
                      </TableCell>
                      <TableCell className={`${textAlignClass}`}>
                        <Badge className="bg-green-100 text-green-800 print:bg-gray-200 print:text-gray-800">
                          {formatCurrency(execution.amount)}
                        </Badge>
                      </TableCell>
                      <TableCell className={`${textAlignClass}`}>
                        <Badge
                          className={
                            execution.status === 'in_progress'
                              ? 'bg-blue-100 text-blue-800 print:bg-gray-200 print:text-gray-800'
                              : execution.status === 'completed'
                                ? 'bg-green-100 text-green-800 print:bg-gray-200 print:text-gray-800'
                                : 'bg-gray-100 text-gray-800'
                          }
                        >
                          {getTaskStatusLabel(execution.status)}
                        </Badge>
                      </TableCell>
                      <TableCell className={`${textAlignClass}`}>{formatDate(execution.date)}</TableCell>
                      <TableCell className={`${textAlignClass}`}>{execution.employee_name || noValue}</TableCell>
                      <TableCell className={`${textAlignClass}`}>
                        {execution.note ? (
                          <div className="text-sm text-gray-600 line-clamp-2" title={execution.note}>
                            {execution.note}
                          </div>
                        ) : (
                          <span className="text-gray-400">{noValue}</span>
                        )}
                      </TableCell>
                      <TableCell className={`${textAlignClass}`}>{formatDate(execution.created_at)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <EmptyState message={t('caseDetailsPage.noExecutions')} />
          )}
        </div>

        <div className="space-y-6 print:space-y-4 print-avoid-break">
          <h2 className="text-2xl font-bold text-gray-900 border-b border-gray-200 pb-2 print:text-xl">
            {t('caseDetailsPage.judicialNoticesTitle', { count: String(judicialRows.length) })}
          </h2>

          {judicialRows.length > 0 ? (
            <div className="border border-gray-200 rounded-lg overflow-x-auto print-no-shadow print:overflow-visible">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50 print:bg-gray-100">
                    <TableHead className={`${textAlignClass} font-semibold min-w-[150px]`}>{t('caseDetailsPage.noticeNumber')}</TableHead>
                    <TableHead className={`${textAlignClass} font-semibold min-w-[150px]`}>{t('caseDetailsPage.certificationDate')}</TableHead>
                    <TableHead className={`${textAlignClass} font-semibold min-w-[150px]`}>{t('caseDetailsPage.serviceCompleted')}</TableHead>
                    <TableHead className={`${textAlignClass} font-semibold min-w-[150px]`}>{t('caseDetailsPage.notificationPeriod')}</TableHead>
                    <TableHead className={`${textAlignClass} font-semibold min-w-[150px]`}>{t('caseDetailsPage.caseFiled')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {judicialRows.map((notice, index) => (
                    <TableRow key={index} className="hover:bg-gray-50 print:hover:bg-transparent">
                      <TableCell className={`${textAlignClass} font-medium`}>{t('caseDetailsPage.noticeLabel', { number: String(index + 1) })}</TableCell>
                      <TableCell className={`${textAlignClass}`}>{formatDate(notice.date)}</TableCell>
                      <TableCell className={`${textAlignClass}`}>{getBooleanBadge(notice.service_completed)}</TableCell>
                      <TableCell className={`${textAlignClass}`}>{t('caseDetailsPage.daysCount', { count: String(notice.notification_period_days || 0) })}</TableCell>
                      <TableCell className={`${textAlignClass}`}>{getBooleanBadge(notice.case_filed)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <EmptyState message={t('caseDetailsPage.noJudicialNotices')} />
          )}
        </div>

        <div className="space-y-6 print:space-y-4 print-avoid-break">
          <h2 className="text-2xl font-bold text-gray-900 border-b border-gray-200 pb-2 print:text-xl">
            {t('caseDetailsPage.petitionsTitle', { count: String(petitionRows.length) })}
          </h2>

          {petitionRows.length > 0 ? (
            <div className="border border-gray-200 rounded-lg overflow-x-auto print-no-shadow print:overflow-visible">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50 print:bg-gray-100">
                    <TableHead className={`${textAlignClass} font-semibold min-w-[120px]`}>{t('caseDetailsPage.petition')}</TableHead>
                    <TableHead className={`${textAlignClass} font-semibold min-w-[150px]`}>{t('caseDetailsPage.orderType')}</TableHead>
                    <TableHead className={`${textAlignClass} font-semibold min-w-[150px]`}>{t('caseDetailsPage.decisionStatusLabel')}</TableHead>
                    <TableHead className={`${textAlignClass} font-semibold min-w-[120px]`}>{t('common.date')}</TableHead>
                    <TableHead className={`${textAlignClass} font-semibold min-w-[120px]`}>{t('caseDetailsPage.appealDate')}</TableHead>
                    <TableHead className={`${textAlignClass} font-semibold min-w-[120px]`}>{t('common.createdAt')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {petitionRows.map((petitionDetail, index) => (
                    <TableRow key={`detail-${index}`} className="hover:bg-gray-50 print:hover:bg-transparent">
                      <TableCell className={`${textAlignClass} font-medium`}>{t('caseDetailsPage.petitionLabel', { number: String(index + 1) })}</TableCell>
                      <TableCell className={`${textAlignClass}`}>
                        <Badge variant="outline">{petitionDetail.type_title || noValue}</Badge>
                      </TableCell>
                      <TableCell className={`${textAlignClass}`}>
                        <Badge
                          className={
                            petitionDetail.decision_status === 'accepted'
                              ? 'bg-green-100 text-green-800 print:bg-gray-200 print:text-gray-800'
                              : petitionDetail.decision_status === 'not accepted'
                                ? 'bg-red-100 text-red-800 print:bg-gray-200 print:text-gray-800'
                                : 'bg-yellow-100 text-yellow-800 print:bg-gray-200 print:text-gray-800'
                          }
                        >
                          {getDecisionStatusLabel(petitionDetail.decision_status)}
                        </Badge>
                      </TableCell>
                      <TableCell className={`${textAlignClass}`}>{formatDate(petitionDetail.date)}</TableCell>
                      <TableCell className={`${textAlignClass}`}>{formatDate(petitionDetail.appeal_date)}</TableCell>
                      <TableCell className={`${textAlignClass}`}>{formatDate(petitionDetail.created_at)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <EmptyState message={t('caseDetailsPage.noPetitions')} />
          )}
        </div>

        <div className="space-y-6 print:space-y-4 print-avoid-break">
          <h2 className="text-2xl font-bold text-gray-900 border-b border-gray-200 pb-2 print:text-xl">
            {t('caseDetailsPage.degreesTitle', { count: String(degreeRows.length) })}
          </h2>

          {degreeRows.length > 0 ? (
            <div className="border border-gray-200 rounded-lg overflow-x-auto print-no-shadow print:overflow-visible">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50 print:bg-gray-100">
                    <TableHead className={`${textAlignClass} font-semibold min-w-[150px]`}>{t('caseDetailsPage.degreeNumber')}</TableHead>
                    <TableHead className={`${textAlignClass} font-semibold min-w-[100px]`}>{t('caseDetailsPage.year')}</TableHead>
                    <TableHead className={`${textAlignClass} font-semibold min-w-[150px]`}>{t('caseDetailsPage.referralDate')}</TableHead>
                    <TableHead className={`${textAlignClass} font-semibold min-w-[150px]`}>{t('caseDetailsPage.caseNumber')}</TableHead>
                    <TableHead className={`${textAlignClass} font-semibold min-w-[150px]`}>{t('common.createdAt')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {degreeRows.map((degree, index) => (
                    <TableRow key={index} className="hover:bg-gray-50 print:hover:bg-transparent">
                      <TableCell className={`${textAlignClass} font-medium`}>{t('caseDetailsPage.degreeLabel', { number: String(index + 1) })}</TableCell>
                      <TableCell className={`${textAlignClass}`}>
                        <Badge variant="outline">{degree.year}</Badge>
                      </TableCell>
                      <TableCell className={`${textAlignClass}`}>{formatDate(degree.referral_date)}</TableCell>
                      <TableCell className={`${textAlignClass}`}>{degree.case_number || noValue}</TableCell>
                      <TableCell className={`${textAlignClass}`}>{formatDate(degree.created_at)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <EmptyState message={t('caseDetailsPage.noDegrees')} />
          )}
        </div>

        <div className="space-y-6 print:space-y-4 print-avoid-break">
          <h2 className="text-2xl font-bold text-gray-900 border-b border-gray-200 pb-2 print:text-xl">
            {t('caseDetailsPage.relatedFilesTitle', { count: String(relatedFileRows.length) })}
          </h2>

          {relatedFileRows.length > 0 ? (
            <div className="border border-gray-200 rounded-lg overflow-x-auto print-no-shadow print:overflow-visible">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50 print:bg-gray-100">
                    <TableHead className={`${textAlignClass} font-semibold min-w-[200px]`}>{t('caseDetailsPage.documentName')}</TableHead>
                    <TableHead className={`${textAlignClass} font-semibold min-w-[100px]`}>{t('common.type')}</TableHead>
                    <TableHead className={`${textAlignClass} font-semibold min-w-[150px]`}>{t('common.date')}</TableHead>
                    <TableHead className={`${textAlignClass} font-semibold min-w-[100px] print:hidden`}>{t('caseDetailsPage.actions')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {relatedFileRows.map((file, index) => (
                    <TableRow key={index} className="hover:bg-gray-50 print:hover:bg-transparent">
                      <TableCell className={`${textAlignClass} font-medium`}>{file.document_name || noValue}</TableCell>
                      <TableCell className={`${textAlignClass}`}>
                        <Badge variant="outline" className="uppercase">
                          {file.document_url?.split('.').pop() || 'FILE'}
                        </Badge>
                      </TableCell>
                      <TableCell className={`${textAlignClass}`}>{formatDate(file.created_at)}</TableCell>
                      <TableCell className={`${textAlignClass} print:hidden`}>
                        {file.document_url ? (
                          <a
                            href={file.document_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                          >
                            {t('documents.view')}
                          </a>
                        ) : (
                          <span className="text-gray-400">{noValue}</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <EmptyState message={t('caseDetailsPage.noRelatedFiles')} />
          )}
        </div>

        <div className="space-y-6 print:space-y-4 print-avoid-break">
          <h2 className="text-2xl font-bold text-gray-900 border-b border-gray-200 pb-2 print:text-xl">
            {t('caseDetailsPage.relatedCasesTitle', { count: String(relatedCaseRows.length) })}
          </h2>

          {relatedCaseRows.length > 0 ? (
            <div className="border border-gray-200 rounded-lg overflow-x-auto print-no-shadow print:overflow-visible">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50 print:bg-gray-100">
                    <TableHead className={`${textAlignClass} font-semibold min-w-[150px]`}>{t('cases.fileNumber')}</TableHead>
                    <TableHead className={`${textAlignClass} font-semibold min-w-[150px]`}>{t('cases.caseNumber')}</TableHead>
                    <TableHead className={`${textAlignClass} font-semibold min-w-[200px]`}>{t('cases.topic')}</TableHead>
                    <TableHead className={`${textAlignClass} font-semibold min-w-[100px] print:hidden`}>{t('caseDetailsPage.actions')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {relatedCaseRows.map((rc, index) => (
                    <TableRow key={index} className="hover:bg-gray-50 print:hover:bg-transparent">
                      <TableCell className={`${textAlignClass} font-medium`}>{rc.file_number || noValue}</TableCell>
                      <TableCell className={`${textAlignClass}`}>{rc.case_number || noValue}</TableCell>
                      <TableCell className={`${textAlignClass}`}>
                        <div className="line-clamp-2" title={rc.topic || noValue}>
                          {rc.topic || noValue}
                        </div>
                      </TableCell>
                      <TableCell className={`${textAlignClass} print:hidden`}>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-blue-600 hover:text-blue-800"
                          onClick={() => window.open(`/cases/${rc.id}`, '_blank')}
                        >
                          {t('common.view')}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <EmptyState message={t('caseDetailsPage.noRelatedCases')} />
          )}
        </div>
      </div>
    </div>
  );
}

function InfoRow({ label, value }) {
  return (
    <div className="flex gap-x-2 py-2 border-b border-gray-100">
      <span className="text-gray-600">{label}:</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}

function TeamRow({ label, value, tone }) {
  const toneMap = {
    blue: 'bg-blue-50 text-blue-900',
    green: 'bg-green-50 text-green-900',
    purple: 'bg-purple-50 text-purple-900',
    orange: 'bg-orange-50 text-orange-900',
  };

  return (
    <div className={`flex gap-x-2 py-3 px-4 rounded-lg print:bg-gray-100 ${toneMap[tone] || 'bg-gray-50 text-gray-900'}`}>
      <span className="text-gray-700">{label}:</span>
      <span className="font-medium print:text-gray-900">{value}</span>
    </div>
  );
}

function EmptyState({ message }) {
  return (
    <div className="border border-gray-200 rounded-lg p-8 text-center">
      <p className="text-gray-500">{message}</p>
    </div>
  );
}

export default CaseDetailsPage;
