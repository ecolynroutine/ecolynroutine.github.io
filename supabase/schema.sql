-- ECOLYN / Supabase
-- Exécuter ce fichier une seule fois dans Supabase > SQL Editor.
-- Il peut être relancé sans supprimer les données existantes.

create extension if not exists pgcrypto;
create schema if not exists private;

revoke all on schema private from public, anon, authenticated;

create table if not exists public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  created_by uuid references auth.users(id) on delete set null
);

create table if not exists public.prospects (
  id uuid primary key default gen_random_uuid(),
  reference text not null unique
    check (reference ~ '^ECO-[A-Z0-9-]{4,32}$'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  status text not null default 'nouveau'
    check (status in ('nouveau', 'a_contacter', 'contacte', 'qualifie', 'converti', 'archive')),
  first_name text not null check (char_length(first_name) between 1 and 120),
  whatsapp text not null check (char_length(whatsapp) between 5 and 40),
  email text check (email is null or char_length(email) <= 254),
  city text not null check (char_length(city) between 1 and 160),
  primary_concern text not null check (char_length(primary_concern) between 1 and 160),
  skin_type text check (skin_type is null or char_length(skin_type) <= 160),
  goal text check (goal is null or char_length(goal) <= 500),
  description text check (description is null or char_length(description) <= 6000),
  answers jsonb not null default '{}'::jsonb
    check (jsonb_typeof(answers) = 'object' and pg_column_size(answers) <= 65536),
  photo_data_url text
    check (
      photo_data_url is null
      or (
        char_length(photo_data_url) <= 4500000
        and photo_data_url ~ '^data:image/(jpeg|png|webp);base64,'
      )
    ),
  photo_name text check (photo_name is null or char_length(photo_name) <= 255),
  photo_consent boolean not null default false,
  contact_consent boolean not null default false
    check (contact_consent = true),
  marketing_consent boolean not null default false,
  language text not null default 'fr' check (language in ('fr', 'ar')),
  source text not null default 'ecolyn-advice-platform'
    check (char_length(source) between 1 and 120),
  page_url text check (page_url is null or char_length(page_url) <= 2000),
  referrer text check (referrer is null or char_length(referrer) <= 2000),
  utm_source text check (utm_source is null or char_length(utm_source) <= 255),
  utm_medium text check (utm_medium is null or char_length(utm_medium) <= 255),
  utm_campaign text check (utm_campaign is null or char_length(utm_campaign) <= 255),
  utm_term text check (utm_term is null or char_length(utm_term) <= 255),
  utm_content text check (utm_content is null or char_length(utm_content) <= 255),
  admin_notes text not null default '' check (char_length(admin_notes) <= 6000),
  updated_by uuid references auth.users(id) on delete set null
);

create index if not exists prospects_created_at_idx
  on public.prospects (created_at desc);
create index if not exists prospects_status_created_at_idx
  on public.prospects (status, created_at desc);
create index if not exists prospects_whatsapp_idx
  on public.prospects (whatsapp);
create index if not exists prospects_email_idx
  on public.prospects (email)
  where email is not null;

create table if not exists public.tracking_settings (
  id smallint primary key default 1 check (id = 1),
  meta_pixel_id text check (meta_pixel_id is null or char_length(meta_pixel_id) <= 64),
  meta_enabled boolean not null default false,
  tiktok_pixel_id text check (tiktok_pixel_id is null or char_length(tiktok_pixel_id) <= 64),
  tiktok_enabled boolean not null default false,
  ga4_measurement_id text check (ga4_measurement_id is null or char_length(ga4_measurement_id) <= 64),
  ga4_enabled boolean not null default false,
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users(id) on delete set null
);

create table if not exists public.live_settings (
  id smallint primary key default 1 check (id = 1),
  is_published boolean not null default false,
  title_fr text not null default 'Live ECOLYN'
    check (char_length(title_fr) between 1 and 180),
  title_ar text not null default 'لايف إيكولين'
    check (char_length(title_ar) between 1 and 180),
  description_fr text
    check (description_fr is null or char_length(description_fr) <= 1200),
  description_ar text
    check (description_ar is null or char_length(description_ar) <= 1200),
  starts_at timestamptz,
  ends_at timestamptz,
  timezone text not null default 'Africa/Casablanca'
    check (char_length(timezone) between 1 and 64),
  location text
    check (location is null or char_length(location) <= 180),
  meeting_url text
    check (
      meeting_url is null
      or (
        char_length(meeting_url) <= 2000
        and meeting_url ~ '^https://'
      )
    ),
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users(id) on delete set null,
  check (not is_published or starts_at is not null),
  check (ends_at is null or starts_at is null or ends_at > starts_at)
);

create table if not exists public.commerce_settings (
  id smallint primary key default 1 check (id = 1),
  offer_active boolean not null default true,
  offer_end_at timestamptz,
  free_shipping boolean not null default true,
  shipping_fee_dh integer not null default 40 check (shipping_fee_dh >= 0),
  whatsapp_number text not null default '212699072913'
    check (whatsapp_number ~ '^\d{10,15}$'),
  whatsapp_message_fr text not null default 'Bonjour Hanane, j’ai une question avant de composer ma routine ECOLYN.'
    check (char_length(whatsapp_message_fr) between 1 and 500),
  whatsapp_message_ar text not null default 'سلام حنان، عندي سؤال قبل ما نختار روتين إيكولين ديالي.'
    check (char_length(whatsapp_message_ar) between 1 and 500),
  product_prices jsonb not null default '{"cream":99,"cleanser":103,"sunscreen":108,"serum":113}'::jsonb
    check (jsonb_typeof(product_prices) = 'object'),
  bundle_prices jsonb not null default '{"cream+cleanser":152,"cream+sunscreen":155,"cream+serum":157,"cleanser+sunscreen":159,"cleanser+serum":161,"sunscreen+serum":164,"cream+cleanser+sunscreen":208,"cream+cleanser+serum":210,"cream+sunscreen+serum":213,"cleanser+sunscreen+serum":217,"cream+cleanser+sunscreen+serum":266}'::jsonb
    check (jsonb_typeof(bundle_prices) = 'object'),
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users(id) on delete set null,
  check (not offer_active or offer_end_at is not null)
);

insert into public.tracking_settings (id)
values (1)
on conflict (id) do nothing;

insert into public.live_settings (id)
values (1)
on conflict (id) do nothing;

insert into public.commerce_settings (id, offer_end_at)
values (1, now() + interval '7 days')
on conflict (id) do nothing;

create or replace function private.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.admin_users
    where user_id = (select auth.uid())
  );
$$;

revoke all on function private.is_admin() from public, anon, authenticated;
grant usage on schema private to authenticated;
grant execute on function private.is_admin() to authenticated;

create or replace function private.grant_admin_by_email(target_email text)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  target_user_id uuid;
begin
  select id
  into target_user_id
  from auth.users
  where lower(email) = lower(trim(target_email))
  limit 1;

  if target_user_id is null then
    raise exception 'Aucun utilisateur Supabase Auth ne correspond à cet e-mail.';
  end if;

  insert into public.admin_users (user_id, created_by)
  values (target_user_id, (select auth.uid()))
  on conflict (user_id) do nothing;

  return target_user_id;
end;
$$;

revoke all on function private.grant_admin_by_email(text)
  from public, anon, authenticated;

create or replace function private.revoke_admin_by_email(target_email text)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  target_user_id uuid;
begin
  select id
  into target_user_id
  from auth.users
  where lower(email) = lower(trim(target_email))
  limit 1;

  if target_user_id is null then
    raise exception 'Aucun utilisateur Supabase Auth ne correspond à cet e-mail.';
  end if;

  delete from public.admin_users where user_id = target_user_id;
  return target_user_id;
end;
$$;

revoke all on function private.revoke_admin_by_email(text)
  from public, anon, authenticated;

create or replace function private.touch_prospect()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  new.updated_at := now();
  new.updated_by := (select auth.uid());
  return new;
end;
$$;

create or replace function private.normalize_new_prospect()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  new.created_at := now();
  new.updated_at := now();
  new.status := 'nouveau';
  new.admin_notes := '';
  new.updated_by := null;
  return new;
end;
$$;

create or replace function private.touch_tracking_settings()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  new.updated_at := now();
  new.updated_by := (select auth.uid());
  return new;
end;
$$;

create or replace function private.touch_live_settings()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  new.updated_at := now();
  new.updated_by := (select auth.uid());
  return new;
end;
$$;

create or replace function private.touch_commerce_settings()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  new.updated_at := now();
  new.updated_by := (select auth.uid());
  return new;
end;
$$;

drop trigger if exists prospects_touch_updated_at on public.prospects;
create trigger prospects_touch_updated_at
before update on public.prospects
for each row execute function private.touch_prospect();

drop trigger if exists prospects_normalize_new on public.prospects;
create trigger prospects_normalize_new
before insert on public.prospects
for each row execute function private.normalize_new_prospect();

drop trigger if exists tracking_settings_touch_updated_at on public.tracking_settings;
create trigger tracking_settings_touch_updated_at
before update on public.tracking_settings
for each row execute function private.touch_tracking_settings();

drop trigger if exists live_settings_touch_updated_at on public.live_settings;
create trigger live_settings_touch_updated_at
before update on public.live_settings
for each row execute function private.touch_live_settings();

drop trigger if exists commerce_settings_touch_updated_at on public.commerce_settings;
create trigger commerce_settings_touch_updated_at
before update on public.commerce_settings
for each row execute function private.touch_commerce_settings();

alter table public.admin_users enable row level security;
alter table public.admin_users force row level security;
alter table public.prospects enable row level security;
alter table public.prospects force row level security;
alter table public.tracking_settings enable row level security;
alter table public.tracking_settings force row level security;
alter table public.live_settings enable row level security;
alter table public.live_settings force row level security;
alter table public.commerce_settings enable row level security;
alter table public.commerce_settings force row level security;

drop policy if exists "admin can read own role" on public.admin_users;
create policy "admin can read own role"
on public.admin_users
for select
to authenticated
using (user_id = (select auth.uid()));

drop policy if exists "anonymous can create prospects" on public.prospects;
create policy "anonymous can create prospects"
on public.prospects
for insert
to anon
with check (
  status = 'nouveau'
  and admin_notes = ''
  and updated_by is null
);

drop policy if exists "administrators can insert prospects" on public.prospects;
create policy "administrators can insert prospects"
on public.prospects
for insert
to authenticated
with check ((select private.is_admin()));

drop policy if exists "administrators can read prospects" on public.prospects;
create policy "administrators can read prospects"
on public.prospects
for select
to authenticated
using ((select private.is_admin()));

drop policy if exists "administrators can update prospects" on public.prospects;
create policy "administrators can update prospects"
on public.prospects
for update
to authenticated
using ((select private.is_admin()))
with check ((select private.is_admin()));

drop policy if exists "public can read tracking configuration" on public.tracking_settings;
create policy "public can read tracking configuration"
on public.tracking_settings
for select
to anon, authenticated
using (id = 1);

drop policy if exists "administrators can update tracking configuration" on public.tracking_settings;
create policy "administrators can update tracking configuration"
on public.tracking_settings
for update
to authenticated
using ((select private.is_admin()))
with check ((select private.is_admin()));

drop policy if exists "public can read published live" on public.live_settings;
create policy "public can read published live"
on public.live_settings
for select
to anon, authenticated
using (id = 1 and is_published = true);

drop policy if exists "administrators can read live configuration" on public.live_settings;
create policy "administrators can read live configuration"
on public.live_settings
for select
to authenticated
using ((select private.is_admin()));

drop policy if exists "administrators can update live configuration" on public.live_settings;
create policy "administrators can update live configuration"
on public.live_settings
for update
to authenticated
using ((select private.is_admin()))
with check ((select private.is_admin()));

drop policy if exists "public can read commerce configuration" on public.commerce_settings;
create policy "public can read commerce configuration"
on public.commerce_settings
for select
to anon, authenticated
using (id = 1);

drop policy if exists "administrators can update commerce configuration" on public.commerce_settings;
create policy "administrators can update commerce configuration"
on public.commerce_settings
for update
to authenticated
using ((select private.is_admin()))
with check ((select private.is_admin()));

revoke all on table public.admin_users from anon, authenticated;
revoke all on table public.prospects from anon, authenticated;
revoke all on table public.tracking_settings from anon, authenticated;
revoke all on table public.live_settings from anon, authenticated;
revoke all on table public.commerce_settings from anon, authenticated;

grant select on table public.admin_users to authenticated;
grant insert on table public.prospects to anon;
grant select, insert on table public.prospects to authenticated;
grant update (status, admin_notes) on table public.prospects to authenticated;
grant select on table public.tracking_settings to anon, authenticated;
grant update (
  meta_pixel_id,
  meta_enabled,
  tiktok_pixel_id,
  tiktok_enabled,
  ga4_measurement_id,
  ga4_enabled
) on table public.tracking_settings to authenticated;
grant select on table public.live_settings to anon, authenticated;
grant update (
  is_published,
  title_fr,
  title_ar,
  description_fr,
  description_ar,
  starts_at,
  ends_at,
  timezone,
  location,
  meeting_url
) on table public.live_settings to authenticated;
grant select on table public.commerce_settings to anon, authenticated;
grant update (
  offer_active,
  offer_end_at,
  free_shipping,
  shipping_fee_dh,
  whatsapp_number,
  whatsapp_message_fr,
  whatsapp_message_ar,
  product_prices,
  bundle_prices
) on table public.commerce_settings to authenticated;

comment on table public.prospects is
  'Demandes ECOLYN. Les visiteurs peuvent uniquement insérer; la lecture et la gestion sont réservées aux administrateurs.';
comment on table public.tracking_settings is
  'Configuration publique des identifiants de tracking. Seuls les administrateurs peuvent la modifier.';
comment on table public.admin_users is
  'Liste d’autorisation administrateur. Modification uniquement via SQL sécurisé/service_role.';
comment on table public.live_settings is
  'Prochain live ECOLYN. Le public voit uniquement la ligne lorsque sa publication est activée.';
comment on table public.commerce_settings is
  'Offre globale de la landing page /pack. Lecture publique, modification réservée aux administrateurs.';

notify pgrst, 'reload schema';

-- APRÈS avoir créé le premier utilisateur dans Authentication > Users,
-- exécuter séparément cette ligne en remplaçant l’e-mail :
-- select private.grant_admin_by_email('votre@email.com');
