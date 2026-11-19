import type { Alumno, NivelRiesgo } from '../types';
import { alumnos } from './alumnos';
import { CARRERAS } from './carreras';
import { evolucion } from './analisis';
import { materiasReprobadas } from './materias';

const redondear = (n: number) => Math.round(n * 10) / 10;
const promedio = (nums: number[]) =>
  nums.length ? nums.reduce((suma, n) => suma + n, 0) / nums.length : 0;

// Compara textos sin importar mayúsculas ni acentos
const clave = (texto: string) =>
  texto
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLowerCase();

/* ───────────── Filtros ───────────── */

export interface FiltroAlumnos {
  carrera?: string; // nombre de la carrera, como aparece en los datos de los alumnos
  grupo?: string;
  cuatrimestre?: string;
}

// Ids del catálogo de carreras (mismo orden que la tabla `carreras`)
// y nombre que usan los datos de los alumnos
export const CARRERA_POR_ID: Record<string, string> = {
  '1': CARRERAS.ti,
  '2': CARRERAS.mecatronica,
  '3': CARRERAS.agricultura,
  '4': CARRERAS.negocios,
  '5': CARRERAS.logistica,
};

// Mientras los alumnos no tengan grupo en la base de datos,
// se reparten en A, B y C en orden
const GRUPOS = ['A', 'B', 'C'];
export const grupoDe = (a: Alumno) =>
  a.grupo ?? GRUPOS[(a.id - 1) % GRUPOS.length];

export function filtrarAlumnos(lista: Alumno[], f: FiltroAlumnos): Alumno[] {
  return lista.filter((a) => {
    if (f.carrera && clave(a.carrera) !== clave(f.carrera)) return false;
    if (f.grupo && clave(grupoDe(a)) !== clave(f.grupo)) return false;
    if (f.cuatrimestre && a.semestre !== Number(f.cuatrimestre)) return false;
    return true;
  });
}

/* ───────────── Cálculo de las estadísticas ───────────── */

export interface Estadisticas {
  total: number;
  promedioGeneral: number;
  asistenciaPromedio: number;
  totalReprobadas: number;
  tasaAprobacion: number;
  riesgo: Record<NivelRiesgo, number>;
  porSemestre: { semestre: string; promedio: number }[];
  porCarrera: { carrera: string; promedio: number }[];
  porGrupo: { grupo: string; promedio: number; alumnos: number }[];
  reprobadasPorMateria: { materia: string; reprobadas: number }[];
  asistenciaSemanal: { dia: string; asistencia: number }[];
}

// Supuesto: cada alumno cursa 7 materias
const MATERIAS_POR_ALUMNO = 7;

const abreviaturas: Record<string, string> = {
  [CARRERAS.ti]: 'Ing. TI',
  [CARRERAS.negocios]: 'Lic. Negocios',
  [CARRERAS.mecatronica]: 'Ing. Mecatrónica',
  [CARRERAS.logistica]: 'Ing. Logística',
  [CARRERAS.agricultura]: 'Ing. Agricultura',
};

const abreviar = (carrera: string) => abreviaturas[carrera] ?? carrera;

// Forma de la semana (datos de ejemplo). Se ajusta para que su promedio
// coincida con la asistencia de los alumnos que se están mostrando.
const semanaBase = [
  { dia: 'Lun', asistencia: 80 },
  { dia: 'Mar', asistencia: 74 },
  { dia: 'Mié', asistencia: 77 },
  { dia: 'Jue', asistencia: 80 },
  { dia: 'Vie', asistencia: 78 },
  { dia: 'Sáb', asistencia: 75 },
  { dia: 'Dom', asistencia: 74 },
];
const promedioSemanaBase = promedio(semanaBase.map((d) => d.asistencia));

export function calcularEstadisticas(lista: Alumno[]): Estadisticas {
  const total = lista.length;
  const totalReprobadas = lista.reduce((s, a) => s + a.reprobadas, 0);
  const asistenciaMedia = promedio(lista.map((a) => a.asistencia));
  const promedioDe = (grupo: Alumno[]) =>
    redondear(promedio(grupo.map((a) => a.promedio)));

  const semestres = [...new Set(lista.map((a) => a.semestre))].sort(
    (a, b) => a - b
  );
  const carreras = [...new Set(lista.map((a) => a.carrera))];
  const grupos = [...new Set(lista.map(grupoDe))].sort();

  // Materias reprobadas: salen de los mismos datos que muestra el ojito de Alumnos
  const conteoMaterias = new Map<string, number>();
  for (const a of lista) {
    for (const m of materiasReprobadas[a.id] ?? []) {
      conteoMaterias.set(m.nombre, (conteoMaterias.get(m.nombre) ?? 0) + 1);
    }
  }

  return {
    total,
    promedioGeneral: promedioDe(lista),
    asistenciaPromedio: Math.round(asistenciaMedia),
    totalReprobadas,
    tasaAprobacion: total
      ? Math.round((1 - totalReprobadas / (total * MATERIAS_POR_ALUMNO)) * 100)
      : 0,
    riesgo: {
      alto: lista.filter((a) => a.riesgo === 'alto').length,
      medio: lista.filter((a) => a.riesgo === 'medio').length,
      bajo: lista.filter((a) => a.riesgo === 'bajo').length,
    },
    porSemestre: semestres.map((s) => ({
      semestre: `${s}°`,
      promedio: promedioDe(lista.filter((a) => a.semestre === s)),
    })),
    porCarrera: carreras.map((c) => ({
      carrera: abreviar(c),
      promedio: promedioDe(lista.filter((a) => a.carrera === c)),
    })),
    porGrupo: grupos.map((g) => {
      const delGrupo = lista.filter((a) => grupoDe(a) === g);
      return {
        grupo: `Grupo ${g}`,
        promedio: promedioDe(delGrupo),
        alumnos: delGrupo.length,
      };
    }),
    reprobadasPorMateria: [...conteoMaterias]
      .map(([materia, reprobadas]) => ({ materia, reprobadas }))
      .sort((a, b) => b.reprobadas - a.reprobadas)
      .slice(0, 6),
    asistenciaSemanal: total
      ? semanaBase.map((d) => ({
          dia: d.dia,
          asistencia: Math.max(
            0,
            Math.min(
              100,
              Math.round(d.asistencia + asistenciaMedia - promedioSemanaBase)
            )
          ),
        }))
      : [],
  };
}

/* ───────────── Datos generales (sin filtros) ───────────── */

const completo = calcularEstadisticas(alumnos);

export const totalAlumnos = completo.total;
export const promedioGeneral = completo.promedioGeneral;
export const asistenciaPromedio = completo.asistenciaPromedio;
export const totalReprobadas = completo.totalReprobadas;
export const tasaAprobacion = completo.tasaAprobacion;

// Cambios respecto al periodo anterior (datos de ejemplo)
export const cambios = {
  promedio: 0.4,
  asistencia: 5,
  reprobadas: -3,
  aprobacion: 4,
};

// Cambio del riesgo: último día contra el día anterior de la gráfica de evolución
const hoy = evolucion[evolucion.length - 1];
const ayer = evolucion[evolucion.length - 2];
export const cambioRiesgo: Record<NivelRiesgo, number> = {
  alto: hoy.alto - ayer.alto,
  medio: hoy.medio - ayer.medio,
  bajo: hoy.bajo - ayer.bajo,
};

/* ───────────── Cambio contra el cuatrimestre anterior (con filtros) ───────────── */

export interface CambiosIndicadores {
  promedio: number;
  asistencia: number;
  reprobadas: number;
  aprobacion: number;
}

// Solo se puede comparar si se eligió un cuatrimestre y existen alumnos del anterior
export function cambiosContraAnterior(
  f: FiltroAlumnos
): CambiosIndicadores | null {
  const n = Number(f.cuatrimestre);
  if (!n || n <= 1) return null;

  const previo = calcularEstadisticas(
    filtrarAlumnos(alumnos, { ...f, cuatrimestre: String(n - 1) })
  );
  if (previo.total === 0) return null;

  const actual = calcularEstadisticas(filtrarAlumnos(alumnos, f));
  if (actual.total === 0) return null;

  return {
    promedio: redondear(actual.promedioGeneral - previo.promedioGeneral),
    asistencia: actual.asistenciaPromedio - previo.asistenciaPromedio,
    reprobadas: actual.totalReprobadas - previo.totalReprobadas,
    aprobacion: actual.tasaAprobacion - previo.tasaAprobacion,
  };
}