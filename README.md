# INWW Document Studio

PDPA-safe HR document generator for WK / INWorldwide. Pick a curated template (employment
contracts, HR letters), fill an on-page form, and download a finished `.docx` — **all personal data
(names, NRIC, salary) is processed entirely in the browser and never uploaded to any server.**

> Rebuilt 2026-06 from the old "Highlight Edit" SaaS. The previous Python/FastAPI/React/Docker stack
> is archived under `legacy/`. See `tasks/todo.md` for the phased plan and
> `.agent/runs/hr-highlight-edit-rebuild-2026-06/implementation-notes.html` for live build state.

## Stack

- **Next.js 16** (App Router, TypeScript, Tailwind v4) on **Vercel**
- **docxtemplater + pizzip** — in-browser `.docx` merge (no server processing of PII)
- **Supabase** — staff email/password auth; role management via `app_metadata`; blank templates in Storage
- **Tesseract.js + pdf.js** — on-device ID-card OCR (images and PDFs, same-origin assets)

## PDPA invariants (the spec)

1. PII never leaves the browser. 2. Server stores only blank templates + accounts. 3. No
server-side drafts. 4. OCR runs on-device. 5. Generated doc is a client-side Blob download.

## Develop

```bash
npm install
cp .env.example .env.local   # leave blank for open dev mode, or add Supabase keys to enable auth
npm run dev                  # http://localhost:3000
npm run build                # production build
npx vitest run               # 55 tests (engine, validators, end-to-end render, OCR extraction)
```

## How a template works

Each document is a `TemplateDef` in `src/lib/merge/templates/` tying a tokenised blank `.docx`
(in `public/templates/`) to its form schema, validation, `{token}` map, and output filename.
Add new contracts/letters by tokenising the blank `.docx` and registering it in
`src/lib/merge/registry.ts`. Live template: **SG Local Secondment Employment Contract**.

## Admin roles and user management

Two roles exist: `admin` and `staff`. Roles are stored in Supabase `app_metadata.role` and are
settable server-side only (service-role key — never from the browser). The initial admin is
`nyan@withkinna.com`.

- **Admin panel:** `/admin` — visible to admins only (link in header). Provides user management
  (add/remove staff, promote/demote sub-admins) and a usage dashboard.
- **Usage dashboard:** all-time / last 30 days / last 7 days generation counts, broken down by
  template and by user. PDPA-safe: the `usage_events` table stores only template ID, user
  ID/email, and timestamp — never document field values or employee PII. RLS ensures only the
  server (service-role) can read or write it.
- **API routes:** `GET/POST /api/admin/users`, `PATCH/DELETE /api/admin/users/[id]`,
  `GET /api/admin/usage`. All 403 for non-admins. Self-lockout guard on role/delete operations.

## Password reset

- Visit `/forgot-password` → enter email → Supabase sends a reset link.
- The link redirects to `/reset-password` which performs a PKCE code exchange and calls `updateUser`.
- "Forgot password?" link is shown on `/login`.

> **Supabase Auth URL config required:** The Supabase dashboard must have the Site URL and redirect
> allowlist configured before reset links work in production. See `tasks/todo.md` — Phase 8 for
> the exact values.

## Status

Phases 0–3 and 5–8 complete (scaffold, engine, SG contract E2E, OCR fixed + PDF, deployed,
admin tier, password reset). Pending: Phase 4 letter suite (blocked on file drops), Phase 5 PDPA
audit sign-off, Supabase Auth URL config (30-second dashboard task). See `tasks/todo.md`.
