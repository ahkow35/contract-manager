# Changelog

All notable changes to Contract Manager (formerly highlight-edit).

## 2026-06-19

### Added — two new SG contract templates
- **SG Non-Local Secondment (Outsourcing)** — basic salary plus three **optional** pay
  clauses, each a checkbox toggle that drives a docxtemplater conditional section:
  monthly travel allowance, first-3-months guaranteed commission, and a discretionary
  bonus (with a qualifying date). FIN signature line.
- **SG Internal Employee** — INWW's own staff. Fills the two `[DATE]` brackets (letter
  date + "with effect from" start date), `[salary]`, `[mobile allowance]`, and
  designation. Open-ended (no contract end date).

### Engine
- New `'checkbox'` field type; `FieldDef.showIf` to gate a field behind a checkbox;
  `TokenMap` now allows `boolean` (booleans drive `{#flag}…{/flag}` sections).
- `IntakeForm`: checkbox rendering, `showIf` field-gating, and generalised
  `{prefix}Figure → {prefix}Words` salary-in-words auto-fill (covers salary + travel).
- `runtime.ts`: `showIf`-aware generic validate/tokens for admin-uploaded templates.

### Notes
- Local Secondment unchanged — the re-supplied source `.docx` is byte-identical.
- Malaysia (LC part-timer) still **blocked**: the `lc-part-timer` module is coded and
  registered, but no official MY `.docx` has been supplied to tokenise.

### Verification
- `tsc --noEmit` clean · `eslint --quiet` clean · **81 tests** pass (was 62) ·
  production build OK. Files: `src/lib/merge/types.ts`, `runtime.ts`, `registry.ts`,
  `components/IntakeForm.tsx`, two new template modules + integration tests, two new
  tokenised `.docx` under `public/templates/`.
