create extension if not exists "uuid-ossp";

create type public.user_role as enum (
  'administrador',
  'responsable_centro',
  'voluntario',
  'donante',
  'anfitriion'
);

create type public.estado_centro as enum (
  'activo',
  'saturado',
  'necesita_apoyo',
  'cerrado_temporalmente'
);

create type public.prioridad_item as enum ('critica', 'alta', 'media', 'baja');

create type public.categoria_inventario as enum (
  'agua',
  'alimentos',
  'medicamentos',
  'insumos_medicos',
  'ropa',
  'calzado',
  'higiene',
  'panales',
  'colchones',
  'frazadas',
  'carpas',
  'linternas',
  'baterias',
  'gas',
  'combustible',
  'herramientas',
  'otros'
);

create type public.estado_donacion as enum ('pendiente', 'en_camino', 'entregado', 'recibido');

create type public.tipo_alojamiento as enum (
  'patio',
  'habitacion',
  'casa',
  'garaje',
  'galpon',
  'espacio_comunitario',
  'otro'
);

create type public.estado_alojamiento as enum ('disponible', 'ocupado', 'no_disponible');

create type public.tipo_solicitud as enum (
  'alimentos',
  'agua',
  'medicamentos',
  'ropa',
  'transporte',
  'alojamiento',
  'rescate',
  'otro'
);

create type public.urgencia_solicitud as enum ('critica', 'alta', 'media', 'baja');

create type public.estado_solicitud as enum ('pendiente', 'en_proceso', 'resuelta', 'cancelada');

create type public.tipo_alerta as enum (
  'inventario_critico',
  'pedido_urgente',
  'alojamiento_liberado',
  'centro_saturado',
  'redistribucion_sugerida'
);

create type public.estado_redistribucion as enum ('pendiente', 'aceptada', 'rechazada', 'ejecutada');

create type public.estado_familia as enum ('buscando', 'asignada', 'alojada');

create type public.disponibilidad_voluntario as enum ('inmediata', 'fines_semana', 'entre_semana', 'flexible');

create table public.perfiles (
  id uuid primary key default uuid_generate_v4(),
  usuario_id uuid references auth.users(id) on delete cascade not null unique,
  nombre_completo text not null,
  alias text,
  telefono text,
  telefono_visible boolean not null default true,
  ciudad text,
  rol public.user_role not null default 'voluntario',
  activo boolean not null default true,
  creado_en timestamptz not null default now(),
  actualizado_en timestamptz not null default now()
);

create table public.centros (
  id uuid primary key default uuid_generate_v4(),
  nombre text not null,
  direccion text not null,
  ciudad text not null,
  estado_region text not null,
  responsable_id uuid references public.perfiles(id) on delete set null,
  contacto_nombre text not null,
  contacto_telefono text not null,
  capacidad_maxima integer not null default 0,
  personas_atendidas integer not null default 0,
  estado public.estado_centro not null default 'activo',
  observaciones text,
  latitud decimal(10, 8),
  longitud decimal(11, 8),
  ubicacion_url text,
  activo boolean not null default true,
  creado_en timestamptz not null default now(),
  actualizado_en timestamptz not null default now()
);

create table public.inventario (
  id uuid primary key default uuid_generate_v4(),
  centro_id uuid references public.centros(id) on delete cascade not null,
  categoria public.categoria_inventario not null,
  nombre_item text not null,
  cantidad_disponible decimal(10, 2) not null default 0,
  cantidad_necesaria decimal(10, 2) not null default 0,
  unidad text not null,
  prioridad public.prioridad_item not null default 'media',
  observaciones text,
  fecha_actualizacion timestamptz not null default now(),
  creado_en timestamptz not null default now()
);

create table public.donaciones (
  id uuid primary key default uuid_generate_v4(),
  donante_id uuid references public.perfiles(id) on delete set null,
  nombre_donante text not null,
  categoria public.categoria_inventario not null,
  descripcion text not null,
  cantidad decimal(10, 2) not null,
  unidad text not null,
  centro_destino_id uuid references public.centros(id) on delete set null,
  estado public.estado_donacion not null default 'pendiente',
  observaciones text,
  latitud decimal(10, 8),
  longitud decimal(11, 8),
  ubicacion_url text,
  creado_en timestamptz not null default now(),
  actualizado_en timestamptz not null default now()
);

create table public.alojamientos (
  id uuid primary key default uuid_generate_v4(),
  anfitriion_id uuid references public.perfiles(id) on delete cascade not null,
  tipo public.tipo_alojamiento not null,
  ciudad text not null,
  zona text,
  capacidad_personas integer not null default 1,
  acepta_ninos boolean not null default false,
  acepta_mascotas boolean not null default false,
  tiene_agua boolean not null default true,
  tiene_electricidad boolean not null default true,
  tiene_bano boolean not null default true,
  observaciones text,
  estado public.estado_alojamiento not null default 'disponible',
  latitud decimal(10, 8),
  longitud decimal(11, 8),
  ubicacion_url text,
  creado_en timestamptz not null default now(),
  actualizado_en timestamptz not null default now()
);

create table public.familias_alojamiento (
  id uuid primary key default uuid_generate_v4(),
  nombre_contacto text not null,
  cantidad_personas integer not null default 1,
  tiene_ninos boolean not null default false,
  tiene_mascotas boolean not null default false,
  ciudad_origen text not null,
  necesidades_especiales text,
  alojamiento_asignado_id uuid references public.alojamientos(id) on delete set null,
  estado public.estado_familia not null default 'buscando',
  creado_en timestamptz not null default now()
);

create table public.voluntarios (
  id uuid primary key default uuid_generate_v4(),
  perfil_id uuid references public.perfiles(id) on delete cascade not null unique,
  disponibilidad public.disponibilidad_voluntario not null default 'flexible',
  tiene_vehiculo boolean not null default false,
  tipo_vehiculo text,
  puede_transportar boolean not null default false,
  puede_ayudar_centro boolean not null default true,
  puede_cocinar boolean not null default false,
  puede_asistir_medicamente boolean not null default false,
  observaciones text,
  activo boolean not null default true,
  creado_en timestamptz not null default now()
);

create table public.solicitudes_ayuda (
  id uuid primary key default uuid_generate_v4(),
  solicitante_id uuid references public.perfiles(id) on delete set null,
  nombre_solicitante text not null,
  tipo public.tipo_solicitud not null,
  descripcion text not null,
  ciudad text not null,
  direccion_referencia text,
  urgencia public.urgencia_solicitud not null default 'media',
  estado public.estado_solicitud not null default 'pendiente',
  responsable_id uuid references public.perfiles(id) on delete set null,
  latitud decimal(10, 8),
  longitud decimal(11, 8),
  ubicacion_url text,
  creado_en timestamptz not null default now(),
  actualizado_en timestamptz not null default now()
);

create table public.alertas (
  id uuid primary key default uuid_generate_v4(),
  tipo public.tipo_alerta not null,
  titulo text not null,
  descripcion text not null,
  centro_id uuid references public.centros(id) on delete cascade,
  item_inventario_id uuid references public.inventario(id) on delete cascade,
  solicitud_id uuid references public.solicitudes_ayuda(id) on delete cascade,
  prioridad public.prioridad_item not null default 'alta',
  resuelta boolean not null default false,
  creado_en timestamptz not null default now()
);

create table public.sugerencias_redistribucion (
  id uuid primary key default uuid_generate_v4(),
  categoria public.categoria_inventario not null,
  nombre_item text not null,
  centro_origen_id uuid references public.centros(id) on delete cascade not null,
  centro_destino_id uuid references public.centros(id) on delete cascade not null,
  cantidad_sugerida decimal(10, 2) not null,
  unidad text not null,
  estado public.estado_redistribucion not null default 'pendiente',
  creado_en timestamptz not null default now()
);

create or replace function public.actualizar_timestamp()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  new.actualizado_en = now();
  return new;
end;
$$;

create trigger centros_actualizado_en
  before update on public.centros
  for each row execute function public.actualizar_timestamp();

create trigger donaciones_actualizado_en
  before update on public.donaciones
  for each row execute function public.actualizar_timestamp();

create trigger alojamientos_actualizado_en
  before update on public.alojamientos
  for each row execute function public.actualizar_timestamp();

create trigger solicitudes_actualizado_en
  before update on public.solicitudes_ayuda
  for each row execute function public.actualizar_timestamp();

create trigger perfiles_actualizado_en
  before update on public.perfiles
  for each row execute function public.actualizar_timestamp();

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
  v_rol := coalesce(new.raw_user_meta_data->>'rol', 'voluntario');

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

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.crear_perfil_usuario();

create or replace function public.detectar_alertas_inventario()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  if new.cantidad_necesaria > 0 and new.cantidad_disponible < (new.cantidad_necesaria * 0.2) then
    insert into public.alertas (tipo, titulo, descripcion, centro_id, item_inventario_id, prioridad)
    values (
      'inventario_critico',
      'Stock crítico: ' || new.nombre_item,
      'El centro tiene menos del 20% del stock requerido de ' || new.nombre_item || '.',
      new.centro_id,
      new.id,
      'critica'
    );
  end if;
  return new;
end;
$$;

create trigger inventario_alerta_critica
  after insert or update on public.inventario
  for each row execute function public.detectar_alertas_inventario();

create or replace function public.generar_sugerencias_redistribucion()
returns void
language plpgsql
security invoker
set search_path = ''
as $$
declare
  item_exceso record;
  item_faltante record;
begin
  for item_exceso in
    select i.id, i.categoria, i.nombre_item, i.cantidad_disponible, i.cantidad_necesaria, i.unidad, i.centro_id
    from public.inventario i
    join public.centros c on c.id = i.centro_id
    where i.cantidad_disponible > i.cantidad_necesaria * 1.5
      and c.activo = true
  loop
    for item_faltante in
      select i.id, i.categoria, i.nombre_item, i.cantidad_disponible, i.cantidad_necesaria, i.unidad, i.centro_id
      from public.inventario i
      join public.centros c on c.id = i.centro_id
      where i.categoria = item_exceso.categoria
        and i.centro_id != item_exceso.centro_id
        and i.cantidad_disponible < i.cantidad_necesaria * 0.5
        and c.activo = true
    loop
      insert into public.sugerencias_redistribucion (
        categoria, nombre_item, centro_origen_id, centro_destino_id, cantidad_sugerida, unidad
      )
      values (
        item_exceso.categoria,
        item_exceso.nombre_item,
        item_exceso.centro_id,
        item_faltante.centro_id,
        least(
          item_exceso.cantidad_disponible - item_exceso.cantidad_necesaria,
          item_faltante.cantidad_necesaria - item_faltante.cantidad_disponible
        ),
        item_exceso.unidad
      );
    end loop;
  end loop;
end;
$$;

alter table public.perfiles enable row level security;
alter table public.centros enable row level security;
alter table public.inventario enable row level security;
alter table public.donaciones enable row level security;
alter table public.alojamientos enable row level security;
alter table public.familias_alojamiento enable row level security;
alter table public.voluntarios enable row level security;
alter table public.solicitudes_ayuda enable row level security;
alter table public.alertas enable row level security;
alter table public.sugerencias_redistribucion enable row level security;

create policy "perfiles_ver_propio" on public.perfiles
  for select using (auth.uid() = usuario_id);

create policy "perfiles_actualizar_propio" on public.perfiles
  for update using (auth.uid() = usuario_id);

create policy "perfiles_insertar_trigger" on public.perfiles
  for insert with check (auth.uid() = usuario_id);

create policy "perfiles_admin_ver_todos" on public.perfiles
  for select using (public.usuario_es_admin());

create policy "centros_lectura_autenticado" on public.centros
  for select using (auth.role() = 'authenticated');

create policy "centros_escritura_gestion" on public.centros
  for insert with check (
    exists (
      select 1 from public.perfiles p
      where p.usuario_id = auth.uid()
        and p.rol in ('administrador', 'responsable_centro')
    )
  );

create policy "centros_actualizar_gestion" on public.centros
  for update using (
    exists (
      select 1 from public.perfiles p
      where p.usuario_id = auth.uid()
        and p.rol in ('administrador', 'responsable_centro')
    )
  );

create policy "centros_eliminar_admin" on public.centros
  for delete using (
    exists (
      select 1 from public.perfiles p
      where p.usuario_id = auth.uid() and p.rol = 'administrador'
    )
  );

create policy "inventario_lectura_autenticado" on public.inventario
  for select using (auth.role() = 'authenticated');

create policy "inventario_insertar_gestion" on public.inventario
  for insert with check (
    exists (
      select 1 from public.perfiles p
      where p.usuario_id = auth.uid()
        and p.rol in ('administrador', 'responsable_centro')
    )
  );

create policy "inventario_actualizar_gestion" on public.inventario
  for update using (
    exists (
      select 1 from public.perfiles p
      where p.usuario_id = auth.uid()
        and p.rol in ('administrador', 'responsable_centro')
    )
  );

create policy "inventario_eliminar_gestion" on public.inventario
  for delete using (
    exists (
      select 1 from public.perfiles p
      where p.usuario_id = auth.uid()
        and p.rol in ('administrador', 'responsable_centro')
    )
  );

create policy "donaciones_lectura_autenticado" on public.donaciones
  for select using (auth.role() = 'authenticated');

create policy "donaciones_insertar_autenticado" on public.donaciones
  for insert with check (auth.role() = 'authenticated');

create policy "donaciones_actualizar_gestion" on public.donaciones
  for update using (
    exists (
      select 1 from public.perfiles p
      where p.usuario_id = auth.uid()
        and p.rol in ('administrador', 'responsable_centro')
    )
    or donante_id in (
      select id from public.perfiles where usuario_id = auth.uid()
    )
  );

create policy "alojamientos_lectura_autenticado" on public.alojamientos
  for select using (auth.role() = 'authenticated');

create policy "alojamientos_insertar_autenticado" on public.alojamientos
  for insert with check (auth.role() = 'authenticated');

create policy "alojamientos_actualizar_propio_o_admin" on public.alojamientos
  for update using (
    anfitriion_id in (select id from public.perfiles where usuario_id = auth.uid())
    or exists (
      select 1 from public.perfiles p
      where p.usuario_id = auth.uid() and p.rol in ('administrador', 'responsable_centro')
    )
  );

create policy "familias_lectura_autenticado" on public.familias_alojamiento
  for select using (auth.role() = 'authenticated');

create policy "familias_insertar_autenticado" on public.familias_alojamiento
  for insert with check (auth.role() = 'authenticated');

create policy "familias_actualizar_gestion" on public.familias_alojamiento
  for update using (
    exists (
      select 1 from public.perfiles p
      where p.usuario_id = auth.uid()
        and p.rol in ('administrador', 'responsable_centro')
    )
  );

create policy "voluntarios_lectura_autenticado" on public.voluntarios
  for select using (auth.role() = 'authenticated');

create policy "voluntarios_insertar_autenticado" on public.voluntarios
  for insert with check (
    perfil_id in (select id from public.perfiles where usuario_id = auth.uid())
  );

create policy "voluntarios_actualizar_propio" on public.voluntarios
  for update using (
    perfil_id in (select id from public.perfiles where usuario_id = auth.uid())
    or exists (
      select 1 from public.perfiles p
      where p.usuario_id = auth.uid() and p.rol = 'administrador'
    )
  );

create policy "solicitudes_lectura_autenticado" on public.solicitudes_ayuda
  for select using (auth.role() = 'authenticated');

create policy "solicitudes_insertar_autenticado" on public.solicitudes_ayuda
  for insert with check (auth.role() = 'authenticated');

create policy "solicitudes_actualizar_gestion" on public.solicitudes_ayuda
  for update using (
    exists (
      select 1 from public.perfiles p
      where p.usuario_id = auth.uid()
        and p.rol in ('administrador', 'responsable_centro')
    )
    or solicitante_id in (
      select id from public.perfiles where usuario_id = auth.uid()
    )
  );

create policy "alertas_lectura_autenticado" on public.alertas
  for select using (auth.role() = 'authenticated');

create policy "alertas_insertar_trigger" on public.alertas
  for insert with check (auth.role() = 'authenticated');

create policy "alertas_actualizar_gestion" on public.alertas
  for update using (
    exists (
      select 1 from public.perfiles p
      where p.usuario_id = auth.uid()
        and p.rol in ('administrador', 'responsable_centro')
    )
  );

create policy "redistribucion_lectura_autenticado" on public.sugerencias_redistribucion
  for select using (auth.role() = 'authenticated');

create policy "redistribucion_insertar_trigger" on public.sugerencias_redistribucion
  for insert with check (auth.role() = 'authenticated');

create policy "redistribucion_actualizar_admin" on public.sugerencias_redistribucion
  for update using (
    exists (
      select 1 from public.perfiles p
      where p.usuario_id = auth.uid() and p.rol = 'administrador'
    )
  );

create index idx_centros_ciudad on public.centros(ciudad);
create index idx_centros_estado on public.centros(estado);
create index idx_centros_activo on public.centros(activo);
create index idx_inventario_centro on public.inventario(centro_id);
create index idx_inventario_categoria on public.inventario(categoria);
create index idx_inventario_prioridad on public.inventario(prioridad);
create index idx_donaciones_estado on public.donaciones(estado);
create index idx_donaciones_centro on public.donaciones(centro_destino_id);
create index idx_alojamientos_ciudad on public.alojamientos(ciudad);
create index idx_alojamientos_estado on public.alojamientos(estado);
create index idx_solicitudes_estado on public.solicitudes_ayuda(estado);
create index idx_solicitudes_urgencia on public.solicitudes_ayuda(urgencia);
create index idx_voluntarios_activo on public.voluntarios(activo);
create index idx_alertas_resuelta on public.alertas(resuelta);

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

grant usage on schema public to anon, authenticated, service_role;
grant all on all tables in schema public to anon, authenticated, service_role;
grant all on all sequences in schema public to anon, authenticated, service_role;
grant all on all routines in schema public to anon, authenticated, service_role;

alter default privileges in schema public
  grant all on tables to anon, authenticated, service_role;
alter default privileges in schema public
  grant all on sequences to anon, authenticated, service_role;
alter default privileges in schema public
  grant all on routines to anon, authenticated, service_role;
