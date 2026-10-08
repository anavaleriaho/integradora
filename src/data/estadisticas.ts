import type { NivelRiesgo } from '../types';
import { alumnos } from './alumnos';
import { evolucion } from './analisis';

const redondear = (n: number) => Math.round(n * 10) / 10;
const promedio = (nums: number[]) =>
  nums.reduce((suma, n) => suma + n, 0) / nums.length;

// ---------- Indicadores (se calculan de los alumnos) ----------
export const totalAlumnos = alumnos.length;
export const promedioGeneral = redondear(promedio(alumnos.map((a) => a.promedio)));
export const asistenciaPromedio = Math.round(
  promedio(alumnos.map((a) => a.asistencia))
);
export const totalReprobadas = alumnos.reduce((s, a) => s + a.reprobadas, 0);

// Supuesto: cada alumno cursa 7 materias
const MATERIAS_POR_ALUMNO = 7;
export const tasaAprobacion = Math.round(
  (1 - totalReprobadas / (alumnos.length * MATERIAS_POR_ALUMNO)) * 100
);

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

// ---------- Promedio por semestre (solo semestres con alumnos) ----------
export const promedioPorSemestre = [...new Set(alumnos.map((a) => a.semestre))]
  .sort((a, b) => a - b)
  .map((s) => ({
    semestre: `${s}°`,
    promedio: redondear(
      promedio(alumnos.filter((a) => a.semestre === s).map((a) => a.promedio))
    ),
  }));

// ---------- Promedio por carrera ----------
const abreviar = (carrera: string) =>
  carrera
    .replace('Ingeniería en ', 'Ing. ')
    .replace('Ingeniería ', 'Ing. ')
    .replace('Administración de ', 'Adm. ');

export const promedioPorCarrera = [...new Set(alumnos.map((a) => a.carrera))].map(
  (c) => ({
    carrera: abreviar(c),
    promedio: redondear(
      promedio(alumnos.filter((a) => a.carrera === c).map((a) => a.promedio))
    ),
  })
);

// ---------- Datos de ejemplo ----------
// Promedian 77.6%, igual que la asistencia calculada de los alumnos
export const asistenciaSemanal = [
  { dia: 'Lun', asistencia: 80 },
  { dia: 'Mar', asistencia: 75 },
  { dia: 'Mié', asistencia: 78 },
  { dia: 'Jue', asistencia: 82 },
  { dia: 'Vie', asistencia: 80 },
  { dia: 'Sáb', asistencia: 76 },
  { dia: 'Dom', asistencia: 72 },
];

// Deben sumar lo mismo que totalReprobadas (5)
export const reprobadasPorMateria = [
  { materia: 'Matemáticas', reprobadas: 2 },
  { materia: 'Programación', reprobadas: 1 },
  { materia: 'Física', reprobadas: 1 },
  { materia: 'Inglés', reprobadas: 1 },
];