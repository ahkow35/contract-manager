'use client';

import { useState } from 'react';
import Link from 'next/link';
import { amountToWords } from '@/lib/merge/amount-to-words';
import { downloadBlob, renderDocx } from '@/lib/merge/docx';
import { getTemplate } from '@/lib/merge/registry';
import type { FieldDef, FormValues } from '@/lib/merge/types';

function initialValues(fields: FieldDef[]): FormValues {
  const v: FormValues = {};
  for (const f of fields) v[f.id] = f.default ?? '';
  return v;
}

export function IntakeForm({ templateId }: { templateId: string }) {
  const template = getTemplate(templateId);
  const [values, setValues] = useState<FormValues>(() => initialValues(template?.fields ?? []));
  const [errors, setErrors] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);

  if (!template) {
    return <p className="text-sm text-red-600">Unknown template: {templateId}</p>;
  }

  const hasSalaryWords = template.fields.some((f) => f.id === 'salaryWords');

  function set(id: string, value: string) {
    setValues((prev) => {
      const next = { ...prev, [id]: value };
      // Auto-fill salary-in-words from the figure when the words field is still empty.
      if (id === 'salaryFigure' && hasSalaryWords && !prev.salaryWords) {
        next.salaryWords = amountToWords(value);
      }
      return next;
    });
  }

  async function generate() {
    const errs = template!.validate(values);
    setErrors(errs);
    if (errs.length) return;
    setBusy(true);
    try {
      // Blank template fetched from same origin (no PII). Merge + download is 100% client-side.
      const res = await fetch(`/templates/${template!.templateFile}`);
      if (!res.ok) throw new Error(`Template not found (${res.status})`);
      const buf = await res.arrayBuffer();
      const blob = renderDocx(buf, template!.tokens(values));
      downloadBlob(blob, template!.fileName(values));
    } catch (e) {
      setErrors([e instanceof Error ? e.message : 'Failed to generate document.']);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <div className="mb-4 flex items-center gap-2 text-xs text-zinc-500">
        <Link href="/" className="hover:text-zinc-900">← Templates</Link>
      </div>
      <h1 className="text-xl font-semibold tracking-tight text-zinc-900">{template.title}</h1>

      <p className="mt-2 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs text-emerald-800">
        🔒 Everything you type stays in this browser. The document is generated on your device and
        downloaded directly — nothing is uploaded to any server.
      </p>

      {template.ocr && (
        <p className="mt-3 rounded-md border border-zinc-200 bg-zinc-50 px-3 py-2 text-xs text-zinc-500">
          ID-card OCR pre-fill is coming in the next phase. For now, enter details manually.
        </p>
      )}

      <form
        className="mt-6 space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          void generate();
        }}
      >
        {template.fields.map((f) => (
          <Field key={f.id} field={f} value={values[f.id] ?? ''} onChange={(v) => set(f.id, v)} />
        ))}

        {errors.length > 0 && (
          <ul className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 space-y-1">
            {errors.map((e) => (
              <li key={e}>• {e}</li>
            ))}
          </ul>
        )}

        <button
          type="submit"
          disabled={busy}
          className="yellow-bar rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-50"
        >
          {busy ? 'Generating…' : 'Generate .docx'}
        </button>
      </form>
    </div>
  );
}

function Field({ field, value, onChange }: { field: FieldDef; value: string; onChange: (v: string) => void }) {
  const base =
    'mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm focus:border-zinc-900 focus:outline-none';
  return (
    <label className="block">
      <span className="text-sm font-medium text-zinc-800">
        {field.label}
        {field.required ? <span className="text-red-500"> *</span> : null}
      </span>
      {field.type === 'textarea' ? (
        <textarea className={base} rows={3} value={value} onChange={(e) => onChange(e.target.value)} />
      ) : field.type === 'select' ? (
        <select className={base} value={value} onChange={(e) => onChange(e.target.value)}>
          <option value="">—</option>
          {(field.options ?? []).map((o) => (
            <option key={o} value={o}>{o}</option>
          ))}
        </select>
      ) : (
        <input
          className={base}
          type={field.type === 'date' ? 'date' : field.type === 'number' || field.type === 'currency' ? 'text' : 'text'}
          inputMode={field.type === 'number' || field.type === 'currency' ? 'decimal' : undefined}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      )}
      {field.help && <span className="mt-1 block text-xs text-zinc-400">{field.help}</span>}
    </label>
  );
}
