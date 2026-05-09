'use client';

import React, { useState, useEffect } from 'react';
import useSWR from 'swr';
import { Loader2, FileText, Trash2, Calendar as CalendarIcon, Clock, User, Flag, CheckSquare, FilesIcon, EyeClosed, Circle } from 'lucide-react';
import { toast } from 'react-toastify';
import { format } from 'date-fns';
import { getEmployees } from '@/app/services/api/employees';
import { createTask } from '@/app/services/api/tasks';
import { uploadFiles } from '@/app/services/api/upload';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTranslations } from '@/hooks/useTranslations';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const AddTaskModal = ({ isOpen, onClose, caseId, onTaskAdded }) => {
  const { isRTL, language } = useLanguage();
  const { t } = useTranslations();

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: '',
    status: '',
    assigned_to: '',
    due_date: null, // Changed to null for date object
  });

  // File state
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [isUploadingFiles, setIsUploadingFiles] = useState(false);

  // Loading state
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Calendar state
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  // Fetch employees data
  const { data: employeesData, error: employeesError, isLoading: employeesLoading } = useSWR(
    isOpen ? '/employees' : null,
    getEmployees,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    }
  );

  // Reset form when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      setFormData({
        title: '',
        description: '',
        priority: '',
        status: '',
        assigned_to: '',
        due_date: null,
      });
      setSelectedFiles([]);
      setIsCalendarOpen(false);
    }
  }, [isOpen]);

  // Handle input changes
  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Handle file selection
  const handleFileSelect = (event) => {
    const files = Array.from(event.target.files || []);
    
    // Validate files
    const validFiles = files.filter(file => {
      // Check file size (10MB max)
      if (file.size > 10 * 1024 * 1024) {
        toast.error(`${file.name} is too large (max 10MB)`);
        return false;
      }
      
      // Check file type
      const allowedTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'text/plain',
        'image/jpeg',
        'image/png',
        'image/jpg'
      ];
      
      if (!allowedTypes.includes(file.type)) {
        toast.error(`${file.name} is not a supported file type`);
        return false;
      }
      
      return true;
    });

    setSelectedFiles(prev => [...prev, ...validFiles]);
  };

  // Remove selected file
  const handleFileRemove = (index) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  // Format file size
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.title.trim()) {
      toast.error(t('common.titleRequired'));
      return;
    }

    if (!formData.priority) {
      toast.error(t('common.priorityRequired'));
      return;
    }

    if (!formData.status) {
      toast.error(t('common.statusRequired'));
      return;
    }

    if (!formData.assigned_to) {
      toast.error(t('common.employeeRequired'));
      return;
    }

    setIsSubmitting(true);
    
    try {
      let files = [];
      
      // Upload files to Vercel Blob if any are selected
      if (selectedFiles.length > 0) {
        setIsUploadingFiles(true);
        toast.info(t('common.uploadingFiles'));
        
        const uploadResult = await uploadFiles(selectedFiles, 'tasks');
        
        if (!uploadResult.success) {
          throw new Error(uploadResult.error || 'Failed to upload files');
        }
        
        // Transform uploaded files to the required format
        files = uploadResult.files.map(file => ({
          fileName: file.document_name,
          url: file.document_url
        }));
        
        setIsUploadingFiles(false);
      }

      const taskData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        priority: formData.priority,
        status: formData.status,
        assigned_to: parseInt(formData.assigned_to),
        due_date: formData.due_date ? format(formData.due_date, 'yyyy-MM-dd') : null,
        case_id: caseId,
        files: files
      };

      const result = await createTask(taskData);
      
      // Check if response indicates failure (permission or other errors)
      if (result?.success === false) {
        toast.error(result?.message || t('tasks.createTaskError'));
        return;
      }
      
      if (result.success) {
        toast.success(t('tasks.taskCreated'));
        
        // Call the callback to refresh parent data
        if (onTaskAdded) {
          onTaskAdded(result.data);
        }
        
        // Close the modal
        onClose();
      }
    } catch (error) {
      // Check if it's a permission error (403)
      const isPermissionError = error?.response?.status === 403;
      const errorMessage = isPermissionError 
        ? (error?.response?.data?.message || (language === 'ar' ? 'ليس لديك صلاحية لإضافة مهمة' : 'You do not have permission to add a task'))
        : (error?.response?.data?.message || error.message || t('tasks.createTaskError'));
      
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
      setIsUploadingFiles(false);
    }
  };

  // Priority options
  const priorityOptions = [
    { value: 'low', label: t('tasks.priorityLow') },
    { value: 'medium', label: t('tasks.priorityMedium') },
    { value: 'high', label: t('tasks.priorityHigh') },
    { value: 'urgent', label: t('tasks.priorityUrgent') },
  ];

  // Status options (previously task type options)
  const statusOptions = [
    { value: 'pending', label: t('tasks.statusPending') },
    { value: 'in_progress', label: t('tasks.statusInProgress') },
    { value: 'completed', label: t('tasks.statusCompleted') },
  ];

  // Process employees data
  const employees = (employeesData?.success && Array.isArray(employeesData.data)) ? employeesData.data : [];

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div 
        className={`fixed inset-0 z-50 flex items-center justify-center p-4 ${isRTL ? 'text-right' : 'text-left'}`}
        dir={isRTL ? 'rtl' : 'ltr'}
      >
        <div 
          className="w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-background rounded-2xl shadow-2xl border transform transition-all scale-100 opacity-100"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="sticky top-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b px-6 py-4 rounded-t-2xl">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-foreground">
                  {t('tasks.addTask')}
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                  {t('tasks.addTaskDescription')}
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="rounded-full"
                disabled={isSubmitting}
              >
                <Circle className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Information Section */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckSquare className="h-5 w-5 text-primary" />
                    {t('tasks.basicInformation')}
                  </CardTitle>
                  <CardDescription>
                    {t('tasks.basicInformationDescription')}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Title */}
                  <div className="space-y-2">
                    <Label htmlFor="title" className="text-sm font-medium">
                      {t('tasks.title')} <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => handleInputChange('title', e.target.value)}
                      placeholder={t('tasks.titlePlaceholder')}
                      disabled={isSubmitting}
                      className="h-11"
                      required
                    />
                  </div>

                  {/* Description */}
                  <div className="space-y-2">
                    <Label htmlFor="description" className="text-sm font-medium">
                      {t('tasks.description')}
                    </Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      placeholder={t('tasks.descriptionPlaceholder')}
                      disabled={isSubmitting}
                      rows={4}
                      className="resize-none"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Assignment & Priority Section */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5 text-primary" />
                    {t('tasks.assignmentDetails')}
                  </CardTitle>
                  <CardDescription>
                    {t('tasks.assignmentDetailsDescription')}
                  </CardDescription>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Priority */}
                  <div className="space-y-2">
                    <Label htmlFor="priority" className="text-sm font-medium flex items-center gap-2">
                      <Flag className="h-4 w-4" />
                      {t('tasks.priority')} <span className="text-red-500">*</span>
                    </Label>
                    <Select
                      value={formData.priority}
                      onValueChange={(value) => handleInputChange('priority', value)}
                      disabled={isSubmitting}
                      required
                    >
                      <SelectTrigger className="h-11">
                        <SelectValue placeholder={t('tasks.selectPriority')} />
                      </SelectTrigger>
                      <SelectContent>
                        {priorityOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            <div className="flex items-center gap-2">
                              <div 
                                className={`w-2 h-2 rounded-full ${
                                  option.value === 'urgent' ? 'bg-red-500' :
                                  option.value === 'high' ? 'bg-orange-500' :
                                  option.value === 'medium' ? 'bg-yellow-500' :
                                  'bg-green-500'
                                }`}
                              />
                              {option.label}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Status */}
                  <div className="space-y-2">
                    <Label htmlFor="status" className="text-sm font-medium flex items-center gap-2">
                      <CheckSquare className="h-4 w-4" />
                      {t('tasks.status')} <span className="text-red-500">*</span>
                    </Label>
                    <Select
                      value={formData.status}
                      onValueChange={(value) => handleInputChange('status', value)}
                      disabled={isSubmitting}
                      required
                    >
                      <SelectTrigger className="h-11">
                        <SelectValue placeholder={t('tasks.selectStatus')} />
                      </SelectTrigger>
                      <SelectContent>
                        {statusOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Due Date */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      {t('tasks.dueDate')}
                    </Label>
                    <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={`h-11 justify-start text-left font-normal ${
                            !formData.due_date && "text-muted-foreground"
                          }`}
                          disabled={isSubmitting}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {formData.due_date ? (
                            format(formData.due_date, "PPP")
                          ) : (
                            <span>{t('tasks.selectDate')}</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={formData.due_date}
                          onSelect={(date) => {
                            handleInputChange('due_date', date);
                            setIsCalendarOpen(false);
                          }}
                          disabled={(date) =>
                            date < new Date(new Date().setHours(0, 0, 0, 0))
                          }
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  {/* Assigned To */}
                  <div className="space-y-2">
                    <Label htmlFor="assigned_to" className="text-sm font-medium flex items-center gap-2">
                      <User className="h-4 w-4" />
                      {t('tasks.assignedEmployee')} <span className="text-red-500">*</span>
                    </Label>
                    {employeesLoading ? (
                      <div className="flex items-center justify-center p-4 border rounded-md">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span className={`${isRTL ? 'mr-2' : 'ml-2'} text-sm text-muted-foreground`}>
                          {t('common.loadingEmployees')}
                        </span>
                      </div>
                    ) : employeesError ? (
                      <div className="text-sm text-destructive p-3 bg-destructive/10 rounded-md border border-destructive/20">
                        {t('common.errorLoadingEmployees')}
                      </div>
                    ) : (
                      <Select
                        value={formData.assigned_to}
                        onValueChange={(value) => handleInputChange('assigned_to', value)}
                        disabled={isSubmitting}
                        required
                      >
                        <SelectTrigger className="h-11">
                          <SelectValue placeholder={t('tasks.selectEmployee')} />
                        </SelectTrigger>
                        <SelectContent>
                          {employees.map((employee) => (
                            <SelectItem key={employee.id} value={employee.id.toString()}>
                              <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-green-500" />
                                {employee.name}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Files Section */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-primary" />
                    {t('tasks.attachFiles')}
                  </CardTitle>
                  <CardDescription>
                    {t('tasks.attachFilesDescription')}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* File Input */}
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => document.getElementById('file-input')?.click()}
                      disabled={isSubmitting || isUploadingFiles}
                      className="flex items-center gap-2"
                    >
                      <FilesIcon className="h-4 w-4" />
                      {t('tasks.selectFiles')}
                    </Button>
                    <input
                      id="file-input"
                      type="file"
                      multiple
                      accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                  </div>

                  {/* File Format Info */}
                  <div className="text-xs text-muted-foreground bg-muted/50 p-3 rounded-md">
                    {t('tasks.supportedFormats')}
                  </div>

                  {/* Selected Files List */}
                  {selectedFiles.length > 0 && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Label className="text-sm font-medium">
                          {t('tasks.selectedFiles')}
                        </Label>
                        <span className="text-xs text-muted-foreground bg-primary/10 px-2 py-1 rounded-full">
                          {selectedFiles.length} {selectedFiles.length === 1 ? 'file' : 'files'}
                        </span>
                      </div>
                      <div className="grid gap-2 max-h-40 overflow-y-auto">
                        {selectedFiles.map((file, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between p-3 bg-muted/50 rounded-lg border transition-colors hover:bg-muted/70"
                          >
                            <div className="flex items-center gap-3 flex-1 min-w-0">
                              <FileText className="h-5 w-5 text-primary flex-shrink-0" />
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate">
                                  {file.name}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {formatFileSize(file.size)}
                                </p>
                              </div>
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => handleFileRemove(index)}
                              disabled={isSubmitting || isUploadingFiles}
                              className="flex-shrink-0 h-8 w-8 p-0 hover:bg-destructive/10 hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Upload Progress */}
                  {isUploadingFiles && (
                    <div className="flex items-center gap-3 p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
                      <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
                      <span className="text-sm font-medium text-blue-600">
                        {t('common.uploadingFiles')}
                      </span>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Footer */}
              <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  disabled={isSubmitting}
                  className="flex-1 sm:flex-none"
                >
                  {t('common.cancel')}
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting || employeesLoading || isUploadingFiles}
                  className="flex-1 sm:flex-none"
                >
                  {(isSubmitting || isUploadingFiles) ? (
                    <>
                      <Loader2 className={`h-4 w-4 animate-spin ${isRTL ? 'ml-2' : 'mr-2'}`} />
                      {isUploadingFiles ? t('common.uploadingFiles') : t('common.saving')}
                    </>
                  ) : (
                    <>
                      <CheckSquare className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                      {t('common.save')}
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default AddTaskModal;