'use client';

import { useEffect, useState } from 'react';

interface Usage {
  total: number;
  last30: number;
  last7: number;
  byTemplate: { key: string; count: number }[];
  byUser: { key: string; count: number }[];
  recent: { template_id: string; user_email: string | null; created_at: string }[];
}

export default function AdminUsage() {
  const [data, setData] = useState<Usage | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const res = await fetch('/api/admin/usage');
      const json = await res.json();
      if (!res.ok) setError(json.error ?? 'Failed to load usage.');
      else setData(json);
    })();
  }, []);

  if (error) return <p className="text-sm text-red-600">{error}</p>;
  if (!data) return <p className="text-sm text-zinc-400">Loading…</p>;

  return (
    <div>
      <h1 className="text-xl font-semibold tracking-tight text-zinc-900">Usage</h1>
      <p className="mt-1 text-xs text-zinc-400">Counts only — never any document content or employee data.</p>

      <div className="mt-4 grid grid-cols-3 gap-3">
        <Stat label="All time" value={data.total} />
        <Stat label="Last 30 days" value={data.last30} />
        <Stat label="Last 7 days" value={data.last7} />
      </div>

      <div className="mt-6 grid gap-6 sm:grid-cols-2">
        <Breakdown title="By template" rows={data.byTemplate} />
        <Breakdown title="By user" rows={data.byUser} />
      </div>

      <h2 className="mt-8 text-sm font-medium text-zinc-700">Recent activity</h2>
      <div className="mt-2 overflow-hidden rounded-md border border-zinc-200">
        <table className="w-full text-sm">
          <tbody className="divide-y divide-zinc-100">
            {data.recent.length === 0 ? (
              <tr><td className="px-3 py-3 text-zinc-400">No activity yet.</td></tr>
            ) : (
              data.recent.map((r, i) => (
                <tr key={i}>
                  <td className="px-3 py-2 text-zinc-500 whitespace-nowrap">{new Date(r.created_at).toLocaleString()}</td>
                  <td className="px-3 py-2 text-zinc-800">{r.user_email ?? '—'}</td>
                  <td className="px-3 py-2 text-zinc-500">{r.template_id}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="yellow-bar rounded-md border border-zinc-200 px-4 py-3">
      <div className="text-2xl font-semibold text-zinc-900">{value}</div>
      <div className="text-xs text-zinc-500">{label}</div>
    </div>
  );
}

function Breakdown({ title, rows }: { title: string; rows: { key: string; count: number }[] }) {
  return (
    <div>
      <h2 className="text-sm font-medium text-zinc-700">{title}</h2>
      <ul className="mt-2 space-y-1">
        {rows.length === 0 ? (
          <li className="text-sm text-zinc-400">No data.</li>
        ) : (
          rows.map((r) => (
            <li key={r.key} className="flex justify-between text-sm">
              <span className="text-zinc-700 truncate pr-2">{r.key}</span>
              <span className="text-zinc-500">{r.count}</span>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}
