'use client';

import React, { useState, useEffect } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTranslations } from '@/hooks/useTranslations';
import { createEmployeeCashTransaction, updateEmployeeCashTransaction } from '@/app/services/api/employeeCashTransactions';
import { getEmployees } from '@/app/services/api/employees';
import { getAllBankAccounts } from '@/app/services/api/bankAccounts';
import { uploadFiles } from '../../../../../utils/fileUpload';
import { toast } from 'react-toastify';
import { X, Upload } from 'lucide-react';
import { DEFAULT_CURRENCY, LOCALE, ACCOUNT_STATUS, TRANSACTION_TYPE } from '@/app/finance/constants';

// Static schemas defined outside component to avoid recreation on every render
const addValidationSchema = Yup.object({
  employee_id: Yup.number().required(),
  amount: Yup.number().min(0.01).required(),
  bank_account_id: Yup.number().optional(),
  description: Yup.string().optional()
});

const editValidationSchema = Yup.object({
  employee_id: Yup.number().notRequired(),
  amount: Yup.number().min(0.01).required(),
  bank_account_id: Yup.number().optional(),
  description: Yup.string().optional()
});

const TransactionModal = ({ isOpen, onClose, onSuccess, transactionId = null, transactionData = null }) => {
  const { isRTL } = useLanguage();
  const t = useTranslations('employeeFinance.modal');
  const tTransactions = useTranslations('employeeFinance.transactions');
  const [employees, setEmployees] = useState([]);
  const [bankAccounts, setBankAccounts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const isEditMode = !!transactionId;

  // Fetch employees and bank accounts on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const employeesRes = await getEmployees();
        const bankAccountsRes = await getAllBankAccounts();
        
        if (employeesRes.success) {
          setEmployees(employeesRes.data);
        }
        
        if (bankAccountsRes.success) {
          // Filter only active bank accounts
          const activeBankAccounts = bankAccountsRes.data.filter(acc => acc.status === ACCOUNT_STATUS.ACTIVE);
          setBankAccounts(activeBankAccounts);
        }
      } catch {
        // silently ignore fetch errors
      }
    };
    
    if (isOpen) {
      fetchData();
    }
  }, [isOpen]);

  // Update form when transaction data changes
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (isEditMode && transactionData) {
      formik.setValues({
        employee_id: transactionData.employee_id?.toString() || '',
        amount: transactionData.amount || 0,
        bank_account_id: '', // Don't set bank_account_id in edit mode
        description: transactionData.description || ''
      });
    } else {
      // Reset files for new transaction
      setSelectedFiles([]);
    }
  }, [transactionData, isEditMode]);

  const validationSchema = isEditMode ? editValidationSchema : addValidationSchema;

  const formik = useFormik({
    initialValues: {
      employee_id: '',
      amount: 0,
      bank_account_id: '',
      description: ''
    },
    validationSchema,
    onSubmit: async (values) => {
      setIsLoading(true);
      try {
        
        // Upload files only when submitting (not when selecting)
        let uploadedAttachments = [];
        if (!isEditMode && selectedFiles.length > 0) {
          const uploadedResults = await uploadFiles(selectedFiles, 'employee-cash-transactions');
          uploadedAttachments = uploadedResults.map(file => ({
            attachment_url: file.document_url,
            attachment_name: file.document_name
          }));
        }
        
        const transactionPayload = {
          employee_id: parseInt(values.employee_id),
          amount: parseFloat(values.amount),
          type: TRANSACTION_TYPE.CREDIT,
          ...(!isEditMode && values.bank_account_id && { bank_account_id: parseInt(values.bank_account_id) }),
          description: values.description || null,
          attachments: uploadedAttachments
        };
        
        let response;
        if (isEditMode) {
          response = await updateEmployeeCashTransaction(transactionId, transactionPayload);
        } else {
          response = await createEmployeeCashTransaction(transactionPayload);
        }
        if (response.success) {
          toast.success(isEditMode ? t('updateSuccess') : t('addSuccess'));
          formik.resetForm();
          setSelectedFiles([]);
          onSuccess();
          onClose();
        } else {
          toast.error(response.message || t('saveError'));
        }
      } catch {
        toast.error(t('saveError'));
      } finally {
        setIsLoading(false);
      }
    },
  });

  const handleFileSelect = (event) => {
    const files = Array.from(event.target.files);
    if (files.length === 0) return;
    setSelectedFiles([...selectedFiles, ...files]);
  };

  const handleRemoveFile = (index) => {
    const newFiles = selectedFiles.filter((_, i) => i !== index);
    setSelectedFiles(newFiles);
  };

  const handleClose = () => {
    formik.resetForm();
    setSelectedFiles([]);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className={`max-w-2xl max-h-[90vh] overflow-y-auto ${isRTL ? 'rtl' : 'ltr'}`}>
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">
            {isEditMode ? tTransactions('edit') : tTransactions('addNew')}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={formik.handleSubmit} className="space-y-4">
          {/* Employee Selection - Only show in Add mode */}
          {!isEditMode && (
            <div className="space-y-2">
              <Label htmlFor="employee_id">{t('employee')} *</Label>
              <Select 
                value={formik.values.employee_id} 
                onValueChange={(value) => formik.setFieldValue('employee_id', value)}
              >
                <SelectTrigger className={formik.touched.employee_id && formik.errors.employee_id ? 'border-red-500' : ''}>
                  <SelectValue placeholder={t('selectEmployee')} />
                </SelectTrigger>
                <SelectContent>
                  {employees.map((employee) => (
                    <SelectItem key={employee.id} value={employee.id.toString()}>
                      {employee.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {formik.touched.employee_id && formik.errors.employee_id && (
                <p className="text-sm text-red-500">{formik.errors.employee_id}</p>
              )}
            </div>
          )}

          {/* Amount */}
          <div className="space-y-2">
            <Label htmlFor="amount">{t('amount')} *</Label>
            <Input
              id="amount"
              name="amount"
              type="number"
              step="0.01"
              value={formik.values.amount}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className={formik.touched.amount && formik.errors.amount ? 'border-red-500' : ''}
              placeholder={t('amountPlaceholder')}
            />
            {formik.touched.amount && formik.errors.amount && (
              <p className="text-sm text-red-500">{formik.errors.amount}</p>
            )}
          </div>

          {/* Bank Account Selection - Only show in Add mode - Optional */}
          {!isEditMode && (
            <div className="space-y-2">
              <Label htmlFor="bank_account_id">
                {t('bankAccount')} <span className=" text-sm">({t('optional')})</span>
              </Label>
              <Select 
                value={formik.values.bank_account_id} 
                onValueChange={(value) => formik.setFieldValue('bank_account_id', value)}
              >
                <SelectTrigger className={formik.touched.bank_account_id && formik.errors.bank_account_id ? 'border-red-500' : ''}>
                  <SelectValue placeholder={t('selectBankAccount')} />
                </SelectTrigger>
                <SelectContent>
                  {bankAccounts.map((account) => (
                    <SelectItem key={account.id} value={account.id.toString()}>
                      {account.bank_name} - {account.account_name} ({new Intl.NumberFormat(LOCALE.ar, { style: 'currency', currency: DEFAULT_CURRENCY }).format(account.current_balance)})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {formik.touched.bank_account_id && formik.errors.bank_account_id && (
                <p className="text-sm text-red-500">{formik.errors.bank_account_id}</p>
              )}
            </div>
          )}

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">{t('description')}</Label>
            <Textarea
              id="description"
              name="description"
              value={formik.values.description}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              placeholder={t('descriptionPlaceholder')}
              rows={3}
            />
          </div>

          {/* Attachments - Only show in Add mode */}
          {!isEditMode && (
            <div className="space-y-2">
              <Label>{t('attachments')}</Label>
              <div className="border-2 border-dashed border-gray-300 rounded-sg p-4">
                <input
                  type="file"
                  multiple
                  onChange={handleFileSelect}
                  className="hidden"
                  id="file-upload"
                />
                <label
                  htmlFor="file-upload"
                  className="flex flex-col items-center justify-center cursor-pointer"
                >
                  <Upload className="h-8 w-8  mb-2" />
                  <span className="text-sm ">
                    {t('selectFiles')}
                  </span>
                  <span className="text-xs  mt-1">
                    {t('uploadNote')}
                  </span>
                </label>
              </div>

              {/* Selected Files List */}
              {selectedFiles.length > 0 && (
                <div className="mt-3 space-y-2">
                  <Label className="text-sm">{t('selectedFiles')} ({selectedFiles.length}):</Label>
                  {selectedFiles.map((file, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-2  rounded border"
                    >
                      <span className="text-sm truncate flex-1">
                        {file.name}
                      </span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveFile(index)}
                        className="hover:bg-red-50"
                      >
                        <X className="h-4 w-4 text-red-600" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end gap-2 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={handleClose}
              disabled={isLoading}
            >
              {t('cancel')}
            </Button>
            <Button 
              type="submit" 
              disabled={isLoading}
            >
              {isLoading ? t('saving') : (isEditMode ? t('update') : t('save'))}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default TransactionModal;

