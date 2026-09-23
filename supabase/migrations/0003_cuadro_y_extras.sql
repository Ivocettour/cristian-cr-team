-- Cuadro eliminatorio con avance automático de ganadores.
-- Corré esto después de 0001_init.sql y 0002_notificaciones.sql.

-- Un partido de eliminatoria puede crearse sin parejas todavía definidas
-- ("A definir"), cuando depende del ganador de otros dos partidos.
alter table partido alter column pareja_a_id drop not null;
alter table partido alter column pareja_b_id drop not null;

-- De qué partidos salen las parejas A y B de este cruce (null si las
-- parejas se cargaron directamente, sin depender de un resultado previo).
alter table partido add column feeder_a_partido_id uuid references partido (id) on delete set null;
alter table partido add column feeder_b_partido_id uuid references partido (id) on delete set null;

create index idx_partido_feeder_a on partido (feeder_a_partido_id);
create index idx_partido_feeder_b on partido (feeder_b_partido_id);
