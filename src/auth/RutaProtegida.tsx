import { Navigate, Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { useAuth } from './useAuth';

export default function RutaProtegida() {
  const { usuario } = useAuth();

  if (!usuario) {
    return <Navigate to="/login" replace />;
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