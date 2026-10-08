import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  LabelList,
} from 'recharts';
import PanelGrafica from './PanelGrafica';
import { promedioPorSemestre } from '../../data/estadisticas';

export default function RendimientoSemestre() {
  return (
    <PanelGrafica titulo="Rendimiento académico" subtitulo="Promedio por semestre">
      <ResponsiveContainer width="100%" height={240}>
        <AreaChart
          data={promedioPorSemestre}
          margin={{ top: 24, right: 20, left: -20, bottom: 0 }}
        >
          <CartesianGrid stroke="#e5ecf5" />
          <XAxis dataKey="semestre" tick={{ fontSize: 12 }} />
          <YAxis
            domain={[4, 10]}
            ticks={[4, 5, 6, 7, 8, 9, 10]}
            tick={{ fontSize: 12 }}
          />
          <Area
            type="monotone"
            dataKey="promedio"
            stroke="#2563EB"
            strokeWidth={2}
            fill="#dbe9fd"
            dot={{ r: 4, fill: '#2563EB' }}
          >
            <LabelList
              dataKey="promedio"
              position="top"
              style={{ fontSize: 12, fontWeight: 600, fill: '#0F2A5C' }}
            />
          </Area>
        </AreaChart>
      </ResponsiveContainer>
    </PanelGrafica>
  );
}