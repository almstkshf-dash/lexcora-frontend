"use client";

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useIsClient } from '@/hooks/useIsClient';
import useSWR from 'swr';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getEmployeeById } from '@/app/services/api/employees';
import { useTranslations } from '@/hooks/useTranslations';
import { useLanguage } from '@/contexts/LanguageContext';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import {
  User,
  Mail,
  Phone,
  Building,
  IdCard,
  Calendar,
  MapPin,
  DollarSign,
  FileText,
  AlertCircle,
  Loader2,
  X,
  CircleX
} from 'lucide-react';

const ViewEmployeeDialog = ({ employeeId, trigger }) => {
  const [open, setOpen] = useState(false);
  const { t } = useTranslations();
  const { language, isRTL } = useLanguage();

  // Fetch employee data using SWR
  const { data, error, isLoading } = useSWR(
    open && employeeId ? `/employees/${employeeId}` : null,
    () => getEmployeeById(employeeId),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      onError: (error) => {

      }
    }
  );

  const employee = data?.data;

  const formatDate = (dateString) => {
    if (!dateString) return t('common.notSpecified');
    try {
      const date = new Date(dateString);
      return format(date, 'PPP', { locale: language === 'ar' ? ar : undefined });
    } catch (error) {
      return t('common.notSpecified');
    }
  };

  const getStatusBadge = (status) => {
    if (!status) return <Badge variant="secondary">{t('common.notSpecified')}</Badge>;
    const variant = status === 'active' ? 'default' : 'secondary';
    const text = status === 'active' ? t('employees.active') : t('employees.inactive');
    return <Badge variant={variant}>{text}</Badge>;
  };

  const InfoCard = ({ title, children, icon: Icon }) => (
    <Card className="mb-4">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Icon className="w-5 h-5" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        {children}
      </CardContent>
    </Card>
  );

  const InfoRow = ({ label, value, icon: Icon }) => (
    <div className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        {Icon && <Icon className="w-4 h-4" />}
        {label}
      </div>
      <div className="text-sm font-medium text-end">{value || t('common.notSpecified')}</div>
    </div>
  );

  // Close modal when ESC key is pressed
  useEffect(() => {
    const handleEscapeKey = (event) => {
      if (event.key === 'Escape' && open) {
        setOpen(false);
      }
    };

    if (open) {
      document.addEventListener('keydown', handleEscapeKey);
      document.body.style.overflow = 'hidden'; // Prevent background scrolling
    }

    return () => {
      document.removeEventListener('keydown', handleEscapeKey);
      document.body.style.overflow = 'unset'; // Restore scrolling
    };
  }, [open]);

  const isClient = useIsClient();

  if (!open || !isClient) return (
    <div onClick={() => {
      if (!employeeId) return;
      setOpen(true);
    }}>
      {trigger}
    </div>
  );

  const modalContent = (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm"
        onClick={() => setOpen(false)}
      />

      {/* Modal Content */}
      <div
        className="relative bg-white dark:bg-slate-900 rounded-xl shadow-2xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden flex flex-col border border-border"
        dir={isRTL ? 'rtl' : 'ltr'}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-2">
            <User className="w-5 h-5" />
            <h2 className="text-lg font-semibold">{t('employees.employeeDetails')}</h2>
          </div>
          <button
            onClick={() => setOpen(false)}
            className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <CircleX className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {!employeeId && (
            <div className="flex items-center justify-center py-8 text-red-600">
              <AlertCircle className="w-6 h-6 me-2" />
              {t('employees.missingEmployeeId')}
            </div>
          )}

          {employeeId && isLoading && (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin me-2" />
              {t('employees.loadingEmployeeDetails')}
            </div>
          )}

          {employeeId && error && (
            <div className="flex items-center justify-center py-8 text-red-600">
              <AlertCircle className="w-6 h-6 me-2" />
              {t('employees.errorLoadingDetails')}
            </div>
          )}

          {employeeId && !isLoading && !error && !employee && open && (
            <div className="flex items-center justify-center py-8 text-muted-foreground">
              <AlertCircle className="w-6 h-6 me-2" />
              {t('employees.noEmployeeFound')}
            </div>
          )}

          {employeeId && employee && (
            <div className="space-y-6">
              {/* Header with name and status */}
              <div className="flex items-center justify-between p-4 bg-muted rounded-sg">
                <div>
                  <h3 className="text-xl font-semibold">{employee.name || t('common.notSpecified')}</h3>
                  <p className="text-muted-foreground">
                    {language === 'ar' ? (employee.department_ar || t('common.notSpecified')) : (employee.department_en || t('common.notSpecified'))}
                  </p>
                </div>
                {getStatusBadge(employee.status)}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Personal Information */}
                <InfoCard title={t('employees.personalInfo')} icon={User}>
                  <div className="space-y-1">
                    <InfoRow label={t('employees.name')} value={employee.name} icon={User} />
                    <InfoRow label={t('employees.jobId')} value={employee.job_id} icon={IdCard} />
                    <InfoRow label={t('employees.employeeId')} value={employee.eId} icon={IdCard} />
                    <InfoRow label={t('employees.passportNumber')} value={employee.passport} icon={FileText} />
                    <InfoRow label={t('employees.manager')} value={employee.managerName} icon={User} />
                    <InfoRow
                      label={t('employees.role')}
                      value={language === 'ar' ? employee.role_ar : employee.role_en}
                      icon={Building}
                    />
                  </div>
                </InfoCard>

                {/* Contact Information */}
                <InfoCard title={t('employees.contactInfo')} icon={Mail}>
                  <div className="space-y-1">
                    <InfoRow label={t('employees.email')} value={employee.email} icon={Mail} />
                    <InfoRow label={t('employees.phoneNumber')} value={employee.phone} icon={Phone} />
                    <InfoRow label={t('employees.username')} value={employee.username} icon={User} />
                  </div>
                </InfoCard>

                {/* Work Information */}
                <InfoCard title={t('employees.workInfo')} icon={Building}>
                  <div className="space-y-1">
                    <InfoRow
                      label={t('employees.department')}
                      value={language === 'ar' ? employee.department_ar : employee.department_en}
                      icon={Building}
                    />
                    <InfoRow label={t('employees.status')} value={getStatusBadge(employee.status)} />
                    <InfoRow label={t('employees.contractType')} value={employee.contract_type} icon={FileText} />
                    <InfoRow label={t('employees.firstDayOfWork')} value={formatDate(employee.fisrt_day_of_work)} icon={Calendar} />
                    <InfoRow label={t('employees.lastLogin')} value={formatDate(employee.last_login)} icon={Calendar} />
                    <InfoRow label={t('employees.accountActivationDate')} value={formatDate(employee.account_activation_date)} icon={Calendar} />
                    <InfoRow label={t('employees.accountCloseDate')} value={formatDate(employee.account_close_date)} icon={Calendar} />
                  </div>
                </InfoCard>

                {/* Salary & Allowances */}
                <InfoCard title={t('employees.salaryInfo')} icon={DollarSign}>
                  <div className="space-y-1">
                    <InfoRow label={t('employees.basicSalary')} value={employee.basic_salary ? `${employee.basic_salary} AED` : null} icon={DollarSign} />
                    <InfoRow label={t('employees.housingAllowance')} value={employee.housing_allowance ? `${employee.housing_allowance} AED` : null} icon={DollarSign} />
                    <InfoRow label={t('employees.transportationAllowance')} value={employee.trnsportation_allownce ? `${employee.trnsportation_allownce} AED` : null} icon={DollarSign} />
                    <InfoRow label={t('employees.anotherAllowance')} value={employee.another_allownce ? `${employee.another_allownce} AED` : null} icon={DollarSign} />
                  </div>
                </InfoCard>

                {/* Bank Information */}
                <InfoCard title={t('employees.bankInfo')} icon={Building}>
                  <div className="space-y-1">
                    <InfoRow label={t('employees.bankName')} value={employee.bank_name} icon={Building} />
                    <InfoRow label={t('employees.iban')} value={employee.iban} icon={FileText} />
                    <InfoRow label={t('employees.accountNumber')} value={employee.account_number} icon={FileText} />
                    <InfoRow label={t('employees.payType')} value={employee.pay_type} icon={DollarSign} />
                  </div>
                </InfoCard>

                {/* Documents Information */}
                <InfoCard title={t('employees.documentsInfo')} icon={FileText}>
                  <div className="space-y-1">
                    <InfoRow
                      label={t('employees.residenceEndDate')}
                      value={formatDate(employee.residence_end_date)}
                      icon={Calendar}
                    />
                    <InfoRow
                      label={t('employees.idEndDate')}
                      value={formatDate(employee.id_end_date)}
                      icon={Calendar}
                    />
                    <InfoRow
                      label={t('employees.passportEndDate')}
                      value={formatDate(employee.passport_end_date)}
                      icon={Calendar}
                    />
                    <InfoRow
                      label={t('employees.laborCardEndDate')}
                      value={formatDate(employee.labor_card_end_date)}
                      icon={Calendar}
                    />
                    <InfoRow
                      label={t('employees.healthInsuranceEndDate')}
                      value={formatDate(employee.health_insurance_end_date)}
                      icon={Calendar}
                    />
                    <InfoRow
                      label={t('employees.contractEndDate')}
                      value={formatDate(employee.contract_end_date)}
                      icon={Calendar}
                    />
                  </div>
                </InfoCard>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        {employeeId && employee && (
          <div className="flex justify-end p-6 border-t bg-gray-50 dark:bg-slate-800/50">
            <Button variant="outline" onClick={() => setOpen(false)}>
              {t('employees.close')}
            </Button>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <>
      <div onClick={() => {
        if (!employeeId) return;
        setOpen(true);
      }}>
        {trigger}
      </div>
      {createPortal(modalContent, document.body)}
    </>
  );
};

export default ViewEmployeeDialog;

