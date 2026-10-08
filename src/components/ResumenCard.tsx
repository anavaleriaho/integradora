import type { ReactNode } from 'react';

interface Props {
  icono: ReactNode;
  numero: number;
  titulo: string;
  descripcion: string;
  tipo: 'info' | 'alto' | 'medio' | 'bajo';
}

export default function ResumenCard({
  icono,
  numero,
  titulo,
  descripcion,
  tipo,
}: Props) {
  return (
    <div className={`resumen-card ${tipo}`}>
      <div className="resumen-icono">{icono}</div>
      <div>
        <p className="resumen-numero">{numero}</p>
        <p className="resumen-titulo">{titulo}</p>
        <p className="resumen-desc">{descripcion}</p>
      </div>
    </div>
  );
}