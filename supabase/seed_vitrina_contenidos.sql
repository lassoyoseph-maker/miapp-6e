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
