import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { ArrowLeft, Calendar, Clock, ArrowRight } from 'lucide-react';
import { marked } from 'marked';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { supabase } from '../lib/supabase';

marked.setOptions({ breaks: true, gfm: true });

type Article = {
  id: string;
  slug: string;
  title: string;
  subtitle: string | null;
  excerpt: string | null;
  body_markdown: string;
  body_html: string | null;
  cover_image_url: string | null;
  category: string | null;
  tags: string[];
  hashtags: string[];
  seo_title: string | null;
  seo_description: string | null;
  seo_keywords: string[];
  og_image_url: string | null;
  og_description: string | null;
  canonical_url: string | null;
  read_time_min: number | null;
  reading_minutes: number | null;
  published_at: string | null;
  cta_text: string | null;
  cta_url: string | null;
  // JSON-LD structured data emitted by the auto-writer for rich snippets.
  // Stored as jsonb in Supabase, rendered as <script type="application/ld+json">
  // tags below. Null when the article doesn't qualify (e.g. HowTo is conditional).
  faq_jsonld: Record<string, unknown> | null;
  howto_jsonld: Record<string, unknown> | null;
};

// Defense-in-depth: even though faq_jsonld / howto_jsonld are server-validated,
// escape `</script>` sequences so a future injection can't break out of the tag.
function safeJsonLd(obj: unknown): string {
  return JSON.stringify(obj).replace(/<\/script/gi, '<\\/script');
}

const SITE_ORIGIN = 'https://mediahubaccess.com';
const DEFAULT_CTA_TEXT = 'Chat on WhatsApp — Free 12h Test';
const DEFAULT_CTA_URL = 'https://wa.me/447411202861?text=Hi%21%20I%27d%20like%20to%20try%20the%20free%2012-hour%204K%20test%20of%20MediaHubAccess';

export default function BlogArticlePage() {
  const { slug } = useParams<{ slug: string }>();
  const [article, setArticle] = useState<Article | null | 'not-found'>(null);

  useEffect(() => {
    if (!slug) return;
    (async () => {
      const { data, error } = await supabase
        .from('articles')
        .select('id, slug, title, subtitle, excerpt, body_markdown, body_html, cover_image_url, category, tags, hashtags, seo_title, seo_description, seo_keywords, og_image_url, og_description, canonical_url, read_time_min, reading_minutes, published_at, cta_text, cta_url, faq_jsonld, howto_jsonld')
        .eq('slug', slug)
        .eq('status', 'published')
        .single();
      if (error || !data) { setArticle('not-found'); return; }
      setArticle(data as Article);
      // Optional view counter — silently ignore if RPC doesn't exist yet.
      try { await supabase.rpc('increment_article_views', { p_id: data.id }); } catch {}
    })();
  }, [slug]);

  // IMPORTANT: useMemo must be called unconditionally (before any early
  // returns) to satisfy React's rules of hooks. Returns '' while the article
  // is loading / missing — render code below handles those cases.
  const bodyHtml = useMemo(() => {
    if (article === null || article === 'not-found') return '';
    if (article.body_html) return article.body_html;
    if (!article.body_markdown) return '';
    try { return marked.parse(article.body_markdown) as string; }
    catch { return article.body_markdown; }
  }, [article]);

  if (article === null) {
    return <div className="min-h-screen bg-zinc-50 flex items-center justify-center text-zinc-500 text-xs uppercase tracking-[0.3em] animate-pulse">Loading…</div>;
  }

  if (article === 'not-found') {
    return (
      <>
        <Helmet><title>Article not found — MediaHubAccess</title><meta name="robots" content="noindex" /></Helmet>
        <div className="min-h-screen bg-zinc-50 flex items-center justify-center p-6">
          <div className="glass-card rounded-2xl p-10 max-w-md text-center">
            <p className="text-xs uppercase tracking-[0.3em] font-bold text-zinc-500 mb-3">404</p>
            <p className="text-zinc-700 text-lg mb-6">This article doesn't exist or was unpublished.</p>
            <Link to="/blog" className="inline-flex items-center gap-2 bg-electric-blue !text-white text-sm font-bold px-4 py-2 rounded-xl shadow-sm hover:bg-blue-600 transition-colors">
              <ArrowLeft className="w-4 h-4" /> Back to blog
            </Link>
          </div>
        </div>
      </>
    );
  }

  const seoTitle = article.seo_title ?? article.title;
  const seoDesc = article.seo_description ?? article.excerpt ?? '';
  const ogDesc = article.og_description ?? seoDesc;
  const ogImage = article.og_image_url ?? article.cover_image_url ?? `${SITE_ORIGIN}/apple-touch-icon.svg`;
  const canonical = article.canonical_url ?? `${SITE_ORIGIN}/blog/${article.slug}`;
  const ctaText = (article.cta_text || DEFAULT_CTA_TEXT).trim();
  const ctaUrl = (article.cta_url || DEFAULT_CTA_URL).trim();
  const readMin = article.read_time_min ?? article.reading_minutes;
  const hashtags = article.hashtags ?? [];

  return (
    <>
      <Helmet>
        <title>{seoTitle} — MediaHubAccess</title>
        <meta name="description" content={seoDesc} />
        {article.seo_keywords.length > 0 && <meta name="keywords" content={article.seo_keywords.join(', ')} />}
        <link rel="canonical" href={canonical} />
        {/* Open Graph */}
        <meta property="og:title" content={seoTitle} />
        <meta property="og:description" content={ogDesc} />
        <meta property="og:image" content={ogImage} />
        <meta property="og:url" content={canonical} />
        <meta property="og:type" content="article" />
        {article.published_at && <meta property="article:published_time" content={article.published_at} />}
        {article.category && <meta property="article:section" content={article.category} />}
        {article.tags.map((t) => <meta key={t} property="article:tag" content={t} />)}
        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={seoTitle} />
        <meta name="twitter:description" content={seoDesc} />
        <meta name="twitter:image" content={ogImage} />
        {/* JSON-LD — BlogPosting (always) */}
        <script type="application/ld+json">{safeJsonLd({
          '@context': 'https://schema.org',
          '@type': 'BlogPosting',
          headline: seoTitle,
          description: seoDesc,
          image: ogImage,
          datePublished: article.published_at,
          mainEntityOfPage: canonical,
          publisher: { '@type': 'Organization', name: 'MediaHubAccess', logo: { '@type': 'ImageObject', url: `${SITE_ORIGIN}/apple-touch-icon.svg` } },
        })}</script>
        {/* JSON-LD — FAQPage (when the auto-writer extracted Q&A) */}
        {article.faq_jsonld && (
          <script type="application/ld+json">{safeJsonLd(article.faq_jsonld)}</script>
        )}
        {/* JSON-LD — HowTo (only on operational guides — server emits null otherwise) */}
        {article.howto_jsonld && (
          <script type="application/ld+json">{safeJsonLd(article.howto_jsonld)}</script>
        )}
      </Helmet>

      <div className="min-h-screen bg-zinc-50 text-zinc-900">
        <Navbar />
        <article className="pt-32 pb-24">
          <div className="max-w-3xl mx-auto px-6">
            <Link to="/blog" className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] font-bold text-zinc-500 hover:text-electric-blue mb-8 transition-colors">
              <ArrowLeft className="w-4 h-4" /> Back to blog
            </Link>

            {article.category && <p className="text-[10px] uppercase tracking-[0.3em] font-bold text-amber-600 mb-4">{article.category}</p>}
            <h1 className="text-4xl md:text-6xl font-black tracking-tighter mb-4 leading-tight text-zinc-900">{article.title}</h1>
            {article.subtitle && <p className="text-xl text-zinc-600 mb-8 leading-relaxed">{article.subtitle}</p>}

            <div className="flex items-center gap-6 text-xs text-zinc-500 uppercase tracking-widest font-bold mb-10 pb-8 border-b border-zinc-200">
              {article.published_at && (
                <span className="flex items-center gap-2"><Calendar className="w-3.5 h-3.5" />{new Date(article.published_at).toLocaleDateString()}</span>
              )}
              {readMin && (
                <span className="flex items-center gap-2"><Clock className="w-3.5 h-3.5" />{readMin} min read</span>
              )}
            </div>

            {article.cover_image_url && (
              <img src={article.cover_image_url} alt={article.title} className="w-full rounded-2xl mb-10 border border-white/5" />
            )}

            {/* Markdown is now parsed by `marked` and rendered with hand-rolled
                Tailwind arbitrary variants for a rich editorial look. */}
            <div
              className="
                text-zinc-800 text-[17px] leading-[1.85]
                [&_h1]:text-4xl [&_h1]:font-black [&_h1]:tracking-tighter [&_h1]:mt-12 [&_h1]:mb-5 [&_h1]:text-zinc-900
                [&_h2]:text-3xl [&_h2]:font-bold [&_h2]:tracking-tight [&_h2]:mt-12 [&_h2]:mb-4 [&_h2]:text-zinc-900 [&_h2]:scroll-mt-24 [&_h2]:border-l-4 [&_h2]:border-electric-blue [&_h2]:pl-4
                [&_h3]:text-xl [&_h3]:font-bold [&_h3]:mt-9 [&_h3]:mb-3 [&_h3]:text-zinc-900
                [&_h4]:text-lg [&_h4]:font-bold [&_h4]:mt-7 [&_h4]:mb-2 [&_h4]:text-zinc-800
                [&_p]:mb-5 [&_p]:text-zinc-700
                [&_a]:text-electric-blue [&_a]:underline [&_a]:underline-offset-4 [&_a]:decoration-electric-blue/40 hover:[&_a]:decoration-electric-blue
                [&_strong]:text-zinc-900 [&_strong]:font-semibold
                [&_em]:italic [&_em]:text-zinc-700
                [&_ul]:my-6 [&_ul]:pl-6 [&_ul]:space-y-2 [&_ul>li]:list-disc [&_ul>li]:marker:text-electric-blue
                [&_ol]:my-6 [&_ol]:pl-6 [&_ol]:space-y-2 [&_ol>li]:list-decimal [&_ol>li]:marker:text-electric-blue [&_ol>li]:marker:font-bold
                [&_li]:text-zinc-700 [&_li]:leading-relaxed
                [&_code]:bg-zinc-100 [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-[0.92em] [&_code]:text-electric-blue [&_code]:font-mono [&_code]:border [&_code]:border-zinc-200
                [&_pre]:bg-zinc-900 [&_pre]:border [&_pre]:border-zinc-700 [&_pre]:rounded-xl [&_pre]:p-5 [&_pre]:my-6 [&_pre]:overflow-x-auto
                [&_pre>code]:bg-transparent [&_pre>code]:text-zinc-100 [&_pre>code]:p-0 [&_pre>code]:border-0
                [&_blockquote]:border-l-4 [&_blockquote]:border-luxury-gold [&_blockquote]:pl-5 [&_blockquote]:py-3 [&_blockquote]:my-6 [&_blockquote]:italic [&_blockquote]:text-zinc-700 [&_blockquote]:bg-amber-50/60 [&_blockquote]:rounded-r-lg
                [&_hr]:border-zinc-200 [&_hr]:my-10
                [&_img]:rounded-xl [&_img]:my-8 [&_img]:border [&_img]:border-zinc-200 [&_img]:shadow-sm
                [&_table]:w-full [&_table]:my-6 [&_table]:border [&_table]:border-zinc-200 [&_table]:rounded-lg [&_table]:overflow-hidden
                [&_th]:bg-zinc-100 [&_th]:px-4 [&_th]:py-2 [&_th]:text-left [&_th]:text-zinc-700 [&_th]:font-bold [&_th]:text-sm
                [&_td]:px-4 [&_td]:py-2 [&_td]:border-t [&_td]:border-zinc-200 [&_td]:text-zinc-700 [&_td]:text-sm
              "
              dangerouslySetInnerHTML={{ __html: bodyHtml }}
            />

            {/* In-article CTA — points to the same destination as the home page
                "Get Started" / "INITIALIZE LICENSE" buttons (WhatsApp by default). */}
            <div className="mt-14 mb-4 rounded-2xl border border-electric-blue/40 bg-gradient-to-br from-electric-blue/10 via-blue-50 to-white p-8 text-center shadow-sm">
              <p className="text-[10px] uppercase tracking-[0.3em] font-bold text-electric-blue mb-3">Ready when you are</p>
              <h3 className="text-2xl md:text-3xl font-black tracking-tighter mb-3 text-zinc-900">Get the full 4K experience</h3>
              <p className="text-zinc-600 text-sm max-w-md mx-auto mb-6">Join +5,400 satisfied households — 7-day money-back guarantee, every device supported.</p>
              <a
                href={ctaUrl}
                target={ctaUrl.startsWith('http') && !ctaUrl.startsWith(SITE_ORIGIN) ? '_blank' : undefined}
                rel="noopener"
                className="inline-flex items-center gap-2 bg-electric-blue hover:bg-blue-600 !text-white font-bold px-6 py-3 rounded-xl text-sm shadow-[0_8px_24px_rgba(59,130,246,0.35)] transition-colors"
              >
                {ctaText}
                <ArrowRight className="w-4 h-4" />
              </a>
            </div>

            {(article.tags.length > 0 || hashtags.length > 0) && (
              <div className="mt-12 pt-8 border-t border-zinc-200 space-y-3">
                {article.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {article.tags.map((t) => (
                      <span key={t} className="px-3 py-1 bg-zinc-100 border border-zinc-200 rounded-full text-[10px] uppercase tracking-widest font-bold text-zinc-600">{t}</span>
                    ))}
                  </div>
                )}
                {hashtags.length > 0 && (
                  <div className="flex flex-wrap gap-2 text-electric-blue text-xs">
                    {hashtags.map((h) => (
                      <span key={h} className="font-medium">#{h}</span>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </article>
        <Footer />
      </div>
    </>
  );
}
