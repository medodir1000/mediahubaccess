import { useEffect, useState, type FormEvent, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { Save, Sparkles, FileText, Wand2, RefreshCw, Radio } from 'lucide-react';
import { supabase } from '../lib/supabase';

const BRAIN_URL = (import.meta.env.VITE_BRAIN_URL as string | undefined) ?? 'http://localhost:5000';

// MUST match SEO_CATEGORIES in BlogPage.tsx + brain.py.
const SEO_CATEGORIES = [
  'Streaming Guides',
  'Sports & Live TV',
  'Smart TV Apps',
  'Device Reviews',
  'Movies & Series',
];

type ArticleBotSettings = {
  ai_writer_enabled: boolean;
  ai_writer_model: string;
  ai_writer_image_model: string;
  ai_writer_default_length: number;
  ai_writer_min_words: number;
  ai_writer_max_words: number;
  ai_writer_default_tone: 'professional' | 'casual' | 'friendly' | 'authoritative' | 'playful';
  ai_writer_default_language: 'en' | 'fr' | 'ar' | 'es';
  ai_writer_default_category: string;
  ai_writer_keywords_per_post: number;
  ai_writer_hashtags_per_post: number;
  ai_writer_default_hashtags: string[];
  ai_writer_default_cta_text: string;
  ai_writer_default_cta_url: string;
  ai_writer_image_prompt_tpl: string;
  ai_writer_auto_publish: boolean;
  ai_writer_seo_meta: boolean;
  ai_writer_schedule_enabled: boolean;
  ai_writer_schedule_cron: string;
  ai_writer_default_topics: string[];
  ai_writer_system_prompt: string;
};

type GeneratedArticle = {
  title: string;
  slug: string;
  subtitle: string;
  excerpt: string;
  body_markdown: string;
  seo_title: string;
  seo_description: string;
  og_description: string;
  seo_keywords: string[];
  hashtags: string[];
  cta_text: string;
  cta_url: string;
  image_prompt: string;
  cover_image_url?: string | null;   // ← populated by brain.py via Cloudflare Workers AI worker
  og_image_url?: string | null;
  reading_minutes: number;
  generated_by_ai?: boolean;
  ai_model?: string;
};

export default function AdminArticleBotPage() {
  const nav = useNavigate();
  const [form, setForm] = useState<ArticleBotSettings | null>(null);
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<Date | null>(null);
  const [err, setErr] = useState<string | null>(null);

  // Manual generator state
  const [topic, setTopic] = useState('');
  const [generating, setGenerating] = useState(false);
  const [genErr, setGenErr] = useState<string | null>(null);
  const [preview, setPreview] = useState<GeneratedArticle | null>(null);
  const [inserting, setInserting] = useState(false);

  // Live RSS topic pool — replaces the static `ai_writer_default_topics` chips.
  // Refreshes every 5 min, and topics removed automatically once used.
  type RssTopic = { title: string; link: string; source: string };
  const [rssTopics, setRssTopics] = useState<RssTopic[]>([]);
  const [rssRefreshing, setRssRefreshing] = useState(false);
  const [rssMeta, setRssMeta] = useState<{ ageMin: number; fresh: number; covered: number } | null>(null);

  async function loadRssTopics(force = false) {
    setRssRefreshing(true);
    try {
      const r = await fetch(`${BRAIN_URL}/rss-topics${force ? '?refresh=1' : ''}`);
      const data = await r.json();
      setRssTopics(data.topics || []);
      setRssMeta({
        ageMin: Math.round((data.cache_age_s || 0) / 60),
        fresh: data.fresh_count || 0,
        covered: data.covered_count || 0,
      });
    } catch (e) {
      console.error('RSS load failed', e);
    } finally {
      setRssRefreshing(false);
    }
  }

  useEffect(() => {
    loadRssTopics();
    const id = setInterval(() => loadRssTopics(false), 5 * 60 * 1000); // every 5 min
    return () => clearInterval(id);
  }, []);

  async function markTopicCovered(title: string) {
    try {
      await fetch(`${BRAIN_URL}/rss-topics/mark-covered`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title }),
      });
      setRssTopics((ts) => ts.filter((t) => t.title !== title));
    } catch (e) {
      console.error('mark-covered failed', e);
    }
  }

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase.from('bot_settings').select('*').eq('id', 1).single();
      if (error) { setErr(error.message); return; }
      setForm(data as ArticleBotSettings);
    })();
  }, []);

  async function saveSettings(e: FormEvent) {
    e.preventDefault();
    if (!form) return;
    setSaving(true);
    setErr(null);
    const { error } = await supabase.from('bot_settings').update(form).eq('id', 1);
    setSaving(false);
    if (error) setErr(error.message);
    else setSavedAt(new Date());
  }

  function set<K extends keyof ArticleBotSettings>(k: K, v: ArticleBotSettings[K]) {
    setForm((f) => (f ? { ...f, [k]: v } : f));
  }

  async function generate(useTopic: string) {
    if (!form) return;
    setGenErr(null);
    setPreview(null);
    setGenerating(true);
    try {
      const r = await fetch(`${BRAIN_URL}/generate-article`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: useTopic,
          language: form.ai_writer_default_language,
          tone: form.ai_writer_default_tone,
          min_words: form.ai_writer_min_words,
          max_words: form.ai_writer_max_words,
          keywords_count: form.ai_writer_keywords_per_post,
          hashtags_count: form.ai_writer_hashtags_per_post,
          default_hashtags: form.ai_writer_default_hashtags,
          cta_text: form.ai_writer_default_cta_text,
          cta_url: form.ai_writer_default_cta_url,
          system_prompt: form.ai_writer_system_prompt,
          model: form.ai_writer_model,
        }),
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data.error || data.detail || `HTTP ${r.status}`);
      setPreview(data as GeneratedArticle);
      // Topic just used — mark it covered so the chip disappears.
      markTopicCovered(useTopic);
    } catch (e) {
      setGenErr((e as Error).message);
    } finally {
      setGenerating(false);
    }
  }

  async function insertPreview() {
    if (!preview || !form) return;
    setInserting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const payload = {
        slug: preview.slug,
        title: preview.title,
        subtitle: preview.subtitle || null,
        excerpt: preview.excerpt || null,
        body_markdown: preview.body_markdown,
        // Cover image URL is populated by brain.py via the Cloudflare Workers AI worker
        // — Flux generates on first hit and the result is edge-cached for 30 days.
        cover_image_url: preview.cover_image_url || null,
        category: form.ai_writer_default_category,
        tags: preview.seo_keywords?.slice(0, 5) || [],
        hashtags: preview.hashtags || [],
        status: form.ai_writer_auto_publish ? 'published' : 'draft',
        seo_title: preview.seo_title || null,
        seo_description: preview.seo_description || null,
        seo_keywords: preview.seo_keywords || [],
        og_description: preview.og_description || null,
        og_image_url: preview.og_image_url || preview.cover_image_url || null,
        cta_text: preview.cta_text || form.ai_writer_default_cta_text,
        cta_url: preview.cta_url || form.ai_writer_default_cta_url,
        generated_by_ai: true,
        ai_model: preview.ai_model || form.ai_writer_model,
        reading_minutes: preview.reading_minutes || null,
        author_id: user?.id ?? null,
        published_at: form.ai_writer_auto_publish ? new Date().toISOString() : null,
      };
      const { data, error } = await supabase.from('articles').insert(payload).select().single();
      if (error) throw error;
      nav(`/admin/articles/${data.id}`);
    } catch (e) {
      setGenErr((e as Error).message);
    } finally {
      setInserting(false);
    }
  }

  if (!form) return <div className="p-10 text-zinc-500 text-sm">{err ?? 'Loading…'}</div>;

  return (
    <div className="p-10 max-w-7xl space-y-10">
      <div>
        <p className="text-[10px] uppercase tracking-[0.3em] font-bold text-zinc-600">AI Article Bot</p>
        <h1 className="text-4xl font-black tracking-tighter mt-1">Article Bot</h1>
        <p className="text-zinc-500 text-sm mt-1">Generate SEO-optimised blog posts on demand or on a schedule — full control over the writer.</p>
      </div>

      {err && <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-2">{err}</p>}

      {/* ─────────── Manual generator ─────────── */}
      <section className="glass-card rounded-2xl p-6 border-electric-blue/30">
        <div className="flex items-center gap-3 mb-4">
          <Sparkles className="w-5 h-5 text-electric-blue" />
          <h2 className="text-xl font-bold">Generate an article now</h2>
        </div>
        <p className="text-sm text-zinc-400 mb-5">Enter a topic, click Generate. Preview the article, tweak if needed, then push it into the Articles table.</p>

        <div className="flex gap-3">
          <input
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="e.g. Best IPTV apps for Firestick in 2026"
            className="form-input flex-1"
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); if (topic) generate(topic); } }}
          />
          <button
            type="button"
            onClick={() => generate(topic)}
            disabled={!topic || generating}
            className="inline-flex items-center gap-2 bg-electric-blue text-white font-bold px-5 py-2 rounded-xl text-sm shadow-[0_0_25px_rgba(59,130,246,0.3)] disabled:opacity-50"
          >
            <Wand2 className="w-4 h-4" />
            {generating ? 'Generating…' : 'Generate'}
          </button>
        </div>

        <div className="mt-4 flex items-center justify-between text-[10px] uppercase tracking-[0.2em] font-bold">
          <div className="flex items-center gap-2 text-zinc-600">
            <Radio className={'w-3 h-3 ' + (rssRefreshing ? 'animate-pulse text-electric-blue' : 'text-zinc-400')} />
            <span>Live RSS topics</span>
            {rssMeta && (
              <span className="text-zinc-500 normal-case tracking-normal">
                · {rssMeta.fresh} fresh · {rssMeta.covered} used · refreshed {rssMeta.ageMin} min ago
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={() => loadRssTopics(true)}
            disabled={rssRefreshing}
            className="inline-flex items-center gap-1.5 text-electric-blue hover:underline disabled:opacity-50"
          >
            <RefreshCw className={'w-3 h-3 ' + (rssRefreshing ? 'animate-spin' : '')} />
            Refresh
          </button>
        </div>
        <div className="mt-2 flex flex-wrap gap-2">
          {rssTopics.length === 0 && !rssRefreshing && (
            <span className="text-[11px] text-zinc-500">No fresh topics right now — feeds may be slow. Click Refresh.</span>
          )}
          {rssTopics.slice(0, 20).map((t) => {
            const sourceHost = (() => { try { return new URL(t.source).hostname.replace('www.', ''); } catch { return t.source; } })();
            return (
              <button
                key={t.title}
                type="button"
                onClick={() => { setTopic(t.title); generate(t.title); }}
                disabled={generating}
                title={`From ${sourceHost}`}
                className="group inline-flex items-center gap-1.5 text-[11px] bg-white hover:bg-electric-blue/10 hover:text-electric-blue border border-zinc-200 hover:border-electric-blue rounded-full px-3 py-1.5 transition disabled:opacity-50"
              >
                <span className="truncate max-w-[280px]">{t.title}</span>
                <span className="text-[9px] text-zinc-500 group-hover:text-electric-blue/70 font-medium uppercase tracking-wider">{sourceHost}</span>
              </button>
            );
          })}
        </div>

        {genErr && <p className="mt-3 text-xs text-red-400 bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-2">{genErr}</p>}

        {preview && (
          <div className="mt-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] uppercase tracking-[0.3em] font-bold text-zinc-500">Preview</p>
                <h3 className="text-2xl font-bold mt-1">{preview.title}</h3>
                {preview.subtitle && <p className="text-zinc-400 text-sm mt-1">{preview.subtitle}</p>}
              </div>
              <button
                type="button"
                onClick={insertPreview}
                disabled={inserting}
                className="inline-flex items-center gap-2 bg-green-500/20 hover:bg-green-500/30 text-green-300 border border-green-500/40 font-bold px-4 py-2 rounded-xl text-sm disabled:opacity-50"
              >
                <FileText className="w-4 h-4" />
                {inserting ? 'Saving…' : `Insert as ${form.ai_writer_auto_publish ? 'published' : 'draft'}`}
              </button>
            </div>

            {preview.cover_image_url && (
              <div className="bg-black/40 rounded-lg p-3 flex items-start gap-4">
                <img
                  src={preview.cover_image_url}
                  alt="AI-generated cover"
                  className="w-40 h-40 object-cover rounded-lg border border-white/10 shrink-0"
                  loading="lazy"
                />
                <div className="flex-1 text-xs space-y-1.5">
                  <p className="text-zinc-500"><span className="font-bold text-electric-blue">Cover image (Cloudflare Workers AI)</span></p>
                  <p className="text-zinc-400 leading-relaxed">{preview.image_prompt}</p>
                  <p className="text-zinc-600 text-[10px] break-all">First load runs Flux on Cloudflare (~3s), then edge-cached for 30 days.</p>
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="bg-black/40 rounded-lg p-3"><span className="text-zinc-500">Slug:</span> <code className="text-zinc-300">{preview.slug}</code></div>
              <div className="bg-black/40 rounded-lg p-3"><span className="text-zinc-500">Reading:</span> <span className="text-zinc-300">{preview.reading_minutes} min</span></div>
              <div className="bg-black/40 rounded-lg p-3"><span className="text-zinc-500">SEO title:</span> <span className="text-zinc-300">{preview.seo_title}</span></div>
              <div className="bg-black/40 rounded-lg p-3"><span className="text-zinc-500">SEO desc:</span> <span className="text-zinc-300">{preview.seo_description}</span></div>
              <div className="bg-black/40 rounded-lg p-3 col-span-2"><span className="text-zinc-500">Keywords:</span> <span className="text-zinc-300">{preview.seo_keywords?.join(', ')}</span></div>
              <div className="bg-black/40 rounded-lg p-3 col-span-2"><span className="text-zinc-500">Hashtags:</span> <span className="text-zinc-300">{preview.hashtags?.map((h) => `#${h}`).join(' ')}</span></div>
              <div className="bg-black/40 rounded-lg p-3 col-span-2"><span className="text-zinc-500">Image prompt:</span> <span className="text-zinc-300">{preview.image_prompt}</span></div>
            </div>

            <details className="bg-black/40 rounded-lg">
              <summary className="cursor-pointer p-3 text-xs font-bold text-zinc-300">Body (Markdown)</summary>
              <pre className="p-4 text-xs text-zinc-400 whitespace-pre-wrap font-mono leading-relaxed border-t border-white/5 max-h-96 overflow-y-auto">{preview.body_markdown}</pre>
            </details>
          </div>
        )}
      </section>

      {/* ─────────── Settings ─────────── */}
      <form onSubmit={saveSettings} className="space-y-5">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold">Settings</h2>
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 bg-electric-blue text-white font-bold px-5 py-2 rounded-xl text-sm shadow-[0_0_25px_rgba(59,130,246,0.3)] disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Saving…' : 'Save settings'}
          </button>
        </div>
        {savedAt && <p className="text-xs text-green-400">Saved at {savedAt.toLocaleTimeString()}</p>}

        <label className="glass-card rounded-2xl p-5 flex items-center justify-between cursor-pointer">
          <div>
            <p className="text-sm font-bold mb-1">Article bot enabled</p>
            <p className="text-xs text-zinc-500">Master switch — disables both manual & scheduled generation.</p>
          </div>
          <input type="checkbox" checked={form.ai_writer_enabled} onChange={(e) => set('ai_writer_enabled', e.target.checked)} className="w-5 h-5 accent-electric-blue" />
        </label>

        <div className="grid grid-cols-2 gap-5">
          <Field label="Article model" hint="OpenRouter model for body generation.">
            <input value={form.ai_writer_model} onChange={(e) => set('ai_writer_model', e.target.value)} className="form-input" />
          </Field>
          <Field label="Image model" hint="Cloudflare Workers AI model for cover images.">
            <input value={form.ai_writer_image_model} onChange={(e) => set('ai_writer_image_model', e.target.value)} className="form-input" />
          </Field>
        </div>

        <div className="grid grid-cols-3 gap-5">
          <Field label="Tone">
            <select value={form.ai_writer_default_tone} onChange={(e) => set('ai_writer_default_tone', e.target.value as ArticleBotSettings['ai_writer_default_tone'])} className="form-input">
              <option value="professional">Professional</option>
              <option value="casual">Casual</option>
              <option value="friendly">Friendly</option>
              <option value="authoritative">Authoritative</option>
              <option value="playful">Playful</option>
            </select>
          </Field>
          <Field label="Language">
            <select value={form.ai_writer_default_language} onChange={(e) => set('ai_writer_default_language', e.target.value as ArticleBotSettings['ai_writer_default_language'])} className="form-input">
              <option value="en">English</option>
              <option value="fr">Français</option>
              <option value="ar">العربية</option>
              <option value="es">Español</option>
            </select>
          </Field>
          <Field label="Default category" hint="Used when the auto-writer hasn't picked a rotating category yet.">
            <select value={form.ai_writer_default_category} onChange={(e) => set('ai_writer_default_category', e.target.value)} className="form-input">
              {SEO_CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
              {form.ai_writer_default_category && !SEO_CATEGORIES.includes(form.ai_writer_default_category) && (
                <option value={form.ai_writer_default_category}>{form.ai_writer_default_category} (custom)</option>
              )}
            </select>
          </Field>
        </div>

        <div className="grid grid-cols-4 gap-5">
          <Field label="Min words"><input type="number" value={form.ai_writer_min_words} onChange={(e) => set('ai_writer_min_words', Number(e.target.value))} className="form-input" /></Field>
          <Field label="Max words"><input type="number" value={form.ai_writer_max_words} onChange={(e) => set('ai_writer_max_words', Number(e.target.value))} className="form-input" /></Field>
          <Field label="Keywords / post"><input type="number" value={form.ai_writer_keywords_per_post} onChange={(e) => set('ai_writer_keywords_per_post', Number(e.target.value))} className="form-input" /></Field>
          <Field label="Hashtags / post"><input type="number" value={form.ai_writer_hashtags_per_post} onChange={(e) => set('ai_writer_hashtags_per_post', Number(e.target.value))} className="form-input" /></Field>
        </div>

        <Field label="Default hashtags" hint="Always-included hashtags. Comma-separated, no # prefix.">
          <input
            value={form.ai_writer_default_hashtags.join(', ')}
            onChange={(e) => set('ai_writer_default_hashtags', e.target.value.split(',').map((s) => s.trim().toLowerCase()).filter(Boolean))}
            className="form-input"
            placeholder="iptv, 4k, streaming, mediahubaccess"
          />
        </Field>

        <div className="grid grid-cols-2 gap-5">
          <Field label="In-article CTA text">
            <input value={form.ai_writer_default_cta_text} onChange={(e) => set('ai_writer_default_cta_text', e.target.value)} className="form-input" />
          </Field>
          <Field label="In-article CTA URL" hint="Where the CTA button inside each article points to.">
            <input value={form.ai_writer_default_cta_url} onChange={(e) => set('ai_writer_default_cta_url', e.target.value)} className="form-input" />
          </Field>
        </div>

        <Field label="Image prompt template" hint="{{title}} is replaced with the article title.">
          <textarea rows={3} value={form.ai_writer_image_prompt_tpl} onChange={(e) => set('ai_writer_image_prompt_tpl', e.target.value)} className="form-input font-mono text-[13px]" />
        </Field>

        <Field label="System prompt for the writer" hint="The persona / brief sent to the LLM on every generation.">
          <textarea rows={8} value={form.ai_writer_system_prompt} onChange={(e) => set('ai_writer_system_prompt', e.target.value)} className="form-input font-mono text-[13px] leading-relaxed" />
        </Field>

        <Field label="Default topics (one per line)" hint="Quick-pick chips above. The scheduler also rotates through this list.">
          <textarea
            rows={6}
            value={form.ai_writer_default_topics.join('\n')}
            onChange={(e) => set('ai_writer_default_topics', e.target.value.split('\n').map((s) => s.trim()).filter(Boolean))}
            className="form-input"
          />
        </Field>

        <div className="grid grid-cols-2 gap-5">
          <label className="glass-card rounded-xl p-4 flex items-center justify-between cursor-pointer">
            <div>
              <p className="text-xs font-bold">Auto-publish</p>
              <p className="text-[10px] text-zinc-500">Skip draft, publish straight away.</p>
            </div>
            <input type="checkbox" checked={form.ai_writer_auto_publish} onChange={(e) => set('ai_writer_auto_publish', e.target.checked)} className="w-4 h-4 accent-electric-blue" />
          </label>
          <label className="glass-card rounded-xl p-4 flex items-center justify-between cursor-pointer">
            <div>
              <p className="text-xs font-bold">Generate SEO meta</p>
              <p className="text-[10px] text-zinc-500">Title, description, slug.</p>
            </div>
            <input type="checkbox" checked={form.ai_writer_seo_meta} onChange={(e) => set('ai_writer_seo_meta', e.target.checked)} className="w-4 h-4 accent-electric-blue" />
          </label>
        </div>

        <div className="glass-card rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-[10px] uppercase tracking-[0.3em] font-bold text-zinc-500">Scheduling</p>
            <label className="flex items-center gap-2 cursor-pointer">
              <span className="text-xs text-zinc-400">Enabled</span>
              <input type="checkbox" checked={form.ai_writer_schedule_enabled} onChange={(e) => set('ai_writer_schedule_enabled', e.target.checked)} className="w-4 h-4 accent-electric-blue" />
            </label>
          </div>
          <Field label="Cron expression" hint="Default '0 9 * * *' = every day at 09:00. (Server-side runner not included yet — wire to a Cloudflare Cron Trigger or Supabase Edge Function.)">
            <input value={form.ai_writer_schedule_cron} onChange={(e) => set('ai_writer_schedule_cron', e.target.value)} className="form-input font-mono" />
          </Field>
        </div>
      </form>
    </div>
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
