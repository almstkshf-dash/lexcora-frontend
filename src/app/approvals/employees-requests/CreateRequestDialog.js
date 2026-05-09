'use client';

import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { createEmployeeRequest } from '@/app/services/api/employeeRequests';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTranslations } from '@/hooks/useTranslations';
import { toast } from 'react-toastify';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

function CreateRequestDialog({ isOpen, onClose, onSuccess }) {
  const { language } = useLanguage();
  const t = useTranslations('employeesRequests');
  const tCommon = useTranslations('common');
  const user = useSelector((state) => state.auth.user);
  const employeeId = user?.id;
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    type: '',
    from_date: '',
    to_date: '',
  });

  // Request types - matching HR requests format (using Arabic values)
  const requestTypes = [
    { 
      value: 'اجازة سنوية', 
      label: t('types.annualLeave'),
      isLeave: true 
    },
    { 
      value: 'اجازة مرضية', 
      label: t('types.sickLeave'),
      isLeave: true 
    },
    { 
      value: 'اجازة الوضع', 
      label: t('types.paternityLeave'),
      isLeave: true 
    },
    { 
      value: 'اجازة الحداد', 
      label: t('types.mourningLeave'),
      isLeave: true 
    },
    { 
      value: 'اجازة التفرغ لإداء الخدمة الوطنية', 
      label: t('types.nationalService'),
      isLeave: true 
    },
    { 
      value: 'اجازة الحج والعمرة', 
      label: t('types.hajjUmrah'),
      isLeave: true 
    },
    { 
      value: 'شهادة راتب', 
      label: t('types.salaryCertificate'),
      isLeave: false 
    },
    { 
      value: 'شهادة خبرة', 
      label: t('types.experienceCertificate'),
      isLeave: false 
    },
    { 
      value: 'شهادة لا مانع', 
      label: t('types.noc'),
      isLeave: false 
    },
    { 
      value: 'بدل اجازة سنوية', 
      label: t('types.annualLeaveAllowance'),
      isLeave: false 
    },
    { 
      value: 'اخرى', 
      label: t('types.other'),
      isLeave: false 
    }
  ];

  // Check if selected type is a leave type (requires dates)
  const isLeaveType = requestTypes.find(rt => rt.value === formData.type)?.isLeave || false;

  // Get today's date in YYYY-MM-DD format for min date
  const today = new Date().toISOString().split('T')[0];

  const handleInputChange = (name, value) => {
    setFormData(prev => {
      const newData = { ...prev, [name]: value };
      
      // If changing from_date and to_date is before the new from_date, clear to_date
      if (name === 'from_date' && prev.to_date && value > prev.to_date) {
        newData.to_date = '';
      }
      
      return newData;
    });
  };

  const handleSubmit = async () => {
    // Validation
    if (!formData.type) {
      toast.error(t('selectRequestType'));
      return;
    }

    // Validate dates for leave types only
    if (isLeaveType) {
      if (!formData.from_date) {
        toast.error(t('pleaseSelectFromDate'));
        return;
      }
      if (!formData.to_date) {
        toast.error(t('pleaseSelectToDate'));
        return;
      }
    }

    setIsSubmitting(true);
    
    try {
      const requestData = {
        employee_id: employeeId,
        type: formData.type,
        from_date: formData.from_date || null,
        to_date: formData.to_date || null,
      };

      await createEmployeeRequest(requestData);
      
      toast.success(t('requestCreated'));
      
      // Reset form
      setFormData({
        type: '',
        from_date: '',
        to_date: '',
      });
      
      if (onSuccess) onSuccess();
      if (onClose) onClose();
    } catch (error) {
      toast.error(t('errorCreating'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {t('newRequest')}
          </DialogTitle>
          <DialogDescription>
            {t('createRequestSubtitle')}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          {/* Request Type */}
          <div className="space-y-2">
            <Label htmlFor="type">
              {t('requestType')}
              <span className="text-red-500 ml-1">*</span>
            </Label>
            <Select 
              value={formData.type} 
              onValueChange={(value) => handleInputChange('type', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder={t('selectRequestType')} />
              </SelectTrigger>
              <SelectContent>
                {requestTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {formData.type && (
              <p className="text-xs text-muted-foreground">
                {isLeaveType ? t('requiresDates') : t('noDatesRequired')}
              </p>
            )}
          </div>

          {/* From Date - Only for leave types */}
          {isLeaveType && (
            <div className="space-y-2">
              <Label htmlFor="from_date">
                {t('fromDate')}
                <span className="text-red-500 ml-1">*</span>
              </Label>
              <Input
                id="from_date"
                type="date"
                value={formData.from_date}
                min={today}
                onChange={(e) => handleInputChange('from_date', e.target.value)}
              />
            </div>
          )}

          {/* To Date - Only for leave types */}
          {isLeaveType && (
            <div className="space-y-2">
              <Label htmlFor="to_date">
                {t('toDate')}
                <span className="text-red-500 ml-1">*</span>
              </Label>
              <Input
                id="to_date"
                type="date"
                value={formData.to_date}
                min={formData.from_date || today}
                onChange={(e) => handleInputChange('to_date', e.target.value)}
              />
            </div>
          )}
        </div>
        
        <DialogFooter>
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isSubmitting}
          >
            {tCommon('cancel')}
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? t('creating') : t('create')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default CreateRequestDialog;
