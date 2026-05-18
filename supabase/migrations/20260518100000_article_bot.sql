-- ============================================================
-- 20260518100000_article_bot.sql
-- Adds the missing fields needed by:
--   • the AI Article Bot   (CTA defaults, hashtag config, scheduling)
--   • published articles   (hashtags, in-article CTA, og_description)
-- ============================================================

-- ───────── articles: hashtags + per-article CTA ─────────
alter table public.articles
  add column if not exists hashtags         text[]      not null default array[]::text[],
  add column if not exists cta_text         text,
  add column if not exists cta_url          text,
  add column if not exists og_description   text,
  add column if not exists generated_by_ai  boolean     not null default false,
  add column if not exists ai_model         text,
  add column if not exists reading_minutes  integer;

create index if not exists articles_hashtags_gin_idx
  on public.articles using gin (hashtags);


-- ───────── bot_settings: article-bot extras ─────────
alter table public.bot_settings
  add column if not exists ai_writer_default_cta_text  text
        not null default 'Get your free 12-hour 4K trial',
  add column if not exists ai_writer_default_cta_url   text
        not null default 'https://mediahubaccess.com/#pricing',
  add column if not exists ai_writer_default_hashtags  text[]
        not null default array['iptv','4k','streaming','mediahubaccess']::text[],
  add column if not exists ai_writer_min_words         integer  not null default 600,
  add column if not exists ai_writer_max_words         integer  not null default 1400,
  add column if not exists ai_writer_keywords_per_post integer  not null default 8,
  add column if not exists ai_writer_hashtags_per_post integer  not null default 6,
  add column if not exists ai_writer_schedule_enabled  boolean  not null default false,
  add column if not exists ai_writer_schedule_cron     text     not null default '0 9 * * *',
  add column if not exists ai_writer_default_topics    text[]   not null default array[
        'Best IPTV apps for Smart TV in 2026',
        '4K streaming setup guide for Firestick',
        'How to fix IPTV buffering issues',
        'Premier League streaming — which IPTV is best?',
        'Anti-freeze IPTV — what to look for'
      ]::text[],
  add column if not exists ai_writer_system_prompt     text
        not null default
'You are a senior content writer for MediaHubAccess.com — a premium 4K IPTV streaming service. Write engaging, SEO-friendly blog posts in clean Markdown. Use H2/H3 headings, short paragraphs, bullet lists where helpful. Include a natural call to action toward the end. Tone: helpful, knowledgeable, slightly casual. Never invent prices — the four real plans are: 1 month $15, 3 months $35, 6 months $45, 12 months $70 (best value, 7-day money-back).';
