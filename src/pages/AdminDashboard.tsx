import { useEffect, useState } from 'react';
import { Users, FileText, Radio, TrendingUp } from 'lucide-react';
import { supabase } from '../lib/supabase';

type Stats = {
  leads: number | null;
  published: number | null;
  trialAvailable: number | null;
  subscriptions: number | null;
};

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats>({
    leads: null,
    published: null,
    trialAvailable: null,
    subscriptions: null,
  });

  useEffect(() => {
    (async () => {
      const [leads, published, pool, subs] = await Promise.all([
        supabase.from('leads').select('id', { count: 'exact', head: true }),
        supabase.from('articles').select('id', { count: 'exact', head: true }).eq('status', 'published'),
        supabase.from('trial_pool').select('id', { count: 'exact', head: true }).eq('status', 'available'),
        supabase.from('subscriptions').select('id', { count: 'exact', head: true }).eq('status', 'active'),
      ]);
      setStats({
        leads: leads.count ?? 0,
        published: published.count ?? 0,
        trialAvailable: pool.count ?? 0,
        subscriptions: subs.count ?? 0,
      });
    })();
  }, []);

  const cards = [
    { label: 'Total leads',         value: stats.leads,          icon: Users,      tint: 'text-electric-blue' },
    { label: 'Published articles',  value: stats.published,      icon: FileText,   tint: 'text-luxury-gold' },
    { label: 'Trial pool available', value: stats.trialAvailable, icon: Radio,     tint: 'text-green-500' },
    { label: 'Active subscriptions', value: stats.subscriptions, icon: TrendingUp, tint: 'text-pink-400' },
  ];

  return (
    <div className="p-10">
      <div className="mb-10">
        <p className="text-[10px] uppercase tracking-[0.3em] font-bold text-zinc-600">Overview</p>
        <h1 className="text-4xl font-black tracking-tighter mt-1">Dashboard</h1>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
        {cards.map(({ label, value, icon: Icon, tint }) => (
          <div key={label} className="glass-card rounded-2xl p-6">
            <Icon className={`w-6 h-6 mb-4 ${tint}`} />
            <p className="text-3xl font-black mb-1">
              {value === null ? <span className="opacity-30">—</span> : value.toLocaleString()}
            </p>
            <p className="text-[10px] uppercase tracking-[0.25em] font-bold text-zinc-500">{label}</p>
          </div>
        ))}
      </div>

      <div className="glass-card rounded-2xl p-8">
        <h2 className="text-xs uppercase tracking-[0.3em] font-bold text-zinc-500 mb-2">Quick start</h2>
        <p className="text-zinc-400 text-sm leading-relaxed">
          Use the sidebar to manage articles, view captured leads, top up the trial pool, or
          tweak the Liam bot prompt. New here? Start by publishing your first SEO article in
          <strong className="text-white"> Articles → New article</strong>.
        </p>
      </div>
    </div>
  );
}
