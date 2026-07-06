/**
 * src/lib/dateUtils.js
 *
 * Render-layer date utilities.
 *
 * CONTRACT
 * --------
 * • Input:  UTC ISO-8601 strings (or Date objects) received from the API.
 * • Output: Locale-formatted strings visible to the user, in their *local*
 *           timezone.  No UTC strings are ever produced here — that job
 *           belongs to src/utils/dateUtils.js.
 *
 * The browser's Intl engine handles UTC → local-timezone conversion
 * automatically when you pass a valid UTC Date to toLocaleDateString /
 * toLocaleTimeString / toLocaleString.  We only need to ensure the Date
 * objects are parsed correctly (with a trailing 'Z' so the runtime treats
 * the value as UTC, not local time).
 */

import { parseUTCDate } from '@/utils/dateUtils'

// ---------------------------------------------------------------------------
// calculateDaysRemaining
// ---------------------------------------------------------------------------
/**
 * Calculates the number of days remaining until a deadline.
 *
 * The calculation is timezone-safe because both `now` and `deadline` are
 * absolute UTC timestamps; the difference in milliseconds is timezone-
 * independent.
 *
 * @param {string|null} endDate - UTC ISO-8601 date/datetime string from the API
 * @returns {{ days: number, isOverdue: boolean, isUrgent: boolean } | null}
 */
export const calculateDaysRemaining = (endDate) => {
  if (!endDate) return null

  const deadline = parseUTCDate(endDate)
  if (!deadline) return null

  const now = new Date()
  const daysRemaining = Math.ceil((deadline - now) / (1000 * 60 * 60 * 24))

  return {
    days: daysRemaining,
    isOverdue: daysRemaining <= 0,
    isUrgent: daysRemaining <= 7 && daysRemaining > 0,
  }
}

// ---------------------------------------------------------------------------
// formatDate
// ---------------------------------------------------------------------------
/**
 * Formats a UTC date string for display using the user's local timezone.
 *
 * The Date constructor receives a UTC-normalised string (trailing 'Z'
 * guaranteed by parseUTCDate), so toLocaleDateString converts it into the
 * browser's local timezone automatically.
 *
 * @param {string|Date|null} dateString  UTC ISO-8601 string or Date object
 * @param {Intl.DateTimeFormatOptions} options
 * @param {string} locale  BCP 47 locale tag (e.g. 'ar-AE', 'en-US').
 *                         Defaults to 'ar-AE'.
 * @returns {string|null}
 */
export const formatDate = (
  dateString,
  options = { year: 'numeric', month: '2-digit', day: '2-digit' },
  locale = 'ar-AE'
) => {
  if (!dateString) return null

  const date =
    dateString instanceof Date ? dateString : parseUTCDate(dateString)

  if (!date) return null

  return date.toLocaleDateString(locale, options)
}

// ---------------------------------------------------------------------------
// formatTime
// ---------------------------------------------------------------------------
/**
 * Formats the time portion of a UTC date string for display in the user's
 * local timezone.
 *
 * @param {string|Date|null} dateString  UTC ISO-8601 string or Date object
 * @param {string} locale  BCP 47 locale tag.  Defaults to 'ar-AE'.
 * @returns {string|null}
 */
export const formatTime = (dateString, locale = 'ar-AE') => {
  if (!dateString) return null

  const date =
    dateString instanceof Date ? dateString : parseUTCDate(dateString)

  if (!date) return null

  return date.toLocaleTimeString(locale, {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  })
}
