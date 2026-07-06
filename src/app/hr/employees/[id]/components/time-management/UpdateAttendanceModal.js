"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { CircleX, Loader2 } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTranslations } from "@/hooks/useTranslations";
import { toast } from "react-toastify";
import { DateTimePicker } from "@/components/ui/datetime-picker";
import { parseUTCDate, toUTCISOString } from "@/utils/dateUtils";
import { Label } from "@/components/ui/label";
import { updateAttendance } from "@/app/services/api/attendance";

// Custom Modal Component
const Modal = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className="relative z-10 bg-white dark:bg-black rounded-lg shadow-2xl max-h-[90vh] overflow-y-auto w-full max-w-2xl">
        {children}
      </div>
    </div>
  );
};

export default function UpdateAttendanceModal({ 
  attendanceRecord,
  isOpen,
  onClose,
  onSuccess
}) {
  const { isRTL, language } = useLanguage();
  const { t } = useTranslations();

  const [isSaving, setIsSaving] = useState(false);
  const [checkinDate, setCheckinDate] = useState(null);
  const [checkoutDate, setCheckoutDate] = useState(null);

  // Initialize form with existing data when modal opens
  useEffect(() => {
    if (isOpen && attendanceRecord) {
      setCheckinDate(attendanceRecord.checkin ? parseUTCDate(attendanceRecord.checkin) : null);
      setCheckoutDate(attendanceRecord.checkout ? parseUTCDate(attendanceRecord.checkout) : null);
    }
  }, [isOpen, attendanceRecord]);

  const handleClose = () => {
    setCheckinDate(null);
    setCheckoutDate(null);
    onClose();
  };

  // Handle check-in change and auto-set checkout
  const handleCheckinChange = (date) => {
    setCheckinDate(date);
    
    // If checkout is empty or on a different date, update it to same date
    if (date && (!checkoutDate || !isSameDate(checkoutDate, date))) {
      const newCheckoutDate = new Date(date);
      
      // Set checkout time to 5 PM (17:00) on the same date if checkin is before that
      if (date.getHours() < 17) {
        newCheckoutDate.setHours(17, 0, 0, 0);
      } else {
        // If checkin is after 5 PM, set checkout to 1 hour later
        newCheckoutDate.setHours(date.getHours() + 1, date.getMinutes(), 0, 0);
      }
      
      setCheckoutDate(newCheckoutDate);
    }
  };

  // Handle checkout change with validation
  const handleCheckoutChange = (date) => {
    // Validate that checkout is on the same date as checkin
    if (checkinDate && date) {
      if (!isSameDate(checkinDate, date)) {
        toast.warning(t("attendance.checkoutMustBeSameDate"));
        return;
      }
      
      // Validate that checkout is after checkin
      if (date.getTime() <= checkinDate.getTime()) {
        toast.warning(t("attendance.checkoutMustBeAfterCheckin"));
        return;
      }
    }
    
    setCheckoutDate(date);
  };

  // Helper function to check if two datetime are on the same date
  const isSameDate = (date1, date2) => {
    return (
      date1.getFullYear() === date2.getFullYear() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getDate() === date2.getDate()
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const checkinString = toUTCISOString(checkinDate);
    const checkoutString = toUTCISOString(checkoutDate);

    
    if (!checkinDate) {
      toast.error(t("attendance.checkInRequired"));
      return;
    }

    if (!attendanceRecord?.id) {
      toast.error(t("attendance.invalidAttendanceRecord"));
      return;
    }

    setIsSaving(true);

    try {
      const data = await updateAttendance(attendanceRecord.id, {
        checkin: checkinString,
        checkout: checkoutString,
      });

      if (data.success) {
        toast.success(t("attendance.attendanceUpdatedSuccessfully"));
        handleClose();
        if (onSuccess) onSuccess();
      } else {
        toast.error(data.message || t("attendance.failedToUpdateAttendance"));
      }
    } catch (error) {
      toast.error(t("attendance.errorUpdatingAttendance"));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose}>
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">
            {t("attendance.updateAttendance")}
          </h2>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
          >
            <CircleX className="h-6 w-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Check-in Date Time */}
          <div className="space-y-2">
            <Label htmlFor="checkin">
              {t("attendance.checkIn")} <span className="text-red-500">*</span>
            </Label>
            <DateTimePicker
              date={checkinDate}
              setDate={handleCheckinChange}
              placeholder={t("attendance.selectCheckInDateTime")}
            />
          </div>

          {/* Check-out Date Time */}
          <div className="space-y-2">
            <Label htmlFor="checkout">
              {t("attendance.checkOut")}
            </Label>
            <DateTimePicker
              date={checkoutDate}
              setDate={handleCheckoutChange}
              placeholder={t("attendance.selectCheckOutDateTime")}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 justify-end pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isSaving}
            >
              {t("common.cancel")}
            </Button>
            <Button
              type="submit"
              disabled={isSaving}
              className="gap-2"
            >
              {isSaving && <Loader2 className="h-4 w-4 animate-spin" />}
              {t("common.save")}
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
}
