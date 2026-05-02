import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Switch } from "@/components/ui/switch";
import { CalendarIcon, ChevronDownIcon } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTranslations } from "@/hooks/useTranslations";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { useSelector } from 'react-redux';
import useSWR from 'swr';
import { getRoles } from '@/app/services/api/roles';
import { getDepartments } from '@/app/services/api/departments';
import { getEmployees } from '@/app/services/api/employees';
import { getBranches } from '@/app/services/api/branches';

// DatePickerField Component
const DatePickerField = ({ name, placeholder, value, onChange, isRTL }) => {
  const [open, setOpen] = useState(false);
  
  const handleDateSelect = (date) => {
    if (date) {
      const formattedDate = format(date, "yyyy-MM-dd");
      onChange({
        target: {
          name: name,
          value: formattedDate
        }
      });
    } else {
      onChange({
        target: {
          name: name,
          value: ""
        }
      });
    }
    setOpen(false);
  };

  const selectedDate = value ? new Date(value) : undefined;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-full justify-between font-normal",
            !value && "text-muted-foreground"
          )}
        >
          {value ? selectedDate.toLocaleDateString() : placeholder}
          <ChevronDownIcon className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto overflow-hidden p-0" align="start">
        <Calendar
          mode="single"
          selected={selectedDate}
          captionLayout="dropdown"
          onSelect={handleDateSelect}
        />
      </PopoverContent>
    </Popover>
  );
};

// FormField Component with Label
const FormField = ({ label, children, required = false }) => (
  <div className="space-y-2">
    {label && (
      <Label className="text-sm font-medium">
        {label}
        {required && <span className="text-red-500 mr-1">*</span>}
      </Label>
    )}
    {children}
  </div>
);

export default function EmployeeInfoTab({ form, handleChange, setForm }) {
  const { isRTL, language } = useLanguage();
  const { t } = useTranslations();

  // Get employee role from Redux to check if user is admin
  const employeeRole = useSelector((state) => state.auth.roleEn);
  const isAdmin = employeeRole?.toLowerCase() === 'admin';

  // Fetch roles directly using SWR
  const { data: rolesData, error: rolesError, isLoading: rolesLoading } = useSWR('/roles', getRoles);
  const roles = rolesData?.success ? rolesData.data : [];

  // Fetch departments directly using SWR
  const { data: departmentsData, error: departmentsError, isLoading: departmentsLoading } = useSWR('/departments', getDepartments);
  const departments = departmentsData ? departmentsData.data : [];

  // Fetch employees for manager dropdown
  const { data: employeesData, error: employeesError, isLoading: employeesLoading } = useSWR('/employees', getEmployees);
  const employees = employeesData ? employeesData.data : [];

  // Fetch branches directly using SWR
  const { data: branchesData, error: branchesError, isLoading: branchesLoading } = useSWR('/branches', getBranches);
  const branches = branchesData?.success ? branchesData.data : [];

  return (
    <div className="space-y-8">
      {/* Basic Information Section */}
      <div>
        <h3 className="text-lg font-semibold mb-4 text-gray-700 dark:text-gray-300">{t('employees.basicInformationSection')}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4">
          <FormField label={t('employees.name')} required>
            <Input 
              name="name" 
              placeholder={t('employees.namePlaceholder')} 
              value={form.name} 
              onChange={handleChange} 
            />
          </FormField>
          
          <FormField label={t('employees.employeeNumber')} required>
            <Input 
              name="employeeNumber" 
              placeholder={t('employees.employeeNumberPlaceholder')} 
              value={form.employeeNumber} 
              onChange={handleChange} 
              
            />
          </FormField>

        
        
          <FormField label={t('employees.email')} >
            <Input 
              name="email" 
              placeholder={t('employees.emailPlaceholder')} 
              value={form.email} 
              onChange={handleChange} 
            />
          </FormField>
          
          <FormField label={t('employees.phoneNumber')} required>
            <Input 
              name="phoneNumber" 
              placeholder={t('employees.phonePlaceholder')} 
              type="tel"
              value={form.phoneNumber} 
              onChange={handleChange} 
            />
          </FormField>
        </div>
      </div>

      {/* Organizational Information Section */}
      <div>
        <h3 className="text-lg font-semibold mb-4 text-gray-700 dark:text-gray-300">{t('employees.organizationalInfo')}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4">
          <FormField label={t('employees.selectRole')} required>
            <Select dir={isRTL ? "rtl" : "ltr"} value={form.roleId} onValueChange={value => setForm(f => ({ ...f, roleId: value }))}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder={t('employees.selectRole')} />
              </SelectTrigger>
              <SelectContent>
                {rolesLoading ? (
                  <div className="p-2 text-center text-gray-500">{t('common.loading')}...</div>
                ) : rolesError ? (
                  <div className="p-2 text-center text-red-500">{t('common.error')}</div>
                ) : (
                  roles
                    .filter((role) => role.role_en?.toLowerCase() !== 'admin' && role.role_ar?.toLowerCase() !== 'admin')
                    .map((role) => (
                      <SelectItem key={role.id} value={role.id} className="cursor-pointer">
                        {language === 'ar' ? role.role_ar : role.role_en}
                      </SelectItem>
                    ))
                )}
              </SelectContent>
            </Select>
          </FormField>
          
          <FormField label={t('employees.selectDepartment')} required>
            <Select dir={isRTL ? "rtl" : "ltr"} value={form.departmentId} onValueChange={value => setForm(f => ({ ...f, departmentId: value }))}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder={t('employees.selectDepartment')} />
              </SelectTrigger>
              <SelectContent>
                {departmentsLoading ? (
                  <div className="p-2 text-center text-gray-500">{t('common.loading')}...</div>
                ) : departmentsError ? (
                  <div className="p-2 text-center text-red-500">{t('common.error')}</div>
                ) : (
                  departments.map((department) => (
                    <SelectItem key={department.id} value={department.id} className="cursor-pointer">
                      {language === 'ar' ? department.name_ar : department.name_en}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </FormField>
          
          <FormField label={t('employees.selectBranch')} required>
            <Select dir={isRTL ? "rtl" : "ltr"} value={form.branchId} onValueChange={value => setForm(f => ({ ...f, branchId: value }))}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder={t('employees.selectBranch')} />
              </SelectTrigger>
              <SelectContent>
                {branchesLoading ? (
                  <div className="p-2 text-center text-gray-500">{t('common.loading')}...</div>
                ) : branchesError ? (
                  <div className="p-2 text-center text-red-500">{t('common.error')}</div>
                ) : (
                  branches.map((branch) => (
                    <SelectItem key={branch.id} value={branch.id} className="cursor-pointer">
                      {language === 'ar' ? branch.name_ar : branch.name_en}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </FormField>
          
          <FormField label={t('employees.selectDirectManager')}>
            <Select dir={isRTL ? "rtl" : "ltr"} value={form.directManagerId} onValueChange={value => setForm(f => ({ ...f, directManagerId: value }))}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder={t('employees.selectDirectManager')} />
              </SelectTrigger>
              <SelectContent>
                {employeesLoading ? (
                  <div className="p-2 text-center text-gray-500">{t('common.loading')}...</div>
                ) : employeesError ? (
                  <div className="p-2 text-center text-red-500">{t('common.error')}</div>
                ) : (
                  employees.map((employee) => (
                    <SelectItem key={employee.id} value={employee.id} className="cursor-pointer">
                      {employee.name}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </FormField>
        </div>
      </div>

      {/* Employment Details Section */}
      <div>
        <h3 className="text-lg font-semibold mb-4 text-gray-700 dark:text-gray-300">{t('employees.employmentDetails')}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4">
          <FormField label={t('employees.contractType') || 'نوع العقد'}>
            <Select dir={isRTL ? "rtl" : "ltr"} value={form.contractType} onValueChange={value => setForm(f => ({ ...f, contractType: value }))}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder={t('employees.contractType') || 'نوع العقد'} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="كامل" className="cursor-pointer">{t('employees.contractTypeFull')}</SelectItem>
                <SelectItem value="جزئي" className="cursor-pointer">{t('employees.contractTypePartial')}</SelectItem>
              </SelectContent>
            </Select>
          </FormField>
          
          <FormField label={t('employees.payType') || 'طريقة الدفع'}>
            <Select dir={isRTL ? "rtl" : "ltr"} value={form.payType} onValueChange={value => setForm(f => ({ ...f, payType: value }))}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder={t('employees.payType') || 'طريقة الدفع'} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="كاش" className="cursor-pointer">{t('employees.payTypeCash')}</SelectItem>
                <SelectItem value="تحويل بنكي" className="cursor-pointer">{t('employees.payTypeBankTransfer')}</SelectItem>
                <SelectItem value="شيك" className="cursor-pointer">{t('employees.payTypeCheck')}</SelectItem>
                <SelectItem value="wps" className="cursor-pointer">{t('employees.payTypeWPS')}</SelectItem>
              </SelectContent>
            </Select>
          </FormField>
          
          <FormField label={t('employees.firstDayOfWork') || 'أول يوم عمل'}>
            <DatePickerField
              name="firstDayOfWork"
              placeholder={t('employees.firstDayOfWork') || 'أول يوم عمل'}
              value={form.firstDayOfWork}
              onChange={handleChange}
              isRTL={isRTL}
            />
          </FormField>
          
          <FormField label={t('employees.accountActivationDate') || 'تاريخ تفعيل الحساب'}>
            <DatePickerField
              name="accountActivationDate"
              placeholder={t('employees.accountActivationDate') || 'تاريخ تفعيل الحساب'}
              value={form.accountActivationDate}
              onChange={handleChange}
              isRTL={isRTL}
            />
          </FormField>
          
          <FormField label={t('employees.accountCloseDate') || 'تاريخ إغلاق الحساب'}>
            <DatePickerField
              name="accountCloseDate"
              placeholder={t('employees.accountCloseDate') || 'تاريخ إغلاق الحساب'}
              value={form.accountCloseDate}
              onChange={handleChange}
              isRTL={isRTL}
            />
          </FormField>

          {/* Status Switcher - Only visible for Admin */}
          {isAdmin && (
            <FormField label={t('employees.status') || 'حالة الموظف'}>
              <div className="flex items-center space-x-2 rtl:space-x-reverse h-10">
                <Switch
                  checked={form.status === 'active'}
                  onCheckedChange={(checked) => setForm(f => ({ ...f, status: checked ? 'active' : 'inactive' }))}
                />
                <Label className="text-sm">
                  {form.status === 'active' ? (t('employees.active') || 'نشط') : (t('employees.inactive') || 'غير نشط')}
                </Label>
              </div>
            </FormField>
          )}
        </div>
      </div>

      {/* Financial Information Section */}
      <div>
        <h3 className="text-lg font-semibold mb-4 text-gray-700 dark:text-gray-300">{t('employees.financialInfo')}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4">
          <FormField label={t('employees.basicSalary')}>
            <Input 
              name="basicSalary" 
              placeholder={t('employees.basicSalaryPlaceholder')} 
              type="number"
              value={form.basicSalary} 
              onChange={handleChange} 
            />
          </FormField>
          
          <FormField label={t('employees.housingAllowance') || 'بدل السكن'}>
            <Input 
              name="housingAllowance" 
              placeholder={t('employees.allowancePlaceholder')} 
              type="number"
              value={form.housingAllowance} 
              onChange={handleChange} 
            />
          </FormField>
          
          <FormField label={t('employees.transportationAllowance') || 'بدل المواصلات'}>
            <Input 
              name="transportationAllowance" 
              placeholder={t('employees.allowancePlaceholder')} 
              type="number"
              value={form.transportationAllowance} 
              onChange={handleChange} 
            />
          </FormField>
          
          <FormField label={t('employees.anotherAllowance') || 'بدل آخر'}>
            <Input 
              name="anotherAllowance" 
              placeholder={t('employees.allowancePlaceholder')} 
              type="number"
              value={form.anotherAllowance} 
              onChange={handleChange} 
            />
          </FormField>

          <FormField label={t('employees.hourlyRate') || 'أجر الساعة'}>
            <Input 
              name="hourlyRate" 
              placeholder={t('employees.hourlyRatePlaceholder') || 'أدخل أجر الساعة'} 
              type="number"
              value={form.hourlyRate} 
              onChange={handleChange} 
            />
          </FormField>
        </div>
      </div>

      {/* Bank Information Section */}
      <div>
        <h3 className="text-lg font-semibold mb-4 text-gray-700 dark:text-gray-300">{t('employees.bankInfo')}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4">
          <FormField label={t('employees.bankName') || 'اسم البنك'}>
            <Input 
              name="bankName" 
              placeholder={t('employees.bankNamePlaceholder')} 
              value={form.bankName} 
              onChange={handleChange} 
            />
          </FormField>
          
          <FormField label={t('employees.accountNumber') || 'رقم الحساب'}>
            <Input 
              name="accountNumber" 
              placeholder={t('employees.accountNumberPlaceholder')} 
              value={form.accountNumber} 
              onChange={handleChange} 
            />
          </FormField>
          
          <FormField label={t('employees.iban') || 'رقم الآيبان'}>
            <Input 
              name="iban" 
              placeholder={t('employees.ibanPlaceholder')} 
              value={form.iban} 
              onChange={handleChange} 
            />
          </FormField>
        </div>
      </div>

      {/* Document Information Section */}
      <div>
        <h3 className="text-lg font-semibold mb-4 text-gray-700 dark:text-gray-300">{t('employees.documentsInfo')}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4">
          <FormField label={t('employees.identityNumber')}>
            <Input 
              name="identityNumber" 
              placeholder={t('employees.identityNumberPlaceholder')} 
              value={form.identityNumber} 
              onChange={handleChange} 
            />
          </FormField>
          
          <FormField label={t('employees.passportNumber')}>
            <Input 
              name="passportNumber" 
              placeholder={t('employees.passportNumberPlaceholder')} 
              value={form.passportNumber} 
              onChange={handleChange} 
            />
          </FormField>
        </div>
      </div>

      {/* Expiry Dates Section */}
      <div>
        <h3 className="text-lg font-semibold mb-4 text-gray-700 dark:text-gray-300">{t('employees.expiryDates')}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4">
          <FormField label={t('employees.identityExpiryDate')}>
            <DatePickerField
              name="identityExpiryDate"
              placeholder={t('employees.identityExpiryDate')}
              value={form.identityExpiryDate}
              onChange={handleChange}
              isRTL={isRTL}
            />
          </FormField>
          
          <FormField label={t('employees.passportExpiryDate')}>
            <DatePickerField
              name="passportExpiryDate"
              placeholder={t('employees.passportExpiryDate')}
              value={form.passportExpiryDate}
              onChange={handleChange}
              isRTL={isRTL}
            />
          </FormField>
          
          <FormField label={t('employees.residenceExpiryDate')}>
            <DatePickerField
              name="residenceExpiryDate"
              placeholder={t('employees.residenceExpiryDate')}
              value={form.residenceExpiryDate}
              onChange={handleChange}
              isRTL={isRTL}
            />
          </FormField>
          
          <FormField label={t('employees.insuranceExpiryDate')}>
            <DatePickerField
              name="insuranceExpiryDate"
              placeholder={t('employees.insuranceExpiryDate')}
              value={form.insuranceExpiryDate}
              onChange={handleChange}
              isRTL={isRTL}
            />
          </FormField>
          
          <FormField label={t('employees.contractExpiryDate')}>
            <DatePickerField
              name="contractExpiryDate"
              placeholder={t('employees.contractExpiryDate')}
              value={form.contractExpiryDate}
              onChange={handleChange}
              isRTL={isRTL}
            />
          </FormField>
          
          <FormField label={t('employees.workPermitExpiryDate')}>
            <DatePickerField
              name="workPermitExpiryDate"
              placeholder={t('employees.workPermitExpiryDate')}
              value={form.workPermitExpiryDate}
              onChange={handleChange}
              isRTL={isRTL}
            />
          </FormField>

          <FormField label={t('employees.registrationExpiryDate')}>
            <DatePickerField
              name="registrationExpirationDate"
              placeholder={t('employees.registrationExpiryDate')}
              value={form.registrationExpirationDate}
              onChange={handleChange}
              isRTL={isRTL}
            />
          </FormField>
        </div>
      </div>
    </div>
  );
}
