import { useState } from 'react';
import {
  Users,
  TriangleAlert,
  CircleAlert,
  CircleCheck,
  Search,
  Plus,
  RefreshCw,
  X,
} from 'lucide-react';
import Header from '../components/Header';
import TarjetaResumen from '../components/alumnos/TarjetaResumen';
import TablaAlumnos from '../components/alumnos/TablaAlumnos';
import ResumenRapido from '../components/alumnos/ResumenRapido';
import AgregarAlumno from '../components/alumnos/AgregarAlumno';
import type { NuevoAlumno } from '../components/alumnos/AgregarAlumno';
import { alumnos as alumnosIniciales } from '../data/alumnos';
import { cargarAlumnos } from '../data/cargarAlumnos';
import type { Alumno, NivelRiesgo } from '../types';
import '../styles/alumnos.css';

const POR_PAGINA = 7;

const normalizarMatricula = (m: string) =>
  m.replace(/[^0-9a-z]/gi, '').toLowerCase();

interface Filtros {
  busqueda: string;
  niveles: Record<NivelRiesgo, boolean>;
  carrera: string;
  semestre: string;
}

const filtrosIniciales: Filtros = {
  busqueda: '',
  niveles: { alto: true, medio: true, bajo: true },
  carrera: 'todas',
  semestre: 'todos',
};

export default function Alumnos() {
  const [filtros, setFiltros] = useState<Filtros>(filtrosIniciales);
  const [pagina, setPagina] = useState(1);
  const [agregando, setAgregando] = useState(false);
  const [actualizando, setActualizando] = useState(false);
  const [ultimaActualizacion, setUltimaActualizacion] = useState(() => new Date());
  const [errorActualizacion, setErrorActualizacion] = useState('');

  const [alumnos, setAlumnos] = useState<Alumno[]>(alumnosIniciales);
  const total = alumnos.length;
  const contar = (n: NivelRiesgo) =>
    alumnos.filter((a) => a.riesgo === n).length;
  const porcentaje = (n: NivelRiesgo) =>
    total === 0 ? '0.0' : ((contar(n) / total) * 100).toFixed(1);

  const carreras = [...new Set(alumnos.map((a) => a.carrera))];
  const semestres = Array.from({ length: 12 }, (_, i) => i + 1);

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

  // Vuelve a pedir la lista con los datos más recientes (asistencia, promedio, riesgo...)
  const actualizarLista = async () => {
    setActualizando(true);
    setErrorActualizacion('');
    try {
      setAlumnos(await cargarAlumnos());
      setUltimaActualizacion(new Date());
    } catch {
      setErrorActualizacion('No se pudo actualizar la lista. Inténtalo de nuevo.');
    } finally {
      setActualizando(false);
    }
  };

  const horaActualizacion = ultimaActualizacion.toLocaleTimeString('es-MX', {
    hour: '2-digit',
    minute: '2-digit',
  });

  // Devuelve un mensaje de error si la matrícula ya la tiene otro alumno
  const editarAlumno = (
    id: number,
    datos: { nombre: string; matricula: string }
  ): string | null => {
    const repetida = alumnos.some(
      (a) =>
        a.id !== id &&
        normalizarMatricula(a.matricula) === normalizarMatricula(datos.matricula)
    );
    if (repetida) return 'Ya existe otro alumno con esa matrícula.';

    setAlumnos((prev) =>
      prev.map((a) => (a.id === id ? { ...a, ...datos } : a))
    );
    return null;
  };

  // Por ahora solo se agrega en pantalla; cuando exista el backend se guardará en la base de datos
  const agregarAlumno = (datos: NuevoAlumno): string | null => {
    const repetida = alumnos.some(
      (a) =>
        normalizarMatricula(a.matricula) === normalizarMatricula(datos.matricula)
    );
    if (repetida) return 'Ya existe un alumno con esa matrícula.';

    const nuevo: Alumno = {
      id: Math.max(0, ...alumnos.map((a) => a.id)) + 1,
      ...datos,
      riesgo: 'bajo',
      probabilidad: 0,
      factores: [],
      asistencia: 0,
      promedio: 0,
      reprobadas: 0,
    };
    setAlumnos((prev) => [nuevo, ...prev]);
    setPagina(1);
    return null;
  };

  const eliminarAlumno = (id: number) => {
    setAlumnos((prev) => prev.filter((a) => a.id !== id));
  };

  // El selector de la barra superior se calcula a partir de los niveles activos
  const activos = (Object.keys(filtros.niveles) as NivelRiesgo[]).filter(
    (n) => filtros.niveles[n]
  );
  const valorNivel =
    activos.length === 3 ? 'todos' : activos.length === 1 ? activos[0] : 'varios';

  const hayFiltros =
    filtros.busqueda !== '' ||
    valorNivel !== 'todos' ||
    filtros.carrera !== 'todas' ||
    filtros.semestre !== 'todos';

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
            <option value="todos">Todos los cuatrimestres</option>
            {semestres.map((s) => (
              <option key={s} value={s}>
                Cuatrimestre {s}°
              </option>
            ))}
          </select>

          {hayFiltros && (
            <button className="al-limpiar" onClick={limpiar}>
              <X size={14} />
              Limpiar filtros
            </button>
          )}

          <button
            className="al-actualizar"
            onClick={actualizarLista}
            disabled={actualizando}
          >
            <RefreshCw size={18} className={actualizando ? 'al-girando' : ''} />
            {actualizando ? 'Actualizando...' : 'Actualizar lista'}
          </button>

          <button className="al-agregar" onClick={() => setAgregando(true)}>
            <Plus size={18} />
            Agregar alumno
          </button>

          <p
            className={`al-actualizacion ${errorActualizacion ? 'error' : ''}`}
            role="status"
          >
            {errorActualizacion || `Última actualización: ${horaActualizacion}`}
          </p>
        </section>

        <div className="al-layout">
          <TablaAlumnos
            lista={visibles}
            totalFiltrados={filtrados.length}
            pagina={paginaActual}
            totalPaginas={totalPaginas}
            onPagina={setPagina}
            onEditar={editarAlumno}
            onEliminar={eliminarAlumno}
          />

          <aside className="al-lateral">
            <ResumenRapido altos={contar('alto')} />
          </aside>
        </div>
      </div>

      {agregando && (
        <AgregarAlumno
          onAgregar={agregarAlumno}
          onCerrar={() => setAgregando(false)}
        />
      )}
    </>
  );
}