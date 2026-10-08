import type { ReactNode } from 'react';

interface Props {
  tipo?: 'normal' | 'alerta';
  icono: ReactNode;
  titulo: string;
  valor: string | number;
  cambio?: string;
  cambioMalo?: boolean;
  descripcion: string;
}

export default function TarjetaIndicador({
  tipo = 'normal',
  icono,
  titulo,
  valor,
  cambio,
  cambioMalo = false,
  descripcion,
}: Props) {
  return (
    <div className={`es-indicador ${tipo}`}>
      <div className="es-ind-icono">{icono}</div>
      <div>
        <p className="es-ind-titulo">{titulo}</p>
        <p className="es-ind-valor">
          {valor}
          {cambio && (
            <span className={`es-cambio ${cambioMalo ? 'malo' : 'bueno'}`}>
              {cambio}
            </span>
          )}
        </p>
        <p className="es-ind-desc">{descripcion}</p>
      </div>
    </div>
  );
}