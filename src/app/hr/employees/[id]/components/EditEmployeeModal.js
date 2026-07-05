"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { CircleX, Loader2, Edit } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTranslations } from "@/hooks/useTranslations";
import { getEmployeeById, updateEmployee } from '@/app/services/api/employees';
import { toast } from 'react-toastify';
import useSWR, { mutate } from 'swr';
import EmployeeInfoTab from '../../add-employee/EmployeeInfoTab';

// Custom Modal Component
const Modal = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div className="relative z-10 bg-white dark:bg-black rounded-lg shadow-2xl max-h-[90vh] overflow-y-auto w-full max-w-4xl">
        {children}
      </div>
    </div>
  );
};

// Credentials Display Modal
const CredentialsDisplayModal = ({ isOpen, onClose, username, password }) => {
  const { isRTL, language } = useLanguage();
  const { t } = useTranslations();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal Content */}
      <div 
        className="relative z-10 bg-white dark:bg-slate-900 border border-border rounded-xl shadow-2xl w-full max-w-md p-6" 
        dir={isRTL ? "rtl" : "ltr"}
      >
        <h3 className="text-lg font-bold text-foreground mb-4">
          {t('employees.newCredentials') || 'بيانات الدخول للموظف'}
        </h3>
        <p className="text-sm text-muted-foreground mb-4">
          {t('employees.credentialsSaveWarning') || 'تم حفظ بيانات الموظف بنجاح. يرجى حفظ اسم المستخدم وكلمة المرور أدناه لاستخدامها في تسجيل الدخول:'}
        </p>
        
        <div className="space-y-3 bg-muted p-4 rounded-lg mb-6 border border-border">
          <div>
            <span className="text-xs text-muted-foreground block">{t('employees.username') || 'اسم المستخدم'}</span>
            <div className="flex justify-between items-center mt-1">
              <span className="font-mono text-sm font-semibold text-foreground select-all">{username}</span>
              <button 
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(username);
                  toast.success(t('common.copied') || 'تم النسخ بنجاح');
                }}
                className="text-xs text-primary hover:underline"
              >
                {t('common.copy') || 'نسخ'}
              </button>
            </div>
          </div>
          <div className="border-t border-border pt-2">
            <span className="text-xs text-muted-foreground block">{t('employees.password') || 'كلمة المرور'}</span>
            <div className="flex justify-between items-center mt-1">
              <span className="font-mono text-sm font-semibold text-foreground select-all">{password}</span>
              <button 
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(password);
                  toast.success(t('common.copied') || 'تم النسخ بنجاح');
                }}
                className="text-xs text-primary hover:underline"
              >
                {t('common.copy') || 'نسخ'}
              </button>
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <Button onClick={onClose} className="px-6">
            {t('buttons.close') || t('common.close') || 'إغلاق'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default function EditEmployeeModal({ employeeId, onUpdate }) {
  const { isRTL, language } = useLanguage();
  const { t } = useTranslations();

  const [isOpen, setIsOpen] = useState(false);
  const [credentials, setCredentials] = useState(null);
  const [showCredentials, setShowCredentials] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [form, setForm] = useState({
    name: "",
    username: "",
    email: "",
    password: "",
    roleId: "",
    departmentId: "",
    branchId: "",
    status: 'active',
    identityNumber: "",
    passportNumber: "",
    employeeNumber: "",
    basicSalary: "",
    directManagerId: "",
    phoneNumber: "",
    identityExpiryDate: "",
    passportExpiryDate: "",
    residenceExpiryDate: "",
    insuranceExpiryDate: "",
    contractExpiryDate: "",
    workPermitExpiryDate: "",
    accountCloseDate: "",
    anotherAllowance: "",
    accountActivationDate: "",
    firstDayOfWork: "",
    housingAllowance: "",
    transportationAllowance: "",
    payType: "",
    iban: "",
    accountNumber: "",
    bankName: "",
    contractType: "",
    registrationExpirationDate: "",
    hourlyRate: ""
  });
  const [errors, setErrors] = useState({});

  // Fetch employee data when modal opens
  const { data, error, isLoading } = useSWR(
    isOpen && employeeId ? [`/employees/`, employeeId] : null,
    ([, id]) => getEmployeeById(id),
    {
      revalidateOnFocus: false,
    }
  );

  // Format date from database to input format (YYYY-MM-DD)
  const formatDateForInput = (dateString) => {
    if (!dateString) return "";
    try {
      const date = new Date(dateString);
      return date.toISOString().split('T')[0];
    } catch (error) {
      return "";
    }
  };

  // Populate form when data is loaded
  useEffect(() => {
    if (data?.data) {
      const employee = data.data;
      setForm({
        name: employee.name || "",
        username: employee.username || "",
        email: employee.email || "",
        password: employee.password || "",
        roleId: employee.roleId ? String(employee.roleId) : (employee.role_id ? String(employee.role_id) : ""),
        departmentId: employee.departmentId ? String(employee.departmentId) : (employee.department_id ? String(employee.department_id) : ""),
        branchId: employee.branchId ? String(employee.branchId) : (employee.branch_id ? String(employee.branch_id) : ""),
        status: employee.status || 'active',
        identityNumber: employee.identityNumber || employee.eId || "",
        passportNumber: employee.passportNumber || employee.passport || "",
        employeeNumber: employee.employeeNumber || employee.job_id || "",
        basicSalary: employee.basicSalary || employee.basic_salary || "",
        directManagerId: employee.directManagerId ? String(employee.directManagerId) : (employee.direct_manager_id ? String(employee.direct_manager_id) : ""),
        phoneNumber: employee.phoneNumber || employee.phone || "",
        identityExpiryDate: formatDateForInput(employee.identityExpiryDate || employee.id_end_date),
        passportExpiryDate: formatDateForInput(employee.passportExpiryDate || employee.passport_end_date),
        residenceExpiryDate: formatDateForInput(employee.residenceExpiryDate || employee.residence_end_date),
        insuranceExpiryDate: formatDateForInput(employee.insuranceExpiryDate || employee.health_insurance_end_date),
        contractExpiryDate: formatDateForInput(employee.contractExpiryDate || employee.contract_end_date),
        workPermitExpiryDate: formatDateForInput(employee.workPermitExpiryDate || employee.labor_card_end_date),
        accountCloseDate: formatDateForInput(employee.accountCloseDate || employee.account_close_date),
        anotherAllowance: employee.anotherAllowance || employee.another_allowance || "",
        accountActivationDate: formatDateForInput(employee.accountActivationDate || employee.account_activation_date),
        firstDayOfWork: formatDateForInput(employee.firstDayOfWork || employee.first_day_of_work),
        housingAllowance: employee.housingAllowance || employee.housing_allowance || "",
        transportationAllowance: employee.transportationAllowance || employee.transportation_allowance || "",
        payType: employee.payType || employee.pay_type || "",
        iban: employee.iban || "",
        accountNumber: employee.accountNumber || employee.account_number || "",
        bankName: employee.bankName || employee.bank_name || "",
        contractType: employee.contractType || employee.contract_type || "",
        registrationExpirationDate: formatDateForInput(employee.registrationExpirationDate || employee.registration_expiration_date),
        hourlyRate: employee.hourlyRate || employee.hourly_rate || ""
      });
    }
  }, [data]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Clear error for this field
    if (errors && errors[name]) {
      setErrors(prev => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
    
    // If employeeNumber changes, update username as well
    if (name === 'employeeNumber') {
      setForm({ ...form, [name]: value, username: value });
      if (errors && errors['username']) {
        setErrors(prev => {
          const next = { ...prev };
          delete next['username'];
          return next;
        });
      }
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    const requiredFields = [
      { field: 'name', message: t('validation.nameRequired') || 'Name is required' },
      { field: 'username', message: t('validation.usernameRequired') || 'Username is required' },
      { field: 'email', message: t('validation.emailRequired') || 'Email is required' },
      { field: 'roleId', message: t('validation.roleRequired') || 'Role is required' },
      { field: 'departmentId', message: t('validation.departmentRequired') || 'Department is required' },
      { field: 'branchId', message: t('validation.branchRequired') || 'Branch is required' },
      { field: 'phoneNumber', message: t('validation.phoneRequired') || 'Phone number is required' }
    ];

    for (const { field, message } of requiredFields) {
      if (!form[field] || form[field].toString().trim() === '') {
        newErrors[field] = message;
      }
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (form.email && !emailRegex.test(form.email)) {
      newErrors.email = t('validation.emailInvalid') || 'Please enter a valid email address';
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      toast.error(t('validation.pleaseCheckRequiredFields') || 'Please check the required fields', { autoClose: 10000 });
      return false;
    }

    return true;
  };

  const handleCredentialsClose = () => {
    setShowCredentials(false);
    setIsOpen(false);
    setErrors({});
  };

  const handleSubmit = async () => {
    if (isSaving) return; // Prevent multiple submissions
    
    // Validate form before submission
    if (!validateForm()) {
      return;
    }
    
    setIsSaving(true);
    
    try {
      const response = await updateEmployee(employeeId, form);
      
      if (response.success) {
        toast.success(t('messages.employeeUpdatedSuccessfully') || 'Employee updated successfully!');
        
        // Revalidate the employee data in the parent component
        mutate(`/employees/${employeeId}`);
        
        if (onUpdate) onUpdate(response);
        
        // If a new password was set, show the credential modal
        if (response.data?.plainPassword) {
          setCredentials({
            username: response.data.username || form.username,
            password: response.data.plainPassword
          });
          setShowCredentials(true);
        } else {
          setIsOpen(false);
          setErrors({});
        }
      } else {
        const msg = response.message || t('messages.errorUpdatingEmployee') || 'خطأ في تحديث بيانات الموظف. يرجى المحاولة مرة أخرى.';
        toast.error(msg, { autoClose: 10000 });
      }
    } catch (error) {
      const backendMsg = error.message || '';

      // Map backend duplicate errors to inline field errors
      const newErrors = {};
      if (backendMsg.includes('same name') || backendMsg.includes('نفس الاسم')) {
        newErrors.name = t('validation.nameTaken') || 'هذا الاسم مستخدم بالفعل لموظف آخر';
      }
      if (backendMsg.includes('same phone') || backendMsg.includes('نفس رقم الهاتف')) {
        newErrors.phoneNumber = t('validation.phoneTaken') || 'رقم الهاتف مستخدم بالفعل لموظف آخر';
      }
      if (backendMsg.includes('same email') || backendMsg.includes('نفس البريد')) {
        newErrors.email = t('validation.emailTaken') || 'البريد الإلكتروني مستخدم بالفعل لموظف آخر';
      }
      if (backendMsg.includes('same username') || backendMsg.includes('نفس اسم المستخدم')) {
        newErrors.username = t('validation.usernameTaken') || 'اسم المستخدم مستخدم بالفعل لموظف آخر';
      }
      if (backendMsg.includes('same employee number') || backendMsg.includes('نفس رقم الموظف')) {
        newErrors.employeeNumber = t('validation.employeeNumberTaken') || 'رقم الموظف مستخدم بالفعل';
      }
      if (backendMsg.includes('مكررة') || backendMsg.includes('duplicate')) {
        newErrors.name = t('validation.duplicateData') || 'بيانات مكررة';
      }

      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
        toast.error(t('validation.duplicateDataFound') || 'توجد بيانات مكررة — يرجى مراجعة الحقول المميزة باللون الأحمر', { autoClose: 10000 });
      } else {
        const displayMsg = backendMsg.replace(/^Failed to update employee:\s*/i, '').replace(/^خطأ في تحديث الموظف:\s*/i, '');
        toast.error(displayMsg || t('messages.errorUpdatingEmployee') || 'خطأ في تحديث بيانات الموظف. يرجى المحاولة مرة أخرى.', { autoClose: 10000 });
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleClose = () => {
    if (isSaving) return;
    setIsOpen(false);
    setErrors({});
  };

  const handleOpen = () => {
    setIsOpen(true);
  };

  return (
    <>
      {/* Trigger Button */}
      <Button 
        onClick={handleOpen}
        variant="outline"
      >
        <Edit className="w-4 h-4" />
        {t('employees.editEmployee')}
      </Button>

      {/* Modal */}
      <Modal isOpen={isOpen} onClose={handleClose}>
        {isSaving && (
          <div className="absolute inset-0 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xs z-50 flex flex-col items-center justify-center gap-4">
            <Loader2 className="w-10 h-10 animate-spin text-primary" />
            <span className="text-lg font-medium text-foreground">
              {t('employees.savingEmployee') || 'جاري حفظ بيانات الموظف...'}
            </span>
          </div>
        )}
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold">{t('employees.editEmployee')}</h2>
          <button 
            onClick={handleClose}
            disabled={isSaving}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors disabled:opacity-50"
          >
            <CircleX className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6">
          {isLoading && (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
              <span className="me-2">{t('common.loading')}</span>
            </div>
          )}

          {error && (
            <div className="flex items-center justify-center py-8 text-destructive">
              <p>{t('common.errorLoading')}</p>
            </div>
          )}

          {!isLoading && !error && (
            <EmployeeInfoTab 
              form={form} 
              handleChange={handleChange} 
              setForm={setForm} 
              errors={errors}
            />
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex justify-end gap-3 p-6 border-t">
          <Button 
            variant="outline" 
            onClick={handleClose}
            disabled={isSaving}
            className="px-6"
          >
            {t('buttons.cancel')}
          </Button>
          <Button 
            onClick={handleSubmit}
            disabled={isSaving || isLoading}
            className="px-6"
          >
            {isSaving && <Loader2 className="me-2 h-4 w-4 animate-spin" />}
            {isSaving ? t('common.saving') : t('common.save')}
          </Button>
        </div>
      </Modal>

      {credentials && (
        <CredentialsDisplayModal
          isOpen={showCredentials}
          onClose={handleCredentialsClose}
          username={credentials.username}
          password={credentials.password}
        />
      )}
    </>
  );
}
