'use client';

import React, { useState, useEffect } from 'react';
import { useFormikContext } from '../FormikContext';
import { searchCasesForAddNewCasePage } from '@/app/services/api/cases';
import { useTranslations } from '@/hooks/useTranslations';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { Check, ChevronsUpDown, X, FileText, Plus, Trash2, ImageIcon, FileIcon, File } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from "@/components/ui/badge";
import { useCallback } from 'react';

function RelatedCases() {
  const { t } = useTranslations();
  const formikProps = useFormikContext();
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [availableCases, setAvailableCases] = useState([]);
  const [loading, setLoading] = useState(false);

  // Debounced search effect
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchTerm.length >= 3) {
        searchCases(searchTerm);
      } else {
        setAvailableCases([]);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  const searchCases = async (term) => {
    try {
      setLoading(true);
      const response = await searchCasesForAddNewCasePage(term);
      if (response.success) {
        setAvailableCases(response.data);
      } else {
        setAvailableCases([]);
      }
    } catch (error) {

      setAvailableCases([]);
    } finally {
      setLoading(false);
    }
  };

  // Handle adding a case to the related_cases array
  const handleSelectCase = (selectedCase) => {
    const currentRelatedCases = formikProps.values.related_cases || [];
    
    // Check if case is already added
    const isAlreadyAdded = currentRelatedCases.some(
      (c) => c.id === selectedCase.id
    );

    if (!isAlreadyAdded) {
      formikProps.setFieldValue('related_cases', [
        ...currentRelatedCases,
        selectedCase,
      ]);
    }

    setOpen(false);
    setSearchTerm(''); // Clear search after selection
  };

  // Handle removing a case from the related_cases array
  const handleRemoveCase = (caseId) => {
    const currentRelatedCases = formikProps.values.related_cases || [];
    const updatedCases = currentRelatedCases.filter((c) => c.id !== caseId);
    formikProps.setFieldValue('related_cases', updatedCases);
  };

  const relatedCases = formikProps.values.related_cases || [];
  const relatedFiles = formikProps.values.relatedFiles || [];

  const handleFileSelect = useCallback((selectedFiles) => {
    const currentFiles = Array.isArray(relatedFiles) ? [...relatedFiles] : [];
    for (const file of Array.from(selectedFiles)) {
      currentFiles.push(file);
    }
    formikProps.setFieldValue('relatedFiles', currentFiles);
  }, [relatedFiles, formikProps]);

  const removeFile = useCallback((fileIndex) => {
    const currentFiles = [...relatedFiles];
    currentFiles.splice(fileIndex, 1);
    formikProps.setFieldValue('relatedFiles', currentFiles);
  }, [relatedFiles, formikProps]);

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (type) => {
    if (type.startsWith('image/')) return <ImageIcon className="h-4 w-4" />;
    if (type.includes('pdf')) return <FileText className="h-4 w-4" />;
    return <FileIcon className="h-4 w-4" />;
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <label className="text-sm font-medium">{t('employeeFinance.relatedCases.title')}</label>
          
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={open}
                className="w-full max-w-[300px] justify-between"
              >
                {t('employeeFinance.relatedCases.selectRelatedCase')}
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[300px] p-0">
              <Command>
                <CommandInput 
                  placeholder={t('employeeFinance.relatedCases.searchPlaceholder')} 
                  value={searchTerm}
                  onValueChange={setSearchTerm}
                />
                <CommandList>
                  {loading && (
                    <div className="p-4 text-sm text-center text-muted-foreground">
                      {t('employeeFinance.relatedCases.searching')}
                    </div>
                  )}
                  {!loading && searchTerm.length < 3 && (
                    <div className="p-4 text-sm text-center text-muted-foreground">
                      {t('employeeFinance.relatedCases.minSearchChars')}
                    </div>
                  )}
                  {!loading && searchTerm.length >= 3 && availableCases.length === 0 && (
                    <CommandEmpty>{t('employeeFinance.relatedCases.noCasesFound')}</CommandEmpty>
                  )}
                  <CommandGroup>
                    {availableCases.map((caseItem) => {
                      const isSelected = relatedCases.some(
                        (c) => c.id === caseItem.id
                      );
                      
                      return (
                        <CommandItem
                          key={caseItem.id}
                          value={`${caseItem.case_number || ''} ${caseItem.file_number || ''} ${caseItem.topic || ''}`}
                          onSelect={() => handleSelectCase(caseItem)}
                          disabled={isSelected}
                        >
                          <Check
                            className={cn(
                              'mr-2 h-4 w-4',
                              isSelected ? 'opacity-100' : 'opacity-0'
                            )}
                          />
                          <FileText className="mr-2 h-4 w-4" />
                          <div className="flex flex-col">
                            <span className="font-medium">
                              {caseItem.case_number}
                            </span>
                            <span className="text-sm text-muted-foreground">
                              {t('employeeFinance.relatedCases.fileLabel')}: {caseItem.file_number}
                            </span>
                          </div>
                        </CommandItem>
                      );
                    })}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </div>

        {/* Display selected related cases */}
        {relatedCases.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {relatedCases.map((caseItem) => (
              <div
                key={caseItem.id}
                className="flex items-center justify-between border rounded-lg p-2 bg-muted/30"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <FileText className="h-4 w-4 text-primary shrink-0" />
                  <div className="flex flex-col min-w-0">
                    <span className="text-xs font-medium truncate">{caseItem.case_number}</span>
                    <span className="text-[10px] text-muted-foreground truncate">
                      {caseItem.file_number}
                    </span>
                  </div>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemoveCase(caseItem.id)}
                  className="h-6 w-6 p-0 text-destructive"
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>

      <hr className="border-muted" />

      {/* File Upload Section */}
      <div className="space-y-4">
        <label className="text-sm font-medium">{t('employeeFinance.relatedCases.uploadFiles')}</label>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div
            className="border-2 border-dashed rounded-lg p-4 text-center hover:border-primary/50 transition-colors cursor-pointer"
            onClick={() => document.getElementById('related-file-upload').click()}
          >
            <input
              type="file"
              id="related-file-upload"
              className="hidden"
              multiple
              onChange={(e) => handleFileSelect(e.target.files)}
            />
            <Plus className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
            <p className="text-xs text-muted-foreground">
              {t('sessions.clickOrDragFiles')}
            </p>
          </div>

          <div className="space-y-2">
            {relatedFiles.length > 0 ? (
              relatedFiles.map((file, index) => (
                <div key={index} className="flex items-center justify-between p-2 border rounded-md bg-muted/10">
                  <div className="flex items-center gap-2 min-w-0">
                    {getFileIcon(file.type || '')}
                    <div className="flex flex-col min-w-0">
                      <span className="text-xs font-medium truncate">{file.name}</span>
                      <span className="text-[10px] text-muted-foreground">{formatFileSize(file.size)}</span>
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFile(index)}
                    className="h-6 w-6 p-0 text-destructive"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              ))
            ) : (
              <div className="text-center py-4 text-muted-foreground border border-dashed rounded-md">
                <p className="text-xs">{t('employeeFinance.relatedCases.noFiles')}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default RelatedCases;
