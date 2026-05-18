import { useEffect, useState, type FormEvent, type ReactNode } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, Eye, Wand2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../lib/AuthContext';

const BRAIN_URL = (import.meta.env.VITE_BRAIN_URL as string | undefined) ?? 'http://localhost:5000';

// Five SEO categories — MUST match src/pages/BlogPage.tsx SEO_CATEGORIES
// and brain.py SEO_CATEGORIES so filter chips, auto-writer rotation and the
// editor all share one taxonomy.
const SEO_CATEGORIES = [
  'Streaming Guides',
  'Sports & Live TV',
  'Smart TV Apps',
  'Device Reviews',
  'Movies & Series',
];

type ArticleForm = {
  slug: string;
  title: string;
  subtitle: string;
  excerpt: string;
  body_markdown: string;
  cover_image_url: string;
  category: string;
  tags: string;        // comma-separated in form
  hashtags: string;    // comma-separated in form, no # prefix
  status: 'draft' | 'scheduled' | 'published' | 'archived';
  seo_title: string;
  seo_description: string;
  seo_keywords: string;
  og_image_url: string;
  og_description: string;
  cta_text: string;
  cta_url: string;
};

const EMPTY: ArticleForm = {
  slug: '',
  title: '',
  subtitle: '',
  excerpt: '',
  body_markdown: '',
  cover_image_url: '',
  category: '',
  tags: '',
  hashtags: '',
  status: 'draft',
  seo_title: '',
  seo_description: '',
  seo_keywords: '',
  og_image_url: '',
  og_description: '',
  cta_text: 'Get your free 12-hour 4K trial',
  cta_url: 'https://wa.me/447411202861?text=Hi%21%20I%27d%20like%20to%20try%20the%20free%2012-hour%204K%20test%20of%20MediaHubAccess',
};

function slugify(s: string) {
  return s.toLowerCase().trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 80);
}

export default function AdminArticleEditor() {
  const { id } = useParams<{ id: string }>();
  const isNew = !id || id === 'new';
  const nav = useNavigate();
  const { user } = useAuth();
  const [form, setForm] = useState<ArticleForm>(EMPTY);
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (isNew) return;
    (async () => {
      const { data, error } = await supabase
        .from('articles')
        .select('*')
        .eq('id', id)
        .single();
      if (error) { setErr(error.message); setLoading(false); return; }
      setForm({
        slug: data.slug ?? '',
        title: data.title ?? '',
        subtitle: data.subtitle ?? '',
        excerpt: data.excerpt ?? '',
        body_markdown: data.body_markdown ?? '',
        cover_image_url: data.cover_image_url ?? '',
        category: data.category ?? '',
        tags: (data.tags ?? []).join(', '),
        hashtags: (data.hashtags ?? []).join(', '),
        status: data.status ?? 'draft',
        seo_title: data.seo_title ?? '',
        seo_description: data.seo_description ?? '',
        seo_keywords: (data.seo_keywords ?? []).join(', '),
        og_image_url: data.og_image_url ?? '',
        og_description: data.og_description ?? '',
        cta_text: data.cta_text ?? 'Get your free 12-hour 4K trial',
        cta_url: data.cta_url ?? 'https://wa.me/447411202861?text=Hi%21%20I%27d%20like%20to%20try%20the%20free%2012-hour%204K%20test%20of%20MediaHubAccess',
      });
      setLoading(false);
    })();
  }, [id, isNew]);

  function set<K extends keyof ArticleForm>(k: K, v: ArticleForm[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  async function save(e: FormEvent) {
    e.preventDefault();
    setErr(null);
    setSaving(true);

    const payload = {
      slug: form.slug || slugify(form.title),
      title: form.title,
      subtitle: form.subtitle || null,
      excerpt: form.excerpt || null,
      body_markdown: form.body_markdown,
      cover_image_url: form.cover_image_url || null,
      category: form.category || null,
      tags: form.tags.split(',').map((t) => t.trim()).filter(Boolean),
      hashtags: form.hashtags.split(',').map((t) => t.trim().toLowerCase().replace(/^#/, '')).filter(Boolean),
      status: form.status,
      seo_title: form.seo_title || null,
      seo_description: form.seo_description || null,
      seo_keywords: form.seo_keywords.split(',').map((t) => t.trim()).filter(Boolean),
      og_image_url: form.og_image_url || null,
      og_description: form.og_description || null,
      cta_text: form.cta_text || null,
      cta_url: form.cta_url || null,
      author_id: user?.id ?? null,
      published_at: form.status === 'published' ? new Date().toISOString() : null,
    };

    const q = isNew
      ? supabase.from('articles').insert(payload).select().single()
      : supabase.from('articles').update(payload).eq('id', id).select().single();

    const { data, error } = await q;
    setSaving(false);
    if (error) { setErr(error.message); return; }
    if (isNew && data) nav(`/admin/articles/${data.id}`, { replace: true });
  }

  const [aiTopic, setAiTopic] = useState('');
  const [aiBusy, setAiBusy] = useState(false);
  const [aiErr, setAiErr] = useState<string | null>(null);

  async function generateWithAI() {
    setAiErr(null);
    setAiBusy(true);
    try {
      // Pull article-bot config so manual editor uses the SAME settings the bot uses.
      const { data: cfg } = await supabase.from('bot_settings').select('*').eq('id', 1).single();
      const r = await fetch(`${BRAIN_URL}/generate-article`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: aiTopic || form.title || 'A trending IPTV / streaming topic',
          language: cfg?.ai_writer_default_language ?? 'en',
          tone: cfg?.ai_writer_default_tone ?? 'professional',
          min_words: cfg?.ai_writer_min_words ?? 600,
          max_words: cfg?.ai_writer_max_words ?? 1400,
          keywords_count: cfg?.ai_writer_keywords_per_post ?? 8,
          hashtags_count: cfg?.ai_writer_hashtags_per_post ?? 6,
          default_hashtags: cfg?.ai_writer_default_hashtags ?? [],
          cta_text: cfg?.ai_writer_default_cta_text ?? form.cta_text,
          cta_url: cfg?.ai_writer_default_cta_url ?? form.cta_url,
          system_prompt: cfg?.ai_writer_system_prompt,
          model: cfg?.ai_writer_model ?? 'openai/gpt-4o-mini',
        }),
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data.error || data.detail || `HTTP ${r.status}`);
      setForm((f) => ({
        ...f,
        title: data.title ?? f.title,
        slug: data.slug ?? f.slug,
        subtitle: data.subtitle ?? f.subtitle,
        excerpt: data.excerpt ?? f.excerpt,
        body_markdown: data.body_markdown ?? f.body_markdown,
        // Cover image generated by Cloudflare Workers AI (Flux), edge-cached.
        cover_image_url: data.cover_image_url ?? f.cover_image_url,
        seo_title: data.seo_title ?? f.seo_title,
        seo_description: data.seo_description ?? f.seo_description,
        seo_keywords: (data.seo_keywords ?? []).join(', '),
        hashtags: (data.hashtags ?? []).join(', '),
        og_description: data.og_description ?? f.og_description,
        og_image_url: data.og_image_url ?? data.cover_image_url ?? f.og_image_url,
        cta_text: data.cta_text ?? f.cta_text,
        cta_url: data.cta_url ?? f.cta_url,
      }));
    } catch (e) {
      setAiErr((e as Error).message);
    } finally {
      setAiBusy(false);
    }
  }

  if (loading) return <div className="p-10 text-zinc-500 text-sm">Loading…</div>;

  return (
    <form onSubmit={save} className="p-10 max-w-5xl">
      <div className="flex items-center justify-between mb-8">
        <Link to="/admin/articles" className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] font-bold text-zinc-500 hover:text-white">
          <ArrowLeft className="w-4 h-4" />
          Back to articles
        </Link>
        <div className="flex items-center gap-2">
          {!isNew && form.status === 'published' && (
            <Link to={`/blog/${form.slug}`} target="_blank" className="inline-flex items-center gap-2 glass-card px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest text-zinc-300 hover:text-white">
              <Eye className="w-3.5 h-3.5" />
              Preview live
            </Link>
          )}
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 bg-electric-blue hover:bg-blue-600 text-white font-bold px-5 py-2 rounded-xl text-sm shadow-[0_0_25px_rgba(59,130,246,0.3)] disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Saving…' : 'Save'}
          </button>
        </div>
      </div>

      <h1 className="text-3xl font-black tracking-tighter mb-8">{isNew ? 'New article' : 'Edit article'}</h1>

      {/* ── AI generate panel ── */}
      <div className="glass-card rounded-2xl p-5 mb-6 border-electric-blue/20">
        <div className="flex items-center gap-2 mb-2">
          <Wand2 className="w-4 h-4 text-electric-blue" />
          <p className="text-[10px] uppercase tracking-[0.3em] font-bold text-electric-blue">Generate with AI</p>
        </div>
        <p className="text-xs text-zinc-500 mb-3">Enter a topic — the article bot fills title, body, SEO, hashtags & CTA using the settings from <Link to="/admin/article-bot" className="text-electric-blue hover:underline">Article Bot</Link>. Edit anything before saving.</p>
        <div className="flex gap-3">
          <input
            value={aiTopic}
            onChange={(e) => setAiTopic(e.target.value)}
            placeholder="e.g. Best IPTV apps for Firestick in 2026"
            className="form-input flex-1"
          />
          <button
            type="button"
            onClick={generateWithAI}
            disabled={aiBusy}
            className="inline-flex items-center gap-2 bg-electric-blue text-white font-bold px-5 py-2 rounded-xl text-sm disabled:opacity-50"
          >
            <Wand2 className="w-4 h-4" />
            {aiBusy ? 'Generating…' : 'Generate'}
          </button>
        </div>
        {aiErr && <p className="mt-2 text-xs text-red-400">{aiErr}</p>}
      </div>

      {err && <p className="mb-4 text-xs text-red-400 bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-2">{err}</p>}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main column */}
        <div className="lg:col-span-2 space-y-5">
          <Field label="Title">
            <input
              required
              value={form.title}
              onChange={(e) => {
                set('title', e.target.value);
                if (!form.slug || isNew) set('slug', slugify(e.target.value));
              }}
              className="form-input"
              placeholder="Top 7 IPTV tips for buffer-free Premier League streaming"
            />
          </Field>
          <Field label="Slug" hint={`/blog/${form.slug || 'your-slug'}`}>
            <input required value={form.slug} onChange={(e) => set('slug', slugify(e.target.value))} className="form-input" />
          </Field>
          <Field label="Subtitle">
            <input value={form.subtitle} onChange={(e) => set('subtitle', e.target.value)} className="form-input" />
          </Field>
          <Field label="Excerpt" hint="Shown on listing cards & defaults to SEO description.">
            <textarea rows={3} value={form.excerpt} onChange={(e) => set('excerpt', e.target.value)} className="form-input" />
          </Field>
          <Field label="Body (Markdown)">
            <textarea required rows={18} value={form.body_markdown} onChange={(e) => set('body_markdown', e.target.value)} className="form-input font-mono text-[13px] leading-relaxed" placeholder="## Heading&#10;&#10;Your article content in **markdown**…" />
          </Field>
        </div>

        {/* Sidebar */}
        <aside className="space-y-5">
          <div className="glass-card rounded-2xl p-5 space-y-4">
            <p className="text-[10px] uppercase tracking-[0.3em] font-bold text-zinc-500">Publishing</p>
            <Field label="Status">
              <select value={form.status} onChange={(e) => set('status', e.target.value as ArticleForm['status'])} className="form-input">
                <option value="draft">Draft</option>
                <option value="scheduled">Scheduled</option>
                <option value="published">Published</option>
                <option value="archived">Archived</option>
              </select>
            </Field>
            <Field label="Category" hint="Pick one of the five SEO categories so the post shows up under the right filter chip on /blog.">
              <select value={form.category} onChange={(e) => set('category', e.target.value)} className="form-input">
                <option value="">— Uncategorized —</option>
                {SEO_CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
                {/* If the article already has a non-standard category (e.g. older
                    rows with "general"), keep it in the dropdown so editing
                    doesn't silently change it. */}
                {form.category && !SEO_CATEGORIES.includes(form.category) && (
                  <option value={form.category}>{form.category} (custom)</option>
                )}
              </select>
            </Field>
            <Field label="Tags" hint="Comma-separated, used for filtering.">
              <input value={form.tags} onChange={(e) => set('tags', e.target.value)} className="form-input" placeholder="iptv, 4k, premier-league" />
            </Field>
            <Field label="Hashtags" hint="Lowercase, no #, comma-separated. Displayed at the bottom of the post + used for social previews.">
              <input value={form.hashtags} onChange={(e) => set('hashtags', e.target.value)} className="form-input" placeholder="iptv, 4k, streaming, mediahubaccess" />
            </Field>
            <Field label="Cover image URL">
              <input value={form.cover_image_url} onChange={(e) => set('cover_image_url', e.target.value)} className="form-input" placeholder="/posters/last-of-us.webp" />
            </Field>
          </div>

          <div className="glass-card rounded-2xl p-5 space-y-4">
            <p className="text-[10px] uppercase tracking-[0.3em] font-bold text-zinc-500">In-article CTA</p>
            <p className="text-[11px] text-zinc-500 -mt-2">Renders as a button inside the published post — defaults to a WhatsApp link so readers chat to Liam directly. Override per article if needed.</p>
            <Field label="CTA button text">
              <input value={form.cta_text} onChange={(e) => set('cta_text', e.target.value)} className="form-input" placeholder="Chat on WhatsApp — Free 12h Test" />
            </Field>
            <Field label="CTA target URL" hint="wa.me link opens WhatsApp on the user's device. You can also use a same-site anchor like https://mediahubaccess.com/#pricing">
              <input value={form.cta_url} onChange={(e) => set('cta_url', e.target.value)} className="form-input" placeholder="https://wa.me/447411202861?text=…" />
            </Field>
          </div>

          <div className="glass-card rounded-2xl p-5 space-y-4">
            <p className="text-[10px] uppercase tracking-[0.3em] font-bold text-zinc-500">SEO</p>
            <Field label="SEO title" hint="Falls back to Title. Max ~60 chars.">
              <input value={form.seo_title} onChange={(e) => set('seo_title', e.target.value)} className="form-input" maxLength={70} />
            </Field>
            <Field label="SEO description" hint="Falls back to excerpt. Max ~160 chars.">
              <textarea rows={3} value={form.seo_description} onChange={(e) => set('seo_description', e.target.value)} className="form-input" maxLength={170} />
            </Field>
            <Field label="Keywords" hint="Comma-separated.">
              <input value={form.seo_keywords} onChange={(e) => set('seo_keywords', e.target.value)} className="form-input" />
            </Field>
            <Field label="OG description" hint="Falls back to SEO description. Max ~180 chars.">
              <textarea rows={2} value={form.og_description} onChange={(e) => set('og_description', e.target.value)} className="form-input" maxLength={190} />
            </Field>
            <Field label="Open Graph image URL" hint="Falls back to cover image.">
              <input value={form.og_image_url} onChange={(e) => set('og_image_url', e.target.value)} className="form-input" />
            </Field>
          </div>
        </aside>
      </div>
    </form>
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="block text-[10px] uppercase tracking-[0.2em] font-bold text-zinc-500 mb-1.5">{label}</span>
      {children}
      {hint && <span className="block text-[10px] text-zinc-600 mt-1">{hint}</span>}
    </label>
  );
}
