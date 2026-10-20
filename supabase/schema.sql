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
