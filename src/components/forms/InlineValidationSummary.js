"use client"

import React, { useMemo } from "react"
import { AlertTriangle } from "lucide-react"
import { cn } from "@/lib/utils"

const collectMessages = (value) => {
  if (!value) return []
  if (typeof value === "string") return [value]
  if (Array.isArray(value)) return value.flatMap(collectMessages)
  if (typeof value === "object") return Object.values(value).flatMap(collectMessages)
  return []
}

const InlineValidationSummary = ({
  errors,
  title,
  hint,
  limit = 5,
  className = "",
}) => {
  const messages = useMemo(() => {
    const flattened = collectMessages(errors)
    return Array.from(new Set(flattened.filter(Boolean)))
  }, [errors])

  if (!messages.length) return null

  return (
    <div
      className={cn(
        "rounded-md border border-destructive/20 bg-destructive/5 px-3 py-2.5 shadow-sm",
        className
      )}
    >
      <div className="flex items-start gap-2 text-destructive">
        <AlertTriangle className="h-4 w-4 mt-0.5 flex-shrink-0" />
        <div className="space-y-0.5">
          <p className="text-sm font-semibold leading-tight">{title}</p>
          {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
          <ul className="mt-1 space-y-1 text-xs">
            {messages.slice(0, limit).map((message, index) => (
              <li key={`${message}-${index}`} className="leading-snug">
                • {message}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}

export default InlineValidationSummary
