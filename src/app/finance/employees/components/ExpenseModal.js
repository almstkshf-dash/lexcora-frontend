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
import { searchParties } from '@/app/services/api/parties';
import { SearchableCombobox } from '@/components/ui/searchable-combobox';
import { toast } from 'react-toastify';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

const ExpenseModal = ({ isOpen, onClose, onSuccess, expenseId = null, expenseData = null }) => {
  const { isRTL, language } = useLanguage();
  const t = useTranslations('employeeFinance.modal');
  const tExpenses = useTranslations('employeeFinance.expenses');
  const [employees, setEmployees] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [partySearchResults, setPartySearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const isEditMode = !!expenseId;
  const isArabic = language === 'ar';

  // Fetch employees on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const employeesRes = await getEmployees();
        
        if (employeesRes.success) {
          setEmployees(employeesRes.data);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    
    if (isOpen) {
      fetchData();
    }
  }, [isOpen]);

  const validationSchema = Yup.object({
    employee_id: !isEditMode ? Yup.number().required(t('employeeRequired')) : Yup.number().notRequired(),
    amount: Yup.number().min(0.01, t('amountMinError')).required(t('amountRequired')),
    description: Yup.string().optional(),
    client_id: Yup.number().optional()
  });

  const formik = useFormik({
    initialValues: {
      employee_id: '',
      amount: 0,
      description: '',
      client_id: ''
    },
    validationSchema,
    onSubmit: async (values) => {
      setIsLoading(true);
      try {
        const expensePayload = {
          employee_id: parseInt(values.employee_id),
          amount: parseFloat(values.amount),
          type: 'debit',
          description: values.description || null,
          client_id: values.client_id ? parseInt(values.client_id) : null
        };
        
        let response;
        if (isEditMode) {
          response = await updateEmployeeCashTransaction(expenseId, expensePayload);
        } else {
          response = await createEmployeeCashTransaction(expensePayload);
        }
        
        if (response.success) {
          toast.success(isEditMode ? t('updateSuccess') : t('addSuccess'));
          onSuccess();
          handleClose();
        } else {
          toast.error(response.message || t('saveError'));
        }
      } catch (error) {
        console.error('Error saving expense:', error);
        const errorMessage = error.response?.data?.message || error.message || t('saveError');
        toast.error(errorMessage);
      } finally {
        setIsLoading(false);
      }
    }
  });

  // Update form when expense data changes
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (isEditMode && expenseData) {
      formik.setValues({
        employee_id: expenseData.employee_id?.toString() || '',
        amount: expenseData.amount || 0,
        description: expenseData.description || '',
        client_id: expenseData.client_id?.toString() || ''
      });
    }
  }, [expenseData, isEditMode]);

  // Handle party search with debouncing
  const handlePartySearch = React.useCallback(async (query) => {
    if (!query || query.trim().length < 3) {
      setPartySearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const response = await searchParties(query.trim());
      if (response.success) {
        setPartySearchResults(response.data || []);
      }
    } catch (error) {
      console.error('Error searching parties:', error);
      setPartySearchResults([]);
    } finally {
      setIsSearching(false);
    }
  }, []);

  // Format party options for combobox
  const partyOptions = partySearchResults.map(party => ({
    value: party.id,
    label: party.name,
    phone: party.phone,
    party_type: party.party_type,
    name: party.name
  }));

  // Custom party option renderer
  const renderPartyOption = (option) => (
    <>
      <Check
        className={cn(
          "h-4 w-4",
          isRTL ? "ml-2" : "mr-2",
          formik.values.client_id?.toString() === option.value?.toString() ? "opacity-100" : "opacity-0"
        )}
      />
      <div className="flex flex-col flex-1">
        <span className="font-medium">{option.name}</span>
        <span className="text-sm text-muted-foreground">
          {option.phone}
        </span>
      </div>
    </>
  );

  const handleClose = () => {
    formik.resetForm();
    setPartySearchResults([]);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px]" dir={isRTL ? 'rtl' : 'ltr'}>
        <DialogHeader>
          <DialogTitle>
            {isEditMode ? tExpenses('edit') : tExpenses('addNew')}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={formik.handleSubmit} className="space-y-6">
          {/* Employee Select - Only show in Add mode */}
          {!isEditMode && (
            <div className="space-y-2">
              <Label htmlFor="employee_id">{t('employee')} *</Label>
              <Select
                value={formik.values.employee_id}
                onValueChange={(value) => formik.setFieldValue('employee_id', value)}
                disabled={isLoading}
              >
                <SelectTrigger>
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

          {/* Party Select - Only show in Add mode */}
          {!isEditMode && (
            <div className="space-y-2">
              <Label htmlFor="client_id">{isArabic ? 'الموكل' : 'Client'}</Label>
              <SearchableCombobox
                value={formik.values.client_id}
                onValueChange={(value) => formik.setFieldValue('client_id', value)}
                onSearch={handlePartySearch}
                options={partyOptions}
                renderOption={renderPartyOption}
                placeholder={isArabic ? 'ابحث عن موكل...' : 'Search for client...'}
                searchPlaceholder={isArabic ? 'ابحث بالاسم أو الهاتف...' : 'Search by name or phone...'}
                emptyMessage={isArabic ? 'لم يتم العثور على نتائج' : 'No results found'}
                disabled={isLoading}
                minSearchLength={3}
              />
              {formik.touched.client_id && formik.errors.client_id && (
                <p className="text-sm text-red-500">{formik.errors.client_id}</p>
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
              min="0"
              placeholder={t('amountPlaceholder')}
              value={formik.values.amount}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              disabled={isLoading}
            />
            {formik.touched.amount && formik.errors.amount && (
              <p className="text-sm text-red-500">{formik.errors.amount}</p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">{t('description')}</Label>
            <Textarea
              id="description"
              name="description"
              placeholder={t('descriptionPlaceholder')}
              value={formik.values.description}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              rows={3}
              disabled={isLoading}
            />
          </div>

          {/* Submit Buttons */}
          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isLoading}
            >
              {t('cancel')}
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? t('saving') : (isEditMode ? t('update') : t('save'))}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ExpenseModal;
