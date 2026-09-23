# Contexto del proyecto — CR&LB team (plataforma de torneos de pádel)

> Este archivo es para retomar el trabajo en una sesión nueva sin tener que
> releer todo el historial. Está pensado para otro agente (o para vos) —
> no tiene secretos adentro, es seguro tenerlo en el repo.

## Qué es esto

Plataforma web para un club/organizador de pádel ("CR&LB team"): sitio
público sin login para ver torneos/cuadros/resultados en vivo, panel admin
para cargar todo, y cuentas de espectador opcionales para seguir
torneos/jugadores y recibir notificaciones. Nació de un prompt inicial
(`prompt-padel-tournament-app_1.md` en la raíz) y se fue construyendo por
iteraciones en una sola sesión larga de Claude Code.

- **Repo**: https://github.com/Ivocettour/cristian-cr-team
- **Stack**: Next.js 16 (App Router) + TypeScript + Tailwind v4 + Supabase
  (Postgres, Auth, Realtime). Sin backend propio, todo vía Supabase.
- **Deploy**: pensado para Vercel (no hay deploy real hecho todavía que yo sepa).
- **Setup completo / cómo correrlo**: ver [README.md](README.md) — no lo repito acá.

## Estado: dónde está la app hoy

Todo lo del prompt original + varias rondas de feedback del usuario ya están
implementadas y **probadas end-to-end contra el Supabase real del usuario**
(no solo en modo demo). En orden cronológico grueso:

1. MVP completo del prompt original: sitio público, panel admin, modelo de
   datos, estética clon de Premier Padel con acento **rojo** (no dorado,
   pedido explícito).
2. Conectado a Supabase real (URL/keys en `.env.local`, gitignoreado).
3. Rebranding: el club "Club Pádel del Sur" pasó a ser **"CR&LB team"**
   (es el organizador, no un club específico — el club puede cambiar).
4. Cuentas de espectador + seguir torneos/jugadores + notificaciones in-app
   y Web Push (sin proveedor externo, VAPID propio).
5. Se sacó la carga de resultados "en vivo" incremental (el club no va a
   puntear partido a partido) → ahora se carga el resultado final completo
   de una sola vez.
6. Se unificó "armar zonas/cuadro" y "cargar resultados" en una sola
   pantalla admin por categoría (antes eran dos páginas separadas y
   confundía).
7. El estado del torneo (Próximo/En vivo/Completado) pasó de ser un botón
   manual a calcularse solo según `fecha_inicio`/`fecha_fin`.
8. **Cuadro eliminatorio visual tipo bracket** (con líneas conectoras,
   estilo UEFA), **avance automático** del ganador al siguiente cruce,
   **editar/borrar** jugadores/parejas/torneos, y **buscador** en el header.
9. Bugs encontrados probando el punto 8 y ya arreglados: el tab "Cuadro
   eliminatorio" no tenía suscripción a Realtime (nunca se actualizaba sin
   recargar) — se agregó `EliminationBracketTab.tsx`. De paso apareció un
   bug real en `useRealtimePartidos` (el merge de un evento de Realtime
   pisaba `pareja_a_id` pero dejaba el objeto `pareja_a` resuelto viejo, o
   sea seguía mostrando "A definir" aunque el dato ya estuviera). También se
   corrigió que el cuadro mostraba el conteo de sets ganados ("2 0") en vez
   del resultado real ("6-3 7-5"). Ver "Decisiones de arquitectura" más
   abajo para el detalle técnico.
10. Botón **"Ir a inicio"** agregado al lado de "Salir" en el header del
    panel admin (antes solo había un link chico "Ver sitio público" oculto
    en mobile).
11. Documentación PDF para el cliente: `CR&LB team - Documentacion y Manual
    de Usuario.pdf` en la raíz del repo (14 páginas, en español, con índice
    navegable/marcadores) — portada, qué incluye la plataforma, cómo está
    organizada la información, manual paso a paso del sitio público, manual
    paso a paso del panel admin, preguntas frecuentes, aspectos técnicos y
    mantenimiento. Generado con reportlab (Platypus), sin capturas de
    pantalla reales (la herramienta de navegador de esta sesión no tiene
    forma de persistir un screenshot a disco, solo de mostrármelo a mí) y
    sin ningún secreto/credencial. El usuario prefirió dejarlo así en vez de
    pegar capturas manualmente. Script fuente:
    `scratchpad/build_pdf.py` (queda en el scratchpad de la sesión, no en el
    repo — si hay que regenerarlo o editar contenido en una sesión nueva,
    hay que rehacer el script, no está commiteado).

No hay tareas a medio hacer que yo sepa — todo lo de arriba quedó probado en
el navegador contra la base real, incluido el caso de dos pestañas abiertas
en simultáneo para confirmar que el Realtime del cuadro funciona de punta a
punta.

## Modelo de datos (3 migraciones, corridas en orden)

- `supabase/migrations/0001_init.sql` — esquema base: `organizacion`,
  `usuario` (admin, ligado a `auth.users`), `categoria`, `jugador`, `torneo`,
  `torneo_categoria` (subtorneo por categoría dentro de un torneo), `pareja`,
  `zona`, `zona_pareja`, `partido`, `set_resultado`. RLS: lectura pública,
  escritura solo admin de la organización (función `es_admin_de`).
- `supabase/migrations/0002_notificaciones.sql` — `perfil` (espectadores,
  autocreado por trigger en `auth.users`), `seguimiento_torneo`,
  `seguimiento_jugador`, `suscripcion_push`, `notificacion`. RLS: cada uno ve
  solo lo suyo; el fan-out entre usuarios lo hace el server con la service
  role key (bypassea RLS a propósito, ver `lib/notifications.ts`).
- `supabase/migrations/0003_cuadro_y_extras.sql` — `partido.pareja_a_id` y
  `pareja_b_id` pasan a nullable (un cruce puede existir como "A definir"),
  y se agregan `feeder_a_partido_id`/`feeder_b_partido_id` (de qué partidos
  sale cada pareja del cruce siguiente).

`seed.sql` tiene datos de ejemplo (organización "CR&LB team", torneo
"Master Cup Otoño" en curso + "Copa Primavera" próximo).

**⚠️ Gotcha real que ya pasó**: después de un `ALTER TABLE` corrido en el SQL
Editor de Supabase, el schema cache de PostgREST puede tardar en
enterarse — un `select *` puede andar bien pero un `insert`/`update` que
nombra la columna nueva explícitamente tira
`Could not find the 'x' column of 'partido' in the schema cache`. Se
arregla con `NOTIFY pgrst, 'reload schema';` en el SQL Editor, y si eso no
alcanza, **Settings → General → Restart project** (reinicio completo, tarda
1-2 min). En este proyecto la migración 0003 tuvo que correrse dos veces
porque la primera vez aparentemente no se ejecutó bien del todo.

## Decisiones de arquitectura que conviene conocer antes de tocar código

- **Una sola organización activa.** El modelo soporta multi-club (tabla
  `organizacion`) pero no hay UI para manejar más de una. No asumir que hace
  falta cambiar esto sin que lo pidan.
- **`torneo.estado` es calculado, no se guarda a mano.** Ver
  `lib/torneo-estado.ts` (`calcularEstadoTorneo`). Las queries en
  `lib/queries/tournaments.ts` pisan el `estado` que viene de la DB con el
  valor calculado antes de devolver el torneo — por eso todo el resto del
  código (`Badge`, dashboard admin, etc.) puede seguir leyendo `torneo.estado`
  como si fuera un campo normal.
- **Fechas "solo calendario" (`fecha_inicio`, `fecha_fin`, tipo `date`)**:
  usar siempre `parseFechaLocal()` de `lib/format.ts`, nunca
  `new Date(fechaString)` directo — `new Date("2026-09-21")` se interpreta
  como UTC y con `.toLocaleDateString()` sin `timeZone` puede mostrar el día
  anterior según la zona horaria del server. Ya pasó este bug una vez y se
  arregló ahí; no reintroducirlo en componentes nuevos.
- **Modo demo sin Supabase**: `lib/supabase/config.ts` (`isSupabaseConfigured`)
  decide todo. Si no hay env vars, las queries devuelven datos de
  `lib/mock-data.ts` y las Server Actions devuelven un error legible en vez
  de romper. Cualquier query/action nueva debería seguir ese patrón.
- **Admin vs espectador**: son dos cosas distintas aunque compartan
  Supabase Auth. Admin = fila en tabla `usuario` (ligada a una
  `organizacion_id`). Espectador = fila en `perfil` (se crea sola con
  cualquier signup). El middleware (`lib/supabase/middleware.ts` +
  `proxy.ts` en la raíz) protege `/admin/*` chequeando específicamente que
  haya fila en `usuario`, no solo que haya sesión — si algún día un
  espectador logueado puede "entrar" a rutas admin, revisar ahí primero.
- **Notificaciones**: dos canales — campanita in-app (tabla `notificacion` +
  Supabase Realtime, `components/public/NotificationBell.tsx`) y Web Push
  real (VAPID, sin proveedor externo — las claves están en `.env.local`,
  service worker en `public/sw.js`). El fan-out (`lib/notifications.ts`)
  corre con la service role key (`lib/supabase/admin.ts`) porque necesita
  leer seguidores/suscripciones de otros usuarios, cosa que RLS no permite
  con la key normal. El aviso de "torneo en vivo" que existía cuando el
  estado era manual **se sacó** al hacerlo automático (no hay cron para
  reemplazarlo) — si lo piden de vuelta, hay que pensar en un job
  programado, no hay gancho de acción para colgarse hoy.
- **Cuadro eliminatorio**: NO asume bracket de tamaño prolijo (potencia de
  2). Cada partido de eliminatoria puede crearse con parejas conocidas
  (como antes) o en modo "ganadoras de partidos anteriores", donde
  `feeder_a_partido_id`/`feeder_b_partido_id` apuntan a los dos partidos de
  los que sale cada pareja. `lib/actions/live.ts` (`finalizarPartido`,
  `reabrirPartido`) propaga/deshace el avance; `lib/actions/armado.ts`
  (`crearPartidoEliminatoria`) también pre-llena la pareja si el feeder ya
  estaba resuelto al momento de crear el cruce (si no, quedaba "A definir"
  para siempre aunque el partido anterior ya tuviera ganador — bug real que
  se encontró y arregló en esta misma sesión; si algún partido viejo quedó
  con ese problema, hay un `update` de reparación de una sola vez que
  reconstruye `pareja_a_id`/`pareja_b_id` desde el `ganador_pareja_id` de
  sus feeders, buscarlo en el historial de chat si hace falta reusarlo).
  `EliminationBracket.tsx` calcula la posición vertical de cada partido
  promediando la fila de sus dos feeders y dibuja las líneas con SVG — no
  asume nada de la forma del cuadro, solo sigue los links. Se actualiza en
  vivo vía `EliminationBracketTab.tsx` (mismo patrón `key={categoriaId}` +
  `useRealtimePartidos` que `LiveResultsTab.tsx`).
- **`useRealtimePartidos` resuelve parejas, no solo IDs.** Un evento de
  Postgres Realtime (`postgres_changes`) solo trae columnas crudas
  (`pareja_a_id` como UUID), nunca el join con `jugador`. El hook arma un
  mapa de todas las parejas ya conocidas (id → `ParejaConJugadores`) a
  partir de la lista actual y lo usa para resolver `pareja_a`/`pareja_b`
  cuando cambian sus `_id` — si se toca este hook, no volver a hacer un
  merge plano tipo `{...p, ...nuevo}` sin pasar por esa resolución, porque
  eso es justo el bug que ya se arregló (la pareja quedaba "A definir" para
  siempre después de un avance automático en vivo).
- **Carga de resultados**: es de una sola vez, no incremental. El admin
  completa los sets jugados + elige ganador + guarda, todo junto
  (`lib/actions/live.ts` → `finalizarPartido` recibe el array completo de
  sets). Esto fue un pedido explícito del usuario ("no van a puntear en
  vivo") — no volver a un modelo de +/- en tiempo real sin que lo pidan.
  Queda un botón chico y discreto "marcar en vivo" opcional, solo para que
  el sitio público muestre el badge EN VIVO, no carga ningún dato.

## Estructura de carpetas (lo no obvio)

```
app/(public)/            Sitio público. layout.tsx trae usuario actual +
                          notificaciones iniciales para el Header.
app/(public)/cuenta/      Login/registro/cuenta de ESPECTADOR (no admin).
app/admin/login/          Login de admin, standalone (fuera del layout
                          protegido a propósito — ver nota de gotcha abajo).
app/admin/(protected)/    Todo lo demás de admin, con el layout compartido
                          (nav, botones "Ir a inicio"/"Salir", banner de
                          "modo demo").
app/admin/(protected)/torneos/[id]/partidos/
                          La pantalla unificada: parejas, zonas (con sus
                          partidos y carga de resultado inline), cuadro
                          eliminatorio. MatchRow.tsx es el componente
                          reutilizado para cada partido (zona o eliminatoria).
lib/actions/              Server Actions (mutaciones). Todas chequean
                          isSupabaseConfigured() primero.
lib/queries/              Lecturas (Server Components). Con fallback a
                          mock-data.ts.
lib/supabase/             client.ts (browser), server.ts (RSC/actions),
                          admin.ts (service role, SOLO server-side, nunca
                          importar desde un Client Component), middleware.ts,
                          config.ts, useRealtimePartidos.ts (hook Realtime).
components/public/        UI del sitio público.
components/admin/         UI genérica del panel (FormError, SubmitButton,
                          CollapsibleForm, SupabaseBanner).
supabase/                 Migraciones + seed.sql.
public/sw.js              Service worker para Web Push.
```

**Nota sobre `app/admin/login/` vs `app/admin/(protected)/`**: están
separados a propósito en dos árboles de rutas distintos (route group
`(protected)`) para que la pantalla de login no herede el layout con nav +
botón "Salir" del panel (se veía roto para alguien no logueado). Si se
agrega una ruta admin nueva, va adentro de `(protected)/`, no directo en
`app/admin/`.

## Gotchas de este entorno de desarrollo (Windows)

- Antes de mover/renombrar carpetas con corchetes (`[id]`) con `git mv`,
  **parar el dev server** (`preview_stop`) — si no, da `Permission denied`
  por el file watcher de Next.js/Turbopack bloqueando el archivo.
- Después de mover rutas, si el build tira errores de TypeScript sobre
  módulos que ya no existen (`Cannot find module '.../page.js'`), es cache
  vieja de `.next` — `rm -rf .next` y volver a buildear.
- El símbolo `&` en JSX (usado en "CR&LB") va como texto literal o
  `&amp;`, cualquiera de las dos formas renderiza bien.

## Credenciales / acceso

- Todo lo sensible vive en `.env.local` (gitignoreado, nunca commiteado):
  `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`,
  `SUPABASE_SERVICE_ROLE_KEY`, `NEXT_PUBLIC_VAPID_PUBLIC_KEY`,
  `VAPID_PRIVATE_KEY`, `VAPID_SUBJECT`. Referencia de qué es cada una en
  `.env.example` y en el README.
- Hay un usuario admin de prueba ya creado en el Supabase real del usuario
  y vinculado a la tabla `usuario` (organización "CR&LB team"); el usuario
  (la persona) ya tiene ese email/contraseña, no hace falta volver a
  crearlo. Si una sesión nueva necesita loguearse en `/admin/login` para
  probar algo, preguntarle al usuario las credenciales en vez de asumirlas
  o inventarlas.

## Convenciones de código a seguir

- Español para nombres de variables/funciones/tablas/columnas y para todo
  el texto de la UI (es una app para un club argentino). Identificadores en
  inglés serían inconsistentes con el resto del código.
- Componentes de formulario admin siguen el patrón: `useActionState` +
  Server Action que devuelve `{ error: string | null }`, `FormError` y
  `SubmitButton` de `components/admin/` para mostrar el estado. Ver
  cualquier `New*Form.tsx` como ejemplo.
- Acciones "chiquitas" que no necesitan mostrar error en un form (toggles,
  borrar) se llaman directo como función async desde un Client Component
  con `useTransition`, sin pasar por `useActionState`. Ver `MatchRow.tsx`,
  `ZonaParejaToggle.tsx`.
- Sin comentarios explicando el "qué" del código — nombres ya lo dicen.
  Comentarios solo para el "por qué" cuando no es obvio (ver ejemplos en
  este mismo archivo, tipo el gotcha del schema cache).
- `npm run build` y `npm run lint` corridos y limpios después de cada
  cambio grande en esta sesión — mantener esa barra.

## Qué probablemente siga (no confirmado con el usuario, solo pistas)

En algún momento de la conversación el usuario preguntó "qué le falta" y de
una lista de 6 sugerencias eligió 4 (bracket visual, avance automático,
editar/borrar, buscador — todos ya hechos). Las que quedaron afuera, por si
las vuelve a pedir:
- Rol de "planillero" con acceso limitado (solo cargar resultados, sin
  poder tocar torneos/categorías/jugadores).
- Fotos de jugadores reales (el campo `foto_url` existe pero no hay upload,
  todos muestran iniciales).

No asumir que hay que construir esto — son solo pistas de contexto, no un
pedido pendiente.
