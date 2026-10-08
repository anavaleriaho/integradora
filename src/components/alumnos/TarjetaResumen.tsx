import type { ReactNode } from 'react';

interface Props {
  tipo: 'total' | 'alto' | 'medio' | 'bajo';
  icono: ReactNode;
  titulo: string;
  numero: number;
  descripcion: string;
}

export default function TarjetaResumen({
  tipo,
  icono,
  titulo,
  numero,
  descripcion,
}: Props) {
  return (
    <div className={`al-resumen ${tipo}`}>
      <div className="al-resumen-icono">{icono}</div>
      <div>
        <p className="al-resumen-titulo">{titulo}</p>
        <p className="al-resumen-numero">{numero}</p>
        <p className="al-resumen-desc">{descripcion}</p>
      </div>
    </div>
  );
}