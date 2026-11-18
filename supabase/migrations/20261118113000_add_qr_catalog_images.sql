alter table public.vitrina_catalogo
  add column if not exists imagen_url text;

update public.vitrina_catalogo as catalogo
set precio = datos.precio,
    imagen_url = datos.imagen_url
from (values
  ('ANT-001', 780000, 'https://images.unsplash.com/photo-1605143185672-f4f5c892dda4?auto=format&fit=crop&w=900&q=80'),
  ('ANT-002', 1280000, 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=900'),
  ('ANT-003', 620000, 'https://images.unsplash.com/photo-1577083288073-40892c0860a4?w=900'),
  ('ANT-004', 460000, 'https://images.unsplash.com/photo-1610701596007-11502861dcfa?w=900')
) as datos(codigo, precio, imagen_url)
where catalogo.codigo = datos.codigo;
