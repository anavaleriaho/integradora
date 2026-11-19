import { alumnos } from './alumnos';
import type { Alumno } from '../types';

// Punto único para pedir la lista de alumnos con sus datos más recientes
// (asistencia, promedio, riesgo...).
//
// Hoy devuelve los datos de ejemplo. Cuando el backend entregue esa información,
// solo hay que cambiar el contenido de esta función por un fetch a la API
// y la pantalla de Alumnos seguirá funcionando igual.
export async function cargarAlumnos(): Promise<Alumno[]> {
  await new Promise((resolver) => setTimeout(resolver, 600));
  return alumnos.map((a) => ({ ...a }));
}