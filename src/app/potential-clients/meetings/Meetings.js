"use client";

import { useState } from "react";
import useSWR from "swr";
import meetingsApi from "../../services/api/meetings";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, User, MapPin, Monitor, Users, Search, Loader2, Eye, Edit, Trash2, FileText } from "lucide-react";
import { useTranslations } from "@/hooks/useTranslations";
import { useLanguage } from "@/contexts/LanguageContext";
import ExportButtons from "@/components/ui/export-buttons";
import { EditMeetingModal } from "./EditMeetingModal";
import { DeleteMeetingModal } from "./DeleteMeetingModal";
import { MeetingsFilterSearch } from "./MeetingsFilterSearch";
import MeetingDocumentsModal from "../../meetings/MeetingDocumentsModal";
import ViewMeetingDialog from "../../meetings/ViewMeetingDialog";

function Meetings({ headerAction }) {
  const { t } = useTranslations();
  const { language } = useLanguage();
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({
    searchTerm: "",
    meet_result: "all",
    meeting_type: "all",
    date: ""
  });
  const [selectedMeetingId, setSelectedMeetingId] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedMeetingForDelete, setSelectedMeetingForDelete] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedMeetingForView, setSelectedMeetingForView] = useState(null);
  const limit = 10;

  // SWR fetcher function
  const fetcher = () => {
    const params = {
      page,
      limit,
    };

    // Add filters if they exist
    if (filters.searchTerm) {
      params.search = filters.searchTerm;
    }
    if (filters.meet_result && filters.meet_result !== "all") {
      params.meet_result = filters.meet_result;
    }
    if (filters.meeting_type && filters.meeting_type !== "all") {
      params.meeting_type = filters.meeting_type;
    }
    if (filters.date) {
      params.date = filters.date;
    }

    return meetingsApi.getMeetings(params);
  };

  // Use SWR for data fetching
  const { data, error, isLoading, mutate } = useSWR(
    [`/meetings`, page, filters.searchTerm, filters.meet_result, filters.meeting_type, filters.date],
    fetcher,
    {
      revalidateOnFocus: false,
      keepPreviousData: true,
    }
  );

  // Handle search from FilterSearch component
  const handleSearch = (newFilters) => {
    setFilters(newFilters);
    setPage(1); // Reset to first page when searching
  };

  const handlePageChange = (newPage) => {
    setPage(newPage);
  };

  const handleEditMeeting = (meetingId) => {
    setSelectedMeetingId(meetingId);
    setIsEditModalOpen(true);
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setSelectedMeetingId(null);
  };

  const handleEditSuccess = () => {
    // Refresh the meetings data
    mutate();
  };

  const handleDeleteMeeting = (meeting) => {
    setSelectedMeetingForDelete(meeting);
    setIsDeleteModalOpen(true);
  };

  const handleCloseDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setSelectedMeetingForDelete(null);
  };

  const handleDeleteSuccess = () => {
    // Refresh the meetings data
    mutate();
  };

  const handleViewMeeting = (meetingId) => {
    setSelectedMeetingForView(meetingId);
    setIsViewModalOpen(true);
  };

  const handleCloseViewModal = () => {
    setIsViewModalOpen(false);
    setSelectedMeetingForView(null);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatTime = (timeString) => {
    if (!timeString) return "-";
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      "scheduled": { color: "bg-blue-100 text-blue-800", label: t("meetings.results.scheduled") },
      "completed": { color: "bg-green-100 text-green-800", label: t("meetings.results.completed") },
      "cancelled": { color: "bg-red-100 text-red-800", label: t("meetings.results.cancelled") },
      "rescheduled": { color: "bg-yellow-100 text-yellow-800", label: t("meetings.results.rescheduled") },
      "no_show": { color: "bg-gray-100 text-gray-800", label: t("meetings.results.noShow") }
    };

    const config = statusConfig[status] || { color: "bg-gray-100 text-gray-800", label: status };
    
    return (
      <Badge className={`${config.color} border-0`}>
        {config.label}
      </Badge>
    );
  };

  const getMeetingTypeIcon = (type) => {
    if (type === "online") {
      return <Monitor className="h-4 w-4 inline mr-1" />;
    } else if (type === "onsite") {
      return <Users className="h-4 w-4 inline mr-1" />;
    }
    return null;
  };

  const getMeetingTypeLabel = (type) => {
    if (type === "online") {
      return t("meetings.types.online");
    } else if (type === "onsite") {
      return t("meetings.types.onsite");
    }
    return "-";
  };

  // Column configuration for export
  const meetingsColumnConfig = {
    id: {
      ar: 'المعرف',
      en: 'ID',
      dataKey: 'id'
    },
    client_name: {
      ar: 'اسم العميل',
      en: 'Client Name',
      dataKey: 'client_name'
    },
    client_phone: {
      ar: 'رقم الهاتف',
      en: 'Phone Number',
      dataKey: 'client_phone'
    },
    address: {
      ar: 'العنوان',
      en: 'Address',
      dataKey: 'address'
    },
    date: {
      ar: 'التاريخ',
      en: 'Date',
      dataKey: 'date',
      type: 'date'
    },
    start_time: {
      ar: 'وقت البداية',
      en: 'Start Time',
      dataKey: 'start_time',
      formatter: (value) => value ? formatTime(value) : '-'
    },
    end_time: {
      ar: 'وقت النهاية',
      en: 'End Time',
      dataKey: 'end_time',
      formatter: (value) => value ? formatTime(value) : '-'
    },
    meeting_type: {
      ar: 'نوع الاجتماع',
      en: 'Meeting Type',
      dataKey: 'meeting_type',
      formatter: (value) => getMeetingTypeLabel(value)
    },
    attendees: {
      ar: 'الحضور',
      en: 'Attendees',
      dataKey: 'attendees'
    },
    meet_result: {
      ar: 'الحالة',
      en: 'Status',
      dataKey: 'meet_result',
      type: 'status',
      statusMap: {
        'scheduled': { ar: 'مجدول', en: 'Scheduled' },
        'completed': { ar: 'مكتمل', en: 'Completed' },
        'cancelled': { ar: 'ملغي', en: 'Cancelled' },
        'rescheduled': { ar: 'معاد جدولته', en: 'Rescheduled' },
        'no_show': { ar: 'لم يحضر', en: 'No Show' }
      }
    },
    notes: {
      ar: 'ملاحظات',
      en: 'Notes',
      dataKey: 'notes'
    }
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl font-bold flex items-center gap-2">
              <Calendar className="h-6 w-6" />
              {t("meetings.title")}
            </CardTitle>
            {headerAction && <div>{headerAction}</div>}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Filters - Now in separate component */}
          <MeetingsFilterSearch onSearch={handleSearch} />

          {/* Export Buttons */}
          {data?.data && data.data.length > 0 && !isLoading && !error && (
            <ExportButtons
              data={data.data}
              columnConfig={meetingsColumnConfig}
              language={language}
              exportName="meetings"
              sheetName={language === 'ar' ? 'الاجتماعات' : 'Meetings'}
            />
          )}

          {/* Table */}
          <div className="rounded-md border">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                <span className="ml-2">{t("meetings.messages.loading")}</span>
              </div>
            ) : error ? (
              <div className="flex items-center justify-center py-12 text-destructive">
                <p>{t("meetings.messages.error")}</p>
              </div>
            ) : !Array.isArray(data?.data) || data.data.length === 0 ? (
              <div className="flex items-center justify-center py-12 text-muted-foreground">
                <p>{t("meetings.messages.noResults")}</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t("meetings.table.id")}</TableHead>
                    <TableHead>{t("meetings.table.client")}</TableHead>
                    <TableHead>{t("meetings.table.address")}</TableHead>
                    <TableHead>{t("meetings.table.date")}</TableHead>
                    <TableHead>{t("meetings.table.time")}</TableHead>
                    <TableHead>{t("meetings.table.type")}</TableHead>
                    <TableHead>{t("meetings.table.attendees")}</TableHead>
                    <TableHead>{t("meetings.table.status")}</TableHead>
                    <TableHead>{t("meetings.table.notes")}</TableHead>
                    <TableHead className="text-center">{t("meetings.table.actions")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.data.map((meeting) => (
                    <TableRow key={meeting.id}>
                      <TableCell className="font-medium">{meeting.id}</TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{meeting.client_name || "-"}</div>
                          {meeting.client_phone && (
                            <div className="text-sm text-muted-foreground">{meeting.client_phone}</div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          {meeting.address || "-"}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          {formatDate(meeting.date)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <div className="text-sm">
                            {meeting.start_time && meeting.end_time ? (
                              <span>{formatTime(meeting.start_time)} - {formatTime(meeting.end_time)}</span>
                            ) : meeting.start_time ? (
                              <span>{formatTime(meeting.start_time)}</span>
                            ) : (
                              "-"
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          {getMeetingTypeIcon(meeting.meeting_type)}
                          {getMeetingTypeLabel(meeting.meeting_type)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Users className="h-4 w-4 text-muted-foreground" />
                          <Badge variant="secondary">
                            {meeting.attendees_count || 0}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(meeting.meet_result)}
                      </TableCell>
                      <TableCell className="max-w-xs">
                        {meeting.note ? (
                          <div 
                            className="truncate line-clamp-2"
                            dangerouslySetInnerHTML={{ __html: meeting.note }}
                          />
                        ) : (
                          <span>-</span>
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleViewMeeting(meeting.id)}
                            title={t("meetings.actions.view")}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <MeetingDocumentsModal 
                            meetingId={meeting.id}
                            meetingTitle={`${t("meetings.title")} - ${meeting.client_name} - ${formatDate(meeting.date)}`}
                          >
                            <Button
                              variant="ghost"
                              size="icon"
                              title={t("meetings.actions.documents")}
                            >
                              <FileText className="h-4 w-4" />
                            </Button>
                          </MeetingDocumentsModal>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEditMeeting(meeting.id)}
                            title={t("meetings.actions.edit")}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteMeeting(meeting)}
                            title={t("meetings.actions.delete")}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>

          {/* Pagination */}
          {data?.pagination && (
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                {t("meetings.pagination.showing", {
                  count: data.data.length,
                  total: data.pagination.total
                })}
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(page - 1)}
                  disabled={page <= 1}
                >
                  {t("meetings.pagination.previous")}
                </Button>
                <span className="text-sm">
                  {t("meetings.pagination.pageInfo", {
                    current: data.pagination.page,
                    total: data.pagination.totalPages
                  })}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(page + 1)}
                  disabled={page >= data.pagination.totalPages}
                >
                  {t("meetings.pagination.next")}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Meeting Modal */}
      <EditMeetingModal 
        isOpen={isEditModalOpen}
        onClose={handleCloseEditModal}
        meetingId={selectedMeetingId}
        onSuccess={handleEditSuccess}
      />

      {/* Delete Meeting Modal */}
      <DeleteMeetingModal 
        isOpen={isDeleteModalOpen}
        onClose={handleCloseDeleteModal}
        meetingId={selectedMeetingForDelete?.id}
        meetingTitle={selectedMeetingForDelete ? `Meeting with ${selectedMeetingForDelete.client_name || 'Client'} on ${formatDate(selectedMeetingForDelete.date)}` : ''}
        onSuccess={handleDeleteSuccess}
      />

      {/* View Meeting Dialog */}
      <ViewMeetingDialog
        isOpen={isViewModalOpen}
        onClose={handleCloseViewModal}
        meetingId={selectedMeetingForView}
      />
    </div>
  );
}

export default Meetings;