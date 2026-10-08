import { Sparkles, ArrowUpRight, Minus, Check, ClipboardList, ArrowRight } from 'lucide-react';
import { patrones } from '../../data/analisis';

const iconos = {
  alto: <ArrowUpRight size={20} />,
  medio: <Minus size={20} />,
  bajo: <Check size={20} />,
};

export default function PatronesDetectados() {
  return (
    <section className="an-panel">
      <div className="an-head">
        <Sparkles size={22} />
        <h2>Nuevos patrones detectados</h2>
        <span className="an-badge">Hoy, 18:30</span>
      </div>

      <div className="an-patrones">
        {patrones.map((p) => (
          <div key={p.id} className={`an-patron ${p.tipo}`}>
            <div className="an-patron-icono">{iconos[p.tipo]}</div>
            <div>
              <h3>{p.titulo}</h3>
              <p>{p.descripcion}</p>
            </div>
          </div>
        ))}
      </div>

      <button className="an-btn-ancho">
        <ClipboardList size={16} />
        Ver detalles completos
        <ArrowRight size={16} />
      </button>
    </section>
  );
}