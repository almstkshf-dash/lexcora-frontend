'use client';

import { useState, useEffect, useRef } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { format } from 'date-fns';
import { toast } from 'react-toastify';
import { createSession } from '@/app/services/api/sessions';
import { getLegalPeriods } from '@/app/services/api/legalPeriods';
import { uploadFiles } from '../../../../../utils/fileUpload';

// Helper function to format date for MySQL
const formatDateForMySQL = (dateString) => {
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
};

export const useSessionForm = ({ isOpen, caseId, isRtl, onClose, onSessionAdded }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [legalPeriods, setLegalPeriods] = useState([]);
  const [isAddLegalPeriodOpen, setIsAddLegalPeriodOpen] = useState(false);
  
  // Track uploaded files to prevent re-upload
  const uploadedFilesRef = useRef([]);
  const isSubmittingRef = useRef(false);

  // Fetch legal periods when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchLegalPeriods();
      // Reset refs when modal opens
      uploadedFilesRef.current = [];
      isSubmittingRef.current = false;
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

  // File validation
  const validateFile = (file) => {
    const maxSize = 10 * 1024 * 1024; // 10MB
    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain', 'image/jpeg', 'image/jpg', 'image/png'];
    
    if (file.size > maxSize) {
      toast.error(
        isRtl ? `الملف "${file.name}" كبير جداً. الحد الأقصى 10MB` : `File "${file.name}" is too large. Maximum size is 10MB`,
        { autoClose: 3000 }
      );
      return false;
    }
    
    if (!allowedTypes.includes(file.type)) {
      toast.error(
        isRtl ? `نوع الملف "${file.name}" غير مدعوم` : `File type of "${file.name}" is not supported`,
        { autoClose: 3000 }
      );
      return false;
    }
    
    return true;
  };

  // File handlers
  const handleFileSelect = (event) => {
    const files = Array.from(event.target.files);
    const validFiles = files.filter(validateFile);
    setSelectedFiles(prev => [...prev, ...validFiles]);
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
    session_date: Yup.date()
      .required(isRtl ? "تاريخ الجلسة مطلوب" : "Session date is required"),
    session_time: Yup.string()
      .required(isRtl ? "وقت الجلسة مطلوب" : "Session time is required"),
    note: Yup.string().trim(),
    is_expert_session: Yup.boolean(),
    is_judgment_reserved: Yup.boolean(),
    status: Yup.boolean(),
    has_ruling: Yup.boolean(),
    ruling: Yup.string().when('has_ruling', {
      is: true,
      then: (schema) => schema.required(isRtl ? "منطوق الحكم مطلوب" : "Ruling text is required"),
      otherwise: (schema) => schema.notRequired(),
    }),
    ruling_date: Yup.date().when('has_ruling', {
      is: true,
      then: (schema) => schema.required(isRtl ? "تاريخ صدور الحكم مطلوب" : "Ruling date is required"),
      otherwise: (schema) => schema.notRequired(),
    }),
    legal_period_id: Yup.string().when('has_ruling', {
      is: true,
      then: (schema) => schema.required(isRtl ? "المدة القانونية مطلوبة" : "Legal period is required"),
      otherwise: (schema) => schema.notRequired(),
    }),
  });

  // Formik setup
  const formik = useFormik({
    initialValues: {
      session_date: '',
      session_time: '',
      note: '',
      link: '',
      is_expert_session: false,
      is_judgment_reserved: false,
      status: true,
      has_ruling: false,
      ruling: '',
      ruling_date: '',
      legal_period_id: '',
    },
    validationSchema,
    onSubmit: async (values) => {
      // Prevent duplicate submissions
      if (isSubmittingRef.current) {
        console.log('Already submitting, ignoring duplicate submission');
        return;
      }
      
      isSubmittingRef.current = true;
      setIsLoading(true);
      
      try {
        // Upload files first if any are selected and not already uploaded
        let uploadedFiles = uploadedFilesRef.current;
        
        if (selectedFiles.length > 0 && uploadedFilesRef.current.length === 0) {
          setIsUploading(true);
          try {
            uploadedFiles = await uploadFiles(selectedFiles, 'sessions');
            // Store uploaded files in ref to prevent re-upload
            uploadedFilesRef.current = uploadedFiles;
            // Clear selected files immediately after successful upload
            setSelectedFiles([]);
            toast.success(
              isRtl ? `تم رفع ${uploadedFiles.length} ملف بنجاح` : `Successfully uploaded ${uploadedFiles.length} files`,
              { autoClose: 2000 }
            );
          } catch (uploadError) {
            toast.error(
              isRtl ? "فشل في رفع الملفات" : "Failed to upload files",
              { autoClose: 3000 }
            );
            setIsLoading(false);
            setIsUploading(false);
            isSubmittingRef.current = false;
            return; // Stop submission if file upload fails
          } finally {
            setIsUploading(false);
          }
        }

        // Combine date and time for API
        const combinedDateTime = `${values.session_date}T${values.session_time}:00`;

        const sessionData = {
          case_id: caseId,
          session_date: formatDateForMySQL(combinedDateTime),
          link: values.link.trim() || null,
          is_expert_session: values.is_expert_session,
          is_judgment_reserved: values.is_judgment_reserved,
          status: values.status ? 'active' : 'inactive',
          note: values.note.trim() || null,
          has_ruling: values.has_ruling,
          ruling: values.ruling.trim() || null,
          ruling_date: values.ruling_date || null,
          legal_period_id: values.legal_period_id || null,
          files: uploadedFiles,
        };

        const response = await createSession(sessionData);
        
        // Check if response indicates failure (permission or other errors)
        if (response?.success === false) {
          toast.error(
            response?.message || (isRtl ? "فشل في إضافة الجلسة" : "Failed to add session"),
            { autoClose: 3000 }
          );
          return;
        }
        
        if (response.success) {
          toast.success(
            isRtl ? "تم إضافة الجلسة بنجاح" : "Session added successfully",
            {
              autoClose: 3000,
              hideProgressBar: false,
              closeOnClick: true,
              pauseOnHover: true,
              draggable: true,
            }
          );
          
          // Reset refs after successful submission
          uploadedFilesRef.current = [];
          isSubmittingRef.current = false;
          
          formik.resetForm();
          onSessionAdded && onSessionAdded(response.data);
          onClose();
        } else {
          isSubmittingRef.current = false;
        }
      } catch (error) {
        // Check if it's a permission error (403)
        const isPermissionError = error?.response?.status === 403;
        const errorMessage = isPermissionError 
          ? (error?.response?.data?.message || (isRtl ? "ليس لديك صلاحية لإضافة جلسة" : "You do not have permission to add a session"))
          : (error?.response?.data?.message || (isRtl ? "فشل في إضافة الجلسة" : "Failed to add session"));
        
        toast.error(errorMessage, {
          autoClose: 3000,
        });
        isSubmittingRef.current = false;
      } finally {
        setIsLoading(false);
        setIsUploading(false);
      }
    },
  });

  return {
    formik,
    isLoading,
    isUploading,
    selectedFiles,
    legalPeriods,
    isAddLegalPeriodOpen,
    setIsAddLegalPeriodOpen,
    handleFileSelect,
    handleFileDrop,
    handleDragOver,
    removeSelectedFile,
    clearAllFiles,
    fetchLegalPeriods,
  };
};
