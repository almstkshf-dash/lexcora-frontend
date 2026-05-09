'use client';

import React from 'react';
import { useSelector } from 'react-redux';
import useSWR from 'swr';
import { getEmployeeRequests } from '@/app/services/api/employeeRequests';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTranslations } from '@/hooks/useTranslations';
import { Card, CardContent } from '@/components/ui/card';
import { 
  isAdminRole, 
  isHRRole, 
  filterAdminRequests, 
  filterHRRequests, 
  filterEmployeeRequests 
} from './utils';
import AdminRequestsView from './AdminRequestsView';
import HRRequestsView from './HRRequestsView';
import EmployeeRequestsView from './EmployeeRequestsView';

function EmployeesRequests() {
  const { language } = useLanguage();
  const t = useTranslations('employeesRequests');
  const tCommon = useTranslations('common');
  
  // Get user information from Redux
  const employeeRole = useSelector((state) => state.auth.roleEn);
  const employeeId = useSelector((state) => state.auth.jobId);
  const employeeDepartment = useSelector((state) => 
    language === 'ar' ? state.auth.departmentAr : state.auth.departmentEn
  );
  
  // Determine user type
  const isAdmin = isAdminRole(employeeRole);
  const isHR = isHRRole(employeeDepartment, language);
  const isEmployee = !isAdmin && !isHR;
  
  // Fetch all employee requests
  const { data, error, isLoading, mutate } = useSWR(
    '/employee-requests',
    () => getEmployeeRequests(),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
    }
  );
  
  // Filter requests based on role
  const getFilteredRequests = () => {
    const allRequests = data?.data || [];
    
    if (isAdmin) {
      return filterAdminRequests(allRequests);
    } else if (isHR) {
      return filterHRRequests(allRequests);
    } else {
      return filterEmployeeRequests(allRequests, employeeId);
    }
  };
  
  const filteredRequests = getFilteredRequests();
  
  // Loading state
  if (isLoading) {
    return (
      <Card className="w-full">
        <CardContent className="p-6">
          <p className="text-center">{tCommon('loading')}</p>
        </CardContent>
      </Card>
    );
  }
  
  // Error state
  if (error) {
    return (
      <Card className="w-full">
        <CardContent className="p-6 text-center">
          {t('notAuthorized')}
        </CardContent>
      </Card>
    );
  }
  
  // Render appropriate view based on role
  if (isAdmin) {
    return <AdminRequestsView requests={filteredRequests} onUpdate={mutate} />;
  } else if (isHR) {
    return <HRRequestsView requests={filteredRequests} onUpdate={mutate} />;
  } else {
    return <EmployeeRequestsView requests={filteredRequests} onUpdate={mutate} />;
  }
}

export default EmployeesRequests;