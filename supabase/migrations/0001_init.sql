-- Esquema inicial: plataforma de torneos de pádel
-- Corré esto en el SQL Editor de Supabase (o con `supabase db push`).

create extension if not exists "pgcrypto";

create type estado_torneo as enum ('proximo', 'en_curso', 'finalizado');
create type estado_partido as enum ('pendiente', 'en_curso', 'finalizado');
create type fase_partido as enum ('zona', 'octavos', 'cuartos', 'semi', 'final');

create table organizacion (
  id uuid primary key default gen_random_uuid(),
  nombre text not null
);

-- Extiende auth.users: cada admin pertenece a una organización.
create table usuario (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  rol text not null default 'admin' check (rol = 'admin'),
  organizacion_id uuid not null references organizacion (id) on delete cascade
);

create table categoria (
  id uuid primary key default gen_random_uuid(),
  organizacion_id uuid not null references organizacion (id) on delete cascade,
  nombre text not null
);

create table jugador (
  id uuid primary key default gen_random_uuid(),
  organizacion_id uuid not null references organizacion (id) on delete cascade,
  nombre text not null,
  apellido text not null,
  categoria_actual_id uuid references categoria (id) on delete set null,
  pais text,
  foto_url text
);

create table torneo (
  id uuid primary key default gen_random_uuid(),
  organizacion_id uuid not null references organizacion (id) on delete cascade,
  nombre text not null,
  sede text not null,
  fecha_inicio date not null,
  fecha_fin date not null,
  estado estado_torneo not null default 'proximo',
  imagen_url text
);

create table torneo_categoria (
  id uuid primary key default gen_random_uuid(),
  torneo_id uuid not null references torneo (id) on delete cascade,
  categoria_id uuid not null references categoria (id) on delete cascade,
  formato text not null default 'zonas_y_eliminacion' check (formato = 'zonas_y_eliminacion'),
  estado estado_torneo not null default 'proximo',
  unique (torneo_id, categoria_id)
);

create table pareja (
  id uuid primary key default gen_random_uuid(),
  torneo_categoria_id uuid not null references torneo_categoria (id) on delete cascade,
  jugador1_id uuid not null references jugador (id) on delete restrict,
  jugador2_id uuid not null references jugador (id) on delete restrict,
  check (jugador1_id <> jugador2_id)
);

create table zona (
  id uuid primary key default gen_random_uuid(),
  torneo_categoria_id uuid not null references torneo_categoria (id) on delete cascade,
  nombre text not null
);

create table zona_pareja (
  zona_id uuid not null references zona (id) on delete cascade,
  pareja_id uuid not null references pareja (id) on delete cascade,
  primary key (zona_id, pareja_id)
);

create table partido (
  id uuid primary key default gen_random_uuid(),
  torneo_categoria_id uuid not null references torneo_categoria (id) on delete cascade,
  fase fase_partido not null,
  zona_id uuid references zona (id) on delete set null,
  cancha text not null,
  pareja_a_id uuid not null references pareja (id) on delete restrict,
  pareja_b_id uuid not null references pareja (id) on delete restrict,
  estado estado_partido not null default 'pendiente',
  hora_inicio timestamptz not null,
  ganador_pareja_id uuid references pareja (id) on delete set null,
  duracion_minutos int
);

create table set_resultado (
  id uuid primary key default gen_random_uuid(),
  partido_id uuid not null references partido (id) on delete cascade,
  numero_set int not null,
  games_pareja_a int not null default 0,
  games_pareja_b int not null default 0,
  unique (partido_id, numero_set)
);

create index idx_categoria_org on categoria (organizacion_id);
create index idx_jugador_org on jugador (organizacion_id);
create index idx_jugador_categoria on jugador (categoria_actual_id);
create index idx_torneo_org on torneo (organizacion_id);
create index idx_torneo_categoria_torneo on torneo_categoria (torneo_id);
create index idx_pareja_torneo_categoria on pareja (torneo_categoria_id);
create index idx_zona_torneo_categoria on zona (torneo_categoria_id);
create index idx_partido_torneo_categoria on partido (torneo_categoria_id);
create index idx_partido_zona on partido (zona_id);
create index idx_set_partido on set_resultado (partido_id);

-- Helper: ¿el usuario autenticado es admin de esta organización?
create or replace function es_admin_de(org_id uuid)
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1 from usuario
    where usuario.id = auth.uid()
      and usuario.organizacion_id = org_id
  );
$$;

alter table organizacion enable row level security;
alter table usuario enable row level security;
alter table categoria enable row level security;
alter table jugador enable row level security;
alter table torneo enable row level security;
alter table torneo_categoria enable row level security;
alter table pareja enable row level security;
alter table zona enable row level security;
alter table zona_pareja enable row level security;
alter table partido enable row level security;
alter table set_resultado enable row level security;

-- Lectura pública de todo el contenido deportivo (sin login).
create policy "lectura publica organizacion" on organizacion for select using (true);
create policy "lectura publica categoria" on categoria for select using (true);
create policy "lectura publica jugador" on jugador for select using (true);
create policy "lectura publica torneo" on torneo for select using (true);
create policy "lectura publica torneo_categoria" on torneo_categoria for select using (true);
create policy "lectura publica pareja" on pareja for select using (true);
create policy "lectura publica zona" on zona for select using (true);
create policy "lectura publica zona_pareja" on zona_pareja for select using (true);
create policy "lectura publica partido" on partido for select using (true);
create policy "lectura publica set_resultado" on set_resultado for select using (true);

-- Un usuario puede ver su propia fila.
create policy "usuario ve su fila" on usuario for select using (id = auth.uid());

-- Escritura solo para el admin de la organización dueña del dato.
create policy "admin escribe categoria" on categoria for all
  using (es_admin_de(organizacion_id)) with check (es_admin_de(organizacion_id));

create policy "admin escribe jugador" on jugador for all
  using (es_admin_de(organizacion_id)) with check (es_admin_de(organizacion_id));

create policy "admin escribe torneo" on torneo for all
  using (es_admin_de(organizacion_id)) with check (es_admin_de(organizacion_id));

create policy "admin escribe torneo_categoria" on torneo_categoria for all
  using (es_admin_de((select organizacion_id from torneo where torneo.id = torneo_id)))
  with check (es_admin_de((select organizacion_id from torneo where torneo.id = torneo_id)));

create policy "admin escribe pareja" on pareja for all
  using (es_admin_de((select organizacion_id from torneo t join torneo_categoria tc on tc.torneo_id = t.id where tc.id = torneo_categoria_id)))
  with check (es_admin_de((select organizacion_id from torneo t join torneo_categoria tc on tc.torneo_id = t.id where tc.id = torneo_categoria_id)));

create policy "admin escribe zona" on zona for all
  using (es_admin_de((select organizacion_id from torneo t join torneo_categoria tc on tc.torneo_id = t.id where tc.id = torneo_categoria_id)))
  with check (es_admin_de((select organizacion_id from torneo t join torneo_categoria tc on tc.torneo_id = t.id where tc.id = torneo_categoria_id)));

create policy "admin escribe zona_pareja" on zona_pareja for all
  using (es_admin_de((select organizacion_id from torneo t join torneo_categoria tc on tc.torneo_id = t.id join zona z on z.torneo_categoria_id = tc.id where z.id = zona_id)))
  with check (es_admin_de((select organizacion_id from torneo t join torneo_categoria tc on tc.torneo_id = t.id join zona z on z.torneo_categoria_id = tc.id where z.id = zona_id)));

create policy "admin escribe partido" on partido for all
  using (es_admin_de((select organizacion_id from torneo t join torneo_categoria tc on tc.torneo_id = t.id where tc.id = torneo_categoria_id)))
  with check (es_admin_de((select organizacion_id from torneo t join torneo_categoria tc on tc.torneo_id = t.id where tc.id = torneo_categoria_id)));

create policy "admin escribe set_resultado" on set_resultado for all
  using (es_admin_de((select organizacion_id from torneo t join torneo_categoria tc on tc.torneo_id = t.id join partido p on p.torneo_categoria_id = tc.id where p.id = partido_id)))
  with check (es_admin_de((select organizacion_id from torneo t join torneo_categoria tc on tc.torneo_id = t.id join partido p on p.torneo_categoria_id = tc.id where p.id = partido_id)));

-- Habilitar Realtime para que la vista pública se actualice sola.
alter publication supabase_realtime add table partido;
alter publication supabase_realtime add table set_resultado;
