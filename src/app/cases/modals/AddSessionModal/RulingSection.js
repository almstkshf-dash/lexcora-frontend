'use client';

import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { CalendarIcon, Plus } from 'lucide-react';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import { cn } from '@/lib/utils';

export default function RulingSection({ 
  formik, 
  isRtl, 
  legalPeriods, 
  onAddLegalPeriod 
}) {
  if (!formik.values.has_ruling) return null;

  return (
    <div className="space-y-4 pl-4 border-l-4 border-blue-200 dark:border-blue-800 bg-white dark:bg-gray-800 p-4 rounded-lg">
      {/* Ruling Textarea */}
      <div className="space-y-2">
        <Label htmlFor="ruling" className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {isRtl ? "منطوق الحكم" : "Ruling Text"} <span className="text-red-500 dark:text-red-400">*</span>
        </Label>
        <Textarea
          id="ruling"
          name="ruling"
          value={formik.values.ruling}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          placeholder={isRtl ? "أدخل منطوق الحكم" : "Enter ruling text"}
          rows={3}
          className={cn(
            isRtl ? "text-right" : "text-left",
            "resize-none",
            formik.touched.ruling && formik.errors.ruling && "border-red-500"
          )}
        />
        {formik.touched.ruling && formik.errors.ruling && (
          <p className="text-sm text-red-500">{formik.errors.ruling}</p>
        )}
      </div>

      {/* Ruling Date */}
      <div className="space-y-2">
        <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {isRtl ? "تاريخ صدور الحكم" : "Ruling Date"} <span className="text-red-500 dark:text-red-400">*</span>
        </Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              type="button"
              variant="outline"
              className={cn(
                "w-full justify-start font-normal",
                !formik.values.ruling_date && "text-muted-foreground",
                isRtl ? "text-right" : "text-left",
                formik.touched.ruling_date && formik.errors.ruling_date && "border-red-500"
              )}
            >
              <CalendarIcon className={cn("h-4 w-4", isRtl ? "ml-2" : "mr-2")} />
              {formik.values.ruling_date ? (
                format(new Date(formik.values.ruling_date), "PPP", { locale: isRtl ? ar : undefined })
              ) : (
                <span>{isRtl ? "اختر تاريخ صدور الحكم" : "Pick ruling date"}</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0 z-[9999]" align="start">
            <CalendarComponent
              mode="single"
              selected={formik.values.ruling_date ? new Date(formik.values.ruling_date) : null}
              onSelect={(date) => formik.setFieldValue('ruling_date', date ? format(date, 'yyyy-MM-dd') : '')}
              initialFocus
            />
          </PopoverContent>
        </Popover>
        {formik.touched.ruling_date && formik.errors.ruling_date && (
          <p className="text-sm text-red-500">{formik.errors.ruling_date}</p>
        )}
      </div>

      {/* Legal Period Select */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Label htmlFor="legal_period_id" className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {isRtl ? "المدة القانونية" : "Legal Period"} <span className="text-red-500 dark:text-red-400">*</span>
          </Label>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={onAddLegalPeriod}
            className="h-7 gap-1"
          >
            <Plus className="h-3 w-3" />
            <span className="text-xs">{isRtl ? "إضافة" : "Add"}</span>
          </Button>
        </div>
        <Select
          value={formik.values.legal_period_id?.toString()}
          onValueChange={(value) => formik.setFieldValue('legal_period_id', value)}
        >
          <SelectTrigger id="legal_period_id" className={cn(
            formik.touched.legal_period_id && formik.errors.legal_period_id && "border-red-500"
          )}>
            <SelectValue placeholder={isRtl ? "اختر المدة القانونية" : "Select Legal Period"} />
          </SelectTrigger>
          <SelectContent className="z-[10001]">
            {legalPeriods.map((period) => (
              <SelectItem key={period.id} value={period.id.toString()}>
                <div className="flex flex-col">
                  <span className="font-medium">{period.name}</span>
                  <span className="text-xs text-muted-foreground">
                    {[
                      period.objection_days && `${isRtl ? 'التظلم' : 'Objection'}: ${period.objection_days} ${isRtl ? 'يوم' : 'days'}`,
                      period.appeal_days && `${isRtl ? 'الاستئناف' : 'Appeal'}: ${period.appeal_days} ${isRtl ? 'يوم' : 'days'}`,
                      period.cassation_days && `${isRtl ? 'الطعن' : 'Cassation'}: ${period.cassation_days} ${isRtl ? 'يوم' : 'days'}`
                    ].filter(Boolean).join(' - ')}
                  </span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {formik.touched.legal_period_id && formik.errors.legal_period_id && (
          <p className="text-sm text-red-500">{formik.errors.legal_period_id}</p>
        )}
      </div>
    </div>
  );
}
