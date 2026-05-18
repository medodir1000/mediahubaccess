import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

type Row = {
  id: string;
  m3u_url: string;
  status: 'available' | 'issued' | 'expired' | 'burned';
  uses_count: number;
  max_uses: number;
  batch_label: string | null;
  provider: string | null;
  valid_until: string | null;
  issued_at: string | null;
  created_at: string;
};

const tone: Record<Row['status'], string> = {
  available: 'bg-green-500/15 text-green-400 border-green-500/30',
  issued:    'bg-electric-blue/15 text-electric-blue border-electric-blue/30',
  expired:   'bg-zinc-500/15 text-zinc-400 border-zinc-500/30',
  burned:    'bg-red-500/15 text-red-400 border-red-500/30',
};

export default function AdminTrialPoolPage() {
  const [rows, setRows] = useState<Row[] | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase
        .from('trial_pool')
        .select('id, m3u_url, status, uses_count, max_uses, batch_label, provider, valid_until, issued_at, created_at')
        .order('created_at', { ascending: false })
        .limit(500);
      if (error) setErr(error.message);
      else setRows((data as Row[]) ?? []);
    })();
  }, []);

  const counts = rows ? rows.reduce<Record<string, number>>((acc, r) => {
    acc[r.status] = (acc[r.status] ?? 0) + 1;
    return acc;
  }, {}) : {};

  return (
    <div className="p-10">
      <div className="mb-10">
        <p className="text-[10px] uppercase tracking-[0.3em] font-bold text-zinc-600">Inventory</p>
        <h1 className="text-4xl font-black tracking-tighter mt-1">Trial Pool</h1>
        <p className="text-zinc-500 text-sm mt-2">Pre-generated M3U links. The bot pulls one whenever a customer asks for a trial.</p>
      </div>

      {rows && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          {(['available','issued','expired','burned'] as const).map((s) => (
            <div key={s} className={`rounded-xl border px-4 py-3 ${tone[s]}`}>
              <p className="text-[10px] uppercase tracking-[0.2em] font-bold opacity-70">{s}</p>
              <p className="text-2xl font-black mt-1">{counts[s] ?? 0}</p>
            </div>
          ))}
        </div>
      )}

      {err && <p className="text-red-400 text-sm mb-4">{err}</p>}
      {!rows && !err && <p className="text-zinc-500 text-sm">Loading…</p>}
      {rows && rows.length === 0 && (
        <div className="glass-card rounded-2xl p-10 text-center">
          <p className="text-zinc-400 mb-2">Pool is empty</p>
          <p className="text-zinc-600 text-sm">Upload <code className="text-amber-400">trial_links_template.csv</code> via Table Editor → Import.</p>
        </div>
      )}

      {rows && rows.length > 0 && (
        <div className="glass-card rounded-2xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-white/[0.02] text-[10px] uppercase tracking-[0.2em] font-bold text-zinc-500">
              <tr>
                <th className="text-left px-6 py-4">M3U URL</th>
                <th className="text-left px-6 py-4">Status</th>
                <th className="text-left px-6 py-4">Provider / batch</th>
                <th className="text-right px-6 py-4">Uses</th>
                <th className="text-left px-6 py-4">Valid until</th>
                <th className="text-left px-6 py-4">Issued</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-t border-white/5 hover:bg-white/[0.02]">
                  <td className="px-6 py-4 max-w-xs">
                    <p className="text-white font-mono text-[11px] truncate">{r.m3u_url}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-block px-2 py-0.5 rounded text-[9px] uppercase tracking-widest font-bold border ${tone[r.status]}`}>
                      {r.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-zinc-400">
                    {r.provider ?? '—'}<br />
                    <span className="text-[10px] text-zinc-600">{r.batch_label ?? ''}</span>
                  </td>
                  <td className="px-6 py-4 text-right text-zinc-400">{r.uses_count} / {r.max_uses}</td>
                  <td className="px-6 py-4 text-zinc-500 text-xs">{r.valid_until ? new Date(r.valid_until).toLocaleDateString() : '—'}</td>
                  <td className="px-6 py-4 text-zinc-500 text-xs">{r.issued_at ? new Date(r.issued_at).toLocaleString() : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
