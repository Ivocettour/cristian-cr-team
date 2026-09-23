# Club Pádel del Sur — Plataforma de torneos

Plataforma web para gestión y difusión de torneos de pádel: panel admin privado
+ sitio público sin login, con resultados en vivo por cancha vía Supabase
Realtime. Ver el prompt original en `prompt-padel-tournament-app_1.md`.

## Estado actual

El sitio funciona **en modo demo** con datos de ejemplo (`lib/mock-data.ts`)
mientras no haya un proyecto Supabase conectado — podés navegar todo el sitio
público y el panel admin, pero los cambios en el admin no se guardan hasta que
conectes Supabase.

## 1. Correr en local

```bash
npm install
npm run dev
```

Abrí http://localhost:3000.

## 2. Conectar tu proyecto Supabase

1. Creá un proyecto en [supabase.com](https://supabase.com).
2. En el **SQL Editor**, corré en orden:
   - `supabase/migrations/0001_init.sql` (esquema + RLS + Realtime)
   - `supabase/seed.sql` (datos de ejemplo, opcional pero recomendado para arrancar)
3. Copiá `.env.example` a `.env.local` y completá con **Project Settings > API**:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key
   ```
4. Reiniciá `npm run dev`. La app va a usar Supabase real automáticamente
   (`lib/supabase/config.ts` detecta las variables de entorno).

### Crear el usuario admin

Supabase Auth no permite crear usuarios por SQL directo. Pasos:

1. Dashboard de Supabase → **Authentication > Users > Add user** (con email y contraseña).
2. Copiá el UUID del usuario creado.
3. En el SQL Editor:
   ```sql
   insert into usuario (id, email, rol, organizacion_id)
   values ('<uuid-del-usuario>', '<email>', 'admin', 'a0000000-0000-0000-0000-000000000001');
   ```
   (ese `organizacion_id` es el que crea `seed.sql`; si no corriste el seed, usá el id de tu propia fila en `organizacion`).
4. Entrá en `/admin/login` con ese email y contraseña.

## 3. Deploy en Vercel

1. Subí el repo a GitHub/GitLab.
2. Importá el proyecto en [vercel.com](https://vercel.com/new).
3. Configurá las mismas variables de entorno (`NEXT_PUBLIC_SUPABASE_URL`,
   `NEXT_PUBLIC_SUPABASE_ANON_KEY`) en **Project Settings > Environment Variables**.
4. Deploy. Next.js se detecta automáticamente, no hace falta configuración extra.

## Estructura del proyecto

```
app/(public)/       Sitio público: home, torneos, detalle de torneo, jugadores
app/admin/           Panel admin (protegido con Supabase Auth vía proxy.ts)
components/ui/       Componentes base (Button, Badge, Tabs, Accordion, etc.)
components/public/   Componentes del sitio público
components/admin/    Componentes del panel admin
lib/queries/         Lectura de datos (Supabase o mock-data.ts como fallback)
lib/actions/         Server Actions de escritura (solo funcionan con Supabase conectado)
lib/mock-data.ts     Datos de ejemplo para navegar sin Supabase
supabase/            Migración SQL (esquema + RLS + Realtime) y seed de ejemplo
```

## Decisiones del MVP (confirmadas)

- Una sola organización activa (el modelo ya soporta multi-club a futuro sin
  rehacer el esquema).
- Solo login de admin en esta v1; el público navega sin cuenta.
- Sin inscripción ni pagos online: los jugadores y resultados se cargan
  manualmente desde el panel admin.

## Estética

Clon de la estética de premierpadel.com/es (fondo negro, tipografía condensada
en mayúsculas, tarjetas con badge de estado), con el acento dorado del sitio
original reemplazado por **rojo** (`#7A1F1F → #E5342E`) a pedido del cliente.
