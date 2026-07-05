"use client";

import { useState, useEffect, useCallback } from "react";
import useSWR from "swr";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
  DialogFooter
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
  SelectValue
} from "@/components/ui/select";
import { Edit, Save, Loader2, Upload, X, FileText, Image as ImageIcon, FileIcon, Trash2 } from "lucide-react";
import { getPartyById, updateParty, checkDuplicateParty } from "@/app/services/api/parties";
import { getBranches } from "@/app/services/api/branches";
import { deletePartyDocument } from "@/app/services/api/partiesDocuments";
import { toast } from "react-toastify";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTranslations } from "@/hooks/useTranslations";
import { cn } from "@/lib/utils";

const EditPartyModal = ({ partyId, onPartyUpdated, children }) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { isRTL, language } = useLanguage();
  const { t } = useTranslations();
  const [partyFiles, setPartyFiles] = useState([]);
  const [existingDocuments, setExistingDocuments] = useState([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [deletingDocId, setDeletingDocId] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [documentToDelete, setDocumentToDelete] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    address: "",
    e_id: "",
    category: "",
    email: "",
    party_type: "",
    status: "active",
    nationality: "",
    branch_id: 1,
    consultation_type: "",
    passport: "",
    is_vip: false,
    username: "",
    password: ""
  });

  // Fetch branches using SWR
  const { data: branchesData } = useSWR(
    open ? '/branches' : null,
    getBranches
  );

  const branches = branchesData?.data || [];

  const { data: partyData, error: partyError, isLoading: fetchingParty } = useSWR(
    open && partyId ? `/party/${partyId}` : null,
    () => getPartyById(partyId)
  );

  // Update form data when party data is fetched
  useEffect(() => {
    if (partyData) {
      setFormData({
        name: partyData.name || "",
        phone: partyData.phone || "",
        address: partyData.address || "",
        e_id: partyData.e_id || "",
        category: partyData.category || "",
        email: partyData.email || "",
        party_type: partyData.party_type || partyData.Party_type || "",
        status: partyData.status || "active",
        nationality: partyData.nationality || "",
        branch_id: partyData.branch_id || 1,
        consultation_type: partyData.consultation_type || "",
        passport: partyData.passport || "",
        is_vip: partyData.is_vip === 1 || partyData.is_vip === true || false,
        username: partyData.username || "",
        password: partyData.password || ""
      });

      // Set existing documents if available
      if (partyData.documents && Array.isArray(partyData.documents)) {
        setExistingDocuments(partyData.documents);
      }
    }
  }, [partyData]);

  // Show error toast if party fetch fails
  useEffect(() => {
    if (partyError) {

      toast.error(t('parties.fetchError') || "فشل في جلب بيانات الطرف");
    }
  }, [partyError, t]);

  // File handling functions
  const handleFileSelect = useCallback((selectedFiles) => {
    const filesArray = Array.from(selectedFiles);
    setPartyFiles(prev => [...prev, ...filesArray]);
  }, []);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragOver(false);
    const droppedFiles = e.dataTransfer.files;
    handleFileSelect(droppedFiles);
  }, [handleFileSelect]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleFileInputChange = useCallback((e) => {
    const selectedFiles = e.target.files;
    if (selectedFiles.length > 0) {
      handleFileSelect(selectedFiles);
    }
  }, [handleFileSelect]);

  const removeFile = useCallback((index) => {
    setPartyFiles(prev => prev.filter((_, i) => i !== index));
  }, []);

  const openDeleteDialog = (document) => {
    setDocumentToDelete(document);
    setDeleteDialogOpen(true);
  };

  const handleDeleteDocument = async () => {
    if (!documentToDelete) return;

    try {
      setDeletingDocId(documentToDelete.id);
      await deletePartyDocument(documentToDelete.id);

      // Remove document from the existing documents list
      setExistingDocuments(prev => prev.filter(doc => doc.id !== documentToDelete.id));

      toast.success(t('files.documentDeleted') || 'تم حذف المستند بنجاح');
      setDeleteDialogOpen(false);
      setDocumentToDelete(null);
    } catch (error) {

      toast.error(t('files.errorDeletingDocument') || 'حدث خطأ أثناء حذف المستند');
    } finally {
      setDeletingDocId(null);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (type) => {
    if (type.startsWith('image/')) return <ImageIcon className="h-4 w-4" />;
    if (type.includes('pdf')) return <FileText className="h-4 w-4" />;
    return <FileIcon className="h-4 w-4" />;
  };

  const resetForm = () => {
    setFormData({
      name: "",
      phone: "",
      address: "",
      e_id: "",
      category: "",
      email: "",
      party_type: "",
      status: "active",
      nationality: "",
      branch_id: 1,
      is_vip: false,
      username: "",
      password: ""
    });
    setPartyFiles([]);
    setExistingDocuments([]);
  };

  const handleUpdate = async () => {
    try {
      setLoading(true);

      // Basic validation - name, party_type, and branch_id are required
      if (!formData.name || !formData.party_type) {
        toast.error(t('parties.fillRequiredFields') || "يرجى ملء الحقول المطلوبة");
        return;
      }

      // Branch is required
      if (!formData.branch_id) {
        toast.error(t('parties.branchRequired') || "الفرع مطلوب");
        return;
      }

      // Check for duplicates - excluding current party
      const duplicateCheck = await checkDuplicateParty(
        formData.name,
        formData.phone,
        formData.email || null,
        partyId // Exclude current party from duplicate check
      );

      if (duplicateCheck.success && duplicateCheck.isDuplicate) {
        const { duplicates } = duplicateCheck;
        const errorMessages = [];

        if (duplicates.name) {
          errorMessages.push(t('parties.duplicateNameExists') || (isRTL
            ? 'طرف آخر بنفس الاسم موجود بالفعل'
            : 'Another party with the same name already exists'));
        }

        if (duplicates.phone) {
          errorMessages.push(t('parties.duplicatePhoneExists') || (isRTL
            ? 'طرف آخر بنفس رقم الهاتف موجود بالفعل'
            : 'Another party with the same phone number already exists'));
        }

        if (duplicates.email) {
          errorMessages.push(t('parties.duplicateEmailExists') || (isRTL
            ? 'طرف آخر بنفس البريد الإلكتروني موجود بالفعل'
            : 'Another party with the same email already exists'));
        }

        // Display all error messages
        errorMessages.forEach(msg => toast.error(msg));
        return;
      }

      // Add files to formData if any new files were added
      const partyDataWithFiles = {
        ...formData,
        ...(partyFiles.length > 0 && { files: partyFiles })
      };

      const response = await updateParty(partyId, partyDataWithFiles);

      // Check if response indicates failure (permission or other errors)
      if (response?.success === false) {
        toast.error(response?.message || t('parties.partyUpdateError') || "حدث خطأ أثناء تحديث الطرف");
        return;
      }

      // Success
      toast.success(t('parties.partyUpdatedSuccess') || "تم تحديث الطرف بنجاح");
      resetForm();
      setOpen(false);
      if (onPartyUpdated) {
        onPartyUpdated({
          ...formData,
          id: partyId
        });
      }
    } catch (error) {
      // Check if it's a permission error (403)
      const isPermissionError = error?.response?.status === 403;
      const errorMessage = isPermissionError
        ? (error?.response?.data?.message || (isRTL ? 'ليس لديك صلاحية لتحديث الطرف' : 'You do not have permission to update this party'))
        : (error?.response?.data?.message || t('parties.partyUpdateError') || "حدث خطأ أثناء تحديث الطرف");

      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button variant="ghost" size="icon">
            <Edit className="h-4 w-4" />
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t('parties.editParty') || 'تعديل الطرف'}</DialogTitle>
        </DialogHeader>

        {fetchingParty ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className={`${isRTL ? 'mr-2' : 'ml-2'}`}>
              {t('parties.loading') || 'جاري التحميل...'}
            </span>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Name */}
              <div className="space-y-2">
                <Label htmlFor="name">{t('parties.name') || 'الاسم'} *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  placeholder={t('parties.enterName') || 'مثال: أحمد محمد'}
                />
              </div>

              {/* Phone */}
              <div className="space-y-2">
                <Label htmlFor="phone">{t('parties.phone') || 'رقم الهاتف'} *</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => {
                    const value = e.target.value;
                    // Only allow numbers, +, -, spaces, and parentheses
                    if (/^[0-9+\-\s()]*$/.test(value)) {
                      handleInputChange("phone", value);
                    }
                  }}
                  placeholder="0500000000"
                />
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email">{t('parties.email') || 'البريد الإلكتروني'}</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  placeholder="مثال: example@email.com"
                />
              </div>

              {/* Party Type */}
              <div className="space-y-2">
                <Label>{t('parties.partyType') || 'نوع الطرف'} *</Label>
                <Select
                  dir={isRTL ? "rtl" : "ltr"}
                  value={formData.party_type}
                  onValueChange={(value) => handleInputChange("party_type", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t('parties.choosePartyType') || 'اختر نوع الطرف'} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="client">{t('parties.client') || 'عميل'}</SelectItem>
                    <SelectItem value="opponent">{t('parties.opponent') || 'خصم'}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Category */}
              <div className="space-y-2">
                <Label>{t('parties.category') || 'الفئة'}</Label>
                <Select
                  dir={isRTL ? "rtl" : "ltr"}
                  value={formData.category}
                  onValueChange={(value) => handleInputChange("category", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t('parties.chooseCategory') || 'اختر الفئة'} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="individual">{t('parties.individual') || 'فرد'}</SelectItem>
                    <SelectItem value="company">{t('parties.company') || 'شركة'}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Consultation Type */}
              {/* <div className="space-y-2">
                <Label>{t('parties.consultationType') || 'نوع الاستشارة'}</Label>
                <Select 
                  dir={isRTL ? "rtl" : "ltr"}
                  value={formData.consultation_type} 
                  onValueChange={(value) => handleInputChange("consultation_type", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t('parties.chooseConsultationType') || 'اختر نوع الاستشارة'} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="legal">{t('parties.consultationTypeLegal') || 'قانونية'}</SelectItem>
                    <SelectItem value="financial">{t('parties.consultationTypeFinancial') || 'مالية'}</SelectItem>
                    <SelectItem value="administrative">{t('parties.consultationTypeAdministrative') || 'إدارية'}</SelectItem>
                  </SelectContent>
                </Select>
              </div> */}

              {/* Emirates ID */}
              <div className="space-y-2">
                <Label htmlFor="e_id">{t('parties.emiratesId') || 'رقم الهوية الإماراتية'}</Label>
                <Input
                  id="e_id"
                  value={formData.e_id}
                  onChange={(e) => handleInputChange("e_id", e.target.value)}
                  placeholder="مثال: 784-1234-1234567-1"
                />
              </div>

              {/* Nationality */}
              <div className="space-y-2">
                <Label htmlFor="nationality">{t('parties.nationality') || 'الجنسية'}</Label>
                <Input
                  id="nationality"
                  value={formData.nationality}
                  onChange={(e) => handleInputChange("nationality", e.target.value)}
                  placeholder={t('parties.nationalityExample') || 'مثال: الإمارات العربية المتحدة'}
                />
              </div>

              {/* Passport */}
              <div className="space-y-2">
                <Label htmlFor="passport">{t('parties.passport') || 'رقم جواز السفر'}</Label>
                <Input
                  id="passport"
                  value={formData.passport}
                  onChange={(e) => handleInputChange("passport", e.target.value)}
                  placeholder={t('parties.passportPlaceholder') || 'مثال: A12345678'}
                />
              </div>

              {/* Branch */}
              <div className="space-y-2">
                <Label>{t('parties.branch') || 'الفرع'} *</Label>
                <Select
                  dir={isRTL ? "rtl" : "ltr"}
                  value={formData.branch_id?.toString()}
                  onValueChange={(value) => handleInputChange("branch_id", parseInt(value))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t('parties.chooseBranch') || 'اختر الفرع'} />
                  </SelectTrigger>
                  <SelectContent>
                    {branches.length > 0 ? (
                      branches.map((branch) => (
                        <SelectItem key={branch.id} value={branch.id.toString()}>
                          {language === 'ar' ? branch.name_ar : branch.name_en}
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="1" disabled>
                        {t('parties.loading') || 'جاري التحميل...'}
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>

              {/* Username */}
              <div className="space-y-2">
                <Label htmlFor="username">{t('parties.username') || 'اسم المستخدم'}</Label>
                <Input
                  id="username"
                  value={formData.username}
                  onChange={(e) => handleInputChange("username", e.target.value)}
                  placeholder={t('parties.usernamePlaceholder') || 'اسم المستخدم للدخول'}
                />
              </div>

              {/* Password */}
              <div className="space-y-2">
                <Label htmlFor="password">{t('parties.password') || 'كلمة المرور'}</Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => handleInputChange("password", e.target.value)}
                  placeholder={t('parties.passwordPlaceholder') || 'كلمة المرور'}
                />
              </div>

              {/* Status Switch */}
              <div className="space-y-2">
                <Label htmlFor="status">{t('parties.status') || 'الحالة'}</Label>
                <div className="flex items-center space-x-2 space-x-reverse">
                  <Switch
                    id="status"
                    checked={formData.status === "active"}
                    onCheckedChange={(checked) =>
                      handleInputChange("status", checked ? "active" : "inactive")
                    }
                  />
                  <Label htmlFor="status" className="cursor-pointer">
                    {formData.status === "active"
                      ? (t('parties.active') || 'نشط')
                      : (t('parties.inactive') || 'غير نشط')
                    }
                  </Label>
                </div>
              </div>

              {/* VIP Switch */}
              <div className="space-y-2">
                <Label htmlFor="is_vip">{t('parties.vipStatus') || 'عميل مميز (VIP)'}</Label>
                <div className="flex items-center space-x-2 space-x-reverse">
                  <Switch
                    id="is_vip"
                    checked={formData.is_vip}
                    onCheckedChange={(checked) =>
                      handleInputChange("is_vip", checked)
                    }
                  />
                  <Label htmlFor="is_vip" className="cursor-pointer">
                    {formData.is_vip
                      ? (t('parties.vip') || 'VIP')
                      : (t('parties.regular') || 'عادي')
                    }
                  </Label>
                </div>
              </div>

              {/* Address */}
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="address">{t('parties.address') || 'العنوان'}</Label>
                <Textarea
                  id="address"
                  value={formData.address}
                  onChange={(e) => handleInputChange("address", e.target.value)}
                  placeholder={t('parties.enterAddress') || 'مثال: شارع الشيخ زايد، دبي'}
                  rows={3}
                />
              </div>

              {/* Existing Documents Section */}
              {existingDocuments.length > 0 && (
                <div className="space-y-2 md:col-span-2">
                  <Label>{t('files.existingDocuments') || 'الملفات الموجودة'}</Label>
                  <div className="border rounded-lg p-3 bg-gray-50">
                    <p className="text-sm font-medium mb-2">
                      {t('files.documentsCount') || 'عدد الملفات'}: {existingDocuments.length}
                    </p>
                    <div className="space-y-1">
                      {existingDocuments.map((doc) => (
                        <div
                          key={doc.id}
                          className="flex items-center justify-between p-2 bg-white rounded border"
                        >
                          <div className="flex items-center space-x-2 space-x-reverse flex-1 min-w-0">
                            <FileText className="h-4 w-4 text-blue-500 flex-shrink-0" />
                            <div className="flex flex-col flex-1 min-w-0">
                              <span className="text-sm truncate">{doc.document_name}</span>
                              {doc.uploaded_by_name && (
                                <span className="text-xs text-gray-500">
                                  {t('files.uploadedBy') || 'تم الرفع بواسطة'}: {doc.uploaded_by_name}
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-1 flex-shrink-0">
                            {doc.document_url && (
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="h-8"
                                onClick={() => window.open(doc.document_url, '_blank')}
                              >
                                {t('files.view') || 'عرض'}
                              </Button>
                            )}
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                              onClick={() => openDeleteDialog(doc)}
                              disabled={deletingDocId === doc.id}
                            >
                              {deletingDocId === doc.id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Trash2 className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* File Upload Section */}
              <div className="space-y-2 md:col-span-2">
                <Label>{t('files.uploadFiles') || 'رفع ملفات جديدة'}</Label>

                {/* Drop Zone */}
                <div
                  className={cn(
                    "border-2 border-dashed rounded-lg p-4 text-center transition-colors cursor-pointer",
                    isDragOver
                      ? "border-primary bg-primary/10"
                      : "border-gray-300 hover:border-gray-400"
                  )}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => document.getElementById('edit-party-file-input')?.click()}
                >
                  <Upload className="h-6 w-6 mx-auto mb-2 text-gray-400" />
                  <p className="text-sm text-gray-600 mb-1">
                    {t('files.dragAndDrop') || 'اسحب وأفلت الملفات هنا أو انقر للاختيار'}
                  </p>
                  <p className="text-xs text-gray-500">
                    {t('files.supportedFormats') || 'المنسقات المدعومة: PDF, DOC, DOCX, JPG, PNG'}
                  </p>
                  <input
                    id="edit-party-file-input"
                    type="file"
                    multiple
                    className="hidden"
                    onChange={handleFileInputChange}
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                  />
                </div>

                {/* File List */}
                {partyFiles.length > 0 && (
                  <div className="space-y-2 mt-2">
                    <p className="text-sm font-medium">
                      {t('files.selectedFiles') || 'الملفات المحددة'}: {partyFiles.length}
                    </p>
                    <div className="space-y-1">
                      {partyFiles.map((file, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-2 bg-gray-50 rounded border"
                        >
                          <div className="flex items-center space-x-2 space-x-reverse flex-1 min-w-0">
                            {getFileIcon(file.type)}
                            <span className="text-sm truncate">{file.name}</span>
                            <span className="text-xs text-gray-500 whitespace-nowrap">
                              ({formatFileSize(file.size)})
                            </span>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 flex-shrink-0"
                            onClick={() => removeFile(index)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end space-x-2 space-x-reverse mt-6">
              <Button
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={loading}
              >
                {t('parties.cancel') || 'إلغاء'}
              </Button>
              <Button
                onClick={handleUpdate}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'} animate-spin`} />
                    {t('parties.updating') || 'جاري التحديث...'}
                  </>
                ) : (
                  <>
                    <Save className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                    {t('parties.update') || 'تحديث'}
                  </>
                )}
              </Button>
            </div>
          </>
        )}
      </DialogContent>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {t('files.deleteDocument') || 'حذف المستند'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t('files.confirmDeleteDocument') || 'هل أنت متأكد من حذف هذا المستند؟'}
              {documentToDelete && (
                <div className="mt-3 p-3 bg-gray-50 rounded-md">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-blue-500" />
                    <span className="text-sm font-medium text-gray-900">
                      {documentToDelete.document_name}
                    </span>
                  </div>
                  {documentToDelete.uploaded_by_name && (
                    <p className="text-xs text-gray-500 mt-1">
                      {t('files.uploadedBy') || 'رفع بواسطة'}: {documentToDelete.uploaded_by_name}
                    </p>
                  )}
                </div>
              )}
              <p className="mt-3 text-sm text-red-600">
                {t('common.confirmDeleteMessage') || 'لا يمكن التراجع عن هذا الإجراء.'}
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2">
            <AlertDialogCancel disabled={deletingDocId !== null}>
              {t('common.cancel') || 'إلغاء'}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteDocument}
              disabled={deletingDocId !== null}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
            >
              {deletingDocId !== null ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {t('common.deleting') || 'جاري الحذف...'}
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4 mr-2" />
                  {t('common.delete') || 'حذف'}
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Dialog>
  );
};

export default EditPartyModal;
