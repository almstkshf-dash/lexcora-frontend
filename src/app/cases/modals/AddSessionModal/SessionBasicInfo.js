'use client';

import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Calendar, CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import { cn } from '@/lib/utils';

export default function SessionBasicInfo({ formik, isRtl }) {
  return (
    <div className="space-y-4 bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
      <div className="flex items-center gap-2 pb-2 border-b border-gray-200 dark:border-gray-700">
        <Calendar className="h-4 w-4 text-blue-600 dark:text-blue-400" />
        <h3 className="text-md font-medium text-gray-900 dark:text-gray-100">
          {isRtl ? "المعلومات الأساسية" : "Basic Information"}
        </h3>
      </div>

      {/* Session Date and Time Fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Session Date Field */}
        <div className="space-y-2">
          <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {isRtl ? "تاريخ الجلسة" : "Session Date"} *
          </Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                type="button"
                variant="outline"
                className={cn(
                  "w-full justify-start font-normal",
                  !formik.values.session_date && "text-muted-foreground",
                  isRtl ? "text-right" : "text-left",
                  formik.touched.session_date && formik.errors.session_date && "border-red-500"
                )}
              >
                <CalendarIcon className={cn("h-4 w-4", isRtl ? "ml-2" : "mr-2")} />
                {formik.values.session_date ? (
                  format(new Date(formik.values.session_date), "PPP", { locale: isRtl ? ar : undefined })
                ) : (
                  <span>{isRtl ? "اختر تاريخ الجلسة" : "Pick session date"}</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 z-[9999]" align="start">
              <CalendarComponent
                mode="single"
                selected={formik.values.session_date ? new Date(formik.values.session_date) : null}
                onSelect={(date) => formik.setFieldValue('session_date', date ? format(date, 'yyyy-MM-dd') : '')}
                initialFocus
              />
            </PopoverContent>
          </Popover>
          {formik.touched.session_date && formik.errors.session_date && (
            <p className="text-sm text-red-500">
              {formik.errors.session_date}
            </p>
          )}
        </div>

        {/* Session Time Field */}
        <div className="space-y-2">
          <Label htmlFor="session_time" className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {isRtl ? "وقت الجلسة" : "Session Time"} *
          </Label>
          <Input
            id="session_time"
            name="session_time"
            type="time"
            value={formik.values.session_time}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            className={`${isRtl ? "text-right" : "text-left"} focus:ring-2 focus:ring-blue-500 border-gray-300`}
          />
          {formik.touched.session_time && formik.errors.session_time && (
            <p className="text-sm text-red-500">
              {formik.errors.session_time}
            </p>
          )}
        </div>
      </div>

      {/* Note Field */}
      <div className="space-y-2">
        <Label htmlFor="note" className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {isRtl ? "ملاحظات" : "Notes"}
        </Label>
        <Textarea
          id="note"
          name="note"
          value={formik.values.note}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          placeholder={isRtl ? "أدخل الملاحظات" : "Enter notes"}
          className={`min-h-[100px] resize-none ${isRtl ? "text-right" : "text-left"} focus:ring-2 focus:ring-blue-500 border-gray-300`}
        />
        {formik.touched.note && formik.errors.note && (
          <p className="text-sm text-red-500">
            {formik.errors.note}
          </p>
        )}
      </div>

      {/* Link Field */}
      <div className="space-y-2">
        <Label htmlFor="link" className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {isRtl ? "الرابط" : "Link"}
        </Label>
        <Input
          id="link"
          name="link"
          type="text"
          value={formik.values.link}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          placeholder={isRtl ? "أدخل الرابط" : "Enter link"}
          className={`${isRtl ? "text-right" : "text-left"} focus:ring-2 focus:ring-blue-500 border-gray-300`}
        />
        {formik.touched.link && formik.errors.link && (
          <p className="text-sm text-red-500">
            {formik.errors.link}
          </p>
        )}
      </div>
    </div>
  );
}
