import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Download, ExternalLink, RefreshCw, Inbox, Loader2,
  ImageIcon, Sparkles, Image as ImageLucide,
} from 'lucide-react';

// Brain endpoints — same convention as AdminArticleBotPage.tsx.
const BRAIN_URL = (import.meta.env.VITE_BRAIN_URL as string | undefined) ?? 'http://localhost:5000';

// One row per published article, with the three canonical pin URLs.
type PinRow = {
  id: string;
  slug: string;
  title: string;
  category: string | null;
  published_at: string | null;
  cover_image_url: string | null;
  article_url: string;
  pins: { top: string; middle: string; bottom: string };
};

type ListResponse =
  | { ok: true; count: number; rows: PinRow[] }
  | { ok?: false; error?: string };

const PIN_POSITIONS: Array<keyof PinRow['pins']> = ['top', 'middle', 'bottom'];

const POSITION_LABEL: Record<keyof PinRow['pins'], string> = {
  top:    'Title at top',
  middle: 'Title centered',
  bottom: 'Title at bottom',
};

export default function AdminPinterestPinsPage() {
  const [rows, setRows] = useState<PinRow[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busyKind, setBusyKind] = useState<null | 'list' | 'generate'>(null);
  // Track which pin images failed to load (404 from Storage = not yet
  // generated). Lets us flag those articles + show a per-article retry hint.
  const [missing, setMissing] = useState<Record<string, true>>({});
  const [progressMsg, setProgressMsg] = useState<string | null>(null);

  async function load() {
    setBusyKind('list');
    setError(null);
    try {
      const r = await fetch(`${BRAIN_URL}/list-pin-designs?limit=200`);
      const data: ListResponse = await r.json();
      if (!r.ok || !('ok' in data) || !data.ok) {
        setError(('error' in data ? data.error : '') || `HTTP ${r.status}`);
        setRows([]);
        return;
      }
      setRows(data.rows);
      setMissing({});
    } catch (e) {
      setError((e as Error).message);
      setRows([]);
    } finally {
      setBusyKind(null);
    }
  }

  useEffect(() => {
    load();
    // Auto-refresh every 60s — picks up newly-generated pins from the
    // background backfill without forcing the user to click Refresh.
    const id = setInterval(load, 60_000);
    return () => clearInterval(id);
  }, []);

  async function generateMissing() {
    if (busyKind) return;
    setBusyKind('generate');
    setProgressMsg('Asking brain to fill any missing pins (chunked, ~2-3 min)…');
    try {
      // Brain runs the heavy Pillow work in a single synchronous batch.
      // We cap each call to 12 articles to stay under the OOM threshold
      // we hit earlier. Three sequential calls = whole catalog.
      let totalNew = 0;
      for (let offset = 0; offset < 200; offset += 12) {
        const r = await fetch(`${BRAIN_URL}/generate-pin-designs`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ limit: 12, offset, only_missing: true }),
        });
        if (!r.ok) {
          const body = await r.text();
          throw new Error(`HTTP ${r.status} · ${body.slice(0, 200)}`);
        }
        const data = await r.json();
        totalNew += data?.total_pins_generated ?? 0;
        setProgressMsg(`Chunk ${offset / 12 + 1}: ${data?.articles_attempted ?? 0} articles touched, ${totalNew} new pins so far…`);
        if ((data?.articles_attempted ?? 0) < 12) break; // last chunk reached
      }
      setProgressMsg(`Done — generated ${totalNew} new pins. Refreshing gallery…`);
      await load();
    } catch (e) {
      setProgressMsg(`✗ ${(e as Error).message}`);
    } finally {
      setBusyKind(null);
      setTimeout(() => setProgressMsg(null), 6_000);
    }
  }

  function markMissing(slug: string, position: string) {
    setMissing((m) => ({ ...m, [`${slug}-${position}`]: true }));
  }

  const stats = useMemo(() => {
    if (!rows) return { articles: 0, pinsExpected: 0, missingCount: 0 };
    const pinsExpected = rows.length * 3;
    const missingCount = Object.keys(missing).length;
    return { articles: rows.length, pinsExpected, missingCount };
  }, [rows, missing]);

  return (
    <div className="p-10 max-w-7xl space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between gap-6 flex-wrap">
        <div>
          <p className="text-[10px] uppercase tracking-[0.3em] font-bold text-zinc-600">Traffic · Pinterest</p>
          <h1 className="text-4xl font-black tracking-tighter mt-1">Pinterest Pins</h1>
          <p className="text-zinc-500 text-sm mt-1 max-w-2xl">
            3 vertical 1000×1500 variants designed for every article. While Pinterest's Standard API access is pending,
            download each pin and drag it onto <a href="https://www.pinterest.com/pin-builder/" target="_blank" rel="noopener noreferrer" className="text-electric-blue font-bold hover:underline">Pinterest's Pin Builder</a> manually — same compounding-traffic effect as the auto-poster.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={!!busyKind}
            onClick={generateMissing}
            className="inline-flex items-center gap-2 bg-electric-blue !text-white font-bold px-4 py-2 rounded-xl text-sm shadow-[0_0_25px_rgba(59,130,246,0.3)] disabled:opacity-50"
          >
            {busyKind === 'generate'
              ? <Loader2 className="w-4 h-4 animate-spin" />
              : <Sparkles className="w-4 h-4" />}
            Generate missing pins
          </button>
          <button
            type="button"
            disabled={!!busyKind}
            onClick={load}
            className="inline-flex items-center gap-2 bg-white border border-zinc-200 rounded-xl px-4 py-2 text-sm font-bold hover:border-electric-blue hover:text-electric-blue transition disabled:opacity-50"
          >
            {busyKind === 'list'
              ? <Loader2 className="w-4 h-4 animate-spin" />
              : <RefreshCw className="w-4 h-4" />}
            Refresh
          </button>
        </div>
      </div>

      {/* Stats strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Stat label="Articles" value={String(stats.articles)} />
        <Stat label="Pins expected" value={String(stats.pinsExpected)} />
        <Stat label="Variants per article" value="3" />
        <Stat label="Aspect ratio" value="1000×1500" />
      </div>

      {progressMsg && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 text-sm text-blue-800">
          {progressMsg}
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-800">
          ✗ {error}
        </div>
      )}

      {/* Article cards */}
      {!rows && <p className="text-zinc-500 text-sm">Loading…</p>}
      {rows && rows.length === 0 && (
        <div className="glass-card rounded-2xl p-12 text-center">
          <Inbox className="w-10 h-10 text-zinc-400 mx-auto mb-3" />
          <p className="text-zinc-600 text-sm">
            No published articles yet — the gallery fills automatically as the auto-writer publishes.
          </p>
        </div>
      )}

      <div className="space-y-5">
        {(rows ?? []).map((row) => (
          <div key={row.id} className="glass-card rounded-2xl p-5">
            {/* Article header */}
            <div className="flex items-start gap-4 mb-4">
              {row.cover_image_url && (
                <img
                  src={row.cover_image_url}
                  alt=""
                  className="w-20 h-20 object-cover rounded-lg border border-zinc-200 shrink-0"
                  loading="lazy"
                />
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] font-bold mb-1">
                  {row.category && (
                    <span className="text-amber-600 bg-amber-100 px-2 py-0.5 rounded-full">{row.category}</span>
                  )}
                  {row.published_at && (
                    <span className="text-zinc-400">
                      {new Date(row.published_at).toLocaleDateString()}
                    </span>
                  )}
                </div>
                <h3 className="text-base font-bold text-zinc-900 leading-snug">
                  <Link to={`/admin/articles/${row.id}`} className="hover:text-electric-blue">
                    {row.title}
                  </Link>
                </h3>
                <a
                  href={row.article_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-zinc-500 hover:text-electric-blue mt-1"
                >
                  {row.slug} <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>

            {/* 3-pin gallery */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {PIN_POSITIONS.map((pos) => {
                const key = `${row.slug}-${pos}`;
                const isMissing = !!missing[key];
                return (
                  <div key={key} className="flex flex-col items-center">
                    <div className="relative w-full max-w-[200px] aspect-[2/3] rounded-xl overflow-hidden border border-zinc-200 bg-zinc-100">
                      {isMissing ? (
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-zinc-400 text-xs gap-2">
                          <ImageIcon className="w-8 h-8" />
                          <span>not generated</span>
                          <span className="text-[10px] uppercase tracking-widest font-bold">click "Generate missing pins"</span>
                        </div>
                      ) : (
                        <img
                          src={row.pins[pos]}
                          alt={`${row.title} — ${pos} variant`}
                          className="w-full h-full object-cover"
                          loading="lazy"
                          onError={() => markMissing(row.slug, pos)}
                        />
                      )}
                    </div>
                    <p className="text-[10px] uppercase tracking-[0.15em] font-bold text-zinc-500 mt-2">
                      {POSITION_LABEL[pos]}
                    </p>
                    <div className="flex items-center gap-1.5 mt-2 w-full max-w-[200px]">
                      <a
                        href={row.pins[pos]}
                        download={`${row.slug}-${pos}.jpg`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={
                          'flex-1 inline-flex items-center justify-center gap-1.5 bg-electric-blue !text-white font-bold px-2.5 py-1.5 rounded-lg text-[11px] hover:bg-blue-600 transition ' +
                          (isMissing ? 'opacity-40 pointer-events-none' : '')
                        }
                      >
                        <Download className="w-3 h-3" />
                        Download
                      </a>
                      <a
                        href="https://www.pinterest.com/pin-builder/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center gap-1 bg-white border border-zinc-200 hover:border-electric-blue hover:text-electric-blue font-bold px-2 py-1.5 rounded-lg text-[11px]"
                        title="Open Pinterest Pin Builder in a new tab"
                      >
                        <ImageLucide className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Footer how-to */}
      {rows && rows.length > 0 && (
        <div className="glass-card rounded-2xl p-5 text-sm text-zinc-600 leading-relaxed">
          <p className="font-bold text-zinc-900 mb-2">Manual posting workflow (~10s per pin):</p>
          <ol className="list-decimal pl-5 space-y-1 text-xs">
            <li>Click <strong>Download</strong> on the variant you like → JPEG saved locally</li>
            <li>Click the image icon → opens Pinterest's Pin Builder in a new tab</li>
            <li>Drag the downloaded JPEG onto the Pin Builder canvas</li>
            <li>Pinterest auto-detects the title; paste the article URL into the <strong>Destination Link</strong> field</li>
            <li>Pick the <strong>Streaming Guides</strong> board → Publish</li>
          </ol>
          <p className="text-zinc-500 text-xs mt-3">
            Once your Pinterest app gets Standard API access, flip <code>PINTEREST_ENABLED=1</code> in <code>.env</code> and the auto-writer takes over — no more manual posting.
          </p>
        </div>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="glass-card rounded-xl px-4 py-3">
      <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-zinc-500">{label}</p>
      <p className="text-2xl font-black tracking-tighter text-zinc-900 mt-1">{value}</p>
    </div>
  );
}
