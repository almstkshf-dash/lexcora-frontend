'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useFormikContext } from './FormikContext';
import { searchCasesForAddNewCasePage } from '@/app/services/api/cases';
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
import { Check, ChevronsUpDown, X, FileText, Eye } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import { useTranslations } from '@/hooks/useTranslations';

function RelatedCases({ caseId }) {
  const { t } = useTranslations();
  const formikProps = useFormikContext();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [availableCases, setAvailableCases] = useState([]);
  const [loading, setLoading] = useState(false);

  const searchCases = useCallback(async (term) => {
    try {
      setLoading(true);
      const response = await searchCasesForAddNewCasePage(term);
      if (response.success) {
        // Filter out the current case from search results
        const filteredCases = response.data.filter(
          (caseItem) => caseItem.id !== parseInt(caseId)
        );
        setAvailableCases(filteredCases);
      } else {
        setAvailableCases([]);
      }
    } catch (error) {
      setAvailableCases([]);
    } finally {
      setLoading(false);
    }
  }, [caseId]);

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
  }, [searchTerm, searchCases]);

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

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <label className="text-sm font-medium">{t('employeeFinance.relatedCases.title')}</label>
        
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={open}
              className="w-[300px] justify-between"
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
                          {caseItem.topic && (
                            <span className="text-xs text-muted-foreground">
                              {caseItem.topic}
                            </span>
                          )}
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
        <div className="space-y-2">
          <h3 className="text-sm font-medium">{t('employeeFinance.relatedCases.selectedCases')}:</h3>
          <div className="space-y-2">
            {relatedCases.map((caseItem) => (
              <div
                key={caseItem.id}
                className="flex items-center justify-between border rounded-lg p-3 bg-muted/50"
              >
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <div className="flex flex-col">
                    <span className="font-medium">{caseItem.case_number}</span>
                    <span className="text-sm text-muted-foreground">
                      {t('employeeFinance.relatedCases.fileLabel')}: {caseItem.file_number}
                    </span>
                    {caseItem.topic && (
                      <span className="text-xs text-muted-foreground">
                        {caseItem.topic}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => router.push(`/cases/${caseItem.id}/edit`)}
                    className="h-8 w-8 p-0 text-primary hover:text-primary"
                    title={t('employeeFinance.relatedCases.viewCase')}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveCase(caseItem.id)}
                    className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                    title={t('employeeFinance.relatedCases.remove')}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default RelatedCases;