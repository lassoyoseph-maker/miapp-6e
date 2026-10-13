-- The existing perfiles_usuario table belongs to Auth. Keep its policies intact.
-- Public intake forms can submit, but cannot read or modify personal information.
begin;

create table if not exists public.vitrina_registros (
  id uuid primary key default gen_random_uuid(),
  nombre text not null check (char_length(btrim(nombre)) between 1 and 120),
  correo text not null check (char_length(correo) <= 254 and correo ~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$'),
  telefono text not null check (telefono ~ '^[+0-9][0-9 ()-]{6,19}$'),
  ciudad text not null check (char_length(btrim(ciudad)) between 1 and 120),
  created_at timestamptz not null default now()
);
alter table public.vitrina_registros enable row level security;
revoke all on public.vitrina_registros from anon, authenticated;
grant insert (nombre, correo, telefono, ciudad) on public.vitrina_registros to anon, authenticated;
drop policy if exists vitrina_registros_submit on public.vitrina_registros;
create policy vitrina_registros_submit on public.vitrina_registros
  for insert to anon, authenticated with check (true);

create table if not exists public.vitrina_solicitudes_compra (
  id uuid primary key default gen_random_uuid(),
  articulo_id bigint not null references public.articulos_vitrina(id),
  nombre text not null check (char_length(btrim(nombre)) between 1 and 120),
  telefono text not null check (telefono ~ '^[+0-9][0-9 ()-]{6,19}$'),
  created_at timestamptz not null default now()
);
create index if not exists vitrina_solicitudes_articulo_idx on public.vitrina_solicitudes_compra(articulo_id);
alter table public.vitrina_solicitudes_compra enable row level security;
revoke all on public.vitrina_solicitudes_compra from anon, authenticated;
grant insert (articulo_id, nombre, telefono) on public.vitrina_solicitudes_compra to anon, authenticated;
drop policy if exists vitrina_solicitudes_submit on public.vitrina_solicitudes_compra;
create policy vitrina_solicitudes_submit on public.vitrina_solicitudes_compra
  for insert to anon, authenticated with check (true);

commit;
