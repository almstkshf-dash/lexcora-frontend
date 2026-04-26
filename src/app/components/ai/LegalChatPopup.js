'use client';

import React, { useState, useRef, useEffect } from 'react';
import { X, Send, Loader2, Copy, Check, Sparkles, Paperclip, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { useLanguage } from '@/contexts/LanguageContext';
import { useSelector } from 'react-redux';
import { selectUser } from '@/redux/slices/authSlice';
import { chatWithLegalAssistant, chatWithLegalAssistantStream, getLegalAssistantHistory } from '@/app/services/api/legalAssistant';
import { getAllCaseDetails, getCaseDocuments, searchCases } from '@/app/services/api/cases';
import { uploadFiles } from '@/../utils/fileUpload';

// Escape any HTML before rendering to avoid XSS from untrusted responses
const sanitizeText = (text = '') =>
  text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

const normalizeSources = (sources) => {
  if (!sources) return [];
  if (Array.isArray(sources)) {
    return sources.map((src, idx) => {
      if (typeof src === 'string') {
        return { id: `src-${idx}`, label: src, url: src };
      }
      const {
        id,
        title,
        name,
        document_name,
        document_url,
        url,
        link,
        chunk,
        page,
        snippet,
      } = src || {};
      return {
        id: id || `src-${idx}`,
        label: title || name || document_name || `Source ${idx + 1}`,
        url: url || link || document_url,
        chunk,
        page,
        snippet,
      };
    });
  }
  if (typeof sources === 'string') {
    return sources
      .split(/[,;]+/)
      .map((item, idx) => ({ id: `src-${idx}`, label: item.trim(), url: item.trim() }))
      .filter((s) => s.label);
  }
  return [];
};

const LegalChatPopup = ({ isOpen, onClose, context = null, contextLabel, isContextLoading = false }) => {
  const { isRTL } = useLanguage();
  const user = useSelector(selectUser);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const [attachments, setAttachments] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const [isHistoryLoading, setIsHistoryLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [onDemandContext, setOnDemandContext] = useState(null);
  const quickPrompts = isRTL
    ? [
        'لخص آخر جلسة',
        'ما المستندات الناقصة في هذا الملف؟',
        'ما هي المواعيد النهائية القادمة؟',
        'أنشئ قائمة مهام للأسبوع القادم',
      ]
    : [
        'Summarize the last session',
        'List missing documents for this case',
        'What deadlines are coming up?',
        'Create next-week tasks list',
      ];

  const renderTables = (tables = []) => {
    if (!tables?.length) return null;
    return (
      <div className="mt-3 space-y-3">
        {tables.map((table, idx) => (
          <div key={table.title || idx} className="border border-border rounded-lg overflow-hidden">
            {table.title && (
              <div className="px-3 py-2 bg-muted text-sm font-semibold">{table.title}</div>
            )}
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                {table.columns && (
                  <thead className="bg-muted/60">
                    <tr>
                      {table.columns.map((col) => (
                        <th key={col} className="px-3 py-2 text-left font-medium">{col}</th>
                      ))}
                    </tr>
                  </thead>
                )}
                <tbody>
                  {(table.rows || []).map((row, rIdx) => (
                    <tr key={rIdx} className="border-t border-border/70">
                      {(table.columns || Object.keys(row || {})).map((col) => (
                        <td key={col} className="px-3 py-2 whitespace-nowrap">
                          {row?.[col] ?? ''}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleCopyMessage = async (messageId, content) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopiedId(messageId);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const fetchHistory = async () => {
      if (!isOpen || !(context?.caseId || onDemandContext?.caseId)) return;
      setIsHistoryLoading(true);
      try {
        const data = await getLegalAssistantHistory(context?.caseId || onDemandContext?.caseId);
        const rows = data?.data || data?.history || data || [];
        const hydrated = [];
        rows.forEach((row, idx) => {
          const baseId = `${row?.id || row?.created_at || idx}`;
          if (row?.message) {
            hydrated.push({
              id: `${baseId}-user`,
              role: 'user',
              content: row.message,
              userName: row.user_name || row.user || 'User',
              timestamp: row.created_at,
              attachments: row.attachments || [],
            });
          }
          if (row?.answer) {
            hydrated.push({
              id: `${baseId}-assistant`,
              role: 'assistant',
              content: row.answer,
              sources: row.sources,
              tables: row.tables || row.table,
              timestamp: row.created_at,
            });
          }
        });
        if (hydrated.length) {
          setMessages(hydrated);
        }
      } catch (err) {
        console.error('Failed to load chat history', err);
      } finally {
        setIsHistoryLoading(false);
      }
    };
    fetchHistory();
  }, [isOpen, context?.caseId, onDemandContext?.caseId]);

  const handleRemoveAttachment = (url) => {
    setAttachments((prev) => prev.filter((file) => file.document_url !== url));
  };

  const handleFileChange = async (event) => {
    const files = Array.from(event.target.files || []);
    if (!files.length) return;
    setUploadError(null);
    setIsUploading(true);
    try {
      const uploaded = await uploadFiles(files, 'legal-assistant');
      setAttachments((prev) => [...prev, ...uploaded]);
    } catch (err) {
      console.error('Upload failed', err);
      setUploadError(err?.message || 'Failed to upload files');
    } finally {
      setIsUploading(false);
      event.target.value = '';
    }
  };

  const resolveCaseId = async (identifier) => {
    const term = String(identifier || '').trim();
    if (!term) return null;
    try {
      const response = await searchCases(term);
      const candidates = response?.data || [];
      const match =
        candidates.find(
          (item) =>
            String(item?.case_number) === term ||
            String(item?.file_number) === term ||
            String(item?.id) === term
        ) || candidates[0];
      return match?.id || match?.case_id || null;
    } catch (err) {
      console.warn('Case lookup failed', err?.message);
      return null;
    }
  };

  const buildContextFromCase = async (caseIdOrNumber) => {
    const normalizeInfo = (details) =>
      details?.data?.info ||
      details?.info ||
      details?.data ||
      details ||
      null;

    const tryBuild = async (id) => {
      if (!id) return null;
      const details = await getAllCaseDetails(id);
      const info = normalizeInfo(details);
      if (!info || Object.keys(info).length === 0) return null;

      let documents = [];
      try {
        const docs = await getCaseDocuments(id);
        documents = (docs?.data || docs || []).map((doc, idx) => ({
          id: doc.id || idx,
          document_name: doc.document_name || doc.name || `Document ${idx + 1}`,
          document_url: doc.document_url || doc.url,
        }));
      } catch (docErr) {
        console.warn('Case documents unavailable', docErr?.message);
      }

      return {
        type: 'case',
        caseId: info.id || id,
        caseSummary: info,
        documents,
        fetchedAt: new Date().toISOString(),
      };
    };

    try {
      const direct = await tryBuild(caseIdOrNumber);
      if (direct) return direct;

      const fallbackId = await resolveCaseId(caseIdOrNumber);
      if (fallbackId) {
        const fallback = await tryBuild(fallbackId);
        if (fallback) return fallback;
      }
    } catch (err) {
      console.error('Failed to build context from case', err);
    }
    return null;
  };

  const extractCaseNumber = (text) => {
    if (!text) return null;
    const match = text.match(/(\d{4,})/);
    return match ? match[1] : null;
  };

  const handleSendMessage = async (preset) => {
    if ((!inputMessage.trim() && !preset && attachments.length === 0) || isLoading || isUploading || isStreaming) return;

    const userName = user?.employeeName || user?.name || user?.email || 'User';
    const trimmed = (preset ?? inputMessage).trim();
    const effectiveContent =
      trimmed || (attachments.length ? 'Please review the attached documents and provide a summary.' : 'Hello');

    let effectiveContext = context || onDemandContext || null;
    if (!effectiveContext?.caseId) {
      const guessedCase = extractCaseNumber(effectiveContent);
      if (guessedCase) {
        effectiveContext = await buildContextFromCase(guessedCase);
        if (effectiveContext) {
          setOnDemandContext(effectiveContext);
        } else {
          setIsLoading(false);
          const notFoundMessage = {
            id: Date.now() + 1,
            role: 'assistant',
            content: isRTL
              ? `?? ????? ?????? ????? ???? ??? (${guessedCase}). ???? ???? ????? ?????? ???? ????? ??? ?????.`
              : `No data found for case ${guessedCase}. Please provide another case number or open a case page.`,
            timestamp: new Date().toISOString(),
          };
          setMessages((prev) => [...prev, notFoundMessage]);
          return;
        }
      }
    }

    const contextDocuments = effectiveContext?.documents || [];
    const combinedAttachments = [];
    const seen = new Set();
    [...attachments, ...contextDocuments.filter((doc) => doc?.document_url)].forEach((doc) => {
      const key = doc.document_url || doc.url;
      if (!key || seen.has(key)) return;
      seen.add(key);
      combinedAttachments.push(doc);
    });

    const userMessage = {
      id: Date.now(),
      role: 'user',
      content: effectiveContent,
      userName: userName,
      timestamp: new Date().toISOString(),
      attachments: combinedAttachments,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputMessage('');
    setAttachments([]);
    setIsLoading(true);

    const payload = {
      message: effectiveContent,
      userName: userName,
      userId: user?.id || user?.job_id,
      history: undefined,
      context: effectiveContext,
      attachments: combinedAttachments,
    };

    try {
      // Attempt streaming first
      try {
        setIsStreaming(true);
        const reader = await chatWithLegalAssistantStream(payload);
        const decoder = new TextDecoder();
        const assistantId = Date.now() + 1;
        setMessages((prev) => [
          ...prev,
          {
            id: assistantId,
            role: 'assistant',
            content: '',
            sources: null,
            tables: [],
            timestamp: new Date().toISOString(),
          },
        ]);

        let buffer = '';
        const updateAssistant = (partial) => {
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === assistantId
                ? { ...msg, ...partial }
                : msg
            )
          );
        };

        while (true) {
          const { value, done } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });

          let sepIndex;
          while ((sepIndex = buffer.indexOf('\n\n')) >= 0) {
            const rawEvent = buffer.slice(0, sepIndex).trim();
            buffer = buffer.slice(sepIndex + 2);
            if (!rawEvent.startsWith('data:')) continue;
            const jsonStr = rawEvent.replace(/^data:\s*/, '');
            if (jsonStr === '[DONE]') continue;
            try {
              const parsed = JSON.parse(jsonStr);
              const nextContent = parsed.answer || parsed.content || '';
              updateAssistant({
                content: nextContent,
                sources: parsed.sources || null,
                tables: Array.isArray(parsed?.tables)
                  ? parsed.tables
                  : parsed?.table
                    ? (Array.isArray(parsed.table) ? parsed.table : [parsed.table])
                    : [],
              });
            } catch (e) {
              // Ignore parse errors for malformed chunks
            }
          }
        }
        setIsStreaming(false);
        setIsLoading(false);
        return;
      } catch (streamErr) {
        // Fallback to non-streaming
        setIsStreaming(false);
      }

      const data = await chatWithLegalAssistant(payload);

      const assistantMessage = {
        id: Date.now() + 1,
        role: 'assistant',
        content: data.answer,
        sources: data.sources,
        tables: Array.isArray(data?.tables)
          ? data.tables
          : data?.table
            ? (Array.isArray(data.table) ? data.table : [data.table])
            : [],
        timestamp: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error(
        'Error sending message:',
        JSON.stringify(
          {
            status: error?.response?.status,
            responseData: error?.response?.data,
            payloadSummary: {
              message: payload.message,
              userId: payload.userId,
              hasContext: !!payload.context,
              attachmentsCount: payload.attachments?.length || 0,
            },
          },
          null,
          2
        )
      );
      const backendMessage =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        error?.message;
      const errorMessage = {
        id: Date.now() + 1,
        role: 'assistant',
        content: isRTL
          ? (backendMessage || 'لا يمكن الوصول للمساعد الآن. حاول مرة أخرى لاحقاً')
          : (backendMessage || 'Unable to reach the assistant right now. Please try again.'),
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      setIsStreaming(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleClearChat = () => {
    setMessages([]);
  };

  const handleCopyConversation = async () => {
    try {
      const transcript = messages
        .map((msg) => {
          const name = msg.role === 'user' ? user?.employeeName || user?.name || user?.email || 'User' : 'Assistant';
          const attachmentsLine = msg.attachments?.length
            ? `\nAttachments: ${msg.attachments.map((f) => f.document_name || f.document_url).join(', ')}`
            : '';
          return `${name}: ${msg.content || ''}${attachmentsLine}`;
        })
        .join('\n\n');
      await navigator.clipboard.writeText(transcript);
    } catch (error) {
      console.error('Failed to copy conversation:', error);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 animate-in fade-in"
        onClick={onClose}
      />
      
      {/* Modal Card - Centered */}
      <Card className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-2xl h-[80vh] max-h-[600px] flex flex-col shadow-2xl border-2 overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Close Button - Positioned at top corner (RTL aware) */}
        <Button
          onClick={onClose}
          variant="ghost"
          size="icon"
          className={`absolute top-2 ${isRTL ? 'left-2' : 'right-2'} z-10 h-8 w-8 rounded-full bg-background/80 hover:bg-accent border shadow-sm`}
          aria-label="Close chat"
        >
          <X size={18} />
        </Button>

        {/* Header */}
        <div className={`bg-gradient-to-r from-background to-muted/30 border-b p-4 ${isRTL ? 'pl-12' : 'pr-12'}`}>
          <div className="flex items-center gap-3">
            <div className="relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full border border-primary/20 shadow-sm bg-background">
              <img src="/images/rased-icon.jpg" alt="Rased" className="h-full w-full object-cover" />
            </div>
            <div className="flex flex-col">
              <h2 className="text-lg font-bold text-foreground tracking-tight">{isRTL ? 'راصد' : 'Rased'}</h2>
              <span className="text-[11px] font-medium text-muted-foreground">{isRTL ? 'مساعدك الذكي' : 'Your Smart Assistant'}</span>
            </div>
          </div>
        </div>

        {(context || isContextLoading) && (
          <div
            className="border-b bg-muted/60 px-4 py-2 text-xs text-muted-foreground flex items-center gap-2"
            dir={isRTL ? 'rtl' : 'ltr'}
          >
            <Sparkles size={14} className="text-purple-600" />
            <div className="flex flex-col">
              <span className="text-foreground font-medium">
                {contextLabel ||
                  (isRTL ? 'يتم الاستناد إلى بيانات القضية الحالية' : 'Grounding answers in this case')}
              </span>
              {context?.caseId && (
                <span className="text-muted-foreground">
                  {isRTL ? 'رقم القضية' : 'Case ID'}: {context.caseId}
                </span>
              )}
            </div>
            {isContextLoading && <Loader2 size={14} className="animate-spin ml-auto" />}
          </div>
        )}

        {/* Messages Container - with proper overflow scroll */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 bg-background" dir={isRTL ? 'rtl' : 'ltr'}>
          <div className="space-y-4">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center text-center mt-12 mb-8 animate-in slide-in-from-bottom-4 duration-500">
              <div className="h-20 w-20 rounded-full border-4 border-background shadow-md bg-white mb-4 relative overflow-hidden">
                <img src="/images/rased-icon.jpg" alt="Rased" className="h-full w-full object-cover" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-2">{isRTL ? 'مرحباً، أنا راصد' : 'Welcome I Am Rased'}</h3>
              <p className="text-sm text-muted-foreground max-w-[250px]">
                {isRTL ? 'مساعدك القانوني' : 'your legal assistant'}
              </p>
              {isHistoryLoading && (
                <p className="text-xs mt-2">
                  {isRTL ? 'جاري تحميل المحادثات السابقة...' : 'Loading previous assistant history...'}
                </p>
              )}
            </div>
          )}
          
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex w-full ${message.role === 'user' ? 'justify-end' : 'justify-start gap-2'}`}
            >
              {message.role === 'assistant' && (
                <div className="flex-shrink-0 h-8 w-8 rounded-full overflow-hidden border border-border shadow-sm mt-1 bg-background hidden sm:block">
                  <img src="/images/rased-icon.jpg" alt="Rased" className="h-full w-full object-cover" />
                </div>
              )}
              <div
                className={`max-w-[85%] sm:max-w-[80%] p-3.5 shadow-sm text-sm ${
                  message.role === 'user'
                    ? `bg-gradient-to-br from-primary to-primary/90 text-primary-foreground rounded-2xl ${isRTL ? 'rounded-tl-sm' : 'rounded-tr-sm'}`
                    : `bg-card text-card-foreground border border-border/40 rounded-2xl ${isRTL ? 'rounded-tr-sm' : 'rounded-tl-sm'}`
                }`}
              >
                {/* User name for user messages */}
                {message.role === 'user' && message.userName && (
                  <div className="text-xs opacity-90 mb-1 font-medium">
                    {message.userName}
                  </div>
                )}
                
                <div className="prose prose-sm max-w-none dark:prose-invert">
                  <p className="whitespace-pre-wrap m-0">
                    {sanitizeText(message.content)}
                  </p>
                </div>
                {message.attachments?.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2 text-xs">
                    {message.attachments.map((file) => (
                      <a
                        key={file.document_url}
                        href={file.document_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 rounded-full border border-border bg-background/60 px-2 py-1 hover:bg-background"
                      >
                        <Paperclip size={12} />
                        <span className="truncate max-w-[140px]">{file.document_name || 'Attachment'}</span>
                      </a>
                    ))}
                  </div>
                )}
                {normalizeSources(message.sources).length > 0 && (
                  <div className="mt-2 pt-2 border-t border-border text-xs text-muted-foreground flex flex-wrap gap-2">
                    <strong className="pr-1">{isRTL ? 'المصادر:' : 'Sources:'}</strong>
                    {normalizeSources(message.sources).map((source) => (
                      <a
                        key={source.id}
                        href={source.url || '#'}
                        target={source.url ? "_blank" : undefined}
                        rel={source.url ? "noopener noreferrer" : undefined}
                        className="inline-flex items-center gap-1 rounded-full border border-border bg-background/60 px-2 py-1 hover:bg-background"
                        title={source.snippet || source.label}
                      >
                        <Sparkles size={12} className="text-purple-600" />
                        <span className="truncate max-w-[140px]">
                          {source.label}
                          {source.page ? ` · p.${source.page}` : ''}
                        </span>
                      </a>
                    ))}
                  </div>
                )}
                {renderTables(message.tables)}
                {message.role === 'assistant' && (
                  <div className="mt-2 flex justify-end">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleCopyMessage(message.id, message.content)}
                      className="h-6 w-6"
                      aria-label="Copy message"
                      title={isRTL ? 'نسخ الرسالة' : 'Copy message'}
                    >
                      {copiedId === message.id ? (
                        <Check size={14} className="text-green-600" />
                      ) : (
                        <Copy size={14} />
                      )}
                    </Button>
                  </div>
                )}
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-muted border rounded-lg p-3">
                <Loader2 className="animate-spin text-purple-600" size={20} />
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input Area */}
        <div className="p-4 border-t bg-background flex-shrink-0 space-y-2">
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept=".pdf,.doc,.docx,.txt"
            className="hidden"
            onChange={handleFileChange}
          />
          <div className={`flex flex-wrap items-center gap-2 ${isRTL ? 'justify-end' : 'justify-start'}`} dir={isRTL ? 'rtl' : 'ltr'}>
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopyConversation}
              disabled={messages.length === 0}
            >
              {isRTL ? 'نسخ المحادثة' : 'Copy chat'}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearChat}
              disabled={messages.length === 0}
            >
              {isRTL ? 'مسح المحادثة' : 'Clear chat'}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="flex items-center gap-2"
            >
              {isUploading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Paperclip className="h-4 w-4" />
              )}
              <span>{isRTL ? 'إرفاق ملفات' : 'Attach docs'}</span>
            </Button>
            {uploadError && (
              <span className="text-destructive text-xs">{uploadError}</span>
            )}
          </div>

          {attachments.length > 0 && (
            <div className="flex flex-wrap gap-2" dir={isRTL ? 'rtl' : 'ltr'}>
              {attachments.map((file) => (
                <div
                  key={file.document_url}
                  className="inline-flex items-center gap-1 rounded-full border border-border bg-muted px-2 py-1 text-xs"
                >
                  <Paperclip size={12} />
                  <a
                    href={file.document_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="truncate max-w-[140px] hover:underline"
                  >
                    {file.document_name || 'Attachment'}
                  </a>
                  <button
                    type="button"
                    onClick={() => handleRemoveAttachment(file.document_url)}
                    className="text-muted-foreground hover:text-foreground"
                    aria-label={isRTL ? 'حذف' : 'Remove'}
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="flex gap-2" dir={isRTL ? 'rtl' : 'ltr'}>
            <Input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={isRTL ? 'اكتب سؤالك هنا...' : 'Type your question here...'}
              className="flex-1"
              disabled={isLoading || isUploading}
              dir="auto"
            />
            <Button
              onClick={handleSendMessage}
              disabled={( !inputMessage.trim() && attachments.length === 0) || isLoading || isUploading || isStreaming}
              className="bg-gradient-to-br from-primary to-primary/90 hover:from-primary/90 hover:to-primary text-primary-foreground shadow-sm transition-all hover:shadow-md"
              size="icon"
              aria-label="Send message"
            >
              {(isLoading || isUploading || isStreaming) ? <Loader2 className="animate-spin" size={20} /> : <Send size={18} className={isRTL ? 'rotate-180' : ''} />}
            </Button>
          </div>
        </div>
      </Card>
    </>
  );
};

export default LegalChatPopup;
