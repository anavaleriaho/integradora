import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import type { NivelRiesgo } from '../../types';

interface Props {
  tipo: NivelRiesgo;
  icono: ReactNode;
  titulo: string;
  numero: number;
  descripcion: string;
}

export default function TarjetaRiesgo({
  tipo,
  icono,
  titulo,
  numero,
  descripcion,
}: Props) {
  return (
    <div className={`an-riesgo ${tipo}`}>
      <div className="an-riesgo-icono">{icono}</div>
      <div>
        <p className="an-riesgo-titulo">{titulo}</p>
        <p className="an-riesgo-numero">{numero}</p>
        <p className="an-riesgo-desc">{descripcion}</p>
      </div>
      <Link to="/alertas" className="an-flecha">
        <ArrowRight size={16} />
      </Link>
    </div>
  );
}