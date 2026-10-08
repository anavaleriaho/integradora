import { useState } from 'react';
import {
  TriangleAlert,
  CircleAlert,
  CircleCheck,
  Eye,
  EllipsisVertical,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import type { Alumno } from '../../types';

const etiquetas = {
  alto: { texto: 'Alto', icono: <TriangleAlert size={14} /> },
  medio: { texto: 'Medio', icono: <CircleAlert size={14} /> },
  bajo: { texto: 'Bajo', icono: <CircleCheck size={14} /> },
};

interface Props {
  lista: Alumno[];
  totalFiltrados: number;
  pagina: number;
  totalPaginas: number;
  onPagina: (pagina: number) => void;
}

export default function TablaAlumnos({
  lista,
  totalFiltrados,
  pagina,
  totalPaginas,
  onPagina,
}: Props) {
  const [seleccion, setSeleccion] = useState<number[]>([]);

  const todosMarcados =
    lista.length > 0 && lista.every((a) => seleccion.includes(a.id));

  const alternarTodos = () => {
    if (todosMarcados) {
      setSeleccion(seleccion.filter((id) => !lista.some((a) => a.id === id)));
    } else {
      setSeleccion([...new Set([...seleccion, ...lista.map((a) => a.id)])]);
    }
  };

  const alternar = (id: number) => {
    setSeleccion(
      seleccion.includes(id)
        ? seleccion.filter((i) => i !== id)
        : [...seleccion, id]
    );
  };

  const paginas = Array.from({ length: totalPaginas }, (_, i) => i + 1);

  return (
    <section className="al-tabla-panel">
      <div className="al-tabla-scroll">
        <table className="al-tabla">
          <thead>
            <tr>
              <th>
                <input
                  type="checkbox"
                  checked={todosMarcados}
                  onChange={alternarTodos}
                  aria-label="Seleccionar todos"
                />
              </th>
              <th>Alumno</th>
              <th>Carrera</th>
              <th>Semestre</th>
              <th>Promedio</th>
              <th>Asistencia</th>
              <th>Riesgo</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {lista.length === 0 ? (
              <tr>
                <td colSpan={8} className="al-vacio">
                  No se encontraron alumnos.
                </td>
              </tr>
            ) : (
              lista.map((a) => {
                const palabras = a.nombre.split(' ');
                const iniciales = palabras[0][0] + palabras[1][0];
                const etiqueta = etiquetas[a.riesgo];

                return (
                  <tr
                    key={a.id}
                    className={seleccion.includes(a.id) ? 'seleccionada' : ''}
                  >
                    <td>
                      <input
                        type="checkbox"
                        checked={seleccion.includes(a.id)}
                        onChange={() => alternar(a.id)}
                        aria-label={`Seleccionar a ${a.nombre}`}
                      />
                    </td>
                    <td>
                      <div className="al-alumno">
                        <div className={`al-avatar ${a.riesgo}`}>{iniciales}</div>
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
                        <button className="al-ver" aria-label="Ver alumno">
                          <Eye size={18} />
                        </button>
                        <button className="al-mas" aria-label="Más opciones">
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
    </section>
  );
}