# Lexcora Admin Frontend

The central management dashboard for the Lexcora Law Office Management ERP. Built with Next.js 15, Tailwind CSS v4, and a focus on premium aesthetics and bilingual stability.

## Key Features
- **Bilingual Support (AR/EN):** Full RTL/LTR support with zero hardcoded strings.
- **Dynamic Theming:** Custom theme engine with 10+ premium palettes.
- **API Hardening:** Integrated architectural guard preventing runtime crashes via strict response normalization.
- **Case Management:** Comprehensive tracking of legal cases, parties, and documents.
- **Financial Integration:** Direct connection to the Lexcora double-entry accounting system.

## Tech Stack
- **Framework:** Next.js 15 (App Router)
- **Styling:** Tailwind CSS v4
- **State Management:** SWR, Redux Toolkit, Context API
- **I18n:** `next-intl`
- **Networking:** Axios with strict contract interceptors

## Getting Started
1. Install dependencies: `npm install`
2. Configure environment variables in `.env.local`
3. Run development server: `npm run dev`

## API Stability
This project uses a **Strict API Contract**. Every response is intercepted and normalized to ensure `data` is always present and collections are always valid arrays, eliminating `map()` failures during hydration.
