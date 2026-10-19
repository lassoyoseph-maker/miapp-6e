-- Preferencias privadas de clientes de la tienda de muebles; no modifica registros anteriores.
begin;
create table if not exists public.vitrina_preferencias (
 id uuid primary key default gen_random_uuid(),
 usuario_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
 nombre text not null check (char_length(trim(nombre)) between 1 and 120),
 correo text not null check (char_length(correo) <= 254 and correo ~ '^[^[:space:]@]+@[^[:space:]@]+[.][^[:space:]@]+$'),
 telefono text not null check (telefono ~ '^[+0-9][0-9 ()-]{6,19}$'),
 ciudad text not null check (char_length(trim(ciudad)) between 1 and 120),
 mueble_favorito text not null check (char_length(trim(mueble_favorito)) between 1 and 120),
 material_preferido text not null check (char_length(trim(material_preferido)) between 1 and 120),
 created_at timestamptz not null default now()
);
create index if not exists vitrina_preferencias_usuario_idx on public.vitrina_preferencias(usuario_id, created_at desc);
alter table public.vitrina_preferencias enable row level security;
revoke all on public.vitrina_preferencias from anon, authenticated;
grant select on public.vitrina_preferencias to authenticated;
grant insert(nombre, correo, telefono, ciudad, mueble_favorito, material_preferido) on public.vitrina_preferencias to authenticated;
create policy preferencias_insertar_propias on public.vitrina_preferencias for insert to authenticated with check ((select auth.uid()) = usuario_id);
create policy preferencias_leer_propias on public.vitrina_preferencias for select to authenticated using ((select auth.uid()) = usuario_id);
commit;
