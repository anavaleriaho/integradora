import { useState } from 'react';
import { Brain, Info, Check } from 'lucide-react';
import PanelConfig from './PanelConfig';
import Interruptor from './Interruptor';

const valoresIniciales = {
  frecuencia: 'diario',
  hora: '18:30',
  umbralAlto: 70,
  umbralMedio: 50,
  validarFalsos: true,
};

export default function ParametrosModelo() {
  const [valores, setValores] = useState(valoresIniciales);
  const [guardado, setGuardado] = useState(false);

  const cambiar = (cambios: Partial<typeof valoresIniciales>) => {
    setValores({ ...valores, ...cambios });
    setGuardado(false);
  };

  const restablecer = () => {
    setValores(valoresIniciales);
    setGuardado(false);
  };

  return (
    <PanelConfig
      icono={<Brain size={20} />}
      titulo="Parámetros del modelo de IA"
      descripcion="Ajusta cuándo y cómo se detectan los alumnos en riesgo."
    >
      <div className="cf-campos">
        <div className="cf-campo">
          <label htmlFor="cf-frecuencia">Frecuencia de análisis</label>
          <select
            id="cf-frecuencia"
            value={valores.frecuencia}
            onChange={(e) => cambiar({ frecuencia: e.target.value })}
          >
            <option value="diario">Diario</option>
            <option value="12h">Cada 12 horas</option>
            <option value="semanal">Semanal</option>
          </select>
        </div>

        <div className="cf-campo">
          <label htmlFor="cf-hora">Hora del análisis</label>
          <input
            id="cf-hora"
            type="time"
            value={valores.hora}
            onChange={(e) => cambiar({ hora: e.target.value })}
          />
        </div>

        <div className="cf-campo ancho">
          <label htmlFor="cf-alto">Umbral de riesgo alto</label>
          <div className="cf-rango">
            <input
              id="cf-alto"
              type="range"
              min={valores.umbralMedio + 5}
              max={95}
              value={valores.umbralAlto}
              onChange={(e) => cambiar({ umbralAlto: Number(e.target.value) })}
            />
            <strong>{valores.umbralAlto}%</strong>
          </div>
        </div>

        <div className="cf-campo ancho">
          <label htmlFor="cf-medio">Umbral de riesgo medio</label>
          <div className="cf-rango">
            <input
              id="cf-medio"
              type="range"
              min={10}
              max={valores.umbralAlto - 5}
              value={valores.umbralMedio}
              onChange={(e) => cambiar({ umbralMedio: Number(e.target.value) })}
            />
            <strong>{valores.umbralMedio}%</strong>
          </div>
          <small>
            Bajo: menos de {valores.umbralMedio}% · Medio: de {valores.umbralMedio}%
            a {valores.umbralAlto - 1}% · Alto: {valores.umbralAlto}% o más
          </small>
        </div>
      </div>

      <div className="cf-fila">
        <div className="cf-fila-texto">
          <strong>Validar falsos positivos</strong>
          <span>
            El modelo valida la información para reducir alertas incorrectas.
          </span>
        </div>
        <Interruptor
          etiqueta="Validar falsos positivos"
          activo={valores.validarFalsos}
          onChange={(v) => cambiar({ validarFalsos: v })}
        />
      </div>

      <div className="cf-acciones">
        <button className="cf-btn" onClick={() => setGuardado(true)}>
          Guardar cambios
        </button>
        <button className="cf-btn sec" onClick={restablecer}>
          Restablecer valores
        </button>
        {guardado && (
          <span className="cf-ok">
            <Check size={16} />
            Cambios guardados
          </span>
        )}
      </div>

      <div className="cf-nota">
        <Info size={18} />
        <p>
          Estos parámetros son de ejemplo. Se conectarán al modelo cuando su
          implementación esté definida, y por ahora los cambios solo se
          mantienen mientras la página esté abierta.
        </p>
      </div>
    </PanelConfig>
  );
}