import { Filter, RefreshCw } from 'lucide-react';
import type { NivelRiesgo } from '../../types';

export interface Filtros {
  busqueda: string;
  niveles: Record<NivelRiesgo, boolean>;
  carrera: string;
  semestre: string;
}

interface Props {
  filtros: Filtros;
  onChange: (cambios: Partial<Filtros>) => void;
  onLimpiar: () => void;
  conteo: Record<NivelRiesgo, number>;
  carreras: string[];
  semestres: number[];
}

const niveles: { clave: NivelRiesgo; nombre: string }[] = [
  { clave: 'alto', nombre: 'Alto' },
  { clave: 'medio', nombre: 'Medio' },
  { clave: 'bajo', nombre: 'Bajo' },
];

export default function PanelFiltros({
  filtros,
  onChange,
  onLimpiar,
  conteo,
  carreras,
  semestres,
}: Props) {
  return (
    <section className="al-panel">
      <div className="al-panel-head">
        <Filter size={20} />
        <h2>Filtros aplicados</h2>
        <button className="al-limpiar" onClick={onLimpiar}>
          <RefreshCw size={13} />
          Limpiar filtros
        </button>
      </div>

      <h3 className="al-subtitulo">Nivel de riesgo</h3>
      <div className="al-checks">
        {niveles.map((n) => (
          <label key={n.clave} className="al-check">
            <input
              type="checkbox"
              checked={filtros.niveles[n.clave]}
              onChange={() =>
                onChange({
                  niveles: {
                    ...filtros.niveles,
                    [n.clave]: !filtros.niveles[n.clave],
                  },
                })
              }
            />
            {n.nombre} ({conteo[n.clave]})
          </label>
        ))}
      </div>

      <h3 className="al-subtitulo">Carrera</h3>
      <select
        className="al-select"
        value={filtros.carrera}
        onChange={(e) => onChange({ carrera: e.target.value })}
      >
        <option value="todas">Todas las carreras</option>
        {carreras.map((c) => (
          <option key={c} value={c}>
            {c}
          </option>
        ))}
      </select>

      <h3 className="al-subtitulo">Semestre</h3>
      <select
        className="al-select"
        value={filtros.semestre}
        onChange={(e) => onChange({ semestre: e.target.value })}
      >
        <option value="todos">Todos los semestres</option>
        {semestres.map((s) => (
          <option key={s} value={s}>
            Semestre {s}°
          </option>
        ))}
      </select>
    </section>
  );
}