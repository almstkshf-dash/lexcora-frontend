"use client";

import React, { useState, useCallback } from 'react';
import { Upload, File, X, FileText, ImageIcon, FileIcon, Download, Eye, Trash2 } from 'lucide-react';
import NextImage from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from '@/contexts/LanguageContext';
import { useTranslations } from '@/hooks/useTranslations';
import { cn } from "@/lib/utils";

function EmployeeFiles({ formikProps }) {
  const { language } = useLanguage();
  const { t } = useTranslations();
  const { values, setFieldValue } = formikProps;
  const isArabic = language === 'ar';

  // Get files from Formik values
  const employeesFiles = React.useMemo(() => values.employeesFiles || [], [values.employeesFiles]);

  const [isDragOver, setIsDragOver] = useState(false);

  // Handle file selection - store files directly
  const handleFileSelect = useCallback((selectedFiles) => {
    for (const file of Array.from(selectedFiles)) {
      // Store File object directly without base64 conversion
      const updatedFiles = [...employeesFiles, file];
      setFieldValue('employeesFiles', updatedFiles);
    }
  }, [employeesFiles, setFieldValue]);

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
    const updatedFiles = employeesFiles.filter((_, index) => index !== fileIndex);
    setFieldValue('employeesFiles', updatedFiles);
  }, [employeesFiles, setFieldValue]);

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
    <Card>
      <CardHeader>
        <CardTitle className={isArabic ? 'text-right' : 'text-left'}>
          {isArabic ? 'ملفات الموظفين' : 'Employee Files'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className='space-y-4'>
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
              id="employees-files-upload"
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif,.txt"
            />
            <label htmlFor="employees-files-upload" className="cursor-pointer">
              <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-sm text-muted-foreground mb-2">
                {isArabic 
                  ? 'اسحب ملفات الموظفين هنا أو انقر للاختيار'
                  : 'Drag employee files here or click to select files'
                }
              </p>
              <p className="text-xs text-muted-foreground">
                {isArabic 
                  ? 'يدعم: PDF, DOC, DOCX, JPG, PNG, GIF, TXT'
                  : 'Supports: PDF, DOC, DOCX, JPG, PNG, GIF, TXT'
                }
              </p>
            </label>
          </div>

          {/* File List */}
          {employeesFiles.length > 0 && (
            <div className="space-y-3">
              <h4 className={cn("font-medium", isArabic ? 'text-right' : 'text-left')}>
                {isArabic ? 'ملفات الموظفين المرفوعة' : 'Uploaded Employee Files'} ({employeesFiles.length})
              </h4>
              
              <div className="space-y-2">
                {employeesFiles.map((file, index) => {
                  const fileName = file.name || 'Unknown file';
                  const fileType = file.name.split('.').pop()?.toLowerCase() || 'unknown';
                  const isImage = file.type?.startsWith('image/') || ['jpg', 'jpeg', 'png', 'gif'].includes(fileType);
                  const preview = isImage ? URL.createObjectURL(file) : null;
                  
                  return (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 border rounded-lg bg-muted/30"
                    >
                      <div className="flex items-center space-x-3 flex-1">
                        {/* File Preview/Icon */}
                        <div className="flex-shrink-0">
                          {preview ? (
                            <NextImage
                              src={preview}
                              alt={fileName}
                              width={40}
                              height={40}
                              className="object-cover rounded"
                            />
                          ) : (
                            <div className="h-10 w-10 bg-muted rounded flex items-center justify-center">
                              {getFileIcon(file.type || '')}
                            </div>
                          )}
                        </div>

                        {/* File Info */}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">
                            {fileName}
                          </p>
                          <div className="flex items-center space-x-2">
                            <Badge className={getFileTypeBadge(file.type || '')}>
                              {fileType.toUpperCase()}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {formatFileSize(file.size)}
                            </span>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center space-x-1">
                          {/* Preview Button */}
                          {isImage && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                // Open image in new tab
                                const url = URL.createObjectURL(file);
                                window.open(url, '_blank');
                              }}
                              className="h-8 w-8 p-0"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          )}
                          
                          {/* Download Button */}
                          <Button
                             type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => {
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
                          
                          {/* Remove Button */}
                          <Button
                             type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeFile(index)}
                            className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Upload Instructions */}
          {employeesFiles.length === 0 && (
            <div className="text-center text-muted-foreground">
              <p className="text-sm">
                {isArabic 
                  ? 'لم يتم رفع أي ملفات للموظفين بعد'
                  : 'No employee files uploaded yet'
                }
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default EmployeeFiles;