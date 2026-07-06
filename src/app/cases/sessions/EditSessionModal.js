"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useFormik } from "formik";
import * as Yup from "yup";
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import useSWR, { mutate } from "swr";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTranslations } from "@/hooks/useTranslations";
import { getSession, updateSession, deleteSessionDocument } from "@/app/services/api/sessions";
import { getLegalPeriods } from "@/app/services/api/legalPeriods";
import { uploadFiles } from "../../../../utils/fileUpload";
import { toast } from "react-toastify";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar, Save, Settings, FileText, Download, Trash2, Plus, CircleX, CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import AddLegalPeriodModal from '@/app/cases/add-case/sessions/AddLegalPeriodModal';

// Helper function to format date for MySQL
const formatDateForMySQL = (dateString) => {
  const date = new Date(dateString);
  // Format as YYYY-MM-DD HH:MM:SS
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
};

const EditSessionModal = ({ 
  isOpen, 
  onClose, 
  sessionId 
}) => {
  const { language } = useLanguage();
  const {t} = useTranslations();
  const isRtl = language === "ar";
  const [isLoading, setIsLoading] = useState(false);
  const [deletingDocumentId, setDeletingDocumentId] = useState(null);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [legalPeriods, setLegalPeriods] = useState([]);
  const [isAddLegalPeriodOpen, setIsAddLegalPeriodOpen] = useState(false);

  // Fetch legal periods when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchLegalPeriods();
    }
  }, [isOpen]);

  const fetchLegalPeriods = async () => {
    try {
      const data = await getLegalPeriods();
      if (data.success) {
        setLegalPeriods(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching legal periods:', error);
    }
  };


  // Fetch session data using SWR - only when modal is open
  const { data: sessionData, error: sessionError, isLoading: sessionLoading, mutate: refreshSession } = useSWR(
    sessionId && isOpen ? `session-${sessionId}` : null,
    () => getSession(sessionId),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      shouldRetryOnError: true,
    }
  );

  // Extract session object from API response
  const session = sessionData?.success ? sessionData.data : null;
  

  // Handle document deletion
  const handleDeleteDocument = async (documentId, documentName) => {
    const confirmMessage = t('sessions.confirmDeleteDocument', { name: documentName });
    
    if (!window.confirm(confirmMessage)) {
      return;
    }

    setDeletingDocumentId(documentId);
    try {
      await deleteSessionDocument(sessionId, documentId);
      
      toast.success(t('sessions.documentDeletedSuccess'), {
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });

      // Refresh the documents list
      refreshSession();
    } catch (error) {
      toast.error(t('sessions.documentDeleteFailed'), {
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });

    } finally {
      setDeletingDocumentId(null);
    }
  };

  // File handling functions
  const validateFile = (file) => {
    const maxSize = 10 * 1024 * 1024; // 10MB
    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain', 'image/jpeg', 'image/jpg', 'image/png'];
    
    if (file.size > maxSize) {
      toast.error(t('sessions.fileTooLarge', { name: file.name }), {
        autoClose: 3000
      });
      return false;
    }
    
    if (!allowedTypes.includes(file.type)) {
      toast.error(t('sessions.fileTypeNotSupported', { name: file.name }), {
        autoClose: 3000
      });
      return false;
    }
    
    return true;
  };

  const handleFileSelect = (event) => {
    const files = Array.from(event.target.files);
    const validFiles = files.filter(validateFile);
    setSelectedFiles(prev => [...prev, ...validFiles]);
    // Clear the input so the same file can be selected again if needed
    event.target.value = '';
  };

  const handleFileDrop = (event) => {
    event.preventDefault();
    const files = Array.from(event.dataTransfer.files);
    const validFiles = files.filter(validateFile);
    setSelectedFiles(prev => [...prev, ...validFiles]);
  };

  const handleDragOver = (event) => {
    event.preventDefault();
  };

  const removeSelectedFile = (index) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const clearAllFiles = () => {
    setSelectedFiles([]);
  };

  // Validation schema
  const validationSchema = Yup.object({
    decision: Yup.string().trim(),
    session_date: Yup.date()
      .required(t('sessions.sessionDateRequired')),
    session_time: Yup.string()
      .required(t('sessions.sessionTimeRequired')),
    note: Yup.string().trim(),
    // link: Yup.string().url(t('sessions.invalidUrl')).trim(),
    is_expert_session: Yup.boolean(),
    is_judgment_reserved: Yup.boolean(),
    is_judgment_deferred: Yup.boolean(),
    status: Yup.boolean(),
    has_ruling: Yup.boolean(),
    ruling: Yup.string().when('has_ruling', {
      is: true,
      then: (schema) => schema.required(isRtl ? "????? ????? ?????" : "Ruling text is required"),
      otherwise: (schema) => schema.notRequired(),
    }),
    ruling_date: Yup.date().when('has_ruling', {
      is: true,
      then: (schema) => schema.required(isRtl ? "????? ???? ????? ?????" : "Ruling date is required"),
      otherwise: (schema) => schema.notRequired(),
    }),
    legal_period_id: Yup.string().when('has_ruling', {
      is: true,
      then: (schema) => schema.required(isRtl ? "????? ????????? ??????" : "Legal period is required"),
      otherwise: (schema) => schema.notRequired(),
    }),
  });

  // Helper function to get initial values from session data
  const getInitialValues = () => {
    if (!session) {
      return {
        decision: "",
        session_date: "",
        session_time: "",
        note: "",
        link: "",
        is_expert_session: false,
        is_judgment_reserved: false,
        is_judgment_deferred: false,
        status: true,
        has_ruling: false,
        ruling: "",
        ruling_date: "",
        legal_period_id: "",
      };
    }

    return {
      decision: session.decision || "",
      session_date: session.session_date 
        ? new Date(session.session_date).toISOString().slice(0, 10)
        : "",
      session_time: session.session_date 
        ? new Date(session.session_date).toTimeString().slice(0, 5)
        : "",
      note: session.note || "",
      link: session.link || "",
      is_expert_session: session.is_expert_session === 1 || session.is_expert_session === true,
      is_judgment_reserved: session.is_judgment_reserved === 1 || session.is_judgment_reserved === true,
      is_judgment_deferred: session.is_judgment_deferred === 1 || session.is_judgment_deferred === true,
      status: session.status === 'active' || session.status === 1,
      has_ruling: session.has_ruling === 1 || session.has_ruling === true,
      ruling: session.ruling || "",
      ruling_date: session.ruling_date || "",
      legal_period_id: session.legal_period_id || "",
    };
  };

  // Formik setup - Initialize with session data when available
  const formik = useFormik({
    initialValues: getInitialValues(),
    validationSchema,
    enableReinitialize: true,
    onSubmit: async (values) => {
      setIsLoading(true);
      try {
        // Upload files first if any are selected
        let uploadedFiles = [];
        if (selectedFiles.length > 0) {
          setIsUploading(true);
          try {
            uploadedFiles = await uploadFiles(selectedFiles, 'sessions');
            toast.success(t('sessions.filesUploadedCount', { count: uploadedFiles.length }), {
              autoClose: 2000
            });
          } catch (uploadError) {
            toast.error(t('sessions.failedToUploadFiles'), {
              autoClose: 3000
            });

            // Continue with form submission even if file upload fails
            uploadedFiles = [];
          }
        }

        // Combine date and time for API
        const combinedDateTime = `${values.session_date}T${values.session_time}:00`;

        // Transform data for API
        const updateData = {
          decision: values.decision.trim() || null,
          session_date: formatDateForMySQL(combinedDateTime),
          note: values.note.trim() || null,
          link: values.link.trim() || null,
          is_expert_session: values.is_expert_session,
          is_judgment_reserved: values.is_judgment_reserved,
          is_judgment_deferred: values.is_judgment_deferred,
          status: values.status ? 'active' : 'inactive',
          has_ruling: values.has_ruling,
          ruling: values.ruling.trim() || null,
          ruling_date: values.ruling_date || null,
          legal_period_id: values.legal_period_id || null,
          files: uploadedFiles, // Add uploaded files to the data
        };

        await updateSession(sessionId, updateData);
        
        toast.success(t('sessions.sessionUpdatedSuccess'), {
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });

        // Refresh the session data after successful update
        refreshSession();
        
        // Mutate home page data to refresh sessions with/without decisions
        // This will trigger re-fetch of both home page components
        mutate('sessions-with-decisions');
        mutate('sessions-no-decision');
        mutate('sessions-this-week');
        
        // Clear selected files
        setSelectedFiles([]);
        onClose();
      } catch (error) {
        // Check if it's a permission error (403)
        const isPermissionError = error?.response?.status === 403;
        
        if (isPermissionError) {
          const permissionMessage = error?.response?.data?.message || (language === 'ar' ? 'ليس لديك الصلاحية لتحديث هذه الجلسة' : 'You do not have permission to update this session');
          toast.error(permissionMessage, {
            autoClose: 3000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
          });
        } else {
          const generalMessage = error?.response?.data?.message || t('sessions.sessionUpdateFailed');
          toast.error(generalMessage, {
            autoClose: 3000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
          });
        }
      } finally {
        setIsLoading(false);
        setIsUploading(false);
      }
    },
  });

  if (!isOpen) return null;

  // Show loading state while fetching session data
  if (sessionLoading) {
    return createPortal(
      <div className="fixed inset-0 z-[9999] flex items-center justify-center">
        {/* Backdrop */}
        <div 
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          onClick={onClose}
        />
        
        {/* Modal */}
        <div className="relative w-full max-w-2xl mx-4 bg-white rounded-lg shadow-2xl p-8">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-gray-600">
              {t('sessions.loadingSessionData')}
            </span>
          </div>
        </div>
      </div>,
      document.body
    );
  }

  // Show error state if session failed to load
  if (sessionError || !session) {
    return createPortal(
      <div className="fixed inset-0 z-[9999] flex items-center justify-center">
        {/* Backdrop */}
        <div 
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          onClick={onClose}
        />
        
        {/* Modal */}
        <div className="relative w-full max-w-2xl mx-4 bg-white dark:bg-gray-800 rounded-lg shadow-2xl p-8">
          <div className="text-center">
            <div className="text-red-600 dark:text-red-400 mb-4">
              <Calendar className="h-8 w-8 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
              {t('sessions.failedToLoadSessionData')}
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6">
              {t('sessions.errorLoadingSession')}
            </p>
            <Button onClick={onClose}>
              {t('sessions.close')}
            </Button>
          </div>
        </div>
      </div>,
      document.body
    );
  }

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative w-full max-w-2xl mx-4 h-[90vh] flex flex-col bg-white dark:bg-gray-800 rounded-lg shadow-2xl">
        {/* Header */}
        <div className={`pb-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-700 dark:to-gray-700 rounded-t-lg p-6 ${isRtl ? "text-right" : "text-left"}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <Calendar className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                  {t('sessions.editSession')}
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  {t('sessions.updateSessionInfo')}
                </p>
              </div>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600"
            >
              <CircleX className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Form wrapper */}
        <form onSubmit={formik.handleSubmit} className="flex-1 flex flex-col min-h-0">
          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto min-h-0 p-6">
            <div className="space-y-6">
                  {/* Basic Information Section */}
                  <div className="space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-gray-100 dark:border-gray-700">
                  <Calendar className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                  <h3 className="text-md font-medium text-gray-900 dark:text-gray-100">
                    {t('sessions.basicInformation')}
                  </h3>
                </div>

                {/* Decision Field */}
                <div className="space-y-2">
                  <Label htmlFor="decision" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {t('sessions.decision')}
                  </Label>
                  <Input
                    id="decision"
                    name="decision"
                    value={formik.values.decision}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    placeholder={t('sessions.enterDecision')}
                    className={`${isRtl ? "text-right" : "text-left"} focus:ring-2 focus:ring-blue-500 border-gray-300`}
                  />
                  {formik.touched.decision && formik.errors.decision && (
                    <p className="text-sm text-red-500">
                      {formik.errors.decision}
                    </p>
                  )}
                </div>

                {/* Session Date and Time Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Session Date Field */}
                  <div className="space-y-2">
                    <Label htmlFor="session_date" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {t('sessions.sessionDate')} *
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
                            <span>{t('sessions.pickSessionDate') || (isRtl ? "???? ????? ??????" : "Pick session date")}</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0 z-[10000]" align="start">
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
                      {t('sessions.sessionTime')} *
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
                    {t('sessions.notes')}
                  </Label>
                  <Textarea
                    id="note"
                    name="note"
                    value={formik.values.note}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    placeholder={t('sessions.enterNotes')}
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
                    {t('sessions.link')}
                  </Label>
                  <Input
                    id="link"
                    name="link"
                    type="text"
                    value={formik.values.link}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    placeholder={t('sessions.enterLink')}
                    className={`${isRtl ? "text-right" : "text-left"} focus:ring-2 focus:ring-blue-500 border-gray-300`}
                  />
                  {formik.touched.link && formik.errors.link && (
                    <p className="text-sm text-red-500">
                      {formik.errors.link}
                    </p>
                  )}
                </div>
              </div>

              {/* Session Settings Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-gray-100 dark:border-gray-700">
                  <Settings className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                  <h3 className="text-md font-medium text-gray-900 dark:text-gray-100">
                    {t('sessions.sessionSettings')}
                  </h3>
                </div>

                {/* Session Status Switch */}
                <div className={cn(
                  "p-4 rounded-lg",
                  formik.values.is_judgment_reserved ? "bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800" : "bg-gray-50 dark:bg-gray-700"
                )}>
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label 
                        htmlFor="status" 
                        className="text-sm font-medium text-gray-700 dark:text-gray-300"
                      >
                        {t('sessions.sessionStatus')}
                      </Label>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {formik.values.status 
                          ? t('sessions.sessionIsActive')
                          : t('sessions.sessionIsInactive')
                        }
                        {formik.values.is_judgment_reserved && (
                          <span className="block text-red-600 dark:text-red-400 font-medium mt-1">
                            {isRtl ? "?? ????? ?????? ???????? ???? ??? ?????" : "Session auto-disabled due to judgment reserved"}
                          </span>
                        )}
                      </p>
                    </div>
                    <Switch
                      id="status"
                      checked={formik.values.status}
                      onCheckedChange={(checked) => 
                        formik.setFieldValue("status", checked)
                      }
                      disabled={formik.values.is_judgment_reserved}
                    />
                  </div>
                </div>

                {/* Session Options - Using Switches */}
                <div className="space-y-3">
                  {/* Expert Session Switch */}
                  <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <Label 
                          htmlFor="is_expert_session" 
                          className="text-sm font-medium text-gray-700 dark:text-gray-300"
                        >
                          {t('sessions.expertSession')}
                        </Label>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {formik.values.is_expert_session 
                            ? t('sessions.thisIsExpertSession')
                            : t('sessions.notExpertSession')
                          }
                        </p>
                      </div>
                      <Switch
                        id="is_expert_session"
                        checked={formik.values.is_expert_session}
                        onCheckedChange={(checked) => 
                          formik.setFieldValue("is_expert_session", checked)
                        }
                      />
                    </div>
                  </div>

                  {/* Judgment Reserved Switch */}
                  <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <Label 
                          htmlFor="is_judgment_reserved" 
                          className="text-sm font-medium text-gray-700 dark:text-gray-300"
                        >
                          {t('sessions.judgmentReserved')}
                        </Label>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {formik.values.is_judgment_reserved 
                            ? t('sessions.judgmentIsReserved')
                            : t('sessions.judgmentNotReserved')
                          }
                        </p>
                      </div>
                      <Switch
                        id="is_judgment_reserved"
                        checked={formik.values.is_judgment_reserved}
                        onCheckedChange={(checked) => {
                          formik.setFieldValue("is_judgment_reserved", checked);
                          // If judgment is reserved, set status to inactive
                          if (checked) {
                            formik.setFieldValue("status", false);
                          }
                          // Reset is_judgment_deferred when is_judgment_reserved is unchecked
                          if (!checked) {
                            formik.setFieldValue("is_judgment_deferred", false);
                          }
                        }}
                      />
                    </div>
                  </div>

                  {/* Judgment Deferred Switch - Only show when Judgment Reserved is checked */}
                  {formik.values.is_judgment_reserved && (
                    <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <Label 
                            htmlFor="is_judgment_deferred" 
                            className="text-sm font-medium text-gray-700 dark:text-gray-300"
                          >
                            {t('sessions.judgmentDeferred')}
                          </Label>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {formik.values.is_judgment_deferred 
                              ? t('sessions.judgmentIsDeferred')
                              : t('sessions.judgmentNotDeferred')
                            }
                          </p>
                        </div>
                        <Switch
                          id="is_judgment_deferred"
                          checked={formik.values.is_judgment_deferred}
                          onCheckedChange={(checked) => 
                            formik.setFieldValue("is_judgment_deferred", checked)
                          }
                        />
                      </div>
                    </div>
                  )}

                  {/* Has Ruling Switch */}
                  <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <Label 
                          htmlFor="has_ruling" 
                          className="text-sm font-medium text-gray-700 dark:text-gray-300"
                        >
                          {isRtl ? "??? ????" : "Has Ruling"}
                        </Label>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {formik.values.has_ruling 
                            ? (isRtl ? "???? ??? ????" : "Ruling has been issued")
                            : (isRtl ? "?? ???? ???" : "No ruling issued")
                          }
                        </p>
                      </div>
                      <Switch
                        id="has_ruling"
                        checked={formik.values.has_ruling}
                        onCheckedChange={(checked) => 
                          formik.setFieldValue("has_ruling", checked)
                        }
                      />
                    </div>
                  </div>
                  
                  {/* Ruling Text and Legal Period - Show when has_ruling is true */}
                  {formik.values.has_ruling && (
                    <div className="space-y-4 pl-4 border-l-4 border-blue-200 dark:border-blue-800">
                      {/* Ruling Textarea */}
                      <div className="space-y-2">
                        <Label htmlFor="ruling" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          {isRtl ? "????? ?????" : "Ruling Text"} <span className="text-red-500 dark:text-red-400">*</span>
                        </Label>
                        <Textarea
                          id="ruling"
                          name="ruling"
                          value={formik.values.ruling}
                          onChange={formik.handleChange}
                          onBlur={formik.handleBlur}
                          placeholder={isRtl ? "???? ????? ?????" : "Enter ruling text"}
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
                        <Label htmlFor="ruling_date" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          {isRtl ? "????? ???? ?????" : "Ruling Date"} <span className="text-red-500 dark:text-red-400">*</span>
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
                                <span>{isRtl ? "???? ????? ???? ?????" : "Pick ruling date"}</span>
                              )}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0 z-[10000]" align="start">
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
                        <Label htmlFor="legal_period_id" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          {isRtl ? "????? ?????????" : "Legal Period"} <span className="text-red-500 dark:text-red-400">*</span>
                        </Label>
                        <div className="flex items-center gap-2">
                          <Select
                            value={formik.values.legal_period_id?.toString()}
                            onValueChange={(value) => formik.setFieldValue('legal_period_id', value)}
                          >
                            <SelectTrigger className={cn(
                              "flex-1",
                              formik.touched.legal_period_id && formik.errors.legal_period_id && "border-red-500"
                            )}>
                              <SelectValue placeholder={isRtl ? "???? ????? ?????????" : "Select Legal Period"} />
                            </SelectTrigger>
                            <SelectContent className="z-[10001]">
                              {legalPeriods.map((period) => (
                                <SelectItem key={period.id} value={period.id.toString()}>
                                  <div className="flex flex-col">
                                    <span className="font-medium">{period.name}</span>
                                    <span className="text-xs text-muted-foreground">
                                      {[
                                        period.objection_days && `${isRtl ? '??????' : 'Objection'}: ${period.objection_days} ${isRtl ? '???' : 'days'}`,
                                        period.appeal_days && `${isRtl ? '?????????' : 'Appeal'}: ${period.appeal_days} ${isRtl ? '???' : 'days'}`,
                                        period.cassation_days && `${isRtl ? '?????' : 'Cassation'}: ${period.cassation_days} ${isRtl ? '???' : 'days'}`
                                      ].filter(Boolean).join(' - ')}
                                    </span>
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={() => setIsAddLegalPeriodOpen(true)}
                            className="h-10 gap-1 shrink-0"
                          >
                            <Plus className="h-4 w-4" />
                            <span className="text-sm">{isRtl ? "?????" : "Add"}</span>
                          </Button>
                        </div>
                        {formik.touched.legal_period_id && formik.errors.legal_period_id && (
                          <p className="text-sm text-red-500">{formik.errors.legal_period_id}</p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* File Upload Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-gray-100 dark:border-gray-700">
                  <Plus className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                  <h3 className="text-md font-medium text-gray-900 dark:text-gray-100">
                    {t('sessions.uploadFiles')}
                  </h3>
                </div>

                {/* File Drop Zone */}
                <div
                  className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center hover:border-gray-400 dark:hover:border-gray-500 transition-colors cursor-pointer bg-white dark:bg-gray-700"
                  onDrop={handleFileDrop}
                  onDragOver={handleDragOver}
                  onClick={() => document.getElementById('file-input').click()}
                >
                  <input
                    id="file-input"
                    type="file"
                    multiple
                    accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                  <div className="flex flex-col items-center gap-2">
                    <Plus className="h-8 w-8 text-gray-400 dark:text-gray-500" />
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      {t('sessions.clickOrDragFiles')}
                    </p>
                    <p className="text-xs text-gray-400 dark:text-gray-500">
                      {t('sessions.pdfDocTxtImages')}
                    </p>
                  </div>
                </div>

                {/* Selected Files Display */}
                {selectedFiles.length > 0 && (
                  <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {t('sessions.selectedFiles')} ({selectedFiles.length})
                      </h4>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={clearAllFiles}
                        className="text-red-600 hover:bg-red-50"
                      >
                        {t('sessions.clearAll')}
                      </Button>
                    </div>
                    <div className="space-y-2">
                      {selectedFiles.map((file, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-2 bg-white dark:bg-gray-600 rounded border border-gray-200 dark:border-gray-500"
                        >
                          <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                            <span className="text-sm text-gray-700 dark:text-gray-200 truncate">
                              {file.name}
                            </span>
                            <span className="text-xs text-gray-400 dark:text-gray-500">
                              ({(file.size / 1024 / 1024).toFixed(2)} MB)
                            </span>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeSelectedFile(index)}
                            className="text-red-600 hover:bg-red-50 h-6 w-6 p-0"
                          >
                            <CircleX className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Session Documents Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-gray-100 dark:border-gray-700">
                  <FileText className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                  <h3 className="text-md font-medium text-gray-900 dark:text-gray-100">
                    {t('sessions.sessionDocuments')}
                  </h3>
                </div>

                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  {sessionLoading ? (
                    <div className="flex items-center justify-center py-6">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 dark:border-blue-400"></div>
                      <span className="ml-2 text-sm text-gray-600 dark:text-gray-300">
                        {t('sessions.loadingDocuments')}
                      </span>
                    </div>
                  ) : sessionError ? (
                    <div className="text-center py-6">
                      <p className="text-sm text-red-500 dark:text-red-400">
                        {t('sessions.failedToLoadDocuments')}
                      </p>
                    </div>
                  ) : session?.documents && session.documents.length > 0 ? (
                    <div className="space-y-3">
                      {session.documents.map((document) => (
                        <div
                          key={document.id}
                          className="flex items-center justify-between p-3 bg-white dark:bg-gray-600 rounded-lg border border-gray-200 dark:border-gray-500 hover:border-gray-300 dark:hover:border-gray-400 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                              <FileText className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div>
                              <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                {document.document_name}
                              </h4>
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                {t('sessions.uploadedOn')} {" "}
                                {new Date(document.created_at).toLocaleDateString(
                                  isRtl ? "ar" : "en"
                                )}
                              </p>
                              {document.uploaded_by && (
                                <p className="text-xs text-gray-400 dark:text-gray-500">
                                  {t('sessions.by')} {document.uploaded_by}
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => window.open(document.document_url, '_blank')}
                              className="flex items-center gap-2 hover:bg-blue-50 text-blue-600"
                            >
                              <Download className="h-4 w-4" />
                              {t('sessions.download')}
                            </Button>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteDocument(document.id, document.document_name)}
                              disabled={deletingDocumentId === document.id}
                              className="flex items-center gap-2 hover:bg-red-50 text-red-600"
                            >
                              {deletingDocumentId === document.id ? (
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
                              ) : (
                                <Trash2 className="h-4 w-4" />
                              )}
                              {deletingDocumentId === document.id 
                                ? t('sessions.deleting')
                                : t('sessions.delete')
                              }
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-6">
                      <FileText className="h-8 w-8 text-gray-400 dark:text-gray-500 mx-auto mb-2" />
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {t('sessions.noDocumentsFound')}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Fixed Footer */}
          <div className="border-t border-gray-100 dark:border-gray-700 p-6 bg-white dark:bg-gray-800 rounded-b-lg">
            <div className="flex justify-end gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  disabled={isLoading}
                  className="flex items-center gap-2 px-6"
                >
                  <CircleX className="h-4 w-4" />
                  {t('sessions.cancel')}
                </Button>
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="flex items-center gap-2 px-6 bg-blue-600 hover:bg-blue-700"
                >
                  <Save className="h-4 w-4" />
                  {isUploading
                    ? t('sessions.uploadingFiles')
                    : isLoading 
                      ? t('sessions.updating')
                      : t('sessions.update')}
                </Button>
              </div>
            </div>
          </form>
      </div>
      
      {/* Add Legal Period Modal */}
      <AddLegalPeriodModal
        open={isAddLegalPeriodOpen}
        onOpenChange={setIsAddLegalPeriodOpen}
        onSuccess={() => {
          fetchLegalPeriods();
          setIsAddLegalPeriodOpen(false);
        }}
      />
    </div>,
    document.body
  );
};

export default EditSessionModal;
