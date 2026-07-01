# Deploy a Vercel — Red Humanitaria

## 1. Antes de deployar: ejecutar SQL en Supabase

### fix_policies.sql (obligatorio)
1. Ir a supabase.com → tu proyecto → SQL Editor
2. Pegar y ejecutar el contenido de `supabase/fix_policies.sql`
3. Verificar que dice "Success"

### add_ubicacion_url.sql (si no se ejecutó antes)
1. SQL Editor → pegar y ejecutar `supabase/add_ubicacion_url.sql`

---

## 2. Crear usuario administrador demo

1. Ir a la app (en local o en Vercel una vez desplegada)
2. Registrarse con:
   - Email: demo@redhumanitaria.org
   - Nombre: Coordinador Demo
   - Rol: Administrador
   - Contraseña: (elegir una segura)

3. Luego en Supabase SQL Editor, ejecutar `supabase/seed_demo.sql`
   - Esto agrega: 1 centro, 6 items de inventario, 3 solicitudes, 2 alojamientos, 2 donaciones, 1 voluntario

---

## 3. Deploy en Vercel

El proyecto usa deploy automático vía GitHub. Cada push a `main` dispara un nuevo deploy en Vercel.

**URL de producción:** https://red-humanitaria-venezuela-nine.vercel.app

Para deployar manualmente (si es necesario):
1. Ir a vercel.com → Red Humanitaria Venezuela → Deployments
2. Hacer click en "Redeploy" sobre el último commit

---

## 4. Variables de entorno en Vercel

Ya configuradas en el panel Vercel → Settings → Environment Variables:

| Variable | Tipo | Entornos |
|---|---|---|
| NEXT_PUBLIC_SUPABASE_URL | plain | production, preview, development |
| NEXT_PUBLIC_SUPABASE_ANON_KEY | encrypted | production, preview, development |
| SUPABASE_SERVICE_ROLE_KEY | sensitive | production solamente |

---

## 5. Supabase Auth — URL Configuration

Ir a Supabase → Authentication → URL Configuration y configurar:

**Site URL:**
```
https://red-humanitaria-venezuela-nine.vercel.app
```

**Redirect URLs (agregar estas dos):**
```
https://red-humanitaria-venezuela-nine.vercel.app/auth/callback
http://localhost:3000/auth/callback
```

Sin esto, el login por email no va a funcionar en producción.

---

## 6. Verificar el deploy

1. Abrir https://red-humanitaria-venezuela-nine.vercel.app
2. Verificar que carga la pantalla de login
3. Iniciar sesión con el usuario demo
4. Verificar que el dashboard muestra datos
5. Probar en celular (Chrome mobile)

---

## 7. Compartir con la coordinadora

Enviarle:
- URL de la app: https://red-humanitaria-venezuela-nine.vercel.app
- Email: demo@redhumanitaria.org
- La contraseña que elegiste

Aclarar que es una demo de prueba.

---

## Archivos SQL pendientes de ejecutar en Supabase (en orden)

1. `supabase/fix_policies.sql` — corrige políticas RLS (obligatorio)
2. `supabase/add_ubicacion_url.sql` — agrega columnas de geolocalización
3. `supabase/seed_demo.sql` — datos de demostración (después de crear el usuario)
