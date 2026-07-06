# Stage 5 — Env Variable & Axios Hardening Plan

## Top-Level Overview

The `npm run dev` crash (`[axiosInstance] NEXT_PUBLIC_API_BASE_URL is not defined`) is caused
by a missing value in `.env.local`, not by a code bug or infrastructure misrouting.
The throw in `axiosInstance.js` is intentional and correct; the only code change needed is
to make the error message actionable for local developers as well as Vercel operators.

The `EditClientModal.js` data-pipeline fixes (envelope unwrap, SWR key, submit button guard)
were already applied in Stage 5 session 1 and are complete.

---

## Sub-Tasks

---

### Sub-Task 1 — Populate `.env.local` (manual, non-code)

**Status:** `[x] done` — completed by user (confirmed: error disappeared after edit + restart)

**Intent**
Supply the missing `NEXT_PUBLIC_API_BASE_URL` value to the local dev server so
`axiosInstance.js` can initialize and the app can boot.

---

### Sub-Task 2 — Improve the `axiosInstance.js` error message

**Status:** `[x] done`

**Intent**
The current error message says only "Set this environment variable in your Vercel project
settings." A local developer who has never deployed to Vercel will not know to look in
`.env.local`. Improve the message to address both audiences.

**Expected Outcomes**
- When the variable is missing, the thrown error clearly states:
  - What file to edit locally (`.env.local` + the exact key to add).
  - That the dev server must be restarted after editing the file.
  - What to configure on Vercel for production.
- No other logic in `axiosInstance.js` changes.

**Todo List**
1. In `src/app/services/api/axiosInstance.js`, replace the string inside `throw new Error(…)`
   with a multi-line message covering both the local-dev fix and the Vercel-production fix.
   Keep the throw — do not convert it to a `console.warn` or conditional.

**Relevant Context**
- File: `src/app/services/api/axiosInstance.js` lines 7–11.
- The throw propagates through `SWRProvider.js` → `layout.js` → crash, so it must remain
  a hard throw to catch misconfigured production builds early.

---

### Sub-Task 3 — Audit `getPartyById` and `updateParty` response contracts

**Status:** `[x] done`

**Intent**
Confirm that the data shapes returned by `getPartyById` and `updateParty` match what
`EditClientModal.js` now expects after the envelope-unwrap fix, and document the contract
so future modals are written correctly the first time.

**Expected Outcomes**
- `getPartyById(id)` is confirmed to return `{ success, data: { id, name, phone, … } }`.
- `updateParty(id, payload)` is confirmed to return `{ success, data: { … } }` or `{ success, message }`.
- Any mismatch between the backend column names and the Formik field names in
  `EditClientModal.js` is identified and corrected.
- A short comment block is added above `getPartyById` in `parties.js` documenting the
  return shape so future callers do not have to guess.

**Todo List**
1. Read `src/app/services/api/parties.js` `getPartyById` and `updateParty` functions.
2. Cross-reference the field names they return against the Formik initial-values object
   in `EditClientModal.js` (`name`, `phone`, `status`, `party_type`, `category`,
   `nationality`, `address`, `email`, `e_id`, `consultation_type`, `passport`, `source`,
   `branch_id`, `is_vip`).
3. If the backend returns snake_case columns that differ from the frontend field names
   (e.g. `emirate_id` vs `e_id`), add a mapping layer in `getInitialValues()`.
4. Add a JSDoc comment above `getPartyById` in `parties.js` that documents the response
   envelope shape.

**Relevant Context**
- `src/app/services/api/parties.js` lines 104–111 (`getPartyById`), lines 113–124 (`updateParty`).
- `src/app/potential-clients/EditClientModal.js` lines 77–113 (`getInitialValues`).
- The envelope-unwrap fix (`rawData?.data ?? rawData ?? null`) already handles the
  `{ success, data }` wrapper. Sub-Task 3 only needs to check that field names match
  after unwrapping.

---

## Architecture Note

```
.env.local  ─►  NEXT_PUBLIC_API_BASE_URL
                  │
                  ▼
         axiosInstance.js  (throws if missing — intentional)
                  │
         ┌────────┼────────┐
         ▼        ▼        ▼
      SWRProvider  parties.js  (getPartyById / updateParty)
                              │
                              ▼
                     EditClientModal.js
                     rawData?.data  ← envelope unwrap (fixed Stage 5 session 1)
                     Formik initialValues  ← field-name mapping (Sub-Task 3)
```

The Vercel `vercel.json` proxy rewrite (`/api/proxy/*` → backend) is unrelated to
`NEXT_PUBLIC_API_BASE_URL`. The frontend calls the backend directly via `axiosInstance`,
not through the proxy. No changes to `vercel.json` are required.
