import type { NivelRiesgo } from '../types';
import { alumnos } from './alumnos';

export const modelo = {
  ultimoAnalisis: '20/09/2026 - 18:30',
  precision: 92,
};

// Se calcula a partir de los alumnos de la pantalla Alertas
export const conteoRiesgo: Record<NivelRiesgo, number> = {
  alto: alumnos.filter((a) => a.riesgo === 'alto').length,
  medio: alumnos.filter((a) => a.riesgo === 'medio').length,
  bajo: alumnos.filter((a) => a.riesgo === 'bajo').length,
};

// Días anteriores: datos de ejemplo (cada día suma 5 alumnos)
const diasAnteriores = [
  { dia: '14 Sep', alto: 0, medio: 1, bajo: 4 },
  { dia: '15 Sep', alto: 1, medio: 1, bajo: 3 },
  { dia: '16 Sep', alto: 0, medio: 3, bajo: 2 },
  { dia: '17 Sep', alto: 1, medio: 3, bajo: 1 },
  { dia: '18 Sep', alto: 1, medio: 1, bajo: 3 },
  { dia: '19 Sep', alto: 1, medio: 2, bajo: 2 },
];

// El último día siempre coincide con Alertas
export const evolucion = [
  ...diasAnteriores,
  { dia: '20 Sep', ...conteoRiesgo },
];

export interface Patron {
  id: number;
  tipo: NivelRiesgo;
  titulo: string;
  descripcion: string;
}

export const patrones: Patron[] = [
  {
    id: 1,
    tipo: 'alto',
    titulo: '1 alumno presenta aumento significativo en riesgo.',
    descripcion: 'Principalmente por baja asistencia y bajo promedio.',
  },
  {
    id: 2,
    tipo: 'medio',
    titulo: '2 alumnos muestran disminución en asistencia.',
    descripcion: 'Puede derivar en bajo rendimiento académico.',
  },
  {
    id: 3,
    tipo: 'bajo',
    titulo: '2 alumnos mantienen estabilidad en sus indicadores.',
    descripcion: 'No se detectan cambios relevantes.',
  },
];

export interface AnalisisRealizado {
  id: number;
  fecha: string;
  tipo: string;
  alto: number;
  medio: number;
  bajo: number;
  estado: string;
}

// Coinciden con la gráfica de evolución
export const analisisRealizados: AnalisisRealizado[] = [
  { id: 1, fecha: '20/09/2026 18:30', tipo: 'Análisis completo', ...conteoRiesgo, estado: 'Completado' },
  { id: 2, fecha: '19/09/2026 18:25', tipo: 'Análisis completo', alto: 1, medio: 2, bajo: 2, estado: 'Completado' },
  { id: 3, fecha: '18/09/2026 18:20', tipo: 'Análisis completo', alto: 1, medio: 1, bajo: 3, estado: 'Completado' },
  { id: 4, fecha: '17/09/2026 18:15', tipo: 'Análisis completo', alto: 1, medio: 3, bajo: 1, estado: 'Completado' },
];

export const configuracionModelo = [
  { campo: 'Algoritmo', valor: 'Red Neuronal (ML)' },
  {
    campo: 'Datos analizados',
    valor: 'Calificaciones, asistencias, reprobadas, entregas, semestre, historial académico',
  },
  { campo: 'Frecuencia de análisis', valor: 'Diario (18:30)' },
  { campo: 'Última actualización', valor: '20/09/2026 - 18:30' },
];