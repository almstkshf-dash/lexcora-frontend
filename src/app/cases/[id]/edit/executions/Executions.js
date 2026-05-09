"use client"

import React, { useState } from 'react'
import useSWR, { mutate } from 'swr'

import { getExecutionByCaseId, deleteExecution } from '@/app/services/api/executions'
import { useTranslations } from '@/hooks/useTranslations'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Plus, Pen, Trash2 } from "lucide-react"
import { toast } from "react-toastify"
import AddExecutionModal from './AddExecutionModal'
import EditExecutionModal from './EditExecutionModal'
import DeleteExecutionModal from './DeleteExecutionModal'  

function Executions({ caseId }) {
  const t = useTranslations('executions')
  const tc = useTranslations('common')
  
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [editingExecutionId, setEditingExecutionId] = useState(null)
  const [deletingExecutionId, setDeletingExecutionId] = useState(null)
  
  const { data: executionsData, error, isLoading } = useSWR(
    caseId ? `executions-${caseId}` : null,
    () => getExecutionByCaseId(caseId),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
    }
  )



  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  const formatAmount = (amount) => {
    return `${parseFloat(amount).toFixed(2)}`
  }





  const handleEditExecution = (executionId) => {
    setEditingExecutionId(executionId)
    setIsEditDialogOpen(true)
  }



  const handleDeleteClick = (executionId) => {
    setDeletingExecutionId(executionId)
    setIsDeleteDialogOpen(true)
  }

  const handleDeleteExecution = async () => {
    if (deletingExecutionId) {
      setIsSubmitting(true)
      try {
        await deleteExecution(deletingExecutionId)
        
        // Refresh the data
        mutate(`executions-${caseId}`)
        
        // Show success toast
        toast.success(t('deleteExecutionSuccess') || 'Execution deleted successfully')
        
        // Close modal and reset state
        setIsDeleteDialogOpen(false)
        setDeletingExecutionId(null)
      } catch (error) {
        toast.error(t('deleteExecutionError') || 'Error deleting execution')
      } finally {
        setIsSubmitting(false)
      }
    }
  }

  const handleCancelDelete = () => {
    setIsDeleteDialogOpen(false)
    setDeletingExecutionId(null)
  }

  const getStatusBadge = (status) => {
    const statusColors = {
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      completed: 'bg-green-100 text-green-800 border-green-200',
      cancelled: 'bg-red-100 text-red-800 border-red-200',
      'in-progress': 'bg-blue-100 text-blue-800 border-blue-200'
    }
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${statusColors[status] || 'bg-gray-100 text-gray-800 border-gray-200'}`}>
        {status}
      </span>
    )
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        <span className="ml-2">{tc('loading')}</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600">{tc('errorLoading')}</p>
      </div>
    )
  }

  const executions = Array.isArray(executionsData?.data) ? executionsData.data : []

  if (executions.length === 0) {
    return (
      <div className="text-center py-8 flex items-center flex-col gap-3.5">
        <Button onClick={() => setIsDialogOpen(true)} size="sm">
          <Plus className="h-4 w-4 mr-2" />
          {t('addExecution')}
        </Button>
        <p className="text-gray-500">{t('noExecutions')}</p>
        <AddExecutionModal
          isOpen={isDialogOpen}
          onClose={() => {
            setIsDialogOpen(false)
            // Refresh data when modal closes (in case execution was added)
            mutate(`executions-${caseId}`)
          }}
          caseId={caseId}
        />
      </div>
    )
  }

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium">{t('title')}</h3>
        <Button onClick={() => setIsDialogOpen(true)} size="sm">
          <Plus className="h-4 w-4 mr-2" />
          {t('addExecution')}
        </Button>
      </div>
      
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('date')}</TableHead>
              <TableHead>{t('type')}</TableHead>
              <TableHead>{t('status')}</TableHead>
              <TableHead className="text-right">{t('amount')}</TableHead>
              <TableHead className="text-center">{tc('actions')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {executions.map((execution, index) => (
              <TableRow key={execution.id || index}>
                <TableCell className="font-medium">
                  {formatDate(execution.date)}
                </TableCell>
                <TableCell>
                  {execution.type}
                </TableCell>
                <TableCell>
                  {getStatusBadge(execution.status)}
                </TableCell>
                <TableCell className="text-right">
                  {formatAmount(execution.amount)}
                </TableCell>
                <TableCell className="text-center">
                  <div className="flex items-center justify-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEditExecution(execution.id)}
                      className="h-8 w-8 p-0"
                    >
                      <Pen className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteClick(execution.id)}
                      className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
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

      <AddExecutionModal
        isOpen={isDialogOpen}
        onClose={() => {
          setIsDialogOpen(false)
          // Refresh data when modal closes (in case execution was added)
          mutate(`executions-${caseId}`)
        }}
        caseId={caseId}
      />

      <EditExecutionModal
        isOpen={isEditDialogOpen}
        onClose={() => {
          setIsEditDialogOpen(false)
          setEditingExecutionId(null)
        }}
        executionId={editingExecutionId}
        caseId={caseId}
      />

      <DeleteExecutionModal
        isOpen={isDeleteDialogOpen}
        onClose={handleCancelDelete}
        onConfirm={handleDeleteExecution}
        isSubmitting={isSubmitting}
      />
    </div>
  )
}

export default Executions