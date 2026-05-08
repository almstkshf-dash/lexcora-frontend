import React, { useMemo, useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useIsClient } from "@/hooks/useIsClient";
import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { CircleX, Clock, AlertCircle } from "lucide-react";
import { useTranslations } from "@/hooks/useTranslations";
import { useLanguage } from "@/contexts/LanguageContext";
import useSWR from "swr";
import { getEmployeeLogs } from "@/app/services/api/logs";

const getStatusColor = (action) => {
  switch (action) {
    case "login":
      return "text-white bg-green-600";
    case "logout":
      return "text-white bg-blue-600";
    case "add":
      return "text-white bg-green-500";
    case "update":
      return "text-white bg-blue-500";
    case "delete":
      return "text-white bg-red-600";
    case "error":
    case "failed_login":
      return "text-white bg-red-500";
    case "warning":
      return "text-white bg-yellow-500";
    case "other":
      return "text-white bg-gray-500";
    default:
      return "text-gray-600 bg-gray-200";
  }
};

export default function ActivityLogModal({ trigger, employee }) {
  const { t } = useTranslations();
  const { language } = useLanguage();
  const [open, setOpen] = useState(false);
  const [sortBy, setSortBy] = useState("newest");
  const employeeId = employee?.id;
  const locale = language === "ar" ? "ar-AE" : "en-US";

  const { data, error, isLoading, mutate } = useSWR(
    open && employeeId ? `employee-logs-${employeeId}` : null,
    () => getEmployeeLogs(employeeId),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      dedupingInterval: 30000,
      errorRetryCount: 3,
      errorRetryInterval: 1000,
    }
  );

  const getActionLabel = (action) => {
    switch (action) {
      case "login":
        return t("activityLog.login");
      case "logout":
        return t("activityLog.logout");
      case "add":
        return t("activityLog.add");
      case "update":
        return t("activityLog.update");
      case "delete":
        return t("activityLog.delete");
      case "error":
        return t("activityLog.error");
      case "failed_login":
        return t("activityLog.failedLogin");
      case "warning":
        return t("activityLog.warning");
      case "other":
        return t("activityLog.other");
      default:
        return action;
    }
  };

  const filteredLogs = useMemo(() => {
    const logs = data?.data || [];
    return [...logs].sort((a, b) => {
      const dateA = new Date(a.created_at);
      const dateB = new Date(b.created_at);
      return sortBy === "newest" ? dateB - dateA : dateA - dateB;
    });
  }, [data, sortBy]);


  const isClient = useIsClient();

  if (!open || !isClient) return (
    <span onClick={() => setOpen(true)} className="cursor-pointer">{trigger}</span>
  );

  const modalContent = (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
    >
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={() => setOpen(false)}
      />

      {/* Modal Content */}
      <div 
        className="relative z-10 bg-white dark:bg-slate-900 rounded-xl shadow-2xl w-full max-w-4xl max-h-[85vh] flex flex-col border border-border overflow-hidden"
        dir={language === 'ar' ? 'rtl' : 'ltr'}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center p-4 border-b border-border bg-card">
          <h2 className="text-lg font-bold text-foreground">{t("admins.activityLogTitle")}</h2>
          <Button variant="ghost" size="icon" onClick={() => setOpen(false)} aria-label={t("common.close")}>
            <CircleX className="w-5 h-5" />
          </Button>
        </div>

        <div className="flex gap-2 p-4 border-b border-border bg-card">
          <Select dir={language === "ar" ? "rtl" : "ltr"} value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder={t("admins.sort")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">{t("activityLog.newestFirst")}</SelectItem>
              <SelectItem value="oldest">{t("activityLog.oldestFirst")}</SelectItem>
            </SelectContent>
          </Select>

          <Button variant="outline" size="sm" onClick={() => mutate()} disabled={isLoading}>
            {t("common.refresh")}
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 bg-card">
          {isLoading ? (
            <div className="flex items-center justify-center p-8">
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                <span className="text-muted-foreground">{t("activityLog.loading")}</span>
              </div>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center p-8">
              <div className="flex items-center gap-2 text-destructive">
                <AlertCircle className="w-5 h-5" />
                <span>{t("activityLog.loadingError")}</span>
              </div>
            </div>
          ) : filteredLogs.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 text-muted-foreground">
              <Clock className="w-12 h-12 mb-4 opacity-20" />
              <h3 className="text-lg font-medium mb-2">{t("activityLog.emptyTitle")}</h3>
              <p className="text-sm text-center">{t("activityLog.emptyDescription")}</p>
            </div>
          ) : (
            <div className="space-y-3">
              {Array.isArray(filteredLogs) && filteredLogs.map((log) => (
                <div key={log.id} className="bg-muted/30 rounded-sg p-4 border border-border hover:bg-muted/50 transition-colors">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium text-foreground">{log.employee_name}</h4>
                        <Badge className={getStatusColor(log.action)}>{getActionLabel(log.action)}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{log.description}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs text-muted-foreground/60">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {formatDate(log.created_at, locale)} - {formatTime(log.created_at, locale)}
                    </span>
                    <span className="opacity-50">#{log.id}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="p-4 border-t border-border flex justify-between items-center bg-card">
          <div className="text-sm text-muted-foreground">
            {!isLoading && !error && data?.success && (
              <span>{t("activityLog.totalRecords", { count: String(filteredLogs.length) })}</span>
            )}
          </div>
          <Button onClick={() => setOpen(false)}>{t("common.close")}</Button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <span onClick={() => setOpen(true)} className="cursor-pointer">{trigger}</span>
      {createPortal(modalContent, document.body)}
    </>
  );
}

function formatDate(dateString, locale) {
  const date = new Date(dateString);
  return date.toLocaleDateString(locale, {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}

function formatTime(dateString, locale) {
  const date = new Date(dateString);
  return date.toLocaleTimeString(locale, {
    hour: "2-digit",
    minute: "2-digit",
  });
}

