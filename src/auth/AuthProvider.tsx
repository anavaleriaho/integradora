import { useState } from 'react';
import type { ReactNode } from 'react';
import { AuthContext } from './useAuth';
import type { Usuario } from './useAuth';
import {
  usuarioEjemplo,
  correoEjemplo,
  contrasenaEjemplo,
  buscarAlumno,
  usuarioDeAlumno,
} from '../data/usuario';

const CLAVE = 'proedu-sesion';

function guardar(valor: string | null) {
  try {
    if (valor) sessionStorage.setItem(CLAVE, valor);
    else sessionStorage.removeItem(CLAVE);
  } catch {
    // sin almacenamiento disponible, la sesión dura mientras no se recargue
  }
}

function leerSesion(): Usuario | null {
  try {
    const texto = sessionStorage.getItem(CLAVE);
    if (!texto) return null;

    const datos = JSON.parse(texto) as { rol?: string; matricula?: string };
    if (datos.rol === 'personal') return usuarioEjemplo;
    if (datos.rol === 'alumno' && datos.matricula) {
      const alumno = buscarAlumno(datos.matricula);
      return alumno ? usuarioDeAlumno(alumno) : null;
    }
    return null;
  } catch {
    return null;
  }
}

interface Props {
  children: ReactNode;
}

export default function AuthProvider({ children }: Props) {
  const [usuario, setUsuario] = useState<Usuario | null>(leerSesion);

  const iniciarSesion = (correo: string, contrasena: string) => {
    const correcto =
      correo.trim().toLowerCase() === correoEjemplo &&
      contrasena === contrasenaEjemplo;

    if (correcto) {
      setUsuario(usuarioEjemplo);
      guardar(JSON.stringify({ rol: 'personal' }));
    }
    return correcto;
  };

  const iniciarSesionAlumno = (matricula: string) => {
    const alumno = buscarAlumno(matricula);
    if (!alumno) return false;

    setUsuario(usuarioDeAlumno(alumno));
    guardar(JSON.stringify({ rol: 'alumno', matricula: alumno.matricula }));
    return true;
  };

  const cerrarSesion = () => {
    setUsuario(null);
    guardar(null);
  };

  return (
    <AuthContext.Provider
      value={{ usuario, iniciarSesion, iniciarSesionAlumno, cerrarSesion }}
    >
      {children}
    </AuthContext.Provider>
  );
}