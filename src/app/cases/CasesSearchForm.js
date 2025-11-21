'use client';

import React, { useState, useEffect, useMemo } from 'react';
import useSWR from 'swr';
import { CalendarIcon, SearchIcon, X } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { getBranches } from '@/app/services/api/branches';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTranslations } from '@/hooks/useTranslations';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const CasesSearchForm = ({ onSearch }) => {
  const { isRTL, language } = useLanguage();
  const { t } = useTranslations();

  const resolveCopy = (key, fallbackAr, fallbackEn) => {
    const val = t(key);
    const fallback = language === 'ar' ? fallbackAr : fallbackEn;
    if (!val || val === key || val.toLowerCase() === key.toLowerCase()) return fallback;
    return val;
  };

  // Form state
  const [fileNumber, setFileNumber] = useState('');
  const [caseNumber, setCaseNumber] = useState('');
  const [fromDate, setFromDate] = useState();
  const [toDate, setToDate] = useState();
  const [selectedBranch, setSelectedBranch] = useState('');

  // Fetch branches data
  const { data: branchesData, error: branchesError, isLoading: branchesLoading } = useSWR(
    '/branches',
    getBranches,
    {
      refreshInterval: 300000, // Refresh every 5 minutes
      revalidateOnFocus: false
    }
  );

  // Process branches data
  const branches = React.useMemo(() => {
    if (!branchesData?.success || !branchesData?.data) return [];
    return branchesData.data;
  }, [branchesData]);

  // Helper function to get localized text
  const getLocalizedText = (arText, enText) => {
    if (language === 'ar') {
      return arText || enText || '';
    } else {
      return enText || arText || '';
    }
  };

  const formatDateDisplay = (dateValue) => {
    if (!dateValue) return '';
    try {
      return new Date(dateValue).toLocaleDateString(language === 'ar' ? 'ar-AE' : 'en-US');
    } catch (e) {
      return dateValue;
    }
  };

  const buildSearchPayload = (overrides = {}) => {
    const nextFileNumber = overrides.fileNumber ?? fileNumber;
    const nextCaseNumber = overrides.caseNumber ?? caseNumber;
    const nextFromDate = overrides.fromDate ?? fromDate;
    const nextToDate = overrides.toDate ?? toDate;
    const nextBranch = overrides.selectedBranch ?? selectedBranch;

    return {
      fileNumber: nextFileNumber.trim(),
      caseNumber: nextCaseNumber.trim(),
      fromDate: nextFromDate ? format(nextFromDate, 'yyyy-MM-dd') : '',
      toDate: nextToDate ? format(nextToDate, 'yyyy-MM-dd') : '',
      branchId: nextBranch
    };
  };

  // Handle search button click
  const handleSearch = () => {
    onSearch?.(buildSearchPayload());
  };

  // Reset form
  const handleReset = () => {
    setFileNumber('');
    setCaseNumber('');
    setFromDate(undefined);
    setToDate(undefined);
    setSelectedBranch('');

    onSearch?.(buildSearchPayload({
      fileNumber: '',
      caseNumber: '',
      fromDate: undefined,
      toDate: undefined,
      selectedBranch: ''
    }));
  };

  const handleRemoveFilter = (key) => {
    const overrides = {};
    switch (key) {
      case 'fileNumber':
        setFileNumber('');
        overrides.fileNumber = '';
        break;
      case 'caseNumber':
        setCaseNumber('');
        overrides.caseNumber = '';
        break;
      case 'fromDate':
        setFromDate(undefined);
        overrides.fromDate = undefined;
        break;
      case 'toDate':
        setToDate(undefined);
        overrides.toDate = undefined;
        break;
      case 'branchId':
        setSelectedBranch('');
        overrides.selectedBranch = '';
        break;
      default:
        break;
    }
    onSearch?.(buildSearchPayload(overrides));
  };

  const handleClearAllFilters = () => {
    handleReset();
  };

  const appliedFilters = useMemo(() => {
    const list = [];

    if (fileNumber.trim()) {
      list.push({
        key: 'fileNumber',
        label: resolveCopy('casesTable.fileNumber', 'رقم الملف', 'File Number'),
        value: fileNumber.trim()
      });
    }
    if (caseNumber.trim()) {
      list.push({
        key: 'caseNumber',
        label: resolveCopy('casesTable.caseNumber', 'رقم القضية', 'Case Number'),
        value: caseNumber.trim()
      });
    }
    if (fromDate) {
      list.push({
        key: 'fromDate',
        label: resolveCopy('casesTable.fromDate', 'من تاريخ', 'From Date'),
        value: formatDateDisplay(fromDate)
      });
    }
    if (toDate) {
      list.push({
        key: 'toDate',
        label: resolveCopy('casesTable.toDate', 'إلى تاريخ', 'To Date'),
        value: formatDateDisplay(toDate)
      });
    }
    if (selectedBranch) {
      const branchLabel = getLocalizedText(
        branches.find(b => `${b.id}` === `${selectedBranch}`)?.branch_ar,
        branches.find(b => `${b.id}` === `${selectedBranch}`)?.branch_en
      ) || selectedBranch;
      list.push({
        key: 'branchId',
        label: resolveCopy('casesTable.branch', 'الفرع', 'Branch'),
        value: branchLabel
      });
    }

    return list;
  }, [fileNumber, caseNumber, fromDate, toDate, selectedBranch, language, branches]);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
          <SearchIcon className="h-5 w-5" />
          {resolveCopy('casesTable.title', 'البحث في القضايا', 'Search Cases')}
        </CardTitle>
        <CardDescription>
          {resolveCopy('casesTable.searchDescription', 'ابحث عن القضايا باستخدام المعايير المختلفة', 'Search for cases using various criteria')}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 ${isRTL ? 'text-right' : 'text-left'}`} dir={isRTL ? 'rtl' : 'ltr'}>
          
          {/* File Number Input */}
          <div className="space-y-2">
            <Label htmlFor="fileNumber" className="text-sm font-medium">
              {resolveCopy('casesTable.fileNumber', 'رقم الملف', 'File Number')}
            </Label>
            <Input
              id="fileNumber"
              type="text"
              placeholder={resolveCopy('casesTable.fileNumber', 'أدخل رقم الملف', 'Enter file number')}
              value={fileNumber}
              onChange={(e) => setFileNumber(e.target.value)}
              className={isRTL ? 'text-right' : 'text-left'}
            />
          </div>

          {/* Case Number Input */}
          <div className="space-y-2">
            <Label htmlFor="caseNumber" className="text-sm font-medium">
              {resolveCopy('casesTable.caseNumber', 'رقم القضية', 'Case Number')}
            </Label>
            <Input
              id="caseNumber"
              type="text"
              placeholder={resolveCopy('casesTable.caseNumber', 'أدخل رقم القضية', 'Enter case number')}
              value={caseNumber}
              onChange={(e) => setCaseNumber(e.target.value)}
              className={isRTL ? 'text-right' : 'text-left'}
            />
          </div>

          {/* From Date */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">
              {language === 'ar' ? 'من تاريخ' : 'From Date'}
            </Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !fromDate && "text-muted-foreground",
                    isRTL && "text-right justify-end"
                  )}
                >
                  <CalendarIcon className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                  {fromDate ? (
                    format(fromDate, 'PPP', { locale: language === 'ar' ? undefined : undefined })
                  ) : (
                    <span>{language === 'ar' ? 'اختر التاريخ' : 'Pick a date'}</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={fromDate}
                  onSelect={setFromDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* To Date */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">
              {language === 'ar' ? 'إلى تاريخ' : 'To Date'}
            </Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !toDate && "text-muted-foreground",
                    isRTL && "text-right justify-end"
                  )}
                >
                  <CalendarIcon className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                  {toDate ? (
                    format(toDate, 'PPP', { locale: language === 'ar' ? undefined : undefined })
                  ) : (
                    <span>{language === 'ar' ? 'اختر التاريخ' : 'Pick a date'}</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={toDate}
                  onSelect={setToDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Branch Select */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">
              {language === 'ar' ? 'الفرع' : 'Branch'}
            </Label>
            <Select value={selectedBranch} onValueChange={setSelectedBranch}>
              <SelectTrigger className={isRTL ? 'text-right' : 'text-left'}>
                <SelectValue 
                  placeholder={
                    branchesLoading 
                      ? (language === 'ar' ? 'جاري التحميل...' : 'Loading...')
                      : (language === 'ar' ? 'اختر الفرع' : 'Select branch')
                  } 
                />
              </SelectTrigger>
              <SelectContent>
                {branchesLoading ? (
                  <SelectItem value="loading" disabled>
                    {language === 'ar' ? 'جاري التحميل...' : 'Loading...'}
                  </SelectItem>
                ) : branchesError ? (
                  <SelectItem value="error" disabled>
                    {language === 'ar' ? 'خطأ في تحميل الفروع' : 'Error loading branches'}
                  </SelectItem>
                ) : branches.length === 0 ? (
                  <SelectItem value="empty" disabled>
                    {language === 'ar' ? 'لا توجد فروع متاحة' : 'No branches available'}
                  </SelectItem>
                ) : (
                  branches.map((branch) => (
                    <SelectItem key={branch.id} value={branch.id.toString()}>
                      {getLocalizedText(branch.name_ar, branch.name_en)}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col space-y-2 justify-end">
            <Button 
              onClick={handleSearch}
              className="w-full"
              disabled={branchesLoading}
            >
              <SearchIcon className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
              {language === 'ar' ? 'بحث' : 'Search'}
            </Button>
            <Button 
              onClick={handleReset}
              variant="outline"
              className="w-full"
            >
              {language === 'ar' ? 'إعادة تعيين' : 'Reset'}
            </Button>
          </div>
        </div>

        {appliedFilters.length > 0 && (
          <div className={`flex flex-wrap items-center gap-2 mt-4 ${isRTL ? 'justify-end' : 'justify-start'}`}>
            {appliedFilters.map((filter) => (
              <div
                key={filter.key}
                className="flex items-center gap-2 rounded-full border bg-muted/60 px-3 py-1 text-sm"
              >
                <span className="font-semibold">{filter.label}:</span>
                <span>{filter.value}</span>
                <button
                  type="button"
                  className="flex items-center justify-center rounded-full p-1 hover:bg-muted transition-colors"
                  onClick={() => handleRemoveFilter(filter.key)}
                  aria-label={resolveCopy('common.remove', 'إزالة', 'Remove')}
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}

            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleClearAllFilters}
              className="ml-1"
            >
              {resolveCopy('common.clearAll', 'مسح الكل', 'Clear all')}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CasesSearchForm;
