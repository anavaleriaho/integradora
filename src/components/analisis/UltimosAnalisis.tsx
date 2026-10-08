import { Settings, ArrowRight } from 'lucide-react';
import { analisisRealizados } from '../../data/analisis';

export default function UltimosAnalisis() {
  return (
    <section className="an-panel">
      <div className="an-head">
        <Settings size={20} />
        <h2>Últimos análisis realizados</h2>
      </div>

      <table className="an-tabla">
        <thead>
          <tr>
            <th>Fecha y hora</th>
            <th>Tipo de análisis</th>
            <th>Resultados</th>
            <th>Estado</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {analisisRealizados.map((a) => (
            <tr key={a.id}>
              <td>{a.fecha}</td>
              <td>{a.tipo}</td>
              <td>
                {a.alto} alto / {a.medio} medio / {a.bajo} bajo
              </td>
              <td>
                <span className="an-estado-ok">
                  <span className="punto-verde" />
                  {a.estado}
                </span>
              </td>
              <td>
                <button className="an-fila-btn" aria-label="Ver análisis">
                  <ArrowRight size={16} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}