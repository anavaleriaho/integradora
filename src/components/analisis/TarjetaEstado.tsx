import { Bot } from 'lucide-react';
import { modelo } from '../../data/analisis';

export default function TarjetaEstado() {
  return (
    <div className="an-card-estado">
      <div className="an-estado-icono">
        <Bot size={30} />
      </div>
      <div>
        <p className="an-label">Estado del modelo</p>
        <p className="an-estado-valor">
          <span className="punto-verde" />
          Activo
        </p>
        <p className="an-muted">Último análisis</p>
        <p className="an-fecha-ult">{modelo.ultimoAnalisis}</p>
      </div>
    </div>
  );
}