'use client';

import React from 'react';
import { createPortal } from 'react-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Calendar, Save, CircleX } from 'lucide-react';
import AddLegalPeriodModal from '@/app/cases/add-case/sessions/AddLegalPeriodModal';
import SessionBasicInfo from './SessionBasicInfo';
import SessionSettings from './SessionSettings';
import RulingSection from './RulingSection';
import FileUploadSection from './FileUploadSection';
import { useSessionForm } from './useSessionForm';
import { chatWithLegalAssistant } from '@/app/services/api/legalAssistant';
import { uploadFiles } from '@/../utils/fileUpload';
import { toast } from 'react-toastify';

const AddSessionModal = ({ isOpen, onClose, caseId, onSessionAdded }) => {
  const { language } = useLanguage();
  const isRtl = language === 'ar';
  const [isDrafting, setIsDrafting] = React.useState(false);

  const {
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
  } = useSessionForm({ isOpen, caseId, isRtl, onClose, onSessionAdded });

  const handleDraftWithAI = async () => {
    if (isDrafting) return;
    setIsDrafting(true);
    try {
      const uploaded = selectedFiles.length ? await uploadFiles(selectedFiles, 'sessions') : [];
      const prompt = `Draft a session note and suggested ruling.
Case ID: ${caseId || ''}
Topic: ${formik.values.topic || ''}
Session type: ${formik.values.session_type || ''}
Decision: ${formik.values.decision || ''}
Note: ${formik.values.note || ''}
Provide concise bullet points for note and a short ruling text.`;

      const resp = await chatWithLegalAssistant({
        message: prompt,
        context: { caseId },
        attachments: uploaded,
      });

      if (resp?.answer) {
        // Heuristic: split into note/ruling if possible
        const parts = resp.answer.split('Ruling:');
        if (parts.length > 1) {
          formik.setFieldValue('note', parts[0].trim());
          formik.setFieldValue('ruling', parts.slice(1).join('Ruling:').trim());
        } else {
          formik.setFieldValue('note', resp.answer);
        }
      }
    } catch (error) {
      console.error(error);
      toast.error(isRtl ? 'تعذر إنشاء مسودة الجلسة' : 'Failed to draft session with AI');
    } finally {
      setIsDrafting(false);
    }
  };

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[20] flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 dark:bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-white dark:bg-gray-900 w-full max-w-2xl mx-4 h-[90vh] flex flex-col rounded-lg shadow-2xl dark:shadow-gray-950/50 border dark:border-gray-800">
        {/* Header */}
        <div className={`pb-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-800 rounded-t-lg p-6 ${isRtl ? "text-right" : "text-left"}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/50 rounded-lg">
                <Calendar className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                  {isRtl ? "إضافة جلسة" : "Add Session"}
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {isRtl 
                    ? "أدخل معلومات الجلسة الجديدة أدناه"
                    : "Enter the new session information below"}
                </p>
              </div>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
            >
              <CircleX className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Form wrapper */}
        <form onSubmit={formik.handleSubmit} className="flex-1 flex flex-col min-h-0">
          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto min-h-0 p-6 bg-gray-50 dark:bg-gray-900">
            <div className="space-y-6">
              {/* Basic Information Section */}
              <SessionBasicInfo formik={formik} isRtl={isRtl} />

              {/* Session Settings Section */}
              <SessionSettings formik={formik} isRtl={isRtl} />

              {/* Ruling Section - Conditional */}
              <RulingSection 
                formik={formik} 
                isRtl={isRtl} 
                legalPeriods={legalPeriods}
                onAddLegalPeriod={() => setIsAddLegalPeriodOpen(true)}
              />

              {/* File Upload Section */}
              <FileUploadSection 
                selectedFiles={selectedFiles}
                onFileSelect={handleFileSelect}
                onFileDrop={handleFileDrop}
                onDragOver={handleDragOver}
                onRemoveFile={removeSelectedFile}
                onClearAll={clearAllFiles}
                isRtl={isRtl}
              />
            </div>
          </div>

          {/* Fixed Footer */}
          <div className="border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 rounded-b-lg p-6">
            <div className="flex justify-end gap-3 flex-wrap">
              <Button
                type="button"
                variant="outline"
                onClick={handleDraftWithAI}
                disabled={isLoading || isUploading || isDrafting}
              >
                {isDrafting ? (isRtl ? 'جاري الإنشاء...' : 'Drafting...') : (isRtl ? 'صياغة بالذكاء الاصطناعي' : 'Draft with AI')}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isLoading || isUploading}
                // className="flex items-center gap-2 px-6 border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300"
              >
                <CircleX className="h-4 w-4" />
                {isRtl ? "إلغاء" : "Cancel"}
              </Button>
              <Button
                type="submit"
                disabled={isLoading || isUploading}
                // className="flex items-center gap-2 px-6 bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700 text-white"
              >
                <Save className="h-4 w-4" />
                {isUploading
                  ? (isRtl ? "جار رفع الملفات..." : "Uploading files...")
                  : isLoading 
                    ? (isRtl ? "جار الإضافة..." : "Adding...") 
                    : (isRtl ? "إضافة" : "Add")}
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

export default AddSessionModal;
