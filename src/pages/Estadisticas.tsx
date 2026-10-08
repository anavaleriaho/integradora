import { Users, GraduationCap, Percent, CircleAlert } from 'lucide-react';
import Header from '../components/Header';
import TarjetaIndicador from '../components/estadisticas/TarjetaIndicador';
import RendimientoSemestre from '../components/estadisticas/RendimientoSemestre';
import RendimientoCarrera from '../components/estadisticas/RendimientoCarrera';
import AsistenciaSemanal from '../components/estadisticas/AsistenciaSemanal';
import MateriasReprobadas from '../components/estadisticas/MateriasReprobadas';
import ResumenGeneral from '../components/estadisticas/ResumenGeneral';
import UltimosAnalisis from '../components/analisis/UltimosAnalisis';
import {
  totalAlumnos,
  promedioGeneral,
  asistenciaPromedio,
  totalReprobadas,
  cambios,
} from '../data/estadisticas';
import '../styles/analisis.css';
import '../styles/estadisticas.css';

export default function Estadisticas() {
  return (
    <>
      <Header
        titulo="Estadísticas"
        subtitulo="Análisis y visualización de datos académicos para una mejor toma de decisiones."
      />

      <div className="pagina">
        <section className="es-tarjetas">
          <TarjetaIndicador
            icono={<Users size={30} />}
            titulo="Total de alumnos"
            valor={totalAlumnos}
            descripcion="registrados"
          />
          <TarjetaIndicador
            icono={<GraduationCap size={30} />}
            titulo="Promedio general"
            valor={promedioGeneral}
            cambio={`↑ ${cambios.promedio}`}
            descripcion="vs. semestre anterior"
          />
          <TarjetaIndicador
            icono={<Percent size={30} />}
            titulo="Asistencia promedio"
            valor={`${asistenciaPromedio}%`}
            cambio={`↑ ${cambios.asistencia}%`}
            descripcion="vs. semestre anterior"
          />
          <TarjetaIndicador
            tipo="alerta"
            icono={<CircleAlert size={30} />}
            titulo="Materias reprobadas"
            valor={totalReprobadas}
            cambio={`↓ ${Math.abs(cambios.reprobadas)}`}
            cambioMalo
            descripcion="vs. semestre anterior"
          />
        </section>

        <div className="es-fila">
          <RendimientoSemestre />
          <RendimientoCarrera />
        </div>

        <div className="es-fila">
          <AsistenciaSemanal />
          <MateriasReprobadas />
        </div>

        <div className="es-inferior">
          <UltimosAnalisis />
          <ResumenGeneral />
        </div>
      </div>
    </>
  );
}