"use client"

import React, { useState, useEffect, useCallback } from 'react'
import { useLanguage } from "@/contexts/LanguageContext"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { toast } from 'react-toastify'
import {
  Mail, MessageCircle, Edit3, Send, Gift, Star, Globe, Sun,
  Cake, Moon, CheckCircle2, FileText, DollarSign, Settings,
  Users, Image, X, ChevronDown, ChevronUp, Loader2, Eye
} from 'lucide-react'
import { getClientMessageTemplates, updateClientMessageTemplate, sendClientMessage } from '@/app/services/api/clientMessages'
import { getPartiesForms, downloadPartiesForm, deletePartiesForm } from '@/app/services/api/partiesForms'
import SendMessageModal from './SendMessageModal'
import EditTemplateModal from './EditTemplateModal'
import AddFormModal from './AddFormModal'

const MESSAGE_CONFIGS = [
  {
    type: 'welcome_client',
    icon: Star,
    gradient: 'from-blue-500 to-cyan-500',
    bg: 'bg-blue-50 dark:bg-blue-950/40',
    border: 'border-blue-200 dark:border-blue-800',
    badge: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
    labelAr: 'رسالة الترحيب بالعميل',
    labelEn: 'Client Welcome',
    descAr: 'مع تعليمات الوصول للبوابة',
    descEn: 'With portal access instructions',
  },
  {
    type: 'acquittal',
    icon: CheckCircle2,
    gradient: 'from-emerald-500 to-teal-500',
    bg: 'bg-emerald-50 dark:bg-emerald-950/40',
    border: 'border-emerald-200 dark:border-emerald-800',
    badge: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300',
    labelAr: 'تهنئة بالبراءة',
    labelEn: 'Acquittal Congratulations',
    descAr: 'قابل للتخصيص برقم القضية والحكم',
    descEn: 'Customizable with case & verdict',
    hasVariables: ['case_number', 'verdict_summary'],
  },
  {
    type: 'eid_al_fitr',
    icon: Moon,
    gradient: 'from-purple-500 to-violet-500',
    bg: 'bg-purple-50 dark:bg-purple-950/40',
    border: 'border-purple-200 dark:border-purple-800',
    badge: 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300',
    labelAr: 'تهنئة عيد الفطر',
    labelEn: 'Eid Al-Fitr',
    descAr: 'تهاني عيد الفطر المبارك',
    descEn: 'Eid Al-Fitr congratulations',
  },
  {
    type: 'eid_al_adha',
    icon: Gift,
    gradient: 'from-amber-500 to-orange-500',
    bg: 'bg-amber-50 dark:bg-amber-950/40',
    border: 'border-amber-200 dark:border-amber-800',
    badge: 'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300',
    labelAr: 'تهنئة عيد الأضحى',
    labelEn: 'Eid Al-Adha',
    descAr: 'تهاني عيد الأضحى المبارك',
    descEn: 'Eid Al-Adha congratulations',
  },
  {
    type: 'national_day',
    icon: Globe,
    gradient: 'from-green-500 to-emerald-600',
    bg: 'bg-green-50 dark:bg-green-950/40',
    border: 'border-green-200 dark:border-green-800',
    badge: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
    labelAr: 'اليوم الوطني',
    labelEn: 'National Day',
    descAr: 'قابل للتخصيص حسب الدولة',
    descEn: 'Customizable by country',
    hasVariables: ['country_name'],
  },
  {
    type: 'islamic_new_year',
    icon: Moon,
    gradient: 'from-indigo-500 to-blue-600',
    bg: 'bg-indigo-50 dark:bg-indigo-950/40',
    border: 'border-indigo-200 dark:border-indigo-800',
    badge: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300',
    labelAr: 'رأس السنة الهجرية',
    labelEn: 'Islamic New Year',
    descAr: 'تهاني العام الهجري الجديد',
    descEn: 'Islamic New Year greetings',
  },
  {
    type: 'gregorian_new_year',
    icon: Star,
    gradient: 'from-rose-500 to-pink-500',
    bg: 'bg-rose-50 dark:bg-rose-950/40',
    border: 'border-rose-200 dark:border-rose-800',
    badge: 'bg-rose-100 text-rose-700 dark:bg-rose-900 dark:text-rose-300',
    labelAr: 'رأس السنة الميلادية',
    labelEn: 'Gregorian New Year',
    descAr: 'تهاني العام الميلادي الجديد',
    descEn: 'New Year congratulations',
    hasVariables: ['year'],
  },
  {
    type: 'birthday',
    icon: Cake,
    gradient: 'from-pink-500 to-rose-500',
    bg: 'bg-pink-50 dark:bg-pink-950/40',
    border: 'border-pink-200 dark:border-pink-800',
    badge: 'bg-pink-100 text-pink-700 dark:bg-pink-900 dark:text-pink-300',
    labelAr: 'عيد الميلاد',
    labelEn: 'Birthday',
    descAr: 'رسالة تهنئة بعيد ميلاد العميل',
    descEn: 'Client birthday message',
  },
  {
    type: 'ramadan',
    icon: Sun,
    gradient: 'from-yellow-500 to-amber-500',
    bg: 'bg-yellow-50 dark:bg-yellow-950/40',
    border: 'border-yellow-200 dark:border-yellow-800',
    badge: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300',
    labelAr: 'رمضان كريم',
    labelEn: 'Ramadan',
    descAr: 'تهاني شهر رمضان المبارك',
    descEn: 'Ramadan Mubarak greetings',
  },
]

export default function ClientFormsPage() {
  const { language } = useLanguage()
  const isArabic = language === 'ar'

  const [templates, setTemplates] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('messages')

  // Modal states
  const [sendModal, setSendModal] = useState({ open: false, config: null, template: null })
  const [editModal, setEditModal] = useState({ open: false, config: null, template: null })

  // Legacy forms (price quotes etc.)
  const [forms, setForms] = useState([])
  const [formsLoading, setFormsLoading] = useState(false)

  const fetchTemplates = useCallback(async () => {
    setLoading(true)
    try {
      const res = await getClientMessageTemplates()
      if (res.success) setTemplates(res.data)
    } catch {
      toast.error(isArabic ? 'خطأ في تحميل القوالب' : 'Error loading templates')
    } finally {
      setLoading(false)
    }
  }, [isArabic])

  const fetchForms = useCallback(async () => {
    setFormsLoading(true)
    try {
      const res = await getPartiesForms('price_quote')
      if (res.success) setForms(res.data)
    } catch {
      // silent
    } finally {
      setFormsLoading(false)
    }
  }, [])

  useEffect(() => { fetchTemplates(); fetchForms() }, [fetchTemplates, fetchForms])

  const getTemplate = (type) => templates.find(t => t.message_type === type)

  const openSend = (config) => {
    const template = getTemplate(config.type)
    setSendModal({ open: true, config, template })
  }

  const openEdit = (config) => {
    const template = getTemplate(config.type)
    setEditModal({ open: true, config, template })
  }

  const onTemplateSaved = () => { fetchTemplates(); setEditModal({ open: false, config: null, template: null }) }

  return (
    <div className={`min-h-screen p-6 space-y-6 ${isArabic ? 'rtl' : 'ltr'}`} dir={isArabic ? 'rtl' : 'ltr'}>

      {/* ── Header ── */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-900 p-8 text-white shadow-2xl">
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, #60a5fa 0%, transparent 50%), radial-gradient(circle at 80% 20%, #a78bfa 0%, transparent 50%)' }} />
        <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-white/10 rounded-xl backdrop-blur-sm">
                <MessageCircle className="w-6 h-6 text-blue-300" />
              </div>
              <Badge className="bg-blue-500/20 text-blue-200 border-blue-400/30 backdrop-blur-sm">
                {isArabic ? 'مركز التواصل مع العملاء' : 'Client Communications Hub'}
              </Badge>
            </div>
            <h1 className="text-3xl font-bold tracking-tight mb-1">
              {isArabic ? 'رسائل العملاء' : 'Client Messages'}
            </h1>
            <p className="text-blue-200/80 text-sm">
              {isArabic
                ? 'أرسل رسائل مخصصة لعملائك عبر البريد الإلكتروني أو واتساب'
                : 'Send personalized messages to your clients via Email or WhatsApp'}
            </p>
          </div>
          <div className="flex gap-3">
            <Button
              variant="outline"
              className="border-white/20 text-white hover:bg-white/10 gap-2"
              onClick={() => window.location.href = '/settings/integrations'}
            >
              <Settings className="w-4 h-4" />
              {isArabic ? 'الإعدادات' : 'Settings'}
            </Button>
          </div>
        </div>

        {/* Stats row */}
        <div className="relative mt-6 grid grid-cols-3 gap-4">
          {[
            { label: isArabic ? 'قوالب الرسائل' : 'Message Templates', value: MESSAGE_CONFIGS.length },
            { label: isArabic ? 'قنوات الإرسال' : 'Send Channels', value: 2 },
            { label: isArabic ? 'اللغات المدعومة' : 'Supported Languages', value: 2 },
          ].map((s, i) => (
            <div key={i} className="bg-white/5 backdrop-blur rounded-xl p-4 border border-white/10 text-center">
              <div className="text-2xl font-bold text-white">{s.value}</div>
              <div className="text-xs text-blue-200/70 mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Tabs ── */}
      <div className="flex gap-2 border-b border-border pb-0">
        {[
          { id: 'messages', labelAr: 'رسائل التواصل', labelEn: 'Communications', icon: MessageCircle },
          { id: 'quotes', labelAr: 'عروض الأسعار', labelEn: 'Price Quotes', icon: DollarSign },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-5 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab.id
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {isArabic ? tab.labelAr : tab.labelEn}
          </button>
        ))}
      </div>

      {/* ── Messages Grid ── */}
      {activeTab === 'messages' && (
        <div>
          {loading ? (
            <div className="flex items-center justify-center h-64 gap-3">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
              <span className="text-muted-foreground">{isArabic ? 'جاري التحميل...' : 'Loading...'}</span>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
              {MESSAGE_CONFIGS.map((config) => {
                const template = getTemplate(config.type)
                const Icon = config.icon
                return (
                  <div
                    key={config.type}
                    className={`group relative rounded-2xl border-2 ${config.border} ${config.bg} p-5 transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5`}
                  >
                    {/* Top row */}
                    <div className="flex items-start justify-between mb-4">
                      <div className={`p-3 rounded-xl bg-gradient-to-br ${config.gradient} text-white shadow-lg`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <Badge className={`text-xs font-medium ${config.badge} border-0`}>
                        {isArabic ? 'قالب' : 'Template'}
                      </Badge>
                    </div>

                    {/* Title */}
                    <h3 className="font-bold text-base mb-1 text-foreground">
                      {isArabic ? config.labelAr : config.labelEn}
                    </h3>
                    <p className="text-xs text-muted-foreground mb-4">
                      {isArabic ? config.descAr : config.descEn}
                    </p>

                    {/* Preview snippet */}
                    {template && (
                      <p className="text-xs text-muted-foreground line-clamp-2 mb-4 bg-background/60 rounded-lg p-2 italic">
                        {isArabic ? template.body_ar?.substring(0, 80) : template.body_en?.substring(0, 80)}...
                      </p>
                    )}

                    {/* Variable tags */}
                    {config.hasVariables && (
                      <div className="flex flex-wrap gap-1 mb-4">
                        {config.hasVariables.map(v => (
                          <span key={v} className="text-[10px] px-2 py-0.5 rounded-full bg-background/80 border border-border font-mono text-muted-foreground">
                            {`{{${v}}}`}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1 gap-1.5 text-xs"
                        onClick={() => openEdit(config)}
                      >
                        <Edit3 className="w-3 h-3" />
                        {isArabic ? 'تعديل' : 'Edit'}
                      </Button>
                      <Button
                        size="sm"
                        className={`flex-1 gap-1.5 text-xs bg-gradient-to-r ${config.gradient} border-0 text-white hover:opacity-90`}
                        onClick={() => openSend(config)}
                      >
                        <Send className="w-3 h-3" />
                        {isArabic ? 'إرسال' : 'Send'}
                      </Button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* ── Price Quotes Tab ── */}
      {activeTab === 'quotes' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <AddFormModal onFormAdded={fetchForms} />
          </div>
          {formsLoading ? (
            <div className="flex items-center justify-center h-40 gap-3">
              <Loader2 className="w-5 h-5 animate-spin text-primary" />
            </div>
          ) : forms.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground">
              <FileText className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>{isArabic ? 'لا توجد عروض أسعار بعد' : 'No price quotes yet'}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {forms.map(form => (
                <div key={form.id} className="rounded-xl border bg-card p-5 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-3">
                    <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                      <DollarSign className="w-5 h-5 text-green-600" />
                    </div>
                  </div>
                  <h4 className="font-semibold text-sm mb-1">{form.title}</h4>
                  <p className="text-xs text-muted-foreground mb-4">
                    {new Date(form.created_at).toLocaleDateString(isArabic ? 'ar-AE' : 'en-US')}
                  </p>
                  <Button size="sm" variant="outline" className="w-full gap-2 text-xs" onClick={() => downloadPartiesForm(form.id)}>
                    <Eye className="w-3 h-3" />
                    {isArabic ? 'عرض وتحميل' : 'View & Download'}
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Modals ── */}
      {editModal.open && (
        <EditTemplateModal
          config={editModal.config}
          template={editModal.template}
          isArabic={isArabic}
          onClose={() => setEditModal({ open: false, config: null, template: null })}
          onSaved={onTemplateSaved}
        />
      )}

      {sendModal.open && (
        <SendMessageModal
          config={sendModal.config}
          template={sendModal.template}
          isArabic={isArabic}
          onClose={() => setSendModal({ open: false, config: null, template: null })}
        />
      )}
    </div>
  )
}
