"use client"

import React from "react"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

const FormField = ({
  children,
  label,
  description,
  error,
  required = false,
  htmlFor,
  className = "",
  labelClassName = "",
  contentClassName = "",
}) => {
  return (
    <div className={cn("space-y-1.5", className)}>
      {label && (
        <div className="flex items-center gap-1.5">
          <Label
            htmlFor={htmlFor}
            className={cn("text-sm font-medium text-foreground", labelClassName)}
          >
            {label}
          </Label>
          {required && <span className="text-destructive font-semibold text-sm">*</span>}
        </div>
      )}

      {description && (
        <p className="text-xs text-muted-foreground leading-relaxed">{description}</p>
      )}

      <div className={contentClassName}>{children}</div>

      {error ? (
        <p className="text-xs text-destructive font-medium" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  )
}

export default FormField
