"use client"

import { useState } from "react"
import { useSelector } from "react-redux"
import { format } from "date-fns"
import { ar } from "date-fns/locale"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Loader2, Plus, Pen, Trash2 } from "lucide-react"
import { useTranslations } from "@/hooks/useTranslations"
import { useCaseMemos } from "./hooks/useCaseMemos"
import AddMemoModal from "./AddMemoModal"
import EditMemoModal from "./EditMemoModal"
import DeleteMemoModal from "./DeleteMemoModal"

// Helper function to format date
const formatDate = (dateString) => {
  if (!dateString) return 'N/A'
  
  try {
    const date = new Date(dateString)
    if (isNaN(date.getTime())) return 'N/A'
    return format(date, "PPP", { locale: ar })
  } catch (error) {
    return 'N/A'
  }
}

// Helper function to get status badge (moved inside component to access translations)

// Helper function to render approval status
const getApprovalIcon = (isApproved) => {
  return isApproved ? "✓" : "✗"
}

function Memos({ caseId }) {
  const { t } = useTranslations()
  const { memos, isLoading, error, mutate } = useCaseMemos(caseId)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedMemoId, setSelectedMemoId] = useState(null)
  const [selectedMemoTitle, setSelectedMemoTitle] = useState("")
  
  // Get employee role from Redux
  const employeeRole = useSelector((state) => state.auth.roleEn)

  // Helper function to get status badge with translations
  const getStatusBadge = (status) => {
    const statusMap = {
      "Draft": { className: "bg-gray-100 text-gray-800", label: t('memos.statusDraft') },
      "Approved": { className: "bg-green-100 text-green-800", label: t('memos.statusApproved') },
      "Pending Approval": { className: "bg-yellow-100 text-yellow-800", label: t('memos.statusPendingApproval') },
      "Submitted to Court": { className: "bg-blue-100 text-blue-800", label: t('memos.statusSubmittedToCourt') },
      "Rejected": { className: "bg-red-100 text-red-800", label: t('memos.statusRejected') }
    }
    
    const statusInfo = statusMap[status] || { className: "bg-gray-100 text-gray-800", label: status }
    return <Badge className={statusInfo.className}>{statusInfo.label}</Badge>
  }

  const handleMemoAdded = () => {
    // Refresh the memos list after successful addition
    mutate()
  }

  const handleMemoUpdated = () => {
    // Refresh the memos list after successful update
    mutate()
  }

  const handleEditClick = (memoId) => {
    setSelectedMemoId(memoId)
    setIsEditDialogOpen(true)
  }

  const handleEditClose = () => {
    setIsEditDialogOpen(false)
    setSelectedMemoId(null)
  }

  const handleDeleteClick = (memoId, memoTitle) => {
    setSelectedMemoId(memoId)
    setSelectedMemoTitle(memoTitle)
    setIsDeleteDialogOpen(true)
  }

  const handleDeleteClose = () => {
    setIsDeleteDialogOpen(false)
    setSelectedMemoId(null)
    setSelectedMemoTitle("")
  }

  const handleMemoDeleted = () => {
    // Refresh the memos list after successful deletion
    mutate()
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-8 text-red-500">
        {t('memos.errorLoadingMemos')}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>{t('memos.title')}</CardTitle>
            <Button onClick={() => setIsAddDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              {t('memos.addMemo')}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {(!Array.isArray(memos) || memos.length === 0) ? (
            <div className="text-center py-8 text-muted-foreground">
              {t('memos.noMemos')}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-center">{t('memos.memoTitle')}</TableHead>
                    <TableHead className="text-center">{t('memos.submissionDate')}</TableHead>
                    <TableHead className="text-center">{t('memos.status')}</TableHead>
                    <TableHead className="text-center">{t('memos.lawyerApproval')}</TableHead>
                    <TableHead className="text-center">{t('memos.secretaryApproval')}</TableHead>
                    <TableHead className="text-center">{t('memos.consultantApproval')}</TableHead>
                    <TableHead className="text-center">{t('memos.adminApproval')}</TableHead>
                    <TableHead className="text-center">{t('memos.createdBy')}</TableHead>
                    <TableHead className="text-center">{t('memos.createdAt')}</TableHead>
                    <TableHead className="text-center">{t('memos.actions')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {memos.map((memo) => (
                    <TableRow key={memo.id}>
                      <TableCell className="text-center font-medium">
                        {memo.title}
                      </TableCell>
                      <TableCell className="text-center">
                        {formatDate(memo.submission_date)}
                      </TableCell>
                      <TableCell className="text-center">
                        {getStatusBadge(memo.status)}
                      </TableCell>
                      <TableCell className="text-center">
                        <span className={memo.is_lawyer_approved ? "text-green-600" : "text-red-600"}>
                          {getApprovalIcon(memo.is_lawyer_approved)}
                        </span>
                      </TableCell>
                      <TableCell className="text-center">
                        <span className={memo.is_secretary_approved ? "text-green-600" : "text-red-600"}>
                          {getApprovalIcon(memo.is_secretary_approved)}
                        </span>
                      </TableCell>
                      <TableCell className="text-center">
                        <span className={memo.is_consultant_approved ? "text-green-600" : "text-red-600"}>
                          {getApprovalIcon(memo.is_consultant_approved)}
                        </span>
                      </TableCell>
                      <TableCell className="text-center">
                        <span className={memo.is_admin_approved ? "text-green-600" : "text-red-600"}>
                          {getApprovalIcon(memo.is_admin_approved)}
                        </span>
                      </TableCell>
                      <TableCell className="text-center">
                        {memo.created_by_name}
                      </TableCell>
                      <TableCell className="text-center">
                        {formatDate(memo.created_at)}
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex justify-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditClick(memo.id)}
                            className="h-8 w-8 p-0"
                            title={t('memos.edit')}
                          >
                            <Pen className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteClick(memo.id, memo.title)}
                            className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                            title={t('memos.delete')}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Memo Modal */}
      <AddMemoModal 
        isOpen={isAddDialogOpen}
        onClose={() => setIsAddDialogOpen(false)}
        caseId={caseId}
        onSuccess={handleMemoAdded}
      />

      {/* Edit Memo Modal */}
      <EditMemoModal 
        isOpen={isEditDialogOpen}
        onClose={handleEditClose}
        memoId={selectedMemoId}
        onSuccess={handleMemoUpdated}
        employeeRole={employeeRole}
      />

      {/* Delete Memo Modal */}
      <DeleteMemoModal 
        isOpen={isDeleteDialogOpen}
        onClose={handleDeleteClose}
        memoId={selectedMemoId}
        memoTitle={selectedMemoTitle}
        onSuccess={handleMemoDeleted}
      />
    </div>
  )
}

export default Memos