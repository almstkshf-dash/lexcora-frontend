"use client";

import { useState, useEffect, useCallback } from "react";
import { mutate } from "swr";
import useSWR from "swr";
import { createParty, checkDuplicateParty } from "../services/api/parties";
import { getBranches } from "@/app/services/api/branches";
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
import { Loader2, Save, X, Upload, FileText, Plus, Image as ImageIcon, FileIcon } from "lucide-react";
import { useTranslations } from "@/hooks/useTranslations";
import { useLanguage } from "@/contexts/LanguageContext";
import { toast } from "react-toastify";
import { cn } from "@/lib/utils";

export function AddClientModal({ isOpen, onClose, onSuccess }) {
  const { t } = useTranslations();
  const { isRTL, language } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [partyFiles, setPartyFiles] = useState([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    address: "",
    e_id: "",
    category: "",
    email: "",
    party_type: "",
    source: "",
    status: "active",
    nationality: "",
    consultation_type: "",
    passport: "",
    branch_id: 1,
    is_vip: false
  });

  // Fetch branches
  const { data: branchesData, error: branchesError } = useSWR(
    isOpen ? '/branches' : null,
    getBranches
  );

  const branches = branchesData?.data || [];

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
      category: "individual",
      email: "",
      party_type: "new",
      source: "زيارة المكتب",
      status: "active",
      nationality: "",
      consultation_type: "قانونية",
      passport: "",
      branch_id: 1,
      is_vip: false
    });
    setPartyFiles([]);
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      
      // Basic validation - name, party_type, and branch_id are required
      if (!formData.name || !formData.party_type) {
        toast.error(t("potentialClientsPage.validation.nameRequired") || "يرجى ملء الحقول المطلوبة");
        return;
      }

      // Branch is required
      if (!formData.branch_id) {
        toast.error(t("potentialClientsPage.validation.branchRequired") || "الفرع مطلوب");
        return;
      }

      // Check for duplicates - name, phone, and email (if provided)
      const duplicateCheck = await checkDuplicateParty(
        formData.name, 
        formData.phone, 
        formData.email || null
      );
      
      if (duplicateCheck.success && duplicateCheck.isDuplicate) {
        const { duplicates } = duplicateCheck;
        const errorMessages = [];
        
        if (duplicates.name) {
          errorMessages.push(t('potentialClientsPage.duplicateNameExists') || (isRTL 
            ? 'عميل بنفس الاسم موجود بالفعل'
            : 'A client with the same name already exists'));
        }
        
        if (duplicates.phone) {
          errorMessages.push(t('potentialClientsPage.duplicatePhoneExists') || (isRTL 
            ? 'عميل بنفس رقم الهاتف موجود بالفعل'
            : 'A client with the same phone number already exists'));
        }
        
        if (duplicates.email) {
          errorMessages.push(t('potentialClientsPage.duplicateEmailExists') || (isRTL 
            ? 'عميل بنفس البريد الإلكتروني موجود بالفعل'
            : 'A client with the same email already exists'));
        }
        
        // Display all error messages
        errorMessages.forEach(msg => toast.error(msg));
        return;
      }

      // Add files to formData
      const partyDataWithFiles = {
        ...formData,
        files: partyFiles
      };

      const response = await createParty(partyDataWithFiles);
      
      // Check if response indicates failure (permission or other errors)
      if (response?.success === false) {
        toast.error(response?.message || t("potentialClientsPage.messages.createError") || "حدث خطأ أثناء إضافة العميل المحتمل");
        return;
      }
      
      if (response.success) {
        toast.success(t("potentialClientsPage.messages.createSuccess") || "تم إضافة العميل المحتمل بنجاح");
        
        // Mutate SWR cache to refresh data
        mutate([`/parties/potential-clients`, 1, "", undefined]);
        
        resetForm();
        onClose();
        
        if (onSuccess) {
          onSuccess({
            ...formData,
            id: response.id
          });
        }
      }
    } catch (error) {
      // Check if it's a permission error (403)
      const isPermissionError = error?.response?.status === 403;
      const errorMessage = isPermissionError 
        ? (error?.response?.data?.message || (language === 'ar' ? 'ليس لديك صلاحية لإضافة عميل محتمل' : 'You do not have permission to add a potential client'))
        : (error?.response?.data?.message || t("potentialClientsPage.messages.createError") || "حدث خطأ أثناء إضافة العميل المحتمل");
      
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const statusOptions = [
    { value: "active", label: "نشط" },
    { value: "inactive", label: "غير نشط" },
  ];

  const partyTypeOptions = [
    { value: "New", label: t('potentialClientsPage.status.new') || "جديد" },
    { value: "Unqualified", label: t('potentialClientsPage.status.notQualified') || "غير مؤهل" },
    { value: "Qualified", label: t('potentialClientsPage.status.qualified') || "مؤهل" },
    { value: "Contacted", label: t('potentialClientsPage.status.contacted') || "تم التواصل" },
    // { value: "client", label: t('potentialClientsPage.status.convertToClient') || "تحويل ل موكل" },
  ];

  const sourceOptions = [
    { value: "الموقع الالكتروني", label: t('potentialClientsPage.source.website') || "الموقع الالكتروني" },
    { value: "زيارة المكتب", label: t('potentialClientsPage.source.officeVisit') || "زيارة المكتب" },
    { value: "التواصل عبر الهاتف", label: t('potentialClientsPage.source.phoneContact') || "التواصل ع الهاتف" },
    { value: "احالة", label:  "احالة" },
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

  const handleClose = () => {
    setPartyFiles([]);
    resetForm();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">
            {t("potentialClientsPage.addModal.title")}
          </DialogTitle>
          <DialogDescription>
            {t("potentialClientsPage.addModal.description")}
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="name">{t('potentialClientsPage.table.name') || 'الاسم'} *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              placeholder={t('potentialClientsPage.addModal.namePlaceholder') || 'مثال: أحمد محمد'}
            />
          </div>

          {/* Phone */}
          <div className="space-y-2">
            <Label htmlFor="phone">{t('potentialClientsPage.table.phone') || 'رقم الهاتف'}</Label>
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
            <Label htmlFor="email">{t('potentialClientsPage.table.email') || 'البريد الإلكتروني'}</Label>
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
            <Label>{t('potentialClientsPage.table.partyType') || 'نوع العميل'} *</Label>
            <Select 
              dir={isRTL ? "rtl" : "ltr"}
              value={formData.party_type} 
              onValueChange={(value) => handleInputChange("party_type", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder={t('potentialClientsPage.addModal.selectPartyType') || 'اختر نوع العميل'} />
              </SelectTrigger>
              <SelectContent>
                {partyTypeOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Source */}
          <div className="space-y-2">
            <Label>{t('potentialClientsPage.table.source') || 'المصدر'}</Label>
            <Select 
              dir={isRTL ? "rtl" : "ltr"}
              value={formData.source} 
              onValueChange={(value) => handleInputChange("source", value)}
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

          {/* Category */}
          <div className="space-y-2">
            <Label>{t('potentialClientsPage.table.category') || 'الفئة'}</Label>
            <Select 
              dir={isRTL ? "rtl" : "ltr"}
              value={formData.category} 
              onValueChange={(value) => handleInputChange("category", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder={t('potentialClientsPage.addModal.selectCategory') || 'اختر الفئة'} />
              </SelectTrigger>
              <SelectContent>
                {categoryOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Consultation Type */}
          <div className="space-y-2">
            <Label>{t('potentialClientsPage.table.consultationType') || 'نوع الاستشارة'}</Label>
            <Select 
              dir={isRTL ? "rtl" : "ltr"}
              value={formData.consultation_type} 
              onValueChange={(value) => handleInputChange("consultation_type", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder={t('potentialClientsPage.addModal.selectConsultationType') || 'اختر نوع الاستشارة'} />
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

          {/* Branch */}
          <div className="space-y-2">
            <Label>{t('potentialClientsPage.table.branch') || 'الفرع'} *</Label>
            <Select 
              dir={isRTL ? "rtl" : "ltr"}
              value={formData.branch_id?.toString()} 
              onValueChange={(value) => handleInputChange("branch_id", parseInt(value))}
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

          {/* Emirates ID */}
          <div className="space-y-2">
            <Label htmlFor="e_id">{t('potentialClientsPage.table.emiratesId') || 'رقم الهوية الإماراتية'}</Label>
            <Input
              id="e_id"
              value={formData.e_id}
              onChange={(e) => handleInputChange("e_id", e.target.value)}
              placeholder="مثال: 784-1234-1234567-1"
            />
          </div>

          {/* Passport */}
          <div className="space-y-2">
            <Label htmlFor="passport">{t('potentialClientsPage.table.passport') || 'رقم جواز السفر'}</Label>
            <Input
              id="passport"
              value={formData.passport}
              onChange={(e) => handleInputChange("passport", e.target.value)}
              placeholder={t('potentialClientsPage.addModal.passportPlaceholder') || 'مثال: A12345678'}
            />
          </div>

          {/* Nationality */}
          <div className="space-y-2">
            <Label htmlFor="nationality">{t('potentialClientsPage.table.nationality') || 'الجنسية'}</Label>
            <Input
              id="nationality"
              value={formData.nationality}
              onChange={(e) => handleInputChange("nationality", e.target.value)}
              placeholder={t('potentialClientsPage.addModal.nationalityPlaceholder') || 'مثال: الإمارات العربية المتحدة'}
            />
          </div>

          {/* Status Switch */}
          <div className="space-y-2">
            <Label htmlFor="status">{t('potentialClientsPage.table.status') || 'الحالة'}</Label>
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
                  ? 'نشط'
                  : 'غير نشط'
                }
              </Label>
            </div>
          </div>

          {/* VIP Switch */}
          <div className="space-y-2">
            <Label htmlFor="is_vip">{t('potentialClientsPage.vipStatus') || 'عميل مميز (VIP)'}</Label>
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
                  ? (t('potentialClientsPage.vip') || 'VIP')
                  : (t('potentialClientsPage.regular') || 'عادي')
                }
              </Label>
            </div>
          </div>

          {/* Address */}
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="address">{t('potentialClientsPage.table.address') || 'العنوان'}</Label>
            <Textarea
              id="address"
              value={formData.address}
              onChange={(e) => handleInputChange("address", e.target.value)}
              placeholder={t('potentialClientsPage.addModal.addressPlaceholder') || 'مثال: شارع الشيخ زايد، دبي'}
              rows={3}
            />
          </div>

          {/* File Upload Section */}
          <div className="space-y-2 md:col-span-2">
            <Label>{t('potentialClientsPage.files.title') || 'رفع الملفات'}</Label>
            
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
              onClick={() => document.getElementById('party-file-input')?.click()}
            >
              <Upload className="h-6 w-6 mx-auto mb-2 text-gray-400" />
              <p className="text-sm text-gray-600 mb-1">
                {t('potentialClientsPage.files.dragAndDrop') || 'اسحب وأفلت الملفات هنا أو انقر للاختيار'}
              </p>
              <p className="text-xs text-gray-500">
                {t('potentialClientsPage.files.supportedFormats') || 'المنسقات المدعومة: PDF, DOC, DOCX, JPG, PNG'}
              </p>
              <input
                id="party-file-input"
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
                  {t('potentialClientsPage.files.selected') || 'الملفات المحددة'}: {partyFiles.length}
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
            onClick={() => {
              resetForm();
              onClose();
            }}
            disabled={loading}
          >
            {t('potentialClientsPage.addModal.cancel') || 'إلغاء'}
          </Button>
          <Button 
            onClick={handleSave}
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'} animate-spin`} />
                {t('potentialClientsPage.addModal.saving') || 'جاري الحفظ...'}
              </>
            ) : (
              <>
                <Save className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                {t('potentialClientsPage.addModal.save') || 'حفظ'}
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}