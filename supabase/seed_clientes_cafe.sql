insert into public.clientes_cafe (nombre, correo, telefono, ciudad, cafe_favorito, tipo_preparacion)
values
  ('Laura Gómez', 'laura.gomez@gmail.com', '3001234567', 'Pasto', 'Cappuccino', 'Espresso'),
  ('Carlos Andrés Paz', 'carlos.paz@gmail.com', '3129876543', 'Ipiales', 'Café Filtrado Especial', 'Filtrado'),
  ('Valentina Riascos', 'vale.riascos@gmail.com', '3154567890', 'Pasto', 'Cold Brew Vainilla', 'Cold Brew')
on conflict do nothing;
