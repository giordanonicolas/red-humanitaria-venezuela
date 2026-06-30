create or replace function public.crear_perfil_usuario()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_rol text;
  v_nombre text;
begin
  v_nombre := coalesce(new.raw_user_meta_data->>'nombre_completo', 'Usuario');
  v_rol    := coalesce(new.raw_user_meta_data->>'rol', 'voluntario');

  if v_rol not in ('administrador','responsable_centro','voluntario','donante','anfitriion') then
    v_rol := 'voluntario';
  end if;

  insert into public.perfiles (usuario_id, nombre_completo, rol)
  values (new.id, v_nombre, v_rol::public.user_role);

  return new;
exception
  when others then
    return new;
end;
$$;

alter function public.crear_perfil_usuario() owner to postgres;

grant execute on function public.crear_perfil_usuario() to supabase_auth_admin;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.crear_perfil_usuario();

drop policy if exists "perfiles_insertar_trigger" on public.perfiles;
create policy "perfiles_insertar_trigger" on public.perfiles
  for insert with check (true);
