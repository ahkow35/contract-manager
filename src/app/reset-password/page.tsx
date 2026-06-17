'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

type Phase = 'verifying' | 'ready' | 'invalid' | 'done';

export default function ResetPassword() {
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>('verifying');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  // The reset email link lands here with a PKCE ?code= (or an established recovery session).
  useEffect(() => {
    const supabase = createClient();
    const code = new URLSearchParams(window.location.search).get('code');
    (async () => {
      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        setPhase(error ? 'invalid' : 'ready');
        return;
      }
      // Server-verified (not getSession, which trusts local storage) before allowing a password change.
      const { data } = await supabase.auth.getUser();
      setPhase(data.user ? 'ready' : 'invalid');
    })();
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    setBusy(true);
    const { error } = await createClient().auth.updateUser({ password });
    setBusy(false);
    if (error) {
      setError(error.message);
      return;
    }
    setPhase('done');
    setTimeout(() => {
      router.replace('/');
      router.refresh();
    }, 1200);
  }

  return (
    <main className="mx-auto flex max-w-sm flex-1 flex-col justify-center px-4">
      <div className="flex items-center gap-2 font-semibold tracking-tight">
        <span className="inline-block w-1.5 h-5 bg-yellow-400 rounded-sm" />
        Contract Manager
      </div>
      <h1 className="mt-6 text-lg font-semibold text-zinc-900">Set a new password</h1>

      {phase === 'verifying' && <p className="mt-3 text-sm text-zinc-500">Verifying your reset link…</p>}

      {phase === 'invalid' && (
        <p className="mt-3 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          This reset link is invalid or has expired. Request a new one from the sign-in page.
        </p>
      )}

      {phase === 'done' && (
        <p className="mt-3 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
          Password updated. Redirecting…
        </p>
      )}

      {phase === 'ready' && (
        <form onSubmit={submit} className="mt-4 space-y-3">
          <input
            type="password" required placeholder="New password (min 8 chars)" value={password}
            onChange={(e) => setPassword(e.target.value)} minLength={8}
            className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm focus:border-zinc-900 focus:outline-none"
          />
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button type="submit" disabled={busy}
            className="w-full rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-50">
            {busy ? 'Updating…' : 'Update password'}
          </button>
        </form>
      )}
    </main>
  );
}
