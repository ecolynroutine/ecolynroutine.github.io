-- ECOLYN — ajout idempotent de l’offre commerciale /pack
-- Supabase > SQL Editor > New query > coller ce fichier > Run.

create table if not exists public.commerce_settings (
  id smallint primary key default 1 check (id = 1),
  offer_active boolean not null default true,
  offer_end_at timestamptz,
  free_shipping boolean not null default true,
  shipping_fee_dh integer not null default 40 check (shipping_fee_dh >= 0),
  whatsapp_number text not null default '212699072913' check (whatsapp_number ~ '^\d{10,15}$'),
  whatsapp_message_fr text not null default 'Bonjour Hanane, j’ai une question avant de composer ma routine ECOLYN.' check (char_length(whatsapp_message_fr) between 1 and 500),
  whatsapp_message_ar text not null default 'سلام حنان، عندي سؤال قبل ما نختار روتين إيكولين ديالي.' check (char_length(whatsapp_message_ar) between 1 and 500),
  product_prices jsonb not null default '{"cream":99,"cleanser":103,"sunscreen":108,"serum":113}'::jsonb check (jsonb_typeof(product_prices) = 'object'),
  bundle_prices jsonb not null default '{"cream+cleanser":152,"cream+sunscreen":155,"cream+serum":157,"cleanser+sunscreen":159,"cleanser+serum":161,"sunscreen+serum":164,"cream+cleanser+sunscreen":208,"cream+cleanser+serum":210,"cream+sunscreen+serum":213,"cleanser+sunscreen+serum":217,"cream+cleanser+sunscreen+serum":266}'::jsonb check (jsonb_typeof(bundle_prices) = 'object'),
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users(id) on delete set null,
  check (not offer_active or offer_end_at is not null)
);

insert into public.commerce_settings (id, offer_end_at)
values (1, now() + interval '7 days')
on conflict (id) do nothing;

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

drop trigger if exists commerce_settings_touch_updated_at on public.commerce_settings;
create trigger commerce_settings_touch_updated_at
before update on public.commerce_settings
for each row execute function private.touch_commerce_settings();

alter table public.commerce_settings enable row level security;
alter table public.commerce_settings force row level security;

drop policy if exists "public can read commerce configuration" on public.commerce_settings;
create policy "public can read commerce configuration"
on public.commerce_settings for select to anon, authenticated
using (id = 1);

drop policy if exists "administrators can update commerce configuration" on public.commerce_settings;
create policy "administrators can update commerce configuration"
on public.commerce_settings for update to authenticated
using ((select private.is_admin()))
with check ((select private.is_admin()));

revoke all on table public.commerce_settings from anon, authenticated;
grant select on table public.commerce_settings to anon, authenticated;
grant update (
  offer_active, offer_end_at, free_shipping, shipping_fee_dh,
  whatsapp_number, whatsapp_message_fr, whatsapp_message_ar,
  product_prices, bundle_prices
) on table public.commerce_settings to authenticated;

comment on table public.commerce_settings is
  'Offre globale de la landing page /pack. Lecture publique, modification réservée aux administrateurs.';

notify pgrst, 'reload schema';
