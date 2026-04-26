'use client';

import React, { useCallback, useMemo, useState } from 'react';
import { Sparkles, Loader2, ShieldQuestion } from 'lucide-react';
import { Button } from '@/components/ui/button';
import LegalChatPopup from './LegalChatPopup';
import { getAllCaseDetails, getCaseDocuments } from '@/app/services/api/cases';
import { getCaseMemos } from '@/app/services/api/memos';
import { getCasePetitionsByCaseId } from '@/app/services/api/CasePetitions';
import { getCaseSessions } from '@/app/services/api/sessions';
import { useLanguage } from '@/contexts/LanguageContext';

const pick = (obj, keys) =>
  keys.reduce((acc, key) => {
    if (obj && typeof obj[key] !== 'undefined') {
      acc[key] = obj[key];
    }
    return acc;
  }, {});

const summarizeItems = (items = [], fields) =>
  (items || []).slice(0, 10).map((item) => pick(item, fields));

const deriveDeadlinesFromSessions = (sessions = []) => {
  const now = new Date();
  const dayMs = 1000 * 60 * 60 * 24;

  return (sessions || [])
    .map((session) => {
      const dateString = session?.session_date || session?.date || session?.sessionDate;
      if (!dateString) return null;
      const sessionDate = new Date(dateString);
      if (Number.isNaN(sessionDate.getTime())) return null;

      const caseType = (session?.case_type_en || session?.case_type || '').toLowerCase();
      const baseDays = caseType.includes('criminal') ? 15 : 30;
      const deadlineDate = new Date(sessionDate);
      deadlineDate.setDate(deadlineDate.getDate() + baseDays);

      return {
        sessionId: session.id,
        subject: session.subject || session.topic || session.session_type || 'Session',
        sessionDate: sessionDate.toISOString(),
        deadlineDate: deadlineDate.toISOString(),
        daysRemaining: Math.ceil((deadlineDate - now) / dayMs),
      };
    })
    .filter(Boolean)
    .sort((a, b) => a.daysRemaining - b.daysRemaining)
    .slice(0, 10);
};

const buildCaseContextPayload = (caseId, { details, memos, petitions, sessions, documents }) => {
  const caseInfo =
    details?.data?.info ||
    details?.info ||
    details?.data ||
    details ||
    {};

  return {
    type: 'case',
    caseId,
    caseSummary: pick(caseInfo, [
      'case_number',
      'caseNumber',
      'file_number',
      'fileNumber',
      'branch',
      'court',
      'case_type_en',
      'case_type_ar',
      'status',
      'topic',
      'subject',
      'plaintiff',
      'defendant',
    ]),
    sessions: summarizeItems(sessions?.data || sessions, [
      'id',
      'session_date',
      'sessionDate',
      'session_type',
      'topic',
      'subject',
      'case_type_en',
      'case_type',
      'status',
      'decision',
    ]),
    memos: summarizeItems(memos?.data || memos, [
      'id',
      'title',
      'subject',
      'status',
      'createdAt',
      'updatedAt',
    ]),
    petitions: summarizeItems(petitions?.data || petitions, [
      'id',
      'title',
      'subject',
      'status',
      'createdAt',
      'updatedAt',
    ]),
    deadlines: deriveDeadlinesFromSessions(sessions?.data || sessions),
    documents: (documents || []).map((doc, idx) => ({
      id: doc.id || idx,
      document_name: doc.document_name || doc.name || `Document ${idx + 1}`,
      document_url: doc.document_url || doc.url,
    })),
    fetchedAt: new Date().toISOString(),
  };
};

function CaseAssistantLauncher({ caseId, align = 'right' }) {
  const { language } = useLanguage();
  const isRTL = language === 'ar';
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isLoadingContext, setIsLoadingContext] = useState(false);
  const [contextError, setContextError] = useState(null);
  const [caseContext, setCaseContext] = useState(null);

  const label = isRTL ? 'اسأل عن هذه القضية' : 'Ask about this case';
  const helper = isRTL
    ? 'يربط الإجابات بأحدث بيانات القضية'
    : 'Ground answers in the latest case data';

  const fetchContext = useCallback(async () => {
    if (!caseId) return;
    setIsLoadingContext(true);
    setContextError(null);
    try {
      const [detailsRes, memosRes, petitionsRes, sessionsRes, docsRes] = await Promise.allSettled([
        getAllCaseDetails(caseId),
        getCaseMemos(caseId),
        getCasePetitionsByCaseId(caseId),
        getCaseSessions(caseId),
        getCaseDocuments(caseId),
      ]);

      const details =
        detailsRes.status === 'fulfilled' ? detailsRes.value : null;
      const memos =
        memosRes.status === 'fulfilled' ? memosRes.value : [];
      const petitions =
        petitionsRes.status === 'fulfilled' ? petitionsRes.value : [];
      const sessions =
        sessionsRes.status === 'fulfilled' ? sessionsRes.value : [];
      const documents =
        docsRes.status === 'fulfilled' ? (docsRes.value?.data || docsRes.value || []) : [];

      setCaseContext(
        buildCaseContextPayload(caseId, { details, memos, petitions, sessions, documents })
      );
    } catch (error) {
      console.error('Failed to fetch case context', error);
      setContextError(
        isRTL
          ? 'تعذر تحميل سياق القضية للمساعد.'
          : 'Could not load case context for the assistant.'
      );
    } finally {
      setIsLoadingContext(false);
    }
  }, [caseId, isRTL]);

  const handleOpen = useCallback(() => {
    setIsChatOpen(true);
    if (!caseContext && !isLoadingContext) {
      fetchContext();
    }
  }, [caseContext, fetchContext, isLoadingContext]);

  const contextLabel = useMemo(() => {
    if (!caseContext?.caseSummary) return null;
    const numSessions = caseContext.sessions?.length || 0;
    const numMemos = caseContext.memos?.length || 0;
    const numPetitions = caseContext.petitions?.length || 0;
    return isRTL
      ? `قضية ${caseContext.caseSummary.case_number || caseContext.caseId || caseId} • ${numSessions} جلسة • ${numMemos} مذكرة • ${numPetitions} عريضة`
      : `Case ${caseContext.caseSummary.case_number || caseContext.caseId || caseId} • ${numSessions} sessions • ${numMemos} memos • ${numPetitions} petitions`;
  }, [caseContext, caseId, isRTL]);

  return (
    <>
      <div
        className={`flex items-center gap-2 ${align === 'left' ? 'justify-start' : 'justify-end'}`}
        dir={isRTL ? 'rtl' : 'ltr'}
      >
        <Button
          variant="outline"
          onClick={handleOpen}
          disabled={!caseId || isLoadingContext}
          className="group"
        >
          {isLoadingContext ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <img src="/images/rased-icon.jpg" alt="Rased" className="h-5 w-5 rounded-full object-cover shadow-sm" />
          )}
          <span className="mx-2">{label}</span>
        </Button>
        <p className="text-xs text-muted-foreground">{helper}</p>
      </div>

      {contextError && (
        <div className="text-xs text-destructive mt-1" dir={isRTL ? 'rtl' : 'ltr'}>
          {contextError}
        </div>
      )}

      <LegalChatPopup
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        context={caseContext}
        contextLabel={contextLabel}
        isContextLoading={isLoadingContext}
      />
    </>
  );
}

export default CaseAssistantLauncher;
