# Configuración inicial

## 1. Instalar dependencias

```bash
npm install
```

## 2. Crear proyecto en Supabase

1. Ir a [supabase.com](https://supabase.com) y crear un proyecto nuevo
2. En el panel de Supabase, ir a **SQL Editor**
3. Pegar y ejecutar el contenido de `supabase/schema.sql`

## 3. Configurar variables de entorno

Editar `.env.local` con los datos de tu proyecto Supabase:

```
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

Las claves se encuentran en: Supabase → Settings → API

## 4. Configurar autenticación en Supabase

En Supabase → Authentication → URL Configuration:
- Site URL: `http://localhost:3000` (desarrollo) o tu dominio de producción
- Redirect URLs: agregar `http://localhost:3000/**`

## 5. Ejecutar en desarrollo

```bash
npm run dev
```

Abrir [http://localhost:3000](http://localhost:3000)

## 6. Desplegar en Vercel

```bash
npx vercel
```

Configurar las mismas variables de entorno en el panel de Vercel.

## Iconos PWA

Crear dos imágenes y guardarlas en `/public/icons/`:
- `icon-192.png` (192x192 píxeles)
- `icon-512.png` (512x512 píxeles)
