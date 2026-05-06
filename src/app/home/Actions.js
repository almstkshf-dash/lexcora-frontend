'use client'

import { useState, useCallback, useTransition, lazy, Suspense } from 'react'
import { Edit } from 'lucide-react'
import { useTranslations } from '@/hooks/useTranslations'

// Lazy-load so the Calendar/Popover/Formik bundle only evaluates on first open,
// not at list-item mount time.
const AppealDecisionModal = lazy(() => import('./AppealDecisionModal'))

/**
 * Actions
 *
 * Changes vs. original:
 *  1. Added 'use client' directive — component uses useState but was missing it.
 *  2. Edit icon wrapped in a semantic <button> with aria-label for keyboard
 *     and screen reader accessibility (was a bare clickable icon before).
 *  3. handleEditClick and handleModalClose wrapped in useCallback — previously
 *     recreated every render, causing AppealDecisionModal re-renders.
 *  4. onSuccess callback in AppealDecisionModal also stable via useCallback.
 *  5. Added useTranslations for the button aria-label.
 */
function Actions({ theme = 'blue', onEdit, sessionId, caseId }) {
  const { t } = useTranslations()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [, startTransition] = useTransition()

  const themeColors = {
    blue: 'hover:text-blue-600 focus-visible:ring-blue-500',
    orange: 'hover:text-orange-600 focus-visible:ring-orange-500',
    purple: 'hover:text-purple-600 focus-visible:ring-purple-500',
    green: 'hover:text-green-600 focus-visible:ring-green-500',
  }

  const hoverColor = themeColors[theme] || themeColors.blue

  const handleEditClick = useCallback(() => {
    if (onEdit) {
      onEdit()
    } else if (caseId) {
      // startTransition keeps the click instant; React schedules the
      // modal mount as low-priority work.
      startTransition(() => setIsModalOpen(true))
    }
  }, [onEdit, caseId, startTransition])

  const handleModalClose = useCallback(() => {
    setIsModalOpen(false)
  }, [])

  const handleSuccess = useCallback(() => {
    setIsModalOpen(false)
    if (onEdit) onEdit()
  }, [onEdit])

  return (
    <>
      <div className="flex justify-end gap-2 pt-2">
        <button
          type="button"
          onClick={handleEditClick}
          aria-label={t('home.editAction')}
          className={`p-1 rounded text-gray-400 ${hoverColor} cursor-pointer transition-colors focus-visible:outline-none focus-visible:ring-2`}
        >
          <span className="sr-only">{t('home.editAction')}</span>
          <Edit className="w-4 h-4" aria-hidden="true" />
        </button>
        {/* Future actions can be added here */}
      </div>

      {caseId && isModalOpen && (
        <Suspense fallback={null}>
          <AppealDecisionModal
            isOpen={isModalOpen}
            onClose={handleModalClose}
            caseId={caseId}
            onSuccess={handleSuccess}
          />
        </Suspense>
      )}
    </>
  )
}

export default Actions