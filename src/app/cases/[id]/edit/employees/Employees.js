"use client";

import React, { useMemo } from 'react';
import useSWR from 'swr';
import { Form } from 'formik';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useTranslations } from '@/hooks/useTranslations';
import { useLanguage } from '@/contexts/LanguageContext';
import { getEmployees } from '@/app/services/api/employees'; 
import { useFormikContext } from '../info/FormikContext';
import EmployeeCombobox from './EmployeeCombobox';
import EmployeeFiles from './EmployeeFiles';
import EmployeeDocuments from './EmployeeDocuments';
import SubmitButton from '../info/SubmitButton';

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

function Employees({ caseId }) {
  const formikProps = useFormikContext();
  const { values, setFieldValue, errors, touched, setFieldTouched } = formikProps;
  const { 
    lawyer_id,
    legal_advisor_id,
    secretary_id,
    legal_researcher_id
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
    () => (employeesResponse?.success ? (Array.isArray(employeesResponse.data) ? employeesResponse.data : []) : []),
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
      <div className="p-4">
        
        <Card>

          <CardContent className="p-6">
            <div className="text-red-500 text-center">
              {isArabic ? 'خطأ في تحميل بيانات الموظفين' : 'Error loading employees data'}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <Form className="space-y-6 p-4">
      <Card>
        <CardHeader>
          <SubmitButton />
          <CardTitle className={isArabic ? 'text-right' : 'text-left'}>
            {isArabic ? 'تعيين الموظفين للقضية' : 'Assign Employees to Case'}
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Lawyer Selection */}
          <div className="space-y-2">
            <Label className={isArabic ? 'text-right block' : 'text-left block'}>
              {ROLES.LAWYER[language]} <span className="text-red-500">*</span>
            </Label>
            <EmployeeCombobox
              employees={employeesByRole.lawyers || []}
              value={lawyer_id}
              onValueChange={(value) => {
                setFieldTouched('lawyer_id', true)
                setFieldValue('lawyer_id', value)
              }}
              placeholder={isArabic ? 'اختر المحامي...' : 'Select lawyer...'}
              emptyText={isArabic ? 'لا يوجد محامين متاحين' : 'No lawyers found'}
              searchPlaceholder={isArabic ? 'البحث في المحامين...' : 'Search lawyers...'}
              isLoading={isLoading}
              className={`w-full ${errors.lawyer_id && touched.lawyer_id ? 'border-red-500' : ''}`}
            />
            {errors.lawyer_id && touched.lawyer_id && (
              <div className="text-red-500 text-sm">{errors.lawyer_id}</div>
            )}
          </div>

          {/* Legal Consultant Selection */}
          <div className="space-y-2">
            <Label className={isArabic ? 'text-right block' : 'text-left block'}>
              {ROLES.LEGAL_CONSULTANT[language]} <span className="text-red-500">*</span>
            </Label>
            <EmployeeCombobox
              employees={employeesByRole.legalConsultants || []}
              value={legal_advisor_id}
              onValueChange={(value) => {
                  setFieldValue('legal_advisor_id', value)
                  setFieldTouched('legal_advisor_id', true)
              }}
              placeholder={isArabic ? 'اختر المستشار القانوني...' : 'Select legal consultant...'}
              emptyText={isArabic ? 'لا يوجد مستشارين قانونيين متاحين' : 'No legal consultants found'}
              searchPlaceholder={isArabic ? 'البحث في المستشارين القانونيين...' : 'Search legal consultants...'}
              isLoading={isLoading}
              className={`w-full ${errors.legal_advisor_id && touched.legal_advisor_id ? 'border-red-500' : ''}`}
            />
            {errors.legal_advisor_id && touched.legal_advisor_id && (
              <div className="text-red-500 text-sm">{errors.legal_advisor_id}</div>
            )}
          </div>

          {/* Secretary Selection */}
          <div className="space-y-2">
            <Label className={isArabic ? 'text-right block' : 'text-left block'}>
              {ROLES.SECRETARY[language]} <span className="text-red-500">*</span>
            </Label>
            <EmployeeCombobox
              employees={employeesByRole.secretaries || []}
              value={secretary_id}
              onValueChange={(value) => {
                setFieldTouched('secretary_id', true)
                setFieldValue('secretary_id', value)
              }}
              placeholder={isArabic ? 'اختر السكرتير...' : 'Select secretary...'}
              emptyText={isArabic ? 'لا يوجد سكرتيرين متاحين' : 'No secretaries found'}
              searchPlaceholder={isArabic ? 'البحث في السكرتيرين...' : 'Search secretaries...'}
              isLoading={isLoading}
              className={`w-full ${errors.secretary_id && touched.secretary_id ? 'border-red-500' : ''}`}
            />
            {errors.secretary_id && touched.secretary_id && (
              <div className="text-red-500 text-sm">{errors.secretary_id}</div>
            )}
          </div>

          {/* Legal Researcher Selection */}
          <div className="space-y-2">
            <Label className={isArabic ? 'text-right block' : 'text-left block'}>
              {ROLES.LEGAL_RESEARCHER[language]} <span className="text-red-500">*</span>
            </Label>
            <EmployeeCombobox
              employees={employeesByRole.legalResearchers || []}
              value={legal_researcher_id}
              onValueChange={(value) => {
                setFieldTouched('legal_researcher_id', true)
                setFieldValue('legal_researcher_id', value)
              }}
              placeholder={isArabic ? 'اختر الباحث القانوني...' : 'Select legal researcher...'}
              emptyText={isArabic ? 'لا يوجد باحثين قانونيين متاحين' : 'No legal researchers found'}
              searchPlaceholder={isArabic ? 'البحث في الباحثين القانونيين...' : 'Search legal researchers...'}
              isLoading={isLoading}
              className={`w-full ${errors.legal_researcher_id && touched.legal_researcher_id ? 'border-red-500' : ''}`}
            />
            {errors.legal_researcher_id && touched.legal_researcher_id && (
              <div className="text-red-500 text-sm">{errors.legal_researcher_id}</div>
            )}
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="col-span-full text-center text-muted-foreground">
              {isArabic ? 'جار تحميل بيانات الموظفين...' : 'Loading employees data...'}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Employee Files Upload Section */}
      <EmployeeFiles formikProps={formikProps} />

      {/* Employee Documents Section */}
      <EmployeeDocuments caseId={caseId} />
    </Form>
  );
}

export default Employees;