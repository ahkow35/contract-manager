# HR Highlight Edit — PDPA-safe rebuild (contract-first)

Goal ID: `hr-highlight-edit-rebuild-2026-06`
Started: 2026-06-16T16:43:33Z
Parent goal: none
Mode: full
Ledger path: `.agent/runs/hr-highlight-edit-rebuild-2026-06/`

## Objective

Rebuild highlight-edit in place as a PDPA-safe Next.js+Vercel+Supabase HR document generator; docxtemplater engine, contract-first, all PII client-side.

## Goal Mode Coupling

When creating or updating the matching `/goal`, include this ledger pointer in the goal objective:

`Maintain the agent-owned ledger at /Users/nyanyk/Claude/projects/highlight-edit/.agent/runs/hr-highlight-edit-rebuild-2026-06/ and keep implementation-notes.html current at checkpoints, before compaction, and before final handoff.`

## Finishing Criteria (v1 = phases 0–2, unblocked scope)

- [done] **P0** Old `backend/` + `frontend/` archived to `legacy/`; Next.js (App Router, TS, Tailwind) app builds; `npx tsc --noEmit` + `next build` clean. Supabase auth WIRED (gate active when env set; dev-mode open otherwise). [blocked] live Vercel deploy + live login = needs user's Supabase project keys + Vercel link.
- [done] **P1** docxtemplater + pizzip wired client-side; engine ported to TS with tests passing under vitest (expanded to 48 incl. NRIC + amount-to-words); tokenised `.docx` round-trips entirely in-browser to a Blob.
- [done] **P2** SG "Local Secondment" `.docx` tokenised + round-trip-verified byte-identical; intake form renders from schema; SG NRIC checksum; end-to-end render test proves a correct filled contract. [todo] live network-tab INV-1 proof = Phase 5 audit (code path already PII-client-only).
- [done] PDPA invariants INV-1..5 hold in the contract flow by construction (no server draft code exists, blank-only static template, client Blob download). OCR (INV-4) lands in Phase 3.
- [done] `implementation-notes.html` current (Resume Here + timeline); `tasks/todo.md` checkboxes updated.

**Out of scope for v1 (blocked / deferred):** MY LC part-timer template + MyKad sample (user drop), `.doc`→`.docx` conversions (need Word), Phase 3 OCR full integration, Phase 4 letter suite, Phase 5 production hardening.

## Validation commands

- `cd <app> && npx tsc --noEmit`
- `cd <app> && npx vitest run` (contract-merge + engine tests)
- `cd <app> && npx next build`
- Manual: load contract → fill → download; DevTools Network shows no request body containing PII.

## Escape Hatch

Pause, ask the user, or mark a scoped item `[blocked]` / `[incomplete]` if:
- validation contradicts the goal
- the goal requires a scope change
- the agent is looping without measurable progress
- the next step risks deleting or rewriting durable memory
- the PRD and actual repo disagree
- the ledger itself contaminates validation

