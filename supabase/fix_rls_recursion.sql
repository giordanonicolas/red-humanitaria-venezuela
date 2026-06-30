drop policy if exists "perfiles_admin_ver_todos" on public.perfiles;

create or replace function public.usuario_es_admin()
returns boolean
language sql
security definer
stable
set search_path = ''
as $$
  select exists (
    select 1 from public.perfiles
    where usuario_id = auth.uid() and rol = 'administrador'
  )
$$;

grant execute on function public.usuario_es_admin() to authenticated;

create policy "perfiles_admin_ver_todos" on public.perfiles
  for select using (public.usuario_es_admin());
