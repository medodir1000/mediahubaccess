/**
 * Live sitemap.xml — pulls every published article from Supabase on each
 * request, caches the response at the Netlify edge for 1 hour.
 *
 * Wired to /sitemap.xml via the redirect in public/_redirects.
 *
 * Required env vars (set in Netlify Site Settings → Environment Variables):
 *   - VITE_SUPABASE_URL
 *   - VITE_SUPABASE_ANON_KEY
 */

const SITE = (process.env.SITE_URL || 'https://mediahubaccess.com').replace(/\/+$/, '');
const SUPABASE_URL = (process.env.VITE_SUPABASE_URL || '').replace(/\/+$/, '');
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || '';

// Static pages we always want indexed.
const STATIC_PAGES = [
  { loc: '/',         changefreq: 'weekly',  priority: '1.0' },
  { loc: '/blog',     changefreq: 'daily',   priority: '0.9' },
  { loc: '/#pricing', changefreq: 'weekly',  priority: '0.8' },
  { loc: '/#features',changefreq: 'monthly', priority: '0.6' },
  { loc: '/#faq',     changefreq: 'monthly', priority: '0.4' },
];

function esc(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function urlEntry({ loc, lastmod, changefreq, priority }) {
  const parts = [`    <loc>${esc(SITE + loc)}</loc>`];
  if (lastmod)   parts.push(`    <lastmod>${esc(lastmod)}</lastmod>`);
  if (changefreq) parts.push(`    <changefreq>${changefreq}</changefreq>`);
  if (priority)  parts.push(`    <priority>${priority}</priority>`);
  return `  <url>\n${parts.join('\n')}\n  </url>`;
}

async function fetchArticles() {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) return [];
  const url = `${SUPABASE_URL}/rest/v1/articles?status=eq.published&select=slug,published_at,updated_at&order=published_at.desc&limit=5000`;
  try {
    const r = await fetch(url, {
      headers: {
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      },
    });
    if (!r.ok) return [];
    return await r.json();
  } catch {
    return [];
  }
}

exports.handler = async () => {
  const articles = await fetchArticles();

  const staticEntries = STATIC_PAGES.map(urlEntry);
  const articleEntries = articles.map((a) =>
    urlEntry({
      loc: `/blog/${a.slug}`,
      lastmod: (a.updated_at || a.published_at || '').slice(0, 10) || undefined,
      changefreq: 'monthly',
      priority: '0.7',
    })
  );

  const xml =
    `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
    [...staticEntries, ...articleEntries].join('\n') +
    `\n</urlset>\n`;

  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      // Edge-cache for 1h; sitemaps don't need to be real-time fresh.
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
      'X-Robots-Tag': 'noindex', // the sitemap itself shouldn't appear in search results
    },
    body: xml,
  };
};
