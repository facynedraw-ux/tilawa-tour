-- Colle ce script dans l'éditeur SQL de ton projet Supabase

create table if not exists public.user_data (
  user_id          uuid references auth.users on delete cascade not null primary key,
  programme        jsonb    default '{}'::jsonb,
  last_page        integer  default 1,
  done_days        jsonb    default '{}'::jsonb,
  khatmates_annee  integer  default 0,
  meditated        jsonb    default '[]'::jsonb,
  bookmark         integer  default null,
  objectif_ramadan jsonb    default null,
  langue           text     default 'fr',
  updated_at       timestamptz default now()
);

-- Sécurité : chaque utilisateur ne voit que ses propres données
alter table public.user_data enable row level security;

create policy "Lecture : données personnelles" on public.user_data
  for select using (auth.uid() = user_id);

create policy "Insertion : données personnelles" on public.user_data
  for insert with check (auth.uid() = user_id);

create policy "Mise à jour : données personnelles" on public.user_data
  for update using (auth.uid() = user_id);
