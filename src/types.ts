export type NivelRiesgo = 'alto' | 'medio' | 'bajo';

export interface Alumno {
  id: number;
  nombre: string;
  matricula: string;
  carrera: string;
  semestre: number;
  riesgo: NivelRiesgo;
  probabilidad: number;
  factores: string[];
  asistencia: number;
  promedio: number;
  reprobadas: number;
}