-- ====================================================================
-- 1. TABLA: clientes_cafe (Laboratorio 2 + Actividad Final)
-- ====================================================================
create table if not exists public.clientes_cafe (
  id bigint generated always as identity primary key,
  nombre text not null,
  correo text not null,
  telefono text not null,
  ciudad text not null,
  cafe_favorito text not null,
  tipo_preparacion text not null default 'Filtrado',
  created_at timestamptz not null default now()
);

-- Si la tabla ya existía sin la columna de la Actividad Final, se agrega:
do $$
begin
  if not exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'clientes_cafe'
      and column_name = 'tipo_preparacion'
  ) then
    alter table public.clientes_cafe
      add column tipo_preparacion text not null default 'Filtrado';
  end if;
end;
$$;

alter table public.clientes_cafe enable row level security;

drop policy if exists "permitir insertar clientes" on public.clientes_cafe;
create policy "permitir insertar clientes"
  on public.clientes_cafe
  for insert
  to anon, authenticated
  with check (true);

drop policy if exists "permitir consultar clientes" on public.clientes_cafe;
create policy "permitir consultar clientes"
  on public.clientes_cafe
  for select
  to anon, authenticated
  using (true);

grant select, insert on public.clientes_cafe to anon, authenticated;

-- ====================================================================
-- 2. TABLA: articulos_vitrina (Catálogo personalizado La Vitrina)
-- ====================================================================
create table if not exists public.articulos_vitrina (
  id bigint generated always as identity primary key,
  nombre text not null,
  categoria text not null check (
    categoria in ('Muebles', 'Arte', 'Relojes', 'Decoración')
  ),
  precio integer not null check (precio > 0),
  epoca text not null,
  imagen_url text,
  created_at timestamptz not null default now()
);

alter table public.articulos_vitrina enable row level security;

drop policy if exists "permitir insertar articulos vitrina" on public.articulos_vitrina;
drop policy if exists "permitir consultar articulos vitrina" on public.articulos_vitrina;

create policy "permitir insertar articulos vitrina"
  on public.articulos_vitrina
  for insert
  to anon, authenticated
  with check (true);

create policy "permitir consultar articulos vitrina"
  on public.articulos_vitrina
  for select
  to anon, authenticated
  using (true);

grant select, insert on public.articulos_vitrina to anon, authenticated;

-- ====================================================================
-- 3. TABLA: perfiles_usuario (Laboratorio 3 / Auth + Metadatos)
-- ====================================================================
create table if not exists public.perfiles_usuario (
  id uuid primary key references auth.users (id) on delete cascade,
  nombre_completo text not null,
  telefono text not null,
  ciudad text not null,
  created_at timestamptz not null default now()
);

alter table public.perfiles_usuario enable row level security;

drop policy if exists "cada usuario consulta su perfil" on public.perfiles_usuario;
create policy "cada usuario consulta su perfil"
  on public.perfiles_usuario
  for select
  to authenticated
  using ((select auth.uid()) = id);

drop policy if exists "cada usuario actualiza su perfil" on public.perfiles_usuario;
create policy "cada usuario actualiza su perfil"
  on public.perfiles_usuario
  for update
  to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

grant select, update on public.perfiles_usuario to authenticated;

-- Trigger para crear perfil automáticamente al registrar usuario en auth.users
create or replace function public.crear_perfil_usuario()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.perfiles_usuario (id, nombre_completo, telefono, ciudad)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'nombre_completo', ''),
    coalesce(new.raw_user_meta_data ->> 'telefono', ''),
    coalesce(new.raw_user_meta_data ->> 'ciudad', '')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists al_crear_usuario_perfil on auth.users;
create trigger al_crear_usuario_perfil
  after insert on auth.users
  for each row execute function public.crear_perfil_usuario();

revoke execute on function public.crear_perfil_usuario()
  from public, anon, authenticated;
-- ====================================================================
-- 4. REGISTROS DE CUENTA Y SOLICITUDES DE COMPRA DE LA VITRINA
-- ====================================================================

create table if not exists public.vitrina_registros (
  id uuid primary key default gen_random_uuid(),
  usuario_id uuid not null unique references auth.users (id) on delete cascade,
  nombre text not null check (char_length(btrim(nombre)) between 1 and 120),
  correo text not null check (
    char_length(correo) <= 254
    and correo ~ '^[^[:space:]@]+@[^[:space:]@]+[.][^[:space:]@]+$'
  ),
  telefono text not null check (telefono ~ '^[+0-9][0-9 ()-]{6,19}$'),
  ciudad text not null check (char_length(btrim(ciudad)) between 1 and 120),
  created_at timestamptz not null default now()
);

alter table public.vitrina_registros
  add column if not exists usuario_id uuid references auth.users (id) on delete cascade;
create unique index if not exists vitrina_registros_usuario_id_key
  on public.vitrina_registros (usuario_id);
alter table public.vitrina_registros
  alter column usuario_id set not null;

alter table public.vitrina_registros enable row level security;
drop policy if exists vitrina_registros_submit on public.vitrina_registros;
drop policy if exists vitrina_registros_leer_propio on public.vitrina_registros;
create policy vitrina_registros_leer_propio
  on public.vitrina_registros
  for select to authenticated
  using ((select auth.uid()) = usuario_id);
revoke insert, update, delete on public.vitrina_registros from anon, authenticated;
grant select on public.vitrina_registros to authenticated;

comment on table public.vitrina_registros is
  'Datos enviados al crear una cuenta de La Vitrina; una fila por usuario Auth.';
comment on column public.vitrina_registros.usuario_id is
  'Cuenta de Supabase Auth que originó este registro.';

create or replace function public.guardar_registro_vitrina()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  nombre_registro text := btrim(coalesce(new.raw_user_meta_data ->> 'nombre_completo', ''));
  telefono_registro text := btrim(coalesce(new.raw_user_meta_data ->> 'telefono', ''));
  ciudad_registro text := btrim(coalesce(new.raw_user_meta_data ->> 'ciudad', ''));
  correo_registro text := lower(btrim(coalesce(new.email, '')));
begin
  if char_length(nombre_registro) between 1 and 120
     and char_length(ciudad_registro) between 1 and 120
     and correo_registro ~ '^[^[:space:]@]+@[^[:space:]@]+[.][^[:space:]@]+$'
     and telefono_registro ~ '^[+0-9][0-9 ()-]{6,19}$' then
    insert into public.vitrina_registros
      (usuario_id, nombre, correo, telefono, ciudad)
    values
      (new.id, nombre_registro, correo_registro, telefono_registro, ciudad_registro)
    on conflict (usuario_id) do nothing;
  end if;
  return new;
end;
$$;

drop trigger if exists al_crear_registro_vitrina on auth.users;
create trigger al_crear_registro_vitrina
  after insert on auth.users
  for each row execute function public.guardar_registro_vitrina();

revoke execute on function public.guardar_registro_vitrina()
  from public, anon, authenticated;

create table if not exists public.vitrina_solicitudes_compra (
  id uuid primary key default gen_random_uuid(),
  articulo_id bigint references public.articulos_vitrina (id) on delete set null,
  articulo_nombre text not null,
  articulo_categoria text not null
    check (articulo_categoria in ('Muebles', 'Arte', 'Relojes', 'Decoración')),
  articulo_precio integer not null check (articulo_precio > 0),
  articulo_epoca text not null,
  usuario_id uuid references auth.users (id) on delete set null,
  comprador_nombre text not null
    check (char_length(btrim(comprador_nombre)) between 1 and 120),
  comprador_telefono text not null
    check (comprador_telefono ~ '^[+0-9][0-9 ()-]{6,19}$'),
  created_at timestamptz not null default now()
);

alter table public.vitrina_solicitudes_compra
  alter column articulo_id drop not null;
alter table public.vitrina_solicitudes_compra
  add column if not exists articulo_nombre text,
  add column if not exists articulo_categoria text,
  add column if not exists articulo_precio integer,
  add column if not exists articulo_epoca text,
  add column if not exists usuario_id uuid references auth.users (id) on delete set null;

do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public'
      and table_name = 'vitrina_solicitudes_compra'
      and column_name = 'nombre'
  ) and not exists (
    select 1 from information_schema.columns
    where table_schema = 'public'
      and table_name = 'vitrina_solicitudes_compra'
      and column_name = 'comprador_nombre'
  ) then
    alter table public.vitrina_solicitudes_compra
      rename column nombre to comprador_nombre;
  end if;
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public'
      and table_name = 'vitrina_solicitudes_compra'
      and column_name = 'telefono'
  ) and not exists (
    select 1 from information_schema.columns
    where table_schema = 'public'
      and table_name = 'vitrina_solicitudes_compra'
      and column_name = 'comprador_telefono'
  ) then
    alter table public.vitrina_solicitudes_compra
      rename column telefono to comprador_telefono;
  end if;
end;
$$;

alter table public.vitrina_solicitudes_compra
  alter column articulo_nombre set not null,
  alter column articulo_categoria set not null,
  alter column articulo_precio set not null,
  alter column articulo_epoca set not null;

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conrelid = 'public.vitrina_solicitudes_compra'::regclass
      and conname = 'vitrina_solicitudes_compra_articulo_categoria_check'
  ) then
    alter table public.vitrina_solicitudes_compra
      add constraint vitrina_solicitudes_compra_articulo_categoria_check
      check (articulo_categoria in ('Muebles', 'Arte', 'Relojes', 'Decoración'));
  end if;
  if not exists (
    select 1 from pg_constraint
    where conrelid = 'public.vitrina_solicitudes_compra'::regclass
      and conname = 'vitrina_solicitudes_compra_articulo_precio_check'
  ) then
    alter table public.vitrina_solicitudes_compra
      add constraint vitrina_solicitudes_compra_articulo_precio_check
      check (articulo_precio > 0);
  end if;
end;
$$;

alter table public.vitrina_solicitudes_compra enable row level security;
drop policy if exists vitrina_solicitudes_submit on public.vitrina_solicitudes_compra;
drop policy if exists solicitudes_compra_anon_insertar on public.vitrina_solicitudes_compra;
drop policy if exists solicitudes_compra_usuario_insertar on public.vitrina_solicitudes_compra;
drop policy if exists solicitudes_compra_leer_propio on public.vitrina_solicitudes_compra;
create policy solicitudes_compra_anon_insertar
  on public.vitrina_solicitudes_compra
  for insert to anon
  with check (usuario_id is null);
create policy solicitudes_compra_usuario_insertar
  on public.vitrina_solicitudes_compra
  for insert to authenticated
  with check (usuario_id is null or usuario_id = (select auth.uid()));
create policy solicitudes_compra_leer_propio
  on public.vitrina_solicitudes_compra
  for select to authenticated
  using (usuario_id = (select auth.uid()));
revoke update, delete on public.vitrina_solicitudes_compra from anon, authenticated;
grant insert on public.vitrina_solicitudes_compra to anon;
grant select, insert on public.vitrina_solicitudes_compra to authenticated;

comment on table public.vitrina_solicitudes_compra is
  'Solicitudes de compra enviadas desde La Vitrina.';
comment on column public.vitrina_solicitudes_compra.comprador_nombre is
  'Nombre de la persona que solicita la compra.';
comment on column public.vitrina_solicitudes_compra.articulo_nombre is
  'Nombre del artículo seleccionado, conservado como copia del formulario.';
