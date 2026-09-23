-- Cuentas de espectador: seguir torneos/jugadores + notificaciones (in-app y push).
-- Corré esto después de 0001_init.sql (SQL Editor de Supabase).

create table perfil (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  creado_at timestamptz not null default now()
);

create table seguimiento_torneo (
  usuario_id uuid not null references perfil (id) on delete cascade,
  torneo_id uuid not null references torneo (id) on delete cascade,
  creado_at timestamptz not null default now(),
  primary key (usuario_id, torneo_id)
);

create table seguimiento_jugador (
  usuario_id uuid not null references perfil (id) on delete cascade,
  jugador_id uuid not null references jugador (id) on delete cascade,
  creado_at timestamptz not null default now(),
  primary key (usuario_id, jugador_id)
);

create table suscripcion_push (
  id uuid primary key default gen_random_uuid(),
  usuario_id uuid not null references perfil (id) on delete cascade,
  endpoint text not null unique,
  p256dh text not null,
  auth text not null,
  creado_at timestamptz not null default now()
);

create table notificacion (
  id uuid primary key default gen_random_uuid(),
  usuario_id uuid not null references perfil (id) on delete cascade,
  titulo text not null,
  cuerpo text not null,
  url text,
  leida boolean not null default false,
  creado_at timestamptz not null default now()
);

create index idx_seguimiento_torneo_torneo on seguimiento_torneo (torneo_id);
create index idx_seguimiento_jugador_jugador on seguimiento_jugador (jugador_id);
create index idx_suscripcion_push_usuario on suscripcion_push (usuario_id);
create index idx_notificacion_usuario on notificacion (usuario_id, creado_at desc);

-- Crea automáticamente la fila de perfil para cualquier usuario nuevo de Auth
-- (espectador o admin, da igual: es solo su perfil público de la plataforma).
create or replace function handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into perfil (id, email) values (new.id, new.email);
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- Backfill: usuarios de Auth creados antes de esta migración (ej. el admin
-- ya existente) también necesitan su fila de perfil.
insert into perfil (id, email)
select id, email from auth.users
on conflict (id) do nothing;

alter table perfil enable row level security;
alter table seguimiento_torneo enable row level security;
alter table seguimiento_jugador enable row level security;
alter table suscripcion_push enable row level security;
alter table notificacion enable row level security;

-- Cada usuario ve y gestiona solo lo suyo. El fan-out de notificaciones entre
-- usuarios distintos lo hace el servidor con la service role key (bypassea
-- RLS a propósito) — por eso no hace falta política de escritura para otros.
create policy "perfil propio" on perfil for select using (id = auth.uid());

create policy "seguimiento_torneo propio" on seguimiento_torneo for all
  using (usuario_id = auth.uid()) with check (usuario_id = auth.uid());

create policy "seguimiento_jugador propio" on seguimiento_jugador for all
  using (usuario_id = auth.uid()) with check (usuario_id = auth.uid());

create policy "suscripcion_push propia" on suscripcion_push for all
  using (usuario_id = auth.uid()) with check (usuario_id = auth.uid());

create policy "notificacion propia lectura" on notificacion for select
  using (usuario_id = auth.uid());

create policy "notificacion propia update" on notificacion for update
  using (usuario_id = auth.uid()) with check (usuario_id = auth.uid());

alter publication supabase_realtime add table notificacion;
