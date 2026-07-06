"use client";

import { useEffect, useState } from "react";
import { Formik, Form, Field } from "formik";
import * as Yup from "yup";
import useSWR, { mutate } from "swr";
import { getPartyById, updateParty, checkDuplicateParty } from "../services/api/parties";
import { getBranches } from "../services/api/branches";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Save, X, Upload, FileText } from "lucide-react";
import { useTranslations } from "@/hooks/useTranslations";
import { toast } from "react-toastify";

export function EditClientModal({ clientId, isOpen, onClose, onSuccess }) {
  const { t } = useTranslations();
  const { isRTL, language } = useLanguage();
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [isUploading, setIsUploading] = useState(false);

  // Fetch branches data
  const { data: branchesData } = useSWR(isOpen ? 'branches' : null, getBranches);
  const branches = branchesData?.data || [];

  // Use SWR for data fetching.
  // Key is gated on isOpen so closing the modal does not null-out the cache key
  // mid-fetch (which would make rawData=undefined and blank the form on next open).
  // keepPreviousData ensures stale data stays visible while the next fetch is in flight.
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
  // Guard against empty-object placeholders from SWR cache (e.g. {}) which
  // would pass the `if (data)` check but have no keys — treat those as null.
  const rawUnwrapped = rawData?.data ?? rawData ?? null;
  const data = rawUnwrapped && Object.keys(rawUnwrapped).length > 0 ? rawUnwrapped : null;

  // Validation schema
  const validationSchema = Yup.object({
    name: Yup.string()
      .required(t("potentialClientsPage.validation.nameRequired")),
    phone: Yup.string(),
    // status is pre-populated from the DB record; not required to be changed by the user
    status: Yup.string(),
    party_type: Yup.string()
      .required("Party type is required"),
    branch_id: Yup.number()
      .required(t("potentialClientsPage.validation.branchRequired") || "الفرع مطلوب"),
    category: Yup.string(),
    nationality: Yup.string(),
    address: Yup.string(),
    email: Yup.string().email("Invalid email format"),
    e_id: Yup.string(),
  });

  // Initial values for Formik.
  // Only populate from server data when the record has actually loaded (has a name
  // key at minimum). This prevents a blank-form flash when SWR returns an empty
  // cache placeholder before the real fetch resolves.
  const getInitialValues = () => {
    if (data && data.name !== undefined) {
      const client = data;
      return {
        name: client.name || "",
        phone: client.phone || "",
        // Preserve whatever status the DB has stored ("active" / "inactive")
        status: client.status || "active",
        party_type: client.party_type || client.Party_type || "New",
        category: client.category || "",
        nationality: client.nationality || "",
        address: client.address || "",
        email: client.email || "",
        e_id: client.e_id || "",
        consultation_type: client.consultation_type || "",
        passport: client.passport || "",
        source: client.source || "",
        branch_id: client.branch_id || 1,
        is_vip: client.is_vip === 1 || client.is_vip === true || false,
      };
    }
    return {
      name: "",
      phone: "",
      status: "active",
      party_type: "New",
      category: "",
      nationality: "",
      address: "",
      email: "",
      e_id: "",
      consultation_type: "",
      passport: "",
      source: "",
      branch_id: 1,
      is_vip: false,
    };
  };

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      // Check for duplicates - excluding current client
      const duplicateCheck = await checkDuplicateParty(
        values.name, 
        values.phone, 
        values.email || null,
        clientId // Exclude current client from duplicate check
      );
      
      if (duplicateCheck.success && duplicateCheck.isDuplicate) {
        const { duplicates } = duplicateCheck;
        const errorMessages = [];
        
        if (duplicates.name) {
          errorMessages.push(t('potentialClientsPage.duplicateNameExists') || (isRTL 
            ? 'عميل آخر بنفس الاسم موجود بالفعل'
            : 'Another client with the same name already exists'));
        }
        
        if (duplicates.phone) {
          errorMessages.push(t('potentialClientsPage.duplicatePhoneExists') || (isRTL 
            ? 'عميل آخر بنفس رقم الهاتف موجود بالفعل'
            : 'Another client with the same phone number already exists'));
        }
        
        if (duplicates.email) {
          errorMessages.push(t('potentialClientsPage.duplicateEmailExists') || (isRTL 
            ? 'عميل آخر بنفس البريد الإلكتروني موجود بالفعل'
            : 'Another client with the same email already exists'));
        }
        
        // Display all error messages
        errorMessages.forEach(msg => toast.error(msg));
        setSubmitting(false);
        return;
      }

      // Include files in the request data
      const requestData = {
        ...values,
        files: selectedFiles.length > 0 ? selectedFiles : undefined
      };

      await updateParty(clientId, requestData);
      
      // Mutate SWR cache to refresh data
      mutate([`/parties/potential-clients`, 1, "", undefined]);
      mutate(`/parties/${clientId}`);
      
      toast.success(t("potentialClientsPage.messages.updateSuccess"));
      
      if (onSuccess) {
        onSuccess();
      }
      
      // Reset files and close modal
      setSelectedFiles([]);
      onClose();
    } catch (error) {

      toast.error(t("potentialClientsPage.messages.updateError"));
    } finally {
      setSubmitting(false);
      setIsUploading(false);
    }
  };

  const handleFileSelect = (event) => {
    const files = Array.from(event.target.files);
    const validFiles = files.filter(file => {
      const validTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain', 'image/jpeg', 'image/png'];
      const maxSize = 10 * 1024 * 1024; // 10MB
      
      if (!validTypes.includes(file.type)) {
        toast.error(`${file.name}: ${t("potentialClientsPage.files.invalidType")}`);
        return false;
      }
      
      if (file.size > maxSize) {
        toast.error(`${file.name}: ${t("potentialClientsPage.files.tooLarge")}`);
        return false;
      }
      
      return true;
    });
    
    setSelectedFiles(prev => [...prev, ...validFiles]);
  };

  const handleRemoveFile = (index) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const statusOptions = [
    { value: "active", label: t('potentialClientsPage.status.active') || "نشط" },
    { value: "inactive", label: t('potentialClientsPage.status.inactive') || "غير نشط" },
  ];

  const partyTypeOptions = [
    { value: "New", label: "جديد" },
    { value: "Unqualified", label: "غير مؤهل" },
    { value: "Qualified", label: "مؤهل" },
    { value: "Contacted", label: "تم التواصل" },
    { value: "client", label: "تحويل ل موكل" },
  ];

  const sourceOptions = [
    { value: "الموقع الالكتروني", label: t('potentialClientsPage.source.website') || "الموقع الالكتروني" },
    { value: "زيارة المكتب", label: t('potentialClientsPage.source.officeVisit') || "زيارة المكتب" },
    { value: "التواصل ع الهاتف", label: t('potentialClientsPage.source.phoneContact') || "التواصل ع الهاتف" },
    { value: "احالة", label: "احالة" },
  ];

  const categoryOptions = [
    { value: "individual", label: t("potentialClientsPage.category.individual") },
    { value: "company", label: t("potentialClientsPage.category.company") },
  ];

  const consultationTypeOptions = [
    { value: "قانونية", label: t("potentialClientsPage.consultationType.legal") || "قانونية" },
    { value: "مالية", label: t("potentialClientsPage.consultationType.financial") || "مالية" },
    { value: "إدارية", label: t("potentialClientsPage.consultationType.administrative") || "إدارية" },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">
            {t("potentialClientsPage.editModal.title")}
          </DialogTitle>
          <DialogDescription>
            {t("potentialClientsPage.editModal.description")}
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            <span className="ml-2">{t("potentialClientsPage.messages.loading")}</span>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center py-12 text-destructive">
            <p>{t("potentialClientsPage.messages.error")}</p>
          </div>
        ) : data ? (
          <Formik
            initialValues={getInitialValues()}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
            enableReinitialize={true}
          >
            {({ values, errors, touched, setFieldValue, isSubmitting }) => (
              <Form className="space-y-6">
                <div className="space-y-4">
                  {/* Name Field */}
                  <div className="space-y-2">
                    <Label htmlFor="name">
                      {t("potentialClientsPage.table.name")} *
                    </Label>
                    <Field name="name">
                      {({ field }) => (
                        <Input
                          {...field}
                          id="name"
                          placeholder={t("potentialClientsPage.editModal.namePlaceholder")}
                          disabled={isSubmitting}
                          className={errors.name && touched.name ? "border-red-500" : ""}
                        />
                      )}
                    </Field>
                    {errors.name && touched.name && (
                      <p className="text-sm text-red-500">{errors.name}</p>
                    )}
                  </div>

                  {/* Phone Field */}
                  <div className="space-y-2">
                    <Label htmlFor="phone">
                      {t("potentialClientsPage.table.phone")}
                    </Label>
                    <Field name="phone">
                      {({ field, form }) => (
                        <Input
                          {...field}
                          id="phone"
                          type="tel"
                          onChange={(e) => {
                            const value = e.target.value;
                            // Only allow numbers, +, -, spaces, and parentheses
                            if (/^[0-9+\-\s()]*$/.test(value)) {
                              form.setFieldValue('phone', value);
                            }
                          }}
                          placeholder="0500000000"
                          disabled={isSubmitting}
                        />
                      )}
                    </Field>
                  </div>

                  {/* Email Field */}
                  <div className="space-y-2">
                    <Label htmlFor="email">{t('potentialClientsPage.table.email') || 'البريد الإلكتروني'}</Label>
                    <Field name="email">
                      {({ field }) => (
                        <Input
                          {...field}
                          id="email"
                          type="email"
                          placeholder="example@email.com"
                          disabled={isSubmitting}
                        />
                      )}
                    </Field>
                    {errors.email && touched.email && (
                      <p className="text-sm text-red-500">{errors.email}</p>
                    )}
                  </div>

<div className="flex gap-4 flex-wrap">
                  {/* Status Field — active / inactive account state */}
                  <div className="space-y-2">
                    <Label htmlFor="status">
                      {t("potentialClientsPage.table.status")}
                    </Label>
                    <Select
                      dir={isRTL ? "rtl" : "ltr"}
                      value={values.status || "active"}
                      onValueChange={(value) => setFieldValue("status", value)}
                      disabled={isSubmitting}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={t("potentialClientsPage.editModal.selectStatus")} />
                      </SelectTrigger>
                      <SelectContent>
                        {statusOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Party Type Field */}
                  <div className="space-y-2">
                    <Label htmlFor="party_type">
                      {t('potentialClientsPage.table.partyType') || 'نوع العميل'} *
                    </Label>
                    <Select
                      dir={isRTL ? "rtl" : "ltr"}
                      value={values.party_type || ""}
                      onValueChange={(value) => setFieldValue("party_type", value)}
                      disabled={isSubmitting}
                    >
                      <SelectTrigger className={errors.party_type && touched.party_type ? "border-red-500" : ""}>
                        <SelectValue placeholder={t('potentialClientsPage.editModal.selectPartyType') || 'اختر نوع العميل'} />
                      </SelectTrigger>
                      <SelectContent>
                        {partyTypeOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.party_type && touched.party_type && (
                      <p className="text-sm text-red-500">{errors.party_type}</p>
                    )}
                  </div>

                  {/* ID Number Field */}
                  <div className="space-y-2">
                    <Label htmlFor="e_id">{t('potentialClientsPage.table.emiratesId') || 'رقم الهوية الإماراتية'}</Label>
                    <Field name="e_id">
                      {({ field }) => (
                        <Input
                          {...field}
                          id="e_id"
                          placeholder="784-1234-1234567-1"
                          disabled={isSubmitting}
                        />
                      )}
                    </Field>
                  </div>

                  {/* Passport Field */}
                  <div className="space-y-2">
                    <Label htmlFor="passport">{t("potentialClientsPage.table.passport") || "رقم جواز السفر"}</Label>
                    <Field name="passport">
                      {({ field }) => (
                        <Input
                          {...field}
                          id="passport"
                          placeholder={t("potentialClientsPage.addModal.passportPlaceholder") || "أدخل رقم جواز السفر"}
                          disabled={isSubmitting}
                        />
                      )}
                    </Field>
                  </div>

                  {/* Nationality Field */}
                  <div className="space-y-2">
                    <Label htmlFor="nationality">{t('potentialClientsPage.table.nationality') || 'الجنسية'}</Label>
                    <Field name="nationality">
                      {({ field }) => (
                        <Input
                          {...field}
                          id="nationality"
                          placeholder={t('potentialClientsPage.addModal.nationalityPlaceholder') || 'الإمارات العربية المتحدة'}
                          disabled={isSubmitting}
                        />
                      )}
                    </Field>
                  </div>

                  {/* VIP Switch */}
                  <div className="space-y-2">
                    <Label htmlFor="is_vip">{t('potentialClientsPage.vipStatus') || 'عميل مميز (VIP)'}</Label>
                    <div className="flex items-center space-x-2 space-x-reverse">
                      <Switch
                        id="is_vip"
                        checked={values.is_vip}
                        onCheckedChange={(checked) => setFieldValue("is_vip", checked)}
                        disabled={isSubmitting}
                      />
                      <Label htmlFor="is_vip" className="cursor-pointer">
                        {values.is_vip 
                          ? (t('potentialClientsPage.vip') || 'VIP')
                          : (t('potentialClientsPage.regular') || 'عادي')
                        }
                      </Label>
                    </div>
                  </div>

                  {/* Category Field */}
                  <div className="space-y-2">
                    <Label htmlFor="category">
                      {t("potentialClientsPage.table.category")}
                    </Label>
                    <Select
                      value={values.category || ""}
                      onValueChange={(value) => setFieldValue("category", value)}
                      disabled={isSubmitting}
                    >
                      <SelectTrigger className={errors.category && touched.category ? "border-red-500" : ""}>
                        <SelectValue placeholder={t("potentialClientsPage.editModal.selectCategory")} />
                      </SelectTrigger>
                      <SelectContent>
                        {categoryOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.category && touched.category && (
                      <p className="text-sm text-red-500">{errors.category}</p>
                    )}
                  </div>

                  {/* Consultation Type Field */}
                  <div className="space-y-2">
                    <Label htmlFor="consultation_type">
                      {t("potentialClientsPage.table.consultationType") || "نوع الاستشارة"}
                    </Label>
                    <Select
                      dir={isRTL ? "rtl" : "ltr"}
                      value={values.consultation_type || ""}
                      onValueChange={(value) => setFieldValue("consultation_type", value)}
                      disabled={isSubmitting}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={t("potentialClientsPage.addModal.selectConsultationType") || "اختر نوع الاستشارة"} />
                      </SelectTrigger>
                      <SelectContent>
                        {consultationTypeOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Source Field */}
                  <div className="space-y-2">
                    <Label htmlFor="source">
                      {t('potentialClientsPage.table.source') || 'المصدر'}
                    </Label>
                    <Select
                      dir={isRTL ? "rtl" : "ltr"}
                      value={values.source || ""}
                      onValueChange={(value) => setFieldValue("source", value)}
                      disabled={isSubmitting}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={t('potentialClientsPage.addModal.selectSource') || 'اختر المصدر'} />
                      </SelectTrigger>
                      <SelectContent>
                        {sourceOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Branch Field */}
                  <div className="space-y-2">
                    <Label htmlFor="branch_id">
                      {t('potentialClientsPage.table.branch') || 'الفرع'} *
                    </Label>
                    <Select
                      dir={isRTL ? "rtl" : "ltr"}
                      value={values.branch_id?.toString() || ""}
                      onValueChange={(value) => setFieldValue("branch_id", parseInt(value))}
                      disabled={isSubmitting}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={t('potentialClientsPage.addModal.selectBranch') || 'اختر الفرع'} />
                      </SelectTrigger>
                      <SelectContent>
                        {branches.length > 0 ? (
                          branches.map((branch) => (
                            <SelectItem key={branch.id} value={branch.id.toString()}>
                              {language === 'ar' ? branch.name_ar : branch.name_en}
                            </SelectItem>
                          ))
                        ) : (
                          <SelectItem value="loading" disabled>
                            {t('potentialClientsPage.addModal.loadingBranches') || 'جاري التحميل...'}
                          </SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                  </div>
</div>

                  {/* Address Field */}
                  <div className="space-y-2">
                    <Label htmlFor="address">{t('potentialClientsPage.table.address') || 'العنوان'}</Label>
                    <Field name="address">
                      {({ field }) => (
                        <Textarea
                          {...field}
                          id="address"
                          placeholder={t('potentialClientsPage.addModal.addressPlaceholder') || 'أدخل العنوان التفصيلي'}
                          rows={3}
                          disabled={isSubmitting}
                        />
                      )}
                    </Field>
                  </div>

                  {/* File Upload Section - Add New Files Only */}
                  <div className="space-y-4 border-t pt-4 mt-4">
                    <Label>{t("potentialClientsPage.files.addNew") || "إضافة ملفات جديدة"}</Label>
                    
                    {/* File Upload */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => document.getElementById('file-input').click()}
                          disabled={isSubmitting || isUploading}
                        >
                          <Upload className="h-4 w-4 mr-2" />
                          {t("potentialClientsPage.files.selectFiles")}
                        </Button>
                        <input
                          id="file-input"
                          type="file"
                          multiple
                          accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png"
                          onChange={handleFileSelect}
                          className="hidden"
                        />
                      </div>
                      
                      <p className="text-xs text-muted-foreground">
                        {t("potentialClientsPage.files.supportedFormats")}
                      </p>

                      {/* Selected Files */}
                      {selectedFiles.length > 0 && (
                        <div className="space-y-2">
                          <p className="text-sm font-medium">
                            {t("potentialClientsPage.files.selected")} ({selectedFiles.length})
                          </p>
                          <div className="space-y-2 max-h-32 overflow-y-auto">
                            {selectedFiles.map((file, index) => (
                              <div key={index} className="flex items-center justify-between p-2 bg-blue-50 rounded-md">
                                <div className="flex items-center gap-2">
                                  <FileText className="h-4 w-4" />
                                  <span className="text-sm">{file.name}</span>
                                  <span className="text-xs text-muted-foreground">
                                    ({(file.size / 1024 / 1024).toFixed(2)} MB)
                                  </span>
                                </div>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleRemoveFile(index)}
                                  disabled={isSubmitting}
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    <p className="text-xs text-muted-foreground italic">
                      {t("potentialClientsPage.files.viewExistingHint") || "💡 لعرض أو حذف الملفات الموجودة، افتح تفاصيل العميل"}
                    </p>
                  </div>
                </div>

                <DialogFooter className="gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={onClose}
                    disabled={isSubmitting}
                  >
                    <X className="h-4 w-4 mr-2" />
                    {t("potentialClientsPage.editModal.cancel")}
                  </Button>
                  <Button
                    type="submit"
                    disabled={isSubmitting || isUploading || !values.name?.trim() || !values.party_type || !values.category}
                  >
                    {isSubmitting || isUploading ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Save className="h-4 w-4 mr-2" />
                    )}
                    {isUploading 
                      ? t("potentialClientsPage.files.uploading") 
                      : t("potentialClientsPage.editModal.save")
                    }
                  </Button>
                </DialogFooter>
              </Form>
            )}
          </Formik>
        ) : (
          <div className="flex items-center justify-center py-12 text-muted-foreground">
            <p>{t("potentialClientsPage.messages.noResults")}</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}