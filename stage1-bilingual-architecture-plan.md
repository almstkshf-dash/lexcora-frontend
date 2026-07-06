# Stage 1: Bilingual Architecture & Messaging Synchronization

## Top-Level Overview

**Goal:** Eliminate all conflicting, hardcoded, and mismatched messages across the three repositories, and establish a single, zero-conflict bilingual (AR/EN) messaging contract between the backend and both frontends.

**Scope:** Three repositories — `lexcora-backend`, `lexcora-frontend`, `lexcora-client-portal`.

**Approach:** Work domain by domain, starting at the backend (the source of truth for message keys), then aligning the frontends to consume those keys correctly. No new features. No structural refactors beyond what is directly required to fix the messaging layer.

**Root Problems Being Fixed:**
1. **Backend `messages.js` has missing keys** — controllers call `req.t('finance.invoiceCreated')`, `accounting.accountCreated`, etc. that do not exist in the catalog, causing `getMessage()` to fall back to returning the raw key string as the response message.
2. **Three backend controllers bypass `req.t()` entirely** — `eventsController.js`, `logsController.js`, `goamlController.js`, and `employeeRequestsController.js` send hardcoded Arabic strings directly in `res.status().json()` responses, breaking the bilingual contract.
3. **`errorHandler.js` does not localize unhandled errors** — when an unexpected (non-`AppError`) exception is caught, the handler returns the raw `err.message` string (which may be a Node.js internal English string or an untranslated developer message) without going through `req.t()`.
4. **`i18nMiddleware.js` defaults to `'en'`** — but the user base is Arabic-first. The default should reflect the application's primary language.
5. **`lexcora-frontend` has hardcoded Arabic strings in components** — `PrintInvoiceModal.js`, `AddPartyModal.js`/`EditPartyModal.js`, `DynamicLayout.js`, `export-buttons.js`, `DataTable.js`, `RichTextEditor.js`, and others bypass `useTranslations()` with inline Arabic text.
6. **`lexcora-frontend` `ToastContainer` has hardcoded `rtl={true}`** — ignores the user's active language direction.
7. **`lexcora-client-portal` `LanguageContext.js` has a commented-out `router.refresh()`** — language changes do not re-render content without a full reload; the reload is also commented out, leaving the state stale after a switch.
8. **`lexcora-client-portal` `axiosInstance.js` does not forward the user's locale to the backend** — the backend `i18nMiddleware` supports `x-lang` header injection but the portal never sends it, so all portal-originated API responses are always in the default backend language regardless of the user's active locale.
9. **`lexcora-frontend` `axiosInstance.js` similarly does not forward locale** — same gap as the portal.

---

## Sub-Tasks

---

### Sub-Task 1: Fill Missing Message Keys in Backend `messages.js`

**Intent:** Every `req.t()` call in every controller must resolve to a real bilingual string. Currently, keys like `finance.invoiceCreated`, `finance.invoiceUpdated`, `finance.invoiceDeleted`, `finance.invoiceNotFound`, `finance.attachmentDeleted`, `finance.attachmentNotFound`, `finance.invoiceStatusUpdated`, `accounting.accountCreated`, `accounting.fiscalPeriodCreated`, `accounting.fiscalPeriodUpdated`, `accounting.journalEntryCreated`, `accounting.budgetSet` are called but absent from the catalog, causing `getMessage()` to return the raw key string as the API `message` field.

**Expected Outcomes:**
- Every `req.t()` call across all controllers resolves to a human-readable English or Arabic string.
- No controller call returns a dot-notation key string as a user-facing message.
- `messages.js` is the verified single catalog — no key used in a controller is absent from it.

**Todo List:**
1. Open `src/utils/messages.js` in `lexcora-backend`.
2. Add the following missing keys to the `finance` domain object:
   - `invoiceCreated`: `{ en: 'Invoice created successfully', ar: 'تم إنشاء الفاتورة بنجاح' }`
   - `invoiceUpdated`: `{ en: 'Invoice updated successfully', ar: 'تم تحديث الفاتورة بنجاح' }`
   - `invoiceDeleted`: `{ en: 'Invoice deleted successfully', ar: 'تم حذف الفاتورة بنجاح' }`
   - `invoiceNotFound`: `{ en: 'Invoice not found', ar: 'الفاتورة غير موجودة' }`
   - `invoiceStatusUpdated`: `{ en: 'Invoice status updated successfully', ar: 'تم تحديث حالة الفاتورة بنجاح' }`
   - `attachmentDeleted`: `{ en: 'Attachment deleted successfully', ar: 'تم حذف المرفق بنجاح' }`
   - `attachmentsUploaded`: `{ en: 'Attachments uploaded successfully', ar: 'تم رفع المرفقات بنجاح' }`
3. Add the following missing keys to the `accounting` domain object:
   - `accountCreated`: `{ en: 'Account created successfully', ar: 'تم إنشاء الحساب بنجاح' }`
   - `fiscalPeriodCreated`: `{ en: 'Fiscal period created successfully', ar: 'تم إنشاء الفترة المالية بنجاح' }`
   - `fiscalPeriodUpdated`: `{ en: 'Fiscal period updated successfully', ar: 'تم تحديث الفترة المالية بنجاح' }`
   - `journalEntryCreated`: `{ en: 'Journal entry created successfully', ar: 'تم إنشاء قيد اليومية بنجاح' }`
   - `budgetSet`: `{ en: 'Budget set successfully', ar: 'تم تعيين الميزانية بنجاح' }`
4. Verify no other `req.t()` key references in controllers are missing by scanning all controller files for the pattern `req.t('` and cross-checking against the catalog.

**Relevant Context:**
- `c:\projects\lexcora-backend\src\utils\messages.js` — the catalog file to edit
- `c:\projects\lexcora-backend\src\controllers\invoicesController.js` lines 92, 133, 150, 165, 188 — the missing finance keys are consumed here
- `c:\projects\lexcora-backend\src\controllers\accountingController.js` lines 33, 55, 65, 99, 244 — the missing accounting keys are consumed here
- `getMessage()` function at line 220 of `messages.js` — falls back to returning the raw key string if not found

**Status:** [ ] pending

---

### Sub-Task 2: Replace Hardcoded Strings in Backend Controllers

**Intent:** Three controllers bypass `req.t()` and send hardcoded Arabic strings as API responses. This breaks bilingual support because English-locale users receive Arabic error messages. All user-facing message strings in controllers must go through `req.t()`.

**Expected Outcomes:**
- `eventsController.js` sends all messages via `req.t()` with keys from `messages.js`.
- `logsController.js` sends all messages via `req.t()`.
- `goamlController.js` sends all messages via `req.t()`.
- `employeeRequestsController.js` sends its four hardcoded 403 permission messages via `req.t()`.
- All four controllers use `res.fail()` / `res.success()` / `res.created()` from `responseMiddleware` (not raw `res.status().json()`).

**Todo List:**
1. Add an `events` domain to `messages.js` with keys for every hardcoded string in `eventsController.js` (fetch error, not found, create success, create error, update success, update error, delete success, delete error, validation for required title/date).
2. Add a `logs` domain to `messages.js` for `logsController.js` (fetch error, not found, employee id required, action type required, created, create error, delete old success, date range required, stats error).
3. Add a `goaml` domain to `messages.js` for `goamlController.js` (fetch error, not found, id required, name required, invalid status, invalid type, created, updated, deleted, create error, update error, delete error).
4. Add keys to the `employee` or a new `hr` domain for the four permission-denied messages in `employeeRequestsController.js`.
5. In each of the four controller files, replace every `res.status(X).json({ message: '...' })` (or `{ success: false, message: '...' }`) hardcoded string call with `req.t('domain.key')` and the appropriate `res.fail()` / `res.success()` method.
6. For `callLogsController.js` notification title/body strings (lines 98–99, 159–160, 206–207): these are internal push notification payloads — add them to messages.js under a `callLog` domain and route through `req.t()`.

**Relevant Context:**
- `c:\projects\lexcora-backend\src\controllers\eventsController.js` — 16 hardcoded Arabic strings
- `c:\projects\lexcora-backend\src\controllers\logsController.js` — 14 hardcoded Arabic strings
- `c:\projects\lexcora-backend\src\controllers\goamlController.js` — 13 hardcoded Arabic strings
- `c:\projects\lexcora-backend\src\controllers\employeeRequestsController.js` lines 97, 104, 167, 249, 330 — hardcoded Arabic 403 messages
- `c:\projects\lexcora-backend\src\controllers\callLogsController.js` lines 95–99, 155–160, 202–207 — hardcoded Arabic notification strings
- `c:\projects\lexcora-backend\src\middlewares\responseMiddleware.js` — `res.fail(message, status, errorCode)` signature to use
- `c:\projects\lexcora-backend\src\utils\messages.js` — the catalog to extend

**Status:** [ ] pending

---

### Sub-Task 3: Harden Backend `errorHandler.js` and `i18nMiddleware.js`

**Intent:**
1. `errorHandler.js` currently returns `err.message` verbatim for unhandled errors — this surfaces raw Node.js/library error strings (always English). The handler should detect when it has a localized fallback available via `req.t()`.
2. `i18nMiddleware.js` defaults to `'en'` but the system's primary audience is Arabic. The default must be changed to `'ar'` to match the application's default language setting in both frontends (`lexcora-frontend` defaults to Arabic; `lexcora-client-portal` should also default to Arabic after Sub-Task 6).

**Expected Outcomes:**
- Unhandled 500 errors return the localized `generic.internalError` message instead of a raw Node.js error string.
- The backend's default locale is `'ar'`, matching the frontend's default.
- API responses are in the correct language for the requesting client when no explicit locale header is sent.

**Todo List:**
1. In `errorHandler.js`: for non-`AppError` errors (the `else` branch), replace the bare `err.message` with a call to `req.t('generic.internalError')`. Keep logging `err.message` in the server-side console log (internal visibility only). The response `message` field should always be a translated string, not a raw exception message.
2. In `i18nMiddleware.js`: change the fallback default locale from `'en'` to `'ar'` (line 16: `let locale = 'ar'`).

**Relevant Context:**
- `c:\projects\lexcora-backend\src\middlewares\errorHandler.js` line 14 — `const message = err.message || 'Internal server error'`
- `c:\projects\lexcora-backend\src\middlewares\i18nMiddleware.js` line 16 — `let locale = 'en'`
- `c:\projects\lexcora-backend\src\utils\messages.js` line 11 — `generic.internalError` key exists in both languages

**Status:** [ ] pending

---

### Sub-Task 4: Forward Active Locale from Frontends to Backend

**Intent:** Both frontends store the user's active language in `localStorage` (`'language'` key in `lexcora-frontend`, `'locale'` key in `lexcora-client-portal`). Neither axios instance forwards this locale to the backend via the `x-lang` header. As a result, `i18nMiddleware` cannot serve the correct language for API responses regardless of what the user has selected. This sub-task wires the user's language choice into every outgoing API request.

**Expected Outcomes:**
- Every API request from `lexcora-frontend` includes an `x-lang: ar|en` header matching the user's current language setting.
- Every API request from `lexcora-client-portal` includes an `x-lang: ar|en` header matching the user's current locale.
- Backend API error and success messages are returned in the user's active language.

**Todo List:**
1. In `lexcora-frontend/src/app/services/api/axiosInstance.js`: in the existing request interceptor (where the Bearer token is attached), add a line to read `localStorage.getItem('language') || 'ar'` and set it as `config.headers['x-lang']`.
2. In `lexcora-client-portal/src/app/services/api/axiosInstance.js`: in the existing request interceptor (line 13), add a line to read `localStorage.getItem('locale') || 'ar'` and set it as `config.headers['x-lang']`.

**Relevant Context:**
- `c:\projects\lexcora-frontend\src\app\services\api\axiosInstance.js` — the existing request interceptor at the top of the file
- `c:\projects\lexcora-client-portal\src\app\services\api\axiosInstance.js` lines 12–24 — the existing request interceptor
- `c:\projects\lexcora-backend\src\middlewares\i18nMiddleware.js` lines 12–13 — `x-lang` header is already read and respected

**Status:** [ ] pending

---

### Sub-Task 5: Fix Hardcoded Strings in `lexcora-frontend` Components

**Intent:** A significant number of UI components in `lexcora-frontend` contain hardcoded Arabic strings instead of using `useTranslations()`. This means English-locale users see Arabic text, and changing the message catalog has no effect on these components. The specific components identified are: `PrintInvoiceModal.js`, `AddPartyModal.js`/`EditPartyModal.js`, `DynamicLayout.js`, `ResponsiveLayout.js`, `export-buttons.js` (ui), `DataTable.js`, and `RichTextEditor.js`.

**Expected Outcomes:**
- All hardcoded Arabic strings in the listed components are replaced with `t()` calls.
- Corresponding keys are added to `src/messages/ar.json` and `src/messages/en.json` for any keys that do not yet exist.
- `PrintInvoiceModal.js` print window uses `language` and `isRTL` from context instead of hardcoded `lang="ar"` and `dir="rtl"`.
- The `ToastContainer` in `src/app/layout.js` uses `rtl={isRTL}` instead of `rtl={true}`.

**Todo List:**
1. **`PrintInvoiceModal.js`:** Replace the hardcoded `<title>فاتورة - ...</title>` with a dynamic title using `t('invoices.printTitle', { number: invoice?.invoice_number })`. Replace the hardcoded `html dir="rtl" lang="ar"` with `dir={isRTL ? 'rtl' : 'ltr'} lang={language}`. Add `invoices.printTitle` to both `ar.json` and `en.json`.
2. **`AddPartyModal.js` / `EditPartyModal.js`:** Replace inline Arabic toast strings (duplicate email error, etc.) with `t()` calls using existing keys (e.g., `notify.defaultError`) or add new keys under `parties.*` namespace if appropriate ones do not exist.
3. **`DynamicLayout.js` / `ResponsiveLayout.js`:** Replace the hardcoded `"جارٍ التحميل..."` and `"جارٍ التحقق من الهوية"` loading strings with `t('common.loading')` — this key already exists in both JSON files.
4. **`ui/export-buttons.js`:** Replace all hardcoded Arabic strings (export error, no data, report label, yes/no confirmations) with `t()` calls. Add keys under a `common` or `buttons` namespace as needed.
5. **`DataTable.js`:** Replace the hardcoded Arabic "no results" string with `t('common.noResultsFound')` or the closest existing key. Add the key if absent.
6. **`RichTextEditor.js`:** Replace all 11 hardcoded Arabic toolbar label strings (print, undo, redo, bold, italic, underline, font size, bullet list, numbered list, alignments, justify) with `t()` calls. Add keys under a new `richText` namespace in both JSON files.
7. **`layout.js` (`ToastContainer`):** Change `rtl={true}` to `rtl={isRTL}` using `useLanguage()` context. The `LanguageProvider` already wraps the layout, so the hook is available.

**Relevant Context:**
- `c:\projects\lexcora-frontend\src\app\finance\invoices\components\PrintInvoiceModal.js` — hardcoded `lang="ar"`, `dir="rtl"`, `<title>فاتورة`
- `c:\projects\lexcora-frontend\src\app\layout.js` — `<ToastContainer rtl={true} ...>`
- `c:\projects\lexcora-frontend\src\components\DynamicLayout.js` lines 80, 84
- `c:\projects\lexcora-frontend\src\components\ResponsiveLayout.js` lines 76, 79
- `c:\projects\lexcora-frontend\src\components\RichTextEditor.js` — 11 Arabic toolbar labels
- `c:\projects\lexcora-frontend\src\components\ui\export-buttons.js` — 8 Arabic strings
- `c:\projects\lexcora-frontend\src\components\DataTable.js` line 293
- `c:\projects\lexcora-frontend\src\messages\ar.json` and `en.json` — keys to add
- `c:\projects\lexcora-frontend\src\hooks\useTranslations.js` — `useTranslations(namespace)` pattern
- `c:\projects\lexcora-frontend\src\contexts\LanguageContext.js` — `useLanguage()` for `isRTL`, `language`

**Status:** [ ] pending

---

### Sub-Task 6: Fix `lexcora-client-portal` Language Context and Locale Persistence

**Intent:** The client portal's `LanguageContext.js` has two bugs: (1) the language default is `'en'` even though the portal serves Arabic-speaking clients, and (2) the `changeLanguage()` function updates state and `localStorage` but the `router.refresh()` and `window.location.reload()` calls are both commented out, so the displayed content does not re-render after a language switch — the user sees a stale UI until a manual page reload. This must be fixed so language changes take effect immediately without a full reload, using React's reactivity (the context already re-renders children on state change; the reload is unnecessary and should simply be removed, not reinstated).

**Expected Outcomes:**
- Portal defaults to Arabic (`'ar'`) on first load when no `localStorage.locale` is set.
- Switching language in the portal immediately updates all translated strings via React's re-render (no page reload needed).
- The `LanguageContext` exports `isRTL` (not just `isArabic`) so it is consistent with the frontend naming convention and can be used to set `dir` on portals/modals.

**Todo List:**
1. In `src/contexts/LanguageContext.js` of `lexcora-client-portal`: change the `useState` initial value from `'en'` to `'ar'`, and set `direction` initial value from `'ltr'` to `'rtl'`.
2. In the `useEffect` that loads `localStorage`: change the fallback from `'en'` to `'ar'` (line 24: `localStorage.getItem('locale') || 'ar'`).
3. Remove the two commented-out reload lines (`window.location.reload()` and `router.refresh()`) in `changeLanguage()`. The React state update (`setLocale`) already triggers a re-render of all context consumers — the reload is both unnecessary and harmful (it would lose in-memory state).
4. Remove the unused `useRouter` import since `router` is no longer used after removing the reload calls.
5. Add `isRTL: locale === 'ar'` to the `value` object exported by the provider.
6. In `src/hooks/useTranslation.js`: the hook already falls back to returning the raw key if translation is missing; ensure the fallback chain also tries the other language before returning the key (mirror the `lexcora-frontend` `useTranslations` resilience pattern).

**Relevant Context:**
- `c:\projects\lexcora-client-portal\src\contexts\LanguageContext.js` lines 17–19, 24, 43–55
- `c:\projects\lexcora-client-portal\src\hooks\useTranslation.js` lines 27–35
- `c:\projects\lexcora-frontend\src\hooks\useTranslations.js` — reference implementation for fallback chain
- The portal's `axiosInstance.js` locale forwarding is addressed in Sub-Task 4

**Status:** [ ] pending

---

## Execution Order

Sub-tasks must be executed in this order, as each one builds on the previous:

```
Sub-Task 1  →  Sub-Task 2  →  Sub-Task 3
                                   ↓
Sub-Task 6  ←  Sub-Task 5  ←  Sub-Task 4
```

- **Sub-Tasks 1–3** are backend-only and can be verified independently by inspecting API responses.
- **Sub-Task 4** depends on Sub-Task 3 being done (correct default locale on backend) before it is worth wiring.
- **Sub-Task 5** is frontend-only (`lexcora-frontend`) and can be done in parallel with Sub-Task 4.
- **Sub-Task 6** is portal-only (`lexcora-client-portal`) and can be done in parallel with Sub-Tasks 4–5.

## Files Changed Per Repository

| Repository | Files Modified |
|---|---|
| `lexcora-backend` | `src/utils/messages.js`, `src/middlewares/errorHandler.js`, `src/middlewares/i18nMiddleware.js`, `src/controllers/eventsController.js`, `src/controllers/logsController.js`, `src/controllers/goamlController.js`, `src/controllers/employeeRequestsController.js`, `src/controllers/callLogsController.js` |
| `lexcora-frontend` | `src/app/services/api/axiosInstance.js`, `src/app/layout.js`, `src/app/finance/invoices/components/PrintInvoiceModal.js`, `src/app/cases/[id]/edit/parties/components/AddPartyModal.js`, `src/app/cases/[id]/edit/parties/components/EditPartyModal.js` (if it exists), `src/components/DynamicLayout.js`, `src/components/ResponsiveLayout.js`, `src/components/RichTextEditor.js`, `src/components/ui/export-buttons.js`, `src/components/DataTable.js`, `src/messages/ar.json`, `src/messages/en.json` |
| `lexcora-client-portal` | `src/app/services/api/axiosInstance.js`, `src/contexts/LanguageContext.js`, `src/hooks/useTranslation.js` |
