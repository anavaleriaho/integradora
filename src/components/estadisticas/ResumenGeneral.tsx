import type { ReactNode } from 'react';
import {
  TriangleAlert,
  CircleAlert,
  ShieldCheck,
  CircleCheck,
} from 'lucide-react';
import PanelGrafica from './PanelGrafica';
import { conteoRiesgo } from '../../data/analisis';
import {
  cambioRiesgo,
  cambios,
  tasaAprobacion,
} from '../../data/estadisticas';

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
  cambio: { texto: string; clase: string };
}

const filas: Fila[] = [
  {
    icono: <TriangleAlert size={18} />,
    clase: 'alto',
    etiqueta: 'Alumnos con riesgo alto',
    valor: conteoRiesgo.alto,
    cambio: delta(cambioRiesgo.alto, false),
  },
  {
    icono: <CircleAlert size={18} />,
    clase: 'medio',
    etiqueta: 'Alumnos con riesgo medio',
    valor: conteoRiesgo.medio,
    cambio: delta(cambioRiesgo.medio, false),
  },
  {
    icono: <ShieldCheck size={18} />,
    clase: 'bajo',
    etiqueta: 'Alumnos con riesgo bajo',
    valor: conteoRiesgo.bajo,
    cambio: delta(cambioRiesgo.bajo, true),
  },
  {
    icono: <CircleCheck size={18} />,
    clase: 'tasa',
    etiqueta: 'Tasa de aprobación',
    valor: `${tasaAprobacion}%`,
    cambio: delta(cambios.aprobacion, true, '%'),
  },
];

export default function ResumenGeneral() {
  return (
    <PanelGrafica titulo="Resumen general">
      <ul className="es-resumen">
        {filas.map((f) => (
          <li key={f.etiqueta}>
            <span className={`es-resumen-icono ${f.clase}`}>{f.icono}</span>
            <span>{f.etiqueta}</span>
            <strong>{f.valor}</strong>
            <span className={`es-delta ${f.cambio.clase}`}>{f.cambio.texto}</span>
          </li>
        ))}
      </ul>
    </PanelGrafica>
  );
}