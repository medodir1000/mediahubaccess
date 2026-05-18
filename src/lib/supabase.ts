import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

if (!url || !anonKey) {
  // Fail loudly during dev so missing env vars surface immediately instead of
  // crashing inside a Supabase call later.
  throw new Error(
    'Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY. ' +
      'Copy .env.example → .env.local and fill them in.',
  );
}

export const supabase = createClient(url, anonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

// ----- Convenience helpers --------------------------------------------------
// Lightly typed wrappers around the most common public-facing operations.
// Replace `any` with generated types once `supabase gen types typescript --linked` runs.

export type LeadSource =
  | 'navbar_free_test'
  | 'floating_free_test'
  | 'pricing_free_test'
  | 'hero_activate_now'
  | 'hero_check_compatibility'
  | 'whatsapp_inbound'
  | 'organic_traffic'
  | 'unknown';

export type NewLead = {
  phone?: string;
  email?: string;
  display_name?: string;
  country_code?: string;
  source?: LeadSource;
  utm_source?: string | null;
  utm_medium?: string | null;
  utm_campaign?: string | null;
  referrer?: string | null;
  user_agent?: string | null;
};

/**
 * Capture a lead. Phone OR email is required (schema-enforced).
 * Returns the inserted row or throws on validation/RLS error.
 */
export async function captureLead(lead: NewLead) {
  const { data, error } = await supabase
    .from('leads')
    .insert(lead)
    .select()
    .single();
  if (error) throw error;
  return data;
}

/**
 * Fire-and-forget event log (no await needed in most callers).
 */
export async function trackEvent(eventName: string, payload: Record<string, unknown> = {}) {
  await supabase.from('page_events').insert({
    event_name: eventName,
    page: typeof window !== 'undefined' ? window.location.pathname : null,
    referrer: typeof document !== 'undefined' ? document.referrer || null : null,
    payload,
  });
}

/** Pricing for the four plan cards. RLS allows public read of active plans. */
export async function fetchPlans() {
  const { data, error } = await supabase
    .from('plans')
    .select('*')
    .eq('active', true)
    .order('sort_order');
  if (error) throw error;
  return data;
}

/** Approved & featured reviews for the homepage Testimonials grid. */
export async function fetchFeaturedTestimonials(limit = 3) {
  const { data, error } = await supabase
    .from('testimonials')
    .select('display_name, location, country_code, rating, body, avatar_url, created_at')
    .eq('status', 'approved')
    .eq('featured', true)
    .order('created_at', { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data;
}

/** Live count for the "active nodes" hero badge. RLS allows public read. */
export async function fetchActiveNodeCount() {
  const { count, error } = await supabase
    .from('server_nodes')
    .select('id', { count: 'exact', head: true })
    .eq('status', 'active');
  if (error) throw error;
  return count ?? 0;
}
