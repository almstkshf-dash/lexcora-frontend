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

// ─── Initial Form State ─────────────────────────────────────────────────────
const INITIAL_FORM = {
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
};

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
    <div className="fixed inset-0 z-40 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal Content */}
      <div
        className="relative z-50 bg-white dark:bg-slate-900 rounded-xl shadow-2xl max-h-[90vh] overflow-y-auto w-full max-w-4xl border border-border"
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
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
          {t('employees.credentialsSaveWarning') || 'تم حفظ بيانات الموظف بنجاح. يرجى حفظ اسم المستخدم وكلمة المرور أدناه لاستخدامهما في تسجيل الدخول.'}
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

export default function AddEmployeeModal({ onAdd }) {
  const { isRTL, language } = useLanguage();
  const { t } = useTranslations();

  const [isOpen, setIsOpen] = useState(false);
  const [credentials, setCredentials] = useState(null);
  const [showCredentials, setShowCredentials] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [tab, setTab] = useState("info");
  const [form, setForm] = useState(INITIAL_FORM);
  const [errors, setErrors] = useState({});

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

    // If employeeNumber changes, sync username as well (functional update avoids stale closure)
    if (name === 'employeeNumber') {
      setForm(prev => ({ ...prev, [name]: value, username: value }));
      if (errors && errors['username']) {
        setErrors(prev => {
          const next = { ...prev };
          delete next['username'];
          return next;
        });
      }
    } else {
      setForm(prev => ({ ...prev, [name]: value }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    const requiredFields = [
      { field: 'name', message: t('validation.nameRequired') || 'الاسم مطلوب' },
      { field: 'username', message: t('validation.usernameRequired') || 'اسم المستخدم مطلوب' },
      // { field: 'email', message: t('validation.emailRequired') || 'البريد الإلكتروني مطلوب' },
      { field: 'roleId', message: t('validation.roleRequired') || 'المنصب مطلوب' },
      { field: 'departmentId', message: t('validation.departmentRequired') || 'القسم مطلوب' },
      { field: 'branchId', message: t('validation.branchRequired') || 'الفرع مطلوب' },
      { field: 'phoneNumber', message: t('validation.phoneRequired') || 'رقم الهاتف مطلوب' },
      { field: 'password', message: t('validation.passwordRequired') || 'كلمة المرور مطلوبة' }
    ];

    for (const { field, message } of requiredFields) {
      if (!form[field] || form[field].toString().trim() === '') {
        newErrors[field] = message;
      }
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      // Switch back to "info" tab if any field inside "info" is missing
      const infoFields = ['name', 'username', 'roleId', 'departmentId', 'branchId', 'phoneNumber', 'password'];
      const hasInfoErrors = infoFields.some(f => newErrors[f]);
      if (hasInfoErrors) {
        setTab("info");
      }
      toast.error(t('validation.pleaseCheckRequiredFields') || 'يرجى ملء الحقول المطلوبة', { autoClose: 10000 });
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
      // Check for duplicates
      const duplicateCheck = await checkDuplicateEmployee(
        form.name,
        form.phoneNumber,
        form.email,
        form.username,
        form.employeeNumber
      );

      if (duplicateCheck.success && duplicateCheck.data?.isDuplicate) {
        const duplicate = duplicateCheck.data.duplicate;
        let duplicateMessage;

        if (duplicate.name === form.name && duplicate.phone === form.phoneNumber) {
          duplicateMessage = t('employees.duplicateEmployeeExists') || 'يوجد موظف بنفس الاسم ورقم الهاتف بالفعل';
        } else if (duplicate.name === form.name) {
          duplicateMessage = t('employees.duplicateNameExists') || 'يوجد موظف بنفس الاسم بالفعل';
        } else if (duplicate.phone === form.phoneNumber) {
          duplicateMessage = t('employees.duplicatePhoneExists') || 'يوجد موظف بنفس رقم الهاتف بالفعل';
        } else if (duplicate.email === form.email) {
          duplicateMessage = t('employees.duplicateEmailExists') || 'يوجد موظف بنفس البريد الإلكتروني بالفعل';
        } else if (duplicate.username === form.username) {
          duplicateMessage = t('employees.duplicateUsernameExists') || 'يوجد موظف بنفس اسم المستخدم بالفعل';
        } else if (duplicate.employeeNumber === form.employeeNumber) {
          duplicateMessage = t('employees.duplicateEmployeeNumberExists') || 'يوجد موظف بنفس رقم الموظف بالفعل';
        } else {
          duplicateMessage = t('employees.duplicateGenericExists') || 'بيانات مكررة لموظف آخر';
        }

        toast.error(duplicateMessage, { autoClose: 10000 });
        setIsSaving(false);
        return;
      }

      const response = await createEmployee(form);

      if (response.success) {
        toast.success(response.message || t('messages.employeeCreatedSuccessfully') || 'تم إنشاء الموظف بنجاح!');

        if (onAdd) onAdd(response);

        // Close the add modal immediately so the background is clean
        setIsOpen(false);

        const createdEmp = response.data;
        if (createdEmp?.password && createdEmp?.password !== '********') {
          setCredentials({
            username: createdEmp.username,
            password: createdEmp.password
          });
          setShowCredentials(true);
        } else {
          setForm(INITIAL_FORM);
          setTab("info");
          setErrors({});
        }
      } else {
        // Show the real backend message (non-throw path)
        const msg = response.message || t('messages.errorCreatingEmployee') || 'خطأ في إنشاء الموظف. يرجى المحاولة مرة أخرى.';
        toast.error(msg, { autoClose: 10000 });
      }
    } catch (error) {
      // Safely ensure backendMsg is a string to prevent includes() crash on object type messages
      const rawMsg = error.message;
      const backendMsg = typeof rawMsg === 'string' 
        ? rawMsg 
        : (rawMsg ? JSON.stringify(rawMsg) : '');

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

      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
        setTab("info");
        toast.error(t('validation.duplicateDataFound') || 'توجد بيانات مكررة — يرجى مراجعة الحقول المميزة باللون الأحمر', { autoClose: 10000 });
      } else {
        // Show the actual backend error message
        const displayMsg = backendMsg.replace(/^Failed to add employee:\s*/i, '').replace(/^خطأ في إضافة الموظف:\s*/i, '');
        toast.error(displayMsg || t('messages.errorCreatingEmployee') || 'خطأ في إنشاء الموظف. يرجى المحاولة مرة أخرى.', { autoClose: 10000 });
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

  const handleCredentialsClose = () => {
    setShowCredentials(false);
    setForm(INITIAL_FORM);
    setTab("info");
    setErrors({});
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
        <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }} className="flex flex-col h-full">
          {isSaving && (
            <div className="absolute inset-0 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xs z-50 flex flex-col items-center justify-center gap-4">
              <Loader2 className="w-10 h-10 animate-spin text-primary" />
              <span className="text-lg font-medium text-foreground">
                {t('employees.savingEmployee') || 'جاري حفظ بيانات الموظف...'}
              </span>
            </div>
          )}
          {/* Modal Header */}
          <div className="flex items-center justify-between p-6 border-b " >
            <h2 className="text-xl font-semibold">{t('employees.addNewTitle')}</h2>
            <button
              type="button"
              onClick={handleClose}
              disabled={isSaving}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors disabled:opacity-50"
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
                  errors={errors}
                  isEdit={false}
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
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isSaving}
              className="px-6"
            >
              {t('buttons.cancel')}
            </Button>
            <Button
              type="submit"
              disabled={isSaving}
              className="px-6"
            >
              {isSaving && <Loader2 className="me-2 h-4 w-4 animate-spin" />}
              {isSaving ? (t('buttons.saving') || 'Saving...') : t('buttons.save')}
            </Button>
          </div>
        </form>
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
