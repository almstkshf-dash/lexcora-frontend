'use client';

import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { createClientDeal } from '@/app/services/api/clientsDeals';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTranslations } from '@/hooks/useTranslations';
import { cn } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import { toast } from 'react-toastify';

const CreateClientDealModal = ({ children, clientId, onDealCreated }) => {
  const { isRTL, language } = useLanguage();
  const { t } = useTranslations();
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    client_id: clientId || '',
    amount: '',
    type: 'normal',
    status: 'draft',
    start_date: '',
    end_date: ''
  });

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Validate required fields
      if (!formData.client_id || !formData.amount) {
        toast.error(language === 'ar' ? 'يرجى ملء جميع الحقول المطلوبة' : 'Please fill in all required fields');
        return;
      }

      // Prepare data for API
      const dealData = {
        client_id: formData.client_id,
        amount: parseFloat(formData.amount),
        type: formData.type,
        status: formData.status,
        start_date: formData.start_date || null,
        end_date: formData.end_date || null,
      };

      const response = await createClientDeal(dealData);

      if (response.success) {
        toast.success(language === 'ar' ? 'تم إنشاء الاتفاقية بنجاح' : 'Deal created successfully');

        // Reset form
        setFormData({
          client_id: clientId || '',
          amount: '',
          type: 'normal',
          status: 'draft',
          start_date: '',
          end_date: ''
        });

        setOpen(false);
        
        // Call the callback to refresh data
        if (onDealCreated) {
          onDealCreated();
        }
      }
    } catch (error) {

      toast.error(language === 'ar' ? 'حدث خطأ أثناء إنشاء الاتفاقية' : 'Failed to create deal');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className={cn("sm:max-w-[500px]", isRTL && "text-right")} dir={isRTL ? 'rtl' : 'ltr'}>
        <DialogHeader>
          <DialogTitle className={cn(isRTL && "text-right")}>
            {language === 'ar' ? 'إضافة اتفاقية جديدة' : 'Add New Deal'}
          </DialogTitle>
          <DialogDescription className={cn(isRTL && "text-right")}>
            {language === 'ar' ? 'أنشئ اتفاقية جديدة للعميل' : 'Create a new deal for the client'}
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4">
            {/* Amount */}
            <div className="space-y-2">
              <Label htmlFor="amount" className={cn(isRTL && "text-right")}>
                {language === 'ar' ? 'المبلغ' : 'Amount'} *
              </Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                placeholder={language === 'ar' ? 'أدخل المبلغ' : 'Enter amount'}
                value={formData.amount}
                onChange={(e) => handleInputChange('amount', e.target.value)}
                className={cn(isRTL && "text-right")}
                dir={isRTL ? 'rtl' : 'ltr'}
                required
              />
            </div>

            {/* Type */}
            <div className="space-y-2">
              <Label htmlFor="type" className={cn(isRTL && "text-right")}>
                {language === 'ar' ? 'نوع الاتفاقية' : 'Deal Type'}
              </Label>
              <Select value={formData.type} onValueChange={(value) => handleInputChange('type', value)}>
                <SelectTrigger className={cn(isRTL && "text-right")}>
                  <SelectValue placeholder={language === 'ar' ? 'اختر نوع الاتفاقية' : 'Select deal type'} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="normal">{language === 'ar' ? 'عادية' : 'Normal'}</SelectItem>
                  <SelectItem value="yearly">{language === 'ar' ? 'سنوية' : 'Yearly'}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Status */}
            <div className="space-y-2">
              <Label htmlFor="status" className={cn(isRTL && "text-right")}>
                {language === 'ar' ? 'الحالة' : 'Status'}
              </Label>
              <Select value={formData.status} onValueChange={(value) => handleInputChange('status', value)}>
                <SelectTrigger className={cn(isRTL && "text-right")}>
                  <SelectValue placeholder={language === 'ar' ? 'اختر الحالة' : 'Select status'} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">{language === 'ar' ? 'مسودة' : 'Draft'}</SelectItem>
                  <SelectItem value="completed">{language === 'ar' ? 'مكتملة' : 'Completed'}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Start Date */}
            <div className="space-y-2">
              <Label htmlFor="start_date" className={cn(isRTL && "text-right")}>
                {language === 'ar' ? 'تاريخ البدء' : 'Start Date'}
              </Label>
              <Input
                id="start_date"
                type="date"
                value={formData.start_date}
                onChange={(e) => handleInputChange('start_date', e.target.value)}
                className={cn(isRTL && "text-right")}
              />
            </div>

            {/* End Date */}
            <div className="space-y-2">
              <Label htmlFor="end_date" className={cn(isRTL && "text-right")}>
                {language === 'ar' ? 'تاريخ الانتهاء' : 'End Date'}
              </Label>
              <Input
                id="end_date"
                type="date"
                value={formData.end_date}
                onChange={(e) => handleInputChange('end_date', e.target.value)}
                className={cn(isRTL && "text-right")}
              />
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setOpen(false)}
              disabled={isLoading}
            >
              {language === 'ar' ? 'إلغاء' : 'Cancel'}
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  {language === 'ar' ? 'جاري الحفظ...' : 'Saving...'}
                </div>
              ) : (
                <>
                  <Plus className="w-4 h-4 me-2" />
                  {language === 'ar' ? 'إنشاء اتفاقية' : 'Create Deal'}
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateClientDealModal;