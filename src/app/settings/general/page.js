'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ArrowRight, Loader2 } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import PageHeader from '@/components/PageHeader';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTranslations } from '@/hooks/useTranslations';
import { toast } from 'react-toastify';
import InfoTab from './InfoTab';
import Condiations from './Condiations';
import { getGlobalSettings, updateGlobalSettings } from '@/app/services/api/settings';

const GeneralSettingsPage = () => {
  const { isRTL } = useLanguage();
  const t = useTranslations('settings');
  const navT = useTranslations('navigation');
  const router = useRouter();
  const BackIcon = isRTL ? ArrowRight : ArrowLeft;

  const [formData, setFormData] = useState({
    company_name_ar: '',
    company_name_en: '',
    company_trn: '',
    company_address_ar: '',
    company_address_en: '',
    company_phone: '',
    company_email: '',
    company_logo_url: '',
    default_vat_rate: '5.00',
    terms_conditions_ar: '',
    terms_conditions_en: ''
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await getGlobalSettings();
      if (response.success) {
        setFormData(response.data);
      }
    } catch (error) {
      toast.error(t('errorFetchingSettings'));
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await updateGlobalSettings(formData);
      if (response.success) {
        toast.success(t('settingsUpdatedSuccessfully'));
        setFormData(response.data);
      } else {
        toast.error(response.message || t('errorUpdatingSettings'));
      }
    } catch (error) {
      toast.error(t('errorUpdatingSettings'));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-muted-foreground">{t('loadingSettings')}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <PageHeader
        title={navT('generalSettings')}
        description={t('generalSettingsDesc')}
      >
        <Button
          variant="outline"
          onClick={() => router.back()}
          className="flex items-center gap-2"
        >
          <BackIcon className="h-4 w-4" />
          {t('back')}
        </Button>
      </PageHeader>

      <Tabs dir={isRTL ? 'rtl' : 'ltr'} defaultValue="info" className="space-y-4">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="info">{t('companyInfo')}</TabsTrigger>
          <TabsTrigger value="condiations">{t('termsAndConditions')}</TabsTrigger>
        </TabsList>
        
        <InfoTab 
          formData={formData} 
          onChange={handleInputChange} 
          onSave={handleSave} 
          isSaving={saving} 
        />
        
        <Condiations 
          formData={formData} 
          onChange={handleInputChange} 
          onSave={handleSave} 
          isSaving={saving} 
        />
      </Tabs>
    </div>
  );
};

export default GeneralSettingsPage;
