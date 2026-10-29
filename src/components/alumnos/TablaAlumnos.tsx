import { useEffect, useState } from 'react';
import type { FormEvent, MouseEvent } from 'react';
import {
  TriangleAlert,
  CircleAlert,
  CircleCheck,
  Eye,
  EllipsisVertical,
  ChevronLeft,
  ChevronRight,
  Pencil,
  Trash2,
} from 'lucide-react';
import type { Alumno } from '../../types';
import { materiasReprobadas } from '../../data/materias';
import Modal from './Modal';

const etiquetas = {
  alto: { texto: 'Alto', icono: <TriangleAlert size={14} /> },
  medio: { texto: 'Medio', icono: <CircleAlert size={14} /> },
  bajo: { texto: 'Bajo', icono: <CircleCheck size={14} /> },
};

export interface DatosAlumno {
  nombre: string;
  matricula: string;
}

interface Props {
  lista: Alumno[];
  totalFiltrados: number;
  pagina: number;
  totalPaginas: number;
  onPagina: (pagina: number) => void;
  // Devuelve un mensaje de error (por ejemplo, matrícula repetida) o null si todo salió bien
  onEditar: (id: number, datos: DatosAlumno) => string | null;
  onEliminar: (id: number) => void;
}

interface MenuAbierto {
  id: number;
  x: number;
  y: number;
}

const ANCHO_MENU = 180;

function obtenerIniciales(nombre: string) {
  const palabras = nombre.split(' ').filter(Boolean);
  return (palabras[0]?.[0] ?? '') + (palabras[1]?.[0] ?? '');
}

// Tarjeta con los datos básicos del alumno dentro de las ventanas flotantes
function FichaAlumno({ alumno }: { alumno: Alumno }) {
  const etiqueta = etiquetas[alumno.riesgo];
  return (
    <div className="al-modal-ficha">
      <div className={`al-avatar ${alumno.riesgo}`}>
        {obtenerIniciales(alumno.nombre)}
      </div>
      <div className="al-modal-ficha-datos">
        <strong>{alumno.nombre}</strong>
        <span>
          {alumno.matricula} · {alumno.carrera}
        </span>
      </div>
      <span className={`al-badge ${alumno.riesgo}`}>
        {etiqueta.icono}
        {etiqueta.texto}
      </span>
    </div>
  );
}

export default function TablaAlumnos({
  lista,
  totalFiltrados,
  pagina,
  totalPaginas,
  onPagina,
  onEditar,
  onEliminar,
}: Props) {
  const [menu, setMenu] = useState<MenuAbierto | null>(null);
  const [viendoId, setViendoId] = useState<number | null>(null);
  const [editandoId, setEditandoId] = useState<number | null>(null);
  const [eliminandoId, setEliminandoId] = useState<number | null>(null);
  const [nombreEditado, setNombreEditado] = useState('');
  const [matriculaEditada, setMatriculaEditada] = useState('');
  const [errorEdicion, setErrorEdicion] = useState('');

  // Cierra el menú de los tres puntos al hacer clic fuera, desplazarse o redimensionar
  useEffect(() => {
    if (!menu) return;
    const cerrar = () => setMenu(null);
    window.addEventListener('click', cerrar);
    window.addEventListener('resize', cerrar);
    window.addEventListener('scroll', cerrar, true);
    return () => {
      window.removeEventListener('click', cerrar);
      window.removeEventListener('resize', cerrar);
      window.removeEventListener('scroll', cerrar, true);
    };
  }, [menu]);

  const paginas = Array.from({ length: totalPaginas }, (_, i) => i + 1);

  const alumnoVer = lista.find((a) => a.id === viendoId);
  const alumnoEditar = lista.find((a) => a.id === editandoId);
  const alumnoEliminar = lista.find((a) => a.id === eliminandoId);
  const alumnoMenu = lista.find((a) => a.id === menu?.id);

  const reprobadasVer = alumnoVer ? materiasReprobadas[alumnoVer.id] ?? [] : [];

  const abrirMenu = (e: MouseEvent<HTMLButtonElement>, id: number) => {
    e.stopPropagation();
    if (menu?.id === id) {
      setMenu(null);
      return;
    }
    const caja = e.currentTarget.getBoundingClientRect();
    setMenu({
      id,
      x: Math.max(8, caja.right - ANCHO_MENU),
      y: Math.min(caja.bottom + 4, window.innerHeight - 110),
    });
  };

  const empezarEdicion = (a: Alumno) => {
    setMenu(null);
    setNombreEditado(a.nombre);
    setMatriculaEditada(a.matricula);
    setErrorEdicion('');
    setEditandoId(a.id);
  };

  const empezarEliminacion = (a: Alumno) => {
    setMenu(null);
    setEliminandoId(a.id);
  };

  const guardarCambios = (e: FormEvent) => {
    e.preventDefault();
    if (!alumnoEditar) return;

    const nombre = nombreEditado.trim().replace(/\s+/g, ' ');
    const matricula = matriculaEditada.trim();

    if (nombre === '' || matricula === '') {
      setErrorEdicion('Completa el nombre y la matrícula.');
      return;
    }

    const error = onEditar(alumnoEditar.id, { nombre, matricula });
    if (error) {
      setErrorEdicion(error);
      return;
    }
    setEditandoId(null);
  };

  const confirmarEliminacion = () => {
    if (!alumnoEliminar) return;
    onEliminar(alumnoEliminar.id);
    setEliminandoId(null);
  };

  return (
    <section className="al-tabla-panel">
      <div className="al-tabla-scroll">
        <table className="al-tabla">
          <thead>
            <tr>
              <th>Alumno</th>
              <th>Carrera</th>
              <th>Cuatrimestre</th>
              <th>Promedio</th>
              <th>Asistencia</th>
              <th>Riesgo</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {lista.length === 0 ? (
              <tr>
                <td colSpan={7} className="al-vacio">
                  No se encontraron alumnos.
                </td>
              </tr>
            ) : (
              lista.map((a) => {
                const etiqueta = etiquetas[a.riesgo];

                return (
                  <tr key={a.id}>
                    <td>
                      <div className="al-alumno">
                        <div className={`al-avatar ${a.riesgo}`}>
                          {obtenerIniciales(a.nombre)}
                        </div>
                        <div>
                          <strong>{a.nombre}</strong>
                          <span>{a.matricula}</span>
                        </div>
                      </div>
                    </td>
                    <td>{a.carrera}</td>
                    <td>{a.semestre}°</td>
                    <td>{a.promedio.toFixed(1)}</td>
                    <td>{a.asistencia}%</td>
                    <td>
                      <span className={`al-badge ${a.riesgo}`}>
                        {etiqueta.icono}
                        {etiqueta.texto}
                      </span>
                    </td>
                    <td>
                      <div className="al-acciones">
                        <button
                          className="al-ver"
                          aria-label={`Ver materias reprobadas de ${a.nombre}`}
                          title="Ver materias reprobadas"
                          onClick={() => setViendoId(a.id)}
                        >
                          <Eye size={18} />
                        </button>
                        <button
                          className="al-mas"
                          aria-label={`Más opciones para ${a.nombre}`}
                          title="Más opciones"
                          onClick={(e) => abrirMenu(e, a.id)}
                        >
                          <EllipsisVertical size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <div className="al-pie">
        <span>
          Mostrando {lista.length} de {totalFiltrados} alumnos
        </span>

        <div className="al-paginacion">
          <button
            onClick={() => onPagina(pagina - 1)}
            disabled={pagina === 1}
            aria-label="Página anterior"
          >
            <ChevronLeft size={16} />
          </button>
          {paginas.map((p) => (
            <button
              key={p}
              className={p === pagina ? 'activa' : ''}
              onClick={() => onPagina(p)}
            >
              {p}
            </button>
          ))}
          <button
            onClick={() => onPagina(pagina + 1)}
            disabled={pagina === totalPaginas}
            aria-label="Página siguiente"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* Menú de los tres puntos */}
      {menu && alumnoMenu && (
        <div
          className="al-menu"
          style={{ top: menu.y, left: menu.x, width: ANCHO_MENU }}
          role="menu"
        >
          <button role="menuitem" onClick={() => empezarEdicion(alumnoMenu)}>
            <Pencil size={16} />
            Editar alumno
          </button>
          <button
            role="menuitem"
            className="peligro"
            onClick={() => empezarEliminacion(alumnoMenu)}
          >
            <Trash2 size={16} />
            Eliminar alumno
          </button>
        </div>
      )}

      {/* Ojito: materias reprobadas */}
      {alumnoVer && (
        <Modal
          titulo="Materias reprobadas"
          subtitulo={
            reprobadasVer.length === 0
              ? 'Sin materias reprobadas'
              : `${reprobadasVer.length} ${
                  reprobadasVer.length === 1 ? 'materia' : 'materias'
                } por regularizar`
          }
          icono={
            reprobadasVer.length === 0 ? (
              <CircleCheck size={24} />
            ) : (
              <TriangleAlert size={24} />
            )
          }
          tono={reprobadasVer.length === 0 ? 'verde' : 'rojo'}
          onCerrar={() => setViendoId(null)}
        >
          <FichaAlumno alumno={alumnoVer} />

          {reprobadasVer.length === 0 ? (
            <p className="al-modal-vacio">
              Este alumno no tiene materias reprobadas.
            </p>
          ) : (
            <ul className="al-materias">
              {reprobadasVer.map((m) => (
                <li key={m.nombre}>
                  <span>{m.nombre}</span>
                  <small>{m.cuatrimestre}° cuatrimestre</small>
                </li>
              ))}
            </ul>
          )}
        </Modal>
      )}

      {/* Tres puntos: editar nombre y matrícula */}
      {alumnoEditar && (
        <Modal
          titulo="Editar alumno"
          subtitulo="Actualiza el nombre y la matrícula si es necesario."
          icono={<Pencil size={22} />}
          tono="azul"
          onCerrar={() => setEditandoId(null)}
            pie={
              <button
                type="submit"
                form="formulario-editar-alumno"
                className="al-btn-prim"
                disabled={
                  nombreEditado.trim() === '' || matriculaEditada.trim() === ''
                }
              >
                Guardar cambios
              </button>
            }
        >
          <form id="formulario-editar-alumno" onSubmit={guardarCambios}>
            <label className="al-modal-campo">
              <span>Nombre completo</span>
              <input
                type="text"
                value={nombreEditado}
                onChange={(e) => {
                  setNombreEditado(e.target.value);
                  setErrorEdicion('');
                }}
                autoFocus
              />
            </label>

            <label className="al-modal-campo">
              <span>Matrícula</span>
              <input
                type="text"
                value={matriculaEditada}
                placeholder="Ejemplo: 2025-00123"
                onChange={(e) => {
                  setMatriculaEditada(e.target.value);
                  setErrorEdicion('');
                }}
              />
            </label>

            {errorEdicion && (
              <div className="al-modal-error" role="alert">
                <TriangleAlert size={16} />
                {errorEdicion}
              </div>
            )}
          </form>
        </Modal>
      )}

      {/* Tres puntos: eliminar */}
      {alumnoEliminar && (
        <Modal
          titulo="Eliminar alumno"
          subtitulo="Esta acción no se puede deshacer."
          icono={<Trash2 size={22} />}
          tono="rojo"
          onCerrar={() => setEliminandoId(null)}
          pie={
            <button
              type="button"
              className="al-btn-peligro"
              onClick={confirmarEliminacion}
            >
              Sí, eliminar
            </button>
          }
        >
          <FichaAlumno alumno={alumnoEliminar} />
          <p className="al-modal-texto">
            ¿Seguro que quieres eliminar a este alumno del sistema?
          </p>
        </Modal>
      )}
    </section>
  );
}