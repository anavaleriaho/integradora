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

interface Props {
  datos: { grupo: string; promedio: number; alumnos: number }[];
}

const colores = ['#3B82F6', '#8B5CF6', '#22C55E', '#F59E0B', '#EF4444'];

export default function RendimientoCarrera({ datos }: Props) {
  return (
    <PanelGrafica
      titulo="Rendimiento por grupo"
      subtitulo="Promedio por grupo"
      vacio={datos.length === 0}
    >
      <ResponsiveContainer
        width="100%"
        height={Math.max(180, datos.length * 60)}
      >
        <BarChart
          data={datos}
          layout="vertical"
          margin={{ top: 8, right: 40, left: 10, bottom: 0 }}
        >
          <CartesianGrid stroke="#e5ecf5" horizontal={false} />
          <XAxis
            type="number"
            domain={[0, 10]}
            ticks={[0, 2, 4, 6, 8, 10]}
            tick={{ fontSize: 12 }}
          />
          <YAxis
            type="category"
            dataKey="grupo"
            width={80}
            tick={{ fontSize: 12 }}
          />
          <Bar dataKey="promedio" radius={[0, 6, 6, 0]} maxBarSize={28}>
            {datos.map((_, i) => (
              <Cell key={i} fill={colores[i % colores.length]} />
            ))}
            <LabelList
              dataKey="promedio"
              position="right"
              style={{ fontSize: 12, fontWeight: 600, fill: '#0F2A5C' }}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </PanelGrafica>
  );
}