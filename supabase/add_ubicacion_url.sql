ALTER TABLE public.centros ADD COLUMN IF NOT EXISTS ubicacion_url text;
ALTER TABLE public.alojamientos ADD COLUMN IF NOT EXISTS ubicacion_url text;
ALTER TABLE public.solicitudes_ayuda ADD COLUMN IF NOT EXISTS ubicacion_url text;
ALTER TABLE public.donaciones ADD COLUMN IF NOT EXISTS latitud decimal(10, 8);
ALTER TABLE public.donaciones ADD COLUMN IF NOT EXISTS longitud decimal(11, 8);
ALTER TABLE public.donaciones ADD COLUMN IF NOT EXISTS ubicacion_url text;
