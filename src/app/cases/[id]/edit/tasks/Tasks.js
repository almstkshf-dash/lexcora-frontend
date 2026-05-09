"use client"

import React, { useState } from 'react'
import useSWR from 'swr'
import { useLanguage } from '@/contexts/LanguageContext'
import { useTranslations } from '@/hooks/useTranslations'
import AddTaskModal from './AddTaskModal'
import EditTaskModal from './EditTaskModal'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, User, AlertCircle, CheckCircle, Clock, XCircle, Plus, Trash2, Eye } from 'lucide-react'
import { getEmployees } from "@/app/services/api/employees"
import { deleteTask } from "@/app/services/api/tasks"
import { useCaseTasks } from '@/hooks/useCaseTasks'
import { toast } from 'react-toastify'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { useCallback } from 'react'

function Tasks({ caseId }) {
  const { language } = useLanguage()
  const { t } = useTranslations()
  
  // Fetch case tasks using SWR
  const { tasks, error, isLoading, mutate } = useCaseTasks(caseId)
  
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [selectedTask, setSelectedTask] = useState(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [taskToDelete, setTaskToDelete] = useState(null)
  const [isDeleting, setIsDeleting] = useState(false)

  // Fetch employees using SWR for display purposes only
  const { data: employeesResponse } = useSWR(
    'employees',
    getEmployees
  )

  // Extract employees data from API response
  const employees = employeesResponse?.success ? employeesResponse.data : []



  const handleEditTask = (task) => {
    setSelectedTask(task)
    setIsEditModalOpen(true)
  }

  const handleEditModalClose = () => {
    setIsEditModalOpen(false)
    setSelectedTask(null)
    // Refresh tasks list when modal closes (in case task was updated)
    mutate()
  }

  const handleDeleteTask = (taskId) => {
    setTaskToDelete(taskId)
    setIsDeleteDialogOpen(true)
  }

  const confirmDeleteTask = async () => {
    if (!taskToDelete) return

    setIsDeleting(true)
    const loadingToast = toast.loading(t('tasks.deletingTask') || 'جاري حذف المهمة...')
    
    try {
      await deleteTask(taskToDelete)
      
      toast.dismiss(loadingToast)
      toast.success(t('tasks.taskDeletedSuccessfully') || 'تم حذف المهمة بنجاح')
      
      // Close dialog and reset state
      setIsDeleteDialogOpen(false)
      setTaskToDelete(null)
      
      // Refresh tasks list
      mutate()
      
    } catch (error) {
      toast.dismiss(loadingToast)
      
      // Check if it's a permission error (403)
      const isPermissionError = error?.response?.status === 403;
      const errorMessage = isPermissionError 
        ? (error?.response?.data?.message || (language === 'ar' ? 'ليس لديك صلاحية لحذف المهمة' : 'You do not have permission to delete this task'))
        : (error?.response?.data?.message || error?.message || t('tasks.errorDeletingTask') || 'حدث خطأ أثناء حذف المهمة');
      
      toast.error(errorMessage);
    } finally {
      setIsDeleting(false)
    }
  }

  const cancelDeleteTask = () => {
    setIsDeleteDialogOpen(false)
    setTaskToDelete(null)
  }

  const handleFileChange = async (e) => {
    const files = Array.from(e.target.files)
    if (files.length > 0) {
      await handleFileSelect(files)
    }
    // Clear the input so the same file can be selected again
    e.target.value = ''
  }

  // Handle file selection with base64 conversion
  const handleFileSelect = useCallback(async (selectedFiles) => {
    const filesArray = Array.from(selectedFiles);
    
    for (const file of filesArray) {
      try {
        const base64 = await fileToBase64(file);
        
        const newFile = {
          file: base64,
          fileName: file.name,
          fileType: file.type || 'application/octet-stream',
          fileSize: file.size,
          id: Date.now() + Math.random()
        };

        setFormData(prev => ({
          ...prev,
          attachedFiles: [...prev.attachedFiles, newFile]
        }));
      } catch (error) {
      }
    }
  }, []);

  // Handle drag events
  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragOver(false);
    const droppedFiles = e.dataTransfer.files;
    handleFileSelect(droppedFiles);
  }, [handleFileSelect]);

  const removeFile = (indexToRemove) => {
    setFormData(prev => ({
      ...prev,
      attachedFiles: prev.attachedFiles.filter((_, index) => index !== indexToRemove)
    }))
  }

  const priorityOptions = [
    { value: "low", label: t('tasks.priorityLow'), color: "bg-green-100 text-green-800" },
    { value: "medium", label: t('tasks.priorityMedium'), color: "bg-blue-100 text-blue-800" },
    { value: "high", label: t('tasks.priorityHigh'), color: "bg-yellow-100 text-yellow-800" },
    { value: "urgent", label: t('tasks.priorityUrgent'), color: "bg-red-100 text-red-800" }
  ]

  const taskTypeOptions = [
    { value: "administrative", label: t('tasks.taskTypeAdministrative') },
    { value: "legal", label: t('tasks.taskTypeLegal') },
    { value: "session", label: t('tasks.taskTypeSession') },
    { value: "consultative", label: t('tasks.taskTypeConsultative') }
  ]

  const getEmployeeName = (employeeId) => {
    const employee = employees.find(emp => emp.id === parseInt(employeeId))
    return employee ? employee.name : employeeId
  }

  const getPriorityLabel = (priorityValue) => {
    const priority = priorityOptions.find(p => p.value === priorityValue)
    return priority ? priority.label : priorityValue
  }

  const getPriorityColor = (priorityValue) => {
    const priority = priorityOptions.find(p => p.value === priorityValue)
    return priority ? priority.color : "bg-gray-100 text-gray-800"
  }

  const getTaskTypeLabel = (taskTypeValue) => {
    const taskType = taskTypeOptions.find(t => t.value === taskTypeValue)
    return taskType ? taskType.label : taskTypeValue
  }

  // Status translation mapping
  const getStatusText = (status) => {
    const statusTranslations = {
      completed: {
        ar: 'مكتمل',
        en: 'completed'
      },
      in_progress: {
        ar: 'قيد التنفيذ',
        en: 'in progress'
      },
      pending: {
        ar: 'معلق',
        en: 'pending'
      },
      cancelled: {
        ar: 'ملغي',
        en: 'cancelled'
      }
    }
    
    return statusTranslations[status]?.[language] || (status ? status.replace('_', ' ') : 'Unknown')
  }

  // Status color mapping
  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800'
      case 'in_progress':
        return 'bg-blue-100 text-blue-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  // Status icon mapping
  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4" />
      case 'in_progress':
        return <Clock className="w-4 h-4" />
      case 'pending':
        return <AlertCircle className="w-4 h-4" />
      case 'cancelled':
        return <XCircle className="w-4 h-4" />
      default:
        return <AlertCircle className="w-4 h-4" />
    }
  }

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return '-'
    return new Date(dateString).toLocaleDateString(language === 'ar' ? 'ar-AE' : 'en-US')
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            {t('tasks.title') || 'Case Tasks'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center items-center py-8">
            <div className="text-muted-foreground">Loading tasks...</div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            {t('tasks.title') || 'Case Tasks'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center items-center py-8">
            <div className="text-red-500">Error loading tasks</div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            {t('tasks.title') || 'Case Tasks'}
          </CardTitle>
          <Button onClick={() => setIsDialogOpen(true)} size="sm" className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            {t('tasks.addTask') || 'Add Task'}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {(!Array.isArray(tasks) || tasks.length === 0) ? (
          <div className="flex justify-center items-center py-8">
            <div className="text-muted-foreground">
              {t('tasks.noTasks') || 'No tasks found for this case'}
            </div>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('tasks.title') || 'Title'}</TableHead>
                <TableHead>{t('tasks.description') || 'Description'}</TableHead>
                <TableHead>{t('tasks.assignedTo') || 'Assigned To'}</TableHead>
                <TableHead>{t('tasks.assignedBy') || 'Assigned By'}</TableHead>
                <TableHead>{t('tasks.priority') || 'Priority'}</TableHead>
                <TableHead>{t('tasks.status') || 'Status'}</TableHead>
                <TableHead>{t('tasks.dueDate') || 'Due Date'}</TableHead>
                <TableHead>{t('tasks.createdAt') || 'Created'}</TableHead>
                <TableHead>{t('tasks.actions') || 'Actions'}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tasks.map((task) => (
                <TableRow key={task.id}>
                  <TableCell className="font-medium">{task.title}</TableCell>
                  <TableCell className="max-w-xs truncate" title={task.description}>
                    {task.description}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4" />
                      {task.assigned_to_name || getEmployeeName(task.assigned_to) || 'Unassigned'}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4" />
                      {task.created_by || 'Unknown'}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={getPriorityColor(task.priority)} variant="outline">
                      {getPriorityLabel(task.priority)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(task.status)} variant="outline">
                      <div className="flex items-center gap-1">
                        {getStatusIcon(task.status)}
                        {getStatusText(task.status)}
                      </div>
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      {formatDate(task.due_date)}
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {formatDate(task.created_at)}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditTask(task)}
                        className="h-8 w-8 p-0 hover:bg-blue-100"
                      >
                        <Eye className="h-4 w-4 text-blue-600" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteTask(task.id)}
                        className="h-8 w-8 p-0 hover:bg-red-100"
                      >
                        <Trash2 className="h-4 w-4 text-red-600" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
      
      {/* Add Task Modal */}
      <AddTaskModal
        isOpen={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        caseId={caseId}
        onTaskCreated={mutate}
      />

      {/* Edit Task Modal */}
      <EditTaskModal
        isOpen={isEditModalOpen}
        onOpenChange={handleEditModalClose}
        taskId={selectedTask?.id}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center text-red-600">
              {t('tasks.deleteTask') || 'حذف المهمة'}
            </DialogTitle>
            <DialogDescription className="text-center pt-4">
              {t('tasks.confirmDeleteMessage') || 'هل أنت متأكد من حذف هذه المهمة؟ لن تتمكن من التراجع عن هذا الإجراء.'}
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end space-x-2 pt-4">
            <Button 
              variant="outline" 
              onClick={cancelDeleteTask}
              disabled={isDeleting}
            >
              {t('tasks.cancel') || 'إلغاء'}
            </Button>
            <Button 
              variant="destructive"
              onClick={confirmDeleteTask}
              disabled={isDeleting}
              className="flex items-center gap-2"
            >
              {isDeleting && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
              {isDeleting ? (t('tasks.deleting') || 'جاري الحذف...') : (t('tasks.delete') || 'حذف')}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  )
}

export default Tasks