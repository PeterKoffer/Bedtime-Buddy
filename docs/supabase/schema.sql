create extension if not exists pgcrypto;

create table if not exists public.characters (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  age int not null,
  personality text[],
  appearance text,
  description text,
  selected_gender text,
  avatar_url text,
  avatar_generated boolean default false,
  created_at timestamptz not null default now()
);

create table if not exists public.stories (
  id uuid primary key default gen_random_uuid(),
  character_id uuid references public.characters(id) on delete set null,
  data jsonb not null,
  created_at timestamptz not null default now()
);

alter table public.characters enable row level security;
alter table public.stories enable row level security;

create policy "public select characters" on public.characters for select using (true);
create policy "public insert characters" on public.characters for insert with check (true);

create policy "public select stories" on public.stories for select using (true);
create policy "public insert stories" on public.stories for insert with check (true);

create index if not exists idx_characters_created_at on public.characters (created_at desc);
create index if not exists idx_stories_created_at on public.stories (created_at desc);