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

interface Props {
  datos: { dia: string; asistencia: number }[];
}

export default function RendimientoCarrera({ datos }: Props) {
  return (
    <PanelGrafica
      titulo="Asistencia semanal"
      subtitulo="Asistensia promedio por semana"
      vacio={datos.length === 0}
    >
      <ResponsiveContainer width="100%" height={240}>
        <AreaChart
          data={datos}
          margin={{ top: 24, right: 20, left: -10, bottom: 0 }}
        >
          <CartesianGrid stroke="#e5ecf5" />
          <XAxis dataKey="dia" tick={{ fontSize: 12 }} />
          <YAxis
            domain={[0, 100]}
            ticks={[0, 20, 40, 60, 80, 100]}
            tickFormatter={(v) => `${v}%`}
            tick={{ fontSize: 12 }}
          />
          <Area
            type="monotone"
            dataKey="asistencia"
            stroke="#2563EB"
            strokeWidth={2}
            fill="#dbe9fd"
            dot={{ r: 4, fill: '#2563EB' }}
          >
            <LabelList
              dataKey="asistencia"
              position="top"
              formatter={(v: unknown) => `${v}%`}
              style={{ fontSize: 12, fontWeight: 600, fill: '#0F2A5C' }}
            />
          </Area>
        </AreaChart>
      </ResponsiveContainer>
    </PanelGrafica>
  );
}