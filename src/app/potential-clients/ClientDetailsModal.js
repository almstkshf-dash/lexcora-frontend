"use client";

import { useState } from "react";
import useSWR, { mutate } from "swr";
import { getPartyById } from "../services/api/parties";
import { deletePartyDocument } from "../services/api/partiesDocuments";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, User, Phone, FileText, Calendar, Globe, UserCheck, Building, MessageSquare, MapPin, Download, ExternalLink, Trash2, FolderOpen } from "lucide-react";
import { useTranslations } from "@/hooks/useTranslations";
import { toast } from "react-toastify";

export function ClientDetailsModal({ clientId, isOpen, onClose }) {
  const { t } = useTranslations();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [fileToDelete, setFileToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Use SWR for data fetching.
  // Key is a plain string (not array) so mutate() can match it.
  // Gated on isOpen so closing the modal does not null-out the cache mid-fetch.
  const { data: rawData, error, isLoading } = useSWR(
    isOpen && clientId ? `/parties/${clientId}` : null,
    () => getPartyById(clientId),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      keepPreviousData: true,
    }
  );
  // Unwrap the server envelope if present: { success, data: {...} }
  // Falls through to rawData itself when the server returns the record bare.
  const rawUnwrapped = rawData?.data ?? rawData ?? null;
  const data = rawUnwrapped && Object.keys(rawUnwrapped).length > 0 ? rawUnwrapped : null;

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Translates the account status field ("active" / "inactive") stored in the DB.
  const getTranslatedStatus = (status) => {
    if (!status) return "-";
    const statusMap = {
      // Account state values (stored by AddClientModal / EditClientModal)
      "active":   t("potentialClientsPage.status.active")   || "نشط",
      "inactive": t("potentialClientsPage.status.inactive") || "غير نشط",
      // Legacy pipeline-stage strings kept for backward compatibility
      "جديد":         t("potentialClientsPage.status.new"),
      "تم التواصل":   t("potentialClientsPage.status.contacted"),
      "مؤهل":         t("potentialClientsPage.status.qualified"),
      "غير مؤهل":     t("potentialClientsPage.status.notQualified"),
      "تحويل موكل":   t("potentialClientsPage.status.convertToClient"),
      "New":          t("potentialClientsPage.status.new"),
      "Contacted":    t("potentialClientsPage.status.contacted"),
      "Converted":    t("potentialClientsPage.status.qualified"),
      "Rejected":     t("potentialClientsPage.status.notQualified"),
    };
    return statusMap[status] || status;
  };

  const getStatusColor = (status) => {
    if (status === "active") {
      return "bg-green-100 text-green-800 border-green-200";
    } else if (status === "inactive") {
      return "bg-red-100 text-red-800 border-red-200";
    } else if (status === "جديد" || status === "New") {
      return "bg-green-100 text-green-800 border-green-200";
    } else if (status === "تم التواصل" || status === "Contacted") {
      return "bg-yellow-100 text-yellow-800 border-yellow-200";
    } else if (status === "مؤهل") {
      return "bg-blue-100 text-blue-800 border-blue-200";
    } else if (status === "غير مؤهل") {
      return "bg-red-100 text-red-800 border-red-200";
    } else if (status === "تحويل موكل") {
      return "bg-purple-100 text-purple-800 border-purple-200";
    }
    return "bg-gray-100 text-gray-800 border-gray-200";
  };

  const handleDeleteFile = async (fileId, fileName) => {
    setFileToDelete({ id: fileId, name: fileName });
    setDeleteDialogOpen(true);
  };

  const confirmDeleteFile = async () => {
    if (!fileToDelete) return;
    
    setIsDeleting(true);
    try {
      await deletePartyDocument(fileToDelete.id);
      
      // Refresh the data
      mutate(`/parties/${clientId}`);
      
      toast.success(t("potentialClientsPage.files.deleteSuccess") || "تم حذف الملف بنجاح");
      setDeleteDialogOpen(false);
      setFileToDelete(null);
    } catch (error) {

      toast.error(t("potentialClientsPage.files.deleteError") || "فشل حذف الملف");
    } finally {
      setIsDeleting(false);
    }
  };

  // `data` is already unwrapped above (envelope-safe)
  const client = data;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold flex items-center gap-2">
            <User className="h-5 w-5" />
            {t("potentialClientsPage.modal.title")}
          </DialogTitle>
          <DialogDescription>
            {t("potentialClientsPage.modal.description")}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              <span className="ml-2">{t("potentialClientsPage.messages.loading")}</span>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center py-12 text-destructive">
              <p>{t("potentialClientsPage.messages.error")}</p>
            </div>
          ) : !client ? (
            <div className="flex items-center justify-center py-12 text-muted-foreground">
              <p>{t("potentialClientsPage.messages.noResults")}</p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Basic Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <User className="h-4 w-4" />
                    {t("potentialClientsPage.modal.basicInfo")}
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      {t("potentialClientsPage.table.name")}
                    </label>
                    <p className="text-sm font-semibold">{client.name}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                      <Phone className="h-3 w-3" />
                      {t("potentialClientsPage.table.phone")}
                    </label>
                    <p className="text-sm">{client.phone || "-"}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      {t("potentialClientsPage.table.status")}
                    </label>
                    <div className="mt-1">
                      <Badge 
                        variant="outline" 
                        className={getStatusColor(client.status)}
                      >
                        {getTranslatedStatus(client.status)}
                      </Badge>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                      <Building className="h-3 w-3" />
                      {t("potentialClientsPage.modal.category")}
                    </label>
                    <p className="text-sm capitalize">{client.category || "-"}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                      <MessageSquare className="h-3 w-3" />
                      {t("potentialClientsPage.modal.consultationType")}
                    </label>
                    <p className="text-sm">{client.consultation_type || "-"}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {t("potentialClientsPage.modal.branch")}
                    </label>
                    <p className="text-sm">
                      {client.branch_name_ar && client.branch_name_en 
                        ? `${client.branch_name_ar} / ${client.branch_name_en}`
                        : client.branch_name_ar || client.branch_name_en || "-"
                      }
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Additional Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    {t("potentialClientsPage.modal.additionalInfo")}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                      <Globe className="h-3 w-3" />
                      {t("potentialClientsPage.table.source")}
                    </label>
                    <p className="text-sm">{client.source || "-"}</p>
                  </div>
                  {client.note && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">
                        {t("potentialClientsPage.modal.notes")}
                      </label>
                      <div className="mt-1 p-3 bg-muted rounded-md">
                        <p className="text-sm whitespace-pre-wrap">{client.note}</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Tracking Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    {t("potentialClientsPage.modal.trackingInfo")}
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                      <UserCheck className="h-3 w-3" />
                      {t("potentialClientsPage.table.createdBy")}
                    </label>
                    <p className="text-sm">{client.created_by_name || "-"}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {t("potentialClientsPage.table.createdAt")}
                    </label>
                    <p className="text-sm">{formatDate(client.created_at)}</p>
                  </div>
                  {client.updated_at && (
                    <div className="md:col-span-2">
                      <label className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {t("potentialClientsPage.modal.updatedAt")}
                      </label>
                      <p className="text-sm">{formatDate(client.updated_at)}</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Documents Section */}
              {client?.documents && client.documents.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <FolderOpen className="h-4 w-4" />
                      {t("potentialClientsPage.files.title") || "المستندات"}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {client.documents.map((file) => (
                        <div 
                          key={file.id} 
                          className="flex items-center justify-between p-3 bg-muted rounded-lg hover:bg-muted/80 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <FileText className="h-5 w-5 text-blue-500" />
                            <div>
                              <p className="text-sm font-medium">{file.document_name}</p>
                              {file.created_at && (
                                <p className="text-xs text-muted-foreground">
                                  {formatDate(file.created_at)}
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-1">
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => window.open(file.url, '_blank')}
                              title={t("potentialClientsPage.files.open") || "فتح الملف"}
                            >
                              <ExternalLink className="h-4 w-4 text-blue-500" />
                            </Button>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                const link = document.createElement('a');
                                link.href = file.document_url;
                                link.download = file.document_url;
                                document.body.appendChild(link);
                                link.click();
                                document.body.removeChild(link);
                              }}
                              title={t("potentialClientsPage.files.download") || "تحميل الملف"}
                            >
                              <Download className="h-4 w-4 text-green-500" />
                            </Button>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteFile(file.id, file.name)}
                              title={t("potentialClientsPage.files.delete") || "حذف الملف"}
                            >
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </div>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>
                {t("potentialClientsPage.files.deleteConfirmTitle") || "تأكيد حذف الملف"}
              </AlertDialogTitle>
              <AlertDialogDescription>
                {t("potentialClientsPage.files.deleteConfirmMessage") || "هل أنت متأكد من حذف الملف"} {fileToDelete?.name}؟
                <br />
                {t("potentialClientsPage.files.deleteWarning") || "لا يمكن التراجع عن هذا الإجراء."}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isDeleting}>
                {t("potentialClientsPage.editModal.cancel") || "إلغاء"}
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={confirmDeleteFile}
                disabled={isDeleting}
                className="bg-red-500 hover:bg-red-600"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    {t("potentialClientsPage.files.deleting") || "جاري الحذف..."}
                  </>
                ) : (
                  <>
                    <Trash2 className="h-4 w-4 mr-2" />
                    {t("potentialClientsPage.files.delete") || "حذف"}
                  </>
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </DialogContent>
    </Dialog>
  );
}