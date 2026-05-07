import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Building } from 'lucide-react';
import { useTranslations } from '@/hooks/useTranslations';
import { useLanguage } from '@/contexts/LanguageContext';

const WorkInfoTab = ({ formData, handleInputChange, departments, roles, branches, managers, employeeId }) => {
  const { t } = useTranslations();
  const { language } = useLanguage();

  const FormField = ({ label, name, type = "text", required = false, options = [], value, placeholder }) => (
    <div className="space-y-2">
      <Label htmlFor={name} className="text-sm font-medium">
        {label} {required && <span className="text-red-500">*</span>}
      </Label>
      {type === 'select' ? (
        <Select 
          value={value?.toString() || ''} 
          onValueChange={(val) => handleInputChange(name, val)}
        >
          <SelectTrigger id={name}>
            <SelectValue placeholder={placeholder || `${t('common.select')} ${label}`} />
          </SelectTrigger>
          <SelectContent>
            {options.map((option) => (
              <SelectItem key={option.id} value={option.id.toString()}>
                {language === 'ar' ? 
                  (option.name_ar || option.role_ar || option.department_ar || option.branch_ar || option.name) : 
                  (option.name_en || option.role_en || option.department_en || option.branch_en || option.name)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ) : type === 'manager-select' ? (
        <Select 
          value={value?.toString() || 'none'} 
          onValueChange={(val) => handleInputChange(name, val === 'none' ? null : val)}
        >
          <SelectTrigger id={name}>
            <SelectValue placeholder={placeholder || t('employees.selectManager')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">{t('employees.noManager')}</SelectItem>
            {options.map((manager) => (
              <SelectItem key={manager.id} value={manager.id.toString()}>
                {manager.name} - {language === 'ar' ? manager.role_ar : manager.role_en}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ) : type === 'status-select' ? (
        <Select value={value || ''} onValueChange={(val) => handleInputChange(name, val)}>
          <SelectTrigger id={name}>
            <SelectValue placeholder={placeholder || `${t('common.select')} ${label}`} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="active">{t('employees.active')}</SelectItem>
            <SelectItem value="inactive">{t('employees.inactive')}</SelectItem>
          </SelectContent>
        </Select>
      ) : (
        <Input
          id={name}
          type={type}
          value={value || ''}
          onChange={(e) => handleInputChange(name, e.target.value)}
          placeholder={placeholder}
          className="w-full"
          required={required}
        />
      )}
    </div>
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building className="w-5 h-5" />
          {t('employees.workInfo')}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 flex flex-wrap gap-4">
        <FormField 
          label={t('employees.department')} 
          name="department_id" 
          type="select"
          value={formData.department_id}
          options={departments}
          required 
        />
        <FormField 
          label={t('employees.role')} 
          name="role_id" 
          type="select"
          value={formData.role_id}
          options={roles}
          required 
        />
        <FormField 
          label={t('employees.branch')} 
          name="branch_id" 
          type="select"
          value={formData.branch_id}
          options={branches}
        />
        <FormField 
          label={t('employees.directManager')} 
          name="direct_manager_id" 
          type="manager-select"
          value={formData.direct_manager_id}
          options={managers.filter(emp => emp.id !== employeeId)}
        />
        <FormField 
          label={t('employees.status')} 
          name="status" 
          type="status-select"
          value={formData.status}
          required 
        />
        <FormField 
          label={t('employees.basicSalary')} 
          name="basic_salary" 
          type="number"
          value={formData.basic_salary}
          placeholder="0.00"
        />
        <FormField 
          label={t('employees.hourlyRate') || 'أجر الساعة'} 
          name="hourly_rate" 
          type="number"
          value={formData.hourly_rate}
          placeholder="0.00"
        />
      </CardContent>
    </Card>
  );
};

export default WorkInfoTab;