import { useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { Bell, Calendar } from 'lucide-react';

interface Props {
  titulo: string;
  subtitulo: string;
  icono?: ReactNode;
}

const meses = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
];

function formatearFecha(d: Date) {
  return `${d.getDate()} de ${meses[d.getMonth()]}, ${d.getFullYear()}`;
}

function formatearHora(d: Date) {
  const horas = String(d.getHours()).padStart(2, '0');
  const minutos = String(d.getMinutes()).padStart(2, '0');
  return `${horas}:${minutos}`;
}

export default function Header({ titulo, subtitulo, icono }: Props) {
  const [ahora, setAhora] = useState(new Date());

  useEffect(() => {
    const intervalo = setInterval(() => setAhora(new Date()), 30000);
    return () => clearInterval(intervalo);
  }, []);

  return (
    <header className="header">
      <div className="header-titulo">
        {icono && <div className="header-icono">{icono}</div>}
        <div>
          <h1>{titulo}</h1>
          <p>{subtitulo}</p>
        </div>
      </div>

      <div className="header-derecha">
        <div className="campana">
          <Bell size={24} />
        </div>

        <div className="ia-estado">
          <span className="punto-verde" />
          IA activa
        </div>

        <div className="fecha">
          <Calendar size={24} />
          <div>
            <div>{formatearFecha(ahora)}</div>
            <div>{formatearHora(ahora)}</div>
          </div>
        </div>
      </div>
    </header>
  );
}