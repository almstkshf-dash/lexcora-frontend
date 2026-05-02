"use client"
import React, { useState, useEffect, useCallback } from 'react'
import { Button } from "@/components/ui/button"
import { toast } from 'react-toastify'
import { X, Send, Mail, MessageCircle, Globe, Users, Search, Loader2, Paperclip, Check, AlertCircle, Printer } from 'lucide-react'
import { sendClientMessage } from '@/app/services/api/clientMessages'
import axiosInstance from '@/app/services/api/axiosInstance'
import { uploadFile } from '@/app/services/api/upload'
import { useTranslations } from "@/hooks/useTranslations"

export default function SendMessageModal({ config, template, isArabic, onClose }) {
  const { t } = useTranslations()
  const [lang, setLang] = useState(isArabic ? 'ar' : 'en')
  const [channel, setChannel] = useState('email')
  const [clients, setClients] = useState([])
  const [selectedIds, setSelectedIds] = useState([])
  const [search, setSearch] = useState('')
  const [loadingClients, setLoadingClients] = useState(false)
  const [sending, setSending] = useState(false)
  const [variables, setVariables] = useState({})
  const [attachments, setAttachments] = useState([])
  const [uploading, setUploading] = useState(false)
  const [result, setResult] = useState(null)

  const fetchClients = useCallback(async () => {
    setLoadingClients(true)
    try {
      const res = await axiosInstance.get('/parties', { params: { party_type: 'client', search, limit: 50 } })
      const data = res.data?.data || res.data || []
      setClients(Array.isArray(data) ? data : [])
    } catch { setClients([]) }
    finally { setLoadingClients(false) }
  }, [search])

  useEffect(() => { fetchClients() }, [fetchClients])

  const toggleClient = (id) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id])
  }

  const handleAttachment = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const result = await uploadFile(file, 'client-messages')
      if (result?.document_url) {
        setAttachments(prev => [...prev, { name: file.name, url: result.document_url }])
        toast.success(t('clientMessages.uploadSuccess') || 'File uploaded')
      }
    } catch { toast.error(t('clientMessages.uploadError') || 'Upload failed') }
    finally { setUploading(false) }
  }

  const previewBody = () => {
    if (!template) return ''
    const body = lang === 'ar' ? template.body_ar : template.body_en
    if (!body) return ''
    return body
      .replace(/\{\{client_name\}\}/g, isArabic ? 'اسم العميل' : 'Client Name')
      .replace(/\{\{firm_name\}\}/g, isArabic ? 'اسم المكتب' : 'Firm Name')
      .replace(/\{\{case_number\}\}/g, variables.case_number || '{{case_number}}')
      .replace(/\{\{verdict_summary\}\}/g, variables.verdict_summary || '{{verdict_summary}}')
      .replace(/\{\{country_name\}\}/g, variables.country_name || '{{country_name}}')
      .replace(/\{\{year\}\}/g, variables.year || new Date().getFullYear())
      .replace(/\{\{(\w+)\}\}/g, (_, k) => variables[k] || `{{${k}}}`)
  }

  const handleSend = async () => {
    if (!selectedIds.length) {
      toast.error(isArabic ? 'يرجى اختيار عميل واحد على الأقل' : 'Please select at least one client')
      return
    }
    setSending(true)
    try {
      const res = await sendClientMessage({
        message_type: config.type,
        client_ids: selectedIds,
        language: lang,
        channel,
        variables,
        attachment_urls: attachments.map(a => a.url)
      })
      setResult(res)
      if (res.success) toast.success(t('clientMessages.sendSuccess'))
      else toast.error(t('clientMessages.sendError'))
    } catch (err) {
      toast.error(err.message || t('clientMessages.sendError'))
    } finally { setSending(false) }
  }

  const Icon = config.icon

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-background rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto border"
        dir={isArabic ? 'rtl' : 'ltr'} onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className={`flex items-center justify-between p-6 border-b bg-gradient-to-r ${config.gradient} text-white rounded-t-2xl`}>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-xl"><Icon className="w-5 h-5" /></div>
            <div>
              <h2 className="font-bold text-lg">{t('clientMessages.sendMessage')}</h2>
              <p className="text-sm opacity-80">{t(`clientMessages.${config.labelKey}`)}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-lg"><X className="w-5 h-5" /></button>
        </div>

        {result ? (
          /* Result screen */
          <div className="p-8 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/40 flex items-center justify-center mx-auto">
              <Check className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-xl font-bold">{t('clientMessages.sendComplete')}</h3>
            <div className="grid grid-cols-2 gap-4 max-w-sm mx-auto">
              <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-4 border border-green-200 dark:border-green-800">
                <div className="text-2xl font-bold text-green-600">{result.data?.results?.length || 0}</div>
                <div className="text-xs text-green-700 dark:text-green-300">{t('clientMessages.sentSuccessfully')}</div>
              </div>
              <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-4 border border-red-200 dark:border-red-800">
                <div className="text-2xl font-bold text-red-600">{result.data?.errors?.length || 0}</div>
                <div className="text-xs text-red-700 dark:text-red-300">{t('clientMessages.failed')}</div>
              </div>
            </div>
            {result.data?.errors?.length > 0 && (
              <div className="text-left bg-red-50 dark:bg-red-900/20 rounded-xl p-4 border border-red-200 text-sm space-y-1">
                {result.data.errors.map((e, i) => (
                  <div key={i} className="flex items-center gap-2 text-red-700 dark:text-red-300">
                    <AlertCircle className="w-3 h-3 shrink-0" />
                    <span>{e.name}: {e.error}</span>
                  </div>
                ))}
              </div>
            )}
            <Button onClick={onClose} className="gap-2">{t('clientMessages.close')}</Button>
          </div>
        ) : (
          <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left column */}
            <div className="space-y-5">
              {/* Language */}
              <div>
                <label className="text-sm font-medium mb-2 block">{t('clientMessages.messageLanguage')}</label>
                <div className="flex gap-2 p-1 bg-muted rounded-xl">
                  {[{ id: 'ar', label: 'العربية' }, { id: 'en', label: 'English' }].map(l => (
                    <button key={l.id} onClick={() => setLang(l.id)}
                      className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all ${lang === l.id ? 'bg-background shadow text-foreground' : 'text-muted-foreground'}`}>
                      <Globe className="w-3 h-3 inline mr-1" />{l.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Channel */}
              <div>
                <label className="text-sm font-medium mb-2 block">{t('clientMessages.sendChannel')}</label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'email', icon: Mail, labelKey: 'emailOutlook' },
                    { id: 'whatsapp', icon: MessageCircle, labelKey: 'whatsappBusiness' }
                  ].map(ch => (
                    <button key={ch.id} onClick={() => setChannel(ch.id)}
                      className={`flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all text-sm font-medium ${channel === ch.id ? 'border-primary bg-primary/5 text-primary' : 'border-border text-muted-foreground hover:border-primary/40'}`}>
                      <ch.icon className="w-5 h-5" />
                      {t(`clientMessages.${ch.labelKey}`)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Dynamic Variables */}
              {config.hasVariables && config.hasVariables.length > 0 && (
                <div className="space-y-3">
                  <label className="text-sm font-medium block">{t('clientMessages.customVariables')}</label>
                  {config.hasVariables.map(varName => (
                    <div key={varName}>
                      <label className="text-xs text-muted-foreground mb-1 block font-mono">{`{{${varName}}}`}</label>
                      {varName === 'verdict_summary' ? (
                        <textarea rows={3} className="w-full border rounded-xl px-3 py-2 text-sm bg-background outline-none focus:ring-2 focus:ring-primary resize-none"
                          dir={lang === 'ar' ? 'rtl' : 'ltr'}
                          placeholder={t('clientMessages.verdictSummary')}
                          value={variables[varName] || ''}
                          onChange={e => setVariables(v => ({ ...v, [varName]: e.target.value }))} />
                      ) : (
                        <input className="w-full border rounded-xl px-3 py-2 text-sm bg-background outline-none focus:ring-2 focus:ring-primary"
                          dir={lang === 'ar' ? 'rtl' : 'ltr'}
                          placeholder={
                            varName === 'case_number' ? t('clientMessages.caseNumber') :
                            varName === 'services_list' ? t('clientMessages.servicesList') :
                            varName === 'total_amount' ? t('clientMessages.totalAmount') :
                            varName === 'currency' ? t('clientMessages.currency') :
                            varName
                          }
                          value={variables[varName] || ''}
                          onChange={e => setVariables(v => ({ ...v, [varName]: e.target.value }))} />
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Attachments */}
              <div>
                <label className="text-sm font-medium mb-2 block">{t('clientMessages.additionalAttachments')}</label>
                <label className="flex items-center gap-2 px-4 py-2.5 border-2 border-dashed rounded-xl cursor-pointer hover:border-primary hover:bg-primary/5 transition-colors text-sm text-muted-foreground">
                  {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Paperclip className="w-4 h-4" />}
                  {uploading ? t('clientMessages.uploading') : t('clientMessages.attachFile')}
                  <input type="file" className="hidden" onChange={handleAttachment} disabled={uploading} />
                </label>
                {attachments.length > 0 && (
                  <div className="mt-2 space-y-1">
                    {attachments.map((a, i) => (
                      <div key={i} className="flex items-center gap-2 text-xs text-muted-foreground bg-muted rounded-lg px-3 py-1.5">
                        <Paperclip className="w-3 h-3" />
                        <span className="flex-1 truncate">{a.name}</span>
                        <button onClick={() => setAttachments(prev => prev.filter((_, j) => j !== i))} className="text-destructive hover:underline">
                          {t('clientMessages.remove')}
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Right column — Client selection + Preview */}
            <div className="space-y-5">
              {/* Client search */}
              <div>
                <label className="text-sm font-medium mb-2 flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  {t('clientMessages.selectClients')}
                  {selectedIds.length > 0 && (
                    <span className="ml-auto text-xs bg-primary text-primary-foreground rounded-full px-2 py-0.5">{selectedIds.length}</span>
                  )}
                </label>
                <div className="relative mb-2">
                  <Search className={`absolute top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground ${isArabic ? 'right-3' : 'left-3'}`} />
                  <input
                    className={`w-full border rounded-xl py-2.5 text-sm bg-background outline-none focus:ring-2 focus:ring-primary ${isArabic ? 'pr-9 pl-3' : 'pl-9 pr-3'}`}
                    placeholder={t('clientMessages.searchClients')}
                    value={search} onChange={e => setSearch(e.target.value)}
                  />
                </div>
                <div className="border rounded-xl overflow-hidden max-h-52 overflow-y-auto">
                  {loadingClients ? (
                    <div className="flex items-center justify-center h-20 gap-2 text-muted-foreground text-sm">
                      <Loader2 className="w-4 h-4 animate-spin" />{t('clientMessages.loading')}
                    </div>
                  ) : clients.length === 0 ? (
                    <div className="text-center py-6 text-muted-foreground text-sm">{t('clientMessages.noClientsFound')}</div>
                  ) : clients.map(c => {
                    const selected = selectedIds.includes(c.id)
                    const contact = channel === 'email' ? c.email : c.phone
                    return (
                      <button key={c.id} onClick={() => toggleClient(c.id)}
                        className={`w-full flex items-center gap-3 px-4 py-3 text-sm border-b last:border-0 transition-colors text-left ${selected ? 'bg-primary/5' : 'hover:bg-muted/50'}`}>
                        <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-colors ${selected ? 'bg-primary border-primary' : 'border-border'}`}>
                          {selected && <Check className="w-3 h-3 text-primary-foreground" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium truncate">{c.name}</div>
                          <div className={`text-xs ${contact ? 'text-muted-foreground' : 'text-destructive'} truncate`}>
                            {contact || (channel === 'email' ? t('clientMessages.noEmail') : t('clientMessages.noPhone'))}
                          </div>
                        </div>
                      </button>
                    )
                  })}
                </div>
                <button onClick={() => setSelectedIds(clients.map(c => c.id))}
                  className="text-xs text-primary hover:underline mt-1">
                  {t('clientMessages.selectAll')}
                </button>
              </div>

              {/* Preview */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium">{t('clientMessages.messagePreview')}</label>
                  <Button variant="outline" size="sm" className="h-7 text-xs gap-1.5 px-2" onClick={() => {
                    const printWindow = window.open('', '_blank');
                    printWindow.document.write(`
                      <html dir="${lang === 'ar' ? 'rtl' : 'ltr'}">
                        <head>
                          <title>${t('clientMessages.messagePreview')}</title>
                          <style>
                            body { font-family: system-ui, -apple-system, sans-serif; padding: 40px; line-height: 1.6; color: #333; }
                            .header { text-align: center; margin-bottom: 40px; padding-bottom: 20px; border-bottom: 2px solid #eee; }
                            .content { white-space: pre-wrap; font-size: 14px; }
                          </style>
                        </head>
                        <body>
                          <div class="header">
                            <h2 style="margin: 0;">${isArabic ? config.labelAr || config.labelKey : config.labelEn || config.labelKey}</h2>
                          </div>
                          <div class="content">${previewBody() || ''}</div>
                          <script>window.onload = function() { window.print(); window.close(); }</script>
                        </body>
                      </html>
                    `);
                    printWindow.document.close();
                  }}>
                    <Printer className="w-3 h-3" />
                    {t('clientMessages.printExport')}
                  </Button>
                </div>
                <div className="border rounded-xl p-4 bg-muted/30 text-sm whitespace-pre-line text-foreground/80 max-h-40 overflow-y-auto leading-relaxed"
                  dir={lang === 'ar' ? 'rtl' : 'ltr'}>
                  {previewBody() || t('clientMessages.noPreview')}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        {!result && (
          <div className="flex justify-between items-center px-6 py-4 border-t bg-muted/30">
            <div className="text-sm text-muted-foreground">
              {selectedIds.length} {t('clientMessages.clientsSelected')}
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={onClose}>{t('clientMessages.cancel')}</Button>
              <Button onClick={handleSend} disabled={sending || !selectedIds.length}
                className={`gap-2 bg-gradient-to-r ${config.gradient} border-0 text-white hover:opacity-90`}>
                {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                {sending ? t('clientMessages.sending') : t('clientMessages.sendMessage')}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
