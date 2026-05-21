import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ExternalLink, Copy, CheckCircle2, XCircle, MessageSquare, Filter, RefreshCw, Inbox } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../lib/AuthContext';

type Draft = {
  id: string;
  post_id: string;
  post_title: string;
  post_url: string;
  post_author: string | null;
  subreddit: string;
  post_body: string | null;
  matched_keyword: string | null;
  matched_article_id: string | null;
  matched_article_slug: string | null;
  matched_article_title: string | null;
  draft_reply: string;
  status: 'pending' | 'posted' | 'rejected' | 'expired';
  posted_at: string | null;
  notes: string | null;
  created_at: string;
};

const STATUSES = ['pending', 'posted', 'rejected', 'expired'] as const;

export default function AdminRedditScoutPage() {
  const { user } = useAuth();
  const [drafts, setDrafts] = useState<Draft[] | null>(null);
  const [filter, setFilter] = useState<typeof STATUSES[number]>('pending');
  const [subFilter, setSubFilter] = useState<string>('');
  const [busy, setBusy] = useState<Record<string, boolean>>({});
  const [copied, setCopied] = useState<string | null>(null);
  const [edits, setEdits] = useState<Record<string, string>>({});
  // Cards in the "I just opened the Reddit tab — confirm whether you posted" state.
  // Keyed by draft id. Set when the user clicks "Copy + Open Post"; cleared on
  // either confirmation ("Posted Manually") or "Cancel" (returns the card to
  // its normal pending state so the user can try again later).
  const [awaiting, setAwaiting] = useState<Record<string, boolean>>({});

  async function load() {
    const q = supabase
      .from('pending_reddit_replies')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100);
    const { data, error } = await q;
    if (error) { console.error(error); setDrafts([]); return; }
    setDrafts((data || []) as Draft[]);
  }

  useEffect(() => {
    load();
    const id = setInterval(load, 30 * 1000); // auto-refresh every 30s
    return () => clearInterval(id);
  }, []);

  const filtered = useMemo(() => {
    if (!drafts) return [];
    return drafts.filter((d) =>
      d.status === filter && (!subFilter || d.subreddit.toLowerCase() === subFilter.toLowerCase())
    );
  }, [drafts, filter, subFilter]);

  const subreddits = useMemo(() => {
    const set = new Set<string>();
    (drafts || []).forEach((d) => set.add(d.subreddit));
    return [...set].sort();
  }, [drafts]);

  const counts = useMemo(() => {
    const c: Record<string, number> = { pending: 0, posted: 0, rejected: 0, expired: 0 };
    (drafts || []).forEach((d) => { c[d.status] = (c[d.status] || 0) + 1; });
    return c;
  }, [drafts]);

  function getReply(d: Draft) {
    return edits[d.id] ?? d.draft_reply;
  }

  function copyReply(d: Draft) {
    const text = getReply(d);
    navigator.clipboard.writeText(text).then(() => {
      setCopied(d.id);
      setTimeout(() => setCopied(null), 1500);
    }).catch(() => {});
  }

  async function setStatus(d: Draft, status: Draft['status']) {
    setBusy((b) => ({ ...b, [d.id]: true }));
    try {
      const update: Record<string, unknown> = { status };
      if (status === 'posted') {
        update.posted_at = new Date().toISOString();
        update.posted_by = user?.id ?? null;
        // Save edited reply if changed.
        if (edits[d.id] && edits[d.id] !== d.draft_reply) {
          update.draft_reply = edits[d.id];
        }
      }
      const { error } = await supabase
        .from('pending_reddit_replies')
        .update(update)
        .eq('id', d.id);
      if (error) throw error;
      await load();
    } catch (e) {
      console.error(e);
      alert((e as Error).message);
    } finally {
      setBusy((b) => ({ ...b, [d.id]: false }));
    }
  }

  function openAndCopy(d: Draft) {
    copyReply(d);
    // Append a semantic hint that this URL is being opened to comment. Reddit
    // itself doesn't interpret the param, but it (a) clearly tags the tab,
    // (b) won't break anything, and (c) gives us a hook to do real auto-focus
    // later if we ever ship a browser extension.
    const sep = d.post_url.includes('?') ? '&' : '?';
    window.open(`${d.post_url}${sep}focus=comment`, '_blank', 'noopener,noreferrer');
    // Flip the card into "awaiting confirmation" mode — the user posts on
    // Reddit, comes back, and clicks one button to confirm.
    setAwaiting((a) => ({ ...a, [d.id]: true }));
  }

  function cancelAwaiting(d: Draft) {
    // User aborted the post (e.g. Reddit was down, or they decided to edit
    // first). Drop the awaiting flag; draft stays in `pending`.
    setAwaiting((a) => {
      const next = { ...a };
      delete next[d.id];
      return next;
    });
  }

  async function confirmPosted(d: Draft) {
    // Run the existing status flip; clear awaiting state regardless of
    // success/failure (setStatus already shows an alert on error).
    await setStatus(d, 'posted');
    setAwaiting((a) => {
      const next = { ...a };
      delete next[d.id];
      return next;
    });
  }

  return (
    <div className="p-10 max-w-6xl space-y-8">
      <div className="flex items-start justify-between gap-6">
        <div>
          <p className="text-[10px] uppercase tracking-[0.3em] font-bold text-zinc-600">Traffic · Reddit</p>
          <h1 className="text-4xl font-black tracking-tighter mt-1">Reddit Scout</h1>
          <p className="text-zinc-500 text-sm mt-1">
            AI-drafted replies waiting for human review. Click <strong>Copy + Open Post</strong>, paste on Reddit, submit — then confirm with the green button. Keeps every post a real human action (Reddit ToS compliant, zero ban risk).
          </p>
        </div>
        <button
          type="button"
          onClick={load}
          className="inline-flex items-center gap-2 bg-white border border-zinc-200 rounded-xl px-4 py-2 text-sm font-bold hover:border-electric-blue hover:text-electric-blue transition"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {/* Status tabs */}
      <div className="flex flex-wrap gap-2 border-b border-zinc-200 pb-3">
        {STATUSES.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setFilter(s)}
            className={
              'inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-[0.15em] border transition-all ' +
              (filter === s
                ? 'bg-electric-blue !text-white border-electric-blue'
                : 'bg-white text-zinc-600 border-zinc-200 hover:border-electric-blue hover:text-electric-blue')
            }
          >
            {s}
            <span className={(filter === s ? 'bg-white/20 text-white' : 'bg-zinc-100 text-zinc-600') + ' rounded-full px-2 py-0.5 text-[10px] font-black leading-none'}>
              {counts[s] ?? 0}
            </span>
          </button>
        ))}
        {subreddits.length > 0 && (
          <div className="ml-auto flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-zinc-400" />
            <select
              value={subFilter}
              onChange={(e) => setSubFilter(e.target.value)}
              className="form-input !py-1.5 !text-xs w-44"
            >
              <option value="">All subreddits</option>
              {subreddits.map((s) => <option key={s} value={s}>r/{s}</option>)}
            </select>
          </div>
        )}
      </div>

      {/* Drafts */}
      {!drafts && <p className="text-zinc-500 text-sm">Loading…</p>}
      {drafts && filtered.length === 0 && (
        <div className="glass-card rounded-2xl p-12 text-center">
          <Inbox className="w-10 h-10 text-zinc-400 mx-auto mb-3" />
          <p className="text-zinc-600 text-sm">
            No <strong>{filter}</strong> drafts{subFilter ? ` in r/${subFilter}` : ''}. The scout posts new drafts every couple of minutes.
          </p>
          <p className="text-zinc-500 text-xs mt-2">Make sure <code>python reddit_scout.py</code> is running.</p>
        </div>
      )}

      <div className="space-y-4">
        {filtered.map((d) => (
          <div
            key={d.id}
            className={
              "glass-card rounded-2xl p-6 space-y-4 transition-all " +
              (awaiting[d.id]
                ? "ring-2 ring-green-400 shadow-[0_0_30px_rgba(74,222,128,0.25)] bg-green-50/30"
                : "")
            }
          >
            {/* Header */}
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] font-bold mb-2">
                  <span className="text-electric-blue bg-electric-blue/10 px-2 py-0.5 rounded-full">r/{d.subreddit}</span>
                  {d.matched_keyword && (
                    <span className="text-amber-600 bg-amber-100 px-2 py-0.5 rounded-full">match: "{d.matched_keyword}"</span>
                  )}
                  {d.post_author && <span className="text-zinc-500">u/{d.post_author}</span>}
                  <span className="text-zinc-400">· {new Date(d.created_at).toLocaleString()}</span>
                </div>
                <h3 className="text-lg font-bold text-zinc-900 leading-snug break-words">{d.post_title}</h3>
                {d.post_body && (
                  <p className="text-xs text-zinc-500 mt-2 line-clamp-3 leading-relaxed">{d.post_body}</p>
                )}
              </div>
              <a
                href={d.post_url}
                target="_blank"
                rel="noopener noreferrer"
                className="shrink-0 inline-flex items-center gap-1.5 text-xs font-bold text-zinc-600 hover:text-electric-blue transition"
              >
                Open on Reddit <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>

            {/* Matched article */}
            {d.matched_article_id && (
              <div className="text-xs flex items-center gap-2 text-zinc-600">
                <MessageSquare className="w-3.5 h-3.5 text-electric-blue" />
                <span>Reply references:</span>
                <Link
                  to={`/admin/articles/${d.matched_article_id}`}
                  className="text-electric-blue font-bold hover:underline truncate max-w-md"
                >
                  {d.matched_article_title}
                </Link>
                {d.matched_article_slug && (
                  <a
                    href={`/blog/${d.matched_article_slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-zinc-500 hover:text-electric-blue"
                    title="Preview live"
                  >
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            )}

            {/* Editable draft reply */}
            <div>
              <label className="block text-[10px] uppercase tracking-[0.2em] font-bold text-zinc-500 mb-1.5">
                Draft reply (edit before posting)
              </label>
              <textarea
                value={getReply(d)}
                onChange={(e) => setEdits((s) => ({ ...s, [d.id]: e.target.value }))}
                rows={Math.max(3, Math.min(8, Math.ceil(getReply(d).length / 90)))}
                disabled={d.status !== 'pending'}
                className="form-input leading-relaxed"
              />
            </div>

            {/* Actions */}
            <div className="flex flex-wrap items-center gap-2">
              {d.status === 'pending' && !awaiting[d.id] && (
                <>
                  <button
                    type="button"
                    onClick={() => openAndCopy(d)}
                    className="inline-flex items-center gap-2 bg-electric-blue !text-white font-bold px-4 py-2 rounded-xl text-sm hover:bg-blue-600 transition shadow-sm"
                  >
                    <Copy className="w-4 h-4" />
                    Copy reply + open post
                  </button>
                  <button
                    type="button"
                    onClick={() => copyReply(d)}
                    className="inline-flex items-center gap-2 bg-white border border-zinc-200 hover:border-electric-blue hover:text-electric-blue font-bold px-3 py-2 rounded-xl text-xs"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    {copied === d.id ? 'Copied!' : 'Copy only'}
                  </button>
                  <div className="grow" />
                  <button
                    type="button"
                    disabled={busy[d.id]}
                    onClick={() => setStatus(d, 'posted')}
                    className="inline-flex items-center gap-2 bg-green-100 text-green-700 hover:bg-green-200 border border-green-300 font-bold px-3 py-2 rounded-xl text-xs disabled:opacity-50"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    Mark as posted
                  </button>
                  <button
                    type="button"
                    disabled={busy[d.id]}
                    onClick={() => setStatus(d, 'rejected')}
                    className="inline-flex items-center gap-2 bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 font-bold px-3 py-2 rounded-xl text-xs disabled:opacity-50"
                  >
                    <XCircle className="w-4 h-4" />
                    Reject
                  </button>
                </>
              )}
              {/* "Awaiting confirmation" overlay row — replaces the normal
                  actions while the user is over on Reddit posting. Once they
                  return and click "Posted Manually", the row flips to posted
                  and disappears from the pending tab on next refresh. */}
              {d.status === 'pending' && awaiting[d.id] && (
                <div className="w-full flex flex-col sm:flex-row sm:items-center gap-3 bg-gradient-to-r from-green-50 via-green-100 to-green-50 border-2 border-green-400 rounded-xl px-4 py-3 animate-[fadeIn_0.2s_ease-out]">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-black text-green-800 leading-tight">
                      Reply copied · post tab opened
                    </p>
                    <p className="text-xs text-green-700/80 leading-snug mt-0.5">
                      Paste with <kbd className="px-1.5 py-0.5 bg-white border border-green-300 rounded text-[10px] font-mono font-bold">Ctrl</kbd>+<kbd className="px-1.5 py-0.5 bg-white border border-green-300 rounded text-[10px] font-mono font-bold">V</kbd> on Reddit, hit Submit, then confirm here.
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      disabled={busy[d.id]}
                      onClick={() => confirmPosted(d)}
                      className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 !text-white font-bold px-5 py-2.5 rounded-xl text-sm shadow-[0_4px_12px_rgba(22,163,74,0.35)] disabled:opacity-50 transition"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      {busy[d.id] ? 'Saving…' : 'Posted Manually'}
                    </button>
                    <button
                      type="button"
                      disabled={busy[d.id]}
                      onClick={() => cancelAwaiting(d)}
                      className="inline-flex items-center gap-1.5 bg-white border border-zinc-300 hover:border-zinc-400 text-zinc-700 font-bold px-3 py-2.5 rounded-xl text-xs disabled:opacity-50 transition"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
              {d.status === 'posted' && (
                <span className="text-xs text-green-700 inline-flex items-center gap-1.5 font-bold">
                  <CheckCircle2 className="w-4 h-4" /> Posted {d.posted_at ? new Date(d.posted_at).toLocaleString() : ''}
                </span>
              )}
              {d.status === 'rejected' && (
                <span className="text-xs text-red-600 inline-flex items-center gap-1.5 font-bold">
                  <XCircle className="w-4 h-4" /> Rejected
                </span>
              )}
              {d.status === 'expired' && (
                <span className="text-xs text-zinc-500 inline-flex items-center gap-1.5 font-bold">Expired</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
