"use client";

import { useState, useCallback } from "react";
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
import { Plus, UserPlus, Upload, X, File, FileText, ImageIcon, FileIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import PartyTypeSelector from "./PartyTypeSelector";
import PartySelector from "./PartySelector";
import AddPartyModal from "./AddPartyModal";
import { useTranslations } from "@/hooks/useTranslations";
import { cn } from "@/lib/utils";
import { toast } from "react-toastify";
import { addPartyToCase } from "@/app/services/api/parties";

const AddPartyToTableModal = ({ children, caseId, onPartyAdded }) => {
  const [open, setOpen] = useState(false);
  const [selectedPartyType, setSelectedPartyType] = useState("");
  const [selectedParty, setSelectedParty] = useState("");
  const [selectedPartyData, setSelectedPartyData] = useState(null); // NEW: store full party object
  const [partyFiles, setPartyFiles] = useState([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [loading, setLoading] = useState(false);
  const { t } = useTranslations();

  // No longer need useParties hook - we get party data from search
  // const { parties, isLoading, getPartiesByType, getPartyById, mutate } = useParties(1);

  // Handle file selection - store files directly
  const handleFileSelect = useCallback((selectedFiles) => {
    const filesArray = Array.from(selectedFiles);
    
    // Store files directly without base64 conversion
    setPartyFiles(prev => [...prev, ...filesArray]);
  }, []);

  // Handle drag events
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

  // Handle file input change
  const handleInputChange = useCallback((e) => {
    const selectedFiles = e.target.files;
    if (selectedFiles.length > 0) {
      handleFileSelect(selectedFiles);
    }
  }, [handleFileSelect]);

  // Remove file
  const removeFile = useCallback((index) => {
    setPartyFiles(prev => prev.filter((_, i) => i !== index));
  }, []);

  // Format file size
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Get file icon
  const getFileIcon = (type) => {
    if (type.startsWith('image/')) return <ImageIcon className="h-4 w-4" />;
    if (type.includes('pdf')) return <FileText className="h-4 w-4" />;
    return <FileIcon className="h-4 w-4" />;
  };

  // No longer need filteredParties - search handles filtering
  // const filteredParties = selectedPartyType 
  //   ? getPartiesByType(selectedPartyType)
  //   : parties;

  const handlePartyTypeChange = (value) => {
    setSelectedPartyType(value);
    setSelectedParty(""); // Reset party selection when type changes
    setSelectedPartyData(null); // Reset party data
    setPartyFiles([]); // Reset files when type changes
  };

  // Handle when party is selected from search
  const handlePartySelect = useCallback((partyData) => {
    setSelectedPartyData(partyData);
  }, []);

  const handleAddParty = async () => {
    if (selectedParty && selectedPartyData && caseId) {
      try {
        setLoading(true);
        
        // Prepare the data for the API
        const partyData = {
          caseId: caseId,
          partyId: selectedPartyData.id,
          type: selectedPartyData.party_type,
          files: partyFiles, // Include the uploaded files
        };
        
        // Call the API to add party to case
        const response = await addPartyToCase(partyData);
        
        // Check if response indicates failure (permission or other errors)
        if (response?.success === false) {
          toast.error(response?.message || (language === 'ar' ? 'حدث خطأ أثناء إضافة الطرف للقضية' : 'Error adding party to case'));
          return;
        }
        
        if (response.success) {
          toast.success(t('parties.partyAddedToCase') || 'تم إضافة الطرف للقضية بنجاح');
          
          // Call the onPartyAdded callback if provided
          if (onPartyAdded) {
            onPartyAdded();
          }
          
          // Reset form
          setSelectedPartyType("");
          setSelectedParty("");
          setSelectedPartyData(null);
          setPartyFiles([]);
          setOpen(false);
        }
      } catch (error) {
        // Check if it's a permission error (403)
        const isPermissionError = error?.response?.status === 403;
        const errorMessage = isPermissionError 
          ? (error?.response?.data?.message || (language === 'ar' ? 'ليس لديك صلاحية لإضافة طرف للقضية' : 'You do not have permission to add a party to the case'))
          : (error?.response?.data?.message || t('parties.errorAddingParty') || 'حدث خطأ أثناء إضافة الطرف للقضية');
        
        toast.error(errorMessage);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleNewPartyCreated = (newParty) => {
    // No need to refresh parties list - search will handle it
    // Optionally, auto-select the newly created party
    if (newParty.party_type === selectedPartyType) {
      setSelectedParty(newParty.id.toString());
      setSelectedPartyData(newParty);
    }
  };

  const handleOpenChange = (isOpen) => {
    setOpen(isOpen);
    if (!isOpen) {
      // Reset form when closing
      setSelectedPartyType("");
      setSelectedParty("");
      setSelectedPartyData(null);
      setPartyFiles([]);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {children || (
          <Button variant="outline" size="sm">
            <Plus className="h-4 w-4 ml-2" />
            {t('parties.addToCase') || 'إضافة للقضية'}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t('parties.addToCase') || 'إضافة طرف للقضية'}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Party Type Selection */}
          <div className="space-y-2">
            <Label>{t('parties.selectPartyType') || 'اختر نوع الطرف'}</Label>
            <PartyTypeSelector
              value={selectedPartyType}
              onValueChange={handlePartyTypeChange}
            />
          </div>

          {/* Party Selection */}
          <div className="space-y-2">
            <Label>{t('parties.selectParty') || 'اختر الطرف'}</Label>
            <div className="flex gap-2">
              <div className="flex-1">
                <PartySelector
                  value={selectedParty}
                  onValueChange={setSelectedParty}
                  onPartySelect={handlePartySelect}
                  placeholder={
                    !selectedPartyType 
                      ? t('parties.selectPartyTypeFirst') || 'اختر نوع الطرف أولاً'
                      : t('parties.chooseParty') || 'اختر طرف'
                  }
                  disabled={!selectedPartyType}
                />
              </div>
              <AddPartyModal 
                onPartyAdded={handleNewPartyCreated}
                initialPartyType={selectedPartyType}
              >
                <Button 
                  variant="outline" 
                  size="icon"
                  type="button"
                  disabled={!selectedPartyType}
                  title={t('parties.createPartyTooltip') || 'إنشاء طرف جديد'}
                >
                  <UserPlus className="h-4 w-4" />
                </Button>
              </AddPartyModal>
            </div>
            {!selectedPartyType && (
              <p className="text-sm text-muted-foreground">
                {t('parties.selectPartyTypeToCreate') || 'اختر نوع الطرف لإنشاء طرف جديد'}
              </p>
            )}
          </div>



          {/* File Upload Section */}
          {selectedParty && (
            <div className="space-y-2">
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
                onClick={() => document.getElementById('party-file-input').click()}
              >
                <Upload className="h-6 w-6 mx-auto mb-2 text-gray-400" />
                <p className="text-sm text-gray-600 mb-1">
                  {t('files.dragAndDrop') || 'اسحب وأفلت الملفات هنا أو انقر للاختيار'}
                </p>
                <p className="text-xs text-gray-500">
                  {t('files.supportedFormats') || 'المنسقات المدعومة: PDF, DOC, DOCX, JPG, PNG'}
                </p>
              </div>

              {/* Hidden File Input */}
              <input
                id="party-file-input"
                type="file"
                multiple
                className="hidden"
                onChange={handleInputChange}
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif,.txt"
              />

              {/* Uploaded Files List */}
              {partyFiles.length > 0 && (
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  <Label className="text-sm font-medium">{t('files.uploadedFiles') || 'الملفات المرفوعة'} ({partyFiles.length})</Label>
                  {partyFiles.map((file, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded border">
                      <div className="flex items-center space-x-2 flex-1 min-w-0">
                        {getFileIcon(file.type)}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{file.name}</p>
                          <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFile(index)}
                        className="text-red-600 hover:text-red-800 hover:bg-red-50"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex justify-end space-x-2 mt-6">
          <Button 
            variant="outline" 
            onClick={() => setOpen(false)}
            disabled={loading}
          >
            {t('parties.cancel') || 'إلغاء'}
          </Button>
          <Button 
            onClick={handleAddParty}
            disabled={!selectedParty || loading}
          >
            {loading ? (
              <>
                <Upload className="h-4 w-4 ml-2 animate-spin" />
                {t('parties.adding') || 'جاري الإضافة...'}
              </>
            ) : (
              t('parties.addedToCase') || 'إضافة للقضية'
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddPartyToTableModal;