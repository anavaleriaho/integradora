import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { evolucion } from '../../data/analisis';

export default function EvolucionRiesgo() {
  return (
    <section className="an-panel">
      <div className="an-head">
        <h2>
          Evolución del riesgo <small>(últimos 7 días)</small>
        </h2>
      </div>

      <ResponsiveContainer width="100%" height={230}>
        <LineChart data={evolucion} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid stroke="#e5ecf5" />
          <XAxis dataKey="dia" tick={{ fontSize: 12 }} />
          <YAxis domain={[0, 5]} ticks={[0, 1, 2, 3, 4, 5]} allowDecimals={false} tick={{ fontSize: 12 }} />
          <Tooltip />
          <Legend iconType="circle" verticalAlign="bottom" />
          <Line type="monotone" dataKey="alto" name="Alto" stroke="#E05A5A" strokeWidth={2} dot={{ r: 3 }} />
          <Line type="monotone" dataKey="medio" name="Medio" stroke="#E8B04A" strokeWidth={2} dot={{ r: 3 }} />
          <Line type="monotone" dataKey="bajo" name="Bajo" stroke="#5DB86A" strokeWidth={2} dot={{ r: 3 }} />
        </LineChart>
      </ResponsiveContainer>
    </section>
  );
}