import { PieChart, Pie, Cell } from 'recharts';
import { conteoRiesgo } from '../../data/analisis';
import type { NivelRiesgo } from '../../types';

const filas: { clave: NivelRiesgo; nombre: string; color: string }[] = [
  { clave: 'alto', nombre: 'Riesgo alto', color: '#E05A5A' },
  { clave: 'medio', nombre: 'Riesgo medio', color: '#E8B04A' },
  { clave: 'bajo', nombre: 'Riesgo bajo', color: '#5DB86A' },
];

export default function ResumenDonut() {
  const total = conteoRiesgo.alto + conteoRiesgo.medio + conteoRiesgo.bajo;
  const datos = filas.map((f) => ({ ...f, valor: conteoRiesgo[f.clave] }));

  return (
    <section className="an-panel">
      <div className="an-head">
        <h2>Resumen del análisis</h2>
      </div>

      <div className="an-donut-fila">
        <div className="an-donut">
          <PieChart width={170} height={170}>
            <Pie
              data={datos}
              dataKey="valor"
              innerRadius={55}
              outerRadius={80}
              startAngle={90}
              endAngle={-270}
              stroke="none"
            >
              {datos.map((d) => (
                <Cell key={d.clave} fill={d.color} />
              ))}
            </Pie>
          </PieChart>
          <div className="an-donut-centro">
            <strong>{total}</strong>
            <span>alumnos analizados</span>
          </div>
        </div>

        <ul className="an-leyenda">
          {datos.map((d) => (
            <li key={d.clave}>
              <span className="an-punto" style={{ background: d.color }} />
              <span>{d.nombre}</span>
              <strong>{d.valor}</strong>
              <span className="pct">({Math.round((d.valor / total) * 100)}%)</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}