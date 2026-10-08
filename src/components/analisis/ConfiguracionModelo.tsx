import { Settings, Info } from 'lucide-react';
import { configuracionModelo } from '../../data/analisis';

export default function ConfiguracionModelo() {
  return (
    <section className="an-panel">
      <div className="an-head">
        <Settings size={20} />
        <h2>Configuración del modelo</h2>
      </div>

      <table className="an-config">
        <tbody>
          {configuracionModelo.map((fila) => (
            <tr key={fila.campo}>
              <td>{fila.campo}</td>
              <td>{fila.valor}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="an-nota">
        <Info size={18} />
        <p>
          El modelo está diseñado para detectar patrones de riesgo, no para
          predecir con certeza el abandono de un estudiante.
        </p>
      </div>
    </section>
  );
}