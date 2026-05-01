"use client";

import React, { useState, useCallback } from 'react';
import { useFormikContext } from '../FormikContext';
import NextImage from 'next/image';
import { Plus, File, Minus, FileText, ImageIcon, FileIcon, Download, Eye, Trash2 } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from '@/contexts/LanguageContext';
import { useTranslations } from '@/hooks/useTranslations';
import { cn } from "@/lib/utils";

function Files() {
  const { language } = useLanguage();
  const { t } = useTranslations();
  const { values, setFieldValue } = useFormikContext();
  const isArabic = language === 'ar';

  // Get files from Formik values
  const employeeFiles = values.employeeFiles || [];

  const [isDragOver, setIsDragOver] = useState(false);

  // Handle file selection - store files directly
  const handleFileSelect = useCallback((selectedFiles) => {
    
    for (const file of Array.from(selectedFiles)) {
      
      // Store File object directly without base64 conversion
      const updatedFiles = [...employeeFiles, file];
      setFieldValue('employeeFiles', updatedFiles);
    }
  }, [employeeFiles, setFieldValue]);

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
    const updatedFiles = employeeFiles.filter((_, index) => index !== fileIndex);
    setFieldValue('employeeFiles', updatedFiles);
  }, [employeeFiles, setFieldValue]);

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
    if (type.startsWith('image/')) return <ImageIcon className="h-4 w-4" />;
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
    <div className='space-x-4 grid grid-cols-2'>
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
          id="employees-file-upload"
          accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif,.txt"
        />
        <label htmlFor="employees-file-upload" className="cursor-pointer">
          <Plus className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-sm text-muted-foreground mb-2">
            {t('sessions.clickOrDragFiles')}
          </p>
          <p className="text-xs text-muted-foreground">
            {t('sessions.pdfDocTxtImages')}
          </p>
        </label>
      </div>

      {/* File List */}
      <div>
        {employeeFiles.length > 0 ? (
          <div className="space-y-3">
            <h4 className={cn("font-medium", isArabic ? 'text-right' : 'text-left')}>
              {t('common.uploadedFiles')} ({employeeFiles.length})
            </h4>
            
            <div className="space-y-2">
              {employeeFiles.map((file, index) => {
                const fileName = file.name || 'Unknown file';
                const fileType = file.name.split('.').pop()?.toLowerCase() || 'unknown';
                const isImage = file.type?.startsWith('image/') || ['jpg', 'jpeg', 'png', 'gif'].includes(fileType);
                const preview = isImage ? URL.createObjectURL(file) : null;
                
                return (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 border rounded-lg bg-muted/30"
                  >
                    <div className="flex items-center space-x-3 flex-1 min-w-0">
                      {preview ? (
                        <NextImage
                          src={preview}
                          alt={fileName}
                          width={40}
                          height={40}
                          className="rounded object-cover"
                        />
                      ) : (
                        <div className="h-10 w-10 rounded bg-muted flex items-center justify-center">
                          {getFileIcon(file.type || fileType)}
                        </div>
                      )}
                      
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{fileName}</p>
                        <div className="flex items-center space-x-2 mt-1">
                          <Badge 
                            variant="secondary" 
                            className={cn("text-xs", getFileTypeBadge(file.type || fileType))}
                          >
                            {fileType.toUpperCase()}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {formatFileSize(file.size || 0)}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      {preview && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => window.open(preview, '_blank')}
                          className="h-8 w-8 p-0"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      )}
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          // Create download directly from File object
                          const url = URL.createObjectURL(file);
                          const a = document.createElement('a');
                          a.href = url;
                          a.download = fileName;
                          document.body.appendChild(a);
                          a.click();
                          document.body.removeChild(a);
                          URL.revokeObjectURL(url);
                        }}
                        className="h-8 w-8 p-0"
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                      
                      <Button
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
        ) : (
          <div className="text-center text-muted-foreground py-4">
            <File className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">
              {t('files.noFilesUploaded')}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Files;