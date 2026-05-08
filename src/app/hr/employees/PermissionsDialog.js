import React, { useState, useMemo, useEffect } from "react";
import { createPortal } from "react-dom";
import { useIsClient } from "@/hooks/useIsClient";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Shield, CircleX, Loader2 } from "lucide-react";
import { useTranslations } from "@/hooks/useTranslations";
import { assignPermissionsToEmployee, getEmployeePermissions } from "@/app/services/api/employees";
import useSWR from "swr";
import { toast } from 'react-toastify';
import { useLanguage } from "@/contexts/LanguageContext";

export default function PermissionsModal({ trigger,id }) {
    const { t } = useTranslations();
    const [open, setOpen] = useState(false);
    const [localPermissions, setLocalPermissions] = useState([]);
    const [isSaving, setIsSaving] = useState(false);
    const {isRTL} = useLanguage();

    // Fetch employee permissions using SWR - only when modal is open
    const { data: permissionsData, error, isLoading } = useSWR(
        open && id ? `/permissions/employee/${id}` : null,
        () => getEmployeePermissions(id),
        {
            revalidateOnFocus: false,
            revalidateOnReconnect: false
        }
    );

    const permissions = useMemo(() => {
        return permissionsData?.data || [];
    }, [permissionsData]);

    // Group permissions by permission_group_name
    const groupedPermissions = useMemo(() => {
        const groups = {};
        if (Array.isArray(permissions)) {
            permissions.forEach((permission) => {
                const groupName = permission.permission_group_name;
                if (!groups[groupName]) {
                    groups[groupName] = [];
                }
                groups[groupName].push(permission);
            });
        }
        return groups;
    }, [permissions]);

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
            'accounting': { ar: 'المحاسبة', en: 'Accounting' },
            'invoices': { ar: 'الفواتير', en: 'Invoices' },
            'bank_accounts': { ar: 'الحسابات البنكية', en: 'Bank Accounts' },
            'settings': { ar: 'الإعدادات', en: 'Settings' },
            'logs': { ar: 'السجلات', en: 'Logs' },
        };

        const translation = translations[groupName];
        if (translation) {
            return isRTL ? translation.ar : translation.en;
        }

        return groupName
            .split('_')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    };

    // Initialize local permissions when data is loaded
    React.useEffect(() => {
        if (permissions.length > 0) {
            setLocalPermissions(permissions);
        }
    }, [permissions]);

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

    const handleOverlayClick = (e) => {
        if (e.target === e.currentTarget) {
            setOpen(false);
        }
    };
    const handleSave = async () => {
        if (isSaving) return; // Prevent multiple submissions
        
        // Get only the IDs of permissions that are set to true (checked)
        const updatedPermissions = Array.isArray(localPermissions)
            ? localPermissions
                .filter(permission => permission.isPermissionForThisUser === 1)
                .map(permission => permission.id)
            : [];
        
        setIsSaving(true);
        
        try {
            const result = await assignPermissionsToEmployee(id, updatedPermissions);
            
            toast.success(t('messages.permissionsSavedSuccessfully') || 'Permissions saved successfully!');
            setOpen(false);
        } catch (error) {

            toast.error(t('messages.errorSavingPermissions') || 'Error saving permissions. Please try again.');
        } finally {
            setIsSaving(false);
        }
    };

    const isClient = useIsClient();

    if (!open || !isClient) return (
        <>
            {/* Trigger */}
            {trigger ? (
                <div onClick={() => setOpen(true)}>
                    {trigger}
                </div>
            ) : (
                <button
                    className="flex items-center gap-2 w-full px-2 py-1 hover:bg-muted rounded text-end cursor-pointer"
                    onClick={() => setOpen(true)}
                >
                    <Shield className="w-4 h-4 text-muted-foreground" />
                    {t('employees.permissions')}
                </button>
            )}
        </>
    );

    const modalContent = (
        <div
            className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
        >
            {/* Backdrop */}
            <div 
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={() => setOpen(false)}
            />

            {/* Modal Content */}
            <div
                className="relative z-10 bg-card rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden border border-border flex flex-col"
                dir={isRTL ? "rtl" : "ltr"}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-border bg-card">
                    <h2 className="text-xl font-semibold text-foreground">{t('employees.permissions')}</h2>
                    <button
                        onClick={() => setOpen(false)}
                        className="p-1 hover:bg-muted rounded-full transition-colors"
                    >
                        <CircleX className="w-5 h-5 text-muted-foreground" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto flex-1 bg-card">
                    {isLoading ? (
                        <div className="flex items-center justify-center py-8">
                            <Loader2 className="w-8 h-8 animate-spin text-primary" />
                        </div>
                    ) : error ? (
                        <div className="flex items-center justify-center py-8">
                            <div className="text-destructive font-medium">{t('common.error')}</div>
                        </div>
                    ) : localPermissions.length === 0 ? (
                        <div className="flex items-center justify-center py-8">
                            <div className="text-muted-foreground">{t('common.noData')}</div>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {Object.entries(groupedPermissions).map(([groupName, groupPermissions]) => (
                                <div key={groupName} className="border border-border rounded-sg p-4 bg-muted/20">
                                    {/* Group Header */}
                                    <h3 className="text-base font-semibold text-foreground mb-4 pb-2 border-b border-border">
                                        {getGroupNameTranslation(groupName)}
                                    </h3>
                                    
                                    {/* Permissions Grid */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        {Array.isArray(groupPermissions) && groupPermissions.map((permission) => {
                                            const localPermission = Array.isArray(localPermissions) ? localPermissions.find(p => p.id === permission.id) : null;
                                            return (
                                                <label
                                                    key={permission.id}
                                                    className="flex items-center gap-2 cursor-pointer hover:bg-muted/50 p-2 rounded transition-colors"
                                                >
                                                    <Checkbox
                                                        checked={localPermission?.isPermissionForThisUser === 1}
                                                        onCheckedChange={() => handleTogglePermission(permission.id)}
                                                        id={`permission-${permission.id}`}
                                                    />
                                                    <span className="text-sm text-foreground">
                                                        {isRTL ? permission.permission_ar : permission.permission_en}
                                                    </span>
                                                </label>
                                            );
                                        })}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="flex justify-end gap-2 p-6 border-t border-border bg-muted/30">
                    <Button
                        variant="outline"
                        onClick={() => setOpen(false)}
                        className="cursor-pointer"
                    >
                        {t('buttons.cancel')}
                    </Button>
                    <Button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="cursor-pointer min-w-[100px]"
                    >
                        {isSaving && <Loader2 className="me-2 h-4 w-4 animate-spin" />}
                        {isSaving ? (t('buttons.saving') || 'Saving...') : t('buttons.save')}
                    </Button>
                </div>
            </div>
        </div>
    );

    return (
        <>
            {/* Trigger */}
            {trigger ? (
                <div onClick={() => setOpen(true)}>
                    {trigger}
                </div>
            ) : (
                <button
                    className="flex items-center gap-2 w-full px-2 py-1 hover:bg-muted rounded text-end cursor-pointer"
                    onClick={() => setOpen(true)}
                >
                    <Shield className="w-4 h-4 text-muted-foreground" />
                    {t('employees.permissions')}
                </button>
            )}

            {createPortal(modalContent, document.body)}
        </>
    );
}

