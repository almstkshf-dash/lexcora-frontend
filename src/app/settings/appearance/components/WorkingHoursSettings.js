'use client';
import React, { useState, useEffect } from 'react';
import { Clock, Save } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { useTranslations } from '@/hooks/useTranslations';
import { getWorkingHours, updateWorkingHours } from '@/app/services/api/workHours';

const WorkingHoursSettings = () => {
  const { t } = useTranslations();
  
  const [workingHours, setWorkingHours] = useState({
    start_time: '09:00',
    end_time: '17:00'
  });
  
  const [isLoadingWorkHours, setIsLoadingWorkHours] = useState(false);
  const [isSavingWorkHours, setIsSavingWorkHours] = useState(false);

  // Fetch working hours on component mount
  const fetchWorkingHours = async () => {
    try {
      setIsLoadingWorkHours(true);
      const response = await getWorkingHours();
      
      if (response.success && response.data) {
        const formattedData = {
          start_time: formatTime(response.data.start_time) || '09:00',
          end_time: formatTime(response.data.end_time) || '17:00'
        };
        setWorkingHours(formattedData);
      }
    } catch (error) {

      // Keep default values on error
    } finally {
      setIsLoadingWorkHours(false);
    }
  };

  // Format time to ensure HH:MM format (strips seconds if present)
  const formatTime = (time) => {
    if (!time) return '09:00';
    
    // Handle both HH:MM and HH:MM:SS formats
    const parts = time.split(':');
    if (parts.length >= 2) {
      const hours = parts[0].padStart(2, '0');
      const minutes = parts[1].padStart(2, '0');
      return `${hours}:${minutes}`;
    }
    
    return time;
  };

  // Update working hours
  const updateWorkingHoursHandler = async () => {
    try {
      setIsSavingWorkHours(true);
      
      // Ensure proper time format
      const formattedData = {
        start_time: formatTime(workingHours.start_time),
        end_time: formatTime(workingHours.end_time)
      };
      
      const response = await updateWorkingHours(formattedData);
      if (response.success) {
        // Show success message (you might want to add a toast notification here)
        alert(t('settings.workingHoursUpdated'));
      }
    } catch (error) {


      // Show error message
      alert(error.response?.data?.message || 'Error updating working hours');
    } finally {
      setIsSavingWorkHours(false);
    }
  };

  // Fetch working hours on component mount
  useEffect(() => {
    fetchWorkingHours();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          {t('settings.workingHours')}
        </CardTitle>
        <CardDescription>
          {t('settings.workingHoursDescription')}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>{t('meetings.fields.startTime')}</Label>
          <Input
            type="time"
            value={workingHours.start_time}
            onChange={(e) => setWorkingHours(prev => ({
              ...prev,
              start_time: e.target.value
            }))}
            disabled={isLoadingWorkHours || isSavingWorkHours}
            className="w-full"
          />
        </div>

        <div className="space-y-2">
          <Label>{t('meetings.fields.endTime')}</Label>
          <Input
            type="time"
            value={workingHours.end_time}
            onChange={(e) => setWorkingHours(prev => ({
              ...prev,
              end_time: e.target.value
            }))}
            disabled={isLoadingWorkHours || isSavingWorkHours}
            className="w-full"
          />
        </div>

        <Separator />

        <div className="flex justify-end">
          <Button
            onClick={updateWorkingHoursHandler}
            disabled={isSavingWorkHours || isLoadingWorkHours}
            className="flex items-center gap-2"
          >
            <Save className="h-4 w-4" />
            {isSavingWorkHours ? t('common.saving') : t('settings.updateWorkingHours')}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default WorkingHoursSettings;