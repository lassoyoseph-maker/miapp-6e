do $$
begin
  if to_regclass('public.clientes_cafe') is not null then
    execute 'delete from public.clientes_cafe';
  end if;
end;
$$;
