'use client';

import React, { useState, useEffect } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useTranslations } from '@/hooks/useTranslations';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useLanguage } from '@/contexts/LanguageContext';
import { createAccount } from '@/app/services/api/accounting';
import { getBranches } from '@/app/services/api/branches';
import { toast } from 'react-toastify';

const AddAccountModal = ({ isOpen, onClose, onSuccess, parentId = null }) => {
  const { isRTL } = useLanguage();
  const t = useTranslations('Accounting');
  const commonT = useTranslations('common');
  const [branches, setBranches] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchBranches = async () => {
      try {
        const response = await getBranches();
        if (response.success) {
          setBranches(Array.isArray(response.data) ? response.data : []);
        }
      } catch (error) {}
    };
    
    if (isOpen) {
      fetchBranches();
    }
  }, [isOpen]);

  const validationSchema = Yup.object({
    code: Yup.string().required(commonT('required')),
    name_ar: Yup.string().required(commonT('required')),
    name_en: Yup.string().required(commonT('required')),
    type: Yup.string().required(commonT('required')),
    branch_id: Yup.number().nullable(),
    is_reconcilable: Yup.boolean(),
    allow_manual_posting: Yup.boolean()
  });

  const formik = useFormik({
    initialValues: {
      code: '',
      name_ar: '',
      name_en: '',
      type: 'asset',
      branch_id: '',
      is_reconcilable: false,
      allow_manual_posting: true
    },
    validationSchema,
    onSubmit: async (values) => {
      setIsLoading(true);
      try {
        const accountData = {
          ...values,
          branch_id: values.branch_id || null,
          parent_id: parentId || null
        };
        
        const response = await createAccount(accountData);
        
        if (response.success || response.id || response.data) {
          toast.success(commonT('success'));
          formik.resetForm();
          if (onSuccess) onSuccess();
          onClose();
        } else {
          toast.error(response.message || commonT('error'));
        }
      } catch (error) {
        toast.error(error.message || commonT('error'));
      } finally {
        setIsLoading(false);
      }
    },
  });

  const handleClose = () => {
    formik.resetForm();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className={`max-w-md ${isRTL ? 'rtl' : 'ltr'}`}>
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">
            {t('addAccount')}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={formik.handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="code">{t('code')} *</Label>
            <Input
              id="code"
              name="code"
              value={formik.values.code}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className={formik.touched.code && formik.errors.code ? 'border-eed-500' : ''}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="name_ar">{commonT('nameAr')} *</Label>
            <Input
              id="name_ar"
              name="name_ar"
              value={formik.values.name_ar}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className={formik.touched.name_ar && formik.errors.name_ar ? 'border-eed-500' : ''}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="name_en">{commonT('nameEn')} *</Label>
            <Input
              id="name_en"
              name="name_en"
              value={formik.values.name_en}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className={formik.touched.name_en && formik.errors.name_en ? 'border-eed-500' : ''}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="type">{commonT('type')} *</Label>
            <Select 
              value={formik.values.type} 
              onValueChange={(value) => formik.setFieldValue('type', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="asset">{t('asset') || 'Asset'}</SelectItem>
                <SelectItem value="liability">{t('liability') || 'Liability'}</SelectItem>
                <SelectItem value="equity">{t('equity') || 'Equity'}</SelectItem>
                <SelectItem value="revenue">{t('revenue') || 'Revenue'}</SelectItem>
                <SelectItem value="expense">{t('expense') || 'Expense'}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="branch_id">{commonT('branch')}</Label>
            <Select 
              value={formik.values.branch_id} 
              onValueChange={(value) => formik.setFieldValue('branch_id', value === "none" ? "" : value)}
            >
              <SelectTrigger>
                <SelectValue placeholder={commonT('all')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">{commonT('all')}</SelectItem>
                {branches.map((branch) => (
                  <SelectItem key={branch.id} value={branch.id.toString()}>
                    {isRTL ? branch.name_ar : branch.name_en}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center space-x-2 space-x-reverse pt-2">
            <Checkbox 
              id="is_reconcilable" 
              checked={formik.values.is_reconcilable}
              onCheckedChange={(checked) => formik.setFieldValue('is_reconcilable', checked)}
            />
            <Label htmlFor="is_reconcilable" className="cursor-pointer">{t('reconcilable')}</Label>
          </div>

          <div className="flex items-center space-x-2 space-x-reverse pt-2">
            <Checkbox 
              id="allow_manual_posting" 
              checked={formik.values.allow_manual_posting}
              onCheckedChange={(checked) => formik.setFieldValue('allow_manual_posting', checked)}
            />
            <Label htmlFor="allow_manual_posting" className="cursor-pointer">{t('allowManualPosting')}</Label>
          </div>

          <div className="flex gap-2 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={handleClose}
              className="flex-1"
            >
              {commonT('cancel')}
            </Button>
            <Button 
              type="submit" 
              disabled={isLoading || !formik.isValid}
              className="flex-1"
            >
              {isLoading ? commonT('loading') : commonT('save')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddAccountModal;

