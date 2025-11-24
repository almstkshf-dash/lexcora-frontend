"use client"

import { useState } from "react"
import { useFormikContext } from '../FormikContext'
import { format } from "date-fns"
import { ar } from "date-fns/locale"
import { useTranslations } from "@/hooks/useTranslations"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Pen, Trash2, File } from "lucide-react"
import { cn } from "@/lib/utils"
import ExecutionModal from "./ExecutionModal"

function Execution() {
  const { values, setFieldValue } = useFormikContext()
  const executions = values.executions || []
  const { t } = useTranslations()
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingExecutionIndex, setEditingExecutionIndex] = useState(null)
  const [formData, setFormData] = useState({
    date: null,
    type: "",
    status: "",
    amount: "",
    attachedFiles: []
  })

  const executionStatuses = [
    { value: "pending", label: t('executions.pending') },
    { value: "in_progress", label: t('executions.inProgress') },
    { value: "completed", label: t('executions.completed') },
    { value: "cancelled", label: t('executions.cancelled') },
  ]

  const handleAddExecution = async () => {
    if (formData.date && formData.type && formData.status ) {
      const newExecution = {
        id: Date.now(),
        date: format(formData.date, "yyyy-MM-dd"), // Format date as YYYY-MM-DD for database
        type: formData.type,
        status: formData.status,
        amount: formData.amount,
        attachedFiles: formData.attachedFiles
      }
      
      // Add execution to Formik
      const updatedExecutions = [...executions, newExecution]
      setFieldValue('executions', updatedExecutions)
      
      setFormData({
        date: null,
        type: "",
        status: "",
        amount: "",
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

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files)
    if (files.length > 0) {
      setFormData(prev => ({
        ...prev,
        attachedFiles: [...prev.attachedFiles, ...files]
      }))
    }
    // Clear the input so the same file can be selected again
    e.target.value = ''
  }

  const removeFile = (indexToRemove) => {
    setFormData(prev => ({
      ...prev,
      attachedFiles: prev.attachedFiles.filter((_, index) => index !== indexToRemove)
    }))
  }

  const handleEditExecution = (index) => {
    const execution = executions[index]
    setEditingExecutionIndex(index)
    
    // Use existing files directly
    const attachedFiles = execution.attachedFiles || []
    
    setFormData({
      date: execution.date ? new Date(execution.date) : null, // Convert date string back to Date object
      type: execution.type,
      status: execution.status,
      amount: execution.amount,
      attachedFiles: attachedFiles
    })
    setIsEditDialogOpen(true)
  }

  const handleUpdateExecution = async () => {
    if (formData.date && formData.type && formData.status && formData.amount && editingExecutionIndex !== null) {
      const updatedExecution = {
        id: executions[editingExecutionIndex].id,
        date: format(formData.date, "yyyy-MM-dd"), // Format date as YYYY-MM-DD for database
        type: formData.type,
        status: formData.status,
        amount: formData.amount,
        attachedFiles: formData.attachedFiles
      }
      
      // Update execution in Formik
      const updatedExecutions = executions.map((execution, index) => 
        index === editingExecutionIndex ? updatedExecution : execution
      )
      setFieldValue('executions', updatedExecutions)
      
      setFormData({
        date: null,
        type: "",
        status: "",
        amount: "",
        attachedFiles: []
      })
      setEditingExecutionIndex(null)
      setIsEditDialogOpen(false)
    }
  }

  const handleDeleteExecution = (index) => {
    const updatedExecutions = executions.filter((_, i) => i !== index)
    setFieldValue('executions', updatedExecutions)
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
          <CardTitle className="text-lg font-medium">{t('executions.title')}</CardTitle>
          <Button 
                          type="button"
onClick={() => setIsDialogOpen(true)} size="sm">
            <Plus className="h-4 w-4 mr-2" />
            {t('executions.addExecution')}
          </Button>
        </CardHeader>
        <CardContent>
          {executions.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>{t('executions.noExecutions')}</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-center">{t('executions.date')}</TableHead>
                  <TableHead className="text-center">{t('executions.type')}</TableHead>
                  <TableHead className="text-center">{t('executions.status')}</TableHead>
                  <TableHead className="text-center">{t('executions.amount')}</TableHead>
                  <TableHead className="text-center">{t('executions.attachedFiles')}</TableHead>
                  <TableHead className="text-center">{t('executions.actions')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {executions.map((execution, index) => {                  
                  return (
                    <TableRow key={execution.id}>
                      <TableCell className="text-center">
                        {execution.date ? format(new Date(execution.date), "PPP", { locale: ar }) : t('executions.notSpecified')}
                      </TableCell>
                      <TableCell className="text-center">
                        {execution.type || t('executions.notSpecified')}
                      </TableCell>
                      <TableCell className="text-center">
                        <span className={cn(
                          "px-2 py-1 rounded-full text-xs font-medium",
                          execution.status === "completed" && "bg-green-100 text-green-800 completion-chip",
                          execution.status === "in_progress" && "bg-blue-100 text-blue-800",
                          execution.status === "pending" && "bg-yellow-100 text-yellow-800",
                          execution.status === "cancelled" && "bg-red-100 text-red-800",
                          execution.status === "suspended" && "bg-gray-100 text-gray-800"
                        )}>
                          {executionStatuses.find(status => status.value === execution.status)?.label || execution.status}
                        </span>
                      </TableCell>
                      <TableCell className="text-center">
                        {execution.amount ? new Intl.NumberFormat('ar-AE', { 
                          style: 'currency', 
                          currency: 'AED' 
                        }).format(execution.amount) : t('executions.notSpecified')}
                      </TableCell>
                      <TableCell className="text-center">
                        {execution.attachedFiles && execution.attachedFiles.length > 0 ? (
                          <div className="space-y-1">
                            {execution.attachedFiles.length === 1 ? (
                              <div className="flex items-center justify-center space-x-2">
                                <File className="w-4 h-4 text-blue-600" />
                                <span className="text-sm text-blue-600 hover:underline cursor-pointer truncate max-w-xs">
                                  {execution.attachedFiles[0]?.name || 'Unknown file'}
                                </span>
                              </div>
                            ) : (
                              <div className="flex items-center justify-center space-x-2">
                                <File className="w-4 h-4 text-blue-600" />
                                <span className="text-sm text-blue-600 font-medium">
                                  {t('executions.filesCount', { count: execution.attachedFiles.length })}
                                </span>
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="text-gray-400 text-sm">{t('executions.noFiles')}</span>
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex justify-center space-x-2">
                          <Button
                                          type="button"

                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditExecution(index)}
                          >
                            <Pen className="h-4 w-4" />
                          </Button>
                          <Button
                                          type="button"

                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteExecution(index)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <ExecutionModal
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onSubmit={handleAddExecution}
        formData={formData}
        onInputChange={handleInputChange}
        onFileChange={handleFileChange}
        removeFile={removeFile}
        executionStatuses={executionStatuses}
        mode="add"
      />

      <ExecutionModal
        isOpen={isEditDialogOpen}
        onClose={() => setIsEditDialogOpen(false)}
        onSubmit={handleUpdateExecution}
        formData={formData}
        onInputChange={handleInputChange}
        onFileChange={handleFileChange}
        removeFile={removeFile}
        executionStatuses={executionStatuses}
        mode="edit"
      />
    </div>
  )
}

export default Execution
