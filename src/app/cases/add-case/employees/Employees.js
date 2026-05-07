
"use client";

import React, { useMemo } from 'react';
import { useFormikContext } from '../FormikContext';
import useSWR from 'swr';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useTranslations } from '@/hooks/useTranslations';
import { useLanguage } from '@/contexts/LanguageContext';
import { getEmployees } from '../../../services/api/employees';
import EmployeeCombobox from './EmployeeCombobox';
import Files from './Files';

// Role definitions with Arabic and English names
const ROLES = {
  LAWYER: {
    id: 'lawyer',
    ar: 'المحامي',
    en: 'Lawyer'
  },
  LEGAL_CONSULTANT: {
    id: 'legal advisor',
    ar: 'مستشار قانوني',
    en: 'Legal Advisor'
  },
  SECRETARY: {
    id: 'secretary',
    ar: 'السكرتير',
    en: 'Secretary'
  },
  LEGAL_RESEARCHER: {
    id: 'legal_researcher',
    ar: 'الباحث القانوني',
    en: 'Legal Researcher'
  }
};

function Employees() {
  const { values, setFieldValue, errors, touched, setFieldTouched } = useFormikContext();
  const { 
    lawyerId,
    legalAdvisorId,
    secretaryId,
    legalResearcherId
  } = values;
  
  const { t } = useTranslations();
  const { language } = useLanguage();
  const isArabic = language === 'ar';

  // Fetch employees using SWR
  const { data: employeesResponse, error, isLoading } = useSWR('employees', getEmployees, {
    revalidateOnFocus: false,
    revalidateOnReconnect: true,
    errorRetryCount: 3,
    errorRetryInterval: 1000
  });

  const employees = useMemo(
    () => (employeesResponse?.success ? employeesResponse.data : []),
    [employeesResponse]
  );

  // Filter employees by role (assuming employees have a 'role' field)
  const employeesByRole = useMemo(() => {
    if (!employees.length) return {};

    return {
      lawyers: employees.filter(emp => 
        emp.role_en?.toLowerCase().includes('lawyer') 
      ),
      legalConsultants: employees.filter(emp => 
        emp.role_en?.toLowerCase().includes('legal advisor') 
      ),
      secretaries: employees.filter(emp => 
        emp.role_en?.toLowerCase().includes('secretary') 
      ),
      legalResearchers: employees.filter(emp => 
        emp.role_en?.toLowerCase().includes('researcher') 
      )
    };
  }, [employees]);

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-red-500 text-center">
            {isArabic ? 'خطأ في تحميل بيانات الموظفين' : 'Error loading employees data'}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className={isArabic ? 'text-right' : 'text-left'}>
            {isArabic ? 'تعيين الموظفين للقضية' : 'Assign Employees to Case'}
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap  gap-4">
          {/* Lawyer Selection */}
          <div className="space-y-2 ">
            <Label className={isArabic ? 'text-right block' : 'text-left block'}>
              {ROLES.LAWYER[language]} <span className="text-red-500">*</span>
            </Label>
            <EmployeeCombobox
              employees={employeesByRole.lawyers || []}
              value={lawyerId}
              onValueChange={(value) => {
                setFieldTouched('lawyerId', true)
                setFieldValue('lawyerId', value)
              }}
              placeholder={isArabic ? 'اختر المحامي...' : 'Select lawyer...'}
              emptyText={isArabic ? 'لا يوجد محامين متاحين' : 'No lawyers found'}
              searchPlaceholder={isArabic ? 'البحث في المحامين...' : 'Search lawyers...'}
              isLoading={isLoading}
              className={`w-full ${errors.lawyerId && touched.lawyerId ? 'border-red-500' : ''}`}
            />
            {errors.lawyerId && touched.lawyerId && (
              <div className="text-red-500 text-sm">{errors.lawyerId}</div>
            )}
          </div>

          {/* Legal Consultant Selection */}
          <div className="space-y-2">
            <Label className={isArabic ? 'text-right block' : 'text-left block'}>
              {ROLES.LEGAL_CONSULTANT[language]} <span className="text-red-500">*</span>
            </Label>
            <EmployeeCombobox
              employees={employeesByRole.legalConsultants || []}
              value={legalAdvisorId}
              onValueChange={(value) => {
                setFieldTouched('legalAdvisorId', true)
                setFieldValue('legalAdvisorId', value)
              }}
              placeholder={isArabic ? 'اختر المستشار القانوني...' : 'Select legal consultant...'}
              emptyText={isArabic ? 'لا يوجد مستشارين قانونيين متاحين' : 'No legal consultants found'}
              searchPlaceholder={isArabic ? 'البحث في المستشارين القانونيين...' : 'Search legal consultants...'}
              isLoading={isLoading}
              className={`w-full ${errors.legalAdvisorId && touched.legalAdvisorId ? 'border-red-500' : ''}`}
            />
            {errors.legalAdvisorId && touched.legalAdvisorId && (
              <div className="text-red-500 text-sm">{errors.legalAdvisorId}</div>
            )}
          </div>

          {/* Secretary Selection */}
          <div className="space-y-2">
            <Label className={isArabic ? 'text-right block' : 'text-left block'}>
              {ROLES.SECRETARY[language]} <span className="text-red-500">*</span>
            </Label>
            <EmployeeCombobox
              employees={employeesByRole.secretaries || []}
              value={secretaryId}
              onValueChange={(value) => {
                setFieldTouched('secretaryId', true)
                setFieldValue('secretaryId', value)
              }}
              placeholder={isArabic ? 'اختر السكرتير...' : 'Select secretary...'}
              emptyText={isArabic ? 'لا يوجد سكرتيرين متاحين' : 'No secretaries found'}
              searchPlaceholder={isArabic ? 'البحث في السكرتيرين...' : 'Search secretaries...'}
              isLoading={isLoading}
              className={`w-full ${errors.secretaryId && touched.secretaryId ? 'border-red-500' : ''}`}
            />
            {errors.secretaryId && touched.secretaryId && (
              <div className="text-red-500 text-sm">{errors.secretaryId}</div>
            )}
          </div>

          {/* Legal Researcher Selection */}
          <div className="space-y-2">
            <Label className={isArabic ? 'text-right block' : 'text-left block'}>
              {ROLES.LEGAL_RESEARCHER[language]} <span className="text-red-500">*</span>
            </Label>
            <EmployeeCombobox
              employees={employeesByRole.legalResearchers || []}
              value={legalResearcherId}
              onValueChange={(value) => {
                setFieldTouched('legalResearcherId', true)
                setFieldValue('legalResearcherId', value)
              }}
              placeholder={isArabic ? 'اختر الباحث القانوني...' : 'Select legal researcher...'}
              emptyText={isArabic ? 'لا يوجد باحثين قانونيين متاحين' : 'No legal researchers found'}
              searchPlaceholder={isArabic ? 'البحث في الباحثين القانونيين...' : 'Search legal researchers...'}
              isLoading={isLoading}
              className={`w-full ${errors.legalResearcherId && touched.legalResearcherId ? 'border-red-500' : ''}`}
            />
            {errors.legalResearcherId && touched.legalResearcherId && (
              <div className="text-red-500 text-sm">{errors.legalResearcherId}</div>
            )}
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="text-center text-muted-foreground">
              {isArabic ? 'جار تحميل بيانات الموظفين...' : 'Loading employees data...'}
            </div>
          )}

         
        </CardContent>
      </Card>

      {/* Files Import Section */}
      <Files />
    </div>
  );
}

export default Employees;