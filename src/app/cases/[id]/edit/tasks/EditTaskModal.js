"use client"

import { format } from "date-fns"
import { ar } from "date-fns/locale"
import { useTranslations } from "@/hooks/useTranslations"
import { useState, useEffect } from "react"
import useSWR from 'swr'
import { getTaskById, updateTask } from "@/app/services/api/tasks"
import { getEmployees } from "@/app/services/api/employees"
import { toast } from 'react-toastify'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon, Plus, File as FileIcon, CircleX, User2, Loader2, Upload } from "lucide-react"
import { cn } from "@/lib/utils"
import TaskDocuments from "./TaskDocuments"
import TaskComments from "./TaskComments"

function EditTaskModal({ 
  isOpen, 
  onOpenChange, 
  taskId
}) {
  const { t } = useTranslations()
  
  // Loading state
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  // Local state for edit form data
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    assignedTo: "",
    dueDate: null,
    priority: "",
    status: "",
    attachedFiles: [],
    documents: [],
    comments: []
  })

  // Define options internally
  const priorityOptions = [
    { value: "low", label: t('tasks.priorityLow'), color: "bg-green-100 text-green-800" },
    { value: "medium", label: t('tasks.priorityMedium'), color: "bg-blue-100 text-blue-800" },
    { value: "high", label: t('tasks.priorityHigh'), color: "bg-yellow-100 text-yellow-800" },
    { value: "urgent", label: t('tasks.priorityUrgent'), color: "bg-red-100 text-red-800" }
  ]

  const statusOptions = [
    { value: "pending", label: t('tasks.statusPending'), color: "bg-yellow-100 text-yellow-800" },
    { value: "in_progress", label: t('tasks.statusInProgress'), color: "bg-blue-100 text-blue-800" },
    { value: "completed", label: t('tasks.statusCompleted'), color: "bg-green-100 text-green-800" },
    { value: "cancelled", label: t('tasks.statusCancel'), color: "bg-red-100 text-red-800" }
  ]



  // Fetch task data when taskId is provided
  const { data: taskData, error: taskError, isLoading: taskLoading } = useSWR(
    taskId ? `task-${taskId}` : null,
    () => getTaskById(taskId),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false
    }
  )

  // Fetch employees data
  const { data: employeesResponse, error: employeesError, isLoading: loadingEmployees } = useSWR(
    'employees',
    getEmployees
  )

  // Extract employees data from API response
  const employees = (employeesResponse?.success && Array.isArray(employeesResponse.data)) ? employeesResponse.data : []

  // Populate form when task data is loaded
  useEffect(() => {
    if (isOpen && taskData) {
      const task = taskData
      setFormData({
        title: task.title || "",
        description: task.description || "",
        assignedTo: task.assigned_to?.toString() || "",
        dueDate: task.due_date ? new Date(task.due_date) : null,
        priority: task.priority || "",
        status: task.status || "",
        attachedFiles: task.files || [],
        documents: task.documents || [],
        comments: task.comments || []
      })
    }
  }, [taskData, isOpen])

  // Reset form when modal is closed
  useEffect(() => {
    if (!isOpen) {
      setFormData({
        title: "",
        description: "",
        assignedTo: "",
        dueDate: null,
        priority: "",
        status: "",
        attachedFiles: [],
        documents: [],
        comments: []
      })
    }
  }, [isOpen])

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  // Handle file changes
  const handleFileChange = (files) => {
    const currentFiles = formData.attachedFiles || []
    const newFiles = [...currentFiles, ...files]
    handleInputChange('attachedFiles', newFiles)
  }

  // Handle file removal
  const handleFileRemove = (index) => {
    const updatedFiles = (formData.attachedFiles || []).filter((_, i) => i !== index)
    handleInputChange('attachedFiles', updatedFiles)
  }

  // Handle submit
  const handleSubmit = async () => {
    if (!taskId || !taskData) return

    if (formData.title && formData.description && formData.assignedTo && formData.dueDate && formData.priority && formData.status) {
      setIsSubmitting(true)
      const loadingToast = toast.loading(t('tasks.updatingTask') || 'جاري تحديث المهمة...')
      
      try {
        const updateData = {
          title: formData.title,
          description: formData.description,
          assigned_to: formData.assignedTo,
          due_date: formData.dueDate ? format(formData.dueDate, "yyyy-MM-dd") : null,
          priority: formData.priority,
          status: formData.status,
          case_id: taskData.case_id, // Get case_id from loaded task data
          files: formData.attachedFiles || [],
        }
        
        await updateTask(taskId, updateData)
        
        toast.dismiss(loadingToast)
        toast.success(t('tasks.taskUpdatedSuccessfully') || 'تم تحديث المهمة بنجاح')
        
        // Close modal on success
        onOpenChange(false)
        
      } catch (error) {
        toast.dismiss(loadingToast)
        
        // Check if it's a permission error (403)
        const isPermissionError = error?.response?.status === 403;
        const errorMessage = isPermissionError 
          ? (error?.response?.data?.message || (language === 'ar' ? 'ليس لديك صلاحية لتحديث المهمة' : 'You do not have permission to update this task'))
          : (error?.response?.data?.message || error?.message || t('tasks.errorUpdatingTask') || 'حدث خطأ أثناء تحديث المهمة');
        
        toast.error(errorMessage);
      } finally {
        setIsSubmitting(false)
      }
    } else {
      toast.error(t('tasks.pleaseFillAllRequiredFields') || 'يرجى ملء جميع الحقول المطلوبة')
    }
  }

  // Show loading state
  if (taskLoading || !taskData) {
    return (
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle className='text-center mr-3'>{t('tasks.editTask') || 'تعديل المهمة'}</DialogTitle>
          </DialogHeader>
          <div className="flex justify-center items-center py-8">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Loader2 className="w-4 h-4 animate-spin" />
              {t('tasks.loadingTask') || 'جاري تحميل المهمة...'}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  // Show error state
  if (taskError) {
    return (
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className='text-center mr-3'>{t('tasks.editTask') || 'تعديل المهمة'}</DialogTitle>
          </DialogHeader>
          <div className="flex justify-center items-center py-8">
            <div className="text-red-500">
              {t('tasks.errorLoadingTask') || 'حدث خطأ أثناء تحميل المهمة'}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className='text-center mr-3'>{t('tasks.editTask') || 'تعديل المهمة'}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 overflow-y-auto flex-1 pr-2">
          {/* Task Title */}
          <div className="space-y-2">
            <Label htmlFor="edit-title">{t('tasks.taskTitle') || 'عنوان المهمة'}</Label>
            <Input
              id="edit-title"
              type="text"
              placeholder={t('tasks.taskTitlePlaceholder') || 'أدخل عنوان المهمة'}
              value={formData.title}
              onChange={(e) => handleInputChange("title", e.target.value)}
            />
          </div>

          {/* Task Description */}
          <div className="space-y-2">
            <Label htmlFor="edit-description">{t('tasks.taskDescription') || 'وصف المهمة'}</Label>
            <Input
              id="edit-description"
              type="text"
              placeholder={t('tasks.taskDescriptionPlaceholder') || 'أدخل وصف المهمة'}
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
            />
          </div>


<div className="flex items-center gap-4">
          {/* Priority */}
          <div className="space-y-2">
            <Label htmlFor="edit-priority">{t('tasks.priority') || 'الأولوية'}</Label>
            <Select value={formData.priority} onValueChange={(value) => handleInputChange("priority", value)}>
              <SelectTrigger>
                <SelectValue placeholder={t('tasks.selectPriority') || 'اختر الأولوية'} />
              </SelectTrigger>
              <SelectContent>
                {priorityOptions.map((priority) => (
                  <SelectItem key={priority.value} value={priority.value}>
                    <span className={cn("px-2 py-1 rounded-full text-xs font-medium", priority.color)}>
                      {priority.label}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Status */}
          <div className="space-y-2">
            <Label htmlFor="edit-status">{t('tasks.status') || 'الحالة'}</Label>
            <Select value={formData.status} onValueChange={(value) => handleInputChange("status", value)}>
              <SelectTrigger>
                <SelectValue placeholder={t('tasks.selectStatus') || 'اختر الحالة'} />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map((status) => (
                  <SelectItem key={status.value} value={status.value}>
                    <span className={cn("px-2 py-1 rounded-full text-xs font-medium", status.color)}>
                      {status.label}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {/* Assigned To */}
          <div className="space-y-2">
            <Label htmlFor="edit-assignedTo">{t('tasks.assignedTo') || 'مُكلف إلى'}</Label>
            <Select value={formData.assignedTo} onValueChange={(value) => handleInputChange("assignedTo", value)}>
              <SelectTrigger>
                <SelectValue placeholder={
                  loadingEmployees 
                    ? (t('tasks.loadingEmployees') || 'جاري تحميل الموظفين...') 
                    : (t('tasks.selectEmployee') || 'اختر موظف')
                } />
              </SelectTrigger>
              <SelectContent>
                {loadingEmployees ? (
                  <SelectItem value="loading" disabled>
                    {t('tasks.loadingEmployees') || 'جاري تحميل الموظفين...'}
                  </SelectItem>
                ) : employeesError ? (
                  <SelectItem value="error" disabled>
                    {t('tasks.errorLoadingEmployees') || 'خطأ في تحميل الموظفين'}
                  </SelectItem>
                ) : employees.length === 0 ? (
                  <SelectItem value="no-employees" disabled>
                    {t('tasks.noEmployees') || 'لا يوجد موظفون'}
                  </SelectItem>
                ) : (
                  employees.map((employee) => (
                    <SelectItem key={employee.id} value={employee.id.toString()}>
                      <div className="flex items-center space-x-2">
                        <User2 className="w-4 h-4" />
                        <span>{employee.name}</span>
                      </div>
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

       
          </div>

   {/* Due Date */}
          <div className="space-y-2">
            <Label htmlFor="edit-dueDate">{t('tasks.dueDate') || 'تاريخ الاستحقاق'}</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !formData.dueDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {formData.dueDate ? (
                    format(formData.dueDate, "PPP", { locale: ar })
                  ) : (
                    <span>{t('tasks.selectDueDate') || 'اختر تاريخ الاستحقاق'}</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={formData.dueDate || undefined}
                  onSelect={(date) => {
                    handleInputChange("dueDate", date);
                  }}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
          

          <div className="flex items-center gap-4">
          {/* File Upload Section */}
          <div className="space-y-3">
            <Label htmlFor="editFileUpload" className="text-sm font-medium">
              {t('tasks.attachFiles') || 'إرفاق ملفات'}
            </Label>
            
            {/* Enhanced File Upload Area with Drag & Drop */}
            <div
              className={cn(
                "border-2 border-dashed rounded-lg p-4 text-center transition-colors cursor-pointer",
                "border-gray-300 hover:border-gray-400"
              )}
              onDragOver={(e) => {
                e.preventDefault()
                e.stopPropagation()
              }}
              onDragLeave={(e) => {
                e.preventDefault()
                e.stopPropagation()
              }}
              onDrop={(e) => {
                e.preventDefault()
                e.stopPropagation()
                const files = Array.from(e.dataTransfer.files)
                handleFileChange(files)
              }}
              onClick={() => document.getElementById('editFileUpload').click()}
            >
              <Upload className="h-6 w-6 mx-auto mb-2 text-gray-400" />
              <p className="text-sm text-gray-600 mb-1">
                {t('files.dragAndDrop') || 'اسحب الملفات هنا أو انقر للاختيار'}
              </p>
              <p className="text-xs text-gray-500">
                {t('tasks.supportedFormats') || 'الصيغ المدعومة: PDF, DOC, DOCX, TXT, JPG, PNG'}
              </p>
            </div>

            {/* Hidden File Input */}
            <input
              id="editFileUpload"
              type="file"
              multiple
              className="hidden"
              onChange={(e) => {
                const files = Array.from(e.target.files)
                handleFileChange(files)
                // Reset input value to allow selecting the same file again
                e.target.value = ''
              }}
              accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png"
            />

            {/* Display Selected Files */}
            {formData.attachedFiles && formData.attachedFiles.length > 0 && (
              <div className="space-y-2 max-h-32 overflow-y-auto">
                <div className="text-sm font-medium text-gray-700">
                  {t('tasks.selectedFiles') || 'الملفات المحددة'} ({formData.attachedFiles.length})
                </div>
                {formData.attachedFiles.map((file, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-center space-x-2 flex-1 min-w-0">
                      <FileIcon className="w-4 h-4 text-blue-600 flex-shrink-0" />
                      <span className="text-sm font-medium text-blue-800 truncate">
                        {file.name || file.fileName || 'Unknown file'}
                      </span>
                      <span className="text-xs text-blue-600 flex-shrink-0">
                        ({((file.size || file.fileSize || 0) / 1024 / 1024).toFixed(2)} MB)
                      </span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleFileRemove(index)}
                      className="h-6 w-6 p-0 text-blue-600 hover:text-red-600 hover:bg-red-50 flex-shrink-0"
                    >
                      <CircleX className="w-3 h-3" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Documents Section */}
          <div className="border-t flex-1 ">
            <TaskDocuments 
              documents={formData.documents}
              onDocumentsChange={(docs) => handleInputChange('documents', docs)}
              isEditable={true}
              taskId={taskId}
            />
          </div>

</div>
          {/* Comments Section */}
          <div className="border-t pt-4">
            <TaskComments 
              comments={formData.comments}
              onCommentsChange={(comments) => handleInputChange('comments', comments)}
              isEditable={true}
              taskId={taskId}
            />
          </div>
          
          <div className="flex justify-end space-x-2">
            <Button 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              {t('tasks.cancel') || 'إلغاء'}
            </Button>
            <Button 
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="flex items-center gap-2"
            >
              {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
              {isSubmitting ? (t('tasks.updating') || 'جاري التحديث...') : (t('tasks.update') || 'تحديث')}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default EditTaskModal