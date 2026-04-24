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
