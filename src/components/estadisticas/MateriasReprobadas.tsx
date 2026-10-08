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
import { reprobadasPorMateria } from '../../data/estadisticas';

const valores = reprobadasPorMateria.map((m) => m.reprobadas);
const maximo = Math.max(...valores);
const minimo = Math.min(...valores);

const color = (v: number) =>
  v === maximo ? '#EF4444' : v === minimo ? '#22C55E' : '#F59E0B';

export default function MateriasReprobadas() {
  return (
    <PanelGrafica titulo="Materias reprobadas">
      <ResponsiveContainer width="100%" height={240}>
        <BarChart
          data={reprobadasPorMateria}
          layout="vertical"
          margin={{ top: 10, right: 30, left: 10, bottom: 0 }}
        >
          <CartesianGrid stroke="#e5ecf5" horizontal={false} />
          <XAxis
            type="number"
            domain={[0, 'dataMax + 1']}
            allowDecimals={false}
            tick={{ fontSize: 12 }}
          />
          <YAxis
            type="category"
            dataKey="materia"
            width={100}
            tick={{ fontSize: 12 }}
          />
          <Bar dataKey="reprobadas" radius={[0, 6, 6, 0]} maxBarSize={22}>
            {reprobadasPorMateria.map((m) => (
              <Cell key={m.materia} fill={color(m.reprobadas)} />
            ))}
            <LabelList
              dataKey="reprobadas"
              position="right"
              style={{ fontSize: 12, fontWeight: 600, fill: '#0F2A5C' }}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </PanelGrafica>
  );
}