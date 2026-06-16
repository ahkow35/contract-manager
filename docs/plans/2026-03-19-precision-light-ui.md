# Precision Light UI Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Apply the "Precision Light" design system (Linear-inspired) consistently across every page and component, with full mobile responsiveness and expanded use-case / how-it-works content.

**Architecture:** Single design token layer in `index.css`, shared `FormField` component for all auth inputs, and migrating `DynamicFormGenerator` + `FileUploader` (currently dark-themed / CSS-file-based) to the unified Tailwind design system. New `UseCasesSection` component added to the editor landing state.

**Tech Stack:** React 18, TypeScript, TailwindCSS (JIT), react-hook-form, react-icons/fa (already installed), react-router-dom

---

## Critical Issues Discovered (read before starting)

| File | Problem |
|------|---------|
| `DynamicFormGenerator.tsx` | Entirely dark (`bg-slate-900`, blue gradient header). Emoji icons throughout. Completely off-brand. |
| `FileUploader/FileUploader.tsx` | Uses `FileUploader.css` (plain CSS) not Tailwind. Emoji icon (📄). |
| `UsageIndicator.tsx` | Dark slate theme (`bg-slate-800`). Emoji (📊). |
| `Auth.tsx` | `-space-y-px` Bootstrap stacked inputs. No field labels. |
| `ForgotPassword.tsx` / `ResetPassword.tsx` | Placeholder-only inputs. Bootstrap-era `appearance-none rounded relative`. |
| `InstructionsEmptyState.tsx` | Uses `react-icons/fa` — third icon library inconsistency. |
| `Upgrade.tsx` | Both pricing cards look identical. Pro card not visually dominant. Uses `alert()`. |

---

## File Map

### Modified files
| File | What changes |
|------|-------------|
| `frontend/src/index.css` | Add consolidated design tokens, mobile utility classes, remove/replace existing variables |
| `frontend/src/App.tsx` | Header: active nav states, user avatar pill, mobile hamburger menu |
| `frontend/src/components/FileUploader/FileUploader.tsx` | Migrate from CSS file to Tailwind; replace emoji with SVG; add upload progress state |
| `frontend/src/components/FileUploader/FileUploader.css` | Delete (migrated to Tailwind) |
| `frontend/src/components/DynamicFormGenerator/DynamicFormGenerator.tsx` | Full rebrand: light theme, yellow accents, SVG icons, progress bar recolored, action bar mobile layout |
| `frontend/src/components/UsageIndicator.tsx` | Light theme rebrand, replace emoji with SVG |
| `frontend/src/components/InstructionsEmptyState.tsx` | Keep react-icons/fa (already installed), add use-case callout below steps |
| `frontend/src/components/FieldRow/FieldRow.tsx` | Minor: add `tracking-tight` to label, sharpen border radius |
| `frontend/src/pages/TemplateEditor.tsx` | Add `UseCasesSection` below `InstructionsEmptyState`; replace emoji in save/generate buttons |
| `frontend/src/pages/TemplatesList.tsx` | Skeleton loading, empty state icon + benefit copy, card hover action row |
| `frontend/src/pages/Auth.tsx` | Separate labeled fields; remove `-space-y-px`; mobile-friendly card padding |
| `frontend/src/pages/ForgotPassword.tsx` | Labeled field; consistent input classes |
| `frontend/src/pages/ResetPassword.tsx` | Labeled fields; consistent input classes |
| `frontend/src/pages/Upgrade.tsx` | Dark Pro card; "Recommended" badge; inline success state (remove `alert()`); mobile: Pro card first |

### Created files
| File | Purpose |
|------|---------|
| `frontend/src/components/UseCasesSection.tsx` | Grid of use-case cards (HR, Legal, Operations, Finance) with short copy |
| `frontend/src/components/MobileNav.tsx` | Slide-in mobile nav drawer for the header |
| `frontend/src/components/Toast.tsx` | Inline toast notification (replaces `alert()` in Upgrade page) |

---

## Design Token Reference

These are the values used in every task below. Treat them as the source of truth.

```
Background:   #FAFAFA
Surface:      #FFFFFF
Border:       #E4E4E7
Text primary: #09090B
Text second:  #71717A
Accent:       #FFE033
Accent dark:  #CA8A04
CTA bg:       #18181B
CTA text:     #FFFFFF
Focus ring:   rgba(255,224,51,0.4)
Error:        #EF4444
Radius sm:    6px   (rounded-md)
Radius base:  8px   (rounded-lg)
Radius lg:    12px  (rounded-xl)
Font:         Inter (existing)
```

**Input class (use on every `<input>`):**
```
w-full px-4 py-3 bg-white border border-[#E4E4E7] rounded-lg
text-[#09090B] text-sm placeholder:text-[#71717A]
focus:outline-none focus:ring-2 focus:ring-[#FFE033]/40 focus:border-[#CA8A04]
hover:border-[#CA8A04] transition-all duration-150
```

**Label class (use on every `<label>`):**
```
block text-sm font-medium text-[#09090B] mb-1.5 tracking-tight
```

**Primary button class:**
```
px-4 py-2.5 bg-[#18181B] hover:bg-[#27272A] text-white text-sm font-medium
rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-[#FFE033]/40
```

**SVG icon reference (use these everywhere instead of emoji):**
```tsx
// Document
<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
</svg>

// Download/Export
<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
</svg>

// Save
<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
</svg>

// Spinner (loading)
<svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
</svg>

// Check
<svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414L8.414 15l-4.121-4.121a1 1 0 011.414-1.414L8.414 12.172l7.879-7.879a1 1 0 011.414 0z" clipRule="evenodd" />
</svg>

// Usage/Chart bar
<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
</svg>

// Menu (hamburger)
<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h16" />
</svg>

// Close (X)
<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
</svg>
```

---

## Task 1: Design System Tokens

**Files:**
- Modify: `frontend/src/index.css`

- [ ] **Step 1.1: Update CSS custom properties**

Replace the existing `:root` block in `index.css` with:
```css
:root {
  --color-bg: #FAFAFA;
  --color-surface: #FFFFFF;
  --color-border: #E4E4E7;
  --color-text-primary: #09090B;
  --color-text-secondary: #71717A;
  --color-accent: #FFE033;
  --color-accent-dark: #CA8A04;
  --color-cta: #18181B;
  --color-cta-hover: #27272A;
  --color-error: #EF4444;
  --color-error-bg: #FEF2F2;
  --color-success: #16A34A;
  --color-success-bg: #F0FDF4;
  --radius-sm: 6px;
  --radius-base: 8px;
  --radius-lg: 12px;
}
```

- [ ] **Step 1.2: Update `.card-highlight` and add shared utility classes**

After the `:root` block, ensure these classes exist:
```css
/* Brand card treatment — 4px yellow top border */
.card-highlight {
  border-top: 4px solid var(--color-accent) !important;
}

/* Skeleton shimmer animation */
@keyframes shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}
.skeleton {
  background: linear-gradient(90deg, #E4E4E7 25%, #F4F4F5 50%, #E4E4E7 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
  border-radius: var(--radius-base);
}

/* Fade in animation */
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}
.animate-fade-in {
  animation: fadeIn 0.2s ease-out forwards;
}
```

- [ ] **Step 1.3: Verify body background uses token**

```css
body {
  background-color: var(--color-bg);
  color: var(--color-text-primary);
  font-family: 'Inter', system-ui, sans-serif;
  -webkit-font-smoothing: antialiased;
}
```

- [ ] **Step 1.4: Commit**
```bash
git add frontend/src/index.css
git commit -m "style: update design tokens to Precision Light system"
```

---

## Task 2: Toast Component (needed before Upgrade page)

**Files:**
- Create: `frontend/src/components/Toast.tsx`

- [ ] **Step 2.1: Create Toast component**

```tsx
import { useEffect, useState } from 'react';

interface ToastProps {
  message: string;
  type: 'success' | 'error';
  onDismiss: () => void;
}

export default function Toast({ message, type, onDismiss }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(onDismiss, 4000);
    return () => clearTimeout(timer);
  }, [onDismiss]);

  const bg = type === 'success' ? 'bg-[#F0FDF4] border-[#BBF7D0]' : 'bg-[#FEF2F2] border-[#FECACA]';
  const text = type === 'success' ? 'text-[#16A34A]' : 'text-[#EF4444]';

  return (
    <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-lg border shadow-lg ${bg} animate-fade-in max-w-sm`}>
      <span className={`text-sm font-medium ${text}`}>{message}</span>
      <button onClick={onDismiss} className={`ml-auto ${text} hover:opacity-70`} aria-label="Dismiss">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}
```

- [ ] **Step 2.2: Commit**
```bash
git add frontend/src/components/Toast.tsx
git commit -m "feat: add Toast component to replace alert() dialogs"
```

---

## Task 3: MobileNav Component

**Files:**
- Create: `frontend/src/components/MobileNav.tsx`

- [ ] **Step 3.1: Create MobileNav**

```tsx
import { Link, useLocation } from 'react-router-dom';

interface MobileNavProps {
  isOpen: boolean;
  onClose: () => void;
  isLoggedIn: boolean;
  userEmail?: string;
  onLogout: () => void;
}

export default function MobileNav({ isOpen, onClose, isLoggedIn, userEmail, onLogout }: MobileNavProps) {
  const location = useLocation();

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="fixed top-0 right-0 z-50 h-full w-64 bg-white shadow-xl border-l border-[#E4E4E7] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#E4E4E7]">
          <span className="text-sm font-semibold text-[#09090B] tracking-tight">Menu</span>
          <button onClick={onClose} className="text-[#71717A] hover:text-[#09090B]">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Nav items */}
        <nav className="flex-1 px-4 py-6 space-y-1">
          {isLoggedIn && (
            <Link
              to="/templates"
              onClick={onClose}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${
                location.pathname === '/templates'
                  ? 'bg-[#FAFAFA] text-[#09090B] border-l-2 border-[#FFE033] pl-[10px]'
                  : 'text-[#71717A] hover:text-[#09090B] hover:bg-[#FAFAFA]'
              }`}
            >
              My Templates
            </Link>
          )}
          <Link
            to="/"
            onClick={onClose}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${
              location.pathname === '/'
                ? 'bg-[#FAFAFA] text-[#09090B] border-l-2 border-[#FFE033] pl-[10px]'
                : 'text-[#71717A] hover:text-[#09090B] hover:bg-[#FAFAFA]'
            }`}
          >
            Upload New File
          </Link>
        </nav>

        {/* Auth section at bottom */}
        <div className="px-4 py-5 border-t border-[#E4E4E7]">
          {isLoggedIn ? (
            <div className="space-y-3">
              {userEmail && (
                <p className="text-xs text-[#71717A] truncate px-1">{userEmail}</p>
              )}
              <button
                onClick={() => { onLogout(); onClose(); }}
                className="w-full px-4 py-2.5 text-sm font-medium text-[#71717A] hover:text-[#09090B] hover:bg-[#FAFAFA] rounded-md transition-colors text-left"
              >
                Sign out
              </button>
            </div>
          ) : (
            <Link
              to="/auth"
              onClick={onClose}
              className="block w-full px-4 py-2.5 bg-[#18181B] hover:bg-[#27272A] text-white text-sm font-medium rounded-md text-center transition-colors"
            >
              Sign In
            </Link>
          )}
        </div>
      </div>
    </>
  );
}
```

- [ ] **Step 3.2: Commit**
```bash
git add frontend/src/components/MobileNav.tsx
git commit -m "feat: add MobileNav drawer component"
```

---

## Task 4: Header (App.tsx) — Active States, User Avatar, Mobile Nav

**Files:**
- Modify: `frontend/src/App.tsx`

- [ ] **Step 4.1: Add imports and mobile state to App.tsx**

At the top of `App.tsx`, add:
```tsx
import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import MobileNav from './components/MobileNav';
```

Inside the Header component (or App function), add:
```tsx
const [mobileNavOpen, setMobileNavOpen] = useState(false);
const location = useLocation();
const isActive = (path: string) => location.pathname === path;
```

- [ ] **Step 4.2: Replace the Header JSX**

Full replacement for the header element. Key changes:
- Active nav link: `border-b-2 border-[#FFE033] text-[#09090B]` vs inactive `text-[#71717A]`
- User avatar pill replaces raw email text
- Hamburger button on mobile (`md:hidden`)
- Desktop nav hidden on mobile (`hidden md:flex`)

```tsx
<header className="sticky top-0 z-30 bg-white border-b border-[#E4E4E7]">
  <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">

    {/* Logo */}
    <Link to="/" className="flex items-center gap-2 flex-shrink-0">
      <Logo size={28} />
      <span className="text-sm font-semibold text-[#09090B] tracking-tight">
        Highlight<span className="text-[#CA8A04]">Edit</span>
      </span>
    </Link>

    {/* Desktop nav */}
    <nav className="hidden md:flex items-center gap-6">
      {user && (
        <Link
          to="/templates"
          className={`text-sm font-medium pb-0.5 transition-colors ${
            isActive('/templates')
              ? 'text-[#09090B] border-b-2 border-[#FFE033]'
              : 'text-[#71717A] hover:text-[#09090B]'
          }`}
        >
          My Templates
        </Link>
      )}
    </nav>

    {/* Desktop right actions */}
    <div className="hidden md:flex items-center gap-3">
      {user ? (
        <>
          {/* User avatar */}
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-[#FFE033] flex items-center justify-center flex-shrink-0">
              <span className="text-xs font-bold text-[#09090B]">
                {user.email?.[0]?.toUpperCase() ?? 'U'}
              </span>
            </div>
            <button
              onClick={logout}
              className="text-sm text-[#71717A] hover:text-[#09090B] transition-colors"
            >
              Sign out
            </button>
          </div>
          <Link
            to="/"
            className="px-3 py-2 bg-[#18181B] hover:bg-[#27272A] text-white text-sm font-medium rounded-md transition-colors"
          >
            Upload New File
          </Link>
        </>
      ) : (
        <Link
          to="/auth"
          className="px-3 py-2 bg-[#18181B] hover:bg-[#27272A] text-white text-sm font-medium rounded-md transition-colors"
        >
          Sign In
        </Link>
      )}
    </div>

    {/* Mobile: hamburger */}
    <button
      className="md:hidden p-2 text-[#71717A] hover:text-[#09090B] transition-colors"
      onClick={() => setMobileNavOpen(true)}
      aria-label="Open menu"
    >
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h16" />
      </svg>
    </button>
  </div>

  <MobileNav
    isOpen={mobileNavOpen}
    onClose={() => setMobileNavOpen(false)}
    isLoggedIn={!!user}
    userEmail={user?.email}
    onLogout={logout}
  />
</header>
```

- [ ] **Step 4.3: Verify `logout` function is available in scope** — check that the `useAuth()` hook exposes a `logout` function and import it.

- [ ] **Step 4.4: Commit**
```bash
git add frontend/src/App.tsx frontend/src/components/MobileNav.tsx
git commit -m "feat: header active nav states, user avatar, mobile hamburger menu"
```

---

## Task 5: FileUploader — Migrate CSS → Tailwind, Replace Emoji

**Files:**
- Modify: `frontend/src/components/FileUploader/FileUploader.tsx`
- Delete: `frontend/src/components/FileUploader/FileUploader.css`

- [ ] **Step 5.1: Remove the CSS import** from `FileUploader.tsx`:
```tsx
// DELETE this line:
import './FileUploader.css';
```

- [ ] **Step 5.2: Replace the dropzone JSX** with Tailwind equivalent:

```tsx
{!templateState && (
  <div
    {...getRootProps()}
    className={`
      relative flex flex-col items-center justify-center gap-3
      border-2 border-dashed rounded-xl p-10 sm:p-16 cursor-pointer
      transition-all duration-150
      ${isDragActive
        ? 'border-[#CA8A04] bg-[#FFFDF0]'
        : 'border-[#E4E4E7] bg-white hover:border-[#CA8A04] hover:bg-[#FAFAFA]'
      }
      ${isUploading ? 'pointer-events-none opacity-70' : ''}
    `}
  >
    <input {...getInputProps()} />

    {/* Icon */}
    <div className={`w-14 h-14 rounded-xl flex items-center justify-center transition-colors ${isDragActive ? 'bg-[#FFE033]' : 'bg-[#F4F4F5]'}`}>
      {isUploading ? (
        <svg className="w-7 h-7 animate-spin text-[#CA8A04]" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
        </svg>
      ) : (
        <svg className={`w-7 h-7 ${isDragActive ? 'text-[#09090B]' : 'text-[#71717A]'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
        </svg>
      )}
    </div>

    {/* Text */}
    <div className="text-center">
      {isUploading ? (
        <p className="text-sm font-medium text-[#09090B]">Processing document…</p>
      ) : isDragActive ? (
        <p className="text-sm font-medium text-[#CA8A04]">Drop it here</p>
      ) : (
        <>
          <p className="text-sm font-semibold text-[#09090B] tracking-tight">
            Drag & drop your .docx here
          </p>
          <p className="text-xs text-[#71717A] mt-1">or click to browse files</p>
          <p className="text-xs text-[#71717A] mt-3 px-4">
            Word documents (.docx) with{' '}
            <span className="bg-[#FFE033] px-1 rounded text-[#09090B] font-medium">yellow highlights</span>{' '}
            become smart forms instantly
          </p>
        </>
      )}
    </div>
  </div>
)}
```

- [ ] **Step 5.3: Replace the template-loaded header** (after upload, showing filename + "Upload Different File"):

```tsx
{templateState && (
  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6 pb-6 border-b border-[#E4E4E7]">
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 bg-[#FFFDF0] rounded-lg flex items-center justify-center flex-shrink-0">
        <svg className="w-5 h-5 text-[#CA8A04]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      </div>
      <div>
        <p className="text-sm font-semibold text-[#09090B] tracking-tight truncate max-w-xs">
          {templateState.original_file_path}
        </p>
        <p className="text-xs text-[#71717A]">
          {templateState.fields.length} field{templateState.fields.length !== 1 ? 's' : ''} detected
        </p>
      </div>
    </div>
    <button
      onClick={handleReset}
      className="text-sm text-[#71717A] hover:text-[#09090B] transition-colors flex items-center gap-1.5 self-start sm:self-auto"
    >
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19l-7-7 7-7" />
      </svg>
      Upload different file
    </button>
  </div>
)}
```

- [ ] **Step 5.4: Replace the error message div**:

```tsx
{error && (
  <div className="mt-4 flex items-start gap-3 px-4 py-3 bg-[#FEF2F2] border border-[#FECACA] rounded-lg">
    <svg className="w-4 h-4 text-[#EF4444] flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
    </svg>
    <p className="text-sm text-[#EF4444] flex-1">{error}</p>
    <button onClick={() => setError(null)} className="text-[#EF4444] hover:opacity-70 flex-shrink-0">
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
      </svg>
    </button>
  </div>
)}
```

- [ ] **Step 5.5: Replace "No fields found" empty state**:

```tsx
{templateState && templateState.fields.length === 0 && (
  <div className="text-center py-16">
    <div className="w-16 h-16 bg-[#FEF9C3] rounded-2xl flex items-center justify-center mx-auto mb-4">
      <svg className="w-8 h-8 text-[#CA8A04]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
    </div>
    <h3 className="text-base font-semibold text-[#09090B] tracking-tight mb-1">No highlighted fields found</h3>
    <p className="text-sm text-[#71717A] max-w-xs mx-auto mb-6">
      The document was processed but no yellow-highlighted text was detected. Make sure fields are highlighted in yellow in your Word document.
    </p>
    <button
      onClick={handleReset}
      className="px-4 py-2.5 bg-[#18181B] hover:bg-[#27272A] text-white text-sm font-medium rounded-md transition-colors"
    >
      Try another file
    </button>
  </div>
)}
```

- [ ] **Step 5.6: Delete FileUploader.css**
```bash
rm frontend/src/components/FileUploader/FileUploader.css
```

- [ ] **Step 5.7: Commit**
```bash
git add frontend/src/components/FileUploader/
git commit -m "style: migrate FileUploader from CSS to Tailwind, replace emoji with SVG"
```

---

## Task 6: DynamicFormGenerator — Full Rebrand (Most Critical)

**Files:**
- Modify: `frontend/src/components/DynamicFormGenerator/DynamicFormGenerator.tsx`

This component is entirely dark-themed and uses emoji throughout. It needs a complete visual rewrite while keeping all logic intact.

- [ ] **Step 6.1: Replace the outer container and header**

```tsx
// OLD: dark slate container + blue gradient header
// NEW: white card with yellow top border
<div className={clsx('bg-white border border-[#E4E4E7] rounded-xl overflow-hidden card-highlight', className)}>

  {/* Header */}
  <div className="px-6 py-4 border-b border-[#E4E4E7] bg-[#FAFAFA]">
    <div className="flex items-center justify-between">
      <div>
        <h2 className="text-base font-semibold text-[#09090B] tracking-tight flex items-center gap-2">
          <svg className="w-5 h-5 text-[#CA8A04]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Fill in Document Fields
        </h2>
        <p className="text-xs text-[#71717A] mt-0.5">
          {fields.length} field{fields.length !== 1 ? 's' : ''} detected
        </p>
      </div>
    </div>
  </div>
```

- [ ] **Step 6.2: Replace each field card** (the `fields.map` block)

```tsx
{fields.map((field, index) => (
  <div
    key={field.id}
    className="animate-fade-in bg-white border border-[#E4E4E7] rounded-lg p-4 hover:border-[#CA8A04] transition-all duration-150 focus-within:border-[#CA8A04] focus-within:ring-1 focus-within:ring-[#FFE033]/40"
    style={{ animationDelay: `${index * 40}ms` }}
  >
    {/* Field label row */}
    <div className="flex items-center justify-between mb-2">
      <label
        htmlFor={`field_${field.id}`}
        className="text-sm font-medium text-[#09090B] tracking-tight"
      >
        {field.original_text}
      </label>
      <span className="text-xs px-2 py-0.5 bg-[#F4F4F5] text-[#71717A] rounded-full uppercase tracking-wider font-medium">
        {field.type}
      </span>
    </div>

    {/* Original text context */}
    <div className="mb-3 px-3 py-2 bg-[#FFFDF0] border border-[#FFE033]/30 rounded-md">
      <span className="text-xs text-[#71717A] uppercase tracking-wide block mb-0.5">Replace</span>
      <p className="text-sm text-[#CA8A04] font-medium break-words">"{field.original_text}"</p>
    </div>

    {/* Input */}
    <input
      type={getInputType(field.type)}
      id={`field_${field.id}`}
      placeholder={`Enter value…`}
      {...register(`field_${field.id}`, { required: 'This field is required' })}
      className={clsx(
        'w-full px-4 py-3 bg-white border rounded-lg text-sm text-[#09090B] placeholder:text-[#71717A]',
        'focus:outline-none focus:ring-2 focus:ring-[#FFE033]/40 focus:border-[#CA8A04]',
        'hover:border-[#CA8A04] transition-all duration-150',
        errors[`field_${field.id}`] ? 'border-[#EF4444]' : 'border-[#E4E4E7]'
      )}
    />

    {/* Error */}
    {errors[`field_${field.id}`] && (
      <p className="mt-1.5 text-xs text-[#EF4444]">
        {errors[`field_${field.id}`]?.message}
      </p>
    )}

    {/* Location badge */}
    {(field.page || field.paragraph) && (
      <p className="mt-1.5 text-xs text-[#71717A]">
        {field.page && `Page ${field.page}`}
        {field.page && field.paragraph && ' · '}
        {field.paragraph && `¶${field.paragraph}`}
      </p>
    )}
  </div>
))}
```

- [ ] **Step 6.3: Replace the empty state** (no fields):

```tsx
{fields.length === 0 && (
  <div className="text-center py-16 px-6">
    <div className="w-14 h-14 bg-[#F4F4F5] rounded-xl flex items-center justify-center mx-auto mb-4">
      <svg className="w-7 h-7 text-[#71717A]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    </div>
    <h3 className="text-base font-semibold text-[#09090B] tracking-tight mb-1">No fields detected</h3>
    <p className="text-sm text-[#71717A]">Upload a document with yellow highlighted text to get started.</p>
  </div>
)}
```

- [ ] **Step 6.4: Replace the action bar** (format toggle + generate button):

```tsx
{fields.length > 0 && (
  <div className="flex flex-col gap-3 pt-4 border-t border-[#E4E4E7]">
    {/* Format toggle */}
    <div className="flex items-center gap-2">
      <span className="text-xs text-[#71717A] font-medium">Format:</span>
      <div className="flex bg-[#F4F4F5] rounded-md p-0.5 border border-[#E4E4E7]">
        <button
          type="button"
          onClick={() => setOutputFormat('docx')}
          className={clsx(
            'px-3 py-1.5 rounded text-xs font-semibold transition-all',
            outputFormat === 'docx'
              ? 'bg-white text-[#09090B] shadow-sm border border-[#E4E4E7]'
              : 'text-[#71717A] hover:text-[#09090B]'
          )}
        >
          Word (.docx)
        </button>
        <button
          type="button"
          onClick={() => setOutputFormat('pdf')}
          className={clsx(
            'px-3 py-1.5 rounded text-xs font-semibold transition-all',
            outputFormat === 'pdf'
              ? 'bg-white text-[#09090B] shadow-sm border border-[#E4E4E7]'
              : 'text-[#71717A] hover:text-[#09090B]'
          )}
        >
          PDF (.pdf)
        </button>
      </div>
    </div>

    {/* Filename input */}
    <div>
      <label className="block text-xs font-medium text-[#71717A] mb-1">Filename</label>
      <input
        type="text"
        value={customFilename}
        onChange={(e) => setCustomFilename(e.target.value)}
        className="w-full px-3 py-2 bg-white border border-[#E4E4E7] rounded-md text-sm text-[#09090B] placeholder:text-[#71717A] focus:outline-none focus:ring-2 focus:ring-[#FFE033]/40 focus:border-[#CA8A04] transition-all"
        placeholder="Document filename"
      />
    </div>

    {/* Action buttons — stacked on mobile, side-by-side on sm+ */}
    <div className="flex flex-col sm:flex-row gap-2">
      <button
        type="button"
        onClick={handleSubmit(handlePreview)}
        disabled={isSubmitting || !isDirty}
        className={clsx(
          'flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-md text-sm font-medium transition-colors',
          isSubmitting || !isDirty
            ? 'bg-[#F4F4F5] text-[#71717A] cursor-not-allowed'
            : 'bg-white border border-[#E4E4E7] text-[#09090B] hover:border-[#CA8A04] hover:bg-[#FAFAFA]'
        )}
      >
        {isSubmitting && previewMode ? (
          <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
          </svg>
        ) : (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
        )}
        Preview
      </button>

      <button
        type="button"
        onClick={handleSubmit(handleGenerate)}
        disabled={isSubmitting}
        className={clsx(
          'flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-md text-sm font-medium transition-colors',
          isSubmitting
            ? 'bg-[#27272A] text-white/60 cursor-not-allowed'
            : 'bg-[#18181B] hover:bg-[#27272A] text-white'
        )}
      >
        {isSubmitting && !previewMode ? (
          <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
          </svg>
        ) : (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
        )}
        Generate {outputFormat === 'pdf' ? 'PDF' : 'Word'}
      </button>
    </div>

    {/* Reset */}
    {isDirty && (
      <button
        type="button"
        onClick={() => reset()}
        className="text-xs text-[#71717A] hover:text-[#09090B] text-center transition-colors py-1"
      >
        Reset all fields
      </button>
    )}
  </div>
)}
```

- [ ] **Step 6.5: Replace the footer progress bar**:

```tsx
{fields.length > 0 && (
  <div className="px-6 py-4 bg-[#FAFAFA] border-t border-[#E4E4E7]">
    <div className="flex items-center justify-between text-xs text-[#71717A] mb-2">
      <span>{Object.values(watchedValues).filter(Boolean).length} of {fields.length} fields filled</span>
      <span>{Math.round((Object.values(watchedValues).filter(Boolean).length / fields.length) * 100)}%</span>
    </div>
    <div className="h-1.5 bg-[#E4E4E7] rounded-full overflow-hidden">
      <div
        className="h-full bg-[#FFE033] rounded-full transition-all duration-300"
        style={{ width: `${(Object.values(watchedValues).filter(Boolean).length / fields.length) * 100}%` }}
      />
    </div>
  </div>
)}
```

- [ ] **Step 6.6: Remove `getFieldIcon` function** — it only returned emoji. Delete the entire function.

- [ ] **Step 6.7: Commit**
```bash
git add frontend/src/components/DynamicFormGenerator/DynamicFormGenerator.tsx
git commit -m "style: rebrand DynamicFormGenerator to Precision Light system"
```

---

## Task 7: UsageIndicator — Rebrand

**Files:**
- Modify: `frontend/src/components/UsageIndicator.tsx`

- [ ] **Step 7.1: Replace entire component render**

```tsx
return (
  <div className="bg-white border border-[#E4E4E7] rounded-lg px-4 py-3">
    <div className="flex items-center justify-between mb-2">
      <div className="flex items-center gap-2">
        <svg className="w-4 h-4 text-[#71717A]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
        <span className="text-xs text-[#71717A]">
          <span className="font-semibold text-[#09090B]">{used}</span> / {limit} documents this month
        </span>
      </div>
      <Link
        to="/upgrade"
        className="text-xs font-medium text-[#CA8A04] hover:text-[#A16207] transition-colors"
      >
        Upgrade to Pro →
      </Link>
    </div>
    <div className="w-full bg-[#E4E4E7] rounded-full h-1.5">
      <div
        className={`h-1.5 rounded-full transition-all duration-500 ${
          pct >= 80 ? 'bg-[#EF4444]' : pct >= 60 ? 'bg-[#F59E0B]' : 'bg-[#FFE033]'
        }`}
        style={{ width: `${pct}%` }}
      />
    </div>
  </div>
);
```

- [ ] **Step 7.2: Commit**
```bash
git add frontend/src/components/UsageIndicator.tsx
git commit -m "style: rebrand UsageIndicator to Precision Light system"
```

---

## Task 8: InstructionsEmptyState — Polish + Use-Case Callout

**Files:**
- Modify: `frontend/src/components/InstructionsEmptyState.tsx`

The react-icons/fa icons (FaHighlighter, FaCloudUploadAlt, FaMagic) are fine — keep them. Just update the surrounding card styling.

- [ ] **Step 8.1: Update card styles**

```tsx
// Change each of the three step cards from:
className="card-highlight flex flex-col items-center text-center p-6 rounded-2xl bg-[#FAF9F6] border border-[#E5E7EB] shadow-sm"

// To (sharper radius, updated border token):
className="card-highlight flex flex-col items-center text-center p-6 rounded-xl bg-white border border-[#E4E4E7]"
```

- [ ] **Step 8.2: Update heading typography**:

```tsx
// Before:
<h2 className="text-2xl font-bold text-[#111827] mb-2">How it works</h2>

// After:
<h2 className="text-xl font-semibold text-[#09090B] tracking-tight mb-2">How it works</h2>
```

- [ ] **Step 8.3: Update icon circle and step heading typography**:

```tsx
// Icon circle: from bg-[#FFFDF0] to:
<div className="w-14 h-14 rounded-xl bg-[#FFFDF0] flex items-center justify-center mb-4">
  <FaHighlighter className="text-2xl text-[#CA8A04]" />
</div>

// Step heading: add tracking-tight
<h3 className="text-sm font-semibold text-[#09090B] tracking-tight mb-2">Highlight Variables</h3>
```

- [ ] **Step 8.4: Commit**
```bash
git add frontend/src/components/InstructionsEmptyState.tsx
git commit -m "style: polish InstructionsEmptyState card styling"
```

---

## Task 9: UseCasesSection — New Component

**Files:**
- Create: `frontend/src/components/UseCasesSection.tsx`

This is the key feature requested: showing concrete use cases to help users understand the product's value.

- [ ] **Step 9.1: Create the component**

```tsx
const USE_CASES = [
  {
    title: 'Offer Letters',
    description: 'Personalise salary, role, start date, and manager name per candidate. Generate a clean PDF in seconds.',
    tags: ['HR', 'Recruitment'],
    fields: ['Candidate Name', 'Job Title', 'Salary', 'Start Date'],
  },
  {
    title: 'Employment Contracts',
    description: 'Swap in employee details, probation periods, and reporting lines — without touching the legal boilerplate.',
    tags: ['HR', 'Legal'],
    fields: ['Employee Name', 'Department', 'Probation Period', 'Signing Date'],
  },
  {
    title: 'NDAs & Agreements',
    description: 'Update counterparty names, effective dates, and jurisdiction per deal. Send professionally every time.',
    tags: ['Legal'],
    fields: ['Party Name', 'Effective Date', 'Jurisdiction', 'Governing Law'],
  },
  {
    title: 'Service Proposals',
    description: 'Customise client name, scope, pricing, and delivery timeline on your master proposal template.',
    tags: ['Sales', 'Operations'],
    fields: ['Client Name', 'Project Scope', 'Total Value', 'Delivery Date'],
  },
  {
    title: 'Vendor Onboarding',
    description: 'Fill supplier details, payment terms, and contact info into your standard onboarding pack.',
    tags: ['Operations', 'Finance'],
    fields: ['Vendor Name', 'Payment Terms', 'Account Number', 'Contact Email'],
  },
  {
    title: 'Lease Agreements',
    description: 'Enter tenant, unit, rental amount, and lease term. Get a ready-to-sign document immediately.',
    tags: ['Legal', 'Finance'],
    fields: ['Tenant Name', 'Unit Number', 'Monthly Rent', 'Lease End Date'],
  },
];

const TAG_COLORS: Record<string, string> = {
  HR: 'bg-blue-50 text-blue-700',
  Legal: 'bg-purple-50 text-purple-700',
  Sales: 'bg-green-50 text-green-700',
  Operations: 'bg-orange-50 text-orange-700',
  Finance: 'bg-yellow-50 text-yellow-700',
  Recruitment: 'bg-blue-50 text-blue-700',
};

export default function UseCasesSection() {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 border-t border-[#E4E4E7]">
      {/* Section header */}
      <div className="text-center mb-8">
        <h2 className="text-xl font-semibold text-[#09090B] tracking-tight mb-2">
          What teams use HighlightEdit for
        </h2>
        <p className="text-sm text-[#71717A] max-w-md mx-auto">
          Any Word document with yellow-highlighted fields becomes a reusable smart form.
          Here's what that looks like in practice.
        </p>
      </div>

      {/* Cards grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {USE_CASES.map((uc) => (
          <div
            key={uc.title}
            className="bg-white border border-[#E4E4E7] rounded-xl p-5 hover:border-[#CA8A04] transition-colors group"
          >
            {/* Title + tags */}
            <div className="flex items-start justify-between gap-2 mb-3">
              <h3 className="text-sm font-semibold text-[#09090B] tracking-tight group-hover:text-[#CA8A04] transition-colors">
                {uc.title}
              </h3>
              <div className="flex flex-wrap gap-1 flex-shrink-0">
                {uc.tags.map((tag) => (
                  <span
                    key={tag}
                    className={`text-xs px-2 py-0.5 rounded-full font-medium ${TAG_COLORS[tag] ?? 'bg-[#F4F4F5] text-[#71717A]'}`}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Description */}
            <p className="text-xs text-[#71717A] leading-relaxed mb-4">{uc.description}</p>

            {/* Field pills — shows what gets highlighted */}
            <div className="flex flex-wrap gap-1.5">
              {uc.fields.map((field) => (
                <span
                  key={field}
                  className="text-xs px-2 py-0.5 bg-[#FFFDF0] text-[#CA8A04] rounded font-medium border border-[#FFE033]/30"
                >
                  {field}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Bottom CTA */}
      <p className="text-center text-xs text-[#71717A] mt-8">
        Your document, your template. If it's in Word with yellow highlights, it works.
      </p>
    </div>
  );
}
```

- [ ] **Step 9.2: Commit**
```bash
git add frontend/src/components/UseCasesSection.tsx
git commit -m "feat: add UseCasesSection with 6 real-world use cases"
```

---

## Task 10: TemplateEditor — Wire Up New Components

**Files:**
- Modify: `frontend/src/pages/TemplateEditor.tsx`

- [ ] **Step 10.1: Add UseCasesSection import**
```tsx
import UseCasesSection from '../components/UseCasesSection';
```

- [ ] **Step 10.2: Add UseCasesSection below InstructionsEmptyState**

Find where `<InstructionsEmptyState />` is rendered. After it, add:
```tsx
{/* Only show use cases when no file is loaded */}
{!uploadedFile && <UseCasesSection />}
```

*(Use whatever state variable indicates no file is yet loaded — check if it's `uploadedFile`, `templateState`, or similar.)*

- [ ] **Step 10.3: Replace emoji Save/Generate button icons**

Find any button containing emoji like `💾`, `📥`, `⏳` — replace with the SVG equivalents from the Design Token Reference at the top of this plan.

- [ ] **Step 10.4: Verify page padding is mobile-safe**

The main content wrapper should be:
```tsx
<main className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
```

Not `px-6` alone — add `px-4` for mobile.

- [ ] **Step 10.5: Commit**
```bash
git add frontend/src/pages/TemplateEditor.tsx
git commit -m "feat: add use cases section to editor landing state; replace emoji buttons"
```

---

## Task 11: TemplatesList — Skeleton Loading, Empty State, Card Polish

**Files:**
- Modify: `frontend/src/pages/TemplatesList.tsx`

- [ ] **Step 11.1: Replace spinner with skeleton cards**

Replace the loading block:
```tsx
if (loading) {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6">
      <div className="flex justify-between items-center mb-8">
        <div className="h-6 w-36 skeleton" />
        <div className="h-9 w-28 skeleton rounded-md" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white border border-[#E4E4E7] rounded-xl p-5 card-highlight">
            <div className="flex justify-between mb-4">
              <div className="w-10 h-10 skeleton rounded-lg" />
              <div className="w-20 h-4 skeleton" />
            </div>
            <div className="h-5 w-3/4 skeleton mb-2" />
            <div className="h-4 w-1/2 skeleton" />
          </div>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 11.2: Replace empty state**

```tsx
{templates.length === 0 && !error && (
  <div className="text-center py-20 bg-white rounded-xl border border-[#E4E4E7]">
    <div className="w-14 h-14 bg-[#FFFDF0] rounded-xl flex items-center justify-center mx-auto mb-4">
      <svg className="w-7 h-7 text-[#CA8A04]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    </div>
    <h3 className="text-sm font-semibold text-[#09090B] tracking-tight mb-1">No templates saved yet</h3>
    <p className="text-xs text-[#71717A] max-w-xs mx-auto mb-5">
      Save a template to reuse it instantly — skip re-uploading the same document every time.
    </p>
    <button
      onClick={() => navigate('/')}
      className="px-4 py-2.5 bg-[#18181B] hover:bg-[#27272A] text-white text-sm font-medium rounded-md transition-colors"
    >
      Upload your first document
    </button>
  </div>
)}
```

- [ ] **Step 11.3: Polish card styling and add hover action row**

```tsx
<div
  key={template.id}
  onClick={() => handleTemplateClick(template.id)}
  className="group bg-white border border-[#E4E4E7] rounded-xl p-5 cursor-pointer
             hover:border-[#CA8A04] transition-colors card-highlight"
>
  <div className="flex items-start justify-between mb-3">
    <div className="w-10 h-10 bg-[#FFFDF0] rounded-lg flex items-center justify-center flex-shrink-0">
      <svg className="w-5 h-5 text-[#CA8A04]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    </div>
    <div className="flex items-center gap-2">
      <span className="text-xs text-[#71717A]">
        {new Date(template.created_at).toLocaleDateString()}
      </span>
      <button
        onClick={(e) => handleDelete(e, template.id)}
        className="p-1 text-[#E4E4E7] hover:text-[#EF4444] transition-colors opacity-0 group-hover:opacity-100"
        title="Delete template"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
      </button>
    </div>
  </div>

  <h3 className="text-sm font-semibold text-[#09090B] tracking-tight mb-1">
    {template.name}
  </h3>

  {/* Action row — visible on hover on desktop, always visible on mobile */}
  <div className="mt-3 pt-3 border-t border-[#E4E4E7] flex items-center gap-2
                  opacity-0 group-hover:opacity-100 sm:transition-opacity sm:duration-150
                  max-sm:opacity-100">
    <span className="text-xs text-[#CA8A04] font-medium">Use template →</span>
  </div>
</div>
```

- [ ] **Step 11.4: Update page heading typography**

```tsx
// Before:
<h1 className="text-3xl font-bold text-[#111827]">My Templates</h1>

// After:
<h1 className="text-xl font-semibold text-[#09090B] tracking-tight">My Templates</h1>
```

- [ ] **Step 11.5: Update Create New button**

```tsx
<button
  onClick={() => navigate('/')}
  className="px-4 py-2.5 bg-[#18181B] hover:bg-[#27272A] text-white text-sm font-medium rounded-md transition-colors"
>
  Upload New File
</button>
```

- [ ] **Step 11.6: Update page padding for mobile**:
```tsx
<div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
```

- [ ] **Step 11.7: Commit**
```bash
git add frontend/src/pages/TemplatesList.tsx
git commit -m "style: TemplatesList skeleton loading, empty state, card hover polish"
```

---

## Task 12: Auth Page — Labeled Fields, Mobile Card

**Files:**
- Modify: `frontend/src/pages/Auth.tsx`

- [ ] **Step 12.1: Remove `-space-y-px` and replace with separate labeled fields**

For the email field:
```tsx
<div>
  <label className="block text-sm font-medium text-[#09090B] mb-1.5 tracking-tight">
    Email address
  </label>
  <input
    type="email"
    required
    className="w-full px-4 py-3 bg-white border border-[#E4E4E7] rounded-lg text-sm text-[#09090B] placeholder:text-[#71717A] focus:outline-none focus:ring-2 focus:ring-[#FFE033]/40 focus:border-[#CA8A04] hover:border-[#CA8A04] transition-all"
    placeholder="you@company.com"
    value={email}
    onChange={(e) => setEmail(e.target.value)}
  />
</div>
```

For the password field:
```tsx
<div>
  <label className="block text-sm font-medium text-[#09090B] mb-1.5 tracking-tight">
    Password
  </label>
  <input
    type="password"
    required
    className="w-full px-4 py-3 bg-white border border-[#E4E4E7] rounded-lg text-sm text-[#09090B] placeholder:text-[#71717A] focus:outline-none focus:ring-2 focus:ring-[#FFE033]/40 focus:border-[#CA8A04] hover:border-[#CA8A04] transition-all"
    placeholder="••••••••"
    value={password}
    onChange={(e) => setPassword(e.target.value)}
  />
</div>
```

Wrap both in `<div className="space-y-4">` instead of the old `-space-y-px` div.

- [ ] **Step 12.2: If invite code field exists, label it too**:

```tsx
<div>
  <label className="block text-sm font-medium text-[#09090B] mb-1.5 tracking-tight">
    Invite code
  </label>
  <input
    type="text"
    className="w-full px-4 py-3 bg-white border border-[#E4E4E7] rounded-lg text-sm text-[#09090B] placeholder:text-[#71717A] focus:outline-none focus:ring-2 focus:ring-[#FFE033]/40 focus:border-[#CA8A04] hover:border-[#CA8A04] transition-all"
    placeholder="Enter your invite code"
    ...
  />
</div>
```

- [ ] **Step 12.3: Update submit button**:

```tsx
<button
  type="submit"
  disabled={loading}
  className="w-full py-3 px-4 bg-[#18181B] hover:bg-[#27272A] text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-[#FFE033]/40"
>
  {loading ? 'Signing in…' : 'Sign in'}
</button>
```

- [ ] **Step 12.4: Add mobile-friendly padding to the outer container**:

```tsx
// Outer div:
<div className="min-h-screen flex items-center justify-center bg-[#FAFAFA] py-12 px-4">
  {/* Card — mx-auto with max-w, not relying on centering with big px */}
  <div className="w-full max-w-md bg-white rounded-xl shadow-sm border border-[#E4E4E7] card-highlight p-8 sm:p-10">
```

- [ ] **Step 12.5: Update page/form heading**:

```tsx
<h2 className="text-xl font-semibold text-[#09090B] tracking-tight">
  {isSignUp ? 'Create your account' : 'Sign in to HighlightEdit'}
</h2>
```

- [ ] **Step 12.6: Commit**
```bash
git add frontend/src/pages/Auth.tsx
git commit -m "style: Auth page — labeled fields, mobile padding, typography polish"
```

---

## Task 13: ForgotPassword + ResetPassword — Consistent Fields

**Files:**
- Modify: `frontend/src/pages/ForgotPassword.tsx`
- Modify: `frontend/src/pages/ResetPassword.tsx`

Apply identical treatment as Task 12 to both pages:

- [ ] **Step 13.1: ForgotPassword — add label, update input + button classes**

```tsx
// Heading
<h2 className="text-xl font-semibold text-[#09090B] tracking-tight text-center">
  Reset your password
</h2>

// Email field
<div>
  <label className="block text-sm font-medium text-[#09090B] mb-1.5 tracking-tight">
    Email address
  </label>
  <input
    type="email"
    required
    className="w-full px-4 py-3 bg-white border border-[#E4E4E7] rounded-lg text-sm text-[#09090B] placeholder:text-[#71717A] focus:outline-none focus:ring-2 focus:ring-[#FFE033]/40 focus:border-[#CA8A04] hover:border-[#CA8A04] transition-all"
    placeholder="you@company.com"
    value={email}
    onChange={(e) => setEmail(e.target.value)}
  />
</div>

// Submit button
<button
  type="submit"
  disabled={loading}
  className="w-full py-3 px-4 bg-[#18181B] hover:bg-[#27272A] text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
>
  {loading ? 'Sending…' : 'Send reset link'}
</button>
```

- [ ] **Step 13.2: ResetPassword — add labels to all three inputs**

Label each input: "Reset token" (if showing), "New password", "Confirm password". Same input classes as above.

- [ ] **Step 13.3: Commit**
```bash
git add frontend/src/pages/ForgotPassword.tsx frontend/src/pages/ResetPassword.tsx
git commit -m "style: ForgotPassword and ResetPassword — labeled fields, consistent input styling"
```

---

## Task 14: Upgrade / Pricing Page — Dark Pro Card, No alert()

**Files:**
- Modify: `frontend/src/pages/Upgrade.tsx`

- [ ] **Step 14.1: Import Toast and add state**

```tsx
import Toast from '../components/Toast';
import { useState } from 'react';

// In component:
const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
```

- [ ] **Step 14.2: Replace alert() with toast**

```tsx
const handleUpgrade = async () => {
  try {
    await upgrade();
    setToast({ message: 'Upgrade successful! You can now save templates.', type: 'success' });
    setTimeout(() => navigate('/'), 2000);
  } catch (error) {
    setToast({ message: 'Upgrade failed. Please try again.', type: 'error' });
  }
};
```

- [ ] **Step 14.3: Add Toast render at bottom of return**:

```tsx
{toast && <Toast message={toast.message} type={toast.type} onDismiss={() => setToast(null)} />}
```

- [ ] **Step 14.4: Redesign pricing card grid**

Replace the two identical cards with distinct treatments:
```tsx
<div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">

  {/* Free Plan — light, subdued */}
  <div className="card-highlight bg-white border border-[#E4E4E7] rounded-xl p-8">
    <h2 className="text-lg font-semibold text-[#09090B] tracking-tight mb-1">Free</h2>
    <div className="flex items-baseline gap-1 mb-1">
      <span className="text-3xl font-bold text-[#09090B]">$0</span>
    </div>
    <p className="text-xs text-[#71717A] mb-6">Forever free</p>
    <ul className="space-y-3 mb-8">
      {[
        'Basic highlight editing',
        'Up to 3 documents',
        'No template saving',
      ].map((item) => (
        <li key={item} className="flex items-center gap-2.5">
          <svg className="w-4 h-4 text-[#71717A] flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414L8.414 15l-4.121-4.121a1 1 0 011.414-1.414L8.414 12.172l7.879-7.879a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
          <span className="text-sm text-[#71717A]">{item}</span>
        </li>
      ))}
    </ul>
    <button
      onClick={() => navigate('/')}
      className="w-full py-3 px-6 rounded-lg text-sm font-medium bg-white border border-[#E4E4E7] text-[#71717A] hover:border-[#CA8A04] hover:text-[#09090B] transition-colors"
    >
      Continue with Free
    </button>
  </div>

  {/* Pro Plan — dark, dominant */}
  <div className="relative rounded-xl p-8 bg-[#18181B] overflow-hidden">
    {/* Recommended badge */}
    <div className="absolute top-4 right-4">
      <span className="px-2.5 py-1 bg-[#FFE033] text-[#09090B] text-xs font-bold rounded-full">
        Recommended
      </span>
    </div>

    <h2 className="text-lg font-semibold text-white tracking-tight mb-1">Pro</h2>
    <div className="flex items-baseline gap-1 mb-1">
      <span className="text-3xl font-bold text-white">$9.99</span>
    </div>
    <p className="text-xs text-zinc-400 mb-6">per month · Cancel anytime</p>
    <ul className="space-y-3 mb-8">
      {[
        'Unlimited document retention',
        'Save unlimited templates',
        'Reuse templates instantly',
        'Priority support',
      ].map((item) => (
        <li key={item} className="flex items-center gap-2.5">
          <svg className="w-4 h-4 text-[#FFE033] flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414L8.414 15l-4.121-4.121a1 1 0 011.414-1.414L8.414 12.172l7.879-7.879a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
          <span className="text-sm text-zinc-300">{item}</span>
        </li>
      ))}
    </ul>
    <button
      onClick={handleUpgrade}
      className="w-full py-3 px-6 rounded-lg text-sm font-semibold bg-[#FFE033] hover:bg-[#F5D800] text-[#09090B] transition-colors"
    >
      Upgrade Now
    </button>
  </div>

</div>
```

- [ ] **Step 14.5: Mobile — ensure Pro card comes first on mobile**

On mobile, `grid-cols-1` stacks cards top-to-bottom. Add `order-first md:order-last` to the Pro card, and `order-last md:order-first` to the Free card. This way mobile sees Pro first.

```tsx
// Free card wrapper:
<div className="card-highlight bg-white border border-[#E4E4E7] rounded-xl p-8 order-last md:order-first">

// Pro card wrapper:
<div className="relative rounded-xl p-8 bg-[#18181B] overflow-hidden order-first md:order-last">
```

- [ ] **Step 14.6: Update page heading**:

```tsx
<h1 className="text-2xl font-semibold text-[#09090B] tracking-tight mb-2">Upgrade to Pro</h1>
```

- [ ] **Step 14.7: Commit**
```bash
git add frontend/src/pages/Upgrade.tsx
git commit -m "style: Upgrade — dark Pro card, recommended badge, replace alert() with Toast"
```

---

## Task 15: FieldRow — Minor Polish

**Files:**
- Modify: `frontend/src/components/FieldRow/FieldRow.tsx`

- [ ] **Step 15.1: Update label typography**

```tsx
// Before:
className="text-base font-semibold text-[#111827] leading-tight"

// After:
className="text-sm font-semibold text-[#09090B] leading-tight tracking-tight"
```

- [ ] **Step 15.2: Update input border-radius to match system**

```tsx
// Ensure rounded-lg (8px) not mixed radius
className={`w-full px-4 py-3 bg-white border rounded-lg ...`}
```

- [ ] **Step 15.3: Commit**
```bash
git add frontend/src/components/FieldRow/FieldRow.tsx
git commit -m "style: FieldRow label typography tracking-tight"
```

---

## Task 16: Mobile Audit Pass

- [ ] **Step 16.1: Check TemplateEditor on 375px width**
- Dropzone: should not have horizontal scroll
- Form fields: full width, no overflow
- DynamicFormGenerator action bar: stacked vertically on mobile ✓ (already `flex-col`)

- [ ] **Step 16.2: Check TemplatesList on 375px width**
- Grid: `grid-cols-1` on mobile ✓
- Card title: ensure `truncate` on long names
- Delete button: `opacity-0 group-hover:opacity-100` — on mobile, always visible (`max-sm:opacity-100` already added in Task 11)

- [ ] **Step 16.3: Check Auth on 375px width**
- Card: `px-4` outer padding prevents card touching screen edge ✓ (Task 12)
- Inputs: full width ✓
- Logo: size 48-64px max

- [ ] **Step 16.4: Check Upgrade on 375px width**
- Pro card comes first on mobile ✓ (Task 14)
- Pricing numbers: don't overflow

- [ ] **Step 16.5: Check Header on 375px**
- Logo + hamburger only, no nav overflow ✓ (Task 4)
- MobileNav drawer: full-height, 64px wide max, closes on backdrop tap ✓ (Task 3)

- [ ] **Step 16.6: Check UseCasesSection on 375px**
- Grid: `grid-cols-1` on mobile, `sm:grid-cols-2` on tablet
- Cards: field pills wrap correctly

- [ ] **Step 16.7: Final commit**
```bash
git add -A
git commit -m "style: mobile audit pass — spacing, overflow, touch targets"
```

---

## Completion Checklist

After all tasks, verify:

- [ ] No emoji in any `.tsx` file (search: `grep -r "📄\|💾\|⏳\|📥\|📊\|📋\|📝\|✉️\|📞\|📅\|💰" frontend/src`)
- [ ] No `bg-slate-` classes outside DynamicFormGenerator (should be zero now)
- [ ] No `-space-y-px` in Auth, ForgotPassword, ResetPassword
- [ ] All `<input>` elements have a corresponding `<label>`
- [ ] `FileUploader.css` has been deleted
- [ ] All page headings use `tracking-tight`
- [ ] Header shows hamburger on mobile
- [ ] `alert()` calls replaced with Toast
- [ ] Build passes: `npm run build` in `frontend/`

---

## Definition of Done

The app is done when:
1. A new user on mobile can upload a document, fill the form, and download the output without any UI friction
2. The home state communicates what the product does before any interaction (InstructionsEmptyState + UseCasesSection)
3. Every page uses the same border radius, typography scale, button style, and input treatment
4. No emoji anywhere in production UI
5. The Pro pricing card is visually dominant on both mobile and desktop
