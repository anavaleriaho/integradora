import type { ReactNode } from 'react';
import {
  TriangleAlert,
  CircleAlert,
  ShieldCheck,
  CircleCheck,
} from 'lucide-react';
import PanelGrafica from './PanelGrafica';
import type { NivelRiesgo } from '../../types';
import { cambioRiesgo, cambios } from '../../data/estadisticas';

function delta(valor: number, subeEsBueno: boolean, sufijo = '') {
  if (valor === 0) return { texto: '=', clase: 'ambar' };
  const sube = valor > 0;
  const bueno = sube === subeEsBueno;
  return {
    texto: `${sube ? '↑' : '↓'} ${Math.abs(valor)}${sufijo}`,
    clase: bueno ? 'verde' : 'rojo',
  };
}

interface Fila {
  icono: ReactNode;
  clase: string;
  etiqueta: string;
  valor: string | number;
  cambio: { texto: string; clase: string } | null;
}

interface Props {
  riesgo: Record<NivelRiesgo, number>;
  tasaAprobacion: number;
  // Los cambios solo existen para el total de alumnos; con un filtro se ocultan
  conCambios: boolean;
}

export default function ResumenGeneral({
  riesgo,
  tasaAprobacion,
  conCambios,
}: Props) {
  const filas: Fila[] = [
    {
      icono: <TriangleAlert size={18} />,
      clase: 'alto',
      etiqueta: 'Alumnos con riesgo alto',
      valor: riesgo.alto,
      cambio: conCambios ? delta(cambioRiesgo.alto, false) : null,
    },
    {
      icono: <CircleAlert size={18} />,
      clase: 'medio',
      etiqueta: 'Alumnos con riesgo medio',
      valor: riesgo.medio,
      cambio: conCambios ? delta(cambioRiesgo.medio, false) : null,
    },
    {
      icono: <ShieldCheck size={18} />,
      clase: 'bajo',
      etiqueta: 'Alumnos con riesgo bajo',
      valor: riesgo.bajo,
      cambio: conCambios ? delta(cambioRiesgo.bajo, true) : null,
    },
    {
      icono: <CircleCheck size={18} />,
      clase: 'tasa',
      etiqueta: 'Tasa de aprobación',
      valor: `${tasaAprobacion}%`,
      cambio: conCambios ? delta(cambios.aprobacion, true, '%') : null,
    },
  ];

  return (
    <PanelGrafica titulo="Resumen general">
      <ul className="es-resumen">
        {filas.map((f) => (
          <li key={f.etiqueta}>
            <span className={`es-resumen-icono ${f.clase}`}>{f.icono}</span>
            <span>{f.etiqueta}</span>
            <strong>{f.valor}</strong>
            {f.cambio && (
              <span className={`es-delta ${f.cambio.clase}`}>
                {f.cambio.texto}
              </span>
            )}
          </li>
        ))}
      </ul>
    </PanelGrafica>
  );
}