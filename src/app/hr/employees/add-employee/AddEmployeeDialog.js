import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Plus, CircleX, Loader2 } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTranslations } from "@/hooks/useTranslations";
import { useIsClient } from "@/hooks/useIsClient";
import { createEmployee, checkDuplicateEmployee } from '@/app/services/api/employees';
import { toast } from 'react-toastify';
import EmployeeInfoTab from './EmployeeInfoTab';
import EmployeePermissionsTab from './EmployeePermissionsTab';
import EmployeeDocumentsTab from './EmployeeDocumentsTab';

// Custom Modal Component
const Modal = ({ isOpen, onClose, children }) => {
  const isClient = useIsClient();
  
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen || !isClient) return null;

  const modalContent = (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div 
        className="relative z-10 bg-white dark:bg-slate-900 rounded-xl shadow-2xl max-h-[90vh] overflow-y-auto w-full max-w-4xl border border-border"
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

export default function AddEmployeeModal({ onAdd }) {
  const { isRTL, language } = useLanguage();
  const { t } = useTranslations();

  const [isOpen, setIsOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [tab, setTab] = useState("info");
  const [form, setForm] = useState({
    name: "",
    username: "",
    email: "",
    password: "",
    roleId: "",
    departmentId: "",
    branchId: "",
    status: 'active',
    permissions: [],
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
      // { field: 'email', message: t('validation.emailRequired') || 'Email is required' },
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

    // // Email validation
    // const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    // if (!emailRegex.test(form.email)) {
    //   toast.error(t('validation.emailInvalid') || 'Please enter a valid email address');
    //   return false;
    // }

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
      // Check for duplicates
      const duplicateCheck = await checkDuplicateEmployee(form.name, form.phoneNumber, form.email);
      
      if (duplicateCheck.success && duplicateCheck.isDuplicate) {
        const duplicate = duplicateCheck.duplicate;
        let duplicateMessage;
        
        if (duplicate.name === form.name && duplicate.phone === form.phoneNumber) {
          duplicateMessage = t('employees.duplicateEmployeeExists');
        } else if (duplicate.name === form.name) {
          duplicateMessage = t('employees.duplicateNameExists');
        } else if (duplicate.phone === form.phoneNumber) {
          duplicateMessage = t('employees.duplicatePhoneExists');
        } else if (duplicate.email === form.email) {
          duplicateMessage = t('employees.duplicateEmailExists');
        }
        
        toast.error(duplicateMessage);
        setIsSaving(false);
        return;
      }

      const response = await createEmployee(form);
      
      if (response.success) {
        toast.success(t('messages.employeeCreatedSuccessfully') || 'Employee created successfully!');
        
        if (onAdd) onAdd(response);
        
        // Close modal and reset form on success
        setIsOpen(false);
        setForm({
          name: "",
          username: "",
          email: "",
          password: "",
          roleId: "",
          departmentId: "",
          branchId: "",
          status: 'active',
          permissions: [],
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
        setTab("info");
      } else {

        toast.error(t('messages.errorCreatingEmployee') || 'Error creating employee. Please try again.');
      }
    } catch (error) {

      toast.error(t('messages.errorCreatingEmployee') || 'Error creating employee. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  return (
    <>
      {/* Trigger Button */}
      <Button 
        onClick={() => setIsOpen(true)}
      >
        <Plus className="w-4 h-4" />
        {t('employees.addNew')}
      </Button>

      {/* Modal */}
      <Modal isOpen={isOpen} onClose={handleClose}>
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b " >
          <h2 className="text-xl font-semibold">{t('employees.addNewTitle')}</h2>
          <button 
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <CircleX className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6" >
          <Tabs dir={isRTL ? "rtl" : "ltr"} value={tab} onValueChange={setTab} >
            <TabsList className="mb-4 flex gap-2" >
              <TabsTrigger value="info" className="cursor-pointer">{t('employees.information')}</TabsTrigger>
              <TabsTrigger value="permissions" className="cursor-pointer">{t('employees.permissions')}</TabsTrigger>
              {/* <TabsTrigger value="documents" className="cursor-pointer">{t('employees.documents') || '???????'}</TabsTrigger> */}
            </TabsList>
            
            <TabsContent value="info">
              <EmployeeInfoTab 
                form={form} 
                handleChange={handleChange} 
                setForm={setForm} 
              />
            </TabsContent>
            
            <TabsContent value="permissions">
              <EmployeePermissionsTab 
                form={form} 
                setForm={setForm} 
              />
            </TabsContent>
            
            {/* <TabsContent value="documents">
              <EmployeeDocumentsTab />
            </TabsContent> */}
          </Tabs>
        </div>

        {/* Modal Footer */}
        <div className="flex justify-end gap-3 p-6 border-t" >
          <Button 
            variant="outline" 
            onClick={handleClose}
            className="px-6"
          >
            {t('buttons.cancel')}
          </Button>
          <Button 
            onClick={handleSubmit}
            disabled={isSaving}
            className="px-6"
          >
            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isSaving ? (t('buttons.saving') || 'Saving...') : t('buttons.save')}
          </Button>
        </div>
      </Modal>
    </>
  );
}