do $$
declare
  v_perfil_admin uuid;
  v_centro_id uuid;
  v_inventario_agua uuid;
  v_inventario_med uuid;
begin

  select id into v_perfil_admin
  from public.perfiles
  where rol = 'administrador'
  limit 1;

  if v_perfil_admin is null then
    raise notice 'No se encontro un perfil administrador. Registrate primero en la app y luego ejecuta este SQL.';
    return;
  end if;

  update public.perfiles set rol = 'administrador' where id = v_perfil_admin;

  insert into public.centros (nombre, direccion, ciudad, estado_region, responsable_id, contacto_nombre, contacto_telefono, capacidad_maxima, personas_atendidas, estado, observaciones)
  values (
    'Centro Humanitario Norte',
    'Av. Libertador, sector El Paraiso',
    'Caracas',
    'Distrito Capital',
    v_perfil_admin,
    'Maria Lopez',
    '+58 412 555 0101',
    150,
    87,
    'activo',
    'Centro principal de distribucion de alimentos y medicamentos. Abierto de lunes a sabado.'
  ) returning id into v_centro_id;

  insert into public.inventario (centro_id, categoria, nombre_item, cantidad_disponible, cantidad_necesaria, unidad, prioridad)
  values
    (v_centro_id, 'agua', 'Agua potable embotellada', 200, 500, 'litros', 'critica'),
    (v_centro_id, 'alimentos', 'Arroz', 80, 200, 'kg', 'alta'),
    (v_centro_id, 'alimentos', 'Caraotas negras', 45, 150, 'kg', 'alta'),
    (v_centro_id, 'medicamentos', 'Paracetamol 500mg', 120, 300, 'unidades', 'alta'),
    (v_centro_id, 'higiene', 'Jabon antibacterial', 60, 100, 'unidades', 'media'),
    (v_centro_id, 'ropa', 'Ropa infantil talla 4-8', 30, 80, 'prendas', 'media')
  returning id into v_inventario_agua;

  insert into public.solicitudes_ayuda (solicitante_id, nombre_solicitante, tipo, descripcion, ciudad, direccion_referencia, urgencia, estado)
  values
    (
      v_perfil_admin,
      'Carlos Mendez',
      'agua',
      'Familia de 5 personas sin acceso a agua potable desde hace 3 dias. Hay dos ninos menores de 5 anos.',
      'Maracaibo',
      'Sector La Cana, calle 72 con av. 3H',
      'critica',
      'pendiente'
    ),
    (
      v_perfil_admin,
      'Ana Rodriguez',
      'medicamentos',
      'Necesito insulina para mi madre diabetica. No tenemos recursos para comprarla.',
      'Valencia',
      'Urb. La Trigalena, Av. Bolivar',
      'alta',
      'pendiente'
    ),
    (
      v_perfil_admin,
      'Pedro Castillo',
      'alimentos',
      'Familia desplazada de 8 personas necesita alimentos basicos.',
      'Caracas',
      'Petare, sector 5 de Julio',
      'alta',
      'en_proceso'
    );

  insert into public.alojamientos (anfitriion_id, tipo, ciudad, zona, capacidad_personas, acepta_ninos, acepta_mascotas, tiene_agua, tiene_electricidad, tiene_bano, estado, observaciones)
  values
    (
      v_perfil_admin,
      'habitacion',
      'Caracas',
      'Chacao',
      4,
      true,
      false,
      true,
      true,
      true,
      'disponible',
      'Habitacion amplia con bano propio. Ideal para familia pequena. Acceso a cocina compartida.'
    ),
    (
      v_perfil_admin,
      'casa',
      'Maracay',
      'Base Aragua',
      8,
      true,
      true,
      true,
      true,
      true,
      'disponible',
      'Casa completa disponible por 30 dias. Con patio y estacionamiento.'
    );

  insert into public.donaciones (donante_id, nombre_donante, categoria, descripcion, cantidad, unidad, centro_destino_id, estado)
  values
    (
      v_perfil_admin,
      'Solidaridad Venezuela',
      'alimentos',
      'Cajas con alimentos no perecederos: arroz, caraotas, pasta, atun enlatado',
      50,
      'cajas',
      v_centro_id,
      'en_camino'
    ),
    (
      v_perfil_admin,
      'Cruz Roja Local',
      'medicamentos',
      'Botiquin de primeros auxilios y medicamentos basicos',
      20,
      'unidades',
      v_centro_id,
      'recibido'
    );

  insert into public.voluntarios (perfil_id, disponibilidad, tiene_vehiculo, tipo_vehiculo, puede_transportar, puede_ayudar_centro, puede_cocinar, puede_asistir_medicamente, observaciones)
  values
    (
      v_perfil_admin,
      'flexible',
      true,
      'Camioneta',
      true,
      true,
      false,
      false,
      'Disponible fines de semana y algunos dias de semana. Puedo transportar hasta 8 personas o 500kg de carga.'
    );

  raise notice 'Datos demo insertados correctamente para el centro: %', v_centro_id;

end;
$$;
