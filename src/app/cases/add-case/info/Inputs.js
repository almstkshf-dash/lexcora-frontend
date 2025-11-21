"use client"

import React from 'react'
import { useTranslations } from "@/hooks/useTranslations"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import FormField from "@/components/forms/FormField"
import { useFormikContext } from '../FormikContext'

function Inputs() {
  const { values, setFieldValue, errors, touched, setFieldTouched } = useFormikContext()
  const { 
    caseNumber,
    fees,
    topic,
    additionalNote
  } = values
  
  const { t } = useTranslations()

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3 lg:grid-cols-4">
      <FormField
        label={t('caseForm.caseNumber')}
        htmlFor="caseNumber"
        error={errors.caseNumber && touched.caseNumber ? errors.caseNumber : null}
      >
        <Input
          id="caseNumber"
          type="text"
          value={caseNumber}
          onChange={(e) => setFieldValue('caseNumber', e.target.value)}
          onBlur={() => setFieldTouched('caseNumber', true)}
          placeholder={t('caseForm.enterCaseNumber')}
          className={errors.caseNumber && touched.caseNumber ? 'border-destructive' : ''}
        />
      </FormField>

      <FormField
        label={t('caseForm.feesAndExpenses')}
        htmlFor="feesAndExpenses"
        error={errors.fees && touched.fees ? errors.fees : null}
        required={false}
      >
        <Input
          id="feesAndExpenses"
          type="number"
          value={fees}
          onChange={(e) => setFieldValue('fees', e.target.value)}
          onBlur={() => setFieldTouched('fees', true)}
          placeholder={t('caseForm.enterFeesAndExpenses')}
          className={errors.fees && touched.fees ? 'border-destructive' : ''}
          min="0"
          step="1"
        />
      </FormField>

      <FormField
        label={t('caseForm.subject')}
        htmlFor="subject"
        error={errors.topic && touched.topic ? errors.topic : null}
        className="col-span-1 md:col-span-2 lg:col-span-2"
        description={t('caseForm.subjectHelper')}
      >
        <Textarea
          id="subject"
          value={topic}
          onChange={(e) => setFieldValue('topic', e.target.value)}
          onBlur={() => setFieldTouched('topic', true)}
          placeholder={t('caseForm.enterSubject')}
          className={`min-h-[100px] ${errors.topic && touched.topic ? 'border-destructive' : ''}`}
          rows={4}
        />
      </FormField>

      <FormField
        label={t('caseForm.additionalNotes')}
        htmlFor="additionalNotes"
        error={errors.additionalNote && touched.additionalNote ? errors.additionalNote : null}
        className="col-span-1 lg:col-span-2"
      >
        <Textarea
          id="additionalNotes"
          value={additionalNote}
          onChange={(e) => setFieldValue('additionalNote', e.target.value)}
          onBlur={() => setFieldTouched('additionalNote', true)}
          placeholder={t('caseForm.enterAdditionalNotes')}
          className={`min-h-[120px] ${errors.additionalNote && touched.additionalNote ? 'border-destructive' : ''}`}
          rows={5}
        />
      </FormField>
    </div>
  )
}

export default Inputs
