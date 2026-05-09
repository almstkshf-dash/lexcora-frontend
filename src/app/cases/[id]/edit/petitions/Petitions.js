import React, { useState } from 'react'
import useSWR from 'swr'
import { toast } from 'react-toastify'
import { useTranslations } from '@/hooks/useTranslations'
import { getCasePetitionsByCaseId, createCasePetition, updateCasePetition, deleteCasePetition } from '@/app/services/api/CasePetitions' 
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Plus, Edit, Trash2 } from 'lucide-react'
import AddPetitionModal from './AddPetitionModal'
import EditPetitionModal from './EditPetitionModal'
import DeletePetitionModal from './DeletePetitionModal'

function Petitions({ caseId }) {
  const { t, language } = useTranslations()
  
  const [showModal, setShowModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedPetitionId, setSelectedPetitionId] = useState(null)
  const [selectedPetition, setSelectedPetition] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  // Fetch petitions using SWR
  const { data: petitionsResponse, error, isLoading, mutate } = useSWR(
    caseId ? `case-petitions-${caseId}` : null,
    () => getCasePetitionsByCaseId(caseId)
  )

  const petitions = Array.isArray(petitionsResponse?.data) ? petitionsResponse.data : []

  const handleSubmit = async (formData) => {
    try {
      setSubmitting(true)
      
      const petitionData = {
        case_id: caseId,
        date: formData.date,
        type: formData.type,
        appealDate: formData.appeal_date,
        decision: formData.decision,
        files: formData.files
      }
      
      const response = await createCasePetition(petitionData)
      
      if (response.success) {
        // Show success toast
        toast.success(t('petitions.petitionAddedSuccessfully'))
        
        // Refresh petitions list
        await mutate()
      } else {
        // Show error toast
        toast.error(t('petitions.failedToCreatePetition'))
      }
    } catch (err) {
      // Show error toast for exceptions
      toast.error(`${t('petitions.errorCreatingPetition')}: ${err.message}`)
    } finally {
      setSubmitting(false)
    }
  }

  const handleCloseModal = () => {
    setShowModal(false)
  }

  const handleEditPetition = (petition) => {
    setSelectedPetitionId(petition.id)
    setShowEditModal(true)
  }

  const handleCloseEditModal = () => {
    setShowEditModal(false)
    setSelectedPetitionId(null)
  }

  const handleUpdateSubmit = async (petitionId, formData) => {
    try {
      setSubmitting(true)
      
      const petitionData = {
        case_id: caseId,
        date: formData.date,
        type: formData.type,
        appealDate: formData.appeal_date,
        decision: formData.decision,
        files: formData.files
      }
      
      const response = await updateCasePetition(petitionId, petitionData)
      
      if (response.success) {
        // Show success toast
        toast.success(t('petitions.petitionUpdatedSuccessfully'))
        
        // Refresh petitions list
        await mutate()
      } else {
        // Show error toast
        toast.error(t('petitions.failedToUpdatePetition'))
      }
    } catch (err) {
      // Show error toast for exceptions
      toast.error(`${t('petitions.errorUpdatingPetition')}: ${err.message}`)
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeletePetition = (petition) => {
    setSelectedPetitionId(petition.id)
    setSelectedPetition(petition)
    setShowDeleteModal(true)
  }

  const handleCloseDeleteModal = () => {
    setShowDeleteModal(false)
    setSelectedPetitionId(null)
    setSelectedPetition(null)
  }

  const handleConfirmDelete = async (petitionId) => {
    try {
      setSubmitting(true)
      
      const response = await deleteCasePetition(petitionId)
      
      if (response.success) {
        // Show success toast
        toast.success(t('petitions.petitionDeletedSuccessfully'))
        
        // Close modal
        handleCloseDeleteModal()
        
        // Refresh petitions list
        await mutate()
      } else {
        // Show error toast
        toast.error(t('petitions.failedToDeletePetition'))
      }
    } catch (err) {
      // Show error toast for exceptions
      toast.error(`${t('petitions.errorDeletingPetition')}: ${err.message}`)
    } finally {
      setSubmitting(false)
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return t('petitions.notAvailable')
    const locale = language === 'ar' ? 'ar-AE' : 'en-US'
    return new Date(dateString).toLocaleDateString(locale, {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const formatDateTime = (dateString) => {
    if (!dateString) return t('petitions.notAvailable')
    const locale = language === 'ar' ? 'ar-AE' : 'en-US'
    return new Date(dateString).toLocaleString(locale, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="text-muted-foreground">
          {t('petitions.loadingPetitions')}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-4 text-red-600 bg-red-50 rounded-md">
        {t('petitions.errorFetchingPetitions')}: {error.message}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">
          {t('petitions.casePetitions')}
        </h3>
        <div className="flex items-center gap-4">
          <span className="text-sm text-muted-foreground">
            {t('petitions.petitionsFound', { count: petitions.length })}
          </span>
          <Button 
            onClick={() => setShowModal(true)}
            size="sm"
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            {t('petitions.addPetition')}
          </Button>
        </div>
      </div>

      {petitions.length === 0 ? (
        <div className="text-center p-8 text-muted-foreground">
          {t('petitions.noPetitionsFound')}
        </div>
      ) : (
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('petitions.id')}</TableHead>
                <TableHead>{t('petitions.date')}</TableHead>
                <TableHead>{t('petitions.type')}</TableHead>
                <TableHead>{t('petitions.appealDate')}</TableHead>
                <TableHead>{t('petitions.judgeDecision')}</TableHead>
                <TableHead>{t('petitions.createdAt')}</TableHead>
                <TableHead>{t('petitions.actions')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {petitions.map((petition) => (
                <TableRow key={petition.id}>
                  <TableCell className="font-medium">{petition.id}</TableCell>
                  <TableCell>{formatDate(petition.date)}</TableCell>
                  <TableCell>{petition.type}</TableCell>
                  <TableCell>{formatDate(petition.appeal_date)}</TableCell>
                  <TableCell>
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                      petition.decision === 1 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {petition.decision === 1 ? t('petitions.approved') : t('petitions.rejected')}
                    </span>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {formatDateTime(petition['created_at'])}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditPetition(petition)}
                        className="flex items-center gap-2 h-8 px-3"
                      >
                        <Edit className="h-4 w-4" />
                        {t('petitions.edit')}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeletePetition(petition)}
                        className="flex items-center gap-2 h-8 px-3 text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                        {t('common.delete')}
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Add Petition Modal */}
      <AddPetitionModal
        isOpen={showModal}
        onClose={handleCloseModal}
        onSubmit={handleSubmit}
        title={t('petitions.addPetition')}
        isLoading={submitting}
      />

      {/* Edit Petition Modal */}
      <EditPetitionModal
        isOpen={showEditModal}
        onClose={handleCloseEditModal}
        onSubmit={handleUpdateSubmit}
        petitionId={selectedPetitionId}
        title={t('petitions.editPetition')}
        isLoading={submitting}
      />

      {/* Delete Petition Modal */}
      <DeletePetitionModal
        isOpen={showDeleteModal}
        onClose={handleCloseDeleteModal}
        onConfirm={handleConfirmDelete}
        petitionId={selectedPetitionId}
        petitionData={selectedPetition}
        isLoading={submitting}
      />
    </div>
  )
}

export default Petitions