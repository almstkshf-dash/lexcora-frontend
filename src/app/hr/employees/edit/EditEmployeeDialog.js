"use client";

import { useState, useEffect } from 'react';
import useSWR from 'swr';
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getEmployeeById, updateEmployee, getEmployees } from '@/app/services/api/employees';
import { getRoles } from '@/app/services/api/roles';
import { getDepartments } from '@/app/services/api/departments';
import { getBranches } from '@/app/services/api/branches';
import { useTranslations } from '@/hooks/useTranslations';
import { useLanguage } from '@/contexts/LanguageContext';
import PersonalInfoTab from './PersonalInfoTab';
import ContactInfoTab from './ContactInfoTab';
import WorkInfoTab from './WorkInfoTab';
import DocumentsInfoTab from './DocumentsInfoTab';
import { 
  User, 
  Mail, 
  Phone, 
  Building, 
  IdCard, 
  Calendar,
  DollarSign,
  FileText,
  AlertCircle,
  Loader2,
  X,
  Save,
  Minus
} from 'lucide-react';

const EditEmployeeDialog = ({ employeeId, trigger, onSuccess }) => {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
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

  // Fetch roles and departments for dropdowns
  const { data: rolesResponse, isLoading: rolesLoading } = useSWR('roles', getRoles);
  const { data: departmentsResponse, isLoading: departmentsLoading } = useSWR('departments', getDepartments);
  const { data: branchesResponse, isLoading: branchesLoading } = useSWR('branches', getBranches);
  const { data: managersResponse, isLoading: managersLoading } = useSWR('managers', getEmployees);

  const employee = data?.data;
  const roles = rolesResponse?.success ? rolesResponse.data : [];
  const departments = departmentsResponse?.success ? departmentsResponse.data : [];
  const branches = branchesResponse?.success ? branchesResponse.data : [];
  const managers = managersResponse?.success ? managersResponse.data : [];

  // Initialize form data when employee data is loaded
  useEffect(() => {
    if (employee) {
      setFormData({
        name: employee.name || '',
        job_id: employee.job_id || '',
        role_id: employee.role_id || '',
        email: employee.email || '',
        phone: employee.phone || '',
        username: employee.username || '',
        department_id: employee.department_id || '',
        eId: employee.eId || '',
        passport: employee.passport || '',
        branch_id: employee.branch_id || '',
        direct_manager_id: employee.direct_manager_id || 'none',
        password: '', // Keep empty for security
        residence_end_date: employee.residence_end_date ? employee.residence_end_date.split('T')[0] : '',
        id_end_date: employee.id_end_date ? employee.id_end_date.split('T')[0] : '',
        passport_end_date: employee.passport_end_date ? employee.passport_end_date.split('T')[0] : '',
        labor_card_end_date: employee.labor_card_end_date ? employee.labor_card_end_date.split('T')[0] : '',
        health_insurance_end_date: employee.health_insurance_end_date ? employee.health_insurance_end_date.split('T')[0] : '',
        contract_end_date: employee.contract_end_date ? employee.contract_end_date.split('T')[0] : '',
        registration_expiration_date: employee.registration_expiration_date ? employee.registration_expiration_date.split('T')[0] : '',
        basic_salary: employee.basic_salary || '',
        hourly_rate: employee.hourly_rate || '',
        status: employee.status || 'active'
      });
    }
  }, [employee]);

  const handleInputChange = (name, value) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setSubmitError(''); // Clear error when user starts typing
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError('');

    try {
      // Create a copy of form data and remove empty password
      const submitData = { ...formData };
      if (!submitData.password || submitData.password.trim() === '') {
        delete submitData.password;
      }

      await updateEmployee(employeeId, submitData);
      setOpen(false);
      if (onSuccess) onSuccess();
    } catch (error) {

      setSubmitError(error.response?.data?.message || t('employees.errorUpdating'));
    } finally {
      setIsSubmitting(false);
    }
  };

  // Close modal when ESC key is pressed
  useEffect(() => {
    const handleEscapeKey = (event) => {
      if (event.key === 'Escape' && open) {
        setOpen(false);
      }
    };

    if (open) {
      document.addEventListener('keydown', handleEscapeKey);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscapeKey);
      document.body.style.overflow = 'unset';
    };
  }, [open]);

  return (
    <>
      {/* Trigger */}
      <div onClick={() => {
        if (!employeeId) {

          return;
        }
        setOpen(true);
      }}>
        {trigger}
      </div>

      {/* Modal */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />
          
          {/* Modal Content */}
          <div 
            className="relative bg-white rounded-lg shadow-xl max-w-5xl w-full mx-4 max-h-[90vh] overflow-hidden flex flex-col"
            dir={isRTL ? 'rtl' : 'ltr'}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b">
              <div className="flex items-center gap-2">
                <User className="w-5 h-5" />
                <h2 className="text-lg font-semibold">{t('employees.editEmployee')}</h2>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="p-1 rounded-full hover:bg-gray-100 transition-colors"
              >
                <Minus className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {!employeeId && (
                <div className="flex items-center justify-center py-8 text-red-600">
                  <AlertCircle className="w-6 h-6 mr-2" />
                  {t('employees.missingEmployeeId')}
                </div>
              )}

              {employeeId && isLoading && (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin mr-2" />
                  {t('employees.loadingEmployeeDetails')}
                </div>
              )}

              {employeeId && error && (
                <div className="flex items-center justify-center py-8 text-red-600">
                  <AlertCircle className="w-6 h-6 mr-2" />
                  {t('employees.errorLoadingDetails')}
                </div>
              )}

              {employeeId && !isLoading && !error && !employee && open && (
                <div className="flex items-center justify-center py-8 text-muted-foreground">
                  <AlertCircle className="w-6 h-6 mr-2" />
                  {t('employees.noEmployeeFound')}
                </div>
              )}

              {employeeId && employee && (
                <form onSubmit={handleSubmit} className="space-y-6">
                  {submitError && (
                    <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                      <div className="flex items-center gap-2 text-red-600">
                        <AlertCircle className="w-5 h-5" />
                        <span>{submitError}</span>
                      </div>
                    </div>
                  )}

                  <Tabs dir={isRTL ? "rtl" : "ltr"} defaultValue="personal" className="w-full">
                    <TabsList className="grid w-full grid-cols-4">
                      <TabsTrigger value="personal" className="flex items-center gap-2">
                        <User className="w-4 h-4" />
                        {t('employees.personalInfo')}
                      </TabsTrigger>
                      <TabsTrigger value="contact" className="flex items-center gap-2">
                        <Mail className="w-4 h-4" />
                        {t('employees.contactInfo')}
                      </TabsTrigger>
                      <TabsTrigger value="work" className="flex items-center gap-2">
                        <Building className="w-4 h-4" />
                        {t('employees.workInfo')}
                      </TabsTrigger>
                      <TabsTrigger value="documents" className="flex items-center gap-2">
                        <FileText className="w-4 h-4" />
                        {t('employees.documentsInfo')}
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="personal" className="mt-6">
                      <PersonalInfoTab 
                        formData={formData} 
                        handleInputChange={handleInputChange} 
                      />
                    </TabsContent>

                    <TabsContent value="contact" className="mt-6">
                      <ContactInfoTab 
                        formData={formData} 
                        handleInputChange={handleInputChange} 
                      />
                    </TabsContent>

                    <TabsContent value="work" className="mt-6">
                      <WorkInfoTab 
                        formData={formData} 
                        handleInputChange={handleInputChange}
                        departments={departments}
                        roles={roles}
                        branches={branches}
                        managers={managers}
                        employeeId={employeeId}
                      />
                    </TabsContent>

                    <TabsContent value="documents" className="mt-6">
                      <DocumentsInfoTab 
                        formData={formData} 
                        handleInputChange={handleInputChange} 
                      />
                    </TabsContent>
                  </Tabs>
                </form>
              )}
            </div>

            {/* Footer */}
            {employeeId && employee && (
              <div className="flex justify-end gap-3 p-6 border-t bg-gray-50">
                <Button 
                  type="button"
                  variant="outline" 
                  onClick={() => setOpen(false)}
                  disabled={isSubmitting}
                >
                  {t('common.cancel')}
                </Button>
                <Button 
                  type="button"
                  onClick={handleSubmit}
                  disabled={isSubmitting || rolesLoading || departmentsLoading || branchesLoading || managersLoading}
                  className="flex items-center gap-2"
                >
                  {isSubmitting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  {isSubmitting ? t('common.saving') : t('common.save')}
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default EditEmployeeDialog;