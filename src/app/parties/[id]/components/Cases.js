'use client'
import React, { useState, useMemo } from 'react'
import useSWR from 'swr'
import { useRouter } from 'next-intl/client'
import { getPartyCases } from '@/app/services/api/parties'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useTranslations } from '@/hooks/useTranslations'
import { useLanguage } from '@/contexts/LanguageContext'
import { Eye, Scale, Calendar, FileText, MoreHorizontal, Edit, Trash2, CheckSquare, Gavel, FileSearch, User, Printer, FileSpreadsheet } from 'lucide-react'
import AddSessionModal from '@/app/cases/modals/AddSessionModal'
import AddTaskModal from '@/app/cases/modals/AddTaskModal'
import AddCaseDegreeModal from '@/app/cases/modals/AddCaseDegreeModal'
import AddExecutionModal from '@/app/cases/[id]/edit/executions/AddExecutionModal'
import AddMemoModal from '@/app/cases/[id]/edit/memos/AddMemoModal'

function Cases({ partyId }) {
  const { t } = useTranslations()
  const { isRTL, language } = useLanguage()
  const router = useRouter()
  
  // Modal state
  const [isAddSessionModalOpen, setIsAddSessionModalOpen] = useState(false)
  const [isAddTaskModalOpen, setIsAddTaskModalOpen] = useState(false)
  const [isAddCaseDegreeModalOpen, setIsAddCaseDegreeModalOpen] = useState(false)
  const [isAddExecutionModalOpen, setIsAddExecutionModalOpen] = useState(false)
  const [isAddMemoModalOpen, setIsAddMemoModalOpen] = useState(false)
  const [selectedCaseId, setSelectedCaseId] = useState(null)
  
  const { data, error, isLoading, mutate } = useSWR(
    partyId ? [`/parties/${partyId}/cases`] : null,
    () => getPartyCases(partyId),
    {
      revalidateOnFocus: false,
    }
  )

  // Helper function to get localized text
  const getLocalizedText = (arText, enText) => {
    if (language === 'ar') {
      return arText || enText || ''
    } else {
      return enText || arText || ''
    }
  }

  // Helper function to mask sensitive data
  const maskSensitiveData = (data, isSecret) => {
    return isSecret ? '***' : data
  }

  // Helper function to format date
  const formatDate = (dateString) => {
    if (!dateString) return ''
    const date = new Date(dateString)
    return date.toLocaleDateString(language === 'ar' ? 'ar-AE' : 'en-US')
  }

  // Helper function to get status badge
  const getStatusBadge = (status) => {
    if (!status) return null
    
    const statusLower = status.toLowerCase()
    let variant, text, color
    
    switch (statusLower) {
      case 'active':
        variant = 'default'
        text = language === 'ar' ? 'نشطة' : 'Active'
        color = 'bg-green-100 text-green-800 hover:bg-green-100'
        break
      case 'pending':
        variant = 'secondary'
        text = language === 'ar' ? 'قيد الانتظار' : 'Pending'
        color = 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100'
        break
      case 'inactive':
        variant = 'outline'
        text = language === 'ar' ? 'غير نشطة' : 'Inactive'
        color = 'bg-gray-100 text-gray-800 hover:bg-gray-100'
        break
      default:
        variant = 'outline'
        text = status
        color = 'bg-gray-100 text-gray-800 hover:bg-gray-100'
    }
    
    return (
      <Badge variant={variant} className={color}>
        {text}
      </Badge>
    )
  }

  // Action handlers
  const handleEdit = (caseId) => {
    router.push(`/cases/${caseId}/edit`)
  }

  const handleDelete = (caseId) => {
    // TODO: Implement delete functionality
  }

  const handleAddNote = (caseId) => {
    setSelectedCaseId(caseId)
    setIsAddMemoModalOpen(true)
  }

  const handleAddSession = (caseId) => {
    setSelectedCaseId(caseId)
    setIsAddSessionModalOpen(true)
  }

  const handleSessionAdded = (newSession) => {
    mutate()
  }

  const handleAddTask = (caseId) => {
    setSelectedCaseId(caseId)
    setIsAddTaskModalOpen(true)
  }

  const handleTaskAdded = (newTask) => {
    mutate()
  }

  const handleAddExecution = (caseId) => {
    setSelectedCaseId(caseId)
    setIsAddExecutionModalOpen(true)
  }

  const handleAddCourtLevel = (caseId) => {
    setSelectedCaseId(caseId)
    setIsAddCaseDegreeModalOpen(true)
  }

  const handleCaseDegreeAdded = (newCaseDegree) => {
    mutate()
  }

  const handleMemoAdded = () => {
    mutate()
  }

  const handlePrint = (caseId) => {
    router.push(`/cases/${caseId}`)
  }

  // Export to Excel function
  const handleExportToExcel = () => {
    // Dynamically import xlsx
    import('xlsx').then((XLSX) => {
      // Prepare data for export
      const exportData = cases.map((case_) => ({
        [t('caseForm.caseNumber') || 'رقم القضية']: case_.case_number || '',
        [t('casesTable.fileNumber') || 'رقم الملف']: maskSensitiveData(case_.file_number, case_.is_secret),
        [t('casesTable.topic') || 'الموضوع']: maskSensitiveData(case_.topic, case_.is_secret),
        [t('casesTable.court') || 'المحكمة']: maskSensitiveData(
          getLocalizedText(case_.court_ar, case_.court_en),
          case_.is_secret
        ),
        [t('casesTable.caseType') || 'نوع القضية']: maskSensitiveData(
          getLocalizedText(case_.case_type_ar, case_.case_type_en),
          case_.is_secret
        ),
        [t('casesTable.classification') || 'التصنيف']: maskSensitiveData(
          getLocalizedText(case_.case_classification_ar, case_.case_classification_en),
          case_.is_secret
        ),
        [t('caseForm.startDate') || 'تاريخ البداية']: maskSensitiveData(formatDate(case_.start_date), case_.is_secret),
        [t('casesTable.clientParties') || 'الموكلين']: case_.is_secret ? '***' : (case_.clientParties?.join(', ') || '-'),
        [t('casesTable.opponentParties') || 'الخصوم']: case_.is_secret ? '***' : (case_.opponentParties?.join(', ') || '-'),
        [t('casesTable.status') || 'الحالة']: case_.status || '',
        [t('casesTable.sessionCount') || 'عدد الجلسات']: case_.session_count || 0,
        [t('casesTable.lastSessionDate') || 'آخر جلسة']: case_.last_session_date ? formatDate(case_.last_session_date) : '-',
        [t('caseToggles.isImportant') || 'مهمة']: case_.is_important === 1 ? (language === 'ar' ? 'نعم' : 'Yes') : (language === 'ar' ? 'لا' : 'No'),
        [t('caseToggles.isSecret') || 'سرية']: case_.is_secret === 1 ? (language === 'ar' ? 'نعم' : 'Yes') : (language === 'ar' ? 'لا' : 'No'),
        [t('caseToggles.isArchived') || 'مؤرشفة']: case_.is_archived === 1 ? (language === 'ar' ? 'نعم' : 'Yes') : (language === 'ar' ? 'لا' : 'No'),
      }))

      // Create worksheet
      const worksheet = XLSX.utils.json_to_sheet(exportData)
      
      // Create workbook
      const workbook = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(workbook, worksheet, language === 'ar' ? 'القضايا' : 'Cases')
      
      // Generate filename with current date
      const currentDate = new Date().toISOString().split('T')[0]
      const filename = `${language === 'ar' ? 'قضايا_الطرف' : 'Party_Cases'}_${currentDate}.xlsx`
      
      // Save file
      XLSX.writeFile(workbook, filename)
    }).catch((error) => {
    })
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">{t('common.loading') || 'جاري التحميل...'}</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <p className="text-destructive">{t('common.error') || 'حدث خطأ في تحميل البيانات'}</p>
        </div>
      </div>
    )
  }

  const cases = Array.isArray(data?.data) ? data.data : []

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Scale className="h-5 w-5" />
              {t('partyTabs.cases') || 'القضايا'} ({cases.length})
            </CardTitle>
            {cases.length > 0 && (
              <Button 
                onClick={handleExportToExcel}
                variant="outline"
                size="sm"
                className="gap-2"
              >
                <FileSpreadsheet className="h-4 w-4" />
                {language === 'ar' ? 'تصدير إلى Excel' : 'Export to Excel'}
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {cases.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>{t('cases.noCases') || 'لا توجد قضايا'}</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className='text-center'>
                  <TableRow>
                    <TableHead className='text-center'>
                      {t('caseForm.caseNumber')}
                    </TableHead>
                    <TableHead className='text-center'>
                      {t('casesTable.fileNumber')}
                    </TableHead>
                    <TableHead className='text-center'>
                      {t('casesTable.topic')}
                    </TableHead>
                    <TableHead className='text-center'>
                      {t('casesTable.court')}
                    </TableHead>
                    <TableHead className='text-center'>
                      {t('casesTable.caseType')}
                    </TableHead>
                    <TableHead className='text-center'>
                      {t('casesTable.classification')}
                    </TableHead>
                    <TableHead className='text-center'>
                      {t('caseForm.startDate')}
                    </TableHead>
                    <TableHead className='text-center'>
                      {t('casesTable.clientParties')}
                    </TableHead>
                    <TableHead className='text-center'>
                      {t('casesTable.opponentParties')}
                    </TableHead>
                    <TableHead className='text-center'>
                      {t('casesTable.status')}
                    </TableHead>
                    <TableHead className='text-center'>
                      {t('casesTable.flags')}
                    </TableHead>
                    <TableHead className='text-center'>
                      {t('casesTable.sessionCount')}
                    </TableHead>
                    <TableHead className='text-center'>
                      {t('casesTable.lastSessionDate')}
                    </TableHead>
                    <TableHead className='text-center'>
                      {t('casesTable.actions')}
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {cases.map((case_) => (
                    <TableRow key={case_.id}>
                      <TableCell className="font-medium">
                        {case_.case_number}
                      </TableCell>
                      <TableCell>
                        {maskSensitiveData(case_.file_number, case_.is_secret)}
                      </TableCell>
                      <TableCell>
                        {maskSensitiveData(case_.topic, case_.is_secret)}
                      </TableCell>
                      <TableCell>
                        {maskSensitiveData(
                          getLocalizedText(case_.court_ar, case_.court_en),
                          case_.is_secret
                        )}
                      </TableCell>
                      <TableCell>
                        {maskSensitiveData(
                          getLocalizedText(case_.case_type_ar, case_.case_type_en),
                          case_.is_secret
                        )}
                      </TableCell>
                      <TableCell>
                        {maskSensitiveData(
                          getLocalizedText(case_.case_classification_ar, case_.case_classification_en),
                          case_.is_secret
                        )}
                      </TableCell>
                      <TableCell>
                        {maskSensitiveData(formatDate(case_.start_date), case_.is_secret)}
                      </TableCell>
                      <TableCell>
                        {case_.is_secret ? (
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-muted-foreground" />
                            <span>***</span>
                          </div>
                        ) : (
                          <div className="space-y-1">
                            {Array.isArray(case_.clientParties) && case_.clientParties.length > 0 ? case_.clientParties.map((party, index) => (
                              <div key={index} className="flex items-center gap-2">
                                <User className="h-4 w-4 text-blue-600" />
                                <span className="text-sm">{party}</span>
                              </div>
                            )) : (
                              <div className="flex items-center gap-2 text-muted-foreground">
                                <User className="h-4 w-4" />
                                <span className="text-sm">-</span>
                              </div>
                            )}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        {case_.is_secret ? (
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-muted-foreground" />
                            <span>***</span>
                          </div>
                        ) : (
                          <div className="space-y-1">
                            {Array.isArray(case_.opponentParties) && case_.opponentParties.length > 0 ? case_.opponentParties.map((party, index) => (
                              <div key={index} className="flex items-center gap-2">
                                <User className="h-4 w-4 text-red-600" />
                                <span className="text-sm">{party}</span>
                              </div>
                            )) : (
                              <div className="flex items-center gap-2 text-muted-foreground">
                                <User className="h-4 w-4" />
                                <span className="text-sm">-</span>
                              </div>
                            )}
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        {getStatusBadge(case_.status)}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1 flex-wrap">
                          {case_.is_important === 1 && (
                            <Badge variant="destructive" className="text-xs">
                              {t('caseToggles.isImportant')}
                            </Badge>
                          )}
                          {case_.is_secret === 1 && (
                            <Badge variant="outline" className="text-xs">
                              {t('caseToggles.isSecret')}
                            </Badge>
                          )}
                          {case_.is_archived === 1 && (
                            <Badge variant="secondary" className="text-xs">
                              {t('caseToggles.isArchived')}
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">
                            {case_.session_count || 0}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">
                            {case_.last_session_date ? formatDate(case_.last_session_date) : '-'}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu dir={isRTL ? 'rtl' : 'ltr'}>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <span className="sr-only">Open menu</span>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align={isRTL ? 'start' : 'end'}>
                            <DropdownMenuItem onClick={() => handleEdit(case_.id)}>
                              <Edit className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                              {t('casesTable.edit')}
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handlePrint(case_.id)}>
                              <Printer className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                              {language === 'ar' ? 'طباعة الملف' : 'Print Case'}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => handleAddNote(case_.id)}>
                              <FileText className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                              {t('casesTable.addNote')}
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleAddSession(case_.id)}>
                              <Calendar className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                              {t('casesTable.addSession')}
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleAddTask(case_.id)}>
                              <CheckSquare className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                              {t('casesTable.addTask')}
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleAddExecution(case_.id)}>
                              <Gavel className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                              {t('casesTable.addExecution')}
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleAddCourtLevel(case_.id)}>
                              <Scale className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                              {language === 'ar' ? 'اضافة درجة تقاضي' : 'Add Court Level'}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              onClick={() => handleDelete(case_.id)}
                              className="text-destructive focus:text-destructive"
                            >
                              <Trash2 className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                              {t('casesTable.delete')}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Session Modal */}
      <AddSessionModal
        isOpen={isAddSessionModalOpen}
        onClose={() => setIsAddSessionModalOpen(false)}
        caseId={selectedCaseId}
        onSessionAdded={handleSessionAdded}
      />

      {/* Add Task Modal */}
      <AddTaskModal
        isOpen={isAddTaskModalOpen}
        onClose={() => setIsAddTaskModalOpen(false)}
        caseId={selectedCaseId}
        onTaskAdded={handleTaskAdded}
      />

      {/* Add Case Degree Modal */}
      <AddCaseDegreeModal
        isOpen={isAddCaseDegreeModalOpen}
        onClose={() => setIsAddCaseDegreeModalOpen(false)}
        caseId={selectedCaseId}
        onCaseDegreeAdded={handleCaseDegreeAdded}
      />

      {/* Add Execution Modal */}
      <AddExecutionModal
        isOpen={isAddExecutionModalOpen}
        onClose={() => setIsAddExecutionModalOpen(false)}
        caseId={selectedCaseId}
      />

      {/* Add Memo Modal */}
      <AddMemoModal
        isOpen={isAddMemoModalOpen}
        onClose={() => setIsAddMemoModalOpen(false)}
        caseId={selectedCaseId}
        onSuccess={handleMemoAdded}
      />
    </>
  )
}

export default Cases

