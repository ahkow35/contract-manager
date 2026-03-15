# HighlightEdit — Logo Integration & UI Redesign

**Date:** 2026-03-15
**Status:** Approved

---

## Overview

Apply the Option 1 logo ("The Mark") across the application, introduce a light theme for all user-facing pages, establish a yellow-bar design language derived from the logo, and replace the existing diagonal watermark with a footer stamp on free-tier document exports.

---

## 1. Logo

### Asset

Source: `docs/logo-option-1.svg` — a white document with a folded top-right corner, a solid `#FFE033` highlight bar sweeping across the middle third, and two pairs of gray lines above and below representing text.

Deployed location: copy to `frontend/public/logo.svg`. Import in React as a static asset via `<img src="/logo.svg" />` or inline as an SVG component for header use (inline preferred at 32px so stroke colors remain crisp at small sizes).

### Wordmark

`Highlight` in `#111827` (dark), `Edit` in `#CA8A04` (dark yellow). Replace the current `text-blue-400` accent on "Edit" in `App.tsx` line 32.

### Sizes

| Context | Size |
|---|---|
| Header (nav) | 32×32px |
| Favicon | 16×16px |
| Auth / empty states | 64×64px |
| Marketing / upgrade page | 128×128px |

### Placement

- **Header (`App.tsx`):** Replace the blue-gradient `H` box (lines 28–33) with the inline SVG logo at 32px. Update wordmark accent color.
- **Favicon:** Export a 16×16px PNG from `logo.svg`, save as `frontend/public/favicon.png`, update the `<link rel="icon">` in `frontend/index.html`.
- **Auth pages (`Auth.tsx`, `ForgotPassword.tsx`, `ResetPassword.tsx`):** Display logo at 64px above the form card.
- **Upgrade page (`Upgrade.tsx`):** Display logo at 128px in the hero section.

---

## 2. Color System

Blue is removed entirely from all user-facing pages. Yellow is the sole accent color.

| Token | Value | Usage |
|---|---|---|
| Page background | `#F9FAFB` | All user-facing page backgrounds |
| Surface | `#FFFFFF` | Cards, panels, input backgrounds |
| Border | `#E5E7EB` | Card outlines, dividers, input borders |
| Text primary | `#111827` | Headings, labels, body copy |
| Text secondary | `#6B7280` | Supporting text, placeholders |
| Text tertiary | `#9CA3AF` | Disabled, hint text |
| Highlight yellow | `#FFE033` | Logo, motif bars, active input borders, primary CTA background |
| Yellow dark | `#CA8A04` | Wordmark "Edit", text on yellow backgrounds |
| Black | `#1A1A1A` | Logo strokes, export button background |
| Shadow | `0 1px 3px rgba(0,0,0,0.06)` | Card elevation |

### Specific locations to update

- `index.css`: update `body { background-color }` from `var(--color-slate-950)` to `#F9FAFB`. Update scrollbar colors to use light-theme grays. Update CSS custom properties.
- `App.tsx` line 166: change `bg-slate-950` on the root `<div>` to `bg-[#F9FAFB]`. *(The Tailwind class overrides the body background; both must change.)*
- `App.tsx` line 150 (mobile menu): replace `bg-blue-600 hover:bg-blue-500` "Upload New File" button with `bg-[#1A1A1A] hover:bg-[#333]` (black, matching export button style).
- All remaining `text-blue-*`, `bg-blue-*`, `border-blue-*`, `from-blue-*`, `to-indigo-*` classes on user-facing pages must be replaced with yellow equivalents or neutrals.

---

## 3. Design Language — Yellow Bar Motif

Every card and section panel on user-facing pages gets a **4px solid `#FFE033` top border**, echoing the highlight bar from the logo.

```css
.card-highlight {
  border-top: 4px solid #FFE033;
}
```

Applies to:
- Upload panel (main editor)
- Form fields panel (main editor)
- Template cards (templates list)
- Auth form card
- Upgrade pricing cards
- Any future panels or modals on user-facing pages

Active/focused input fields use `border-color: #FFE033` with a subtle `#FFFDF0` background tint to reinforce the highlight metaphor.

---

## 4. Pages in Scope

### User-facing — redesigned to light theme

| Page | File | Changes |
|---|---|---|
| Main editor | `TemplateEditor.tsx` | Light background, yellow-bar cards, new input styles |
| Templates list | `TemplatesList.tsx` | Light background, template cards with yellow-bar motif |
| Auth (sign in) | `Auth.tsx` | Light background, logo 64px above card, yellow-bar form card |
| Forgot password | `ForgotPassword.tsx` | Light background, logo, yellow-bar card |
| Reset password | `ResetPassword.tsx` | Light background, logo, yellow-bar card |
| Upgrade | `Upgrade.tsx` | Light background, logo 128px hero, yellow-bar pricing cards |

### Admin — unchanged (dark theme)

| Page | Reason |
|---|---|
| `Admin.tsx` | Intentionally dark — differentiates admin context visually |
| `Analytics.tsx` | Intentionally dark — differentiates admin context visually |

### Shared

- **`App.tsx` (Header):** new inline SVG logo, updated wordmark, white nav background (`#FFFFFF`), `border-b border-[#E5E7EB]`, dark text for nav links. Mobile "Upload New File" button → black (see Section 2).
- **`index.css`:** updated CSS custom properties, body background, scrollbar styles.

---

## 5. Watermark — Free Tier Exports

Replace the existing diagonal VML text watermark in `backend/app/utils/watermark.py` with a branded footer paragraph appended to the document body.

### Content

```
[logo mark — 16×16px PNG inline image]  Created with HighlightEdit · Free Plan · highlightedit.com
```

### Styling

- Text color: light gray (`#6B7280` equivalent — use `RGBColor(107, 114, 128)` in python-docx)
- "HighlightEdit" bold, slightly darker (`RGBColor(55, 65, 81)`)
- Font size: 9pt
- Paragraph alignment: left
- Separated from document content by a thin horizontal rule or spacing

### Implementation

- **DOCX:** Create `backend/app/utils/watermark.py` (this file does not currently exist). Implement an `add_footer_watermark(doc)` function that appends a footer paragraph to the document after all content is filled. Embed the logo as a small inline image using `paragraph.add_run().add_picture(logo_path, width=Pt(10))`, followed by the text "Created with HighlightEdit · Free Plan · highlightedit.com" in 9pt light gray.
- **PDF:** The PDF pipeline uses Adobe PDF Services (`AdobeConverter.convert_docx_to_pdf` in `backend/app/utils/`). The footer must be injected into the DOCX **before** conversion — there is no separate PDF injection step. The DOCX watermark implementation therefore covers both formats automatically.
- **Gating:** The existing export endpoint in `backend/app/api/routes/templates.py` already checks `current_user.is_paid`. Apply the watermark with this logic:
  ```python
  if current_user is not None and not current_user.is_paid:
      add_footer_watermark(doc)
  ```
  Unauthenticated requests and Pro users (`is_paid=True`) both receive a clean export.

---

## 6. Success Criteria

### Logo
- [ ] Logo SVG at 32px renders correctly in the header (inline, crisp strokes)
- [ ] Favicon updated to new logo PNG
- [ ] Logo appears at 64px on all auth pages
- [ ] Logo appears at 128px on the upgrade page

### Theme — blue audit checklist
- [ ] `App.tsx`: no remaining `blue` or `indigo` Tailwind classes on user-facing elements
- [ ] `App.tsx` root div: `bg-[#F9FAFB]` (not `bg-slate-950`)
- [ ] `App.tsx` mobile "Upload New File" button: black (not `bg-blue-600`)
- [ ] `index.css`: body background is `#F9FAFB`, scrollbar colors are light-theme grays
- [ ] `TemplateEditor.tsx`: no blue classes
- [ ] `TemplatesList.tsx`: no blue classes
- [ ] `Auth.tsx`, `ForgotPassword.tsx`, `ResetPassword.tsx`: no blue classes
- [ ] `Upgrade.tsx`: no blue classes

### Design language
- [ ] Every card/panel on user-facing pages has the 4px `#FFE033` top border
- [ ] Active/focused inputs show yellow border and `#FFFDF0` tint

### Admin pages
- [ ] `Admin.tsx` is visually unchanged (dark)
- [ ] `Analytics.tsx` is visually unchanged (dark)

### Watermark
- [ ] Free-tier `.docx` exports: footer paragraph present on document, no diagonal watermark
- [ ] Free-tier `.pdf` exports (via Adobe conversion): footer paragraph present
- [ ] Pro-tier exports: no watermark of any kind
