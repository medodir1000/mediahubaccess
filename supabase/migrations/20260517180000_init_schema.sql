-- =====================================================================
-- MediaHubAccess — initial schema
-- =====================================================================
-- Tables (in load order):
--   plans              — lookup of the 4 pricing tiers (Standard…Black Label)
--   leads              — anyone who hit a CTA (Free Test, Get Started, etc.)
--   trial_requests     — issued 12h Premium 4K Test Lines, with expiry
--   subscriptions      — paid licenses (PlanetKeys order → here)
--   devices            — MAC/portal entries per subscription (1 Device + Add-on)
--   chat_sessions      — one row per WhatsApp contact talking to the Liam bot
--   chat_messages      — every inbound/outbound message (persisted from brain.py)
--   support_tickets    — escalations from chat that need a human
--   testimonials       — real, post-purchase reviews (REPLACE the fake set)
--   server_nodes       — what powers the "14,204 active nodes" hero stat
--   page_events        — lightweight on-site conversion tracking
-- =====================================================================

-- Re-usable updated_at trigger ----------------------------------------
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- 1. PLANS ============================================================
-- Single source of truth for pricing. The site reads it via the anon
-- key so changes here propagate without code edits.
create table public.plans (
  id           text         primary key,                 -- 'standard', 'business', 'executive', 'black_label'
  name         text         not null,
  duration_months smallint  not null check (duration_months > 0),
  price_usd    numeric(6,2) not null check (price_usd >= 0),
  features     jsonb        not null default '[]'::jsonb,
  recommended  boolean      not null default false,
  best_value   boolean      not null default false,
  checkout_url text,                                     -- planetkeys.store/...
  active       boolean      not null default true,
  sort_order   smallint     not null default 0,
  created_at   timestamptz  not null default now(),
  updated_at   timestamptz  not null default now()
);
create trigger plans_set_updated_at before update on public.plans
  for each row execute function public.set_updated_at();

insert into public.plans (id, name, duration_months, price_usd, features, recommended, best_value, checkout_url, sort_order) values
  ('standard',    'Standard',    1,  14.99,
   '["65,000+ Live Channels","120,000+ Movies & Series","4K / UHD / FHD / HD","1 Device + Extra (Paid Add-On)","M3U & portal access","24/7 support"]',
   false, false, 'https://planetkeys.store/prd_bti32a?chw_pvar=Z0VEFO', 1),
  ('business',    'Business',    3,  39.99,
   '["65,000+ Live Channels","120,000+ Movies & Series","4K / UHD / FHD / HD","1 Device + Extra (Paid Add-On)","M3U & portal access","24/7 support"]',
   false, false, 'https://planetkeys.store/prd_bti32a?chw_pvar=YFSRLA', 2),
  ('executive',   'Executive',   6,  49.99,
   '["65,000+ Live Channels","120,000+ Movies & Series","4K / UHD / FHD / HD","1 Device + Extra (Paid Add-On)","M3U & portal access","24/7 priority support"]',
   true,  false, 'https://planetkeys.store/prd_bti32a?chw_pvar=GCJNXM', 3),
  ('black_label', 'Black Label', 12, 79.99,
   '["65,000+ Live Channels","120,000+ Movies & Series","4K / UHD / FHD / HD","1 Device + Extra (Paid Add-On)","M3U & portal access","24/7 priority support"]',
   false, true,  'https://planetkeys.store/prd_bti32a', 4);

-- 2. LEADS ============================================================
-- One row per person who showed interest. Created by any CTA click.
-- phone OR email is required (at least one).
create type lead_source as enum (
  'navbar_free_test',
  'floating_free_test',
  'pricing_free_test',
  'hero_activate_now',
  'hero_check_compatibility',
  'whatsapp_inbound',
  'organic_traffic',
  'unknown'
);

create type lead_status as enum (
  'new',          -- just arrived
  'contacted',    -- bot replied at least once
  'trial_active', -- got a Test Line
  'converted',   -- paid for a plan
  'lost',         -- ghosted / refused
  'banned'        -- abuse / fraud
);

create table public.leads (
  id           uuid         primary key default gen_random_uuid(),
  phone        text         unique,                       -- E.164 ideally: +447411202861
  email        text         unique,
  display_name text,
  country_code text,                                       -- 'GB', 'FR', 'AE'…
  source       lead_source  not null default 'unknown',
  status       lead_status  not null default 'new',
  utm_source   text,
  utm_medium   text,
  utm_campaign text,
  utm_term     text,
  utm_content  text,
  referrer     text,
  user_agent   text,
  ip_country   text,
  notes        text,
  created_at   timestamptz  not null default now(),
  updated_at   timestamptz  not null default now(),
  check (phone is not null or email is not null)
);
create index leads_phone_idx        on public.leads (phone);
create index leads_email_idx        on public.leads (email);
create index leads_status_idx       on public.leads (status);
create index leads_created_at_idx   on public.leads (created_at desc);
create trigger leads_set_updated_at before update on public.leads
  for each row execute function public.set_updated_at();

-- 3. TRIAL REQUESTS ===================================================
-- Liam hands out a 12h Premium 4K Test Line. Track who got what, when
-- it expires, and whether they converted before it expired.
create type trial_status as enum (
  'pending',   -- waiting for activation
  'active',
  'expired',
  'converted', -- they bought a plan before expiry
  'abused'     -- multiple devices, sharing, etc.
);

create table public.trial_requests (
  id             uuid          primary key default gen_random_uuid(),
  lead_id        uuid          not null references public.leads(id) on delete cascade,
  trial_url      text          not null default 'https://mediahubaccess.com/trial-active',
  device_type    text,                          -- 'iOS app', 'LG TV', 'Firestick'…
  device_mac     text,
  status         trial_status  not null default 'pending',
  issued_at      timestamptz   not null default now(),
  expires_at     timestamptz   not null default now() + interval '12 hours',
  converted_at   timestamptz,
  notes          text,
  created_at     timestamptz   not null default now(),
  updated_at     timestamptz   not null default now()
);
create index trial_requests_lead_idx    on public.trial_requests (lead_id);
create index trial_requests_status_idx  on public.trial_requests (status);
create index trial_requests_expires_idx on public.trial_requests (expires_at);
create trigger trial_requests_set_updated_at before update on public.trial_requests
  for each row execute function public.set_updated_at();

-- 4. SUBSCRIPTIONS ====================================================
-- A paid license. PlanetKeys webhook should insert here once payment clears.
create type subscription_status as enum (
  'pending',   -- order received, not yet provisioned
  'active',
  'expired',
  'cancelled',
  'refunded',
  'banned'
);

create table public.subscriptions (
  id              uuid                primary key default gen_random_uuid(),
  lead_id         uuid                not null references public.leads(id) on delete restrict,
  plan_id         text                not null references public.plans(id),
  status          subscription_status not null default 'pending',
  price_paid_usd  numeric(6,2)        not null,
  currency        char(3)             not null default 'USD',
  started_at      timestamptz         not null default now(),
  expires_at      timestamptz         not null,
  license_key     text                unique,                  -- M3U / portal token
  portal_url      text,
  external_order_id text,                                       -- PlanetKeys order id
  payment_provider text                not null default 'planetkeys',
  renewal_reminder_sent_at timestamptz,
  notes           text,
  created_at      timestamptz         not null default now(),
  updated_at      timestamptz         not null default now()
);
create index subscriptions_lead_idx    on public.subscriptions (lead_id);
create index subscriptions_status_idx  on public.subscriptions (status);
create index subscriptions_expires_idx on public.subscriptions (expires_at);
create trigger subscriptions_set_updated_at before update on public.subscriptions
  for each row execute function public.set_updated_at();

-- 5. DEVICES ==========================================================
-- Each subscription = 1 device included + N paid add-ons.
create type device_kind as enum ('smart_tv','firestick','mobile','tablet','desktop','m3u_player','other');

create table public.devices (
  id              uuid         primary key default gen_random_uuid(),
  subscription_id uuid         not null references public.subscriptions(id) on delete cascade,
  kind            device_kind  not null default 'other',
  label           text,                                         -- "Living room LG"
  mac_address     text,
  is_addon        boolean      not null default false,          -- true for paid extras beyond the included 1
  addon_price_usd numeric(6,2),
  active          boolean      not null default true,
  last_seen_at    timestamptz,
  created_at      timestamptz  not null default now(),
  updated_at      timestamptz  not null default now()
);
create index devices_subscription_idx on public.devices (subscription_id);
create index devices_mac_idx          on public.devices (mac_address) where mac_address is not null;
create trigger devices_set_updated_at before update on public.devices
  for each row execute function public.set_updated_at();

-- 6. CHAT SESSIONS + MESSAGES =========================================
-- Replaces the in-memory `user_sessions` dict in brain.py.
-- session_jid = WhatsApp JID, e.g. "447411202861@s.whatsapp.net".
create table public.chat_sessions (
  id            uuid         primary key default gen_random_uuid(),
  session_jid   text         unique not null,
  lead_id       uuid         references public.leads(id) on delete set null,
  last_message_at timestamptz not null default now(),
  message_count int          not null default 0,
  context_json  jsonb        not null default '[]'::jsonb,   -- compact rolling history if you want to skip joining messages
  created_at    timestamptz  not null default now(),
  updated_at    timestamptz  not null default now()
);
create index chat_sessions_lead_idx on public.chat_sessions (lead_id);
create trigger chat_sessions_set_updated_at before update on public.chat_sessions
  for each row execute function public.set_updated_at();

create type chat_role as enum ('system','user','assistant');

create table public.chat_messages (
  id          bigserial     primary key,
  session_id  uuid          not null references public.chat_sessions(id) on delete cascade,
  role        chat_role     not null,
  content     text          not null,
  model       text,                                            -- 'openai/gpt-4o-mini'
  tokens_in   int,
  tokens_out  int,
  cost_usd    numeric(10,6),
  created_at  timestamptz   not null default now()
);
create index chat_messages_session_created_idx on public.chat_messages (session_id, created_at);

-- 7. SUPPORT TICKETS ==================================================
-- When Liam can't handle it and a human needs to step in.
create type ticket_status as enum ('open','pending_reply','resolved','closed','spam');

create table public.support_tickets (
  id          uuid          primary key default gen_random_uuid(),
  lead_id     uuid          not null references public.leads(id) on delete cascade,
  session_id  uuid          references public.chat_sessions(id) on delete set null,
  subject     text          not null,
  priority    smallint      not null default 3 check (priority between 1 and 5), -- 1 = urgent
  status      ticket_status not null default 'open',
  assignee    text,                                              -- email or handle of human agent
  resolved_at timestamptz,
  created_at  timestamptz   not null default now(),
  updated_at  timestamptz   not null default now()
);
create index tickets_status_idx     on public.support_tickets (status);
create index tickets_lead_idx       on public.support_tickets (lead_id);
create trigger tickets_set_updated_at before update on public.support_tickets
  for each row execute function public.set_updated_at();

-- 8. TESTIMONIALS =====================================================
-- Replace the 3 fake stock-photo reviews + 7 illustrative WhatsApp
-- mockups with REAL post-purchase reviews collected via DM follow-ups.
create type testimonial_status as enum ('pending','approved','rejected');

create table public.testimonials (
  id              uuid               primary key default gen_random_uuid(),
  lead_id         uuid               references public.leads(id) on delete set null,
  subscription_id uuid               references public.subscriptions(id) on delete set null,
  display_name    text               not null,
  location        text,                                       -- 'London, UK'
  country_code    text,                                       -- 'GB'
  rating          smallint           not null check (rating between 1 and 5),
  body            text               not null,
  avatar_url      text,                                       -- Supabase Storage URL
  source          text               not null default 'whatsapp', -- 'whatsapp','email','google_review'
  verified        boolean            not null default false,  -- true = we have proof
  featured        boolean            not null default false,  -- show in homepage Testimonials grid
  status          testimonial_status not null default 'pending',
  consent_given_at timestamptz,                                -- GDPR / legal proof of permission
  created_at      timestamptz        not null default now(),
  updated_at      timestamptz        not null default now()
);
create index testimonials_featured_approved_idx on public.testimonials (status, featured) where status = 'approved';
create trigger testimonials_set_updated_at before update on public.testimonials
  for each row execute function public.set_updated_at();

-- 9. SERVER NODES =====================================================
-- Backing data for the "14,204 active nodes" hero stat. Replace the
-- hardcoded number with `select count(*) from server_nodes where status='active'`.
create type node_status as enum ('active','degraded','offline','maintenance');

create table public.server_nodes (
  id           uuid         primary key default gen_random_uuid(),
  code         text         unique not null,                  -- 'EU-1', 'US-EAST-3'
  region       text         not null,                          -- 'Frankfurt'
  country_code text         not null,                          -- 'DE'
  capacity_gbps smallint    not null default 20,
  current_load_pct smallint not null default 0 check (current_load_pct between 0 and 100),
  latency_ms   smallint,
  status       node_status  not null default 'active',
  last_ping_at timestamptz,
  created_at   timestamptz  not null default now(),
  updated_at   timestamptz  not null default now()
);
create index nodes_status_idx on public.server_nodes (status);
create trigger nodes_set_updated_at before update on public.server_nodes
  for each row execute function public.set_updated_at();

-- 10. PAGE EVENTS =====================================================
-- Lightweight conversion tracking. Don't replace a real analytics tool;
-- use this for funnel-specific events the site cares about.
create table public.page_events (
  id          bigserial    primary key,
  lead_id     uuid         references public.leads(id) on delete set null,
  session_token text,                                          -- random cookie
  event_name  text         not null,                           -- 'cta_click', 'pricing_view', 'video_play'
  page        text,
  referrer    text,
  payload     jsonb        not null default '{}'::jsonb,
  created_at  timestamptz  not null default now()
);
create index page_events_event_idx   on public.page_events (event_name, created_at desc);
create index page_events_lead_idx    on public.page_events (lead_id);

-- =====================================================================
-- ROW LEVEL SECURITY
-- =====================================================================
-- The frontend uses the publishable (anon) key. Lock everything down,
-- then open up exactly what the site needs.
-- =====================================================================

alter table public.plans            enable row level security;
alter table public.leads            enable row level security;
alter table public.trial_requests   enable row level security;
alter table public.subscriptions    enable row level security;
alter table public.devices          enable row level security;
alter table public.chat_sessions    enable row level security;
alter table public.chat_messages    enable row level security;
alter table public.support_tickets  enable row level security;
alter table public.testimonials     enable row level security;
alter table public.server_nodes     enable row level security;
alter table public.page_events      enable row level security;

-- Public read: pricing + approved testimonials + node aggregate
create policy "plans are public" on public.plans
  for select to anon, authenticated using (active = true);

create policy "approved testimonials are public" on public.testimonials
  for select to anon, authenticated using (status = 'approved');

create policy "server node count is public" on public.server_nodes
  for select to anon, authenticated using (true);

-- Public insert: leads + page events (so unauthenticated visitors can opt-in)
create policy "anyone can create a lead" on public.leads
  for insert to anon, authenticated with check (true);

create policy "anyone can track a page event" on public.page_events
  for insert to anon, authenticated with check (true);

-- Everything else (subscriptions, devices, chat, tickets, trial mgmt)
-- has NO public policies → blocked by default. Use the service_role
-- key from the Node bridge / brain.py / admin panel.
