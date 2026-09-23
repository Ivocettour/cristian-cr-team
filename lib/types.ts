export type EstadoTorneo = "proximo" | "en_curso" | "finalizado";
export type EstadoPartido = "pendiente" | "en_curso" | "finalizado";
export type FasePartido = "zona" | "octavos" | "cuartos" | "semi" | "final";

export interface Organizacion {
  id: string;
  nombre: string;
}

export interface Notificacion {
  id: string;
  usuario_id: string;
  titulo: string;
  cuerpo: string;
  url: string | null;
  leida: boolean;
  creado_at: string;
}

export interface Categoria {
  id: string;
  organizacion_id: string;
  nombre: string;
}

export interface Jugador {
  id: string;
  organizacion_id: string;
  nombre: string;
  apellido: string;
  categoria_actual_id: string | null;
  pais: string | null;
  foto_url: string | null;
}

export interface Torneo {
  id: string;
  organizacion_id: string;
  nombre: string;
  sede: string;
  fecha_inicio: string;
  fecha_fin: string;
  estado: EstadoTorneo;
  imagen_url: string | null;
}

export interface TorneoCategoria {
  id: string;
  torneo_id: string;
  categoria_id: string;
  formato: "zonas_y_eliminacion";
  estado: EstadoTorneo;
}

export interface Pareja {
  id: string;
  torneo_categoria_id: string;
  jugador1_id: string;
  jugador2_id: string;
}

export interface Zona {
  id: string;
  torneo_categoria_id: string;
  nombre: string;
}

export interface ZonaPareja {
  zona_id: string;
  pareja_id: string;
}

export interface SetScore {
  id: string;
  partido_id: string;
  numero_set: number;
  games_pareja_a: number;
  games_pareja_b: number;
}

export interface Partido {
  id: string;
  torneo_categoria_id: string;
  fase: FasePartido;
  zona_id: string | null;
  cancha: string;
  // null cuando el cruce todavía depende del ganador de otro partido
  // (ver feeder_a_partido_id / feeder_b_partido_id) — "A definir".
  pareja_a_id: string | null;
  pareja_b_id: string | null;
  estado: EstadoPartido;
  hora_inicio: string;
  ganador_pareja_id: string | null;
  duracion_minutos: number | null;
  feeder_a_partido_id: string | null;
  feeder_b_partido_id: string | null;
}

// Tipos "enriquecidos" usados en la UI, con las relaciones ya resueltas.

export interface ParejaConJugadores extends Pareja {
  jugador1: Jugador;
  jugador2: Jugador;
}

export interface PartidoCompleto extends Partido {
  pareja_a: ParejaConJugadores | null;
  pareja_b: ParejaConJugadores | null;
  sets: SetScore[];
}

export interface ZonaConTabla extends Zona {
  parejas: ParejaConJugadores[];
  partidos: PartidoCompleto[];
}

export interface TorneoCategoriaCompleto extends TorneoCategoria {
  categoria: Categoria;
  zonas: ZonaConTabla[];
  partidos_eliminatoria: PartidoCompleto[];
  parejas: ParejaConJugadores[];
}

export interface TorneoCompleto extends Torneo {
  torneo_categorias: TorneoCategoriaCompleto[];
}
