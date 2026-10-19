-- Ejecutar como postgres en SQL Editor. No deja filas: todo se revierte.
-- Usa una cuenta ya existente; no crea usuarios ni envía correos.
begin;
select set_config('request.jwt.claims', json_build_object('sub',
  (select id from auth.users order by created_at limit 1), 'role', 'authenticated')::text, true);
set local role authenticated;
insert into public.vitrina_preferencias(nombre,correo,telefono,ciudad,mueble_favorito,material_preferido)
values ('VALIDACION_RLS_20261019','prueba@example.invalid','3001234567','Pasto','Mesa','Madera');
do $$ begin
  if (select count(*) from public.vitrina_preferencias where nombre='VALIDACION_RLS_20261019') <> 1
  then raise exception 'Fallo INSERT/SELECT propio'; end if;
end $$;
select set_config('request.jwt.claims', '{"sub":"00000000-0000-4000-8000-000000000002","role":"authenticated"}', true);
do $$ begin
  if (select count(*) from public.vitrina_preferencias where nombre='VALIDACION_RLS_20261019') <> 0
  then raise exception 'Fallo aislamiento entre usuarios'; end if;
end $$;
rollback;
