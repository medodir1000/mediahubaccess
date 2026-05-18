-- =====================================================================
-- Admin + Articles + Blog SEO
-- =====================================================================

-- 1. PROFILES =========================================================
-- Mirror of auth.users with app-specific fields (role).
create type user_role as enum ('admin','editor','user');

create table public.profiles (
  id          uuid        primary key references auth.users(id) on delete cascade,
  email       text        unique not null,
  display_name text,
  avatar_url  text,
  role        user_role   not null default 'user',
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create trigger profiles_set_updated_at before update on public.profiles
  for each row execute function public.set_updated_at();

alter table public.profiles enable row level security;

-- Users can read their own profile; admins can read all.
create policy "own profile readable" on public.profiles
  for select to authenticated using (auth.uid() = id);
create policy "admins read all profiles" on public.profiles
  for select to authenticated using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  );
create policy "own profile updatable" on public.profiles
  for update to authenticated using (auth.uid() = id) with check (auth.uid() = id);

-- Helper: is the calling user an admin?
create or replace function public.is_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select coalesce(
    (select role = 'admin' from public.profiles where id = auth.uid()),
    false
  );
$$;

-- Auto-create profile row whenever a new auth user is created.
create or replace function public.handle_new_auth_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, role)
  values (
    new.id,
    new.email,
    case
      -- Designated admin email becomes admin automatically on first signup.
      when new.email = 'admin@mediahubaccess.com' then 'admin'::user_role
      else 'user'::user_role
    end
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_auth_user();

-- Backfill: for users that signed up BEFORE this trigger existed,
-- create the missing profile rows; then mark the admin email.
insert into public.profiles (id, email, role)
select u.id,
       u.email,
       case when u.email = 'admin@mediahubaccess.com' then 'admin'::user_role else 'user'::user_role end
  from auth.users u
 where not exists (select 1 from public.profiles p where p.id = u.id);

update public.profiles
   set role = 'admin'
 where email = 'admin@mediahubaccess.com';

-- 2. ARTICLES =========================================================
create type article_status as enum ('draft','scheduled','published','archived');

create table public.articles (
  id              uuid           primary key default gen_random_uuid(),
  slug            text           unique not null,                 -- URL part: /blog/<slug>
  title           text           not null,
  subtitle        text,
  excerpt         text,                                            -- short summary for cards
  body_markdown   text           not null default '',              -- raw markdown
  body_html       text,                                            -- pre-rendered HTML (optional)
  cover_image_url text,
  author_id       uuid           references public.profiles(id) on delete set null,
  category        text,                                            -- 'streaming-tips', 'reviews', 'sports'
  tags            text[]         not null default '{}',
  status          article_status not null default 'draft',
  -- SEO fields ------------------------------------------------------
  seo_title       text,                                            -- defaults to title if null
  seo_description text,                                            -- defaults to excerpt if null
  seo_keywords    text[]         not null default '{}',
  og_image_url    text,                                            -- defaults to cover_image_url
  canonical_url   text,
  no_index        boolean        not null default false,
  -- Stats -----------------------------------------------------------
  read_time_min   smallint,
  view_count      int            not null default 0,
  -- Timestamps ------------------------------------------------------
  published_at    timestamptz,
  scheduled_for   timestamptz,
  created_at      timestamptz    not null default now(),
  updated_at      timestamptz    not null default now()
);

create index articles_slug_idx        on public.articles (slug);
create index articles_status_idx      on public.articles (status);
create index articles_published_idx   on public.articles (published_at desc nulls last);
create index articles_category_idx    on public.articles (category);
create index articles_tags_idx        on public.articles using gin (tags);

create trigger articles_set_updated_at before update on public.articles
  for each row execute function public.set_updated_at();

alter table public.articles enable row level security;

-- Public: read PUBLISHED + non-no_index articles.
create policy "published articles are public" on public.articles
  for select to anon, authenticated
  using (status = 'published' and published_at <= now() and no_index = false);

-- Admin / editor: full CRUD.
create policy "admins manage articles" on public.articles
  for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- 3. BOT SETTINGS (single-row config table) ===========================
-- Centralized place to tweak the Liam bot without redeploying brain.py.
create table public.bot_settings (
  id              smallint    primary key default 1 check (id = 1),
  enabled         boolean     not null default true,
  model           text        not null default 'openai/gpt-4o-mini',
  reply_delay_ms  int         not null default 3000,
  system_prompt   text        not null default '',
  max_tokens      smallint    not null default 200,
  temperature     numeric(3,2) not null default 0.85,
  trial_url_fallback text     not null default 'https://mediahubaccess.com/trial-active',
  ai_writer_model text        not null default 'openai/gpt-4o',
  ai_writer_image_model text  not null default 'gemini-3.1-flash-image-preview',
  updated_at      timestamptz not null default now(),
  updated_by      uuid        references public.profiles(id) on delete set null
);

-- Seed with the current Liam prompt
insert into public.bot_settings (id, system_prompt) values (1,
  E'You are Liam, a friendly, casual, and authentic customer support agent for MediaHubAccess.com, an elite home entertainment streaming brand. Your goal is to help leads test the service and then convert them into buyers for the ''Annual Ultimate Pass'' priced at $79.99 USD.\nCRITICAL RULES:\n- ALWAYS use natural UK/Australian casual slang (e.g., ''mate'', ''no worries'', ''cheers'', ''footy'', ''stoked'').\n- NEVER use bullet points, numbered lists, or formal formatting. Humans on WhatsApp type casually.\n- Keep your answers extremely brief and crisp (1 to 2 sentences maximum per reply). Do not look like a chatbot.\n- If the customer asks for a free trial or test, provide this exact text: ''No worries mate! Here is your 12-Hour Premium 4K Test Line: https://mediahubaccess.com/trial-active. Enjoy the footy!'' and ask them what device they are streaming on tonight.\n- Do not push for the sale on the very first message. Let them have the trial link first, act helpful, then transition into locking the $79.99 USD annual pass offer.'
) on conflict (id) do nothing;

alter table public.bot_settings enable row level security;
create policy "admins read bot settings" on public.bot_settings
  for select to authenticated using (public.is_admin());
create policy "admins update bot settings" on public.bot_settings
  for update to authenticated using (public.is_admin()) with check (public.is_admin());
