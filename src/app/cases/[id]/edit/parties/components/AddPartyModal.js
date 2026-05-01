"use client";

import { useState, useEffect, useCallback } from "react";
import useSWR from "swr";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
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
  SelectValue 
} from "@/components/ui/select";
import { Plus, Save, Loader2, Upload, X, FileText, ImageIcon, FileIcon } from "lucide-react";
import { createParty, checkDuplicateParty } from "@/app/services/api/parties";
import { getBranches } from "@/app/services/api/branches";
import { toast } from "react-toastify";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTranslations } from "@/hooks/useTranslations";
import { cn } from "@/lib/utils";

const AddPartyModal = ({ onPartyAdded, children, initialPartyType = "" }) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { isRTL, language } = useLanguage();
  const { t } = useTranslations();
  const [partyFiles, setPartyFiles] = useState([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    address: "",
    e_id: "",
    category: "",
    email: "",
    party_type: initialPartyType,
    status: "active",
    nationality: "",
    branch_id: 1,
    consultation_type: "",
    passport: "",
    is_vip: false
  });

  // Fetch branches
  const { data: branchesData, error: branchesError } = useSWR(
    open ? '/branches' : null,
    getBranches
  );

  const branches = branchesData?.data || [];

  // Update form when initialPartyType changes
  useEffect(() => {
    if (initialPartyType) {
      setFormData(prev => ({
        ...prev,
        party_type: initialPartyType
      }));
    }
  }, [initialPartyType]);

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
      category: "",
      email: "",
      party_type: initialPartyType,
      status: "active",
      nationality: "",
      branch_id: 1,
      consultation_type: "",
      passport: "",
      is_vip: false
    });
    setPartyFiles([]);
  };

  const handleSave = async () => {
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

      // Phone is required only for client party type
      if (formData.party_type === 'client' && !formData.phone) {
        toast.error(t('parties.phoneRequiredForClient') || "رقم الهاتف مطلوب للعملاء");
        return;
      }
      
      const duplicateCheck = await checkDuplicateParty(
        formData.name, 
        formData.phone, 
        formData.email || null
      );
      
      if (duplicateCheck.success && duplicateCheck.isDuplicate) {
        const { duplicates } = duplicateCheck;
        const errorMessages = [];
        
        if (duplicates.name) {
          errorMessages.push(t('parties.duplicateNameExists') || (isRTL 
            ? 'طرف بنفس الاسم موجود بالفعل'
            : 'A party with the same name already exists'));
        }
        
        if (duplicates.phone) {
          errorMessages.push(t('parties.duplicatePhoneExists') || (isRTL 
            ? 'طرف بنفس رقم الهاتف موجود بالفعل'
            : 'A party with the same phone number already exists'));
        }
        
        if (duplicates.email) {
          errorMessages.push(t('parties.duplicateEmailExists') || (isRTL 
            ? 'طرف بنفس البريد الإلكتروني موجود بالفعل'
            : 'A party with the same email already exists'));
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
      
      if (response.success) {
        toast.success(t('parties.partyAddedSuccess') || "تم إضافة الطرف بنجاح");
        resetForm();
        setOpen(false);
        if (onPartyAdded) {
          // Pass the new party data with the returned ID
          onPartyAdded({
            ...formData,
            id: response.id
          });
        }
      } else {
        toast.error(t('parties.partyAddError') || "حدث خطأ أثناء إضافة الطرف");
      }
    } catch (error) {
      console.error('Error adding party:', error);
      toast.error(t('parties.partyAddError') || "حدث خطأ أثناء إضافة الطرف");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button variant="outline" size="sm">
            <Plus className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
            {t('parties.addNewParty') || 'إضافة طرف جديد'}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t('parties.addNewParty') || 'إضافة طرف جديد'}</DialogTitle>
        </DialogHeader>
        
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
            <Label htmlFor="phone">
              {t('parties.phone') || 'رقم الهاتف'}
              {formData.party_type === 'client' && ' *'}
            </Label>
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

          {/* File Upload Section */}
          <div className="space-y-2 md:col-span-2">
            <Label>{t('files.uploadFiles') || 'رفع الملفات'}</Label>
            
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
                {t('files.dragAndDrop') || 'اسحب وأفلت الملفات هنا أو انقر للاختيار'}
              </p>
              <p className="text-xs text-gray-500">
                {t('files.supportedFormats') || 'المنسقات المدعومة: PDF, DOC, DOCX, JPG, PNG'}
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
            onClick={handleSave}
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'} animate-spin`} />
                {t('parties.saving') || 'جاري الحفظ...'}
              </>
            ) : (
              <>
                <Save className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                {t('parties.save') || 'حفظ'}
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddPartyModal;