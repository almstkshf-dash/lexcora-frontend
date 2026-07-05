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
import { useLanguage } from '@/contexts/LanguageContext';
import { createBankAccount } from '@/app/services/api/bankAccounts';
import { getBranches } from '@/app/services/api/branches';
import { ACCOUNT_STATUS } from '@/app/finance/constants';
import { toast } from 'react-toastify';

// Defined outside component to avoid recreation on every render
const validationSchema = Yup.object({
  bank_name: Yup.string().required(),
  account_name: Yup.string().required(),
  account_number: Yup.string().required(),
  iban: Yup.string().optional(),
  branch_id: Yup.number().nullable(),
  current_balance: Yup.number().min(0).default(0),
  status: Yup.string().oneOf([ACCOUNT_STATUS.ACTIVE, ACCOUNT_STATUS.INACTIVE]).default(ACCOUNT_STATUS.ACTIVE)
});

const AddAccountModal = ({ isOpen, onClose, onSuccess }) => {
  const { isRTL } = useLanguage();
  const t = useTranslations('AddBankAccount');
  const [branches, setBranches] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch branches on component mount
  useEffect(() => {
    const fetchBranches = async () => {
      try {
        const response = await getBranches();
        const data = Array.isArray(response) ? response : response?.data;
        if (Array.isArray(data)) setBranches(data);
      } catch (error) {
        // silently ignore
      }
    };

    if (isOpen) {
      fetchBranches();
    }
  }, [isOpen]);

  const formik = useFormik({
    initialValues: {
      bank_name: '',
      account_name: '',
      account_number: '',
      iban: '',
      branch_id: '',
      current_balance: 0,
      status: ACCOUNT_STATUS.ACTIVE
    },
    validationSchema,
    onSubmit: async (values) => {
      setIsLoading(true);
      try {
        const accountData = {
          ...values,
          branch_id: values.branch_id ? parseInt(values.branch_id, 10) : null,
          initial_balance: parseFloat(values.current_balance) || 0
        };
        delete accountData.current_balance;

        const response = await createBankAccount(accountData);

        if (response.success) {
          toast.success(t('accountAddedSuccess'));
          formik.resetForm();
          onSuccess();
          onClose();
        } else {
          toast.error(response.message || t('errorAddingAccount'));
        }
      } catch (error) {
        console.error('createBankAccount error:', JSON.stringify(error?.response?.data), 'status:', error?.response?.status, 'message:', error?.message);
        toast.error(error?.response?.data?.message || error?.message || t('errorAddingAccountGeneric'));
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
            {t('title')}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={formik.handleSubmit} className="space-y-4">
          {/* Bank Name */}
          <div className="space-y-2">
            <Label htmlFor="bank_name">{t('bankName')} *</Label>
            <Input
              id="bank_name"
              name="bank_name"
              value={formik.values.bank_name}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className={formik.touched.bank_name && formik.errors.bank_name ? 'border-red-500' : ''}
              placeholder={t('bankNamePlaceholder')}
            />
            {formik.touched.bank_name && formik.errors.bank_name && (
              <p className="text-sm text-red-500">{formik.errors.bank_name}</p>
            )}
          </div>

          {/* Account Name */}
          <div className="space-y-2">
            <Label htmlFor="account_name">{t('accountName')} *</Label>
            <Input
              id="account_name"
              name="account_name"
              value={formik.values.account_name}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className={formik.touched.account_name && formik.errors.account_name ? 'border-red-500' : ''}
              placeholder={t('accountNamePlaceholder')}
            />
            {formik.touched.account_name && formik.errors.account_name && (
              <p className="text-sm text-red-500">{formik.errors.account_name}</p>
            )}
          </div>

          {/* Account Number */}
          <div className="space-y-2">
            <Label htmlFor="account_number">{t('accountNumber')} *</Label>
            <Input
              id="account_number"
              name="account_number"
              value={formik.values.account_number}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className={formik.touched.account_number && formik.errors.account_number ? 'border-red-500' : ''}
              placeholder={t('accountNumberPlaceholder')}
            />
            {formik.touched.account_number && formik.errors.account_number && (
              <p className="text-sm text-red-500">{formik.errors.account_number}</p>
            )}
          </div>

          {/* IBAN */}
          <div className="space-y-2">
            <Label htmlFor="iban">{t('iban')}</Label>
            <Input
              id="iban"
              name="iban"
              value={formik.values.iban}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              placeholder={t('ibanPlaceholder')}
            />
          </div>

          {/* Branch */}
          <div className="space-y-2">
            <Label htmlFor="branch_id">{t('branch')}</Label>
            <Select
              value={formik.values.branch_id}
              onValueChange={(value) => formik.setFieldValue('branch_id', value === "none" ? "" : value)}
            >
              <SelectTrigger id="branch_id">
                <SelectValue placeholder={t('selectBranch')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">{t('noBranch')}</SelectItem>
                {branches.map((branch) => (
                  <SelectItem key={branch.id} value={branch.id.toString()}>
                    {isRTL ? branch.name_ar : branch.name_en}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Current Balance */}
          <div className="space-y-2">
            <Label htmlFor="current_balance">{t('currentBalance')}</Label>
            <Input
              id="current_balance"
              name="current_balance"
              type="number"
              step="0.01"
              value={formik.values.current_balance}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className={formik.touched.current_balance && formik.errors.current_balance ? 'border-red-500' : ''}
              placeholder={t('balancePlaceholder')}
            />
            {formik.touched.current_balance && formik.errors.current_balance && (
              <p className="text-sm text-red-500">{formik.errors.current_balance}</p>
            )}
          </div>

          {/* Status */}
          <div className="space-y-2">
            <Label htmlFor="status">{t('status')}</Label>
            <Select
              value={formik.values.status}
              onValueChange={(value) => formik.setFieldValue('status', value)}
            >
              <SelectTrigger id="status">
                <SelectValue placeholder={t('selectStatus')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ACCOUNT_STATUS.ACTIVE}>{t('active')}</SelectItem>
                <SelectItem value={ACCOUNT_STATUS.INACTIVE}>{t('inactive')}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              className="flex-1"
            >
              {t('cancel')}
            </Button>
            <Button
              type="submit"
              disabled={isLoading || !formik.isValid}
              className="flex-1"
            >
              {isLoading ? t('saving') : t('save')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddAccountModal;
