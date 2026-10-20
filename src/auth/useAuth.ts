import { createContext, useContext } from 'react';

export interface Usuario {
  rol: 'personal' | 'alumno';
  nombre: string;
  cargo: string;
  correo: string;
  matricula?: string;
}

export interface AuthContextValue {
  usuario: Usuario | null;
  iniciarSesion: (correo: string, contrasena: string) => boolean;
  iniciarSesionAlumno: (matricula: string) => boolean;
  cerrarSesion: () => void;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

export function useAuth() {
  const contexto = useContext(AuthContext);
  if (!contexto) {
    throw new Error('useAuth debe usarse dentro de AuthProvider');
  }
  return contexto;
}