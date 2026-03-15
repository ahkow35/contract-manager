# Logo Integration & UI Redesign Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Apply the Option 1 logo across the app, switch all user-facing pages to a clean light theme with a yellow-bar design motif, and replace the diagonal VML watermark with a footer stamp on free-tier exports.

**Architecture:** Three independent chunks — foundation (logo asset + global styles + header), page-by-page frontend redesign (6 user-facing pages), and backend watermark replacement. Each chunk is independently deployable and testable.

**Tech Stack:** React 18, TypeScript, TailwindCSS, Vite, FastAPI, python-docx, Adobe PDF Services (DOCX→PDF conversion)

---

## File Structure

**Created:**
- `frontend/public/logo.svg` — deployed logo asset (copy of `docs/logo-option-1.svg`)
- `frontend/public/favicon.png` — 16×16px PNG favicon generated from logo SVG
- `frontend/src/components/Logo.tsx` — reusable inline SVG logo component (32px, 64px, 128px variants)

**Modified:**
- `frontend/index.html` — update favicon `<link>` from `vite.svg` to `favicon.png`
- `frontend/src/index.css` — update CSS custom properties, body background, scrollbar styles
- `frontend/src/App.tsx` — replace header logo, update wordmark, fix root div bg, fix mobile button
- `frontend/src/pages/TemplateEditor.tsx` — light theme, yellow-bar cards, blue → yellow/neutral
- `frontend/src/pages/TemplatesList.tsx` — light theme, yellow-bar template cards
- `frontend/src/pages/Auth.tsx` — light theme, logo above card, yellow-bar form card
- `frontend/src/pages/ForgotPassword.tsx` — light theme, logo, yellow-bar card
- `frontend/src/pages/ResetPassword.tsx` — light theme, logo, yellow-bar card
- `frontend/src/pages/Upgrade.tsx` — light theme, logo hero, yellow-bar pricing cards
- `backend/app/services/watermark.py` — replace diagonal VML watermark with footer stamp

**Unchanged (intentionally dark):**
- `frontend/src/pages/Admin.tsx`
- `frontend/src/pages/Analytics.tsx`

---

## Chunk 1: Foundation — Logo Asset, Global Styles, Header

### Task 1: Deploy logo asset and create reusable Logo component

**Files:**
- Create: `frontend/public/logo.svg`
- Create: `frontend/public/favicon.png`
- Create: `frontend/src/components/Logo.tsx`
- Modify: `frontend/index.html`

- [ ] **Step 1: Copy logo SVG to public directory**

```bash
cp /Users/nyanyk/Antigravity/HighlightEdit/docs/logo-option-1.svg \
   /Users/nyanyk/Antigravity/HighlightEdit/frontend/public/logo.svg
```

- [ ] **Step 2: Generate 32×32 favicon PNG from the SVG**

Use the built-in macOS `sips` tool (no extra dependencies):

```bash
cd /Users/nyanyk/Antigravity/HighlightEdit/frontend/public
# Convert SVG → PNG via rsvg-convert if available, otherwise use an online tool or skip to manual step
which rsvg-convert && rsvg-convert -w 32 -h 32 logo.svg -o favicon.png || \
  python3 -c "
import subprocess, sys
# Fallback: use Inkscape if available
result = subprocess.run(['which', 'inkscape'], capture_output=True)
if result.returncode == 0:
    subprocess.run(['inkscape', '-w', '32', '-h', '32', 'logo.svg', '-o', 'favicon.png'])
    print('favicon.png generated with Inkscape')
else:
    print('No SVG-to-PNG converter found. Copy logo.svg to favicon.png as SVG favicon instead.')
    import shutil; shutil.copy('logo.svg', 'favicon.svg')
"
```

If no converter is available, use the SVG directly as the favicon (modern browsers support SVG favicons):

```html
<link rel="icon" type="image/svg+xml" href="/logo.svg" />
```

- [ ] **Step 3: Update `frontend/index.html` favicon link**

Open `frontend/index.html`. Replace:
```html
<link rel="icon" type="image/svg+xml" href="/vite.svg" />
```
With:
```html
<link rel="icon" type="image/svg+xml" href="/logo.svg" />
```

Also update the `<title>` tag:
```html
<title>HighlightEdit</title>
```

- [ ] **Step 4: Create `frontend/src/components/Logo.tsx`**

This is an inline SVG component so strokes render crisp at all sizes. The `size` prop controls width/height.

```tsx
interface LogoProps {
  size?: number;
  className?: string;
}

export default function Logo({ size = 32, className = '' }: LogoProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 200 200"
      width={size}
      height={size}
      className={className}
      aria-label="HighlightEdit logo"
    >
      {/* Document body */}
      <rect x="46" y="30" width="96" height="120" rx="6" ry="6" fill="#FFFFFF" stroke="#1A1A1A" strokeWidth="5"/>
      {/* Folded corner */}
      <polygon points="118,30 142,54 118,54" fill="#F0F0F0" stroke="#1A1A1A" strokeWidth="5" strokeLinejoin="round"/>
      {/* Yellow highlight bar */}
      <rect x="46" y="90" width="96" height="22" fill="#FFE033" opacity="0.95"/>
      {/* Text lines above */}
      <line x1="60" y1="68" x2="124" y2="68" stroke="#C8C8C8" strokeWidth="4" strokeLinecap="round"/>
      <line x1="60" y1="80" x2="110" y2="80" stroke="#C8C8C8" strokeWidth="4" strokeLinecap="round"/>
      {/* Text lines below */}
      <line x1="60" y1="124" x2="124" y2="124" stroke="#C8C8C8" strokeWidth="4" strokeLinecap="round"/>
      <line x1="60" y1="136" x2="100" y2="136" stroke="#C8C8C8" strokeWidth="4" strokeLinecap="round"/>
    </svg>
  );
}
```

- [ ] **Step 5: Verify component renders**

Start the dev server and navigate to any page:
```bash
cd /Users/nyanyk/Antigravity/HighlightEdit && ./start_app.sh
```
Open http://localhost:5173 — the browser tab should show the new favicon.

- [ ] **Step 6: Commit**

```bash
git add frontend/public/logo.svg frontend/public/favicon.png frontend/index.html \
        frontend/src/components/Logo.tsx
git commit -m "feat: add Logo component and deploy logo asset as favicon"
```

---

### Task 2: Update global styles (`index.css`)

**Files:**
- Modify: `frontend/src/index.css`

- [ ] **Step 1: Update CSS custom properties and base styles**

Open `frontend/src/index.css`. Replace the entire `:root` block and `body` rule with:

```css
:root {
  /* Light theme palette */
  --color-bg: #F9FAFB;
  --color-surface: #FFFFFF;
  --color-border: #E5E7EB;
  --color-text-primary: #111827;
  --color-text-secondary: #6B7280;
  --color-text-tertiary: #9CA3AF;
  --color-yellow: #FFE033;
  --color-yellow-dark: #CA8A04;
  --color-black: #1A1A1A;
  --shadow-card: 0 1px 3px rgba(0,0,0,0.06);

  /* Keep these for admin/analytics dark pages */
  --color-slate-950: #020617;
  --color-slate-900: #0f172a;
  --color-slate-800: #1e293b;
  --color-slate-700: #334155;
  --color-slate-600: #475569;
  --color-slate-500: #64748b;
  --color-slate-400: #94a3b8;
  --color-slate-300: #cbd5e1;
}
```

Replace the `body` rule:
```css
body {
  margin: 0;
  padding: 0;
  background-color: var(--color-bg);
  color: var(--color-text-primary);
  line-height: 1.5;
}
```

Replace the scrollbar rules (light theme):
```css
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: #F3F4F6;
}

::-webkit-scrollbar-thumb {
  background: #D1D5DB;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: #9CA3AF;
}
```

Replace the focus style to use yellow:
```css
*:focus-visible {
  outline: 2px solid #FFE033;
  outline-offset: 2px;
}
```

Add the yellow-bar motif utility class at the bottom of the file:
```css
/* Yellow-bar card motif — echoes the highlight bar in the logo */
.card-highlight {
  border-top: 4px solid #FFE033;
}
```

- [ ] **Step 2: Verify dev server still compiles**

```bash
# Dev server should hot-reload — check browser console for errors
# Page background should now be #F9FAFB (light gray-white)
```

- [ ] **Step 3: Commit**

```bash
git add frontend/src/index.css
git commit -m "feat: switch to light theme CSS custom properties and yellow-bar motif class"
```

---

### Task 3: Update `App.tsx` — header, root div, mobile button

**Files:**
- Modify: `frontend/src/App.tsx`

- [ ] **Step 1: Update the imports at the top of `App.tsx`**

Add the Logo import after the existing imports:
```tsx
import Logo from './components/Logo';
```

- [ ] **Step 2: Replace the header logo block (lines 27–34)**

Find this block:
```tsx
<Link to="/" className="flex items-center gap-2 sm:gap-3 hover:opacity-90 transition-opacity">
    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
        <span className="text-white text-sm font-bold">H</span>
    </div>
    <span className="text-base sm:text-lg font-semibold text-white tracking-tight">
        Highlight<span className="text-blue-400">Edit</span>
    </span>
</Link>
```

Replace with:
```tsx
<Link to="/" className="flex items-center gap-2 sm:gap-3 hover:opacity-90 transition-opacity">
    <Logo size={32} />
    <span className="text-base sm:text-lg font-semibold text-[#111827] tracking-tight">
        Highlight<span className="text-[#CA8A04]">Edit</span>
    </span>
</Link>
```

- [ ] **Step 3: Update header background and nav link colors**

Find the `<header>` opening tag:
```tsx
<header className="sticky top-0 z-50 bg-slate-900/95 backdrop-blur-sm border-b border-slate-800">
```

Replace with:
```tsx
<header className="sticky top-0 z-50 bg-white border-b border-[#E5E7EB]">
```

Update all nav link text colors in the desktop nav from `text-slate-300`, `text-slate-400`, `text-white` to dark equivalents:
- `text-slate-300 hover:text-white` → `text-[#374151] hover:text-[#111827]`
- `text-slate-400 hover:text-white` → `text-[#6B7280] hover:text-[#111827]`
- `text-slate-400` (email display) → `text-[#6B7280]`

Update the desktop "Upload New File" button (around line 72–77):
```tsx
<button
    onClick={() => navigate('/')}
    className="px-4 py-2 text-sm font-medium text-white bg-[#1A1A1A] hover:bg-[#333] border border-[#1A1A1A] rounded-lg transition-colors"
>
    Upload New File
</button>
```

- [ ] **Step 4: Update mobile menu background and link colors**

Find the mobile menu container:
```tsx
<div className="lg:hidden mt-3 pt-3 border-t border-slate-800 space-y-3">
```
Replace with:
```tsx
<div className="lg:hidden mt-3 pt-3 border-t border-[#E5E7EB] space-y-3">
```

Update mobile nav link colors — make these exact find-and-replace substitutions:

Email display (line 103): `text-slate-400 truncate py-2` → `text-[#6B7280] truncate py-2`

My Templates link (line 127): `text-slate-300 hover:text-white` → `text-[#374151] hover:text-[#111827]`

Sign Out button (line 133): `text-slate-400 hover:text-white` → `text-[#6B7280] hover:text-[#111827]`

Note: Admin link (`text-purple-400`) and Analytics link (`text-cyan-400`) are intentionally NOT changed — they serve as visual cues inside the mobile menu that those links lead to admin-only areas.

Update the mobile "Upload New File" button (line 148–152):
```tsx
<button
    onClick={() => { navigate('/'); setMobileMenuOpen(false); }}
    className="w-full px-4 py-3 text-sm font-medium text-white bg-[#1A1A1A] hover:bg-[#333] rounded-lg transition-colors"
>
    Upload New File
</button>
```

- [ ] **Step 5: Update the root App div (line 166)**

Find:
```tsx
<div className="min-h-screen bg-slate-950">
```
Replace with:
```tsx
<div className="min-h-screen bg-[#F9FAFB]">
```

- [ ] **Step 6: Verify header renders correctly**

Open http://localhost:5173 — header should be white with the document logo, dark text, black "Upload New File" button.

- [ ] **Step 7: Commit**

```bash
git add frontend/src/App.tsx
git commit -m "feat: apply logo and light theme to app header"
```

---

## Chunk 2: User-facing Page Redesigns

### Task 4: Redesign `TemplateEditor.tsx`

**Files:**
- Modify: `frontend/src/pages/TemplateEditor.tsx`

The editor has three visual states: empty (upload dropzone), loading, and filled (form card). All three need the light theme.

- [ ] **Step 1: Update the upload dropzone**

Find the dropzone `<div>` with `className` containing `border-slate-700`:
```tsx
className={`
    cursor-pointer rounded-2xl border-2 border-dashed p-16 text-center
    transition-all duration-200
    ${isDragActive
        ? 'border-blue-500 bg-blue-500/5'
        : 'border-slate-700 hover:border-slate-600 bg-slate-900/50'
    }
    ${isUploading ? 'opacity-50 pointer-events-none' : ''}
`}
```

Replace with:
```tsx
className={`
    cursor-pointer rounded-2xl border-2 border-dashed p-16 text-center
    transition-all duration-200
    ${isDragActive
        ? 'border-[#FFE033] bg-[#FFFDF0]'
        : 'border-[#D1D5DB] hover:border-[#FFE033] bg-white'
    }
    ${isUploading ? 'opacity-50 pointer-events-none' : ''}
`}
```

Update the icon circle inside the dropzone:
```tsx
<div className="w-16 h-16 rounded-full bg-[#F3F4F6] flex items-center justify-center">
```

Update the text colors inside the dropzone:
- `text-white` → `text-[#111827]`
- `text-slate-400` → `text-[#6B7280]`

Update the loading spinner:
```tsx
<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FFE033] mx-auto mb-4"></div>
<p className="text-[#6B7280]">Loading template...</p>
```

- [ ] **Step 2: Update the form card**

Find the outer card div:
```tsx
<div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
```
Replace with:
```tsx
<div className="card-highlight bg-white rounded-2xl border border-[#E5E7EB] overflow-hidden shadow-sm">
```

Update the card header:
```tsx
<div className="px-8 py-6 border-b border-[#E5E7EB] bg-white">
```

Update text colors in the card header:
- `text-white` (filename) → `text-[#111827]`
- `text-slate-400` (field count) → `text-[#6B7280]`
- `text-blue-400 hover:text-blue-300` (Save to Library) → `text-[#CA8A04] hover:text-[#A16207]`
- `text-slate-400 hover:text-white` (Close) → `text-[#6B7280] hover:text-[#111827]`

Update save status indicator text:
- `text-slate-500` → `text-[#9CA3AF]`

- [ ] **Step 3: Update the error banner**

```tsx
<div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center justify-between">
    <p className="text-red-600 text-sm">{error}</p>
    <button onClick={() => setError(null)} className="text-red-400 hover:text-red-600">✕</button>
</div>
```

- [ ] **Step 4: Update the export/generate section**

Find the export format buttons and generate button at the bottom of the form. Replace any `bg-blue-*` classes on the primary generate button with:
```tsx
className="... bg-[#1A1A1A] hover:bg-[#333] text-white ..."
```

Replace any `border-blue-500` active/selected states on format toggles with `border-[#FFE033]`.

- [ ] **Step 5: Verify the editor page**

Load a `.docx` file in the editor. Confirm:
- Dropzone is white with gray dashed border
- Dragging over it turns the border yellow with `#FFFDF0` tint
- The form card has a 4px yellow top bar
- No blue elements remain

- [ ] **Step 6: Commit**

```bash
git add frontend/src/pages/TemplateEditor.tsx
git commit -m "feat: apply light theme and yellow-bar motif to TemplateEditor"
```

---

### Task 5: Redesign `TemplatesList.tsx`

**Files:**
- Modify: `frontend/src/pages/TemplatesList.tsx`

- [ ] **Step 1: Update page-level colors**

Find the loading spinner:
```tsx
<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
```
Replace with:
```tsx
<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FFE033]"></div>
```

Find the page heading:
```tsx
<h1 className="text-3xl font-bold text-white">My Templates</h1>
```
Replace with:
```tsx
<h1 className="text-3xl font-bold text-[#111827]">My Templates</h1>
```

Find the "Upload New File" / "New Template" button:
```tsx
className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
```
Replace with:
```tsx
className="px-4 py-2 bg-[#1A1A1A] hover:bg-[#333] text-white rounded-lg transition-colors"
```

- [ ] **Step 2: Update template cards**

Find each template card container. It will have dark slate classes like `bg-slate-800`, `bg-slate-900`, `border-slate-700`. Replace with:
```tsx
className="card-highlight bg-white border border-[#E5E7EB] rounded-xl p-6 cursor-pointer hover:shadow-md transition-shadow"
```

Update text colors inside cards:
- Template name: `text-white` → `text-[#111827]`
- Date/metadata: `text-slate-400` → `text-[#6B7280]`
- Delete button: `text-slate-500 hover:text-red-400` → `text-[#9CA3AF] hover:text-red-500`

- [ ] **Step 3: Update empty state**

If there's an empty state message (no templates yet), update its text colors from slate to gray:
- `text-slate-400` → `text-[#6B7280]`
- `text-slate-500` → `text-[#9CA3AF]`

- [ ] **Step 4: Verify templates list**

Navigate to `/templates`. Confirm:
- Page background is light gray
- Each template card has a 4px yellow top bar
- No blue elements remain

- [ ] **Step 5: Commit**

```bash
git add frontend/src/pages/TemplatesList.tsx
git commit -m "feat: apply light theme and yellow-bar motif to TemplatesList"
```

---

### Task 6: Redesign Auth pages (`Auth.tsx`, `ForgotPassword.tsx`, `ResetPassword.tsx`)

**Files:**
- Modify: `frontend/src/pages/Auth.tsx`
- Modify: `frontend/src/pages/ForgotPassword.tsx`
- Modify: `frontend/src/pages/ResetPassword.tsx`

`Auth.tsx` already uses a light background (`bg-gray-50`, `bg-white` card) — the main changes are adding the logo above the form and applying the yellow-bar motif.

- [ ] **Step 1: Update `Auth.tsx` — add logo, update colors**

Add the Logo import at the top:
```tsx
import Logo from '../components/Logo';
```

Find the outer wrapper:
```tsx
<div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
```
Replace `bg-gray-50` with `bg-[#F9FAFB]` (consistent with the rest of the app).

Find the card div:
```tsx
<div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-md">
```
Replace with:
```tsx
<div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-sm border border-[#E5E7EB] card-highlight">
```

Add the Logo above the `<h2>` heading inside the card:
```tsx
<div className="flex justify-center mb-4">
    <Logo size={64} />
</div>
```

Update the heading — find the exact existing class string and update only the text color:

Find: `className="mt-6 text-center text-3xl font-extrabold text-gray-900"`
Replace: `className="mt-6 text-center text-3xl font-extrabold text-[#111827]"`

Update all three input fields — find `focus:ring-blue-500 focus:border-blue-500` (appears on lines 70, 83, 94) and replace each with `focus:ring-[#FFE033] focus:border-[#FFE033]`.

Update the checkbox "Remember my email" (line 110):
Find: `className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"`
Replace: `className="h-4 w-4 text-[#CA8A04] focus:ring-[#FFE033] border-gray-300 rounded"`

Update the "Forgot your password?" button (line 123):
Find: `className="font-medium text-blue-600 hover:text-blue-500"`
Replace: `className="font-medium text-[#CA8A04] hover:text-[#A16207]"`

Update the primary submit button (line 134):
Find: `bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`
Replace: `bg-[#1A1A1A] hover:bg-[#333] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#FFE033]`

Update the "Sign up / Sign in" toggle link (line 142):
Find: `className="text-sm text-blue-600 hover:text-blue-500"`
Replace: `className="text-sm text-[#CA8A04] hover:text-[#A16207]"`

- [ ] **Step 2: Update `ForgotPassword.tsx` — add logo, update colors**

Apply the same pattern:
1. Import `Logo`
2. Outer wrapper background → `bg-[#F9FAFB]`
3. Card → add `card-highlight border border-[#E5E7EB]`
4. Logo at 64px above the heading
5. Input focus → yellow
6. Submit button → `bg-[#1A1A1A]`
7. Back link → `text-[#CA8A04]`

- [ ] **Step 3: Update `ResetPassword.tsx` — add logo, update colors**

Apply the same pattern as ForgotPassword.tsx above.

- [ ] **Step 4: Verify all auth pages**

Navigate to `/auth`, `/forgot-password`, `/reset-password`. Confirm:
- Logo appears at 64px above each form card
- Card has 4px yellow top bar
- Input focus ring is yellow
- Submit button is black
- No blue elements remain

- [ ] **Step 5: Commit**

```bash
git add frontend/src/pages/Auth.tsx frontend/src/pages/ForgotPassword.tsx \
        frontend/src/pages/ResetPassword.tsx
git commit -m "feat: add logo and light theme to auth pages"
```

---

### Task 7: Redesign `Upgrade.tsx`

**Files:**
- Modify: `frontend/src/pages/Upgrade.tsx`

- [ ] **Step 1: Read the current file**

```bash
cat frontend/src/pages/Upgrade.tsx
```

Note all dark slate colors and blue CTA classes before making changes.

- [ ] **Step 2: Update page background and hero section**

Add Logo import:
```tsx
import Logo from '../components/Logo';
```

Update the page wrapper background from `bg-slate-950` / `bg-slate-900` to `bg-[#F9FAFB]`.

In the hero section, add the Logo at 128px above the headline:
```tsx
<div className="flex justify-center mb-6">
    <Logo size={128} />
</div>
```

Update hero headline and subtext colors:
- `text-white` → `text-[#111827]`
- `text-slate-400` / `text-slate-300` → `text-[#6B7280]`

- [ ] **Step 3: Update pricing cards**

Replace each pricing card's dark background with the light theme + yellow-bar motif:
```tsx
className="card-highlight bg-white border border-[#E5E7EB] rounded-2xl p-8 shadow-sm"
```

Update card text:
- Plan name: `text-white` → `text-[#111827]`
- Price: `text-white` → `text-[#111827]`
- Feature list items: `text-slate-300` → `text-[#374151]`
- Checkmark icons: replace `text-blue-400` with `text-[#CA8A04]`

- [ ] **Step 4: Update CTA buttons**

Primary upgrade button: `bg-blue-600 hover:bg-blue-500` → `bg-[#FFE033] hover:bg-[#F5D800] text-[#1A1A1A]` (yellow button with black text — the hero CTA).

Secondary / free plan button: `bg-slate-800` → `bg-white border border-[#E5E7EB] text-[#374151] hover:border-[#FFE033]`.

- [ ] **Step 5: Verify upgrade page**

Navigate to `/upgrade`. Confirm:
- Logo at 128px in hero
- Pricing cards have yellow top bars
- Primary CTA is yellow with dark text
- No blue elements remain

- [ ] **Step 6: Commit**

```bash
git add frontend/src/pages/Upgrade.tsx
git commit -m "feat: apply logo hero and light theme to Upgrade page"
```

---

## Chunk 3: Backend Watermark Replacement

### Task 8: Replace diagonal VML watermark with footer stamp

**Files:**
- Modify: `backend/app/services/watermark.py`

The current `watermark.py` injects a diagonal "Made with HighlightEdit" VML shape into the document header. We replace this with a footer paragraph at the end of the document body.

The function signature `add_watermark(doc)` stays the same so `templates.py` needs no changes.

- [ ] **Step 1: Write the failing test**

Create `backend/tests/test_watermark.py`:

```python
"""Tests for the footer watermark implementation."""
import io
import pytest
from docx import Document
from docx.shared import Pt
from app.services.watermark import add_watermark


def make_simple_doc() -> Document:
    """Create a minimal Document with one paragraph of content."""
    doc = Document()
    doc.add_paragraph("This is the document content.")
    return doc


def test_watermark_adds_footer_paragraph():
    """The last paragraph of the document should contain the watermark text."""
    doc = make_simple_doc()
    add_watermark(doc)
    # The footer paragraph is the last paragraph
    last_para = doc.paragraphs[-1]
    full_text = "".join(run.text for run in last_para.runs)
    assert "HighlightEdit" in full_text
    assert "Free Plan" in full_text


def test_watermark_does_not_use_header():
    """The document header should NOT contain VML watermark shapes after the rewrite."""
    doc = make_simple_doc()
    add_watermark(doc)
    for section in doc.sections:
        header_xml = section.header._element.xml
        # "PowerPlusWaterMarkObject" is the literal id embedded in the old VML XML template.
        # It is a plain attribute string — unambiguous regardless of how lxml serializes namespaces.
        assert "PowerPlusWaterMarkObject" not in header_xml, \
            "VML watermark shape found in header — old watermark not removed"


def test_original_content_preserved():
    """The original document content should still be present after watermarking."""
    doc = make_simple_doc()
    add_watermark(doc)
    texts = [p.text for p in doc.paragraphs]
    assert any("document content" in t for t in texts)
```

- [ ] **Step 2: Run the tests to verify they fail**

```bash
cd /Users/nyanyk/Antigravity/HighlightEdit/backend
source venv/bin/activate
pytest tests/test_watermark.py -v
```

Expected output: `test_watermark_does_not_use_header` FAILS (current impl adds VML to header). The other two tests may also fail depending on current impl.

- [ ] **Step 3: Prepare the logo PNG for embedding in DOCX**

The footer embeds a 16×16 PNG logo inline. The implementation silently skips the image if `backend/app/static/logo.png` does not exist (text-only footer). This step produces that PNG.

```bash
mkdir -p /Users/nyanyk/Antigravity/HighlightEdit/backend/app/static

# Try rsvg-convert first (part of librsvg — install with: brew install librsvg)
if command -v rsvg-convert &>/dev/null; then
    rsvg-convert -w 16 -h 16 \
        /Users/nyanyk/Antigravity/HighlightEdit/docs/logo-option-1.svg \
        -o /Users/nyanyk/Antigravity/HighlightEdit/backend/app/static/logo.png
    echo "logo.png generated with rsvg-convert"
# Fallback: Inkscape
elif command -v inkscape &>/dev/null; then
    inkscape -w 16 -h 16 \
        /Users/nyanyk/Antigravity/HighlightEdit/docs/logo-option-1.svg \
        -o /Users/nyanyk/Antigravity/HighlightEdit/backend/app/static/logo.png
    echo "logo.png generated with Inkscape"
else
    echo "WARNING: No SVG→PNG converter found (install librsvg: brew install librsvg)."
    echo "The footer watermark will be text-only until logo.png is provided."
    echo "Place a 16×16 PNG at backend/app/static/logo.png to enable the logo image."
fi
```

Verify the PNG was created:
```bash
ls -la /Users/nyanyk/Antigravity/HighlightEdit/backend/app/static/
```
Expected: `logo.png` present at ~1KB. If it is absent, the footer will still work as text-only — continue to Step 4.

- [ ] **Step 4: Rewrite `backend/app/services/watermark.py`**

Replace the entire file contents:

```python
"""
Watermark service for HighlightEdit.

Adds a branded footer paragraph to DOCX documents for free-tier users.
The footer appears at the end of the document body (not in the Word header),
so it survives DOCX → PDF conversion via Adobe PDF Services.
"""
import os
from pathlib import Path
from docx import Document
from docx.shared import Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.oxml.ns import qn
from docx.oxml import OxmlElement

# Path to the logo PNG for inline embedding (optional — text-only fallback if absent)
_STATIC_DIR = Path(__file__).parent.parent / "static"
_LOGO_PNG = _STATIC_DIR / "logo.png"


def add_watermark(doc: Document, text: str = "Made with HighlightEdit") -> Document:
    """
    Append a branded footer paragraph to the document.

    Replaces the previous diagonal VML header watermark.
    The footer is added to the document body so it appears in both
    DOCX and PDF (via Adobe PDF Services DOCX→PDF conversion).

    Args:
        doc: python-docx Document object (modified in place)
        text: unused, kept for backwards-compatible signature

    Returns:
        The modified Document object.
    """
    # Add a thin horizontal rule to visually separate footer from content
    _add_horizontal_rule(doc)

    # Add the footer paragraph
    footer_para = doc.add_paragraph()
    footer_para.alignment = WD_ALIGN_PARAGRAPH.LEFT
    footer_para.paragraph_format.space_before = Pt(4)
    footer_para.paragraph_format.space_after = Pt(0)

    # Optionally embed the logo as a small inline image
    if _LOGO_PNG.exists():
        try:
            run = footer_para.add_run()
            run.add_picture(str(_LOGO_PNG), width=Pt(10))
            # Add a space after the image
            run = footer_para.add_run("  ")
        except Exception:
            pass  # Logo image failed — continue with text-only footer

    # "Created with " in light gray
    run_prefix = footer_para.add_run("Created with ")
    run_prefix.font.size = Pt(9)
    run_prefix.font.color.rgb = RGBColor(107, 114, 128)  # #6B7280

    # "HighlightEdit" bold, slightly darker
    run_brand = footer_para.add_run("HighlightEdit")
    run_brand.font.size = Pt(9)
    run_brand.font.bold = True
    run_brand.font.color.rgb = RGBColor(55, 65, 81)  # #374151

    # " · Free Plan · highlightedit.com" in light gray
    run_suffix = footer_para.add_run(" \u00b7 Free Plan \u00b7 highlightedit.com")
    run_suffix.font.size = Pt(9)
    run_suffix.font.color.rgb = RGBColor(107, 114, 128)  # #6B7280

    return doc


def _add_horizontal_rule(doc: Document) -> None:
    """Append a paragraph containing a horizontal rule (Word bottom border)."""
    rule_para = doc.add_paragraph()
    rule_para.paragraph_format.space_before = Pt(12)
    rule_para.paragraph_format.space_after = Pt(0)

    # Add a bottom border to the paragraph — this renders as an HR in Word/PDF
    pPr = rule_para._p.get_or_add_pPr()
    pBdr = OxmlElement("w:pBdr")
    bottom = OxmlElement("w:bottom")
    bottom.set(qn("w:val"), "single")
    bottom.set(qn("w:sz"), "6")
    bottom.set(qn("w:space"), "1")
    bottom.set(qn("w:color"), "E5E7EB")
    pBdr.append(bottom)
    pPr.append(pBdr)
```

- [ ] **Step 5: Run the tests to verify they pass**

```bash
pytest tests/test_watermark.py -v
```

Expected output:
```
tests/test_watermark.py::test_watermark_adds_footer_paragraph PASSED
tests/test_watermark.py::test_watermark_does_not_use_header PASSED
tests/test_watermark.py::test_original_content_preserved PASSED
```

- [ ] **Step 6: Run the full backend test suite to check for regressions**

```bash
pytest --tb=short
```

Expected: all existing tests still pass.

- [ ] **Step 7: Manual end-to-end test**

1. Start the app: `./start_app.sh`
2. Log in with a **free** account (or log out to use unauthenticated)
3. Upload a `.docx` file, fill in a field, export as DOCX
4. Open the downloaded DOCX — confirm footer paragraph is present, no diagonal watermark
5. Export as PDF — open the PDF and confirm the footer text appears on the page
6. To test the no-watermark Pro path, set a test user to paid in the SQLite DB:
   ```bash
   cd /Users/nyanyk/Antigravity/HighlightEdit/backend
   sqlite3 sql_app.db "UPDATE users SET is_paid = 1 WHERE email = 'your@email.com';"
   ```
7. Log in with that account, export — confirm no watermark of any kind
8. Reset the test user afterwards:
   ```bash
   sqlite3 sql_app.db "UPDATE users SET is_paid = 0 WHERE email = 'your@email.com';"
   ```

- [ ] **Step 8: Commit**

```bash
git add backend/app/services/watermark.py backend/tests/test_watermark.py \
        backend/app/static/
git commit -m "feat: replace diagonal VML watermark with branded footer stamp"
```

---

## Final Verification

- [ ] Run the blue-class audit to confirm no user-facing blue remains:

```bash
grep -rn "blue-\|indigo-" frontend/src/pages/TemplateEditor.tsx \
  frontend/src/pages/TemplatesList.tsx \
  frontend/src/pages/Auth.tsx \
  frontend/src/pages/ForgotPassword.tsx \
  frontend/src/pages/ResetPassword.tsx \
  frontend/src/pages/Upgrade.tsx \
  frontend/src/App.tsx
```

Expected: zero matches (or only matches inside comments).

- [ ] Confirm Admin and Analytics pages are unchanged:

```bash
# These should still have dark slate classes — no changes expected
grep -c "slate-9" frontend/src/pages/Admin.tsx frontend/src/pages/Analytics.tsx
```

Expected: non-zero counts on both files.

- [ ] Final commit tagging the redesign complete:

```bash
git add -A
git commit -m "feat: complete logo integration and light theme UI redesign"
```
