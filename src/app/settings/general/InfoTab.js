'use client';

import React from 'react';
import { Building2, Save, Loader2 } from 'lucide-react';
import { TabsContent } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useTranslations } from '@/hooks/useTranslations';

function InfoTab({ formData, onChange, onSave, isSaving }) {
  const t = useTranslations('settings');

  return (
    <TabsContent value="info">
      <div className="p-6 space-y-6">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-primary" />
              <CardTitle>{t('companyInformation')}</CardTitle>
            </div>
            <CardDescription>{t('companyInformationDesc')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t('companyNameAr')}</Label>
                <Input 
                  name="company_name_ar"
                  value={formData.company_name_ar || ''}
                  onChange={onChange}
                  placeholder="ليكسورا للمحاماة"
                />
              </div>
              <div className="space-y-2">
                <Label>{t('companyNameEn')}</Label>
                <Input 
                  name="company_name_en"
                  value={formData.company_name_en || ''}
                  onChange={onChange}
                  placeholder="Lexcora Law Firm"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t('companyPhone')}</Label>
                <Input 
                  name="company_phone"
                  value={formData.company_phone || ''}
                  onChange={onChange}
                  placeholder="+971 50 000 0000"
                />
              </div>
              <div className="space-y-2">
                <Label>{t('companyEmail')}</Label>
                <Input 
                  name="company_email"
                  type="email"
                  value={formData.company_email || ''}
                  onChange={onChange}
                  placeholder="info@lexcora.com"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t('trn')}</Label>
                <Input 
                  name="company_trn"
                  value={formData.company_trn || ''}
                  onChange={onChange}
                  placeholder="100xxxxxxxxxxxx"
                />
              </div>
              <div className="space-y-2">
                <Label>{t('defaultVatRate')}</Label>
                <div className="relative">
                  <Input 
                    name="default_vat_rate"
                    type="number"
                    step="0.01"
                    value={formData.default_vat_rate || '5.00'}
                    onChange={onChange}
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-gray-500">
                    %
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t('addressAr')}</Label>
                <Textarea 
                  name="company_address_ar"
                  rows={3}
                  value={formData.company_address_ar || ''}
                  onChange={onChange}
                />
              </div>
              <div className="space-y-2">
                <Label>{t('addressEn')}</Label>
                <Textarea 
                  name="company_address_en"
                  rows={3}
                  value={formData.company_address_en || ''}
                  onChange={onChange}
                />
              </div>
            </div>

            <Separator />

            <div className="flex items-center justify-end">
              <Button 
                onClick={onSave}
                disabled={isSaving}
                className="min-w-[120px]"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    {t('saving')}
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    {t('saveChanges')}
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </TabsContent>
  );
}

export default InfoTab;