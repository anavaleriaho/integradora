import { useState } from 'react';
import type { ReactNode } from 'react';
import { AuthContext } from './useAuth';
import type { Usuario } from './useAuth';
import {
  usuarioEjemplo,
  correoEjemplo,
  contrasenaEjemplo,
} from '../data/usuario';

const CLAVE = 'proedu-sesion';

function leerSesion(): Usuario | null {
  try {
    return sessionStorage.getItem(CLAVE) ? usuarioEjemplo : null;
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
      try {
        sessionStorage.setItem(CLAVE, '1');
      } catch {
        // si el navegador no permite guardar, la sesión dura mientras no se recargue
      }
    }
    return correcto;
  };

  const cerrarSesion = () => {
    setUsuario(null);
    try {
      sessionStorage.removeItem(CLAVE);
    } catch {
      // sin almacenamiento disponible no hay nada que borrar
    }
  };

  return (
    <AuthContext.Provider value={{ usuario, iniciarSesion, cerrarSesion }}>
      {children}
    </AuthContext.Provider>
  );
}