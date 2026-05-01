"use client";

import React, { useRef } from 'react';
import { Upload, FileText, ImageIcon, FileIcon, X } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from '@/contexts/LanguageContext';
import { useTranslations } from '@/hooks/useTranslations';
import { useFormikContext } from './FormikContext';
import { cn } from "@/lib/utils";

const maxFileSize = 10; // MB
const maxFiles = 20;
const acceptedFileTypes = ".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif,.txt";

const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`;
};

const getFileIcon = (type) => {
  if (type.startsWith('image/')) return <ImageIcon className="h-3.5 w-3.5" />;
  if (type.includes('pdf')) return <FileText className="h-3.5 w-3.5" />;
  return <FileIcon className="h-3.5 w-3.5" />;
};

function Files() {
  const { language } = useLanguage();
  const { t } = useTranslations();
  const isArabic = language === 'ar';
  const { values, setFieldValue } = useFormikContext();
  const { caseFiles } = values;
  const fileInputRef = useRef(null);

  const handleFileSelect = (selectedFiles) => {
    if (!selectedFiles?.length) return;

    const fileArray = Array.from(selectedFiles);
    const currentCount = caseFiles?.length || 0;
    
    if (currentCount + fileArray.length > maxFiles) return;

    const invalidFiles = fileArray.filter(file => file.size > maxFileSize * 1024 * 1024);
    if (invalidFiles.length > 0) return;

    setFieldValue('caseFiles', [...(caseFiles || []), ...fileArray]);
  };

  const handleFileRemove = (fileIndex) => {
    setFieldValue('caseFiles', caseFiles.filter((_, index) => index !== fileIndex));
  };

  return (
    <div className="space-y-3">
      {/* Upload Area - Compact */}
      <div 
        className="border-2 border-dashed rounded-lg p-4 text-center border-muted-foreground/25 hover:border-muted-foreground/50 transition-colors cursor-pointer"
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={acceptedFileTypes}
          onChange={(e) => handleFileSelect(e.target.files)}
          className="hidden"
        />
        <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">
          {t('employeeFinance.files.dragOrClick')}
        </p>
        <p className="text-xs text-muted-foreground/70 mt-1">
          {t('employeeFinance.files.maxFiles', { maxFiles, maxSize: maxFileSize })}
        </p>
      </div>

      {/* File List - Compact */}
      {caseFiles?.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium">
              {t('employeeFinance.files.selectedFiles')} ({caseFiles.length})
            </h4>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              disabled={caseFiles.length >= maxFiles}
              className="h-7 text-xs"
            >
              <Upload className="h-3 w-3 mr-1" />
              {t('employeeFinance.files.selectMoreFiles')}
            </Button>
          </div>
          
          <div className="space-y-1.5 max-h-64 overflow-y-auto">
            {caseFiles.map((file, index) => {
              const fileExtension = file.name?.split('.').pop()?.toUpperCase() || 'FILE';
              return (
                <div
                  key={index}
                  className="flex items-center gap-2 p-2 border rounded-md bg-muted/20 hover:bg-muted/40 transition-colors"
                >
                  <div className="h-8 w-8 rounded bg-muted flex items-center justify-center flex-shrink-0">
                    {getFileIcon(file.type)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium truncate">{file.name}</p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <Badge variant="secondary" className="text-[10px] h-4 px-1">
                        {fileExtension}
                      </Badge>
                      <span className="text-[10px] text-muted-foreground">
                        {formatFileSize(file.size)}
                      </span>
                    </div>
                  </div>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleFileRemove(index)}
                    className="h-7 w-7 p-0 text-destructive hover:text-destructive flex-shrink-0"
                  >
                    <X className="h-3.5 w-3.5" />
                  </Button>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export default Files;