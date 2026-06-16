'use client';

import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export function SignOutButton({ email }: { email: string | null }) {
  const router = useRouter();
  async function signOut() {
    await createClient().auth.signOut();
    router.replace('/login');
    router.refresh();
  }
  return (
    <div className="flex items-center gap-3 text-sm">
      <span className="text-zinc-500">{email}</span>
      <button onClick={signOut} className="text-zinc-600 hover:text-zinc-900 underline underline-offset-2">
        Sign out
      </button>
    </div>
  );
}
