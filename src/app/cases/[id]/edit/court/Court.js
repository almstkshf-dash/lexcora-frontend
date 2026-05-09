"use client";

import React, { useState, useEffect } from 'react';
import useSWR, { mutate } from 'swr';
import { Form } from 'formik';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useTranslations } from '@/hooks/useTranslations';
import { useLanguage } from '@/contexts/LanguageContext';
import { getCourts, createCourt } from '@/app/services/api/courts';
import { getPoliceStations, createPoliceStation } from '@/app/services/api/policeStaions';
import { getPublicProsecutions, createPublicProsecution } from '@/app/services/api/PublicProsecutions';
import { toast } from 'react-toastify';
import { useFormikContext } from '../info/FormikContext';
import FileUpload from './FileUpload';
import CourtDocuments from './CourtDocuments';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus } from "lucide-react";
import SubmitButton from '../info/SubmitButton';

function Court({ caseId }) {
  const { values, setFieldValue, errors, touched, setFieldTouched } = useFormikContext();
  const { 
    police_station_id,
    public_prosecution_id,
    court_id,
    courtFiles
  } = values;
  
  const { t } = useTranslations();
  const { language, isRTL } = useLanguage();
  const isArabic = language === 'ar';

  // State for dialogs
  const [isPoliceDialogOpen, setIsPoliceDialogOpen] = useState(false);
  const [isProsecutionDialogOpen, setIsProsecutionDialogOpen] = useState(false);
  const [isCourtDialogOpen, setIsCourtDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form data states
  const [policeFormData, setPoliceFormData] = useState({ name_ar: '', name_en: '' });
  const [prosecutionFormData, setProsecutionFormData] = useState({ name_ar: '', name_en: '' });
  const [courtFormData, setCourtFormData] = useState({ court_ar: '', court_en: '' });

  // Fetch data using SWR
  const { data: policeStations, error: policeError, isLoading: policeLoading } = useSWR('police-stations', getPoliceStations);
  const { data: publicProsecutions, error: prosecutionError, isLoading: prosecutionLoading } = useSWR('public-prosecutions', getPublicProsecutions);
  const { data: courts, error: courtError, isLoading: courtLoading } = useSWR('courts', getCourts);


  // Handle Police Station Creation
  const handlePoliceSubmit = async () => {
    if (!policeFormData.name_ar.trim() || !policeFormData.name_en.trim()) {
      toast.error(isArabic ? 'يرجى ملء جميع الحقول' : 'Please fill all fields');
      return;
    }

    setIsSubmitting(true);
    try {
      await createPoliceStation({
        name_ar: policeFormData.name_ar.trim(),
        name_en: policeFormData.name_en.trim()
      });
      
      mutate('police-stations');
      toast.success(isArabic ? 'تم إنشاء مركز الشرطة بنجاح' : 'Police station created successfully');
      setPoliceFormData({ name_ar: '', name_en: '' });
      setIsPoliceDialogOpen(false);
    } catch (error) {
      toast.error(isArabic ? 'حدث خطأ أثناء إنشاء مركز الشرطة' : 'Error creating police station');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Public Prosecution Creation
  const handleProsecutionSubmit = async () => {
    if (!prosecutionFormData.name_ar.trim() || !prosecutionFormData.name_en.trim()) {
      toast.error(isArabic ? 'يرجى ملء جميع الحقول' : 'Please fill all fields');
      return;
    }

    setIsSubmitting(true);
    try {
      await createPublicProsecution({
        name_ar: prosecutionFormData.name_ar.trim(),
        name_en: prosecutionFormData.name_en.trim()
      });
      
      mutate('public-prosecutions');
      toast.success(isArabic ? 'تم إنشاء النيابة العامة بنجاح' : 'Public prosecution created successfully');
      setProsecutionFormData({ name_ar: '', name_en: '' });
      setIsProsecutionDialogOpen(false);
    } catch (error) {
      toast.error(isArabic ? 'حدث خطأ أثناء إنشاء النيابة العامة' : 'Error creating public prosecution');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Court Creation
  const handleCourtSubmit = async () => {
    if (!courtFormData.court_ar.trim() || !courtFormData.court_en.trim()) {
      toast.error(isArabic ? 'يرجى ملء جميع الحقول' : 'Please fill all fields');
      return;
    }

    setIsSubmitting(true);
    try {
      await createCourt({
        court_ar: courtFormData.court_ar.trim(),
        court_en: courtFormData.court_en.trim()
      });
      
      mutate('courts');
      toast.success(isArabic ? 'تم إنشاء المحكمة بنجاح' : 'Court created successfully');
      setCourtFormData({ court_ar: '', court_en: '' });
      setIsCourtDialogOpen(false);
    } catch (error) {
      toast.error(isArabic ? 'حدث خطأ أثناء إنشاء المحكمة' : 'Error creating court');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form className="space-y-6 p-4">
          <SubmitButton />
      <Card>
        <CardHeader>

          <CardTitle className={isArabic ? 'text-right' : 'text-left'}>
            {isArabic ? 'المحاكم والجهات' : 'Courts and Authorities'}
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          
          {/* Police Station Selection */}
          <div className="space-y-2">
            <Label className={isArabic ? 'text-right block' : 'text-left block'}>
              {isArabic ? 'مركز الشرطة' : 'Police Station'}
            </Label>
            <div className="flex gap-2">
              <Select 
                value={police_station_id?.toString() || ""} 
                onValueChange={(value) => {
                  setFieldTouched('police_station_id', true)
                  setFieldValue('police_station_id', value)
                }}
                dir={isRTL ? 'rtl' : 'ltr'}
              >
                <SelectTrigger className={`w-full ${errors.police_station_id && touched.police_station_id ? 'border-red-500' : ''}`}>
                  <SelectValue 
                    placeholder={isArabic ? 'اختر مركز الشرطة' : 'Select police station'} 
                  />
                </SelectTrigger>
                <SelectContent>
                  {policeLoading ? (
                    <SelectItem value="loading" disabled>
                      {isArabic ? 'جاري التحميل...' : 'Loading...'}
                    </SelectItem>
                  ) : policeError ? (
                    <SelectItem value="error" disabled>
                      {isArabic ? 'خطأ في التحميل' : 'Loading error'}
                    </SelectItem>
                  ) : Array.isArray(policeStations?.data) ? (
                    policeStations.data.map((station) => (
                      <SelectItem key={station.id} value={station.id.toString()}>
                        {isArabic ? station.name_ar : station.name_en}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="no-data" disabled>
                      {isArabic ? 'لا توجد بيانات' : 'No data available'}
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsPoliceDialogOpen(true)}
                className="flex-shrink-0"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            {errors.police_station_id && touched.police_station_id && (
              <div className="text-red-500 text-sm">{errors.police_station_id}</div>
            )}
          </div>

          {/* Public Prosecution Selection */}
          <div className="space-y-2">
            <Label className={isArabic ? 'text-right block' : 'text-left block'}>
              {isArabic ? 'النيابة العامة' : 'Public Prosecution'}
            </Label>
            <div className="flex gap-2">
              <Select 
                value={public_prosecution_id?.toString() || ""} 
                onValueChange={(value) => {
                  setFieldTouched('public_prosecution_id', true)
                  setFieldValue('public_prosecution_id', value)
                }}
                dir={isRTL ? 'rtl' : 'ltr'}
              >
                <SelectTrigger className={`w-full ${errors.public_prosecution_id && touched.public_prosecution_id ? 'border-red-500' : ''}`}>
                  <SelectValue 
                    placeholder={isArabic ? 'اختر النيابة العامة' : 'Select public prosecution'} 
                  />
                </SelectTrigger>
                <SelectContent>
                  {prosecutionLoading ? (
                    <SelectItem value="loading" disabled>
                      {isArabic ? 'جاري التحميل...' : 'Loading...'}
                    </SelectItem>
                  ) : prosecutionError ? (
                    <SelectItem value="error" disabled>
                      {isArabic ? 'خطأ في التحميل' : 'Loading error'}
                    </SelectItem>
                  ) : Array.isArray(publicProsecutions?.data || publicProsecutions) ? (
                    (publicProsecutions.data || publicProsecutions).map((prosecution) => (
                      <SelectItem key={prosecution.id} value={prosecution.id.toString()}>
                        {isArabic ? prosecution.name_ar : prosecution.name_en}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="no-data" disabled>
                      {isArabic ? 'لا توجد بيانات' : 'No data available'}
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsProsecutionDialogOpen(true)}
                className="flex-shrink-0"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            {errors.public_prosecution_id && touched.public_prosecution_id && (
              <div className="text-red-500 text-sm">{errors.public_prosecution_id}</div>
            )}
          </div>

          {/* Court Selection */}
          <div className="space-y-2">
            <Label className={isArabic ? 'text-right block' : 'text-left block'}>
              {isArabic ? 'المحكمة' : 'Court'}
            </Label>
            <div className="flex gap-2">
              <Select 
                value={court_id?.toString() || ""} 
                onValueChange={(value) => {
                  setFieldTouched('court_id', true)
                  setFieldValue('court_id', value)
                }}
                dir={isRTL ? 'rtl' : 'ltr'}
              >
                <SelectTrigger className={`w-full ${errors.court_id && touched.court_id ? 'border-red-500' : ''}`}>
                  <SelectValue 
                    placeholder={isArabic ? 'اختر المحكمة' : 'Select court'} 
                  />
                </SelectTrigger>
                <SelectContent>
                  {courtLoading ? (
                    <SelectItem value="loading" disabled>
                      {isArabic ? 'جاري التحميل...' : 'Loading...'}
                    </SelectItem>
                  ) : courtError ? (
                    <SelectItem value="error" disabled>
                      {isArabic ? 'خطأ في التحميل' : 'Loading error'}
                    </SelectItem>
                  ) : Array.isArray(courts?.data) ? (
                    courts.data.map((court) => (
                      <SelectItem key={court.id} value={court.id.toString()}>
                        {isArabic ? court.court_ar : court.court_en}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="no-data" disabled>
                      {isArabic ? 'لا توجد بيانات' : 'No data available'}
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsCourtDialogOpen(true)}
                className="flex-shrink-0"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            {errors.court_id && touched.court_id && (
              <div className="text-red-500 text-sm">{errors.court_id}</div>
            )}
          </div>

        </CardContent>
      </Card>

      {/* Court Files Upload Section */}
      <FileUpload
        files={courtFiles || []}
        onFilesChange={(files) => setFieldValue('courtFiles', files)}
        title={isArabic ? 'مستندات المحكمة والجهات' : 'Court & Authority Documents'}
        description={isArabic 
          ? 'رفع المستندات المتعلقة بالمحكمة ومراكز الشرطة والنيابة العامة'
          : 'Upload documents related to court, police stations, and public prosecution'
        }
        acceptedFileTypes=".pdf,.doc,.docx,.jpg,.jpeg,.png,.txt"
        maxFileSize={10}
        maxFiles={20}
        folder="court-documents"
      />

      {/* Court Documents Section */}
      <CourtDocuments caseId={caseId} />

      {/* Police Station Dialog */}
      <Dialog open={isPoliceDialogOpen} onOpenChange={setIsPoliceDialogOpen}>
        <DialogContent className="sm:max-w-md" dir={isRTL ? 'rtl' : 'ltr'}>
          <DialogHeader>
            <DialogTitle className={isRTL ? 'text-right' : 'text-left'}>
              {isArabic ? 'إضافة مركز شرطة جديد' : 'Add New Police Station'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className={isRTL ? 'text-right' : 'text-left'}>
                {isArabic ? 'اسم مركز الشرطة بالعربية' : 'Police Station Name in Arabic'}
              </Label>
              <Input
                value={policeFormData.name_ar}
                onChange={(e) => setPoliceFormData(prev => ({ ...prev, name_ar: e.target.value }))}
                placeholder={isArabic ? 'أدخل اسم مركز الشرطة بالعربية' : 'Enter police station name in Arabic'}
                dir="rtl"
                className="text-right"
              />
            </div>
            <div className="space-y-2">
              <Label className={isRTL ? 'text-right' : 'text-left'}>
                {isArabic ? 'اسم مركز الشرطة بالإنجليزية' : 'Police Station Name in English'}
              </Label>
              <Input
                value={policeFormData.name_en}
                onChange={(e) => setPoliceFormData(prev => ({ ...prev, name_en: e.target.value }))}
                placeholder={isArabic ? 'أدخل اسم مركز الشرطة بالإنجليزية' : 'Enter police station name in English'}
                dir="ltr"
                className="text-left"
              />
            </div>
          </div>
          <DialogFooter className={`flex gap-2 ${isRTL ? 'flex-row-reverse' : 'flex-row'}`}>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsPoliceDialogOpen(false);
                setPoliceFormData({ name_ar: '', name_en: '' });
              }}
              disabled={isSubmitting}
            >
              {isArabic ? 'إلغاء' : 'Cancel'}
            </Button>
            <Button
              type="button"
              onClick={handlePoliceSubmit}
              disabled={isSubmitting || !policeFormData.name_ar.trim() || !policeFormData.name_en.trim()}
            >
              {isSubmitting 
                ? (isArabic ? 'جاري الحفظ...' : 'Saving...') 
                : (isArabic ? 'حفظ' : 'Save')
              }
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Public Prosecution Dialog */}
      <Dialog open={isProsecutionDialogOpen} onOpenChange={setIsProsecutionDialogOpen}>
        <DialogContent className="sm:max-w-md" dir={isRTL ? 'rtl' : 'ltr'}>
          <DialogHeader>
            <DialogTitle className={isRTL ? 'text-right' : 'text-left'}>
              {isArabic ? 'إضافة نيابة عامة جديدة' : 'Add New Public Prosecution'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className={isRTL ? 'text-right' : 'text-left'}>
                {isArabic ? 'اسم النيابة العامة بالعربية' : 'Public Prosecution Name in Arabic'}
              </Label>
              <Input
                value={prosecutionFormData.name_ar}
                onChange={(e) => setProsecutionFormData(prev => ({ ...prev, name_ar: e.target.value }))}
                placeholder={isArabic ? 'أدخل اسم النيابة العامة بالعربية' : 'Enter public prosecution name in Arabic'}
                dir="rtl"
                className="text-right"
              />
            </div>
            <div className="space-y-2">
              <Label className={isRTL ? 'text-right' : 'text-left'}>
                {isArabic ? 'اسم النيابة العامة بالإنجليزية' : 'Public Prosecution Name in English'}
              </Label>
              <Input
                value={prosecutionFormData.name_en}
                onChange={(e) => setProsecutionFormData(prev => ({ ...prev, name_en: e.target.value }))}
                placeholder={isArabic ? 'أدخل اسم النيابة العامة بالإنجليزية' : 'Enter public prosecution name in English'}
                dir="ltr"
                className="text-left"
              />
            </div>
          </div>
          <DialogFooter className={`flex gap-2 ${isRTL ? 'flex-row-reverse' : 'flex-row'}`}>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsProsecutionDialogOpen(false);
                setProsecutionFormData({ name_ar: '', name_en: '' });
              }}
              disabled={isSubmitting}
            >
              {isArabic ? 'إلغاء' : 'Cancel'}
            </Button>
            <Button
              type="button"
              onClick={handleProsecutionSubmit}
              disabled={isSubmitting || !prosecutionFormData.name_ar.trim() || !prosecutionFormData.name_en.trim()}
            >
              {isSubmitting 
                ? (isArabic ? 'جاري الحفظ...' : 'Saving...') 
                : (isArabic ? 'حفظ' : 'Save')
              }
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Court Dialog */}
      <Dialog open={isCourtDialogOpen} onOpenChange={setIsCourtDialogOpen}>
        <DialogContent className="sm:max-w-md" dir={isRTL ? 'rtl' : 'ltr'}>
          <DialogHeader>
            <DialogTitle className={isRTL ? 'text-right' : 'text-left'}>
              {isArabic ? 'إضافة محكمة جديدة' : 'Add New Court'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className={isRTL ? 'text-right' : 'text-left'}>
                {isArabic ? 'اسم المحكمة بالعربية' : 'Court Name in Arabic'}
              </Label>
              <Input
                value={courtFormData.court_ar}
                onChange={(e) => setCourtFormData(prev => ({ ...prev, court_ar: e.target.value }))}
                placeholder={isArabic ? 'أدخل اسم المحكمة بالعربية' : 'Enter court name in Arabic'}
                dir="rtl"
                className="text-right"
              />
            </div>
            <div className="space-y-2">
              <Label className={isRTL ? 'text-right' : 'text-left'}>
                {isArabic ? 'اسم المحكمة بالإنجليزية' : 'Court Name in English'}
              </Label>
              <Input
                value={courtFormData.court_en}
                onChange={(e) => setCourtFormData(prev => ({ ...prev, court_en: e.target.value }))}
                placeholder={isArabic ? 'أدخل اسم المحكمة بالإنجليزية' : 'Enter court name in English'}
                dir="ltr"
                className="text-left"
              />
            </div>
          </div>
          <DialogFooter className={`flex gap-2 ${isRTL ? 'flex-row-reverse' : 'flex-row'}`}>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsCourtDialogOpen(false);
                setCourtFormData({ court_ar: '', court_en: '' });
              }}
              disabled={isSubmitting}
            >
              {isArabic ? 'إلغاء' : 'Cancel'}
            </Button>
            <Button
              type="button"
              onClick={handleCourtSubmit}
              disabled={isSubmitting || !courtFormData.court_ar.trim() || !courtFormData.court_en.trim()}
            >
              {isSubmitting 
                ? (isArabic ? 'جاري الحفظ...' : 'Saving...') 
                : (isArabic ? 'حفظ' : 'Save')
              }
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Form>
  );
}

export default Court