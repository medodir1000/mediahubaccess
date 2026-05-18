-- =====================================================================
-- Bot Settings — extra columns the new admin UI needs
-- =====================================================================
-- AdminBotSettingsPage now exposes:
--   • WhatsApp bot QoL fields (greeting, off-hours, business hours, concurrency)
--   • AI Article Writer config block
-- This migration extends the existing `bot_settings` single-row table.
-- Safe to re-run: every column uses IF NOT EXISTS.

alter table public.bot_settings add column if not exists greeting_message text not null default
  'Hey mate! Welcome to MediaHubAccess — what device are you streaming on tonight? Smart TV, Firestick, Android box, iPhone or Apple TV?';

alter table public.bot_settings add column if not exists off_hours_message text;

alter table public.bot_settings add column if not exists business_hours_start text not null default '09:00';
alter table public.bot_settings add column if not exists business_hours_end   text not null default '23:00';
alter table public.bot_settings add column if not exists business_hours_tz    text not null default 'Europe/London';

alter table public.bot_settings add column if not exists max_concurrent_users int not null default 100;

-- AI Article Writer block --------------------------------------------
alter table public.bot_settings add column if not exists ai_writer_enabled boolean not null default false;

alter table public.bot_settings add column if not exists ai_writer_default_length   int  not null default 800;
alter table public.bot_settings add column if not exists ai_writer_default_tone     text not null default 'professional';
alter table public.bot_settings add column if not exists ai_writer_default_language text not null default 'en';
alter table public.bot_settings add column if not exists ai_writer_default_category text not null default 'streaming-tips';

alter table public.bot_settings add column if not exists ai_writer_image_prompt_tpl text not null default
  'Cinematic widescreen cover image for an article titled "{{title}}". Premium dark aesthetic with electric blue accents, subtle gradients, no on-image text. Photorealistic, 16:9.';

alter table public.bot_settings add column if not exists ai_writer_auto_publish boolean not null default false;
alter table public.bot_settings add column if not exists ai_writer_seo_meta     boolean not null default true;

-- Constrain the enum-like text columns at the DB level so the UI dropdowns
-- can't get out of sync with valid values.
do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'bot_settings_tone_chk') then
    alter table public.bot_settings
      add constraint bot_settings_tone_chk
      check (ai_writer_default_tone in ('professional','casual','friendly','authoritative','playful'));
  end if;
  if not exists (select 1 from pg_constraint where conname = 'bot_settings_lang_chk') then
    alter table public.bot_settings
      add constraint bot_settings_lang_chk
      check (ai_writer_default_language in ('en','fr','ar','es'));
  end if;
end$$;
