'use client';
import React, { useState, useMemo } from 'react';
import useSWR from 'swr';
import { Search, Plus, User, MoreHorizontal, ChevronUp, Eye, Edit, Trash2, ChevronDown } from 'lucide-react';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import EmployeeTableRow from './EmployeeTableRow';
import AddEmployeeDialog from './add-employee/AddEmployeeDialog';
import PageHeader from '@/components/PageHeader';
import ExportButtons from '@/components/ui/export-buttons';
import { useTranslations } from '@/hooks/useTranslations';
import { useLanguage } from '@/contexts/LanguageContext';
import { getEmployees } from '@/app/services/api/employees';
import { getRoles } from '@/app/services/api/roles';

export default function EmployeeTablePage() {
  const { t } = useTranslations();
  const { language } = useLanguage();
  const isArabic = language === 'ar';

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [roleFilter, setRoleFilter] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Use SWR for data fetching
  const { data: employeesResponse, error, isLoading, mutate } = useSWR('employees', getEmployees, {
    revalidateOnFocus: false,
    revalidateOnReconnect: true,
    errorRetryCount: 3,
    errorRetryInterval: 1000
  });

  // Fetch roles for the role filter
  const { data: rolesResponse, error: rolesError, isLoading: rolesLoading } = useSWR('roles', getRoles, {
    revalidateOnFocus: false,
    revalidateOnReconnect: true,
    errorRetryCount: 3,
    errorRetryInterval: 1000
  });

  // Extract employees data from API response
  const employees = useMemo(() => {
    return employeesResponse?.success ? employeesResponse.data : [];
  }, [employeesResponse]);
  
  // Extract roles data from API response
  const roles = useMemo(() => {
    return rolesResponse?.success ? rolesResponse.data : [];
  }, [rolesResponse]);

  // Filter and sort data
  const filteredAndSortedData = useMemo(() => {
    if (!employees || employees.length === 0) return [];
    
    let filtered = employees.filter(employee => {
      const departmentField = isArabic ? employee.department_ar : employee.department_en;
      const roleField = isArabic ? employee.role_ar : employee.role_en;
      
      const matchesSearch = employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           (departmentField && departmentField.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesStatus = statusFilter === 'all' || employee.status === statusFilter;
      const matchesRole = roleFilter === 'all' || roleField === roleFilter;
      
      return matchesSearch && matchesStatus && matchesRole;
    });

    // Sort data
    filtered.sort((a, b) => {
      let aValue, bValue;
      
      if (sortBy === 'department') {
        aValue = isArabic ? a.department_ar : a.department_en;
        bValue = isArabic ? b.department_ar : b.department_en;
      } else if (sortBy === 'role') {
        aValue = isArabic ? a.role_ar : a.role_en;
        bValue = isArabic ? b.role_ar : b.role_en;
      } else {
        aValue = a[sortBy];
        bValue = b[sortBy];
      }
      
      if (sortOrder === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });

    return filtered;
  }, [employees, searchTerm, statusFilter, roleFilter, sortBy, sortOrder, isArabic]);

  const handleSort = (column) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('asc');
    }
  };

  const SortIcon = ({ column }) => {
    if (sortBy !== column) return null;
    return sortOrder === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />;
  };

  const StatusBadge = ({ status }) => {
    const isActive = status === 'active'; // API returns 'active' instead of Arabic text
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
        isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
      }`}>
        {isActive ? t('employees.active') : t('employees.inactive')}
      </span>
    );
  };

  // Column configuration for export
  const employeeColumnConfig = {
    id: {
      ar: 'المعرف',
      en: 'ID',
      dataKey: 'id'
    },
    name: {
      ar: 'الاسم',
      en: 'Name',
      dataKey: 'name'
    },
    email: {
      ar: 'البريد الإلكتروني',
      en: 'Email',
      dataKey: 'email'
    },
    phone: {
      ar: 'رقم الهاتف',
      en: 'Phone',
      dataKey: 'phone'
    },
    role: {
      ar: 'المنصب',
      en: 'Role',
      dataKey: isArabic ? 'role_ar' : 'role_en'
    },
    department: {
      ar: 'القسم',
      en: 'Department',
      dataKey: isArabic ? 'department_ar' : 'department_en'
    },
    status: {
      ar: 'الحالة',
      en: 'Status',
      dataKey: 'status',
      type: 'status',
      statusMap: {
        'active': { ar: 'نشط', en: 'Active' },
        'inactive': { ar: 'غير نشط', en: 'Inactive' }
      }
    },
    salary: {
      ar: 'الراتب',
      en: 'Salary',
      dataKey: 'salary'
    },
    hire_date: {
      ar: 'تاريخ التوظيف',
      en: 'Hire Date',
      dataKey: 'hire_date',
      type: 'date'
    }
  };

  const headerActions = (
    <AddEmployeeDialog
      onAdd={() => {
        mutate();
      }}
    />
  );

  return (
    <div className="" >
      <div className="">
        {/* Header */}
        <PageHeader 
          title={t('employees.title')}
          description={t('employees.description')}
          breadcrumbs={[
            { label: t('navigation.dashboard'), href: '/' },
            { label: t('navigation.humanResources') },
            { label: t('navigation.employees') },
          ]}
          actions={headerActions}
          sticky
        />

        {/* Loading State */}
        {isLoading && (
          <Card className="mb-6">
            <CardContent className="p-6 text-center">
              <div className="flex items-center justify-center space-x-2">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                <span>{t('employees.loadingData')}</span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Error State */}
        {error && (
          <Card className="mb-6">
            <CardContent className="p-6 text-center text-red-600">
              <p>{t('employees.errorLoading')}: {error.message}</p>
              <Button 
                onClick={() => mutate()} 
                className="mt-2"
                variant="outline"
              >
                {t('employees.retry')}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Filters and Search - Only show when not loading */}
        {!isLoading && !error && (
          <div className="bg-card rounded-sg shadow-sm border border-border p-6 mb-6">
            <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
              <div className="flex flex-col sm:flex-row gap-4 flex-1">
                {/* Search */}
                <div className="relative flex-1 w-full">
                  <Search className="absolute inset-inline-end-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    type="text"
                    placeholder={t('employees.searchPlaceholder')}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pe-10 ps-4 py-2"
                  />
                </div>

                {/* Status Filter */}
                <Select dir="rtl" value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="">
                    <SelectValue placeholder={t('employees.allStatuses')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all" className="cursor-pointer">{t('employees.allStatuses')}</SelectItem>
                    <SelectItem value="active" className="cursor-pointer">{t('employees.active')}</SelectItem>
                    <SelectItem value="inactive" className="cursor-pointer">{t('employees.inactive')}</SelectItem>
                  </SelectContent>
                </Select>

                {/* Role Filter */}
                <Select dir="rtl" value={roleFilter} onValueChange={setRoleFilter}>
                  <SelectTrigger className="">
                    <SelectValue placeholder={
                      rolesLoading ? t('common.loading') + '...' :
                      rolesError ? t('common.error') :
                      t('employees.allRoles')
                    } />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all" className="cursor-pointer">{t('employees.allRoles')}</SelectItem>
                    {!rolesLoading && !rolesError && roles.map((role) => (
                      <SelectItem 
                        key={role.id} 
                        value={isArabic ? role.role_ar : role.role_en} 
                        className="cursor-pointer"
                      >
                        {isArabic ? role.role_ar : role.role_en}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

            </div>

            {/* Export Buttons */}
            {filteredAndSortedData.length > 0 && (
              <div className="mt-4 pt-4 border-t border-border">
                <ExportButtons
                  data={filteredAndSortedData}
                  columnConfig={employeeColumnConfig}
                  language={language}
                  exportName="employees"
                  sheetName={language === 'ar' ? 'الموظفون' : 'Employees'}
                />
              </div>
            )}
          </div>
        )}

        {/* Table - Only show when not loading */}
        {!isLoading && !error && (
          <div className="bg-card rounded-sg shadow-sm border border-border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted border-b border-border">
                  <tr>
                    <th 
                      className="px-6 py-3 text-start text-xs font-medium text-muted-foreground uppercase tracking-wider cursor-pointer hover:bg-muted/80"
                      onClick={() => handleSort('name')}
                    >
                      <div className="flex items-center gap-1 cursor-pointer">
                        {t('employees.name')}
                        <SortIcon column="name" />
                      </div>
                    </th>
                    <th 
                      className="px-6 py-3 text-start text-xs font-medium text-muted-foreground uppercase tracking-wider cursor-pointer hover:bg-muted/80"
                      onClick={() => handleSort('role')}
                    >
                      <div className="flex items-center gap-1 cursor-pointer">
                        {t('employees.role')}
                        <SortIcon column="role" />
                      </div>
                    </th>
                    <th 
                      className="px-6 py-3 text-start text-xs font-medium text-muted-foreground uppercase tracking-wider cursor-pointer hover:bg-muted/80"
                      onClick={() => handleSort('department')}
                    >
                      <div className="flex items-center gap-1 cursor-pointer">
                        {t('employees.department')}
                        <SortIcon column="department" />
                      </div>
                    </th> 
                    <th className="px-6 py-3 text-start text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      {t('employees.status')}
                    </th>
                    {/* <th 
                      className="px-6 py-3 text-start text-xs font-medium text-muted-foreground uppercase tracking-wider cursor-pointer hover:bg-muted/80"
                      onClick={() => handleSort('lastLogin')}
                    >
                      <div className="flex items-center gap-1 cursor-pointer">
                        {t('employees.lastLogin')}
                        <SortIcon column="lastLogin" />
                      </div>
                    </th> */}
                    <th className="px-6 py-3 text-start text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      {t('employees.actions')}
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-card divide-y divide-border">
                  {filteredAndSortedData.map((employee) => (
                    <EmployeeTableRow 
                      key={employee.id} 
                      employee={employee} 
                      StatusBadge={StatusBadge} 
                      isArabic={isArabic}
                      onEmployeeUpdate={() => mutate()}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !error && filteredAndSortedData.length === 0 && (
          <div className=" rounded-sg shadow-sm border border-gray-200 p-12 text-center">
            <div className="w-12 h-12 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <Search className="w-6 h-6 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">{t('employees.noResults')}</h3>
            <p className="text-gray-500">{t('employees.noResultsDescription')}</p>
          </div>
        )}
      </div>
    </div>
  );
}

