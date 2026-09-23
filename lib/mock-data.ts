import type {
  Categoria,
  Jugador,
  ParejaConJugadores,
  PartidoCompleto,
  TorneoCompleto,
} from "./types";

/**
 * Datos de ejemplo, alineados a supabase/seed.sql, para poder navegar la
 * plataforma sin tener un proyecto Supabase conectado todavía.
 * Ver lib/queries/*.ts: se usan como fallback cuando isSupabaseConfigured() es false.
 */

export const mockOrganizacion = { id: "org-1", nombre: "CR&LB team" };

export const mockCategorias: Categoria[] = [
  { id: "cat-1ra", organizacion_id: "org-1", nombre: "1ra" },
  { id: "cat-5ta", organizacion_id: "org-1", nombre: "5ta" },
  { id: "cat-damas-a", organizacion_id: "org-1", nombre: "Damas A" },
];

export const mockJugadores: Jugador[] = [
  { id: "j1", organizacion_id: "org-1", nombre: "Martín", apellido: "Fernández", categoria_actual_id: "cat-1ra", pais: "AR", foto_url: null },
  { id: "j2", organizacion_id: "org-1", nombre: "Lucas", apellido: "Gómez", categoria_actual_id: "cat-1ra", pais: "AR", foto_url: null },
  { id: "j3", organizacion_id: "org-1", nombre: "Diego", apellido: "Sánchez", categoria_actual_id: "cat-1ra", pais: "ES", foto_url: null },
  { id: "j4", organizacion_id: "org-1", nombre: "Iván", apellido: "Castro", categoria_actual_id: "cat-1ra", pais: "ES", foto_url: null },
  { id: "j5", organizacion_id: "org-1", nombre: "Rodrigo", apellido: "Pérez", categoria_actual_id: "cat-1ra", pais: "AR", foto_url: null },
  { id: "j6", organizacion_id: "org-1", nombre: "Bruno", apellido: "Ibáñez", categoria_actual_id: "cat-1ra", pais: "BR", foto_url: null },
  { id: "j7", organizacion_id: "org-1", nombre: "Nicolás", apellido: "Torres", categoria_actual_id: "cat-1ra", pais: "AR", foto_url: null },
  { id: "j8", organizacion_id: "org-1", nombre: "Federico", apellido: "Molina", categoria_actual_id: "cat-1ra", pais: "AR", foto_url: null },
  { id: "j9", organizacion_id: "org-1", nombre: "Tomás", apellido: "Rey", categoria_actual_id: "cat-5ta", pais: "AR", foto_url: null },
  { id: "j10", organizacion_id: "org-1", nombre: "Agustín", apellido: "Vega", categoria_actual_id: "cat-5ta", pais: "AR", foto_url: null },
  { id: "j11", organizacion_id: "org-1", nombre: "Pablo", apellido: "Díaz", categoria_actual_id: "cat-5ta", pais: "UY", foto_url: null },
  { id: "j12", organizacion_id: "org-1", nombre: "Santiago", apellido: "Luna", categoria_actual_id: "cat-5ta", pais: "AR", foto_url: null },
];

function jugador(id: string): Jugador {
  const j = mockJugadores.find((x) => x.id === id);
  if (!j) throw new Error(`Jugador mock no encontrado: ${id}`);
  return j;
}

function pareja(
  id: string,
  torneoCategoriaId: string,
  j1: string,
  j2: string
): ParejaConJugadores {
  return {
    id,
    torneo_categoria_id: torneoCategoriaId,
    jugador1_id: j1,
    jugador2_id: j2,
    jugador1: jugador(j1),
    jugador2: jugador(j2),
  };
}

// --- Master Cup Otoño (en curso) ---

const p1 = pareja("p1", "tc-1ra", "j1", "j2");
const p2 = pareja("p2", "tc-1ra", "j3", "j4");
const p3 = pareja("p3", "tc-1ra", "j5", "j6");
const p4 = pareja("p4", "tc-1ra", "j7", "j8");
const p5 = pareja("p5", "tc-5ta", "j9", "j10");
const p6 = pareja("p6", "tc-5ta", "j11", "j12");

const ahora = Date.now();

const partidoZonaAFinalizado: PartidoCompleto = {
  id: "m1",
  torneo_categoria_id: "tc-1ra",
  fase: "zona",
  zona_id: "z-1ra-a",
  cancha: "Cancha 1",
  pareja_a_id: p1.id,
  pareja_b_id: p2.id,
  estado: "finalizado",
  hora_inicio: new Date(ahora - 2 * 60 * 60 * 1000).toISOString(),
  ganador_pareja_id: p1.id,
  duracion_minutos: 78,
  feeder_a_partido_id: null,
  feeder_b_partido_id: null,
  pareja_a: p1,
  pareja_b: p2,
  sets: [
    { id: "s1", partido_id: "m1", numero_set: 1, games_pareja_a: 6, games_pareja_b: 3 },
    { id: "s2", partido_id: "m1", numero_set: 2, games_pareja_a: 6, games_pareja_b: 4 },
  ],
};

const partidoZonaBEnCurso: PartidoCompleto = {
  id: "m2",
  torneo_categoria_id: "tc-1ra",
  fase: "zona",
  zona_id: "z-1ra-b",
  cancha: "Cancha 2",
  pareja_a_id: p3.id,
  pareja_b_id: p4.id,
  estado: "en_curso",
  hora_inicio: new Date(ahora - 35 * 60 * 1000).toISOString(),
  ganador_pareja_id: null,
  duracion_minutos: null,
  feeder_a_partido_id: null,
  feeder_b_partido_id: null,
  pareja_a: p3,
  pareja_b: p4,
  sets: [
    { id: "s3", partido_id: "m2", numero_set: 1, games_pareja_a: 6, games_pareja_b: 4 },
    { id: "s4", partido_id: "m2", numero_set: 2, games_pareja_a: 3, games_pareja_b: 2 },
  ],
};

const partido5taPendiente: PartidoCompleto = {
  id: "m3",
  torneo_categoria_id: "tc-5ta",
  fase: "zona",
  zona_id: "z-5ta-a",
  cancha: "Cancha 3",
  pareja_a_id: p5.id,
  pareja_b_id: p6.id,
  estado: "pendiente",
  hora_inicio: new Date(ahora + 60 * 60 * 1000).toISOString(),
  ganador_pareja_id: null,
  duracion_minutos: null,
  feeder_a_partido_id: null,
  feeder_b_partido_id: null,
  pareja_a: p5,
  pareja_b: p6,
  sets: [],
};

const semifinal1ra: PartidoCompleto = {
  id: "m4",
  torneo_categoria_id: "tc-1ra",
  fase: "semi",
  zona_id: null,
  cancha: "Cancha 1",
  pareja_a_id: p1.id,
  pareja_b_id: p4.id,
  estado: "pendiente",
  hora_inicio: new Date(ahora + 3 * 60 * 60 * 1000).toISOString(),
  ganador_pareja_id: null,
  duracion_minutos: null,
  feeder_a_partido_id: null,
  feeder_b_partido_id: null,
  pareja_a: p1,
  pareja_b: p4,
  sets: [],
};

const semifinal1ra2: PartidoCompleto = {
  id: "m5",
  torneo_categoria_id: "tc-1ra",
  fase: "semi",
  zona_id: null,
  cancha: "Cancha 2",
  pareja_a_id: p2.id,
  pareja_b_id: p3.id,
  estado: "pendiente",
  hora_inicio: new Date(ahora + 3 * 60 * 60 * 1000).toISOString(),
  ganador_pareja_id: null,
  duracion_minutos: null,
  feeder_a_partido_id: null,
  feeder_b_partido_id: null,
  pareja_a: p2,
  pareja_b: p3,
  sets: [],
};

const final1ra: PartidoCompleto = {
  id: "m6",
  torneo_categoria_id: "tc-1ra",
  fase: "final",
  zona_id: null,
  cancha: "Cancha 1",
  pareja_a_id: null,
  pareja_b_id: null,
  estado: "pendiente",
  hora_inicio: new Date(ahora + 5 * 60 * 60 * 1000).toISOString(),
  ganador_pareja_id: null,
  duracion_minutos: null,
  feeder_a_partido_id: "m4",
  feeder_b_partido_id: "m5",
  pareja_a: null,
  pareja_b: null,
  sets: [],
};

export const mockTorneos: TorneoCompleto[] = [
  {
    id: "t1",
    organizacion_id: "org-1",
    nombre: "Master Cup Otoño",
    sede: "CR&LB team",
    fecha_inicio: new Date(ahora - 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
    fecha_fin: new Date(ahora + 2 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
    estado: "en_curso",
    imagen_url: null,
    torneo_categorias: [
      {
        id: "tc-1ra",
        torneo_id: "t1",
        categoria_id: "cat-1ra",
        formato: "zonas_y_eliminacion",
        estado: "en_curso",
        categoria: mockCategorias[0],
        parejas: [p1, p2, p3, p4],
        zonas: [
          { id: "z-1ra-a", torneo_categoria_id: "tc-1ra", nombre: "Zona A", parejas: [p1, p2], partidos: [partidoZonaAFinalizado] },
          { id: "z-1ra-b", torneo_categoria_id: "tc-1ra", nombre: "Zona B", parejas: [p3, p4], partidos: [partidoZonaBEnCurso] },
        ],
        partidos_eliminatoria: [semifinal1ra, semifinal1ra2, final1ra],
      },
      {
        id: "tc-5ta",
        torneo_id: "t1",
        categoria_id: "cat-5ta",
        formato: "zonas_y_eliminacion",
        estado: "en_curso",
        categoria: mockCategorias[1],
        parejas: [p5, p6],
        zonas: [
          { id: "z-5ta-a", torneo_categoria_id: "tc-5ta", nombre: "Zona A", parejas: [p5, p6], partidos: [partido5taPendiente] },
        ],
        partidos_eliminatoria: [],
      },
    ],
  },
  {
    id: "t2",
    organizacion_id: "org-1",
    nombre: "Copa Primavera",
    sede: "CR&LB team",
    fecha_inicio: new Date(ahora + 20 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
    fecha_fin: new Date(ahora + 23 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
    estado: "proximo",
    imagen_url: null,
    torneo_categorias: [
      {
        id: "tc-primavera-1ra",
        torneo_id: "t2",
        categoria_id: "cat-1ra",
        formato: "zonas_y_eliminacion",
        estado: "proximo",
        categoria: mockCategorias[0],
        parejas: [],
        zonas: [],
        partidos_eliminatoria: [],
      },
    ],
  },
];

export function todosLosPartidos(): PartidoCompleto[] {
  return mockTorneos.flatMap((t) =>
    t.torneo_categorias.flatMap((tc) => [
      ...tc.zonas.flatMap((z) => z.partidos),
      ...tc.partidos_eliminatoria,
    ])
  );
}
