import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

type Lead = {
  id: string;
  phone: string | null;
  email: string | null;
  display_name: string | null;
  country_code: string | null;
  source: string;
  status: string;
  created_at: string;
};

const statusTone: Record<string, string> = {
  new:           'bg-zinc-500/15 text-zinc-400 border-zinc-500/30',
  contacted:     'bg-amber-500/15 text-amber-400 border-amber-500/30',
  trial_active:  'bg-electric-blue/15 text-electric-blue border-electric-blue/30',
  converted:     'bg-green-500/15 text-green-400 border-green-500/30',
  lost:          'bg-red-500/15 text-red-400 border-red-500/30',
  banned:        'bg-red-500/15 text-red-500 border-red-500/30',
};

export default function AdminLeadsPage() {
  const [rows, setRows] = useState<Lead[] | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase
        .from('leads')
        .select('id, phone, email, display_name, country_code, source, status, created_at')
        .order('created_at', { ascending: false })
        .limit(200);
      if (error) setErr(error.message);
      else setRows((data as Lead[]) ?? []);
    })();
  }, []);

  return (
    <div className="p-10">
      <div className="mb-10">
        <p className="text-[10px] uppercase tracking-[0.3em] font-bold text-zinc-600">CRM</p>
        <h1 className="text-4xl font-black tracking-tighter mt-1">Leads</h1>
        <p className="text-zinc-500 text-sm mt-2">Most recent 200 — anyone who hit a CTA on the site.</p>
      </div>

      {err && <p className="text-red-400 text-sm mb-4">{err}</p>}
      {!rows && !err && <p className="text-zinc-500 text-sm">Loading…</p>}
      {rows && rows.length === 0 && (
        <div className="glass-card rounded-2xl p-10 text-center">
          <p className="text-zinc-400">No leads yet. CTA buttons need to be wired to <code className="text-amber-400">captureLead()</code>.</p>
        </div>
      )}

      {rows && rows.length > 0 && (
        <div className="glass-card rounded-2xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-white/[0.02] text-[10px] uppercase tracking-[0.2em] font-bold text-zinc-500">
              <tr>
                <th className="text-left px-6 py-4">Contact</th>
                <th className="text-left px-6 py-4">Source</th>
                <th className="text-left px-6 py-4">Status</th>
                <th className="text-left px-6 py-4">Country</th>
                <th className="text-left px-6 py-4">Captured</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-t border-white/5 hover:bg-white/[0.02]">
                  <td className="px-6 py-4">
                    <p className="text-white font-medium">{r.display_name ?? r.email ?? r.phone}</p>
                    <p className="text-[10px] text-zinc-600">{[r.phone, r.email].filter(Boolean).join(' • ')}</p>
                  </td>
                  <td className="px-6 py-4 text-zinc-400 text-xs uppercase tracking-wider">{r.source.replace(/_/g, ' ')}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-block px-2 py-0.5 rounded text-[9px] uppercase tracking-widest font-bold border ${statusTone[r.status] ?? statusTone.new}`}>
                      {r.status.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-zinc-400">{r.country_code ?? '—'}</td>
                  <td className="px-6 py-4 text-zinc-500 text-xs">{new Date(r.created_at).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
