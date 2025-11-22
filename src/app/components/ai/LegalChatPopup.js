'use client';

import React, { useState, useRef, useEffect } from 'react';
import { X, Send, Loader2, Copy, Check, Sparkles, Paperclip, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { useLanguage } from '@/contexts/LanguageContext';
import { useSelector } from 'react-redux';
import { selectUser } from '@/redux/slices/authSlice';
import { chatWithLegalAssistant } from '@/app/services/api/legalAssistant';
import { uploadFiles } from '@/../utils/fileUpload';

const STORAGE_KEY_BASE = 'legalChatHistory';

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
  const storageKey = context?.caseId ? `${STORAGE_KEY_BASE}:${context.caseId}` : STORAGE_KEY_BASE;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Restore persisted chat when the popup opens and save on every change
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const cached = localStorage.getItem(storageKey);
    if (cached) {
      try {
        setMessages(JSON.parse(cached));
      } catch {
        localStorage.removeItem(storageKey);
        setMessages([]);
      }
    } else {
      setMessages([]);
    }
  }, [storageKey]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(storageKey, JSON.stringify(messages));
  }, [messages, storageKey]);

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

  const handleSendMessage = async () => {
    if ((!inputMessage.trim() && attachments.length === 0) || isLoading || isUploading) return;

    const userName = user?.employeeName || user?.name || user?.email || 'User';

    const userMessage = {
      id: Date.now(),
      role: 'user',
      content: inputMessage.trim(),
      userName: userName,
      timestamp: new Date().toISOString(),
      attachments,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputMessage('');
    setAttachments([]);
    setIsLoading(true);

    try {
      const payload = {
        message: userMessage.content,
        userName: userName,
        userId: user?.id || user?.job_id,
        history: [...messages, userMessage],
        context,
        attachments,
      };

      const data = await chatWithLegalAssistant(payload);

      const assistantMessage = {
        id: Date.now() + 1,
        role: 'assistant',
        content: data.answer,
        sources: data.sources,
        timestamp: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage = {
        id: Date.now() + 1,
        role: 'assistant',
        content: isRTL
          ? 'لا يمكن الوصول للمساعد الآن. حاول مرة أخرى لاحقاً'
          : 'Unable to reach the assistant right now. Please try again.',
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
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
    if (typeof window !== 'undefined') {
      localStorage.removeItem(storageKey);
    }
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
        <div className={`bg-background border-b p-4 ${isRTL ? 'pl-12' : 'pr-12'}`}>
          <div className="flex items-center gap-2">
            <Sparkles size={20} className="text-purple-600 dark:text-purple-400 animate-pulse" />
            <h2 className="text-lg font-semibold text-foreground">{isRTL ? 'المساعد القانوني' : 'Legal Assistant'}</h2>
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
            <div className="text-center text-muted-foreground mt-8">
              <Sparkles className="mx-auto mb-2 text-purple-500" size={32} />
              <p className="text-sm">
                {isRTL ? 'مرحباً! كيف يمكنني مساعدتك في الأمور القانونية؟' : 'Hello! How can I help you with legal matters?'}
              </p>
            </div>
          )}
          
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-lg p-3 ${
                  message.role === 'user'
                    ? 'bg-gradient-to-br from-purple-600 to-blue-600 text-white'
                    : 'bg-muted text-foreground border'
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
              disabled={( !inputMessage.trim() && attachments.length === 0) || isLoading || isUploading}
              className="bg-gradient-to-br from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
              size="icon"
              aria-label="Send message"
            >
              {(isLoading || isUploading) ? <Loader2 className="animate-spin" size={20} /> : <Send size={20} />}
            </Button>
          </div>
        </div>
      </Card>
    </>
  );
};

export default LegalChatPopup;
