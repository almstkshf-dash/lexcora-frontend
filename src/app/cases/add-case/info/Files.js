"use client";

import React, { useState, useCallback } from 'react';
import { Plus, File, Minus, FileText, Image, FileIcon, Download, Eye, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from '@/contexts/LanguageContext';
import { useTranslations } from '@/hooks/useTranslations';
import { cn } from "@/lib/utils";
import { useFormikContext } from '../FormikContext';

function Files() {
  const { language } = useLanguage();
  const { t } = useTranslations();
  const { values, setFieldValue } = useFormikContext();
  const isArabic = language === 'ar';

  // Get files from Formik values
  const { caseFiles } = values;
  const files = caseFiles || [];

  const [isDragOver, setIsDragOver] = useState(false);

  // Handle file selection
  const handleFileSelect = useCallback(async (selectedFiles) => {
    
    // Ensure we always work with an array
    const currentFiles = Array.isArray(caseFiles) ? [...caseFiles] : [];
    
    for (const file of Array.from(selectedFiles)) {
      currentFiles.push(file);
    }

    setFieldValue('caseFiles', currentFiles);
  }, [caseFiles, setFieldValue]);

  // Handle drag events
  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragOver(false);
    const droppedFiles = e.dataTransfer.files;
    handleFileSelect(droppedFiles);
  }, [handleFileSelect]);

  // Handle file input change
  const handleInputChange = useCallback((e) => {
    const selectedFiles = e.target.files;
    if (selectedFiles.length > 0) {
      handleFileSelect(selectedFiles);
    }
    // Clear the input so the same file can be selected again
    e.target.value = '';
  }, [handleFileSelect]);

  // Remove file
  const removeFile = useCallback((fileIndex) => {
    const currentFiles = Array.isArray(caseFiles) ? [...caseFiles] : [];
    currentFiles.splice(fileIndex, 1);
    setFieldValue('caseFiles', currentFiles);
  }, [caseFiles, setFieldValue]);

  // Format file size
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Get file icon
  const getFileIcon = (type) => {
    if (type.startsWith('image/')) return <Image className="h-4 w-4" />;
    if (type.includes('pdf')) return <FileText className="h-4 w-4" />;
    return <FileIcon className="h-4 w-4" />;
  };

  // Get file type badge color
  const getFileTypeBadge = (type) => {
    if (type.startsWith('image/')) return 'bg-green-100 text-green-800';
    if (type.includes('pdf')) return 'bg-red-100 text-red-800';
    if (type.includes('document') || type.includes('word')) return 'bg-blue-100 text-blue-800';
    return 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* File Upload Area */}
      <div
        className={cn(
          "border-2 border-dashed rounded-lg p-6 text-center transition-colors",
          isDragOver
            ? "border-primary bg-primary/5"
            : "border-muted-foreground/25 hover:border-muted-foreground/50"
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
          <input
            type="file"
            multiple
            onChange={handleInputChange}
            className="hidden"
            id="case-info-file-upload"
            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif,.txt"
          />
          <label htmlFor="case-info-file-upload" className="cursor-pointer">
            <Plus className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-sm text-muted-foreground mb-2">
              {t('sessions.clickOrDragFiles')}
            </p>
            <p className="text-xs text-muted-foreground">
              {t('sessions.pdfDocTxtImages')}
            </p>
          </label>
        </div>

      {/* File List Column */}
      <div>
        {/* File List */}
        {files.length > 0 && (
          <div className="space-y-3">
            <h4 className={cn("font-medium", isArabic ? 'text-right' : 'text-left')}>
              {t('common.uploadedFiles')} ({files.length})
            </h4>
            
            <div className="space-y-2">
              {files.map((file, index) => {
                const fileExtension = file.name?.split('.').pop()?.toLowerCase() || 'file';
                return (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 border rounded-lg bg-muted/30"
                  >
                    <div className="flex items-center space-x-3 flex-1 min-w-0">
                      <div className="h-10 w-10 rounded bg-muted flex items-center justify-center">
                        {getFileIcon(file.type || 'application/octet-stream')}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{file.name || 'Unknown file'}</p>
                        <div className="flex items-center space-x-2 mt-1">
                          <Badge 
                            variant="secondary" 
                            className={cn("text-xs", getFileTypeBadge(file.type || 'application/octet-stream'))}
                          >
                            {fileExtension.toUpperCase()}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {formatFileSize(file.size || 0)}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-1">
                      <Button type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFile(index)}
                        className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Upload Summary */}
        {files.length === 0 && (
          <div className="text-center text-muted-foreground py-4">
            <File className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">
              {t('sessions.noFilesUploaded')}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Files;
