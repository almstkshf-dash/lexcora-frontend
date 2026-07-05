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

export default function EditEmployeeModal({ employeeId, onUpdate }) {
  const { isRTL, language } = useLanguage();
  const { t } = useTranslations();

  const [isOpen, setIsOpen] = useState(false);
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
        roleId: employee.role_id ? String(employee.role_id) : "",
        departmentId: employee.department_id ? String(employee.department_id) : "",
        branchId: employee.branch_id ? String(employee.branch_id) : "",
        status: employee.status || 'active',
        identityNumber: employee.eId || "",
        passportNumber: employee.passport || "",
        employeeNumber: employee.job_id || "",
        basicSalary: employee.basic_salary || "",
        directManagerId: employee.direct_manager_id ? String(employee.direct_manager_id) : "",
        phoneNumber: employee.phone || "",
        identityExpiryDate: formatDateForInput(employee.id_end_date),
        passportExpiryDate: formatDateForInput(employee.passport_end_date),
        residenceExpiryDate: formatDateForInput(employee.residence_end_date),
        insuranceExpiryDate: formatDateForInput(employee.health_insurance_end_date),
        contractExpiryDate: formatDateForInput(employee.contract_end_date),
        workPermitExpiryDate: formatDateForInput(employee.labor_card_end_date),
        accountCloseDate: formatDateForInput(employee.account_close_date),
        anotherAllowance: employee.another_allowance || "",
        accountActivationDate: formatDateForInput(employee.account_activation_date),
        firstDayOfWork: formatDateForInput(employee.first_day_of_work),
        housingAllowance: employee.housing_allowance || "",
        transportationAllowance: employee.transportation_allowance || "",
        payType: employee.pay_type || "",
        iban: employee.iban || "",
        accountNumber: employee.account_number || "",
        bankName: employee.bank_name || "",
        contractType: employee.contract_type || "",
        registrationExpirationDate: formatDateForInput(employee.registration_expiration_date),
        hourlyRate: employee.hourly_rate || ""
      });
    }
  }, [data]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // If employeeNumber changes, update username as well
    if (name === 'employeeNumber') {
      setForm({ ...form, [name]: value, username: value });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const validateForm = () => {
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
        toast.error(message);
        return false;
      }
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.email)) {
      toast.error(t('validation.emailInvalid') || 'Please enter a valid email address');
      return false;
    }

    return true;
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
        
        // Close modal on success
        setIsOpen(false);
      } else {
        toast.error(t('messages.errorUpdatingEmployee') || 'Error updating employee. Please try again.');
      }
    } catch (error) {
      toast.error(t('messages.errorUpdatingEmployee') || 'Error updating employee. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleClose = () => {
    setIsOpen(false);
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
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold">{t('employees.editEmployee')}</h2>
          <button 
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
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
            />
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex justify-end gap-3 p-6 border-t">
          <Button 
            variant="outline" 
            onClick={handleClose}
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
    </>
  );
}
