"use client"

import { useState, useCallback } from "react"
import { format } from "date-fns"
import { ar } from "date-fns/locale"
import useSWR from 'swr'
import { useTranslations } from "@/hooks/useTranslations"
import { useFormikContext } from '../FormikContext';



import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Plus, Pen, Trash2, User, File, FileText, ImageIcon, FileIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { getEmployees } from "@/app/services/api/employees"
import TaskModal from "./TaskModal"

function Tasks() {
  // Use Formik context instead of Redux
  const { values, setFieldValue } = useFormikContext();
  const tasks = values.tasks || [];
  const { t } = useTranslations()
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingTaskIndex, setEditingTaskIndex] = useState(null)
  const [isDragOver, setIsDragOver] = useState(false)
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    taskType: "",
    assignedTo: "",
    dueDate: null,
    priority: "",
    attachedFiles: [] // Will store base64 files like parties/petitions
  })


  // Helper function to convert file to base64
  const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  };

  


  // Fetch employees using SWR
  const { data: employeesResponse, error: employeesError, isLoading: loadingEmployees } = useSWR(
    'employees',
    getEmployees
  )

  // Extract employees data from API response
  const employees = employeesResponse?.success ? employeesResponse.data : []

  const handleAddTask = async () => {
    if (formData.title && formData.description && formData.assignedTo && formData.dueDate && formData.priority) {
      
      const newTask = {
        id: Date.now(),
        title: formData.title,
        description: formData.description,
        taskType: formData.taskType || "administrative", // Default value
        assignedTo: formData.assignedTo,
        dueDate: formData.dueDate,
        priority: formData.priority,
        files: formData.attachedFiles // Store base64 files directly
      }
      
      // Update Formik state
      const updatedTasks = [...tasks, newTask];
      setFieldValue('tasks', updatedTasks);
      
      // Reset form
      setFormData({
        title: "",
        description: "",
        taskType: "",
        assignedTo: "",
        dueDate: null,
        priority: "",
        attachedFiles: []
      })
      setIsDialogOpen(false)
      
    }
  }

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
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

  const handleEditTask = (taskIndex) => {
    const task = tasks[taskIndex]
    setEditingTaskIndex(taskIndex)
    
    setFormData({
      title: task.title,
      description: task.description,
      taskType: task.taskType,
      assignedTo: task.assignedTo,
      dueDate: task.dueDate,
      priority: task.priority,
      attachedFiles: task.files || [] // Load existing files
    })
    setIsEditDialogOpen(true)
  }

  const handleUpdateTask = async () => {
    if (formData.title && formData.description && formData.assignedTo && formData.dueDate && formData.priority && editingTaskIndex !== null) {
      const updatedTask = {
        ...tasks[editingTaskIndex],
        title: formData.title,
        description: formData.description,
        taskType: formData.taskType || tasks[editingTaskIndex].taskType,
        assignedTo: formData.assignedTo,
        dueDate: formData.dueDate,
        priority: formData.priority,
        files: formData.attachedFiles
      }
      
      // Update task in Formik state
      const updatedTasks = tasks.map((task, index) => 
        index === editingTaskIndex ? updatedTask : task
      )
      setFieldValue('tasks', updatedTasks);
      
      // Reset form
      setFormData({
        title: "",
        description: "",
        taskType: "",
        assignedTo: "",
        dueDate: null,
        priority: "",
        attachedFiles: []
      })
      setEditingTaskIndex(null)
      setIsEditDialogOpen(false)
      
    }
  }

  const handleDeleteTask = (taskIndex) => {
    const updatedTasks = tasks.filter((_, index) => index !== taskIndex);
    setFieldValue('tasks', updatedTasks);
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

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>{t('tasks.title')}</CardTitle>
            <Button type="button" onClick={() => setIsDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              {t('tasks.addTask')}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {tasks.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {t('tasks.noTasks')}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-center">{t('tasks.taskTitle')}</TableHead>
                  <TableHead className="text-center">{t('tasks.taskDescription')}</TableHead>
                  <TableHead className="text-center">{t('tasks.taskType')}</TableHead>
                  <TableHead className="text-center">{t('tasks.assignedTo')}</TableHead>
                  <TableHead className="text-center">{t('tasks.dueDate')}</TableHead>
                  <TableHead className="text-center">{t('tasks.priority')}</TableHead>
                  <TableHead className="text-center">{t('tasks.attachedFiles')}</TableHead>
                  <TableHead className="text-center">{t('tasks.actions')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tasks.map((task, index) => (
                  <TableRow key={task.id || index}>
                    <TableCell className="text-center">
                      {task.title || t('tasks.notSpecified')}
                    </TableCell>
                    <TableCell className="text-center">
                      {task.description || t('tasks.notSpecified')}
                    </TableCell>
                    <TableCell className="text-center">
                      {getTaskTypeLabel(task.taskType) || t('tasks.notSpecified')}
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center space-x-2">
                        <User className="w-4 h-4 text-blue-600" />
                        <span>{getEmployeeName(task.assignedTo) || t('tasks.notSpecified')}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      {task.dueDate ? format(task.dueDate, "PPP", { locale: ar }) : t('tasks.notSpecified')}
                    </TableCell>
                    <TableCell className="text-center">
                      <span className={cn(
                        "px-2 py-1 rounded-full text-xs font-medium",
                        getPriorityColor(task.priority)
                      )}>
                        {getPriorityLabel(task.priority) || t('tasks.notSpecified')}
                      </span>
                    </TableCell>
                    <TableCell className="text-center">
                      {task.files && task.files.length > 0 ? (
                        <Badge variant="outline">
                          {task.files.length} {t('files.filesCount')}
                        </Badge>
                      ) : (
                        <Badge variant="secondary">
                          0 {t('files.filesCount')}
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex justify-center space-x-2">
                        <Button
                        type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditTask(index)}
                        >
                          <Pen className="h-4 w-4" />
                        </Button>
                        <Button
                        type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteTask(index)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Add Task Modal */}
      <TaskModal
        isOpen={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        mode="add"
        formData={formData}
        onInputChange={handleInputChange}
        onSubmit={handleAddTask}
        onFileChange={handleFileChange}
        onRemoveFile={removeFile}
        employees={employees}
        loadingEmployees={loadingEmployees}
        employeesError={employeesError}
        priorityOptions={priorityOptions}
        taskTypeOptions={taskTypeOptions}
        isDragOver={isDragOver}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      />

      {/* Edit Task Modal */}
      <TaskModal
        isOpen={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        mode="edit"
        formData={formData}
        onInputChange={handleInputChange}
        onSubmit={handleUpdateTask}
        onFileChange={handleFileChange}
        onRemoveFile={removeFile}
        employees={employees}
        loadingEmployees={loadingEmployees}
        employeesError={employeesError}
        priorityOptions={priorityOptions}
        taskTypeOptions={taskTypeOptions}
        isDragOver={isDragOver}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      />
    </div>
  )
}

export default Tasks