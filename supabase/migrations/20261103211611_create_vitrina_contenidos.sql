create table if not exists public.vitrina_contenidos (
  codigo text primary key check (char_length(btrim(codigo)) > 0),
  titulo text not null check (char_length(btrim(titulo)) > 0),
  descripcion text not null check (char_length(btrim(descripcion)) > 0),
  detalle text not null check (char_length(btrim(detalle)) > 0)
);

alter table public.vitrina_contenidos enable row level security;
drop policy if exists vitrina_contenidos_lectura_publica
  on public.vitrina_contenidos;
create policy vitrina_contenidos_lectura_publica
  on public.vitrina_contenidos
  for select
  to anon, authenticated
  using (true);

revoke all on table public.vitrina_contenidos from anon, authenticated;
grant select on table public.vitrina_contenidos to anon, authenticated;

comment on table public.vitrina_contenidos is
  'Contenido público de categorías y colecciones de La Vitrina.';
comment on column public.vitrina_contenidos.codigo is
  'Código único del contenido.';
comment on column public.vitrina_contenidos.titulo is
  'Título visible de la categoría o colección.';
comment on column public.vitrina_contenidos.descripcion is
  'Descripción breve del contenido.';
comment on column public.vitrina_contenidos.detalle is
  'Información ampliada de la categoría o colección.';

insert into public.vitrina_contenidos (codigo, titulo, descripcion, detalle)
values
  (
    'ANT-001',
    'Relojes de colección',
    'Piezas mecánicas que reúnen precisión, historia y diseño.',
    'Explora relojes de bolsillo y de sobremesa elaborados entre los siglos XIX y XX.'
  ),
  (
    'ANT-002',
    'Mobiliario clásico',
    'Muebles antiguos restaurados con cuidado y materiales tradicionales.',
    'La colección incluye sillas, cómodas y mesas con acabados y herrajes de época.'
  ),
  (
    'ANT-003',
    'Arte y pintura',
    'Obras decorativas y piezas artísticas de distintas épocas.',
    'Cada obra reúne la información disponible sobre su técnica, procedencia y conservación.'
  ),
  (
    'ANT-004',
    'Porcelana decorativa',
    'Objetos de porcelana y cerámica seleccionados por su valor estético e histórico.',
    'Encuentra jarrones, vajillas y figuras ornamentales con detalles artesanales.'
  )
on conflict (codigo) do nothing;
