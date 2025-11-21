"use client"

import React, { useEffect, useRef, useState } from "react"
import { useFormikContext } from "formik"
import { Loader2, Clock, RotateCcw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useTranslations } from "@/hooks/useTranslations"

export const sanitizeDraftValues = (values) => {
  const stripFileFields = (input) => {
    if (Array.isArray(input)) {
      return input.map(stripFileFields)
    }
    if (input && typeof input === "object") {
      const cleaned = {}
      Object.entries(input).forEach(([key, value]) => {
        const lowered = key.toLowerCase()
        // Drop any direct file/attachment fields from drafts
        if (["file", "files", "attachments", "uploadedfiles"].includes(lowered)) {
          return
        }
        cleaned[key] = stripFileFields(value)
      })
      return cleaned
    }
    return input
  }

  const {
    caseFiles,
    employeeFiles,
    courtFiles,
    ...rest
  } = values || {}

  return stripFileFields(rest)
}

const AutosaveDraftNotice = ({
  storageKey,
  restoredAt,
  className = "",
  onClearDraft,
}) => {
  const { values, dirty, isSubmitting } = useFormikContext()
  const { t } = useTranslations()
  const [lastSaved, setLastSaved] = useState(restoredAt || null)
  const [status, setStatus] = useState(restoredAt ? "restored" : "idle")
  const saveTimeout = useRef(null)

  useEffect(() => {
    if (!dirty || isSubmitting) return

    setStatus("saving")
    if (saveTimeout.current) {
      clearTimeout(saveTimeout.current)
    }

    saveTimeout.current = setTimeout(() => {
      const payload = {
        values: sanitizeDraftValues(values),
        savedAt: new Date().toISOString(),
      }
      localStorage.setItem(storageKey, JSON.stringify(payload))
      setLastSaved(payload.savedAt)
      setStatus("saved")
    }, 1200)

    return () => {
      if (saveTimeout.current) clearTimeout(saveTimeout.current)
    }
  }, [dirty, isSubmitting, storageKey, values])

  const handleClearDraft = () => {
    localStorage.removeItem(storageKey)
    setLastSaved(null)
    setStatus("idle")
    onClearDraft?.()
  }

  const renderLabel = () => {
    if (status === "saving") return t("forms.autosaveSaving") || "Saving draft..."
    if (status === "saved") return t("forms.autosaveSaved") || "Draft saved"
    if (status === "restored") return t("forms.autosaveRestored") || "Draft restored"
    return t("forms.autosaveIdle") || "Autosave is on"
  }

  return (
    <div
      className={`flex flex-wrap items-center justify-between gap-3 rounded-md border bg-muted/40 px-3 py-2 text-xs text-muted-foreground ${className}`}
    >
      <div className="flex items-center gap-2">
        {status === "saving" ? (
          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
        ) : (
          <Clock className="h-4 w-4 text-muted-foreground" />
        )}
        <div className="flex flex-col">
          <span className="font-medium text-foreground">{renderLabel()}</span>
          {lastSaved && (
            <span className="text-[11px]">
              {t("forms.lastSavedAt") || "Last saved"}{" "}
              {new Date(lastSaved).toLocaleTimeString()}
            </span>
          )}
        </div>
      </div>

      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="h-8 px-2 text-xs"
        onClick={handleClearDraft}
      >
        <RotateCcw className="mr-2 h-3.5 w-3.5" />
        {t("forms.clearDraft") || "Discard draft"}
      </Button>
    </div>
  )
}

export default AutosaveDraftNotice
