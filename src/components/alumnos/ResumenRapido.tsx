import { Link } from 'react-router-dom';
import { Lightbulb, ArrowRight } from 'lucide-react';

interface Props {
  altos: number;
}

export default function ResumenRapido({ altos }: Props) {
  const texto = altos === 1 ? '1 alumno presenta' : `${altos} alumnos presentan`;

  return (
    <section className="al-panel">
      <div className="al-panel-head">
        <span className="al-bombilla">
          <Lightbulb size={20} />
        </span>
        <h2>Resumen rápido</h2>
      </div>

      <p className="al-resumen-texto">
        <strong>{texto}</strong> un nivel de riesgo alto. Se recomienda revisar
        su historial académico y contactar a los tutores.
      </p>

      <Link to="/alertas" className="al-btn-ancho">
        <ArrowRight size={16} />
        Ver alertas
      </Link>
    </section>
  );
}