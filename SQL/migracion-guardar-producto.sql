-- Ejecuta este script completo en Supabase → SQL Editor
-- Corrige: guardar productos desde el modal (permisos + columnas + categoría accesorio)

-- Columna emoji (si no existe en tu tabla)
alter table public.productos
  add column if not exists emoji text not null default '';

-- Permitir categoría accesorio
alter table public.productos drop constraint if exists productos_categoria_check;
alter table public.productos add constraint productos_categoria_check
  check (categoria in ('consola', 'juego', 'accesorio'));

-- Permiso de lectura e inserción para la app
grant usage on schema public to anon, authenticated;
grant select, insert on table public.productos to anon, authenticated;

-- Políticas RLS
drop policy if exists "productos_select_publico" on public.productos;
create policy "productos_select_publico"
  on public.productos
  for select
  to anon, authenticated
  using (true);

drop policy if exists "productos_insert_publico" on public.productos;
create policy "productos_insert_publico"
  on public.productos
  for insert
  to anon, authenticated
  with check (true);

drop policy if exists "productos_delete_publico" on public.productos;
create policy "productos_delete_publico"
  on public.productos
  for delete
  to anon, authenticated
  using (true);

grant delete on table public.productos to anon, authenticated;
