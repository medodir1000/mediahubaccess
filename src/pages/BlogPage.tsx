import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { ArrowRight, Calendar, Clock, Layers } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { supabase } from '../lib/supabase';

type Card = {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  cover_image_url: string | null;
  category: string | null;
  hashtags: string[] | null;
  published_at: string | null;
  read_time_min: number | null;
  reading_minutes: number | null;
};

const ALL = '__all__';

// Five SEO-relevant default categories — always rendered as filter chips,
// even before any article exists in them. Helps Google index the structure
// + gives the editor a clear topic taxonomy to write into.
const SEO_CATEGORIES = [
  'Streaming Guides',
  'Sports & Live TV',
  'Smart TV Apps',
  'Device Reviews',
  'Movies & Series',
];

export default function BlogPage() {
  const [posts, setPosts] = useState<Card[] | null>(null);
  const [active, setActive] = useState<string>(ALL);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from('articles')
        .select('id, slug, title, excerpt, cover_image_url, category, hashtags, published_at, read_time_min, reading_minutes')
        .eq('status', 'published')
        .order('published_at', { ascending: false })
        .limit(100);
      setPosts((data as Card[]) ?? []);
    })();
  }, []);

  // Build the chip list: SEO defaults always shown, plus any extra categories
  // we discover from actual articles. Counts come from the live data.
  const categories = useMemo(() => {
    const count = new Map<string, number>();
    // Seed every SEO default with 0 so chips render even before content exists.
    for (const c of SEO_CATEGORIES) count.set(c, 0);
    if (posts) {
      for (const p of posts) {
        const c = (p.category || '').trim();
        if (!c) continue;
        // Case-insensitive merge: keep the canonical (SEO default) capitalisation
        // when there's a match, otherwise add as-is.
        const canonical = SEO_CATEGORIES.find((sc) => sc.toLowerCase() === c.toLowerCase()) || c;
        count.set(canonical, (count.get(canonical) || 0) + 1);
      }
    }
    // SEO defaults first (preserves order), then any extras, by frequency.
    const seoEntries = SEO_CATEGORIES.map((c) => [c, count.get(c) || 0] as [string, number]);
    const extras = [...count.entries()]
      .filter(([c]) => !SEO_CATEGORIES.includes(c))
      .sort((a, b) => b[1] - a[1]);
    return [...seoEntries, ...extras];
  }, [posts]);

  const filtered = useMemo(() => {
    if (!posts) return [];
    if (active === ALL) return posts;
    return posts.filter((p) => (p.category || '').trim().toLowerCase() === active.toLowerCase());
  }, [posts, active]);

  return (
    <>
      <Helmet>
        <title>Blog — MediaHubAccess | Streaming Guides, Sports & Live TV, Smart TV Apps, Device Reviews, Movies & Series</title>
        <meta name="description" content="Streaming guides, sports & live TV, Smart TV apps, device reviews, movies and series — practical IPTV know-how from the MediaHubAccess team." />
        <meta name="keywords" content={SEO_CATEGORIES.join(', ').toLowerCase() + ', iptv, 4k streaming, mediahubaccess'} />
        <link rel="canonical" href="https://mediahubaccess.com/blog" />
        <meta property="og:title" content="MediaHubAccess Blog — Streaming Guides & IPTV Tips" />
        <meta property="og:description" content="Streaming guides, sports & live TV, Smart TV apps, device reviews, movies and series." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://mediahubaccess.com/blog" />
        <meta name="twitter:card" content="summary_large_image" />
        {/* JSON-LD: tells Google this is a blog with N posts indexed by category */}
        <script type="application/ld+json">{JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'Blog',
          name: 'MediaHubAccess Blog',
          url: 'https://mediahubaccess.com/blog',
          publisher: { '@type': 'Organization', name: 'MediaHubAccess', url: 'https://mediahubaccess.com' },
          about: SEO_CATEGORIES.map((c) => ({ '@type': 'Thing', name: c })),
          blogPost: (posts ?? []).slice(0, 20).map((p) => ({
            '@type': 'BlogPosting',
            headline: p.title,
            url: `https://mediahubaccess.com/blog/${p.slug}`,
            datePublished: p.published_at,
            articleSection: p.category || undefined,
            image: p.cover_image_url || undefined,
            description: p.excerpt || undefined,
          })),
        })}</script>
      </Helmet>

      <div className="min-h-screen bg-zinc-50 text-zinc-900">
        <Navbar />
        <main className="pt-32 pb-24">
          {/* ─── Page header ─── */}
          <div className="max-w-6xl mx-auto px-6 mb-12">
            <p className="text-[10px] uppercase tracking-[0.3em] font-bold text-electric-blue mb-3">Knowledge base</p>
            <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tighter mb-4 text-zinc-900">
              The <span className="blue-gradient">Blog</span>
            </h1>
            <p className="text-zinc-600 text-lg max-w-2xl">Streaming guides, IPTV setup tips, sport coverage and product reviews.</p>
          </div>

          {/* ─── Category chips — single horizontal row, scrolls on overflow ─── */}
          {categories.length > 0 && (
            <div className="max-w-6xl mx-auto px-6 mb-10">
              <div className="flex items-center gap-2 mb-3 text-zinc-500">
                <Layers className="w-3.5 h-3.5" />
                <span className="text-[10px] uppercase tracking-[0.3em] font-bold">Browse by category</span>
              </div>
              <div className="flex flex-nowrap gap-2 overflow-x-auto pb-2 -mx-6 px-6 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                <CategoryChip
                  label="All"
                  count={posts?.length ?? 0}
                  isActive={active === ALL}
                  onClick={() => setActive(ALL)}
                />
                {categories.map(([cat, n]) => (
                  <CategoryChip
                    key={cat}
                    label={cat}
                    count={n}
                    isActive={active.toLowerCase() === cat.toLowerCase()}
                    onClick={() => setActive(cat)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* ─── States ─── */}
          {!posts && (
            <div className="max-w-6xl mx-auto px-6 text-zinc-500 text-sm animate-pulse">Loading articles…</div>
          )}
          {posts && filtered.length === 0 && (
            <div className="max-w-6xl mx-auto px-6">
              <div className="glass-card rounded-2xl p-16 text-center">
                <p className="text-zinc-600 text-lg mb-2">No articles {active !== ALL ? `in “${active}”` : 'yet'} — check back soon.</p>
                {active !== ALL && (
                  <button onClick={() => setActive(ALL)} className="mt-3 text-electric-blue text-sm font-bold hover:underline">← Show all articles</button>
                )}
              </div>
            </div>
          )}

          {/* ─── Article grid (all same size) ─── */}
          {filtered.length > 0 && (
            <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((p) => (
                <Link
                  key={p.id}
                  to={`/blog/${p.slug}`}
                  className="group bg-white border border-zinc-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-lg hover:-translate-y-1 hover:border-electric-blue/30 transition-all flex flex-col"
                >
                  {p.cover_image_url ? (
                    <div className="aspect-[16/9] overflow-hidden bg-zinc-100">
                      <img src={p.cover_image_url} alt={p.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" loading="lazy" />
                    </div>
                  ) : (
                    <div className="aspect-[16/9] bg-gradient-to-br from-electric-blue/10 via-blue-50 to-white flex items-center justify-center">
                      <Layers className="w-12 h-12 text-electric-blue/30" />
                    </div>
                  )}
                  <div className="p-5 flex-1 flex flex-col">
                    {p.category && (
                      <p className="text-[10px] uppercase tracking-[0.25em] font-bold text-amber-600 mb-2">{p.category}</p>
                    )}
                    <h3 className="text-lg font-black tracking-tight mb-2 text-zinc-900 group-hover:text-electric-blue transition-colors leading-snug line-clamp-2">{p.title}</h3>
                    {p.excerpt && <p className="text-zinc-600 text-sm leading-relaxed mb-4 line-clamp-2">{p.excerpt}</p>}
                    <div className="mt-auto pt-4 border-t border-zinc-100 flex items-center justify-between text-xs text-zinc-500">
                      <Meta date={p.published_at} mins={p.read_time_min ?? p.reading_minutes} compact />
                      <span className="flex items-center gap-1 text-electric-blue font-bold group-hover:gap-2 transition-all">Read <ArrowRight className="w-3 h-3" /></span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </main>
        <Footer />
      </div>
    </>
  );
}

function CategoryChip({ label, count, isActive, onClick }: { label: string; count: number; isActive: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        'shrink-0 whitespace-nowrap inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-[0.12em] border transition-all ' +
        (isActive
          ? 'bg-electric-blue !text-white border-electric-blue shadow-[0_4px_14px_rgba(59,130,246,0.35)]'
          : 'bg-white text-zinc-700 border-zinc-200 hover:border-electric-blue hover:text-electric-blue')
      }
    >
      {label}
      <span className={(isActive ? 'bg-white/20 text-white' : 'bg-zinc-100 text-zinc-600') + ' rounded-full px-1.5 py-0.5 text-[9px] font-black leading-none'}>{count}</span>
    </button>
  );
}

function Meta({ date, mins, compact = false }: { date: string | null; mins: number | null; compact?: boolean }) {
  return (
    <div className={'flex items-center ' + (compact ? 'gap-3' : 'gap-5') + ' text-xs text-zinc-500 font-medium'}>
      {date && (
        <span className="flex items-center gap-1.5">
          <Calendar className="w-3.5 h-3.5" />
          {new Date(date).toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' })}
        </span>
      )}
      {mins && (
        <span className="flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5" />
          {mins} min read
        </span>
      )}
    </div>
  );
}
