'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import useSWR from 'swr';
import { 
  ArrowLeft, 
  ArrowRight,
  Building2,
  Plus,
  Edit,
  Trash2,
  MapPin,
  Save,
  X
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import PageHeader from '@/components/PageHeader';
import { useTranslations } from '@/hooks/useTranslations';
import { useLanguage } from '@/contexts/LanguageContext';
import { getBranches, createBranch, updateBranch, deleteBranch } from '@/app/services/api/branches';
import { toast } from 'react-toastify';
import { useNotify } from '@/hooks/useNotify';

const BranchesSettingsPage = () => {
  const {t} = useTranslations();
  const { isRTL, language } = useLanguage();
  const notify = useNotify();
  const router = useRouter();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingBranch, setEditingBranch] = useState(null);
  const [formData, setFormData] = useState({
    name_ar: '',
    name_en: '',
    location: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const BackIcon = isRTL ? ArrowRight : ArrowLeft;

  // Fetch branches
  const { data: branchesData, error, mutate } = useSWR(
    '/branches',
    getBranches,
    {
      revalidateOnFocus: false,
    }
  );

  const branches = branchesData?.data || [];

  const handleOpenDialog = (branch = null) => {
    if (branch) {
      setEditingBranch(branch);
      setFormData({
        name_ar: branch.name_ar || '',
        name_en: branch.name_en || '',
        location: branch.location || ''
      });
    } else {
      setEditingBranch(null);
      setFormData({
        name_ar: '',
        name_en: '',
        location: ''
      });
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingBranch(null);
    setFormData({
      name_ar: '',
      name_en: '',
      location: ''
    });
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (editingBranch) {
        // Update existing branch
        await updateBranch(editingBranch.id, formData);
        toast.success(language === 'ar' ? 'تم تحديث الفرع بنجاح' : 'Branch updated successfully');
      } else {
        // Create new branch
        await createBranch(formData);
        toast.success(language === 'ar' ? 'تم إضافة الفرع بنجاح' : 'Branch created successfully');
      }
      
      // Refresh branches list
      mutate();
      handleCloseDialog();
    } catch (error) {
      notify.handleApiError(error, 'branches.saveFailed')
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (branchId) => {
    if (!confirm(language === 'ar' ? 'هل أنت متأكد من حذف هذا الفرع؟' : 'Are you sure you want to delete this branch?')) {
      return;
    }

    try {
      await deleteBranch(branchId);
      toast.success(language === 'ar' ? 'تم حذف الفرع بنجاح' : 'Branch deleted successfully');
      mutate();
    } catch (error) {
      notify.handleApiError(error, 'branches.deleteFailed')
    }
  };

  return (
    <div className="space-y-6 p-6">
      <PageHeader
        title={language === 'ar' ? 'إدارة الفروع' : 'Branches Management'}
        description={language === 'ar' ? 'إضافة وتعديل فروع الشركة' : 'Add and edit company branches'}
      >
        <div className="flex items-center gap-2">
          <Button 
            onClick={() => handleOpenDialog()}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            {language === 'ar' ? 'إضافة فرع جديد' : 'Add New Branch'}
          </Button>
          <Button
            variant="outline"
            onClick={() => router.back()}
            className="flex items-center gap-2"
          >
            <BackIcon className="h-4 w-4" />
            {t('buttons.back')}
          </Button>
        </div>
      </PageHeader>

      {/* Branches List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            {language === 'ar' ? 'قائمة الفروع' : 'Branches List'}
          </CardTitle>
          <CardDescription>
            {language === 'ar' 
              ? `إجمالي الفروع: ${branches.length}`
              : `Total Branches: ${branches.length}`
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          {branches.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Building2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium">
                {language === 'ar' ? 'لا توجد فروع' : 'No branches found'}
              </p>
              <p className="text-sm">
                {language === 'ar' ? 'ابدأ بإضافة فرع جديد' : 'Start by adding a new branch'}
              </p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{language === 'ar' ? 'الرقم' : 'ID'}</TableHead>
                    <TableHead>{language === 'ar' ? 'الاسم بالعربية' : 'Arabic Name'}</TableHead>
                    <TableHead>{language === 'ar' ? 'الاسم بالإنجليزية' : 'English Name'}</TableHead>
                    <TableHead>{language === 'ar' ? 'الموقع' : 'Location'}</TableHead>
                    <TableHead className="text-center">{language === 'ar' ? 'الإجراءات' : 'Actions'}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {branches.map((branch) => (
                    <TableRow key={branch.id}>
                      <TableCell className="font-medium">#{branch.id}</TableCell>
                      <TableCell>{branch.name_ar || '-'}</TableCell>
                      <TableCell>{branch.name_en || '-'}</TableCell>
                      <TableCell>
                        {branch.location ? (
                          <div className="flex items-center gap-1">
                            <MapPin className="h-3 w-3 text-muted-foreground" />
                            <span className="text-sm">{branch.location}</span>
                          </div>
                        ) : (
                          '-'
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-center gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleOpenDialog(branch)}
                            title={language === 'ar' ? 'تعديل' : 'Edit'}
                            className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(branch.id)}
                            title={language === 'ar' ? 'حذف' : 'Delete'}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
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
        </CardContent>
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle>
                {editingBranch 
                  ? (language === 'ar' ? 'تعديل الفرع' : 'Edit Branch')
                  : (language === 'ar' ? 'إضافة فرع جديد' : 'Add New Branch')
                }
              </DialogTitle>
              <DialogDescription>
                {language === 'ar' 
                  ? 'أدخل معلومات الفرع بالعربية والإنجليزية'
                  : 'Enter branch information in Arabic and English'
                }
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name_ar">
                  {language === 'ar' ? 'الاسم بالعربية' : 'Arabic Name'}
                  <span className="text-red-500 ml-1">*</span>
                </Label>
                <Input
                  id="name_ar"
                  value={formData.name_ar}
                  onChange={(e) => handleInputChange('name_ar', e.target.value)}
                  placeholder={language === 'ar' ? 'أدخل اسم الفرع بالعربية' : 'Enter branch name in Arabic'}
                  required
                  dir="rtl"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="name_en">
                  {language === 'ar' ? 'الاسم بالإنجليزية' : 'English Name'}
                  <span className="text-red-500 ml-1">*</span>
                </Label>
                <Input
                  id="name_en"
                  value={formData.name_en}
                  onChange={(e) => handleInputChange('name_en', e.target.value)}
                  placeholder={language === 'ar' ? 'أدخل اسم الفرع بالإنجليزية' : 'Enter branch name in English'}
                  required
                  dir="ltr"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">
                  {language === 'ar' ? 'الموقع' : 'Location'}
                </Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                  placeholder={language === 'ar' ? 'أدخل موقع الفرع' : 'Enter branch location'}
                />
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={handleCloseDialog}
                disabled={isSubmitting}
              >
                <X className="h-4 w-4 mr-2" />
                {language === 'ar' ? 'إلغاء' : 'Cancel'}
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <div className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-background border-t-transparent" />
                    {language === 'ar' ? 'جاري الحفظ...' : 'Saving...'}
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    {language === 'ar' ? 'حفظ' : 'Save'}
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BranchesSettingsPage;
