import type { Usuario } from '../auth/useAuth';
import type { Alumno } from '../types';
import { alumnos } from './alumnos';

export const correoEjemplo = 'candy@proedu.com';
export const contrasenaEjemplo = 'ProEdu2026';

export const usuarioEjemplo: Usuario = {
  rol: 'personal',
  nombre: 'Candy',
  cargo: 'Trabajadora social',
  correo: correoEjemplo,
};

// Ignora guiones, espacios y mayúsculas al comparar matrículas
const limpiar = (matricula: string) =>
  matricula.replace(/[^0-9a-z]/gi, '').toLowerCase();

export function buscarAlumno(matricula: string): Alumno | undefined {
  const buscada = limpiar(matricula);
  if (!buscada) return undefined;
  return alumnos.find((a) => limpiar(a.matricula) === buscada);
}

export function usuarioDeAlumno(alumno: Alumno): Usuario {
  return {
    rol: 'alumno',
    nombre: alumno.nombre,
    cargo: 'Alumno',
    correo: '',
    matricula: alumno.matricula,
  };
}