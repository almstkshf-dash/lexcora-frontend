/**
 * Decision status values as returned by the backend API.
 * UNKNOWN acts as a safe sentinel for null / undefined / unexpected values.
 */
export const DECISION_STATUS = {
  REJECTED: 0,
  ACCEPTED: 1,
  UNKNOWN: -1,
}
