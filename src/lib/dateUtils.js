/**
 * Calculates the number of days remaining until a deadline.
 * @param {string|null} endDate - ISO date string
 * @returns {{ days: number, isOverdue: boolean, isUrgent: boolean } | null}
 */
export const calculateDaysRemaining = (endDate) => {
  if (!endDate) return null
  const now = new Date()
  const deadline = new Date(endDate)
  const daysRemaining = Math.ceil((deadline - now) / (1000 * 60 * 60 * 24))
  return {
    days: daysRemaining,
    isOverdue: daysRemaining <= 0,
    isUrgent: daysRemaining <= 7 && daysRemaining > 0,
  }
}

/**
 * Formats a date string using the user's locale.
 * @param {string|null} dateString - ISO date string
 * @param {Intl.DateTimeFormatOptions} options - toLocaleDateString options
 * @param {string} locale - BCP 47 locale tag, e.g. 'ar-AE' or 'en-US'. Defaults to 'ar-AE'.
 * @returns {string|null}
 */
export const formatDate = (
  dateString,
  options = { year: 'numeric', month: '2-digit', day: '2-digit' },
  locale = 'ar-AE'
) => {
  if (!dateString) return null
  const date = new Date(dateString)
  return date.toLocaleDateString(locale, options)
}

/**
 * Formats a time string using the user's locale.
 * @param {string|null} dateString - ISO date string
 * @param {string} locale - BCP 47 locale tag. Defaults to 'ar-AE'.
 * @returns {string|null}
 */
export const formatTime = (dateString, locale = 'ar-AE') => {
  if (!dateString) return null
  const date = new Date(dateString)
  return date.toLocaleTimeString(locale, {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  })
}
