"use client";

import React, { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Shield, Loader2, AlertCircle } from "lucide-react";
import useSWR, { mutate } from "swr";
import { getEmployeeById, getEmployeePermissions, assignPermissionsToEmployee } from "@/app/services/api/employees";
import { toast } from 'react-toastify';
import { useLanguage } from "@/contexts/LanguageContext";
import { useTranslations } from "@/hooks/useTranslations";

const PermissionsTab = ({ employeeId }) => {
  const { isRTL } = useLanguage();
  const { t } = useTranslations();
  const [localPermissions, setLocalPermissions] = useState([]);
  const [isSaving, setIsSaving] = useState(false);

  // Fetch employee data for role info
  const { data: employeeData, error: employeeError, isLoading: employeeLoading } = useSWR(
    employeeId ? `/employees/${employeeId}` : null,
    () => getEmployeeById(employeeId),
    {
      revalidateOnFocus: false,
    }
  );

  // Fetch employee permissions
  const { data: permissionsData, error: permissionsError, isLoading: permissionsLoading } = useSWR(
    employeeId ? `/permissions/employee/${employeeId}` : null,
    () => getEmployeePermissions(employeeId),
    {
      revalidateOnFocus: false,
    }
  );

  const isLoading = employeeLoading || permissionsLoading;
  const error = employeeError || permissionsError;

  const employee = employeeData?.data;
  const permissions = useMemo(() => permissionsData?.data || [], [permissionsData?.data]);

  // Initialize local permissions when data is loaded
  React.useEffect(() => {
    if (permissions.length > 0) {
      setLocalPermissions(permissions);
    }
  }, [permissions]);

  // Group permissions by permission_parent_name, then by permission_group_name
  const groupedPermissions = useMemo(() => {
    const parents = {};
    if (Array.isArray(permissions)) {
      permissions.forEach((permission) => {
        const parentName = permission.permission_parent_name;
        const groupName = permission.permission_group_name;
        
        if (!parents[parentName]) {
          parents[parentName] = {};
        }
        if (!parents[parentName][groupName]) {
          parents[parentName][groupName] = [];
        }
        parents[parentName][groupName].push(permission);
      });
    }
    return parents;
  }, [permissions]);

  // Helper function to get translated parent name
  const getParentNameTranslation = (parentName) => {
    const translations = {
      'hr': { ar: 'الموارد البشرية', en: 'Human Resources' },
      'cases': { ar: 'القضايا', en: 'Cases' },
      'parties': { ar: 'الموكلين', en: 'Parties' },
      'finance': { ar: 'المالية', en: 'Finance' },
      'settings': { ar: 'الإعدادات', en: 'Settings' },
    };

    const translation = translations[parentName];
    if (translation) {
      return isRTL ? translation.ar : translation.en;
    }
    
    // Fallback to formatted name if no translation found
    return parentName
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  // Helper function to get translated group name
  const getGroupNameTranslation = (groupName) => {
    const translations = {
      'annual_leaves': { ar: 'الإجازات السنوية', en: 'Annual Leaves' },
      'attendance': { ar: 'الحضور', en: 'Attendance' },
      'case_classifications': { ar: 'تصنيفات القضايا', en: 'Case Classifications' },
      'case_degrees': { ar: 'درجات التقاضي', en: 'Court Degrees' },
      'case_documents': { ar: 'مستندات القضايا', en: 'Case Documents' },
      'case_parties': { ar: 'أطراف القضية', en: 'Case Parties' },
      'case_types': { ar: 'أنواع القضايا', en: 'Case Types' },
      'cases': { ar: 'القضايا', en: 'Cases' },
      'client_deals': { ar: 'الاتفاقيات', en: 'Deals' },
      'courts': { ar: 'المحاكم', en: 'Courts' },
      'deductions': { ar: 'الخصومات', en: 'Deductions' },
      'employee_documents': { ar: 'مستندات الموظفين', en: 'Employee Documents' },
      'employee_requests': { ar: 'طلبات الموظفين', en: 'Employee Requests' },
      'executions': { ar: 'التنفيذات', en: 'Executions' },
      'forms': { ar: 'النماذج', en: 'Forms' },
      'hr_notifications': { ar: 'تنبيهات الموارد البشرية', en: 'HR Notifications' },
      'judicial_notices': { ar: 'الإشعارات القضائية', en: 'Judicial Notices' },
      'meetings': { ar: 'الاجتماعات', en: 'Meetings' },
      'memos': { ar: 'المذكرات', en: 'Memos' },
      'other_leaves': { ar: 'إجازات أخرى', en: 'Other Leaves' },
      'parties': { ar: 'الموكلين', en: 'Parties' },
      'party_documents': { ar: 'مستندات الموكلين', en: 'Party Documents' },
      'party_orders': { ar: 'طلبات الموكلين', en: 'Party Orders' },
      'performance': { ar: 'الأداء', en: 'Performance' },
      'petitions': { ar: 'العرائض', en: 'Petitions' },
      'reviews': { ar: 'التقييمات', en: 'Reviews' },
      'sessions': { ar: 'الجلسات', en: 'Sessions' },
      'sick_leaves': { ar: 'الإجازات المرضية', en: 'Sick Leaves' },
      'tasks': { ar: 'المهام', en: 'Tasks' },
      'trainings': { ar: 'التدريبات', en: 'Trainings' },
    };

    const translation = translations[groupName];
    if (translation) {
      return isRTL ? translation.ar : translation.en;
    }
    
    // Fallback to formatted name if no translation found
    return groupName
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const handleTogglePermission = (permissionId) => {
    setLocalPermissions((prev) =>
      Array.isArray(prev)
        ? prev.map((permission) =>
            permission.id === permissionId
              ? { ...permission, isPermissionForThisUser: permission.isPermissionForThisUser === 1 ? 0 : 1 }
              : permission
          )
        : []
    );
  };

  const handleUpdate = async () => {
    if (isSaving) return; // Prevent multiple submissions
    
    // Get only the IDs of permissions that are set to true (checked)
    const updatedPermissions = Array.isArray(localPermissions)
      ? localPermissions
          .filter(permission => permission.isPermissionForThisUser === 1)
          .map(permission => permission.id)
      : [];
    
    setIsSaving(true);
    
    try {
      await assignPermissionsToEmployee(employeeId, updatedPermissions);
      
      toast.success(t('roles.permissionsSavedSuccessfully'));
      
      // Revalidate the permissions data
      mutate(`/permissions/employee/${employeeId}`);
    } catch (error) {
      toast.error(t('roles.errorSavingPermissions'));
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-destructive">
        <AlertCircle className="w-12 h-12 mb-4" />
        <p>{t('common.errorLoading')}</p>
      </div>
    );
  }

  if (!employee) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">{t('common.noData')}</p>
      </div>
    );
  }

  const InfoRow = ({ label, value }) => (
    <div className="flex justify-between py-3 border-b last:border-0">
      <span className="font-medium text-muted-foreground">{label}</span>
      <span className="text-foreground">{value || t('common.notSpecified')}</span>
    </div>
  );


  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Shield className="w-5 h-5" />
            {t('employees.role')}
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <InfoRow label={t('employees.role')} value={isRTL ? employee.role_ar : employee.role_en} />
      
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Shield className="w-5 h-5" />
            {t('employees.permissions')} ({permissions.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-muted-foreground">{t('common.loading')}</div>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-destructive">{t('common.error')}</div>
            </div>
          ) : localPermissions.length === 0 ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-muted-foreground">{t('common.noData')}</div>
            </div>
          ) : (
            <div className="space-y-6">
              {Object.entries(groupedPermissions).map(([parentName, groups]) => (
                <div key={parentName} className="border-2 border-primary/20 rounded-xl p-5 bg-gradient-to-br from-muted/30 to-muted/10">
                  {/* Parent Header */}
                  <div className="flex items-center gap-3 mb-5 pb-3 border-b-2 border-primary/30">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <Shield className="w-5 h-5 text-primary" />
                    </div>
                    <h2 className="text-xl font-bold text-foreground">
                      {getParentNameTranslation(parentName)}
                    </h2>
                    <Badge variant="secondary" className="mr-auto">
                      {Object.values(groups).flat().length} {t('employees.permissions').toLowerCase()}
                    </Badge>
                  </div>
                  
                  {/* Groups within Parent */}
                  <div className="space-y-4">
                    {Object.entries(groups).map(([groupName, groupPermissions]) => (
                      <div key={groupName} className="border border-border rounded-lg p-4 bg-background/50 hover:bg-background/80 transition-colors">
                        {/* Group Header */}
                        <div className="flex items-center justify-between mb-3 pb-2 border-b border-border/50">
                          <h3 className="text-base font-semibold text-foreground">
                            {getGroupNameTranslation(groupName)}
                          </h3>
                          <Badge variant="outline" className="text-xs">
                            {groupPermissions.length}
                          </Badge>
                        </div>
                        
                        {/* Permissions Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {Array.isArray(groupPermissions) && groupPermissions.map((permission) => {
                            const localPermission = Array.isArray(localPermissions) ? localPermissions.find(p => p.id === permission.id) : null;
                            return (
                              <label
                                key={permission.id}
                                className="flex items-center gap-3 cursor-pointer hover:bg-accent/50 p-2.5 rounded-md transition-all group"
                              >
                                <Checkbox
                                  checked={localPermission?.isPermissionForThisUser === 1}
                                  onCheckedChange={() => handleTogglePermission(permission.id)}
                                  id={`permission-${permission.id}`}
                                  className="group-hover:border-primary"
                                />
                                <span className="text-sm text-foreground group-hover:text-primary transition-colors">
                                  {isRTL ? permission.permission_ar : permission.permission_en}
                                </span>
                              </label>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Update Button */}
      <div className="flex justify-end gap-2">
        <Button
          onClick={handleUpdate}
          disabled={isSaving}
          className="cursor-pointer"
        >
          {isSaving && <Loader2 className={isRTL ? "ml-2 h-4 w-4 animate-spin" : "mr-2 h-4 w-4 animate-spin"} />}
          {isSaving ? t('common.saving') : t('common.update')}
        </Button>
      </div>
    </div>
  );
};

export default PermissionsTab;
