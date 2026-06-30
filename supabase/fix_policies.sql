drop policy if exists "perfiles_admin_ver_todos" on public.perfiles;
create policy "perfiles_admin_ver_todos" on public.perfiles
  for select using (public.usuario_es_admin());

drop policy if exists "perfiles_insertar_trigger" on public.perfiles;
create policy "perfiles_insertar_trigger" on public.perfiles
  for insert with check (auth.uid() = usuario_id);

drop policy if exists "alertas_insertar_trigger" on public.alertas;
create policy "alertas_insertar_trigger" on public.alertas
  for insert with check (auth.role() = 'authenticated');

drop policy if exists "redistribucion_insertar_trigger" on public.sugerencias_redistribucion;
create policy "redistribucion_insertar_trigger" on public.sugerencias_redistribucion
  for insert with check (auth.role() = 'authenticated');

create index if not exists idx_solicitudes_estado on public.solicitudes_ayuda(estado);
create index if not exists idx_solicitudes_urgencia on public.solicitudes_ayuda(urgencia);
create index if not exists idx_voluntarios_activo on public.voluntarios(activo);
create index if not exists idx_alertas_resuelta on public.alertas(resuelta);
