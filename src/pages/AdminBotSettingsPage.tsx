import { useEffect, useState, type FormEvent, type ReactNode } from 'react';
import { Save, AlertCircle, CheckCircle2, Power, RefreshCw, Smartphone, Phone, QrCode as QrIcon, Copy } from 'lucide-react';
import { supabase } from '../lib/supabase';

const BOT_API_URL = (import.meta.env.VITE_BOT_API_URL as string | undefined) ?? 'http://localhost:3001';

type WaStatus = {
  status: 'starting' | 'qr' | 'pairing' | 'connected' | 'disconnected' | 'error';
  qrDataUrl: string | null;
  qrString: string | null;
  pairingCode: string | null;
  pairingPhone: string | null;
  jid: string | null;
  phone: string | null;
  connectedAt: string | null;
  lastError: string | null;
};

type Settings = {
  // WhatsApp bot (Liam)
  enabled: boolean;
  model: string;
  reply_delay_ms: number;
  system_prompt: string;
  max_tokens: number;
  temperature: number;
  trial_url_fallback: string;
  greeting_message: string;
  off_hours_message: string | null;
  business_hours_start: string;
  business_hours_end: string;
  business_hours_tz: string;
  max_concurrent_users: number;

  // AI Article Writer
  ai_writer_enabled: boolean;
  ai_writer_model: string;
  ai_writer_image_model: string;
  ai_writer_default_length: number;
  ai_writer_default_tone: 'professional' | 'casual' | 'friendly' | 'authoritative' | 'playful';
  ai_writer_default_language: 'en' | 'fr' | 'ar' | 'es';
  ai_writer_default_category: string;
  ai_writer_image_prompt_tpl: string;
  ai_writer_auto_publish: boolean;
  ai_writer_seo_meta: boolean;
};

export default function AdminBotSettingsPage() {
  const [form, setForm] = useState<Settings | null>(null);
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<Date | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase.from('bot_settings').select('*').eq('id', 1).single();
      if (error) { setErr(error.message); return; }
      setForm(data as Settings);
    })();
  }, []);

  async function save(e: FormEvent) {
    e.preventDefault();
    if (!form) return;
    setSaving(true);
    setErr(null);
    const { error } = await supabase.from('bot_settings').update(form).eq('id', 1);
    setSaving(false);
    if (error) setErr(error.message);
    else setSavedAt(new Date());
  }

  if (!form) return <div className="p-10 text-zinc-500 text-sm">{err ?? 'Loading…'}</div>;

  function set<K extends keyof Settings>(k: K, v: Settings[K]) {
    setForm((f) => f ? { ...f, [k]: v } : f);
  }

  return (
    <form onSubmit={save} className="p-10 max-w-3xl">
      <div className="flex items-end justify-between mb-8">
        <div>
          <p className="text-[10px] uppercase tracking-[0.3em] font-bold text-zinc-600">Liam (WhatsApp)</p>
          <h1 className="text-4xl font-black tracking-tighter mt-1">Bot Settings</h1>
        </div>
        <button type="submit" disabled={saving} className="inline-flex items-center gap-2 bg-electric-blue text-white font-bold px-5 py-2 rounded-xl text-sm shadow-[0_0_25px_rgba(59,130,246,0.3)] disabled:opacity-50">
          <Save className="w-4 h-4" />
          {saving ? 'Saving…' : 'Save'}
        </button>
      </div>

      {err && <p className="mb-4 text-xs text-red-400 bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-2">{err}</p>}
      {savedAt && <p className="mb-4 text-xs text-green-400">Saved at {savedAt.toLocaleTimeString()}</p>}

      <WhatsAppConnectionCard />

      <BrainRestartCard />

      <div className="space-y-5">
        {/* ──────────── WhatsApp Bot section ──────────── */}
        <p className="text-[10px] uppercase tracking-[0.3em] font-bold text-zinc-500 mt-2 mb-1">WhatsApp Bot · Liam</p>

        <label className="glass-card rounded-2xl p-5 flex items-center justify-between cursor-pointer">
          <div>
            <p className="text-sm font-bold mb-1">Bot enabled</p>
            <p className="text-xs text-zinc-500">When off, incoming WhatsApp messages are ignored.</p>
          </div>
          <input type="checkbox" checked={form.enabled} onChange={(e) => set('enabled', e.target.checked)} className="w-5 h-5 accent-electric-blue" />
        </label>

        <Field label="Reply model">
          <input value={form.model} onChange={(e) => set('model', e.target.value)} className="form-input" />
        </Field>

        <div className="grid grid-cols-2 gap-5">
          <Field label="Reply delay (ms)">
            <input type="number" value={form.reply_delay_ms} onChange={(e) => set('reply_delay_ms', Number(e.target.value))} className="form-input" />
          </Field>
          <Field label="Max tokens">
            <input type="number" value={form.max_tokens} onChange={(e) => set('max_tokens', Number(e.target.value))} className="form-input" />
          </Field>
        </div>

        <div className="grid grid-cols-2 gap-5">
          <Field label="Temperature">
            <input type="number" step="0.05" min="0" max="2" value={form.temperature} onChange={(e) => set('temperature', Number(e.target.value))} className="form-input" />
          </Field>
          <Field label="Max concurrent users">
            <input type="number" min="1" value={form.max_concurrent_users} onChange={(e) => set('max_concurrent_users', Number(e.target.value))} className="form-input" />
          </Field>
        </div>

        <Field label="System prompt" hint="Defines Liam's voice, tone, and product knowledge.">
          <textarea rows={12} value={form.system_prompt} onChange={(e) => set('system_prompt', e.target.value)} className="form-input font-mono text-[13px] leading-relaxed" />
        </Field>

        <Field label="Greeting message" hint="Sent on the first inbound message of a new conversation.">
          <textarea rows={3} value={form.greeting_message} onChange={(e) => set('greeting_message', e.target.value)} className="form-input" />
        </Field>

        <Field label="Off-hours message" hint="Optional. Sent outside business hours. Leave empty to keep replying normally.">
          <textarea rows={3} value={form.off_hours_message ?? ''} onChange={(e) => set('off_hours_message', e.target.value || null)} className="form-input" />
        </Field>

        <div className="grid grid-cols-3 gap-5">
          <Field label="Business hours start">
            <input type="time" value={form.business_hours_start} onChange={(e) => set('business_hours_start', e.target.value)} className="form-input" />
          </Field>
          <Field label="Business hours end">
            <input type="time" value={form.business_hours_end} onChange={(e) => set('business_hours_end', e.target.value)} className="form-input" />
          </Field>
          <Field label="Timezone">
            <input value={form.business_hours_tz} onChange={(e) => set('business_hours_tz', e.target.value)} className="form-input" />
          </Field>
        </div>

        <Field label="Trial URL fallback" hint="Used when the trial pool is empty.">
          <input value={form.trial_url_fallback} onChange={(e) => set('trial_url_fallback', e.target.value)} className="form-input" />
        </Field>

        {/* ──────────── AI Article Writer section ──────────── */}
        <div className="glass-card rounded-2xl p-5 space-y-5 mt-8">
          <div className="flex items-center justify-between">
            <p className="text-[10px] uppercase tracking-[0.3em] font-bold text-zinc-500">AI Article Writer</p>
            <label className="flex items-center gap-2 cursor-pointer">
              <span className="text-xs text-zinc-400">Enabled</span>
              <input type="checkbox" checked={form.ai_writer_enabled} onChange={(e) => set('ai_writer_enabled', e.target.checked)} className="w-4 h-4 accent-electric-blue" />
            </label>
          </div>

          <Field label="Article model" hint="OpenAI / Anthropic / Gemini model used to draft article bodies.">
            <input value={form.ai_writer_model} onChange={(e) => set('ai_writer_model', e.target.value)} className="form-input" />
          </Field>

          <Field label="Image model" hint="Cloudflare Workers AI model used for cover images.">
            <input value={form.ai_writer_image_model} onChange={(e) => set('ai_writer_image_model', e.target.value)} className="form-input" />
          </Field>

          <div className="grid grid-cols-2 gap-5">
            <Field label="Default length (words)">
              <input type="number" min="100" max="5000" value={form.ai_writer_default_length} onChange={(e) => set('ai_writer_default_length', Number(e.target.value))} className="form-input" />
            </Field>
            <Field label="Default category">
              <input value={form.ai_writer_default_category} onChange={(e) => set('ai_writer_default_category', e.target.value)} className="form-input" />
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-5">
            <Field label="Default tone">
              <select value={form.ai_writer_default_tone} onChange={(e) => set('ai_writer_default_tone', e.target.value as Settings['ai_writer_default_tone'])} className="form-input">
                <option value="professional">Professional</option>
                <option value="casual">Casual</option>
                <option value="friendly">Friendly</option>
                <option value="authoritative">Authoritative</option>
                <option value="playful">Playful</option>
              </select>
            </Field>
            <Field label="Default language">
              <select value={form.ai_writer_default_language} onChange={(e) => set('ai_writer_default_language', e.target.value as Settings['ai_writer_default_language'])} className="form-input">
                <option value="en">English</option>
                <option value="fr">Français</option>
                <option value="ar">العربية</option>
                <option value="es">Español</option>
              </select>
            </Field>
          </div>

          <Field label="Image prompt template" hint="Use {{title}} as a placeholder for the article title.">
            <textarea rows={3} value={form.ai_writer_image_prompt_tpl} onChange={(e) => set('ai_writer_image_prompt_tpl', e.target.value)} className="form-input font-mono text-[13px]" />
          </Field>

          <div className="grid grid-cols-2 gap-5">
            <label className="glass-card rounded-xl p-4 flex items-center justify-between cursor-pointer">
              <div>
                <p className="text-xs font-bold">Auto-publish</p>
                <p className="text-[10px] text-zinc-500">Skip draft step.</p>
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
        </div>
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

/**
 * Tells the WhatsApp bridge to hit brain.py's /shutdown endpoint.
 * The Node supervisor (scripts/supervisor.js) respawns brain.py with the
 * latest SYSTEM_PROMPT, so any edits to brain.py go live in ~2 seconds.
 */
function BrainRestartCard() {
  const [restarting, setRestarting] = useState(false);
  const [msg, setMsg] = useState<{ kind: 'ok' | 'err'; text: string } | null>(null);

  async function restart() {
    setRestarting(true);
    setMsg(null);
    try {
      const r = await fetch(`${BOT_API_URL}/api/restart-brain`, { method: 'POST' });
      const data = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(data.error || `HTTP ${r.status}`);
      setMsg({ kind: 'ok', text: 'Brain restarting — supervisor will respawn it in ~2 seconds.' });
    } catch (e) {
      setMsg({ kind: 'err', text: (e as Error).message });
    } finally {
      setRestarting(false);
    }
  }

  return (
    <div className="glass-card rounded-2xl p-5 mb-5 border-amber-500/20">
      <div className="flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
        <div className="flex-1">
          <p className="text-sm font-bold mb-1">Python brain ( <code className="text-amber-400">brain.py</code> )</p>
          <p className="text-xs text-zinc-400 leading-relaxed mb-3">
            The system prompt is currently hard-coded inside <code>brain.py</code>. To apply edits (or reload sessions),
            restart the brain. Requires the supervisor to be running: <code className="text-zinc-300">npm run brain</code> in the bot folder.
          </p>
          <button
            type="button"
            onClick={restart}
            disabled={restarting}
            className="inline-flex items-center gap-2 text-xs font-bold text-amber-200 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 rounded-lg px-3 py-1.5 disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${restarting ? 'animate-spin' : ''}`} />
            {restarting ? 'Restarting…' : 'Restart Python brain'}
          </button>
          {msg && (
            <p className={`mt-2 text-xs ${msg.kind === 'ok' ? 'text-green-400' : 'text-red-300'}`}>{msg.text}</p>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * Polls the bot's HTTP API every 2 seconds and renders the QR code (when
 * pending) or the connection status (when linked). Hard-disconnect button
 * forces a fresh QR by clearing auth_info on the bot side.
 */
function WhatsAppConnectionCard() {
  const [wa, setWa] = useState<WaStatus | null>(null);
  const [offline, setOffline] = useState(false);
  const [acting, setActing] = useState(false);
  const [method, setMethod] = useState<'qr' | 'pair'>('qr');
  const [phoneInput, setPhoneInput] = useState('');
  const [pairErr, setPairErr] = useState<string | null>(null);
  const [pairing, setPairing] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout>;

    const tick = async () => {
      try {
        const r = await fetch(`${BOT_API_URL}/api/status`, { cache: 'no-store' });
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        const data = (await r.json()) as WaStatus;
        if (!cancelled) {
          setWa(data);
          setOffline(false);
        }
      } catch {
        if (!cancelled) setOffline(true);
      } finally {
        if (!cancelled) timer = setTimeout(tick, 2000);
      }
    };

    tick();
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, []);

  async function disconnect() {
    if (!confirm('Disconnect WhatsApp and generate a new QR? Active sessions will be ended.')) return;
    setActing(true);
    try {
      await fetch(`${BOT_API_URL}/api/logout`, { method: 'POST' });
    } catch (e) {
      console.error(e);
    } finally {
      setActing(false);
    }
  }

  async function requestPairCode() {
    setPairErr(null);
    const digits = phoneInput.replace(/\D/g, '');
    if (digits.length < 8) {
      setPairErr('Enter your phone with country code, digits only (e.g. 212600000000).');
      return;
    }
    setPairing(true);
    try {
      const r = await fetch(`${BOT_API_URL}/api/pair`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber: digits }),
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data.error || `HTTP ${r.status}`);
    } catch (e) {
      setPairErr((e as Error).message);
    } finally {
      setPairing(false);
    }
  }

  function copyCode(code: string) {
    navigator.clipboard.writeText(code).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  function formatCode(code: string) {
    // WhatsApp displays the 8-char code as XXXX-XXXX
    const c = code.replace(/[^A-Z0-9]/gi, '').toUpperCase();
    return c.length === 8 ? `${c.slice(0, 4)}-${c.slice(4)}` : c;
  }

  // ───── bot offline ─────
  if (offline) {
    return (
      <div className="glass-card rounded-2xl p-5 mb-5 border-red-500/20">
        <div className="flex items-start gap-3">
          <Power className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-bold mb-1">WhatsApp bridge is offline</p>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Start the bot to enable WhatsApp linking:
            </p>
            <pre className="mt-2 text-[11px] bg-black/60 text-zinc-300 rounded-lg p-3 font-mono leading-relaxed overflow-x-auto">
{`cd C:\\Users\\lenovo\\Desktop\\MediaHubAccess-bot
npm install            # first time only
npm start              # leave running`}
            </pre>
            <p className="text-[10px] text-zinc-600 mt-2">Polling <code className="text-zinc-400">{BOT_API_URL}/api/status</code> every 2s — this card updates automatically once the bot is up.</p>
          </div>
        </div>
      </div>
    );
  }

  if (!wa) {
    return (
      <div className="glass-card rounded-2xl p-5 mb-5 text-xs text-zinc-500">Connecting to bot…</div>
    );
  }

  // ───── connected ─────
  if (wa.status === 'connected') {
    return (
      <div className="glass-card rounded-2xl p-5 mb-5 border-green-500/20">
        <div className="flex items-start gap-3">
          <CheckCircle2 className="w-5 h-5 text-green-400 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-bold mb-1">WhatsApp linked ✓</p>
            <p className="text-xs text-zinc-400 mb-3 flex items-center gap-2">
              <Smartphone className="w-3 h-3" /> +{wa.phone}
              {wa.connectedAt && (
                <span className="text-zinc-600">· since {new Date(wa.connectedAt).toLocaleString()}</span>
              )}
            </p>
            <button
              type="button"
              onClick={disconnect}
              disabled={acting}
              className="inline-flex items-center gap-2 text-xs font-bold text-red-300 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 rounded-lg px-3 py-1.5 disabled:opacity-50"
            >
              <Power className="w-3.5 h-3.5" />
              {acting ? 'Disconnecting…' : 'Disconnect & re-link'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ───── waiting to link (qr or pairing) ─────
  if (wa.status === 'qr' || wa.status === 'pairing') {
    return (
      <div className="glass-card rounded-2xl p-5 mb-5 border-electric-blue/30">
        {/* Tab toggle */}
        <div className="inline-flex bg-black/40 rounded-xl p-1 mb-5 text-xs font-bold">
          <button
            type="button"
            onClick={() => setMethod('qr')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition ${method === 'qr' ? 'bg-electric-blue text-white shadow' : 'text-zinc-400 hover:text-zinc-200'}`}
          >
            <QrIcon className="w-3.5 h-3.5" /> QR code
          </button>
          <button
            type="button"
            onClick={() => setMethod('pair')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition ${method === 'pair' ? 'bg-electric-blue text-white shadow' : 'text-zinc-400 hover:text-zinc-200'}`}
          >
            <Phone className="w-3.5 h-3.5" /> Phone pairing
          </button>
        </div>

        {/* QR method */}
        {method === 'qr' && (
          <div className="flex flex-col md:flex-row gap-5 items-center md:items-start">
            {wa.qrDataUrl ? (
              <img src={wa.qrDataUrl} alt="WhatsApp QR code" width={220} height={220} className="rounded-xl bg-white p-2 shadow-2xl shrink-0" />
            ) : (
              <div className="w-[220px] h-[220px] rounded-xl bg-zinc-900/60 flex items-center justify-center text-xs text-zinc-500 shrink-0 border border-zinc-800">
                Waiting for QR…
              </div>
            )}
            <div className="flex-1">
              <p className="text-[10px] uppercase tracking-[0.3em] font-bold text-electric-blue mb-2">Scan to link</p>
              <h3 className="text-lg font-bold mb-3">Open WhatsApp → Linked devices</h3>
              <ol className="text-xs text-zinc-400 space-y-1.5 list-decimal list-inside leading-relaxed">
                <li>WhatsApp mobile app → <span className="text-zinc-300">Settings</span></li>
                <li><span className="text-zinc-300">Linked Devices</span> → <span className="text-zinc-300">Link a Device</span></li>
                <li>Point the camera at this QR code</li>
              </ol>
              <p className="text-[10px] text-zinc-600 mt-3">The QR refreshes every ~20s. Once linked, this card flips to ✓ automatically.</p>
            </div>
          </div>
        )}

        {/* Phone pairing method */}
        {method === 'pair' && (
          <div className="flex flex-col gap-5">
            {!wa.pairingCode && (
              <>
                <div>
                  <p className="text-[10px] uppercase tracking-[0.3em] font-bold text-electric-blue mb-2">Link with phone number</p>
                  <h3 className="text-lg font-bold mb-1">Enter your WhatsApp number</h3>
                  <p className="text-xs text-zinc-500">Country code + number, digits only. Example: <span className="text-zinc-300 font-mono">212600000000</span> (Morocco).</p>
                </div>
                <div className="flex gap-3">
                  <input
                    type="tel"
                    inputMode="numeric"
                    placeholder="212600000000"
                    value={phoneInput}
                    onChange={(e) => setPhoneInput(e.target.value)}
                    className="form-input flex-1 font-mono text-lg tracking-wider"
                  />
                  <button
                    type="button"
                    onClick={requestPairCode}
                    disabled={pairing || !phoneInput}
                    className="inline-flex items-center gap-2 bg-electric-blue text-white font-bold px-5 py-2 rounded-xl text-sm shadow-[0_0_25px_rgba(59,130,246,0.3)] disabled:opacity-50"
                  >
                    <Phone className="w-4 h-4" />
                    {pairing ? 'Requesting…' : 'Get code'}
                  </button>
                </div>
                {pairErr && <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-2">{pairErr}</p>}
              </>
            )}

            {wa.pairingCode && (
              <div className="flex flex-col md:flex-row gap-5 items-center md:items-start">
                <div className="shrink-0 text-center">
                  <p className="text-[10px] uppercase tracking-[0.3em] font-bold text-electric-blue mb-2">Your code for +{wa.pairingPhone}</p>
                  <button
                    type="button"
                    onClick={() => copyCode(wa.pairingCode!)}
                    className="group relative inline-flex items-center gap-3 font-mono font-black text-4xl tracking-[0.25em] bg-black/50 rounded-xl px-5 py-4 border border-electric-blue/30 hover:border-electric-blue transition"
                    title="Copy code"
                  >
                    {formatCode(wa.pairingCode)}
                    <Copy className="w-4 h-4 text-zinc-500 group-hover:text-electric-blue" />
                  </button>
                  <p className="text-[10px] text-zinc-500 mt-2">{copied ? '✓ Copied' : 'Click to copy'}</p>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold mb-3">Enter this code on your primary phone</h3>
                  <ol className="text-xs text-zinc-400 space-y-1.5 list-decimal list-inside leading-relaxed">
                    <li>Open WhatsApp on the phone with number <span className="text-zinc-300">+{wa.pairingPhone}</span></li>
                    <li><strong className="text-zinc-200">Android:</strong> Menu (⋮) → <span className="text-zinc-300">Linked devices</span></li>
                    <li><strong className="text-zinc-200">iPhone:</strong> Settings → <span className="text-zinc-300">Linked devices</span></li>
                    <li>Tap <span className="text-zinc-300">Link a device</span> → <span className="text-zinc-300">Link with phone number instead</span></li>
                    <li>Enter the 8-character code shown here</li>
                  </ol>
                  <p className="text-[10px] text-zinc-600 mt-3">Code is valid for a few minutes. Once entered, this card flips to ✓ automatically.</p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  // ───── starting / disconnected / error ─────
  return (
    <div className="glass-card rounded-2xl p-5 mb-5 border-amber-500/20">
      <div className="flex items-start gap-3">
        <RefreshCw className={`w-5 h-5 text-amber-400 shrink-0 mt-0.5 ${wa.status === 'starting' ? 'animate-spin' : ''}`} />
        <div className="flex-1">
          <p className="text-sm font-bold mb-1">WhatsApp: {wa.status}</p>
          {wa.lastError && <p className="text-xs text-red-300 mb-2">{wa.lastError}</p>}
          <p className="text-xs text-zinc-400">
            {wa.status === 'starting'
              ? 'The bot is starting up — a QR will appear in a moment.'
              : 'The bot is reconnecting. If it stays stuck, click below to force a fresh link.'}
          </p>
          {wa.status !== 'starting' && (
            <button
              type="button"
              onClick={disconnect}
              disabled={acting}
              className="mt-3 inline-flex items-center gap-2 text-xs font-bold text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 rounded-lg px-3 py-1.5 disabled:opacity-50"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              {acting ? 'Resetting…' : 'Force new QR'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
