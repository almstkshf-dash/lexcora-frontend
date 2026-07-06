# Frontend System Documentation & Progress Report

**Project:** Lexcora (Admin/Staff Dashboard)
**Date:** April 2026
**Status:** UI/UX Aesthetics and Structural Progress

This document tracks the progress and implemented features specifically for the `lexcora-frontend` repository, highlighting the design updates, internationalization, and framework architecture.

---

## 1. Frontend Framework & Architecture

The Lexcora dashboard has been built for high performance and scalability.
- **Framework:** Next.js 15 App Router.
- **Hosting:** Successfully deployed to Vercel for serverless edge network delivery.
- **Communication:** Connects to the central `lexcora-backend` via secure REST APIs using custom JWT authentication headers (interceptors/fetch handlers ensure token propagation).
- **Tooling:** Uses Turbopack for rapid local development (`next dev --turbopack`).

---

## 2. Typography, Design, and Aesthetics

The admin interface provides a premium, responsive, and visually engaging experience.

### Utility and CSS Architecture
- **Framework:** Tailwind CSS v4 is used extensively, fully integrating OKLCH color spaces.
- **Themes:** Over a dozen carefully crafted themes are available out-of-the-box via CSS variables in `globals.css` (e.g., `blue-new`, `focus`, `vibrant`, `calm`).
- **Dynamic UI:** Features like `ambientDrift` and `ambientAccentShift` animations provide a fluid, living background without degrading browser performance.
- **Dark/Light Mode:** First-class support for dark and light modes, seamlessly integrated into all themes with strict accessibility contrast ratios.

### Typography & Fonts
- **Font Face:** `Noto Sans Arabic` (Google Fonts) is utilized with precise subsets for impeccable Arabic rendering. Fallbacks are configured for Latin scripts.
- **Icons:** `lucide-react` is used for consistent, scalable iconography across the application.

---

## 3. Internationalization (i18n)

Given the bilingual requirement of the platform (Arabic/English), `lexcora-frontend` treats localization as a primary feature.
- **Library:** Powered by `next-intl`.
- **RTL/LTR Support:** The entire application supports native Right-To-Left direction for Arabic and Left-To-Right for English.
- **Workflow Rule:** Strings are never hardcoded inside components. Instead, keys are managed inside `messages/ar.json` and `messages/en.json` to ensure consistency.

---

## 4. Components and Interaction

- **Radix UI Primitives:** The application uses unstyled, accessible components from `@radix-ui/react-*` (Dialog, Dropdown, Accordion) wrapped with Tailwind styles for maximum accessibility (a11y) and keyboard navigation support.
- **State Management:** A blend of Context Providers (`ThemeProvider`, `LanguageProvider`, `AuthProvider`), SWR for data fetching/caching, and Redux Toolkit (`@reduxjs/toolkit`) for complex global state.
- **Rich Text Editing:** `tiptap` is integrated for robust document and text editing capabilities directly within the browser.
- **Notifications:** `react-toastify` is used for global, non-intrusive feedback toasts (success/error alerts).

---

## 5. Ongoing Tasks

- Optimization of the Turbopack build and mitigating Hot Module Replacement (HMR) latency issues.
- Deepening accessibility (a11y) to ensure all form auto-completes and label associations strictly follow WCAG guidelines.

---

## 6. Recent UI/UX Refinements (April 2026)

- **Page Header Modernization:** Upgraded the `PageHeader` component with premium card styling, including subtle background gradients (`hero-motion`), border definitions, and improved vertical alignment of title and action buttons (`items-center`).
- **Data Hierarchy Optimization:** Standardized table layouts for case management, transitioning multi-line lists (like parties) into clean, single-line truncated rows. This ensures vertical alignment consistency and reduces layout shifting in high-density tables.
- **Enhanced Interactive Elements:** Implemented micro-animations (scale-on-hover) and refined shadows for primary action buttons to improve tactile feedback and visual prominence.
- **Responsive Spacing:** Optimized page container padding (`p-4` to `p-6`) and grid spacing to ensure better data density and readability across varying screen sizes.

## 7. Cases Management Enhancements (April 2026)

- **Quick-Glance Metrics (Stat Cards):** Added a metrics section at the top of the Cases page, displaying real-time counts for Total, Active, Pending, and Important cases. This improves situational awareness for legal staff.
- **Visual Empty States:** Redesigned the "No data" state for the main DataTable. Replaced the generic text with a professional, centered UI featuring a `FolderOpen` icon, descriptive subtext, and entry animations.
- **Focus Cycle Management:** Enhanced the `FocusCycleBar` (Pomodoro timer) with a minimization toggle. Users can now collapse the timer into a compact state to reduce visual clutter while still keeping track of their focus/break sessions.
- **i18n Cleanup:** Resolved missing translation keys for critical UI elements like the "Logout" button and "Language Switcher", ensuring a fully bilingual experience without raw system keys.
- **Sidebar UX:** Refactored the `UserProfile` component to handle RTL/LTR layouts dynamically and use consistent translation hooks for all labels.

## 8. Bug Fixes & Stability (April 2026)

- **DataTable ReferenceError Fix:** Resolved a critical `ReferenceError: useEffect is not defined` in the `DataTable` component. The error occurred due to a missing `useEffect` import from the 'react' package while using it for search input debouncing.
- **Cases Statistics Data Validation:** Fixed a data mismatch issue where case stat cards (Active, Pending, Important) were only showing counts for the current page of results. The logic was moved to the backend to return global counts for the filtered dataset, and the frontend was updated to consume these real-time metrics, ensuring accuracy across all pages.
- **ESLint Next-Intl Setup:** Installed `eslint-plugin-next-intl` to statically analyze translation keys and prevent missing or hardcoded strings from making it to production. Updated `eslint.config.mjs` in both `lexcora-frontend` and `lexcora-client-portal` to use the plugin with ESLint v9's Flat Config and properly scan the `./messages` directory.
- **Reports Page Import Conflict:** Resolved a build error `Module parse failed: Identifier 'Progress' has already been declared` in `src/app/finance/reports/page.js`. The issue was caused by a redundant block of imports (`Progress`, `SearchableCombobox`, `Skeleton`) that were duplicated further down the file.
- **Missing Progress Component Fix:** Resolved a build error `Module not found: Can't resolve '@/components/ui/progress'` by creating the missing `Progress` UI component in `src/components/ui/progress.jsx`.

# Frontend System Documentation & Progress Report

**Project:** Lexcora (Admin/Staff Dashboard)
**Date:** April 2026
**Status:** UI/UX Aesthetics and Structural Progress

This document tracks the progress and implemented features specifically for the `lexcora-frontend` repository, highlighting the design updates, internationalization, and framework architecture.

---

## 1. Frontend Framework & Architecture

The Lexcora dashboard has been built for high performance and scalability.
- **Framework:** Next.js 15 App Router.
- **Hosting:** Successfully deployed to Vercel for serverless edge network delivery.
- **Communication:** Connects to the central `lexcora-backend` via secure REST APIs using custom JWT authentication headers (interceptors/fetch handlers ensure token propagation).
- **Tooling:** Uses Turbopack for rapid local development (`next dev --turbopack`).

---

## 2. Typography, Design, and Aesthetics

The admin interface provides a premium, responsive, and visually engaging experience.

### Utility and CSS Architecture
- **Framework:** Tailwind CSS v4 is used extensively, fully integrating OKLCH color spaces.
- **Themes:** Over a dozen carefully crafted themes are available out-of-the-box via CSS variables in `globals.css` (e.g., `blue-new`, `focus`, `vibrant`, `calm`).
- **Dynamic UI:** Features like `ambientDrift` and `ambientAccentShift` animations provide a fluid, living background without degrading browser performance.
- **Dark/Light Mode:** First-class support for dark and light modes, seamlessly integrated into all themes with strict accessibility contrast ratios.

### Typography & Fonts
- **Font Face:** `Noto Sans Arabic` (Google Fonts) is utilized with precise subsets for impeccable Arabic rendering. Fallbacks are configured for Latin scripts.
- **Icons:** `lucide-react` is used for consistent, scalable iconography across the application.

---

## 3. Internationalization (i18n)

Given the bilingual requirement of the platform (Arabic/English), `lexcora-frontend` treats localization as a primary feature.
- **Library:** Powered by `next-intl`.
- **RTL/LTR Support:** The entire application supports native Right-To-Left direction for Arabic and Left-To-Right for English.
- **Workflow Rule:** Strings are never hardcoded inside components. Instead, keys are managed inside `messages/ar.json` and `messages/en.json` to ensure consistency.

---

## 4. Components and Interaction

- **Radix UI Primitives:** The application uses unstyled, accessible components from `@radix-ui/react-*` (Dialog, Dropdown, Accordion) wrapped with Tailwind styles for maximum accessibility (a11y) and keyboard navigation support.
- **State Management:** A blend of Context Providers (`ThemeProvider`, `LanguageProvider`, `AuthProvider`), SWR for data fetching/caching, and Redux Toolkit (`@reduxjs/toolkit`) for complex global state.
- **Rich Text Editing:** `tiptap` is integrated for robust document and text editing capabilities directly within the browser.
- **Notifications:** `react-toastify` is used for global, non-intrusive feedback toasts (success/error alerts).

---

## 5. Ongoing Tasks

- Optimization of the Turbopack build and mitigating Hot Module Replacement (HMR) latency issues.
- Deepening accessibility (a11y) to ensure all form auto-completes and label associations strictly follow WCAG guidelines.

---

## 6. Recent UI/UX Refinements (April 2026)

- **Page Header Modernization:** Upgraded the `PageHeader` component with premium card styling, including subtle background gradients (`hero-motion`), border definitions, and improved vertical alignment of title and action buttons (`items-center`).
- **Data Hierarchy Optimization:** Standardized table layouts for case management, transitioning multi-line lists (like parties) into clean, single-line truncated rows. This ensures vertical alignment consistency and reduces layout shifting in high-density tables.
- **Enhanced Interactive Elements:** Implemented micro-animations (scale-on-hover) and refined shadows for primary action buttons to improve tactile feedback and visual prominence.
- **Responsive Spacing:** Optimized page container padding (`p-4` to `p-6`) and grid spacing to ensure better data density and readability across varying screen sizes.

## 7. Cases Management Enhancements (April 2026)

- **Quick-Glance Metrics (Stat Cards):** Added a metrics section at the top of the Cases page, displaying real-time counts for Total, Active, Pending, and Important cases. This improves situational awareness for legal staff.
- **Visual Empty States:** Redesigned the "No data" state for the main DataTable. Replaced the generic text with a professional, centered UI featuring a `FolderOpen` icon, descriptive subtext, and entry animations.
- **Focus Cycle Management:** Enhanced the `FocusCycleBar` (Pomodoro timer) with a minimization toggle. Users can now collapse the timer into a compact state to reduce visual clutter while still keeping track of their focus/break sessions.
- **i18n Cleanup:** Resolved missing translation keys for critical UI elements like the "Logout" button and "Language Switcher", ensuring a fully bilingual experience without raw system keys.
- **Sidebar UX:** Refactored the `UserProfile` component to handle RTL/LTR layouts dynamically and use consistent translation hooks for all labels.

## 8. Bug Fixes & Stability (April 2026)

- **DataTable ReferenceError Fix:** Resolved a critical `ReferenceError: useEffect is not defined` in the `DataTable` component. The error occurred due to a missing `useEffect` import from the 'react' package while using it for search input debouncing.
- **Cases Statistics Data Validation:** Fixed a data mismatch issue where case stat cards (Active, Pending, Important) were only showing counts for the current page of results. The logic was moved to the backend to return global counts for the filtered dataset, and the frontend was updated to consume these real-time metrics, ensuring accuracy across all pages.
- **ESLint Next-Intl Setup:** Installed `eslint-plugin-next-intl` to statically analyze translation keys and prevent missing or hardcoded strings from making it to production. Updated `eslint.config.mjs` in both `lexcora-frontend` and `lexcora-client-portal` to use the plugin with ESLint v9's Flat Config and properly scan the `./messages` directory.
- **Reports Page Import Conflict:** Resolved a build error `Module parse failed: Identifier 'Progress' has already been declared` in `src/app/finance/reports/page.js`. The issue was caused by a redundant block of imports (`Progress`, `SearchableCombobox`, `Skeleton`) that were duplicated further down the file.
- **Missing Progress Component Fix:** Resolved a build error `Module not found: Can't resolve '@/components/ui/progress'` by creating the missing `Progress` UI component in `src/components/ui/progress.jsx`.

## 9. API Stability & Contract Enforcement (May 2026)

- **Strict Response Normalization:** Implemented a global `axios` interceptor that acts as a transformation layer for all incoming API data. This ensures that even if the backend returns inconsistent structures (e.g., `results` instead of `data`), the frontend always receives a unified, safe object.
- **Fail-Safe Collection Handling:** Added logic to detect collection-based endpoints and force `data` to be an `Array`. This architectural guard completely eliminates `TypeError: map is not a function` crashes throughout the application, providing a significantly more stable user experience.
- **Standardized Backend Integration:** Updated dozens of API calls to leverage the new backend `res.list` helper, ensuring a predictable contract for all data tables and lists.

## 10. Bug Fixes & Interceptor Refinements (June 2026)

- **Refined Response Normalization:** Resolved an issue where the axios response interceptor was overly aggressive, converting non-collection GET requests (such as `/auth/me` and settings endpoints) and non-GET requests (like `/auth/login`) into empty arrays because they did not end with a numeric ID. The interceptor was refined to only force collection array normalization for GET requests that do not target authentication, settings, or other single-resource endpoints. This restores functionality to the login, user profile check, and tasks list loading screens.

## 11. Bug Fixes & Duplicate Check Stabilization (July 2026)

- **Duplicate Employee Mismatch Fix:** Resolved a bug in `AddEmployeeDialog.js` where duplicate checking was completely bypassed. The dialog checked `duplicateCheck.isDuplicate` instead of `duplicateCheck.data?.isDuplicate`, allowing duplicate submissions to bypass the validation toast and fail with 400 errors at the API level.
- **Bilingual Validation Support:** Corrected the check to query the backend with username and employee number in addition to name/email/phone, and added localized translation keys (`duplicateUsernameExists`, `duplicateEmployeeNumberExists`) to both `en.json` and `ar.json` for proper bilingual (Arabic/English) error messages.

## 12. Sidebar Permissions Mismatch Fix (July 2026)

- **Problem:** Non-admin employees with all permissions enabled could only see the Dashboard, Add Case File, and some settings pages in the sidebar. This occurred because the frontend permission requirements definition (`PERMISSION_REQUIREMENTS`) looked for plural permission keys (e.g. `'view cases'`, `'view sessions'`, `'parties'`, `'meetings'`), whereas the database permissions table stores singular names (e.g. `'view case'`, `'view session'`, `'view party'`, `'view meeting'`).
- **Solution:** Updated the `PERMISSION_REQUIREMENTS` object in `src/lib/permissions.js` to include the exact permission names stored in the database.
- **Key Changes:**
  - Added `'view case'`, `'show cases'`, `'view session'`, `'view party'`, and `'view meeting'` to their corresponding categories.
  - Added fallback permissions for sections like `callLogs`, `goaml`, `clientForms`, `hrAssets`, `hrForms`, and `hrEvents` that don't check permissions on the backend, allowing them to load correctly for users with general access.
  - Ensured all other sections (including `approvals`, `finance`, and `settings`) map to valid database permissions, ensuring dynamic and correct sidebar rendering.

## 13. Employees API 403 AxiosError Fix (July 2026)

- **Problem:** When logged in as a non-admin employee, opening modals or tabs that select other employees (like Add Meeting, Add Task, or Expense reports) failed with a `403 Forbidden` AxiosError: "ليس لديك صلاحية للقيام بهذا الإجراء" during the `GET /employees` call. This was due to the core employee and payroll permissions being absent from the database.
- **Solution:** Ensured the backend database was populated with the required `View Employee`, `Add Employee`, `Edit Employee`, `Delete Employee`, and payroll permissions, and assigned them to employees. This allows the frontend components to fetch the employee list successfully and populate selection dropdowns without encountering 403 errors.

## 14. Employee DatePicker Year Dropdown Extension (July 2026)

- **Problem:** When adding or editing an employee, selecting dates (such as hiring date, identity expiry, passport expiry, contract expiry, etc.) in the custom calendar was limited to the year 2026. This happened because the `@/components/ui/calendar` wrapper component uses `react-day-picker` with `captionLayout="dropdown"`, which defaults to a restricted year range if `startMonth` and `endMonth` props are not explicitly set.
- **Solution:** Configured the `DatePickerField` in [EmployeeInfoTab.js](file:///c:/projects/lexcora-frontend/src/app/hr/employees/add-employee/EmployeeInfoTab.js) to specify `startMonth={new Date(1930, 0)}` and `endMonth={new Date(2060, 11)}`. This allows selecting birthdates, hiring dates, and far-future expiration dates up to the year 2060.

## 15. HR & Payroll Sidebar Visibility Alignment (July 2026)

- **Problem:** Even after being granted "all permissions," non-admin employees still found some pages hidden under the "Human Resources" (HR) section. This occurred because the sidebar authorization config (`PERMISSION_REQUIREMENTS`) was looking for specific permission strings (e.g. `'hr:employees:view'` or `'payroll:view'`), which differed from the database permission records (e.g. `'View Employee'` and `'View Payroll'`).
- **Solution:** Added `'view employee'` and `'view payroll'` (normalized database equivalents) to the required permission arrays for `hrEmployees` and `payroll` categories in [permissions.js](file:///c:/projects/lexcora-frontend/src/lib/permissions.js). This ensures that granting these database permissions successfully displays the corresponding sidebar navigation items to non-admin users.

## 16. DatePicker Visual Stability & Z-Index Overlay Fix (July 2026)

- **Problem:** Users complained that the DatePicker calendar container would "dance" (jump up, down, left, and right) when navigating between months, and sometimes appear behind modals or dialogs.
  - The jumping was caused by the calendar height changing depending on whether the month has 4, 5, or 6 weeks, forcing the Radix Popover positioning engine to recalculate coordinates on the fly.
  - The overlay issue occurred because `PopoverContent` had a low z-index (`z-50`), placing it beneath modals which used `z-50` or higher.
- **Solution:**
  - Added the `fixedWeeks` prop to `<DayPicker />` in [calendar.jsx](file:///c:/projects/lexcora-frontend/src/components/ui/calendar.jsx). This forces all months to render 6 rows, keeping the height of the calendar completely fixed and eliminating popover jumping.
  - Increased the z-index of `PopoverContent` in [popover.jsx](file:///c:/projects/lexcora-frontend/src/components/ui/popover.jsx) to `z-[100000]` so that calendar pickers always display on top of all modal layers.

## 17. Toast Notifications Z-Index Overlay & Duration Fix (July 2026)

- **Problem:** Toast notification alerts (success/error messages) were appearing behind the transparent background/modal backdrops ("غمامة"), and their auto-close duration was too short (3 seconds), making them very hard for users to read in time.
  - The overlay issue was caused by the `ToastContainer` styling setting a z-index of `zIndex: 9999`, which was equal to or lower than the z-indexes of several active modals (e.g. `z-[10000]`).
- **Solution:**
  - Modified [layout.js](file:///c:/projects/lexcora-frontend/src/app/layout.js) to set the `ToastContainer` z-index style to `999999`, elevating it above all modals, dialogs, and select components.
  - Increased the `autoClose` prop from `3000` (3 seconds) to `6000` (6 seconds) to double the reading window for users before the messages fade out.

## 18. Employee Form Saving Loading Overlay & Interaction Lock (July 2026)

- **Problem:** During the employee saving and checking duplicates processes (which take time due to API/database requests), there was no modal-level visual indication of progress. Users could still edit inputs, switch tabs, close the modal, or click "Cancel", which interrupted the flow and left them without feedback when saving succeeded or failed.
- **Solution:**
  - Added a full-modal loading overlay with a blur backdrop, a loading spinner, and the message `"جاري حفظ بيانات الموظف..."` that renders when `isSaving` is active.
  - Blocked closing the modal via the backdrop or keypress during saving by adding a protection check inside `handleClose`.
  - Disabled the close `X` and "Cancel" buttons on both [AddEmployeeDialog.js](file:///c:/projects/lexcora-frontend/src/app/hr/employees/add-employee/AddEmployeeDialog.js) and [EditEmployeeModal.js](file:///c:/projects/lexcora-frontend/src/app/hr/employees/[id]/components/EditEmployeeModal.js) during saving.

## 19. Extended Error Toast Duration (10 Seconds) (July 2026)

- **Problem:** Error messages and validation errors were disappearing too quickly ("في لمح البصر") for users to read and understand what mistakes were made (e.g. invalid username format, duplicate credentials, or missing inputs).
- **Solution:**
  - Configured all validation and submit-time error toasts in [AddEmployeeDialog.js](file:///c:/projects/lexcora-frontend/src/app/hr/employees/add-employee/AddEmployeeDialog.js) and [EditEmployeeModal.js](file:///c:/projects/lexcora-frontend/src/app/hr/employees/[id]/components/EditEmployeeModal.js) to explicitly use `{ autoClose: 10000 }` (10 seconds).
  - Updated the global notification utility [useNotify.js](file:///c:/projects/lexcora-frontend/src/hooks/useNotify.js) to default all Axios API and general system error toasts (`showError`) to an auto-close time of `10000` (10 seconds), ensuring consistent, readable feedback across the entire application.

## 20. Inline Form Field Validation Errors & Highlight Styling (July 2026)

- **Problem:** Displaying field required warnings (like "Name is required") as toasts was confusing and forced users to navigate a "maze" to figure out which inputs were empty or invalid.
- **Solution:**
  - Modified [EmployeeInfoTab.js](file:///c:/projects/lexcora-frontend/src/app/hr/employees/add-employee/EmployeeInfoTab.js) to accept an `errors` object and pass errors to a new `error` prop in the `FormField` component.
  - Added CSS conditional styles `border-red-500` and `focus-visible:ring-red-500` to all input fields and select dropdown triggers when they have validation errors, visually highlighting the exact inputs that require corrections.
  - Placed the localized red error message directly below the respective inputs.
  - Integrated `errors` state in both [AddEmployeeDialog.js](file:///c:/projects/lexcora-frontend/src/app/hr/employees/add-employee/AddEmployeeDialog.js) and [EditEmployeeModal.js](file:///c:/projects/lexcora-frontend/src/app/hr/employees/[id]/components/EditEmployeeModal.js) to collect all missing fields at once. If errors occur on submit, the active tab is automatically switched back to `"info"` so the user can see the highlighted errors, and individual errors are reactively cleared when the user fills in the values.

## 21. Global Unification of Form validation Errors & Typo Fixes (July 2026)

- **Problem:** Across several major financial and transactional forms in the application, validation error messages were displayed, but the input borders failed to turn red as intended, causing inconsistency and confusion.
- **Solution:**
  - Discovered a global typo `'border-eed-500'` (invalid Tailwind style) instead of `'border-red-500'` across all Formik-validated inputs in the finance modules.
  - Corrected `'border-eed-500'` to `'border-red-500'` in:
    1. [TransactionModal.js](file:///c:/projects/lexcora-frontend/src/app/finance/employees/components/TransactionModal.js) (employee selection, amount, and bank account selection inputs).
    2. [AddAccountModal.js](file:///c:/projects/lexcora-frontend/src/app/finance/accounts/components/AddAccountModal.js) (account code, Arabic name, and English name inputs).
    3. [AddAccountModal.js](file:///c:/projects/lexcora-frontend/src/app/finance/bank-accounts/components/AddAccountModal.js) (bank name, account name, account number, and current balance inputs).
    4. [EditAccountModal.js](file:///c:/projects/lexcora-frontend/src/app/finance/bank-accounts/components/EditAccountModal.js) (bank name, account name, account number, and current balance inputs).
  - This unifies form validation visuals globally so that all inputs across HR, Finance, and Accounts modules instantly display inline red borders next to their error text.

## 22. Uploads, Fonts, and React/Next Warnings Resolved (July 2026)

- **Local Dev Upload 500 Fix**: Configured the Express backend to load environment variables from both `.env.local` and `.env` in `api/index.js`, ensuring `BLOB_READ_WRITE_TOKEN` is available to the `@vercel/blob` storage client locally.
- **Frontend uploadFile Return Check**: Fixed `EditTemplateModal.js` and `SendMessageModal.js` which were checking `result?.document_url` instead of `result?.success && result?.file?.document_url` when using the single-file upload helper.
- **pdfExporter Font Lookup Warning Fix**: Registered separate virtual file keys (`NotoSansArabic-Regular.ttf` and `NotoSansArabic-Bold.ttf`) for normal and bold font weights in `pdfExporter.js` to resolve mapping lookup issues in jsPDF without console warnings.
- **EditPartyModal Controlled Input Fix**: Added missing `consultation_type` and `passport` default empty strings to the form state reset object inside `resetForm()` in `EditPartyModal.js`, preventing the fields from becoming `undefined` and triggering React controlled-to-uncontrolled input warnings.
- **Next.js Image size Warning Fix**: Changed `AiButton.js`'s Rased assistant image to use the `fill` property inside its relative container to fix the console warning about mismatched width/height parameters.

## 23. HMR Latency Fix (July 2026)

- **Problem:** Hot Module Replacement (HMR) latency in development mode was extremely high (ranging from 5 to 22 seconds) for single module changes due to an override that forced Webpack to generate full, separate source maps (`'source-map'`).
- **Solution:** Removed the custom devtool override in [next.config.mjs](file:///c:/projects/lexcora-frontend/next.config.mjs) entirely. This allows Next.js to use its built-in optimized defaults, avoiding performance warnings and ensuring fast HMR rebuilds.

## 24. Chart Dimension Warnings Elimination (July 2026)

- **Problem:** In [Transactions.js](file:///c:/projects/lexcora-frontend/src/app/finance/statistics/components/Transactions.js), `<ChartContainer>` was using `aspect-auto`, which caused Recharts' `ResponsiveContainer` to measure a negative/zero dimension on initial render, resulting in browser warnings.
- **Solution:** Replaced `aspect-auto` with `min-w-0` in [Transactions.js](file:///c:/projects/lexcora-frontend/src/app/finance/statistics/components/Transactions.js)'s `ChartContainer` className, ensuring the container does not collapse and preventing layout calculation warnings.

## 25. Asset Creation Validation Fix (July 2026)

- **Problem:** Submitting the asset form via `POST /api/assets` was triggering a `400 Bad Request` validator error. This happened because the backend requires either a rate or useful life value when straight-line depreciation is active, but the frontend was unconditionally sending `depreciation_method: 'straight_line'` even for non-depreciated assets (with rate `0` and null useful life). Additionally, the backend could reject empty `documents` array shapes.
- **Solution:** Modified [AssetModal.js](file:///c:/projects/lexcora-frontend/src/app/hr/assets/AssetModal.js) to:
  - Check if depreciation is actually configured (either rate or useful life > 0). If not configured, set `depreciation_method` to `null` to bypass the validation checks for straight-line depreciation.
  - Conditionally omit the `documents` field from the request payload when no documents are uploaded, aligning it with the API payload expectations.

## 26. Financial Statistics Print Optimization (July 2026)

- **Problem:** Printing the "Financial Statistics" page resulted in a poor output:
  1. The page layout was printed in dark mode (dark background and white text/cards), which wasted ink and made text hard to read.
  2. The Pomodoro Focus bar ("تركيز"), page navigation links, action buttons ("طباعة" and "تصدير"), and the floating AI assistant ("اسأل راصد") were printed on the page.
  3. The transaction statistics chart area was printed as an empty black box because the global print styles collapsed all `div` elements via `height: auto !important`, which reduced Recharts responsive container's dimensions to 0.
- **Solution:**
  1. Updated [globals.css](file:///c:/projects/lexcora-frontend/src/app/globals.css)'s `@media print` rules to override all theme variables (`:root` and `.dark`) to their light mode values, forcing white backgrounds and dark text on print globally.
  2. Exempted charts (`[data-slot="chart"]`, Recharts elements) from the auto-collapsing `div { height: auto !important }` print style, and set an explicit fixed height of `280px` for printing.
  3. Added the `print-hide` utility class to the Focus bar wrapper in [Header.js](file:///c:/projects/lexcora-frontend/src/app/components/Header.js), the QuickActionsBar wrapper in [QuickActionsBar.js](file:///c:/projects/lexcora-frontend/src/app/components/QuickActionsBar.js), the floating AI Button in [AiButton.js](file:///c:/projects/lexcora-frontend/src/app/components/ai/AiButton.js), and the print/export action buttons in [page.js](file:///c:/projects/lexcora-frontend/src/app/finance/statistics/page.js).
  4. Added the `print-container` class to the statistics page container in [page.js](file:///c:/projects/lexcora-frontend/src/app/finance/statistics/page.js) to ensure full-width, clean scaling when printed.

## 27. Financial Reports Print Layout Optimization (July 2026)

- **Problem:** Printing the "Financial Reports" page (`/finance/reports`) had several layout issues:
  1. Multi-column layouts (like Cash Flow, Profit & Loss, Balance Sheet, and Aging columns) tried to fit side-by-side on A4 paper width, causing extreme horizontal squishing and clipping content on the left side in Arabic RTL view (e.g. cutting off parts of numbers like `currency 5,000.00-`).
  2. The navigation tab list (`TabsList`), header Print and Export buttons, sub-tabs under profitability, search comboboxes (filters), and the VAT declaration download button were all printed, wasting space and cluttering the printed documents.
- **Solution:**
  1. Added `print-container` and `print-full-width` classes to the outer page wrapper in [page.js](file:///c:/projects/lexcora-frontend/src/app/finance/reports/page.js) to override layout margins/paddings and align print scaling.
  2. Added the `print-hide` utility class to all non-printable components: page action buttons, the main reports `<TabsList>`, the profitability sub-tabs, case/department search card containers, and the VAT return download button.
  3. Added `print:grid-cols-1` and `print:divide-y` to the grid containers for all report tabs (Cash Flow, Profit & Loss, Balance Sheet, Aging, and Profitability views) to force sections to stack vertically when printed, giving each report component the full A4 page width and preventing number truncation.

## 28. FTA VAT Return PDF Export Hookup (July 2026)

- **Problem:** The "Download FTA Declaration" (تحميل إقرار FTA) button in the VAT Return tab of the Financial Reports page did not respond or download any document because it lacked a click event handler and PDF generation logic.
- **Solution:**
  1. Implemented a dedicated `exportVatReturnToPDF` function in [pdfExporter.js](file:///c:/projects/lexcora-frontend/src/utils/exporters/pdfExporter.js) to format and render standard supplies per emirate (Output Tax table), recoverable expenses (Input Tax table), and a Net VAT payable summary card on A4 portrait canvas.
  2. Registered virtual keys for the `NotoSansArabic` font to support Arabic text characters in jsPDF exports without console warnings.
  3. Integrated column and text direction mirroring for the PDF table headers and values when the application is loaded in Arabic (`ar`) mode.
  4. Imported `exportVatReturnToPDF` in [page.js](file:///c:/projects/lexcora-frontend/src/app/finance/reports/page.js) and bound it to the button's `onClick` event, passing pre-translated labels and active VAT declaration API data.
