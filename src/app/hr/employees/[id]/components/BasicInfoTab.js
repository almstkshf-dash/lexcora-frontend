"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  User, 
  IdCard, 
  Loader2, 
  AlertCircle, 
  Mail, 
  Phone, 
  Building, 
  Calendar,
  DollarSign,
  FileText
} from "lucide-react";
import useSWR, { mutate } from "swr";
import { useSelector } from 'react-redux';
import { getEmployeeById } from "@/app/services/api/employees";
import EditEmployeeModal from "./EditEmployeeModal";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTranslations } from "@/hooks/useTranslations";

const BasicInfoTab = ({ employeeId }) => {
  const { isRTL } = useLanguage();
  const { t } = useTranslations();
  
  // Get employee role from Redux to check if user is admin
  const employeeRole = useSelector((state) => state.auth.roleEn);
  const isAdmin = employeeRole?.toLowerCase() === 'admin';
  
  const { data, error, isLoading } = useSWR(
    employeeId ? `/employees/${employeeId}` : null,
    () => getEmployeeById(employeeId),
    {
      revalidateOnFocus: false,
    }
  );

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

  const employee = data?.data;

  if (!employee) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">{t('common.noData')}</p>
      </div>
    );
  }

  const formatDate = (dateString) => {
    if (!dateString) return null;
    try {
      const locale = isRTL ? 'ar-AE' : 'en-US';
      return new Date(dateString).toLocaleDateString(locale);
    } catch (error) {
      return null;
    }
  };

  const getStatusBadge = (status) => {
    if (!status) return <Badge variant="secondary">{t('common.notSpecified')}</Badge>;
    const variant = status === 'active' ? 'default' : 'secondary';
    const text = status === 'active' ? t('employees.active') : t('employees.inactive');
    return <Badge variant={variant}>{text}</Badge>;
  };

  const InfoRow = ({ label, value }) => (
    <div className="flex justify-between py-3 border-b last:border-0">
      <span className="font-medium text-muted-foreground">{label}</span>
      <span className="text-foreground">{value || t('common.notSpecified')}</span>
    </div>
  );

  return (
    <div className="space-y-4">
      {/* Header with name and status */}
      <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
        <div>
          <h3 className="text-xl font-semibold">{employee.name || t('common.notSpecified')}</h3>
          <p className="text-muted-foreground">
            {(isRTL ? employee.role_ar : employee.role_en) || t('common.notSpecified')}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {getStatusBadge(employee.status)}
          <EditEmployeeModal 
            employeeId={employeeId}
            onUpdate={() => {
              // Revalidate the data after update
              mutate(`/employees/${employeeId}`);
            }}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Personal Information */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <User className="w-5 h-5" />
              {t('employees.personalInfo')}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <InfoRow label={t('employees.name')} value={employee.name} />
            <InfoRow label={t('employees.employeeNumber')} value={employee.job_id} />
            <InfoRow label={t('employees.identityNumber')} value={employee.eId} />
            <InfoRow label={t('employees.passportNumber')} value={employee.passport} />
            <InfoRow label={t('employees.directManager')} value={employee.managerName} />
            <InfoRow label={t('employees.role')} value={isRTL ? employee.role_ar : employee.role_en} />
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Mail className="w-5 h-5" />
              {t('employees.contactInfo')}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <InfoRow label={t('employees.email')} value={employee.email} />
            <InfoRow label={t('employees.phoneNumber')} value={employee.phone} />
            <InfoRow label={t('employees.username')} value={employee.username} />
            {isAdmin && (
              <InfoRow label={t('employees.password')} value={employee.password} />
            )}
          </CardContent>
        </Card>

        {/* Work Information */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Building className="w-5 h-5" />
              {t('employees.workInfo')}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <InfoRow label={t('employees.department')} value={isRTL ? employee.department_ar : employee.department_en} />
            <InfoRow label={t('employees.status')} value={getStatusBadge(employee.status)} />
            <InfoRow label={t('employees.contractType')} value={employee.contract_type} />
            <InfoRow label={t('employees.firstDayOfWork')} value={formatDate(employee.first_day_of_work)} />
            <InfoRow label={t('employees.lastLogin')} value={formatDate(employee.last_login)} />
            <InfoRow label={t('employees.accountActivationDate')} value={formatDate(employee.account_activation_date)} />
            <InfoRow label={t('employees.accountCloseDate')} value={formatDate(employee.account_close_date)} />
          </CardContent>
        </Card>

        {/* Salary & Allowances */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <DollarSign className="w-5 h-5" />
              {t('employees.salaryInfo')}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <InfoRow label={t('employees.basicSalary')} value={employee.basic_salary ? `${employee.basic_salary} AED` : null} />
            <InfoRow label={t('employees.housingAllowance')} value={employee.housing_allowance ? `${employee.housing_allowance} AED` : null} />
            <InfoRow label={t('employees.transportationAllowance')} value={employee.transportation_allowance ? `${employee.transportation_allowance} AED` : null} />
            <InfoRow label={t('employees.anotherAllowance')} value={employee.another_allowance ? `${employee.another_allowance} AED` : null} />
          </CardContent>
        </Card>

        {/* Bank Information */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Building className="w-5 h-5" />
              {t('employees.bankInfo')}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <InfoRow label={t('employees.bankName')} value={employee.bank_name} />
            <InfoRow label={t('employees.iban')} value={employee.iban} />
            <InfoRow label={t('employees.accountNumber')} value={employee.account_number} />
            <InfoRow label={t('employees.payType')} value={employee.pay_type} />
          </CardContent>
        </Card>

        {/* Documents Information */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <FileText className="w-5 h-5" />
              {t('employees.documentsInfo')}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <InfoRow label={t('employees.residenceExpiryDate')} value={formatDate(employee.residence_end_date)} />
            <InfoRow label={t('employees.identityExpiryDate')} value={formatDate(employee.id_end_date)} />
            <InfoRow label={t('employees.passportExpiryDate')} value={formatDate(employee.passport_end_date)} />
            <InfoRow label={t('employees.workPermitExpiryDate')} value={formatDate(employee.labor_card_end_date)} />
            <InfoRow label={t('employees.insuranceExpiryDate')} value={formatDate(employee.health_insurance_end_date)} />
            <InfoRow label={t('employees.contractExpiryDate')} value={formatDate(employee.contract_end_date)} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default BasicInfoTab;
