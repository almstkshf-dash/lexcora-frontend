import React, { useState } from 'react'
import useSWR from 'swr'
import { getCaseDegreeByCaseId, deleteCaseDegree } from '../../../../services/api/caseDegrees'
import { useTranslations } from '../../../../../hooks/useTranslations'
import { useLanguage } from '../../../../../contexts/LanguageContext'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../../../../components/ui/table'
import { Button } from '../../../../../components/ui/button'
import { Edit, Trash2, Loader2, Plus } from 'lucide-react'
import AddCaseDegreeModal from './AddCaseDegreeModal'
import EditCaseDegreeModal from './EditCaseDegreeModal'
import DeleteCaseDegreeModal from './DeleteCaseDegreeModal'

function Stages({ caseId }) {
  const {t} = useTranslations()
  const { language } = useLanguage()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [selectedDegree, setSelectedDegree] = useState(null)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [degreeToDelete, setDegreeToDelete] = useState(null)
  const [isDeleting, setIsDeleting] = useState(false)
  
  // Fetch case degrees using SWR
  const { data, error, isLoading, mutate } = useSWR(
    caseId ? `case-degrees/${caseId}` : null,
    () => getCaseDegreeByCaseId(caseId)
  )

  // Translation function for degree types
  const getDegreeTranslation = (degree) => {
    if (language === 'ar') {
      const arabicTranslations = {
        'appeal': 'استئناف',
        'first_instance': 'ابتدائية',
        'cassation': 'نقض'
      }
      return arabicTranslations[degree] || degree
    } else {
      const englishTranslations = {
        'appeal': 'Appeal',
        'first_instance': 'First Instance',
        'cassation': 'Cassation'
      }
      return englishTranslations[degree] || degree
    }
  }

  // Handle edit action
  const handleEdit = (degreeId) => {
    const degrees = Array.isArray(data?.data) ? data.data : []
    const degree = degrees.find(d => d.id === degreeId)
    if (degree) {
      setSelectedDegree(degree)
      setIsEditModalOpen(true)
    }
  }

  // Handle delete action
  const handleDelete = (degreeId) => {
    const degrees = Array.isArray(data?.data) ? data.data : []
    const degree = degrees.find(d => d.id === degreeId)
    if (degree) {
      setDegreeToDelete(degree)
      setIsDeleteModalOpen(true)
    }
  }

  // Handle delete confirmation
  const handleDeleteConfirm = async () => {
    if (!degreeToDelete) return

    setIsDeleting(true)
    try {
      await deleteCaseDegree(degreeToDelete.id)
      mutate() // Refetch the data
      setIsDeleteModalOpen(false)
      setDegreeToDelete(null)
    } catch (error) {
      alert(t('initiationProceeding.deleteError'))
    } finally {
      setIsDeleting(false)
    }
  }

  // Handle delete modal close
  const handleDeleteModalClose = () => {
    if (!isDeleting) {
      setIsDeleteModalOpen(false)
      setDegreeToDelete(null)
    }
  }

  // Handle successful case degree creation
  const handleAddSuccess = () => {
    mutate() // Refetch the data
  }

  // Handle successful case degree update
  const handleEditSuccess = () => {
    mutate() // Refetch the data
    setSelectedDegree(null)
  }

  // Handle edit modal close
  const handleEditModalClose = () => {
    setIsEditModalOpen(false)
    setSelectedDegree(null)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-6 w-6 animate-spin" />
        <span className="ml-2">{t('common.loading')}</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-red-500 p-4">
        {t('common.error')}: {error.message}
      </div>
    )
  }

  const degrees = Array.isArray(data?.data) ? data.data : []

  return (
    <div className="space-y-4">
      {/* Header with Add Button */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">
          {t('initiationProceeding.title')}
        </h3>
        <Button onClick={() => setIsModalOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          {t('initiationProceeding.addProceeding')}
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('common.id')}</TableHead>
              <TableHead>{t('initiationProceeding.caseNumber')}</TableHead>
              <TableHead>{t('initiationProceeding.degree')}</TableHead>
              <TableHead>{t('initiationProceeding.year')}</TableHead>
              <TableHead>{t('initiationProceeding.referralDate')}</TableHead>
              <TableHead>{language === 'ar' ? 'صفة الموكل' : 'Client Status'}</TableHead>
              <TableHead>{language === 'ar' ? 'صفة الخصم' : 'Opponent Status'}</TableHead>
              <TableHead className="text-right">{t('initiationProceeding.actions')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {degrees.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                  {t('initiationProceeding.noProceedings')}
                </TableCell>
              </TableRow>
            ) : (
              degrees.map((degree) => (
                <TableRow key={degree.id}>
                  <TableCell className="font-medium">{degree.id}</TableCell>
                  <TableCell>{degree.case_number}</TableCell>
                  <TableCell>{getDegreeTranslation(degree.degree)}</TableCell>
                  <TableCell>{degree.year}</TableCell>
                  <TableCell>
                    {new Date(degree.referral_date).toLocaleDateString(
                      language === 'ar' ? 'ar-AE' : 'en-US'
                    )}
                  </TableCell>
                  <TableCell>{degree.client_status || '-'}</TableCell>
                  <TableCell>{degree.opponent_status || '-'}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(degree.id)}
                        className="h-8 w-8 p-0"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(degree.id)}
                        className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Add Case Degree Modal */}
      <AddCaseDegreeModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        caseId={caseId}
        onSuccess={handleAddSuccess}
      />

      {/* Edit Case Degree Modal */}
      <EditCaseDegreeModal
        isOpen={isEditModalOpen}
        onClose={handleEditModalClose}
        degreeData={selectedDegree}
        onSuccess={handleEditSuccess}
      />

      {/* Delete Case Degree Modal */}
      <DeleteCaseDegreeModal
        isOpen={isDeleteModalOpen}
        onClose={handleDeleteModalClose}
        degreeData={degreeToDelete}
        onConfirm={handleDeleteConfirm}
        isLoading={isDeleting}
      />
    </div>
  )
}

export default Stages