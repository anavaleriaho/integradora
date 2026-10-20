import { Navigate, Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { useAuth } from './useAuth';
import type { Usuario } from './useAuth';

interface Props {
  rol: Usuario['rol'];
}

export default function RutaProtegida({ rol }: Props) {
  const { usuario } = useAuth();

  if (!usuario) {
    return <Navigate to="/login" replace />;
  }

  // Cada quien solo entra a las pantallas de su tipo de acceso
  if (usuario.rol !== rol) {
    return (
      <Navigate
        to={usuario.rol === 'alumno' ? '/mi-semaforo' : '/panel'}
        replace
      />
    );
  }

  return (
    <div className="app">
      <Sidebar />
      <main className="contenido">
        <Outlet />
      </main>
    </div>
  );
}