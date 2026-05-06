"use client"

import { toast } from "react-toastify"
import { useTranslations } from "@/hooks/useTranslations"

const getFirstErrorFromObject = (obj) => {
  if (!obj || typeof obj !== "object") return null
  const first = Object.values(obj)[0]
  if (Array.isArray(first)) return first[0]
  if (typeof first === "object") return getFirstErrorFromObject(first)
  return first
}

const resolveApiMessage = (error) => {
  if (!error) return null
  const response = error.response
  if (response?.data?.message) return response.data.message
  if (response?.data?.error) return response.data.error
  if (response?.data?.errors) {
    const nested = getFirstErrorFromObject(response.data.errors)
    if (nested) return nested
  }
  if (error.message) return error.message
  return null
}

export const useNotify = () => {
  const { t } = useTranslations()

  const defaultError = t("notify.defaultError") || "Something went wrong. Please try again."

  const showError = (message, options = {}) => {
    const msg = message || defaultError
    toast.error(msg, options)
    return msg
  }

  const showSuccess = (message, options = {}) => {
    toast.success(message, options)
    return message
  }

  const handleApiError = (error, fallbackKey) => {
    const fallback = fallbackKey ? (t(fallbackKey) || fallbackKey) : defaultError
    const specific = resolveApiMessage(error)
    const status = error?.response?.status

    if (status === 401) {
      return showError(t("notify.unauthorized") || specific || fallback)
    }

    if (status === 403) {
      return showError(t("notify.forbidden") || specific || fallback)
    }

    if (status >= 500) {
      // Prioritize specific message even for 500 if the backend provided one
      return showError(specific || t("notify.serverError") || fallback)
    }

    if (!error?.response && error?.message && /network/i.test(error.message)) {
      return showError(t("notify.networkError") || fallback)
    }

    return showError(specific || fallback)
  }

  return {
    showError,
    showSuccess,
    handleApiError,
  }
}

export default useNotify
