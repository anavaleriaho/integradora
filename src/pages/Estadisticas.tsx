import { useEffect, useState } from 'react';
import {
  Users,
  GraduationCap,
  Percent,
  CircleAlert,
  FileText,
  FileSpreadsheet,
  FileDown,
  Download,
  Check,
  TriangleAlert,
  Filter,
  RotateCcw,
} from 'lucide-react';
import Header from '../components/Header';
import TarjetaIndicador from '../components/estadisticas/TarjetaIndicador';
import RendimientoSemestre from '../components/estadisticas/RendimientoSemestre';
import RendimientoCarrera from '../components/estadisticas/RendimientoCarrera';
import AsistenciaSemanal from '../components/estadisticas/AsistenciaSemanal';
import MateriasReprobadas from '../components/estadisticas/MateriasReprobadas';
import ResumenGeneral from '../components/estadisticas/ResumenGeneral';
import UltimosAnalisis from '../components/analisis/UltimosAnalisis';
import { useAuth } from '../auth/useAuth';
import { construirReporte } from '../reportes/datosReporte';
import { exportarPDF } from '../reportes/exportarPDF';
import { exportarExcel } from '../reportes/exportarExcel';
import { exportarCSV } from '../reportes/exportarCSV';
import {
  totalAlumnos as totalAlumnosEstatico,
  promedioGeneral as promedioEstatico,
  asistenciaPromedio as asistenciaEstatica,
  totalReprobadas as reprobadasEstatico,
  cambios as cambiosEstatico,
} from '../data/estadisticas';
import '../styles/analisis.css';
import '../styles/estadisticas.css';
import '../styles/reportes.css';

/* ───────────── Configuración de la API ───────────── */

const API_URL: string = import.meta.env.VITE_API_URL ?? 'http://localhost:8000';

// Ajusta estas rutas a las de tu backend FastAPI
const ENDPOINTS = {
  estadisticas: '/estadisticas',
  carreras: '/carreras',
  grupos: '/grupos',
};

/* ───────────── Tipos ───────────── */

interface Filtros {
  carrera: string; // '' = todas
  grupo: string; // '' = todos
  cuatrimestre: string; // '' = todos
}

interface Opcion {
  valor: string;
  etiqueta: string;
}

interface DatosEstadisticas {
  totalAlumnos: number;
  promedioGeneral: number;
  asistenciaPromedio: number;
  totalReprobadas: number;
  cambios: { promedio: number; asistencia: number; reprobadas: number };
}

type Formato = 'pdf' | 'excel' | 'csv';

interface Mensaje {
  tipo: 'ok' | 'error';
  texto: string;
}

/* ───────────── Datos estáticos (respaldo) ───────────── */

const filtrosVacios: Filtros = { carrera: '', grupo: '', cuatrimestre: '' };

const datosEstaticos: DatosEstadisticas = {
  totalAlumnos: totalAlumnosEstatico,
  promedioGeneral: promedioEstatico,
  asistenciaPromedio: asistenciaEstatica,
  totalReprobadas: reprobadasEstatico,
  cambios: cambiosEstatico,
};

// Se usan solo si la API no responde todavía
const carrerasEstaticas: Opcion[] = [
  { valor: '1', etiqueta: 'Ingeniería en Software' },
  { valor: '2', etiqueta: 'Ingeniería Industrial' },
  { valor: '3', etiqueta: 'Administración' },
];
const gruposEstaticos: Opcion[] = ['A', 'B', 'C'].map((g) => ({
  valor: g,
  etiqueta: `Grupo ${g}`,
}));
const cuatrimestres: Opcion[] = Array.from({ length: 10 }, (_, i) => ({
  valor: String(i + 1),
  etiqueta: `${i + 1}° cuatrimestre`,
}));

const formatos: {
  clave: Formato;
  icono: typeof FileText;
  titulo: string;
  boton: string;
  extension: string;
}[] = [
  { clave: 'pdf', icono: FileText, titulo: 'PDF', boton: 'Generar PDF', extension: 'pdf' },
  { clave: 'excel', icono: FileSpreadsheet, titulo: 'Excel', boton: 'Generar Excel', extension: 'xlsx' },
  { clave: 'csv', icono: FileDown, titulo: 'CSV', boton: 'Generar CSV', extension: 'csv' },
];

/* ───────────── Utilidades ───────────── */

function construirQuery(f: Filtros): string {
  const params = new URLSearchParams();
  if (f.carrera) params.set('carrera_id', f.carrera);
  if (f.grupo) params.set('grupo', f.grupo);
  if (f.cuatrimestre) params.set('cuatrimestre', f.cuatrimestre);
  const q = params.toString();
  return q ? `?${q}` : '';
}

function descripcionFiltros(f: Filtros, carreras: Opcion[]): string {
  const partes: string[] = [];
  if (f.carrera) {
    partes.push(carreras.find((c) => c.valor === f.carrera)?.etiqueta ?? 'Carrera');
  }
  if (f.grupo) partes.push(`Grupo ${f.grupo}`);
  if (f.cuatrimestre) partes.push(`${f.cuatrimestre}° cuatrimestre`);
  return partes.length ? partes.join(' · ') : 'Todos los alumnos';
}

/* ───────────── Componente ───────────── */

export default function Estadisticas() {
  const { usuario } = useAuth();

  // Lo que el usuario está eligiendo en el formulario
  const [borrador, setBorrador] = useState<Filtros>(filtrosVacios);
  // Lo que ya se aplicó (con esto se consulta y se genera el reporte)
  const [filtros, setFiltros] = useState<Filtros>(filtrosVacios);

  const [carreras, setCarreras] = useState<Opcion[]>(carrerasEstaticas);
  const [grupos, setGrupos] = useState<Opcion[]>(gruposEstaticos);

  const [datos, setDatos] = useState<DatosEstadisticas>(datosEstaticos);
  const [cargando, setCargando] = useState(false);
  const [usandoEstaticos, setUsandoEstaticos] = useState(true);

  const [generando, setGenerando] = useState<Formato | null>(null);
  const [mensaje, setMensaje] = useState<Mensaje | null>(null);

  /* Catálogo de carreras (una sola vez) */
  useEffect(() => {
  const controlador = new AbortController();
  fetch(`${API_URL}${ENDPOINTS.carreras}`, { signal: controlador.signal })
    .then((r) => (r.ok ? r.json() : Promise.reject()))
    .then(
      (
        lista: {
          id_carrera: number;
          nombre?: string;
          nombre_carrera?: string;
        }[],
      ) => {
        if (Array.isArray(lista) && lista.length > 0) {
          setCarreras(
            lista.map((c) => ({
              valor: String(c.id_carrera),
              etiqueta: c.nombre ?? c.nombre_carrera ?? `Carrera ${c.id_carrera}`,
            })),
          );
        }
      },
    )
    .catch(() => {
      /* sin API: se quedan las carreras de respaldo */
    });
  return () => controlador.abort();
}, []);

  /* Catálogo de grupos (cambia según la carrera elegida en el formulario) */
  useEffect(() => {
    const controlador = new AbortController();
    const q = borrador.carrera ? `?carrera_id=${borrador.carrera}` : '';
    fetch(`${API_URL}${ENDPOINTS.grupos}${q}`, { signal: controlador.signal })
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((lista: { id?: number | string; nombre: string }[]) => {
        if (Array.isArray(lista) && lista.length > 0) {
          setGrupos(lista.map((g) => ({ valor: g.nombre, etiqueta: `Grupo ${g.nombre}` })));
        } else {
          setGrupos(gruposEstaticos);
        }
      })
      .catch(() => setGrupos(gruposEstaticos));
    return () => controlador.abort();
  }, [borrador.carrera]);

  /* Estadísticas según los filtros aplicados */
  useEffect(() => {
    const controlador = new AbortController();
    setCargando(true);

    fetch(`${API_URL}${ENDPOINTS.estadisticas}${construirQuery(filtros)}`, {
      signal: controlador.signal,
    })
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((d: Partial<DatosEstadisticas>) => {
        // Base de datos vacía o respuesta incompleta → datos estáticos
        if (!d || !d.totalAlumnos) {
          setDatos(datosEstaticos);
          setUsandoEstaticos(true);
          return;
        }
        setDatos({
          totalAlumnos: d.totalAlumnos,
          promedioGeneral: d.promedioGeneral ?? 0,
          asistenciaPromedio: d.asistenciaPromedio ?? 0,
          totalReprobadas: d.totalReprobadas ?? 0,
          cambios: d.cambios ?? { promedio: 0, asistencia: 0, reprobadas: 0 },
        });
        setUsandoEstaticos(false);
      })
      .catch((e) => {
        if (e?.name === 'AbortError') return;
        setDatos(datosEstaticos);
        setUsandoEstaticos(true);
      })
      .finally(() => setCargando(false));

    return () => controlador.abort();
  }, [filtros]);

  /* Formulario */
  const cambiarCampo = (campo: keyof Filtros, valor: string) => {
    setBorrador((prev) => ({
      ...prev,
      [campo]: valor,
      // si cambia la carrera, el grupo elegido ya podría no aplicar
      ...(campo === 'carrera' ? { grupo: '' } : {}),
    }));
  };

  const aplicar = (e: React.FormEvent) => {
    e.preventDefault();
    setMensaje(null);
    setFiltros(borrador);
  };

  const limpiar = () => {
    setBorrador(filtrosVacios);
    setFiltros(filtrosVacios);
    setMensaje(null);
  };

  /* Reportes (con los filtros aplicados) */
  const generar = async (formato: (typeof formatos)[number]) => {
  setMensaje(null);
  setGenerando(formato.clave);

  try {
    await new Promise((resolver) => setTimeout(resolver, 400));

    const nombreCarrera =
      carreras.find((c) => c.valor === filtros.carrera)?.etiqueta ?? '';

    const reporte = construirReporte(usuario, {
      carrera: nombreCarrera,
      grupo: filtros.grupo,
      cuatrimestre: filtros.cuatrimestre,
    });

    if (formato.clave === 'pdf') exportarPDF(reporte);
    else if (formato.clave === 'excel') exportarExcel(reporte);
    else exportarCSV(reporte);

    setMensaje({
      tipo: 'ok',
      texto: `Reporte generado: ${reporte.nombreArchivo}.${formato.extension}`,
    });
  } catch (e) {
    setMensaje({
      tipo: 'error',
      texto:
        e instanceof Error ? e.message : 'No se pudo generar el reporte. Inténtalo de nuevo.',
    });
  } finally {
    setGenerando(null);
  }
};

  const { totalAlumnos, promedioGeneral, asistenciaPromedio, totalReprobadas, cambios } = datos;

  return (
    <>
      <Header
        titulo="Estadísticas"
        subtitulo="Análisis y visualización de datos académicos para una mejor toma de decisiones."
      />

      <div className="pagina">
        {/* ───── Filtros ───── */}
        <form className="es-filtros" onSubmit={aplicar}>
          <div className="es-filtros-titulo">
            <Filter size={18} />
            Filtros
          </div>

          <label className="es-campo">
            <span>Carrera</span>
            <select
              value={borrador.carrera}
              onChange={(e) => cambiarCampo('carrera', e.target.value)}
            >
              <option value="">Todas las carreras</option>
              {carreras.map((c) => (
                <option key={c.valor} value={c.valor}>
                  {c.etiqueta}
                </option>
              ))}
            </select>
          </label>

          <label className="es-campo">
            <span>Grupo</span>
            <select
              value={borrador.grupo}
              onChange={(e) => cambiarCampo('grupo', e.target.value)}
            >
              <option value="">Todos los grupos</option>
              {grupos.map((g) => (
                <option key={g.valor} value={g.valor}>
                  {g.etiqueta}
                </option>
              ))}
            </select>
          </label>

          <label className="es-campo">
            <span>Cuatrimestre</span>
            <select
              value={borrador.cuatrimestre}
              onChange={(e) => cambiarCampo('cuatrimestre', e.target.value)}
            >
              <option value="">Todos los cuatrimestres</option>
              {cuatrimestres.map((c) => (
                <option key={c.valor} value={c.valor}>
                  {c.etiqueta}
                </option>
              ))}
            </select>
          </label>

          <div className="es-filtros-acciones">
            <button type="submit" className="rp-btn" disabled={cargando}>
              <Filter size={16} />
              {cargando ? 'Cargando...' : 'Aplicar filtros'}
            </button>
            <button type="button" className="rp-btn" onClick={limpiar}>
              <RotateCcw size={16} />
              Limpiar
            </button>
          </div>
        </form>

        <p className="es-filtro-actual">
          Mostrando: <strong>{descripcionFiltros(filtros, carreras)}</strong>
          {usandoEstaticos && ' (datos de ejemplo)'}
        </p>

        {/* ───── Indicadores ───── */}
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
            descripcion="vs. cuatrimestre anterior"
          />
          <TarjetaIndicador
            icono={<Percent size={30} />}
            titulo="Asistencia promedio"
            valor={`${asistenciaPromedio}%`}
            cambio={`↑ ${cambios.asistencia}%`}
            descripcion="vs. cuatrimestre anterior"
          />
          <TarjetaIndicador
            tipo="alerta"
            icono={<CircleAlert size={30} />}
            titulo="Materias reprobadas"
            valor={totalReprobadas}
            cambio={`↓ ${Math.abs(cambios.reprobadas)}`}
            cambioMalo
            descripcion="vs. cuatrimestre anterior"
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

        {/* ───── Reportes ───── */}
        <section className="rp-incluye">
          <h2>
            <FileText size={20} />
            Generar reporte
          </h2>
          <p className="rp-nota">
            El reporte se genera con el filtro seleccionado:{' '}
            <strong>{descripcionFiltros(filtros, carreras)}</strong>
          </p>

          {mensaje && (
            <div className={`rp-mensaje ${mensaje.tipo}`} role="status">
              {mensaje.tipo === 'ok' ? <Check size={18} /> : <TriangleAlert size={18} />}
              {mensaje.texto}
            </div>
          )}

          <div className="es-reportes-botones">
            {formatos.map((f) => {
              const Icono = f.icono;
              const ocupado = generando === f.clave;
              return (
                <button
                  key={f.clave}
                  className="rp-btn"
                  onClick={() => generar(f)}
                  disabled={generando !== null}
                >
                  <Icono size={18} />
                  <Download size={16} />
                  {ocupado ? 'Generando...' : f.boton}
                </button>
              );
            })}
          </div>
        </section>
      </div>
    </>
  );
}