"use client";

import { useState, useCallback, useEffect } from "react";
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
import { Plus, CircleX, FileText, ImageIcon, FileIcon } from "lucide-react";
import { useTranslations } from "@/hooks/useTranslations";
import { useFormikContext } from '../../FormikContext';
import { cn } from "@/lib/utils";

const EditPartyModal = ({ children, party }) => {
  const [open, setOpen] = useState(false);
  const [clientRole, setClientRole] = useState("");
  const [partyFiles, setPartyFiles] = useState([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const { t } = useTranslations();
  
  // Use Formik context to update form state
  const { values, setFieldValue } = useFormikContext();
  const currentSelectedParties = values.selectedParties || [];

  // Initialize form data when modal opens
  useEffect(() => {
    if (open && party) {
      setClientRole(party.clientRole || "");
      setPartyFiles(party.files || []);
    }
  }, [open, party]);

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

  const handleUpdateParty = () => {
    if (party) {
      // Update the party data with new client role and files
      const updatedParty = {
        ...party,
        clientRole: clientRole.trim() || null,
        files: partyFiles
      };
      
      // Find and update the party in the selected parties array
      const updatedParties = currentSelectedParties.map(p => 
        p.id === party.id ? updatedParty : p
      );
      
      // Update the form state directly using Formik
      setFieldValue('selectedParties', updatedParties);
      
      // Also update the parties array for backward compatibility
      setFieldValue('parties', updatedParties);
      
      // Close modal
      setOpen(false);
    }
  };

  const handleOpenChange = (isOpen) => {
    setOpen(isOpen);
    if (!isOpen) {
      // Reset form when closing
      setClientRole("");
      setPartyFiles([]);
    }
  };

  if (!party) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t('parties.editParty')}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Party Information (Read-only) */}
          <div className="space-y-2">
            <Label>{t('parties.partyInfo')}</Label>
            <div className="p-3 bg-gray-50 rounded border">
              <p className="font-medium">{party.name}</p>
              <p className="text-sm text-gray-600">{party.phone}</p>
              {party.email && <p className="text-sm text-gray-600">{party.email}</p>}
            </div>
          </div>

          {/* Client Role Input */}
          <div className="space-y-2">
            <Label htmlFor="editClientRole">{t('parties.clientRole')}</Label>
            <Input
              id="editClientRole"
              value={clientRole}
              onChange={(e) => setClientRole(e.target.value)}
              placeholder={t('parties.clientRolePlaceholder')}
              className="w-full"
            />
            <p className="text-sm text-muted-foreground">
              {t('parties.clientRoleHelper')}
            </p>
          </div>

          {/* File Upload Section */}
          <div className="space-y-2">
            <Label>{t('files.uploadFiles')}</Label>
            
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
              onClick={() => document.getElementById('edit-party-file-input').click()}
            >
              <Plus className="h-6 w-6 mx-auto mb-2 text-gray-400" />
              <p className="text-sm text-gray-600 mb-1">
                {t('files.dragAndDrop')}
              </p>
              <p className="text-xs text-gray-500">
                {t('files.supportedFormats')}
              </p>
            </div>

            {/* Hidden File Input */}
            <input
              id="edit-party-file-input"
              type="file"
              multiple
              className="hidden"
              onChange={handleInputChange}
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif,.txt"
            />

            {/* Uploaded Files List */}
            {partyFiles.length > 0 && (
              <div className="space-y-2 max-h-32 overflow-y-auto">
                <Label className="text-sm font-medium">{t('files.uploadedFiles')} ({partyFiles.length})</Label>
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
                      <CircleX className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end space-x-2 mt-6">
          <Button 
            variant="outline" 
            onClick={() => setOpen(false)}
          >
            {t('parties.cancel')}
          </Button>
          <Button 
            onClick={handleUpdateParty}
          >
            {t('parties.updateParty')}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EditPartyModal;