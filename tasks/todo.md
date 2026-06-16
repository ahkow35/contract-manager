# HR Highlight Edit — PDPA-Safe Rebuild (contract-first)

**Decided:** .docx-only v1 · Internal WK/INWW tool (Supabase email/password per staff, no billing) ·
Next.js on Vercel + Supabase · **rebuild in place** in this repo.
**Strategy:** One product (HR-vertical document generator). Contracts + letters are a curated template
library. Build engine + first SG contract end-to-end, retain the MY build, then add the suite.

## ENGINE DECISION (revised after finding the prior build)
Runtime engine = **docxtemplater named `{tokens}`** (in-browser), **not** yellow-highlight detection.
Rationale: contracts need computed/validated fields; the prior MY build already proved this path with
26/26 passing tests. Highlight-detection is at most a one-time *authoring helper* (highlight → token),
never the runtime. The old Python highlight engine is reference-only; it is not ported.

---

## Reuse from the prior build (`/Users/nyanyk/Claude/CoWork/Employment Contract/`)
- [ ] `contract-merge.js` — pure/deterministic merge formatting (ordinal dates, duration string,
      first-name salutation, filename convention, validation, token map). Node+browser. **Reuse as-is**;
      finalise token names when each real `.docx` is tokenised.
- [ ] `contract-merge.test.js` — 26 tests. Carry over; extend per template.
- [ ] Proven **Tesseract.js client-side OCR** setup (wasm + `eng.traineddata.gz`, 0 off-origin). Port the
      staging into the repo; on Vercel these files **must be served same-origin** (in `public/`), no CDN.
- [ ] Carry over `contract-tool-STATUS.md` design notes + field set.

## Non-negotiable invariants (PDPA) — these are the spec
- [ ] **INV-1 — PII never leaves the browser** (names, NRIC/MyKad, salary, dates, ID image, OCR text,
      generated doc). No `fetch`/POST ever carries a filled value.
- [ ] **INV-2 — Server stores only blank templates + accounts.** Supabase holds blank/tokenised `.docx`
      (no PII), field schemas, and logins. Nothing else.
- [ ] **INV-3 — No server-side draft storage.** Old `TemplateDraft` deleted. Autosave (if any) =
      browser-local IndexedDB only.
- [ ] **INV-4 — OCR on-device.** Tesseract.js/WASM, image never uploaded, engine files same-origin.
- [ ] **INV-5 — Generated doc is a client-side Blob download.** Never round-tripped through the server.

**Drop from old app:** FastAPI, SQLite, Alembic, Docker, Jenkins, server-side drafts, IP-usage, paid
tiers, analytics, admin. **Reference-only:** old `docx_parser.py` / `document_generator.py`, Precision-Light UI.

---

## Phase 0 — Scaffold & foundation (rebuild in place)
- [ ] Archive old stack: move `backend/`, old `frontend/` to `legacy/` (keep git history; don't delete yet).
- [x] Next.js (App Router, TS, Tailwind v4) at repo root. `next build` clean. [ ] live Vercel deploy — needs account link.
- [x] Supabase Auth wired (client/server/middleware, email/password, non-blocking dev mode). [ ] live project keys in `.env.local`.
- [x] Light theme + yellow-bar motif (Precision-Light direction).
- **Gate:** ✅ builds; no PII surface exists. (Live login pending Supabase keys.)

## Phase 1 — docx engine in-browser (mostly proven — integrate, don't invent) ✅
- [x] Wired **docxtemplater + pizzip** client-side; render tokenised `.docx` → Blob → download (`src/lib/merge/docx.ts`).
- [x] Ported the merge engine to TS (`format.ts`, `validators.ts`, `amount-to-words.ts`, `types.ts`, `registry.ts`); 48 tests pass.
- [x] Address newlines → Word line breaks (`linebreaks: true`); blank tokens render clean.
- **Gate:** ✅ tokenised `.docx` round-trips entirely in-browser.

## Phase 2 — SG "Local Secondment" contract, end to end (vertical slice #1) ✅
- [x] Copied blank `.docx` into `templates/source/` (gitignored).
- [x] Tokenised the real `.docx` via cross-run span tokeniser (handles superscript-split dates) → 9 `{tokens}`; round-trip byte-identical.
- [x] Field schema + dynamic intake form (`src/components/IntakeForm.tsx`); salary-to-words auto-fill.
- [x] Validation: SG NRIC checksum/format, dates, currency, leave.
- [x] **End-to-end render test** proves a correct filled contract (no leftover tokens, sample stripped). Carmen oracle confirmed the field set.
- **Gate:** ✅ pick → fill → download correct doc, fully client-side. [ ] live network-tab INV-1 proof = Phase 5.

## Phase 3 — ID-card OCR pre-fill (port the proven setup)
- [ ] Mount Tesseract.js + engine files same-origin (`public/`); verify 0 off-origin requests on Vercel.
- [ ] Scan image (in-memory) → extract Name + NRIC/MyKad → map to fields → operator verifies vs on-screen
      image before generate. Assist, not authority. Manual fallback always.
- [ ] Per-jurisdiction extraction: SG NRIC (fixed pattern, reliable) vs MY MyKad layout (name/address tuning).
- [ ] OCR step shown only on `ocrSource` templates.
- **Risk:** name/address OCR accuracy on real cards (NRIC pattern already reliable). Mitigated by verify step.
- **Gate:** scan → pre-fill → correct → generate works; INV-4 verified.

## Phase 4 — Template library + the suite
- [ ] Convert binary `.doc` templates → `.docx` (Word "Save As"): **Non-Local Secondment**, **Internal
      Employee**. Then tokenise each.
- [ ] **Retain the MY LC part-timer contract** as a template (still blocked — see open items).
- [ ] Add remaining contracts + HR letters (confirmation, increment, termination, warning, etc.):
      each = tokenised blank `.docx` + schema + OCR flag + jurisdiction tag.
- [ ] Library UI: list/pick/manage blank templates; (optional) IndexedDB local draft autosave.
- **Gate:** full WK/INWW template set usable from one library.

## Phase 5 — Harden & ship
- [ ] Staff accounts / access control.
- [ ] **PDPA invariant audit (mandatory):** code-audit every network call + live network-tab review →
      sign off INV-1..5.
- [ ] Production deploy on Vercel (+ custom domain if wanted); operator guide.
- **Gate:** audit passed, staff using it on real onboarding.

---

## Open items — needed before the relevant phase
1. **Jurisdiction per template** — SG (NRIC) vs MY (MyKad). SG Local/Non-Local + Internal = SG;
   LC part-timer = MY. Confirms which NRIC validator + OCR tuning each template uses.
2. **`.doc` → `.docx` conversion** for Non-Local Secondment + Internal Employee (must be done in Word).
3. **MY build unblock (to fully retain it):** the official **LC part-timer `.docx`** template + a
   **sample MyKad image** (specimen/dummy preferred) — the two files the prior build was blocked on.
4. SG dummy NRIC card image for Phase-3 SG OCR tuning (optional; NRIC pattern already reliable).
