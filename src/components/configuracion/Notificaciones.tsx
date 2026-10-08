import { useState } from 'react';
import { Bell } from 'lucide-react';
import PanelConfig from './PanelConfig';
import Interruptor from './Interruptor';

export default function Notificaciones() {
  const [alertasVisuales, setAlertasVisuales] = useState(true);
  const [resaltarAltos, setResaltarAltos] = useState(true);
  const [resumenCorreo, setResumenCorreo] = useState(false);

  return (
    <PanelConfig
      icono={<Bell size={20} />}
      titulo="Notificaciones"
      descripcion="Elige cómo quieres recibir los avisos."
    >
      <div>
        <div className="cf-fila">
          <div className="cf-fila-texto">
            <strong>Alertas visuales</strong>
            <span>Mostrar avisos dentro del sistema.</span>
          </div>
          <Interruptor
            etiqueta="Alertas visuales"
            activo={alertasVisuales}
            onChange={setAlertasVisuales}
          />
        </div>

        <div className="cf-fila">
          <div className="cf-fila-texto">
            <strong>Resaltar riesgo alto</strong>
            <span>Destacar a los alumnos que requieren atención inmediata.</span>
          </div>
          <Interruptor
            etiqueta="Resaltar riesgo alto"
            activo={resaltarAltos}
            onChange={setResaltarAltos}
          />
        </div>

        <div className="cf-fila">
          <div className="cf-fila-texto">
            <strong>Resumen diario por correo</strong>
            <span>Recibir un resumen después de cada análisis.</span>
          </div>
          <Interruptor
            etiqueta="Resumen diario por correo"
            activo={resumenCorreo}
            onChange={setResumenCorreo}
          />
        </div>
      </div>
    </PanelConfig>
  );
}