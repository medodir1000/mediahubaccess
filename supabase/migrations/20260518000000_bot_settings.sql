-- ============================================================
-- bot_settings — singleton row (id=1) holding live config for:
--   1. The WhatsApp bot "Liam" (Python brain.py)
--   2. The AI Article Writer
-- The admin UI (/admin/bot-settings) reads & updates this row.
-- ============================================================

create table if not exists public.bot_settings (
  id                          smallint primary key default 1 check (id = 1),

  -- ───────── WhatsApp bot (Liam) ─────────
  enabled                     boolean      not null default true,
  model                       text         not null default 'gpt-4o-mini',
  reply_delay_ms              integer      not null default 800,
  system_prompt               text         not null default
    'You are Liam, a friendly WhatsApp sales assistant for mediaHubAccess.com — a premium IPTV streaming service with 65,000+ live channels and 120,000+ movies & series in 4K. Be concise, helpful, and warm. Always answer in the customer''s language (Arabic/Darija, French, or English). When asked about pricing, mention the 4 plans: 1 month $15, 3 months $35, 6 months $45, 12 months $70. Offer a free trial link when relevant. Never invent technical details — if unsure, say you''ll check with a human agent.',
  max_tokens                  integer      not null default 500,
  temperature                 real         not null default 0.7,
  trial_url_fallback          text         not null default 'https://mediahubaccess.com/trial',
  greeting_message            text         not null default
    'Hi! 👋 Thanks for reaching out to mediaHubAccess.com. I''m Liam — how can I help you today?',
  off_hours_message           text                  default null,
  business_hours_start        time                  default '08:00',
  business_hours_end          time                  default '23:00',
  business_hours_tz           text         not null default 'Africa/Casablanca',
  max_concurrent_users        integer      not null default 50,

  -- ───────── AI Article Writer ─────────
  ai_writer_enabled           boolean      not null default true,
  ai_writer_model             text         not null default 'gpt-4o-mini',
  ai_writer_image_model       text         not null default '@cf/black-forest-labs/flux-1-schnell',
  ai_writer_default_length    integer      not null default 900,
  ai_writer_default_tone      text         not null default 'professional'
                              check (ai_writer_default_tone in ('professional', 'casual', 'friendly', 'authoritative', 'playful')),
  ai_writer_default_language  text         not null default 'en'
                              check (ai_writer_default_language in ('en', 'fr', 'ar', 'es')),
  ai_writer_default_category  text         not null default 'general',
  ai_writer_image_prompt_tpl  text         not null default
    'Cinematic editorial photo illustrating: {{title}}. Premium magazine quality, dramatic lighting, ultra detailed, 8k, no text overlays.',
  ai_writer_auto_publish      boolean      not null default false,
  ai_writer_seo_meta          boolean      not null default true,

  -- ───────── Metadata ─────────
  updated_at                  timestamptz  not null default now(),
  updated_by                  uuid                  references auth.users(id) on delete set null
);

-- Seed the singleton row if it isn't there yet
insert into public.bot_settings (id) values (1) on conflict (id) do nothing;

-- ───────── RLS — only admins can read or update ─────────
alter table public.bot_settings enable row level security;

drop policy if exists "admin read bot_settings"    on public.bot_settings;
drop policy if exists "admin update bot_settings"  on public.bot_settings;

create policy "admin read bot_settings"
  on public.bot_settings for select
  using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

create policy "admin update bot_settings"
  on public.bot_settings for update
  using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  )
  with check (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

-- ───────── Trigger to bump updated_at & updated_by ─────────
create or replace function public.touch_bot_settings()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  new.updated_at := now();
  new.updated_by := auth.uid();
  return new;
end;
$$;

drop trigger if exists trg_touch_bot_settings on public.bot_settings;
create trigger trg_touch_bot_settings
  before update on public.bot_settings
  for each row execute function public.touch_bot_settings();
