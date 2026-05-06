import { useMemo } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTranslations } from "@/hooks/useTranslations";
import useSWR from 'swr';
import { getPermissions } from '@/app/services/api/permissions';

export default function EmployeePermissionsTab({ form, setForm }) {
  const { isRTL, language } = useLanguage();
  const { t } = useTranslations();

  // Fetch permissions directly using SWR
  const { data: permissionsData, error: permissionsError, isLoading: permissionsLoading } = useSWR('/permissions', getPermissions);
  const permissions = useMemo(() => permissionsData?.success ? permissionsData.data : [], [permissionsData]);

  // Group permissions by permission_group_name
  const groupedPermissions = useMemo(() => {
    const groups = {};
    permissions.forEach((permission) => {
      const groupName = permission.permission_group_name;
      if (!groups[groupName]) {
        groups[groupName] = [];
      }
      groups[groupName].push(permission);
    });
    return groups;
  }, [permissions]);

  // Helper function to get translated group name
  const getGroupNameTranslation = (groupName) => {
    const translations = {
      'case_parties': { ar: 'أطراف القضية', en: 'Case Parties' },
      'case_stages': { ar: 'مراحل القضية', en: 'Case Stages' },
      'case_team': { ar: 'فريق القضية', en: 'Case Team' },
      'clients': { ar: 'العملاء', en: 'Clients' },
      'client_requests': { ar: 'طلبات العملاء', en: 'Client Requests' },
      'employees': { ar: 'الموظفين', en: 'Employees' },
      'executions': { ar: 'التنفيذات', en: 'Executions' },
      'judicial_notices': { ar: 'الإشعارات القضائية', en: 'Judicial Notices' },
      'meetings': { ar: 'الاجتماعات', en: 'Meetings' },
      'memos': { ar: 'المذكرات', en: 'Memos' },
      'petitions': { ar: 'العرائض', en: 'Petitions' },
      'police_stations': { ar: 'مراكز الشرطة', en: 'Police Stations' },
      'sessions': { ar: 'الجلسات', en: 'Sessions' },
      'tasks': { ar: 'المهام', en: 'Tasks' },
      'cases': { ar: 'القضايا', en: 'Cases' },
      'courts': { ar: 'المحاكم', en: 'Courts' },
      'departments': { ar: 'الأقسام', en: 'Departments' },
      'branches': { ar: 'الفروع', en: 'Branches' },
      'roles': { ar: 'الأدوار', en: 'Roles' },
      'permissions': { ar: 'الصلاحيات', en: 'Permissions' },
      'public_prosecutions': { ar: 'النيابات العامة', en: 'Public Prosecutions' },
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
    setForm((prev) => ({
      ...prev,
      permissions: prev.permissions.includes(permissionId)
        ? prev.permissions.filter((p) => p !== permissionId)
        : [...prev.permissions, permissionId]
    }));
  };

  if (permissionsLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-muted-foreground">{t('common.loading')}</div>
      </div>
    );
  }

  if (permissionsError) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-destructive">{t('common.error')}: {permissionsError}</div>
      </div>
    );
  }

  if (permissions.length === 0) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-muted-foreground">{t('common.noData')}</div>
      </div>
    );
  }

  return (
    <>
      {/* Select All Checkbox */}
      <div className="mb-4 p-3 rounded-sg border border-border">
        <label className="flex items-center gap-2 cursor-pointer font-medium">
          <Checkbox
            checked={form.permissions.length === permissions.length}
            onCheckedChange={(checked) => {
              if (checked) {
                setForm(prev => ({ ...prev, permissions: permissions.map(p => p.id) }));
              } else {
                setForm(prev => ({ ...prev, permissions: [] }));
              }
            }}
            id="select-all"
          />
          <span className="text-foreground">{t('employees.selectAll')} ({form.permissions.length}/{permissions.length})</span>
        </label>
      </div>

      {/* Grouped Permissions */}
      <div className="space-y-6">
        {Object.entries(groupedPermissions).map(([groupName, groupPermissions]) => (
          <div key={groupName} className="border border-border rounded-sg p-4 bg-muted/20">
            {/* Group Header */}
            <h3 className="text-base font-semibold text-foreground mb-4 pb-2 border-b border-border">
              {getGroupNameTranslation(groupName)}
            </h3>
            
            {/* Permissions Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {groupPermissions.map((permission) => (
                <label
                  key={permission.id}
                  className="flex items-center gap-2 cursor-pointer hover:bg-muted/50 p-2 rounded transition-colors"
                >
                  <Checkbox
                    checked={form.permissions.includes(permission.id)}
                    onCheckedChange={() => handleTogglePermission(permission.id)}
                    id={`permission-${permission.id}`}
                  />
                  <span className="text-sm text-foreground">
                    {language === 'ar' ? permission.permission_ar : permission.permission_en}
                  </span>
                </label>
              ))}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

