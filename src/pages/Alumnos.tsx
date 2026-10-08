import { useState } from 'react';
import {
  Users,
  TriangleAlert,
  CircleAlert,
  CircleCheck,
  Search,
  Plus,
} from 'lucide-react';
import Header from '../components/Header';
import TarjetaResumen from '../components/alumnos/TarjetaResumen';
import TablaAlumnos from '../components/alumnos/TablaAlumnos';
import PanelFiltros from '../components/alumnos/PanelFiltros';
import type { Filtros } from '../components/alumnos/PanelFiltros';
import ResumenRapido from '../components/alumnos/ResumenRapido';
import { alumnos } from '../data/alumnos';
import type { NivelRiesgo } from '../types';
import '../styles/alumnos.css';

const POR_PAGINA = 7;

const filtrosIniciales: Filtros = {
  busqueda: '',
  niveles: { alto: true, medio: true, bajo: true },
  carrera: 'todas',
  semestre: 'todos',
};

export default function Alumnos() {
  const [filtros, setFiltros] = useState<Filtros>(filtrosIniciales);
  const [pagina, setPagina] = useState(1);

  const total = alumnos.length;
  const contar = (n: NivelRiesgo) =>
    alumnos.filter((a) => a.riesgo === n).length;
  const porcentaje = (n: NivelRiesgo) =>
    ((contar(n) / total) * 100).toFixed(1);

  const carreras = [...new Set(alumnos.map((a) => a.carrera))];
  const semestres = [...new Set(alumnos.map((a) => a.semestre))].sort(
    (a, b) => a - b
  );

  const filtrados = alumnos.filter((a) => {
    const texto = filtros.busqueda.toLowerCase();
    const coincideTexto =
      a.nombre.toLowerCase().includes(texto) ||
      a.matricula.toLowerCase().includes(texto) ||
      a.carrera.toLowerCase().includes(texto);
    const coincideCarrera =
      filtros.carrera === 'todas' || a.carrera === filtros.carrera;
    const coincideSemestre =
      filtros.semestre === 'todos' || a.semestre === Number(filtros.semestre);
    return (
      coincideTexto &&
      filtros.niveles[a.riesgo] &&
      coincideCarrera &&
      coincideSemestre
    );
  });

  const totalPaginas = Math.max(1, Math.ceil(filtrados.length / POR_PAGINA));
  const paginaActual = Math.min(pagina, totalPaginas);
  const visibles = filtrados.slice(
    (paginaActual - 1) * POR_PAGINA,
    paginaActual * POR_PAGINA
  );

  const cambiarFiltros = (cambios: Partial<Filtros>) => {
    setFiltros({ ...filtros, ...cambios });
    setPagina(1);
  };

  const limpiar = () => {
    setFiltros(filtrosIniciales);
    setPagina(1);
  };

  // El selector de la barra superior se calcula a partir de las casillas del panel
  const activos = (Object.keys(filtros.niveles) as NivelRiesgo[]).filter(
    (n) => filtros.niveles[n]
  );
  const valorNivel =
    activos.length === 3 ? 'todos' : activos.length === 1 ? activos[0] : 'varios';

  const elegirNivel = (valor: string) => {
    if (valor === 'todos') {
      cambiarFiltros({ niveles: { alto: true, medio: true, bajo: true } });
    } else if (valor === 'alto' || valor === 'medio' || valor === 'bajo') {
      cambiarFiltros({
        niveles: {
          alto: valor === 'alto',
          medio: valor === 'medio',
          bajo: valor === 'bajo',
        },
      });
    }
  };

  return (
    <>
      <Header
        titulo="Alumnos"
        subtitulo="Consulta y gestiona la información de los estudiantes."
      />

      <div className="pagina">
        <section className="al-tarjetas">
          <TarjetaResumen
            tipo="total"
            icono={<Users size={30} />}
            titulo="Total de alumnos"
            numero={total}
            descripcion="registrados"
          />
          <TarjetaResumen
            tipo="alto"
            icono={<TriangleAlert size={30} />}
            titulo="Riesgo alto"
            numero={contar('alto')}
            descripcion={`${porcentaje('alto')}% del total`}
          />
          <TarjetaResumen
            tipo="medio"
            icono={<CircleAlert size={30} />}
            titulo="Riesgo medio"
            numero={contar('medio')}
            descripcion={`${porcentaje('medio')}% del total`}
          />
          <TarjetaResumen
            tipo="bajo"
            icono={<CircleCheck size={30} />}
            titulo="Riesgo bajo"
            numero={contar('bajo')}
            descripcion={`${porcentaje('bajo')}% del total`}
          />
        </section>

        <section className="al-toolbar">
          <div className="al-buscador">
            <Search size={18} />
            <input
              type="text"
              placeholder="Buscar alumno (nombre, matrícula, carrera...)"
              value={filtros.busqueda}
              onChange={(e) => cambiarFiltros({ busqueda: e.target.value })}
            />
          </div>

          <select
            className="al-select"
            value={valorNivel}
            onChange={(e) => elegirNivel(e.target.value)}
          >
            <option value="todos">Todos los niveles de riesgo</option>
            <option value="alto">Riesgo alto</option>
            <option value="medio">Riesgo medio</option>
            <option value="bajo">Riesgo bajo</option>
            {valorNivel === 'varios' && (
              <option value="varios" disabled>
                Niveles personalizados
              </option>
            )}
          </select>

          <select
            className="al-select"
            value={filtros.carrera}
            onChange={(e) => cambiarFiltros({ carrera: e.target.value })}
          >
            <option value="todas">Todas las carreras</option>
            {carreras.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          <select
            className="al-select"
            value={filtros.semestre}
            onChange={(e) => cambiarFiltros({ semestre: e.target.value })}
          >
            <option value="todos">Todos los semestres</option>
            {semestres.map((s) => (
              <option key={s} value={s}>
                Semestre {s}°
              </option>
            ))}
          </select>

          <button className="al-agregar">
            <Plus size={18} />
            Agregar alumno
          </button>
        </section>

        <div className="al-layout">
          <TablaAlumnos
            lista={visibles}
            totalFiltrados={filtrados.length}
            pagina={paginaActual}
            totalPaginas={totalPaginas}
            onPagina={setPagina}
          />

          <aside className="al-lateral">
            <PanelFiltros
              filtros={filtros}
              onChange={cambiarFiltros}
              onLimpiar={limpiar}
              conteo={{
                alto: contar('alto'),
                medio: contar('medio'),
                bajo: contar('bajo'),
              }}
              carreras={carreras}
              semestres={semestres}
            />
            <ResumenRapido altos={contar('alto')} />
          </aside>
        </div>
      </div>
    </>
  );
}