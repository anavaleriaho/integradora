import { NavLink } from 'react-router-dom';
import {
  House,
  Bell,
  Brain,
  Users,
  ChartColumn,
  FileText,
  Gauge,
  Settings,
  GraduationCap,
} from 'lucide-react';
import { useAuth } from '../auth/useAuth';

const menuPersonal = [
  { nombre: 'Panel General', icono: House, ruta: '/panel' },
  { nombre: 'Alertas', icono: Bell, ruta: '/alertas' },
  { nombre: 'Análisis IA', icono: Brain, ruta: '/analisis' },
  { nombre: 'Alumnos', icono: Users, ruta: '/alumnos' },
  { nombre: 'Estadísticas', icono: ChartColumn, ruta: '/estadisticas' },
  { nombre: 'Reportes', icono: FileText, ruta: '/reportes' },
];

const menuAlumno = [{ nombre: 'Mi semáforo', icono: Gauge, ruta: '/mi-semaforo' }];

export default function Sidebar() {
  const { usuario } = useAuth();
  const esAlumno = usuario?.rol === 'alumno';
  const menu = esAlumno ? menuAlumno : menuPersonal;
  const rutaConfiguracion = esAlumno ? '/mi-configuracion' : '/configuracion';

  const nombre = usuario?.nombre ?? '';
  const cargo = usuario?.cargo ?? '';
  const iniciales = nombre
    .split(' ')
    .slice(0, 2)
    .map((palabra) => palabra[0])
    .join('')
    .toUpperCase();

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

        <div className={`menu-separador ${esAlumno ? 'menu-abajo' : ''}`} />

        <NavLink
          to={rutaConfiguracion}
          className={({ isActive }) => `menu-item ${isActive ? 'activo' : ''}`}
        >
          <Settings size={20} />
          Configuración
        </NavLink>
      </nav>

      <div className="usuario">
        <div className="usuario-avatar">{iniciales}</div>
        <div className="usuario-info">
          <strong>{nombre}</strong>
          <span>{cargo}</span>
        </div>
      </div>
    </aside>
  );
}