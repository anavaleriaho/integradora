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

export const encabezadosAlumnos = [
  'Alumno',
  'Matrícula',
  'Carrera',
  'Semestre',
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

export function construirReporte(usuario: Usuario | null): DatosReporte {
  const ahora = new Date();
  const dia = dos(ahora.getDate());
  const mes = dos(ahora.getMonth() + 1);
  const anio = ahora.getFullYear();
  const hora = `${dos(ahora.getHours())}:${dos(ahora.getMinutes())}`;

  const niveles: NivelRiesgo[] = ['alto', 'medio', 'bajo'];

  return {
    titulo: 'Reporte de riesgo académico',
    generado: `${dia}/${mes}/${anio} ${hora}`,
    responsable: usuario ? `${usuario.nombre}, ${usuario.cargo}` : 'Sin identificar',
    ultimoAnalisis: modelo.ultimoAnalisis,
    nombreArchivo: `reporte-proedu-${anio}-${mes}-${dia}`,
    resumen: [
      ['Total de alumnos analizados', String(totalAlumnos)],
      ['Promedio general', promedioGeneral.toFixed(1)],
      ['Asistencia promedio', `${asistenciaPromedio}%`],
      ['Materias reprobadas', String(totalReprobadas)],
      ['Tasa de aprobación', `${tasaAprobacion}%`],
    ],
    riesgo: niveles.map((n) => [
      `Riesgo ${etiquetas[n].toLowerCase()}`,
      conteoRiesgo[n],
      `${((conteoRiesgo[n] / totalAlumnos) * 100).toFixed(1)}%`,
    ]),
    alumnos: [...alumnos]
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