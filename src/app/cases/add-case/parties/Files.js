"use client";

import React, { useState, useCallback } from 'react';
import NextImage from 'next/image';
import { Plus, File, Minus, FileText, ImageIcon, FileIcon, Download, Eye, Trash2 } from 'lucide-react';
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
  const isArabic = language === 'ar';
  const { values, setFieldValue } = useFormikContext();
  const { partiesFiles } = values;

  const [isDragOver, setIsDragOver] = useState(false);

  // Handle file selection - store files directly
  const handleFileSelect = useCallback((selectedFiles) => {
    const filesArray = Array.from(selectedFiles);
    
    // Store files directly without base64 conversion
    const currentFiles = [...(partiesFiles.files || [])];
    
    // Add new files directly to the files array
    currentFiles.push(...filesArray);
    
    setFieldValue('partiesFiles', {
      files: currentFiles
    });
    
  }, [partiesFiles, setFieldValue]);

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
  }, [handleFileSelect]);

  // Remove file
  const removeFile = useCallback((index) => {
    const currentFiles = [...(partiesFiles.files || [])];
    
    currentFiles.splice(index, 1);

    setFieldValue('partiesFiles', {
      files: currentFiles
    });
  }, [partiesFiles, setFieldValue]);

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

  // Handle download
  const handleDownloadFile = useCallback((index) => {
    const file = partiesFiles.files[index];
    
    // Create URL directly from the File object
    const url = URL.createObjectURL(file);
    const a = document.createElement("a");
    a.href = url;
    a.download = file.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [partiesFiles]);

  // Create preview URL from File object
  const getPreviewUrl = (file) => {
    if (file.type && file.type.startsWith('image/')) {
      return URL.createObjectURL(file);
    }
    return null;
  };

  return  <div className='space-x-4 grid grid-cols-2 '>
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
            id="parties-file-upload"
            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif,.txt"
          />
          <label htmlFor="parties-file-upload" className="cursor-pointer">
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
        {partiesFiles.files.length > 0 && (
          <div className="space-y-3">
            <h4 className={cn("font-medium", isArabic ? 'text-right' : 'text-left')}>
              {t('common.uploadedFiles')} ({partiesFiles.files.length})
            </h4>
            
            <div className="space-y-2">
              {partiesFiles.files.map((file, index) => {
                const previewUrl = getPreviewUrl(file);
                
                return (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 border rounded-lg bg-muted/30"
                  >
                    <div className="flex items-center space-x-3 flex-1 min-w-0">
                      {previewUrl ? (
                        <NextImage
                          src={previewUrl}
                          alt={file.name}
                          width={40}
                          height={40}
                          className="rounded object-cover"
                        />
                      ) : (
                        <div className="h-10 w-10 rounded bg-muted flex items-center justify-center">
                          {getFileIcon(file.type)}
                        </div>
                      )}
                      
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{file.name}</p>
                        <div className="flex items-center space-x-2 mt-1">
                          <Badge 
                            variant="secondary" 
                            className={cn("text-xs", getFileTypeBadge(file.type))}
                          >
                            {file.type.split('/')[1]?.toUpperCase() || 'FILE'}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {formatFileSize(file.size || 0)}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      {previewUrl && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => window.open(previewUrl, '_blank')}
                          className="h-8 w-8 p-0"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      )}
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDownloadFile(index)}
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
        )}

        {/* Upload Summary */}
        {partiesFiles.files.length === 0 && (
          <div className="text-center text-muted-foreground py-4">
            <File className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">
              {isArabic ? '?? ??? ??? ?? ????? ???' : 'No files uploaded yet'}
            </p>
          </div>
        )}
        </div>
  
}

export default Files;
