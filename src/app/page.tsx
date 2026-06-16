import Link from 'next/link';
import { AppHeader } from '@/components/AppHeader';
import { TEMPLATES } from '@/lib/merge/registry';

const JURISDICTION_STYLE: Record<string, string> = {
  SG: 'bg-blue-50 text-blue-700 border-blue-200',
  MY: 'bg-emerald-50 text-emerald-700 border-emerald-200',
};

// Templates not yet ready for live use (awaiting the official tokenised .docx).
const BLOCKED = new Set(['lc-part-timer-my']);

export default function Home() {
  return (
    <>
      <AppHeader />
      <main className="mx-auto max-w-3xl w-full px-4 py-10">
        <h1 className="text-xl font-semibold tracking-tight text-zinc-900">Templates</h1>
        <p className="mt-1 text-sm text-zinc-500 max-w-lg">
          Pick a document, fill the form, download a finished <code>.docx</code>. Personal data
          (names, NRIC, salary) is processed entirely in your browser and is never uploaded.
        </p>

        <ul className="mt-6 space-y-3">
          {TEMPLATES.map((t) => {
            const blocked = BLOCKED.has(t.id);
            const inner = (
              <div className="yellow-bar rounded-md border border-zinc-200 bg-white px-4 py-3 flex items-center justify-between hover:border-zinc-300 transition-colors">
                <div>
                  <div className="font-medium text-zinc-900">{t.title}</div>
                  <div className="mt-0.5 text-xs text-zinc-500">
                    {t.fields.length} fields{t.ocr ? ' · ID-card OCR available' : ''}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs rounded border px-2 py-0.5 ${JURISDICTION_STYLE[t.jurisdiction]}`}>
                    {t.jurisdiction}
                  </span>
                  {blocked && (
                    <span className="text-xs rounded border border-zinc-200 bg-zinc-50 text-zinc-500 px-2 py-0.5">
                      awaiting template
                    </span>
                  )}
                </div>
              </div>
            );
            return (
              <li key={t.id}>
                {blocked ? (
                  <div className="opacity-60 cursor-not-allowed">{inner}</div>
                ) : (
                  <Link href={`/t/${t.id}`}>{inner}</Link>
                )}
              </li>
            );
          })}
        </ul>
      </main>
    </>
  );
}
