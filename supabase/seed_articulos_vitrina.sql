insert into public.articulos_vitrina (nombre, categoria, precio, epoca, imagen_url)
select
  muestra.nombre,
  muestra.categoria,
  muestra.precio,
  muestra.epoca,
  muestra.imagen_url
from (
  values
    (
      'Sillón francés de terciopelo',
      'Muebles',
      1280000,
      'Años 50',
      'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=900'
    ),
    (
      'Reloj de bolsillo mecánico',
      'Relojes',
      780000,
      'Años 20',
      'https://images.unsplash.com/photo-1612817288484-6f916006741a?w=900'
    ),
    (
      'Jarrón cerámico artesanal',
      'Decoración',
      460000,
      'Años 70',
      'https://images.unsplash.com/photo-1610701596007-11502861dcfa?w=900'
    ),
    (
      'Grabado botánico enmarcado',
      'Arte',
      620000,
      'Siglo XIX',
      'https://images.unsplash.com/photo-1577083288073-40892c0860a4?w=900'
    ),
    (
      'Mesa auxiliar de nogal',
      'Muebles',
      895000,
      'Años 40',
      'https://images.unsplash.com/photo-1499933374294-4584851497cc?w=900'
    ),
    (
      'Lámpara de escritorio latón',
      'Decoración',
      375000,
      'Años 60',
      'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=900'
    ),
    (
      'Espejo ovalado con marco dorado',
      'Decoración',
      540000,
      'Principios del siglo XX',
      'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=900'
    )
) as muestra(nombre, categoria, precio, epoca, imagen_url)
where not exists (
  select 1
  from public.articulos_vitrina as existente
  where lower(existente.nombre) = lower(muestra.nombre)
);
