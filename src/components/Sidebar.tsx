import { NavLink } from 'react-router-dom';
import {
  House,
  Bell,
  Brain,
  Users,
  ChartColumn,
  FileText,
  Settings,
  GraduationCap,
} from 'lucide-react';
import { useAuth } from '../auth/useAuth';

const menu = [
  { nombre: 'Panel General', icono: House, ruta: '/panel' },
  { nombre: 'Alertas', icono: Bell, ruta: '/alertas' },
  { nombre: 'Análisis IA', icono: Brain, ruta: '/analisis' },
  { nombre: 'Alumnos', icono: Users, ruta: '/alumnos' },
  { nombre: 'Estadísticas', icono: ChartColumn, ruta: '/estadisticas' },
  { nombre: 'Reportes', icono: FileText, ruta: '/reportes' },
];

export default function Sidebar() {
  const { usuario } = useAuth();
  const nombre = usuario?.nombre ?? '';
  const cargo = usuario?.cargo ?? '';

  return (
    <aside className="sidebar">
      <div className="logo">
        <div className="logo-icono">
          <GraduationCap size={26} />
        </div>
        <span>ProEdu</span>
      </div>

      <nav className="menu">
        {menu.map((item) => {
          const Icono = item.icono;
          return (
            <NavLink
              key={item.nombre}
              to={item.ruta}
              className={({ isActive }) =>
                `menu-item ${isActive ? 'activo' : ''}`
              }
            >
              <Icono size={20} />
              {item.nombre}
            </NavLink>
          );
        })}

        <div className="menu-separador" />

        <NavLink
          to="/configuracion"
          className={({ isActive }) => `menu-item ${isActive ? 'activo' : ''}`}
        >
          <Settings size={20} />
          Configuración
        </NavLink>
      </nav>

      <div className="usuario">
        <div className="usuario-avatar">
          {nombre.slice(0, 2).toUpperCase()}
        </div>
        <div className="usuario-info">
          <strong>{nombre}</strong>
          <span>{cargo}</span>
        </div>
      </div>
    </aside>
  );
}