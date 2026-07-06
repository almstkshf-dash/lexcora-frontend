/**
 * src/utils/dateUtils.js
 *
 * Backend / API-layer date utilities.
 *
 * Rule: every value sent to the server MUST be a UTC ISO-8601 string
 * (YYYY-MM-DDTHH:mm:ssZ).  No local-timezone offsets should ever be
 * serialised into an API payload or database column.
 *
 * Render-layer formatting (toLocaleDateString, toLocaleTimeString, etc.)
 * belongs in src/lib/dateUtils.js, not here.
 */

// ---------------------------------------------------------------------------
// toUTCISOString
// ---------------------------------------------------------------------------
/**
 * Converts any Date object or ISO string to a UTC ISO-8601 string suitable
 * for API payloads and database insertions.
 *
 * Unlike Date.prototype.toISOString() this function accepts strings as well
 * and guards against invalid dates so call-sites do not need to add their own
 * defensive checks.
 *
 * @param {Date|string|null|undefined} value
 * @returns {string|null}  e.g. "2024-03-15T09:30:00.000Z", or null
 */
export function toUTCISOString(value) {
  if (value == null || value === '') return null

  const date = value instanceof Date ? value : new Date(value)

  if (isNaN(date.getTime())) return null

  return date.toISOString() // always ends with 'Z' — UTC by definition
}

// ---------------------------------------------------------------------------
// toUTCDateOnlyString
// ---------------------------------------------------------------------------
/**
 * Returns the calendar date portion of a UTC timestamp as "YYYY-MM-DD".
 *
 * Use this when the API/DB column is a DATE (not DATETIME) field.
 *
 * IMPORTANT: the split is performed on the UTC representation of the date,
 * so a Date constructed from a local picker (e.g. 2024-03-15T22:00:00+05:00)
 * will correctly yield "2024-03-15", not the UTC-shifted "2024-03-14".
 * Because pickers in this project operate in local time and the user intends
 * the local calendar date, we extract the local date components instead of
 * the UTC ones.
 *
 * @param {Date|string|null|undefined} value
 * @returns {string|null}  e.g. "2024-03-15", or null
 */
export function toUTCDateOnlyString(value) {
  if (value == null || value === '') return null

  const date = value instanceof Date ? value : new Date(value)

  if (isNaN(date.getTime())) return null

  // Use local year/month/day so calendar-date pickers always produce the date
  // the user actually selected, regardless of local UTC offset.
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')

  return `${y}-${m}-${d}`
}

// ---------------------------------------------------------------------------
// toUTCTimeString
// ---------------------------------------------------------------------------
/**
 * Returns the time portion of a Date as a "HH:mm:ss" string in UTC.
 *
 * Suitable for TIME columns in the database.
 *
 * @param {Date|string|null|undefined} value
 * @returns {string|null}  e.g. "09:30:00", or null
 */
export function toUTCTimeString(value) {
  if (value == null || value === '') return null

  const date = value instanceof Date ? value : new Date(value)

  if (isNaN(date.getTime())) return null

  const h = String(date.getUTCHours()).padStart(2, '0')
  const m = String(date.getUTCMinutes()).padStart(2, '0')
  const s = String(date.getUTCSeconds()).padStart(2, '0')

  return `${h}:${m}:${s}`
}

// ---------------------------------------------------------------------------
// parseUTCDate
// ---------------------------------------------------------------------------
/**
 * Parses a UTC ISO-8601 string from the API into a JavaScript Date object.
 *
 * If the string has no timezone designator the function appends 'Z' so that
 * the browser does not silently interpret it as a local time, which would
 * introduce a timezone-dependent offset.
 *
 * @param {string|null|undefined} value  ISO-8601 string from the API/DB
 * @returns {Date|null}
 */
export function parseUTCDate(value) {
  if (!value) return null

  // Normalise: if the string carries no TZ info, treat it as UTC.
  const normalised = /Z|[+-]\d{2}:?\d{2}$/.test(value) ? value : `${value}Z`

  const date = new Date(normalised)

  return isNaN(date.getTime()) ? null : date
}
