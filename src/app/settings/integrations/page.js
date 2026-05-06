"use client"
import React, { useState, useEffect } from 'react'
import { useLanguage } from "@/contexts/LanguageContext"
import { Button } from "@/components/ui/button"
import { toast } from 'react-toastify'
import { Mail, MessageCircle, Save, Eye, EyeOff, Loader2, CheckCircle2, Settings2, Globe, Building2 } from 'lucide-react'
import { getMessagingSettings, updateMessagingSettings } from '@/app/services/api/clientMessages'

export default function IntegrationsSettingsPage() {
  const { language } = useLanguage()
  const isArabic = language === 'ar'
  const [settings, setSettings] = useState({
    outlook_email: '', outlook_password: '', outlook_smtp_host: 'smtp.office365.com', outlook_smtp_port: '587',
    whatsapp_api_url: 'https://graph.facebook.com/v18.0', whatsapp_api_token: '', whatsapp_phone_id: '',
    firm_name: '', firm_name_ar: '', portal_url: '', national_day_country: ''
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showPass, setShowPass] = useState(false)
  const [showToken, setShowToken] = useState(false)

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await getMessagingSettings()
        if (res.success && res.data) setSettings(s => ({ ...s, ...res.data }))
      } catch { /* silent */ }
      finally { setLoading(false) }
    }
    fetch()
  }, [])

  const set = (key, val) => setSettings(s => ({ ...s, [key]: val }))

  const handleSave = async () => {
    setSaving(true)
    try {
      const payload = { ...settings }
      if (payload.outlook_password === '••••••••') delete payload.outlook_password
      await updateMessagingSettings(payload)
      toast.success(isArabic ? 'تم حفظ الإعدادات بنجاح' : 'Settings saved successfully')
    } catch { toast.error(isArabic ? 'خطأ في الحفظ' : 'Error saving settings') }
    finally { setSaving(false) }
  }

  const InputField = ({ label, value, onChange, type = 'text', placeholder, right }) => (
    <div>
      <label className="text-sm font-medium text-foreground mb-1.5 block">{label}</label>
      <div className="relative">
        <input
          type={type}
          className="w-full border rounded-xl px-4 py-2.5 text-sm bg-background focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
          value={value || ''} onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          dir={isArabic ? 'rtl' : 'ltr'}
        />
        {right && <div className="absolute inset-y-0 end-3 flex items-center">{right}</div>}
      </div>
    </div>
  )

  if (loading) return (
    <div className="flex items-center justify-center h-64 gap-3">
      <Loader2 className="w-6 h-6 animate-spin text-primary" />
    </div>
  )

  return (
    <div className={`max-w-3xl mx-auto p-6 space-y-6 ${isArabic ? 'rtl' : 'ltr'}`} dir={isArabic ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 to-indigo-900 p-7 text-white">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-white/10 rounded-xl"><Settings2 className="w-6 h-6 text-blue-300" /></div>
          <div>
            <h1 className="text-2xl font-bold">{isArabic ? 'إعدادات التكامل' : 'Integration Settings'}</h1>
            <p className="text-blue-200/80 text-sm mt-0.5">{isArabic ? 'ربط البريد الإلكتروني وواتساب بيزنس' : 'Connect Outlook Email & WhatsApp Business'}</p>
          </div>
        </div>
      </div>

      {/* Firm Info */}
      <div className="rounded-2xl border bg-card p-6 space-y-4">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg"><Building2 className="w-5 h-5 text-gray-600 dark:text-gray-400" /></div>
          <div>
            <h2 className="font-semibold text-base">{isArabic ? 'معلومات المكتب' : 'Firm Information'}</h2>
            <p className="text-xs text-muted-foreground">{isArabic ? 'تُستخدم في قوالب الرسائل' : 'Used in message templates'}</p>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <InputField label={isArabic ? 'اسم المكتب (إنجليزي)' : 'Firm Name (English)'} value={settings.firm_name} onChange={v => set('firm_name', v)} placeholder="Lexcora Legal" />
          <InputField label={isArabic ? 'اسم المكتب (عربي)' : 'Firm Name (Arabic)'} value={settings.firm_name_ar} onChange={v => set('firm_name_ar', v)} placeholder="ليكسورا للمحاماة" />
          <InputField label={isArabic ? 'رابط البوابة الإلكترونية' : 'Client Portal URL'} value={settings.portal_url} onChange={v => set('portal_url', v)} placeholder="https://portal.example.com" />
          <InputField label={isArabic ? 'اسم الدولة (اليوم الوطني)' : 'Country (National Day)'} value={settings.national_day_country} onChange={v => set('national_day_country', v)} placeholder={isArabic ? 'الإمارات العربية المتحدة' : 'United Arab Emirates'} />
        </div>
      </div>

      {/* Outlook */}
      <div className="rounded-2xl border bg-card p-6 space-y-4">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg"><Mail className="w-5 h-5 text-blue-600" /></div>
          <div>
            <h2 className="font-semibold text-base">{isArabic ? 'تكامل Outlook / البريد الإلكتروني' : 'Outlook / Email Integration'}</h2>
            <p className="text-xs text-muted-foreground">{isArabic ? 'استخدم SMTP لـ Office 365 أو أي خادم SMTP آخر' : 'Use Office 365 SMTP or any other SMTP server'}</p>
          </div>
        </div>

        <div className="p-3 bg-blue-50 dark:bg-blue-950/30 rounded-xl border border-blue-200 dark:border-blue-800 text-xs text-blue-700 dark:text-blue-300">
          {isArabic
            ? '💡 للاستخدام مع Outlook/Office 365: يجب تفعيل كلمة مرور التطبيق في إعدادات الحساب أو استخدام OAuth. الخادم: smtp.office365.com المنفذ: 587'
            : '💡 For Outlook/Office 365: Enable App Password in account settings or use OAuth. Host: smtp.office365.com  Port: 587'}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <InputField label={isArabic ? 'البريد الإلكتروني' : 'Email Address'} value={settings.outlook_email} onChange={v => set('outlook_email', v)} placeholder="office@firm.com" />
          <div>
            <label className="text-sm font-medium text-foreground mb-1.5 block">{isArabic ? 'كلمة مرور التطبيق' : 'App Password'}</label>
            <div className="relative">
              <input type={showPass ? 'text' : 'password'} className="w-full border rounded-xl px-4 py-2.5 text-sm bg-background focus:ring-2 focus:ring-primary outline-none pe-10"
                value={settings.outlook_password || ''} onChange={e => set('outlook_password', e.target.value)} placeholder="••••••••••••" />
              <button className="absolute inset-y-0 end-3 flex items-center justify-center min-w-6 min-h-6 p-2 text-muted-foreground" onClick={() => setShowPass(v => !v)}>
                {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
          <InputField label={isArabic ? 'خادم SMTP' : 'SMTP Host'} value={settings.outlook_smtp_host} onChange={v => set('outlook_smtp_host', v)} placeholder="smtp.office365.com" />
          <InputField label={isArabic ? 'منفذ SMTP' : 'SMTP Port'} value={settings.outlook_smtp_port} onChange={v => set('outlook_smtp_port', v)} placeholder="587" />
        </div>
      </div>

      {/* WhatsApp Business */}
      <div className="rounded-2xl border bg-card p-6 space-y-4">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg"><MessageCircle className="w-5 h-5 text-green-600" /></div>
          <div>
            <h2 className="font-semibold text-base">{isArabic ? 'تكامل واتساب بيزنس (Cloud API)' : 'WhatsApp Business (Cloud API)'}</h2>
            <p className="text-xs text-muted-foreground">{isArabic ? 'Meta WhatsApp Business API — من لوحة تحكم Meta for Developers' : 'Meta WhatsApp Business API — from Meta for Developers dashboard'}</p>
          </div>
        </div>

        <div className="p-3 bg-green-50 dark:bg-green-950/30 rounded-xl border border-green-200 dark:border-green-800 text-xs text-green-700 dark:text-green-300">
          {isArabic
            ? '💡 احصل على رمز الوصول ومعرف الهاتف من: Meta for Developers → WhatsApp → API Setup'
            : '💡 Get Access Token and Phone ID from: Meta for Developers → WhatsApp → API Setup'}
        </div>

        <div className="grid grid-cols-1 gap-4">
          <InputField label={isArabic ? 'رابط API (يبدأ بـ https://graph.facebook.com/v18.0)' : 'API URL'} value={settings.whatsapp_api_url} onChange={v => set('whatsapp_api_url', v)} placeholder="https://graph.facebook.com/v18.0" />
          <InputField label={isArabic ? 'معرف الهاتف (Phone Number ID)' : 'Phone Number ID'} value={settings.whatsapp_phone_id} onChange={v => set('whatsapp_phone_id', v)} placeholder="123456789012345" />
          <div>
            <label className="text-sm font-medium text-foreground mb-1.5 block">{isArabic ? 'رمز الوصول (Access Token)' : 'Access Token'}</label>
            <div className="relative">
              <input type={showToken ? 'text' : 'password'} className="w-full border rounded-xl px-4 py-2.5 text-sm bg-background focus:ring-2 focus:ring-primary outline-none pe-10 font-mono"
                value={settings.whatsapp_api_token || ''} onChange={e => set('whatsapp_api_token', e.target.value)} placeholder="EAABsbC..." />
              <button className="absolute inset-y-0 end-3 flex items-center justify-center min-w-6 min-h-6 p-2 text-muted-foreground" onClick={() => setShowToken(v => !v)}>
                {showToken ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Save */}
      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saving} size="lg" className="gap-2 min-w-[160px]">
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {saving ? (isArabic ? 'جاري الحفظ...' : 'Saving...') : (isArabic ? 'حفظ الإعدادات' : 'Save Settings')}
        </Button>
      </div>
    </div>
  )
}
