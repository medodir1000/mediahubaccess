import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Pencil, Eye, Trash2 } from 'lucide-react';
import { supabase } from '../lib/supabase';

type Row = {
  id: string;
  slug: string;
  title: string;
  status: 'draft' | 'scheduled' | 'published' | 'archived';
  category: string | null;
  view_count: number;
  published_at: string | null;
  updated_at: string;
};

const statusTone: Record<Row['status'], string> = {
  draft:     'bg-zinc-500/15 text-zinc-400 border-zinc-500/30',
  scheduled: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
  published: 'bg-green-500/15 text-green-400 border-green-500/30',
  archived:  'bg-red-500/15 text-red-400 border-red-500/30',
};

export default function AdminArticlesPage() {
  const [rows, setRows] = useState<Row[] | null>(null);
  const [err, setErr] = useState<string | null>(null);

  async function load() {
    const { data, error } = await supabase
      .from('articles')
      .select('id, slug, title, status, category, view_count, published_at, updated_at')
      .order('updated_at', { ascending: false });
    if (error) setErr(error.message);
    else setRows((data as Row[]) ?? []);
  }

  useEffect(() => { load(); }, []);

  async function remove(id: string) {
    if (!confirm('Delete this article? This cannot be undone.')) return;
    const { error } = await supabase.from('articles').delete().eq('id', id);
    if (error) alert(error.message);
    else load();
  }

  return (
    <div className="p-10">
      <div className="flex items-end justify-between mb-10">
        <div>
          <p className="text-[10px] uppercase tracking-[0.3em] font-bold text-zinc-600">Content</p>
          <h1 className="text-4xl font-black tracking-tighter mt-1">Articles</h1>
        </div>
        <Link
          to="/admin/articles/new"
          className="inline-flex items-center gap-2 bg-electric-blue hover:bg-blue-600 text-white text-sm font-bold px-5 py-2.5 rounded-xl shadow-[0_0_25px_rgba(59,130,246,0.3)] transition-colors"
        >
          <Plus className="w-4 h-4" />
          New article
        </Link>
      </div>

      {err && <p className="text-red-400 text-sm mb-4">{err}</p>}
      {!rows && !err && <p className="text-zinc-500 text-sm">Loading…</p>}
      {rows && rows.length === 0 && (
        <div className="glass-card rounded-2xl p-10 text-center">
          <p className="text-zinc-400 text-lg mb-2">No articles yet</p>
          <p className="text-zinc-600 text-sm mb-6">Publish your first SEO post to start ranking.</p>
          <Link
            to="/admin/articles/new"
            className="inline-flex items-center gap-2 bg-electric-blue text-white text-sm font-bold px-5 py-2.5 rounded-xl"
          >
            <Plus className="w-4 h-4" />
            Create first article
          </Link>
        </div>
      )}

      {rows && rows.length > 0 && (
        <div className="glass-card rounded-2xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-white/[0.02] text-[10px] uppercase tracking-[0.2em] font-bold text-zinc-500">
              <tr>
                <th className="text-left px-6 py-4">Title</th>
                <th className="text-left px-6 py-4">Status</th>
                <th className="text-left px-6 py-4">Category</th>
                <th className="text-right px-6 py-4">Views</th>
                <th className="text-left px-6 py-4">Updated</th>
                <th className="px-6 py-4" />
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-t border-white/5 hover:bg-white/[0.02]">
                  <td className="px-6 py-4">
                    <Link to={`/admin/articles/${r.id}`} className="text-white hover:text-electric-blue font-medium">
                      {r.title}
                    </Link>
                    <p className="text-[10px] text-zinc-600 mt-1">/blog/{r.slug}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-block px-2 py-0.5 rounded text-[9px] uppercase tracking-widest font-bold border ${statusTone[r.status]}`}>
                      {r.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-zinc-400">{r.category ?? '—'}</td>
                  <td className="px-6 py-4 text-right text-zinc-400">{r.view_count.toLocaleString()}</td>
                  <td className="px-6 py-4 text-zinc-500 text-xs">{new Date(r.updated_at).toLocaleDateString()}</td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      {r.status === 'published' && (
                        <Link
                          to={`/blog/${r.slug}`}
                          target="_blank"
                          className="p-2 rounded-lg text-zinc-500 hover:text-white hover:bg-white/5"
                          title="View live"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                      )}
                      <Link
                        to={`/admin/articles/${r.id}`}
                        className="p-2 rounded-lg text-zinc-500 hover:text-electric-blue hover:bg-white/5"
                        title="Edit"
                      >
                        <Pencil className="w-4 h-4" />
                      </Link>
                      <button
                        onClick={() => remove(r.id)}
                        className="p-2 rounded-lg text-zinc-500 hover:text-red-400 hover:bg-red-500/10"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
