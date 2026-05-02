"use client"
import React, { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { toast } from 'react-toastify'
import { X, Save, Image, Loader2, Globe } from 'lucide-react'
import { updateClientMessageTemplate } from '@/app/services/api/clientMessages'
import { uploadFile } from '@/app/services/api/upload'

export default function EditTemplateModal({ config, template, isArabic, onClose, onSaved }) {
  const [lang, setLang] = useState('ar')
  const [form, setForm] = useState({
    title_ar: '', title_en: '', body_ar: '', body_en: '', image_url: ''
  })
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    if (template) {
      setForm({
        title_ar: template.title_ar || '',
        title_en: template.title_en || '',
        body_ar: template.body_ar || '',
        body_en: template.body_en || '',
        image_url: template.image_url || '',
      })
    }
  }, [template])

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const result = await uploadFile(file, 'client-messages')
      if (result?.document_url) {
        setForm(f => ({ ...f, image_url: result.document_url }))
        toast.success(isArabic ? 'تم رفع الصورة' : 'Image uploaded')
      }
    } catch {
      toast.error(isArabic ? 'فشل رفع الصورة' : 'Image upload failed')
    } finally { setUploading(false) }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      await updateClientMessageTemplate(config.type, form)
      toast.success(isArabic ? 'تم حفظ القالب بنجاح' : 'Template saved successfully')
      onSaved()
    } catch {
      toast.error(isArabic ? 'خطأ في حفظ القالب' : 'Error saving template')
    } finally { setSaving(false) }
  }

  const Icon = config.icon

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div
        className="bg-background rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border"
        dir={isArabic ? 'rtl' : 'ltr'}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className={`flex items-center justify-between p-6 border-b bg-gradient-to-r ${config.gradient} text-white rounded-t-2xl`}>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-xl">
              <Icon className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-lg">{isArabic ? 'تعديل القالب' : 'Edit Template'}</h2>
              <p className="text-sm opacity-80">{isArabic ? config.labelAr : config.labelEn}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Language Switcher */}
          <div className="flex gap-2 p-1 bg-muted rounded-xl">
            {[{ id: 'ar', label: 'العربية' }, { id: 'en', label: 'English' }].map(l => (
              <button
                key={l.id}
                onClick={() => setLang(l.id)}
                className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all ${
                  lang === l.id ? 'bg-background shadow text-foreground' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Globe className="w-3 h-3 inline mr-1" />
                {l.label}
              </button>
            ))}
          </div>

          {/* Title */}
          <div>
            <label className="text-sm font-medium text-foreground mb-1.5 block">
              {isArabic ? 'العنوان' : 'Subject'} ({lang === 'ar' ? 'Arabic' : 'English'})
            </label>
            <input
              className="w-full border rounded-xl px-4 py-2.5 text-sm bg-background focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
              dir={lang === 'ar' ? 'rtl' : 'ltr'}
              value={lang === 'ar' ? form.title_ar : form.title_en}
              onChange={e => setForm(f => lang === 'ar' ? { ...f, title_ar: e.target.value } : { ...f, title_en: e.target.value })}
              placeholder={lang === 'ar' ? 'أدخل العنوان بالعربية' : 'Enter subject in English'}
            />
          </div>

          {/* Body */}
          <div>
            <label className="text-sm font-medium text-foreground mb-1.5 block">
              {isArabic ? 'نص الرسالة' : 'Message Body'} ({lang === 'ar' ? 'Arabic' : 'English'})
            </label>
            {config.hasVariables && (
              <div className="flex flex-wrap gap-1 mb-2">
                <span className="text-xs text-muted-foreground">{isArabic ? 'المتغيرات المتاحة:' : 'Available variables:'}</span>
                {['client_name', 'firm_name', ...(config.hasVariables || [])].map(v => (
                  <span key={v} className="text-[10px] px-2 py-0.5 rounded-full bg-muted font-mono text-muted-foreground cursor-pointer hover:bg-primary/10"
                    onClick={() => {
                      const key = lang === 'ar' ? 'body_ar' : 'body_en'
                      setForm(f => ({ ...f, [key]: f[key] + ` {{${v}}}` }))
                    }}>
                    {`{{${v}}}`}
                  </span>
                ))}
              </div>
            )}
            <textarea
              rows={10}
              className="w-full border rounded-xl px-4 py-3 text-sm bg-background focus:ring-2 focus:ring-primary focus:border-transparent outline-none resize-none font-mono leading-relaxed"
              dir={lang === 'ar' ? 'rtl' : 'ltr'}
              value={lang === 'ar' ? form.body_ar : form.body_en}
              onChange={e => setForm(f => lang === 'ar' ? { ...f, body_ar: e.target.value } : { ...f, body_en: e.target.value })}
              placeholder={lang === 'ar' ? 'أدخل نص الرسالة...' : 'Enter message body...'}
            />
          </div>

          {/* Image */}
          <div>
            <label className="text-sm font-medium text-foreground mb-1.5 block">
              {isArabic ? 'صورة مرفقة (اختياري)' : 'Attached Image (optional)'}
            </label>
            <div className="flex items-center gap-3">
              {form.image_url && (
                <img src={form.image_url} alt="" className="w-16 h-16 rounded-lg object-cover border" />
              )}
              <label className="flex items-center gap-2 px-4 py-2.5 border-2 border-dashed rounded-xl cursor-pointer hover:border-primary hover:bg-primary/5 transition-colors text-sm text-muted-foreground">
                {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Image className="w-4 h-4" />}
                {uploading ? (isArabic ? 'جاري الرفع...' : 'Uploading...') : (isArabic ? 'رفع صورة' : 'Upload Image')}
                <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} disabled={uploading} />
              </label>
              {form.image_url && (
                <button onClick={() => setForm(f => ({ ...f, image_url: '' }))}
                  className="text-xs text-destructive hover:underline">
                  {isArabic ? 'حذف' : 'Remove'}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 px-6 py-4 border-t bg-muted/30">
          <Button variant="outline" onClick={onClose}>{isArabic ? 'إلغاء' : 'Cancel'}</Button>
          <Button onClick={handleSave} disabled={saving} className="gap-2">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {saving ? (isArabic ? 'جاري الحفظ...' : 'Saving...') : (isArabic ? 'حفظ القالب' : 'Save Template')}
          </Button>
        </div>
      </div>
    </div>
  )
}
