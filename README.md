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
- **Supabase** — staff email/password auth only (never stores PII); blank templates in Storage
- **Tesseract.js** — on-device ID-card OCR (Phase 3)

## PDPA invariants (the spec)

1. PII never leaves the browser. 2. Server stores only blank templates + accounts. 3. No
server-side drafts. 4. OCR runs on-device. 5. Generated doc is a client-side Blob download.

## Develop

```bash
npm install
cp .env.example .env.local   # leave blank for open dev mode, or add Supabase keys to enable auth
npm run dev                  # http://localhost:3000
npm run build                # production build
npx vitest run               # 48 tests (engine, validators, end-to-end render)
```

## How a template works

Each document is a `TemplateDef` in `src/lib/merge/templates/` tying a tokenised blank `.docx`
(in `public/templates/`) to its form schema, validation, `{token}` map, and output filename.
Add new contracts/letters by tokenising the blank `.docx` and registering it in
`src/lib/merge/registry.ts`. Live template: **SG Local Secondment Employment Contract**.

## Status

Phases 0–2 complete (scaffold, engine, SG contract end-to-end). Pending: Supabase keys + Vercel
deploy, Phase 3 OCR, Phase 4 letter suite, Phase 5 PDPA audit. See `tasks/todo.md`.
