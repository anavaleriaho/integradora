import {
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  LabelList,
} from 'recharts';
import PanelGrafica from './PanelGrafica';
import { promedioPorCarrera } from '../../data/estadisticas';

const colores = ['#3B82F6', '#8B5CF6', '#22C55E', '#F59E0B', '#EF4444'];

export default function RendimientoCarrera() {
  return (
    <PanelGrafica titulo="Rendimiento por carrera" subtitulo="Promedio por carrera">
      <ResponsiveContainer width="100%" height={240}>
        <BarChart
          data={promedioPorCarrera}
          margin={{ top: 24, right: 10, left: -20, bottom: 0 }}
        >
          <CartesianGrid stroke="#e5ecf5" vertical={false} />
          <XAxis dataKey="carrera" interval={0} tick={{ fontSize: 11 }} />
          <YAxis
            domain={[0, 10]}
            ticks={[0, 2, 4, 6, 8, 10]}
            tick={{ fontSize: 12 }}
          />
          <Bar dataKey="promedio" radius={[6, 6, 0, 0]} maxBarSize={48}>
            {promedioPorCarrera.map((_, i) => (
              <Cell key={i} fill={colores[i % colores.length]} />
            ))}
            <LabelList
              dataKey="promedio"
              position="top"
              style={{ fontSize: 12, fontWeight: 600, fill: '#0F2A5C' }}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </PanelGrafica>
  );
}