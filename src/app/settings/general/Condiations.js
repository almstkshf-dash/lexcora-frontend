'use client';

import React from 'react';
import { FileText, Save, Loader2 } from 'lucide-react';
import { TabsContent } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useTranslations } from '@/hooks/useTranslations';

function Condiations({ formData, onChange, onSave, isSaving }) {
  const t = useTranslations('settings');

  return (
    <TabsContent value="condiations">
      <div className="p-6 space-y-6">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              <CardTitle>{t('termsAndConditions')}</CardTitle>
            </div>
            <CardDescription>{t('termsAndConditionsDesc')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <Label>{t('textAr')}</Label>
              <Textarea 
                dir="rtl" 
                name="terms_conditions_ar"
                rows={10} 
                value={formData.terms_conditions_ar || ''}
                onChange={onChange}
                placeholder="أدخل الشروط والأحكام باللغة العربية..."
              />
            </div>

            <div className="space-y-3">
              <Label>{t('textEn')}</Label>
              <Textarea 
                dir="ltr"
                name="terms_conditions_en"
                rows={10}
                value={formData.terms_conditions_en || ''}
                onChange={onChange}
                placeholder="Enter Terms and Conditions in English..."
              />
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

export default Condiations;