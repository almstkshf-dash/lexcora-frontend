"use client"

import React, { useState, useEffect } from 'react'
import useSWR from 'swr'
import { useTranslations } from "@/hooks/useTranslations"
import { useLanguage } from "@/contexts/LanguageContext"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { DatePicker } from "@/components/ui/date-picker"
import { Checkbox } from "@/components/ui/checkbox"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Loader2, X, Users } from 'lucide-react'
import { toast } from 'react-toastify'
import { createEvent, updateEvent } from '@/app/services/api/events'
import { getEmployees } from '@/app/services/api/employees'
import { format } from 'date-fns'

const EventModal = ({ 
  isOpen, 
  onClose, 
  onSuccess,
  event = null 
}) => {
  const { t } = useTranslations()
  const { language } = useLanguage()
  const isArabic = language === 'ar'
  const isEditMode = !!event

  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    place: '',
    event_date: null,
    start_time: '',
    end_time: '',
    description: '',
    employee_ids: []
  })
  const [searchQuery, setSearchQuery] = useState('')

  // Fetch employees
  const { data: employeesData, isLoading: loadingEmployees } = useSWR('employees', getEmployees)
  const employees = employeesData?.data || []

  // Filter employees based on search
  const filteredEmployees = employees.filter(emp => 
    emp.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    emp.role_ar?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    emp.role_en?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Populate form when editing
  useEffect(() => {
    if (isEditMode && event) {
      setFormData({
        title: event.title || '',
        place: event.place || '',
        event_date: event.event_date ? new Date(event.event_date) : null,
        start_time: event.start_time || '',
        end_time: event.end_time || '',
        description: event.description || '',
        employee_ids: event.attendee_ids ? event.attendee_ids.split(',').map(id => parseInt(id)) : []
      })
    } else {
      resetForm()
    }
  }, [event, isEditMode])

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      resetForm()
      setSearchQuery('')
    }
  }, [isOpen])

  const resetForm = () => {
    setFormData({
      title: '',
      place: '',
      event_date: null,
      start_time: '',
      end_time: '',
      description: '',
      employee_ids: []
    })
  }

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleEmployeeToggle = (employeeId) => {
    setFormData(prev => ({
      ...prev,
      employee_ids: prev.employee_ids.includes(employeeId)
        ? prev.employee_ids.filter(id => id !== employeeId)
        : [...prev.employee_ids, employeeId]
    }))
  }

  const handleSelectAll = () => {
    if (formData.employee_ids.length === filteredEmployees.length) {
      setFormData(prev => ({ ...prev, employee_ids: [] }))
    } else {
      setFormData(prev => ({ 
        ...prev, 
        employee_ids: filteredEmployees.map(emp => emp.id) 
      }))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Validation
    if (!formData.title.trim()) {
      toast.error(isArabic ? 'عنوان الحدث مطلوب' : 'Event title is required')
      return
    }

    if (!formData.event_date) {
      toast.error(isArabic ? 'تاريخ الحدث مطلوب' : 'Event date is required')
      return
    }

    setIsLoading(true)

    try {
      const eventData = {
        ...formData,
        event_date: formData.event_date ? format(formData.event_date, 'yyyy-MM-dd') : null,
      }

      if (isEditMode) {
        await updateEvent(event.id, eventData)
        toast.success(isArabic ? 'تم تحديث الحدث بنجاح' : 'Event updated successfully')
      } else {
        await createEvent(eventData)
        toast.success(isArabic ? 'تم إنشاء الحدث بنجاح' : 'Event created successfully')
      }

      onSuccess?.()
      onClose()
    } catch (error) {

      toast.error(
        isArabic 
          ? error.response?.data?.message || 'حدث خطأ أثناء حفظ الحدث'
          : error.response?.data?.message || 'Error saving event'
      )
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditMode 
              ? (isArabic ? 'تعديل حدث' : 'Edit Event')
              : (isArabic ? 'إضافة حدث جديدة' : 'Add New Event')
            }
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Event Title */}
          <div className="space-y-2">
            <Label htmlFor="title">
              {isArabic ? 'عنوان الحدث' : 'Event Title'} <span className="text-red-500">*</span>
            </Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              placeholder={isArabic ? 'أدخل عنوان الحدث' : 'Enter event title'}
              required
            />
          </div>

          {/* Place */}
          <div className="space-y-2">
            <Label htmlFor="place">
              {isArabic ? 'المكان' : 'Place'}
            </Label>
            <Input
              id="place"
              value={formData.place}
              onChange={(e) => handleInputChange('place', e.target.value)}
              placeholder={isArabic ? 'أدخل مكان الحدث' : 'Enter event place'}
            />
          </div>

          {/* Event Date */}
          <div className="space-y-2">
            <Label>
              {isArabic ? 'تاريخ الحدث' : 'Event Date'} <span className="text-red-500">*</span>
            </Label>
            <DatePicker
              date={formData.event_date}
              onDateChange={(date) => handleInputChange('event_date', date)}
              placeholder={isArabic ? 'اختر التاريخ' : 'Select date'}
            />
          </div>

          {/* Time Range */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="start_time">
                {isArabic ? 'وقت البدء' : 'Start Time'}
              </Label>
              <Input
                id="start_time"
                type="time"
                value={formData.start_time}
                onChange={(e) => handleInputChange('start_time', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="end_time">
                {isArabic ? 'وقت الانتهاء' : 'End Time'}
              </Label>
              <Input
                id="end_time"
                type="time"
                value={formData.end_time}
                onChange={(e) => handleInputChange('end_time', e.target.value)}
              />
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">
              {isArabic ? 'الوصف' : 'Description'}
            </Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder={isArabic ? 'أدخل وصف الحدث' : 'Enter event description'}
              rows={3}
            />
          </div>

          {/* Employees Selection */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                {isArabic ? 'الحضور' : 'Attendees'}
              </Label>
              <span className="text-sm text-muted-foreground">
                {formData.employee_ids.length} {isArabic ? 'محدد' : 'selected'}
              </span>
            </div>

            {/* Search */}
            <Input
              placeholder={isArabic ? 'بحث عن موظف...' : 'Search employee...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="mb-2"
            />

            {/* Select All */}
            <div className="flex items-center space-x-2 space-x-reverse p-2 border rounded-md bg-muted/50">
              <Checkbox
                id="select-all"
                checked={filteredEmployees.length > 0 && formData.employee_ids.length === filteredEmployees.length}
                onCheckedChange={handleSelectAll}
              />
              <Label htmlFor="select-all" className="cursor-pointer flex-1 font-medium">
                {isArabic ? 'تحديد الكل' : 'Select All'}
              </Label>
            </div>

            {/* Employees List */}
            <ScrollArea className="h-48 border rounded-md p-2">
              {loadingEmployees ? (
                <div className="flex items-center justify-center h-full">
                  <Loader2 className="h-6 w-6 animate-spin" />
                </div>
              ) : filteredEmployees.length === 0 ? (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  {isArabic ? 'لا يوجد موظفين' : 'No employees found'}
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredEmployees.map((employee) => (
                    <div
                      key={employee.id}
                      className="flex items-center space-x-2 space-x-reverse p-2 hover:bg-muted/50 rounded-md transition-colors"
                    >
                      <Checkbox
                        id={`employee-${employee.id}`}
                        checked={formData.employee_ids.includes(employee.id)}
                        onCheckedChange={() => handleEmployeeToggle(employee.id)}
                      />
                      <Label
                        htmlFor={`employee-${employee.id}`}
                        className="cursor-pointer flex-1"
                      >
                        <div className="flex flex-col">
                          <span className="font-medium">{employee.name}</span>
                          {(employee.role_ar || employee.role_en) && (
                            <span className="text-sm text-muted-foreground">
                              {isArabic ? employee.role_ar : employee.role_en}
                            </span>
                          )}
                        </div>
                      </Label>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
            >
              {isArabic ? 'إلغاء' : 'Cancel'}
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="ms-2 h-4 w-4 animate-spin" />}
              {isEditMode 
                ? (isArabic ? 'تحديث' : 'Update')
                : (isArabic ? 'إضافة' : 'Create')
              }
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default EventModal

