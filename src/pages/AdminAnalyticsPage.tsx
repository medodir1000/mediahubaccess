import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

type EventRow = {
  event_name: string;
  count: number;
};

export default function AdminAnalyticsPage() {
  const [events, setEvents] = useState<EventRow[] | null>(null);

  useEffect(() => {
    (async () => {
      // Group manually since supabase-js doesn't expose GROUP BY directly without a view.
      const { data } = await supabase
        .from('page_events')
        .select('event_name')
        .limit(10_000);
      if (!data) return;
      const counts: Record<string, number> = {};
      for (const r of data as { event_name: string }[]) {
        counts[r.event_name] = (counts[r.event_name] ?? 0) + 1;
      }
      setEvents(
        Object.entries(counts)
          .map(([event_name, count]) => ({ event_name, count }))
          .sort((a, b) => b.count - a.count),
      );
    })();
  }, []);

  return (
    <div className="p-10">
      <div className="mb-10">
        <p className="text-[10px] uppercase tracking-[0.3em] font-bold text-zinc-600">Funnel</p>
        <h1 className="text-4xl font-black tracking-tighter mt-1">Analytics</h1>
        <p className="text-zinc-500 text-sm mt-2">Last 10,000 page events grouped by name.</p>
      </div>

      {!events && <p className="text-zinc-500 text-sm">Loading…</p>}
      {events && events.length === 0 && (
        <div className="glass-card rounded-2xl p-10 text-center">
          <p className="text-zinc-400">No events yet. Wire CTAs to <code className="text-amber-400">trackEvent()</code> to see traffic here.</p>
        </div>
      )}

      {events && events.length > 0 && (
        <div className="glass-card rounded-2xl p-6">
          <ul className="divide-y divide-white/5">
            {events.map((e) => {
              const max = events[0].count;
              const pct = Math.round((e.count / max) * 100);
              return (
                <li key={e.event_name} className="py-3 flex items-center gap-4">
                  <span className="font-mono text-xs text-zinc-300 w-48 truncate">{e.event_name}</span>
                  <div className="flex-1 h-2 bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-electric-blue" style={{ width: `${pct}%` }} />
                  </div>
                  <span className="text-zinc-400 text-sm tabular-nums w-16 text-right">{e.count.toLocaleString()}</span>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
