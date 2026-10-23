import type { Usuario } from '../auth/useAuth';
import type { NivelRiesgo } from '../types';
import { alumnos } from '../data/alumnos';
import { conteoRiesgo, modelo } from '../data/analisis';
import {
  totalAlumnos,
  promedioGeneral,
  asistenciaPromedio,
  totalReprobadas,
  tasaAprobacion,
} from '../data/estadisticas';

export interface AlumnoReporte {
  nombre: string;
  matricula: string;
  carrera: string;
  semestre: number;
  promedio: number;
  asistencia: number;
  reprobadas: number;
  riesgo: string;
  probabilidad: number;
}

export interface DatosReporte {
  titulo: string;
  generado: string;
  responsable: string;
  ultimoAnalisis: string;
  nombreArchivo: string;
  resumen: [string, string][];
  riesgo: [string, number, string][];
  alumnos: AlumnoReporte[];
}

/** Filtros opcionales. Vacío o undefined = sin filtrar por ese campo. */
export interface FiltrosReporte {
  carrera?: string; // nombre de la carrera
  grupo?: string;
  cuatrimestre?: string;
}

export const encabezadosAlumnos = [
  'Alumno',
  'Matrícula',
  'Carrera',
  'Cuatrimestre',
  'Promedio',
  'Asistencia (%)',
  'Materias reprobadas',
  'Nivel de riesgo',
  'Probabilidad de riesgo (%)',
];

export const aFilas = (d: DatosReporte): (string | number)[][] =>
  d.alumnos.map((a) => [
    a.nombre,
    a.matricula,
    a.carrera,
    a.semestre,
    a.promedio,
    a.asistencia,
    a.reprobadas,
    a.riesgo,
    a.probabilidad,
  ]);

const etiquetas: Record<NivelRiesgo, string> = {
  alto: 'Alto',
  medio: 'Medio',
  bajo: 'Bajo',
};

const dos = (n: number) => String(n).padStart(2, '0');

const normalizar = (s: string) => s.trim().toLowerCase();

const slug = (s: string) =>
  normalizar(s)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

const hayFiltros = (f: FiltrosReporte) =>
  Boolean(f.carrera || f.grupo || f.cuatrimestre);

function describirFiltros(f: FiltrosReporte): string {
  const partes: string[] = [];
  if (f.carrera) partes.push(f.carrera);
  if (f.grupo) partes.push(`Grupo ${f.grupo}`);
  if (f.cuatrimestre) partes.push(`${f.cuatrimestre}° cuatrimestre`);
  return partes.length ? partes.join(' · ') : 'Todos los alumnos';
}

export function construirReporte(
  usuario: Usuario | null,
  filtros: FiltrosReporte = {},
): DatosReporte {
  const ahora = new Date();
  const dia = dos(ahora.getDate());
  const mes = dos(ahora.getMonth() + 1);
  const anio = ahora.getFullYear();
  const hora = `${dos(ahora.getHours())}:${dos(ahora.getMinutes())}`;

  const niveles: NivelRiesgo[] = ['alto', 'medio', 'bajo'];
  const filtrado = hayFiltros(filtros);

  // 1. Filtrar alumnos
  const lista = alumnos.filter((a) => {
    if (filtros.carrera && normalizar(a.carrera) !== normalizar(filtros.carrera)) {
      return false;
    }
    if (filtros.cuatrimestre && Number(a.semestre) !== Number(filtros.cuatrimestre)) {
      return false;
    }
    if (filtros.grupo) {
      // Los datos estáticos pueden no tener "grupo"; si no existe, no se descarta
      const grupo = (a as { grupo?: string }).grupo;
      if (grupo !== undefined && normalizar(grupo) !== normalizar(filtros.grupo)) {
        return false;
      }
    }
    return true;
  });

  if (filtrado && lista.length === 0) {
    throw new Error('No hay alumnos con los filtros seleccionados.');
  }

  // 2. Resumen y riesgo: estáticos sin filtro, recalculados con filtro
  let resumen: [string, string][];
  let riesgo: [string, number, string][];

  if (!filtrado) {
    resumen = [
      ['Total de alumnos analizados', String(totalAlumnos)],
      ['Promedio general', promedioGeneral.toFixed(1)],
      ['Asistencia promedio', `${asistenciaPromedio}%`],
      ['Materias reprobadas', String(totalReprobadas)],
      ['Tasa de aprobación', `${tasaAprobacion}%`],
    ];
    riesgo = niveles.map((n) => [
      `Riesgo ${etiquetas[n].toLowerCase()}`,
      conteoRiesgo[n],
      `${((conteoRiesgo[n] / totalAlumnos) * 100).toFixed(1)}%`,
    ]);
  } else {
    const total = lista.length;
    const suma = (campo: 'promedio' | 'asistencia' | 'reprobadas') =>
      lista.reduce((acc, a) => acc + a[campo], 0);
    const sinReprobar = lista.filter((a) => a.reprobadas === 0).length;

    resumen = [
      ['Total de alumnos analizados', String(total)],
      ['Promedio general', (suma('promedio') / total).toFixed(1)],
      ['Asistencia promedio', `${(suma('asistencia') / total).toFixed(1)}%`],
      ['Materias reprobadas', String(suma('reprobadas'))],
      // Aquí se calcula como % de alumnos sin materias reprobadas
      ['Tasa de aprobación', `${((sinReprobar / total) * 100).toFixed(1)}%`],
    ];
    riesgo = niveles.map((n) => {
      const cantidad = lista.filter((a) => a.riesgo === n).length;
      return [
        `Riesgo ${etiquetas[n].toLowerCase()}`,
        cantidad,
        `${((cantidad / total) * 100).toFixed(1)}%`,
      ];
    });
  }

  // 3. Fila con el filtro aplicado (aparece en PDF, Excel y CSV si usan "resumen")
  resumen = [['Filtro aplicado', describirFiltros(filtros)], ...resumen];

  // 4. Nombre de archivo con el filtro
  const sufijo = [
    filtros.carrera && slug(filtros.carrera),
    filtros.grupo && `grupo-${slug(filtros.grupo)}`,
    filtros.cuatrimestre && `cuat-${filtros.cuatrimestre}`,
  ]
    .filter(Boolean)
    .join('_');

  return {
    titulo: 'Reporte de riesgo académico',
    generado: `${dia}/${mes}/${anio} ${hora}`,
    responsable: usuario ? `${usuario.nombre}, ${usuario.cargo}` : 'Sin identificar',
    ultimoAnalisis: modelo.ultimoAnalisis,
    nombreArchivo: `reporte-proedu-${anio}-${mes}-${dia}${sufijo ? `_${sufijo}` : ''}`,
    resumen,
    riesgo,
    alumnos: [...lista]
      .sort((a, b) => b.probabilidad - a.probabilidad)
      .map((a) => ({
        nombre: a.nombre,
        matricula: a.matricula,
        carrera: a.carrera,
        semestre: a.semestre,
        promedio: a.promedio,
        asistencia: a.asistencia,
        reprobadas: a.reprobadas,
        riesgo: etiquetas[a.riesgo],
        probabilidad: a.probabilidad,
      })),
  };
}