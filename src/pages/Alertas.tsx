import { useState } from 'react';
import {
  Users,
  TriangleAlert,
  CircleAlert,
  CircleCheck,
  Search,
  RefreshCw,
} from 'lucide-react';
import Header from '../components/Header';
import ResumenCard from '../components/ResumenCard';
import AlumnoCard from '../components/AlumnoCard';
import { alumnos } from '../data/alumnos';
import type { NivelRiesgo } from '../types';

export default function Alertas() {
  const [busqueda, setBusqueda] = useState('');
  const [nivel, setNivel] = useState<NivelRiesgo | 'todos'>('todos');
  const [carrera, setCarrera] = useState('todas');
  const [semestre, setSemestre] = useState('todos');

  const carreras = [...new Set(alumnos.map((a) => a.carrera))];
  const semestres = [...new Set(alumnos.map((a) => a.semestre))].sort(
    (a, b) => a - b
  );

  const contar = (n: NivelRiesgo) =>
    alumnos.filter((a) => a.riesgo === n).length;

  const filtrados = alumnos
    .filter((a) => {
      const texto = busqueda.toLowerCase();
      const coincideTexto =
        a.nombre.toLowerCase().includes(texto) ||
        a.matricula.toLowerCase().includes(texto) ||
        a.carrera.toLowerCase().includes(texto);
      const coincideNivel = nivel === 'todos' || a.riesgo === nivel;
      const coincideCarrera = carrera === 'todas' || a.carrera === carrera;
      const coincideSemestre =
        semestre === 'todos' || a.semestre === Number(semestre);
      return coincideTexto && coincideNivel && coincideCarrera && coincideSemestre;
    })
    .sort((a, b) => b.probabilidad - a.probabilidad);

  const limpiarFiltros = () => {
    setBusqueda('');
    setNivel('todos');
    setCarrera('todas');
    setSemestre('todos');
  };

  return (
    <>
      <Header
        titulo="Alertas en Riesgo"
        subtitulo="Alumnos que requieren atención por su nivel de vulnerabilidad académica."
      />

      <div className="pagina">
        <section className="resumen">
          <ResumenCard
            tipo="info"
            icono={<Users size={30} />}
            numero={alumnos.length}
            titulo="Total de alumnos analizados"
            descripcion=""
          />
          <ResumenCard
            tipo="alto"
            icono={<TriangleAlert size={30} />}
            numero={contar('alto')}
            titulo="Riesgo alto"
            descripcion="Requieren atención inmediata"
          />
          <ResumenCard
            tipo="medio"
            icono={<CircleAlert size={30} />}
            numero={contar('medio')}
            titulo="Riesgo medio"
            descripcion="Seguimiento recomendado"
          />
          <ResumenCard
            tipo="bajo"
            icono={<CircleCheck size={30} />}
            numero={contar('bajo')}
            titulo="Riesgo bajo"
            descripcion="Sin riesgo significativo"
          />
        </section>

        <section className="filtros">
          <div className="buscador">
            <Search size={18} />
            <input
              type="text"
              placeholder="Buscar alumno (nombre, matrícula, carrera...)"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
          </div>

          <select
            value={nivel}
            onChange={(e) => setNivel(e.target.value as NivelRiesgo | 'todos')}
          >
            <option value="todos">Todos los niveles de riesgo</option>
            <option value="alto">Riesgo alto</option>
            <option value="medio">Riesgo medio</option>
            <option value="bajo">Riesgo bajo</option>
          </select>

          <select value={carrera} onChange={(e) => setCarrera(e.target.value)}>
            <option value="todas">Todas las carreras</option>
            {carreras.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          <select value={semestre} onChange={(e) => setSemestre(e.target.value)}>
            <option value="todos">Todos los semestres</option>
            {semestres.map((s) => (
              <option key={s} value={s}>
                Semestre {s}°
              </option>
            ))}
          </select>

          <button className="btn-limpiar" onClick={limpiarFiltros}>
            <RefreshCw size={16} /> Limpiar filtros
          </button>
        </section>

        <section className="lista">
          {filtrados.length === 0 ? (
            <p className="sin-resultados">No se encontraron alumnos.</p>
          ) : (
            filtrados.map((alumno) => (
              <AlumnoCard key={alumno.id} alumno={alumno} />
            ))
          )}
        </section>
      </div>
    </>
  );
}