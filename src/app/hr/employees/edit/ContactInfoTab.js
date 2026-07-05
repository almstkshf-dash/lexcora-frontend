import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail } from 'lucide-react';
import { useTranslations } from '@/hooks/useTranslations';

const ContactInfoTab = ({ formData, handleInputChange }) => {
  const { t } = useTranslations();

  const FormField = ({ label, name, type = "text", required = false, value, placeholder }) => (
    <div className="space-y-2">
      <Label htmlFor={name} className="text-sm font-medium">
        {label} {required && <span className="text-red-500">*</span>}
      </Label>
      <Input
        id={name}
        type={type}
        value={value || ''}
        onChange={(e) => handleInputChange(name, e.target.value)}
        placeholder={placeholder}
        className="w-full"
        required={required}
        autoComplete={type === 'password' ? 'new-password' : 'off'}
      />
    </div>
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mail className="w-5 h-5" />
          {t('employees.contactInfo')}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 flex flex-wrap gap-4">
        <FormField
          label={t('employees.email')}
          name="email"
          type="email"
          value={formData.email}
          required
        />
        <FormField
          label={t('employees.phoneNumber')}
          name="phone"
          value={formData.phone}
        />
        <FormField
          label={t('employees.username')}
          name="username"
          value={formData.username}
          required
        />
        <FormField
          label={t('employees.password')}
          name="password"
          type="password"
          value={formData.password}
          placeholder={t('employees.leaveEmptyToKeepCurrent')}
        />
      </CardContent>
    </Card>
  );
};

export default ContactInfoTab;