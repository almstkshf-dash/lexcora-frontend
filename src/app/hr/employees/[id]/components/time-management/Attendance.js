
"use client";

import { useState } from "react";
import useSWR, { mutate } from "swr";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTranslations } from "@/hooks/useTranslations";
import AddAttendanceModal from "./AddAttendanceModal";
import UpdateAttendanceModal from "./UpdateAttendanceModal";
import { Loader2, Trash2, Edit, Plus } from "lucide-react";
import { toast } from "react-toastify";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { getEmployeeAttendance, deleteAttendance } from "@/app/services/api/attendance";

function Attendance({ employeeId }) {
  const { isRTL, language } = useLanguage();
  const { t } = useTranslations();

  // State for update modal
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);

  // SWR fetcher function
  const fetcher = async (url) => {
    const data = await getEmployeeAttendance(employeeId);
    if (data.success) {
      return {
        attendance: data.data.attendance || [],
        workHours: data.data.workHours || null,
      };
    } else {
      throw new Error(data.message || t("attendance.failedToFetchAttendance"));
    }
  };

  // Use SWR for data fetching
  const { data, error, isLoading } = useSWR(
    employeeId ? `/api/attendance/${employeeId}` : null,
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    }
  );

  const attendanceData = data?.attendance || [];
  const workHours = data?.workHours || null;

  // Show error toast if there's an error
  if (error) {
    toast.error(error.message || t("attendance.errorFetchingAttendance"));
  }

  const handleDelete = async (id) => {
    if (!confirm(t("attendance.confirmDeleteAttendance"))) return;

    try {
      const result = await deleteAttendance(id);

      if (result.success) {
        toast.success(t("attendance.attendanceDeletedSuccessfully"));
        // Mutate the SWR cache to refetch data
        mutate(`/api/attendance/${employeeId}`);
      } else {
        toast.error(result.message || t("attendance.failedToDeleteAttendance"));
      }
    } catch (error) {
      toast.error(t("attendance.errorDeletingAttendance"));
    }
  };

  // Callback function to refetch data after adding attendance
  const handleSuccess = () => {
    mutate(`/api/attendance/${employeeId}`);
  };

  // Handle edit button click
  const handleEdit = (record) => {
    setSelectedRecord(record);
    setIsUpdateModalOpen(true);
  };

  // Close update modal
  const handleCloseUpdateModal = () => {
    setIsUpdateModalOpen(false);
    setSelectedRecord(null);
  };

  // Helper function to format time from datetime
  const formatTime = (datetime) => {
    if (!datetime) return "-";
    const date = new Date(datetime);
    return date.toLocaleTimeString(language === "ar" ? "ar-AE" : "en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Helper function to format date
  const formatDate = (datetime) => {
    if (!datetime) return "-";
    const date = new Date(datetime);
    return date.toLocaleDateString(language === "ar" ? "ar-AE" : "en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Helper function to get weekday name
  const getWeekday = (datetime) => {
    if (!datetime) return "-";
    const date = new Date(datetime);
    return date.toLocaleDateString(language === "ar" ? "ar-AE" : "en-US", {
      weekday: "long",
    });
  };

  // Calculate delay in arrival (checkin time vs work start time)
  const calculateDelay = (checkin) => {
    if (!checkin || !workHours) return "-";

    const checkinDate = new Date(checkin);
    const checkinTime = checkinDate.getHours() * 60 + checkinDate.getMinutes();

    const [startHour, startMin] = workHours.start_time.split(":").map(Number);
    const workStartTime = startHour * 60 + startMin;

    const delayMinutes = checkinTime - workStartTime;

    if (delayMinutes <= 0) {
      return t("attendance.onTime");
    }

    const hours = Math.floor(delayMinutes / 60);
    const minutes = delayMinutes % 60;

    if (hours > 0) {
      return `${hours} ${t("attendance.hours")} ${minutes} ${t("attendance.minutes")}`;
    }
    return `${minutes} ${t("attendance.minutes")}`;
  };

  // Calculate early departure (checkout time vs work end time)
  const calculateEarlyDeparture = (checkout) => {
    if (!checkout || !workHours) return "-";

    const checkoutDate = new Date(checkout);
    const checkoutTime =
      checkoutDate.getHours() * 60 + checkoutDate.getMinutes();

    const [endHour, endMin] = workHours.end_time.split(":").map(Number);
    const workEndTime = endHour * 60 + endMin;

    const earlyMinutes = workEndTime - checkoutTime;

    if (earlyMinutes <= 0) {
      return t("attendance.onTime");
    }

    const hours = Math.floor(earlyMinutes / 60);
    const minutes = earlyMinutes % 60;

    if (hours > 0) {
      return `${hours} ${t("attendance.hours")} ${minutes} ${t("attendance.minutes")}`;
    }
    return `${minutes} ${t("attendance.minutes")}`;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">{t("attendance.attendance")}</h2>
        <AddAttendanceModal employeeId={employeeId} onSuccess={handleSuccess}>
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            {t("attendance.addAttendance")}
          </Button>
        </AddAttendanceModal>
      </div>

      {attendanceData.length === 0 ? (
        <div className="text-center p-8 border rounded-lg">
          <p className="text-muted-foreground">{t("attendance.noAttendanceRecords")}</p>
        </div>
      ) : (
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("attendance.employeeName")}</TableHead>
                <TableHead>{t("attendance.date")}</TableHead>
                <TableHead>{t("attendance.weekday")}</TableHead>
                <TableHead>{t("attendance.checkInTime")}</TableHead>
                <TableHead>{t("attendance.delay")}</TableHead>
                <TableHead>{t("attendance.checkOutTime")}</TableHead>
                <TableHead>{t("attendance.earlyDeparture")}</TableHead>
                <TableHead>{t("common.actions")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {Array.isArray(attendanceData) && attendanceData.map((record) => (
                <TableRow key={record.id}>
                  <TableCell className="font-medium">
                    {language === "ar" ? record.name : 'not available'}
                  </TableCell>
                  <TableCell>{formatDate(record.checkin)}</TableCell>
                  <TableCell>{getWeekday(record.checkin)}</TableCell>
                  <TableCell>{formatTime(record.checkin)}</TableCell>
                  <TableCell>
                    <span
                      className={
                        calculateDelay(record.checkin) === t("attendance.onTime")
                          ? "text-green-600 dark:text-green-400"
                          : "text-red-600 dark:text-red-400"
                      }
                    >
                      {calculateDelay(record.checkin)}
                    </span>
                  </TableCell>
                  <TableCell>{formatTime(record.checkout)}</TableCell>
                  <TableCell>
                    <span
                      className={
                        calculateEarlyDeparture(record.checkout) === t("attendance.onTime")
                          ? "text-green-600 dark:text-green-400"
                          : "text-red-600 dark:text-red-400"
                      }
                    >
                      {calculateEarlyDeparture(record.checkout)}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(record)}
                        className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-950"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(record.id)}
                        className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Update Attendance Modal */}
      <UpdateAttendanceModal
        attendanceRecord={selectedRecord}
        isOpen={isUpdateModalOpen}
        onClose={handleCloseUpdateModal}
        onSuccess={handleSuccess}
      />
    </div>
  );
}

export default Attendance;
