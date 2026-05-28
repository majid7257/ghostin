-- ============================================================
-- GhostIn — full schema
-- ============================================================

-- Profiles (extends auth.users)
create table if not exists profiles (
  id                    uuid references auth.users(id) on delete cascade primary key,
  email                 text unique not null,
  full_name             text,
  plan                  text not null default 'free' check (plan in ('free', 'pro', 'agency')),
  stripe_customer_id    text,
  stripe_subscription_id text,
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now()
);

-- Auto-create profile on signup
create or replace function handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id, email, full_name)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- Posts
create table if not exists posts (
  id          uuid default gen_random_uuid() primary key,
  user_id     uuid references profiles(id) on delete cascade not null,
  topic       text not null,
  tone        text not null,
  content     text not null,
  created_at  timestamptz not null default now()
);
create index if not exists posts_user_id_idx on posts(user_id);

-- Lead magnets
create table if not exists lead_magnets (
  id          uuid default gen_random_uuid() primary key,
  user_id     uuid references profiles(id) on delete cascade not null,
  niche       text not null,
  offer       text not null,
  title       text not null,
  content     jsonb not null default '{}',
  slug        text unique not null,
  published   boolean not null default false,
  created_at  timestamptz not null default now()
);
create index if not exists lead_magnets_user_id_idx on lead_magnets(user_id);
create index if not exists lead_magnets_slug_idx on lead_magnets(slug);

-- DM Sequences
create table if not exists sequences (
  id           uuid default gen_random_uuid() primary key,
  user_id      uuid references profiles(id) on delete cascade not null,
  name         text not null,
  trigger_type text not null default 'commenter',
  messages     jsonb not null default '[]',
  is_active    boolean not null default true,
  created_at   timestamptz not null default now()
);
create index if not exists sequences_user_id_idx on sequences(user_id);

-- LinkedIn accounts
create table if not exists linkedin_accounts (
  id            uuid default gen_random_uuid() primary key,
  user_id       uuid references profiles(id) on delete cascade not null,
  account_name  text not null,
  profile_url   text,
  is_active     boolean not null default true,
  created_at    timestamptz not null default now()
);
create index if not exists linkedin_accounts_user_id_idx on linkedin_accounts(user_id);

-- Monthly usage tracking
create table if not exists usage (
  id                  uuid default gen_random_uuid() primary key,
  user_id             uuid references profiles(id) on delete cascade not null,
  month               text not null,    -- YYYY-MM
  posts_generated     integer not null default 0,
  sequences_created   integer not null default 0,
  unique(user_id, month)
);
create index if not exists usage_user_month_idx on usage(user_id, month);

-- Atomic increment helpers (avoids race conditions)
create or replace function increment_post_usage(p_user_id uuid, p_month text)
returns void language plpgsql security definer as $$
begin
  insert into public.usage (user_id, month, posts_generated, sequences_created)
  values (p_user_id, p_month, 1, 0)
  on conflict (user_id, month) do update
    set posts_generated = usage.posts_generated + 1;
end;
$$;

create or replace function increment_sequence_usage(p_user_id uuid, p_month text)
returns void language plpgsql security definer as $$
begin
  insert into public.usage (user_id, month, posts_generated, sequences_created)
  values (p_user_id, p_month, 0, 1)
  on conflict (user_id, month) do update
    set sequences_created = usage.sequences_created + 1;
end;
$$;

-- ============================================================
-- Row-Level Security
-- ============================================================
alter table profiles         enable row level security;
alter table posts             enable row level security;
alter table lead_magnets      enable row level security;
alter table sequences         enable row level security;
alter table linkedin_accounts enable row level security;
alter table usage             enable row level security;

-- Profiles: users can only read/update their own
create policy "profiles: own" on profiles for all using (auth.uid() = id);

-- Posts
create policy "posts: own" on posts for all using (auth.uid() = user_id);

-- Lead magnets: owners have full access; published ones are public-readable
create policy "lead_magnets: own"      on lead_magnets for all using (auth.uid() = user_id);
create policy "lead_magnets: public"   on lead_magnets for select using (published = true);

-- Sequences
create policy "sequences: own" on sequences for all using (auth.uid() = user_id);

-- LinkedIn accounts
create policy "linkedin_accounts: own" on linkedin_accounts for all using (auth.uid() = user_id);

-- Usage
create policy "usage: own" on usage for all using (auth.uid() = user_id);
