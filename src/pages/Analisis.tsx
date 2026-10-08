import { Users, TriangleAlert, CircleAlert, CircleCheck } from 'lucide-react';
import Header from '../components/Header';
import ResumenCard from '../components/ResumenCard';
import TarjetaRiesgo from '../components/analisis/TarjetaRiesgo';
import ResumenDonut from '../components/analisis/ResumenDonut';
import EvolucionRiesgo from '../components/analisis/EvolucionRiesgo';
import PatronesDetectados from '../components/analisis/PatronesDetectados';
import { alumnos } from '../data/alumnos';
import { conteoRiesgo } from '../data/analisis';
import '../styles/analisis.css';

export default function Analisis() {
  return (
    <>
      <Header
        titulo="Análisis de Inteligencia Artificial"
        subtitulo="El modelo analiza los datos académicos y de comportamiento para detectar patrones de riesgo y generar alertas tempranas."
      />

      <div className="pagina">
        <section className="an-tarjetas">
          <ResumenCard
            tipo="info"
            icono={<Users size={30} />}
            numero={alumnos.length}
            titulo="Total de alumnos analizados"
            descripcion=""
          />
          <TarjetaRiesgo
            tipo="alto"
            icono={<TriangleAlert size={30} />}
            titulo="Alumnos en alto riesgo"
            numero={conteoRiesgo.alto}
            descripcion="Requieren atención inmediata"
          />
          <TarjetaRiesgo
            tipo="medio"
            icono={<CircleAlert size={30} />}
            titulo="Alumnos en riesgo medio"
            numero={conteoRiesgo.medio}
            descripcion="Seguimiento recomendado"
          />
          <TarjetaRiesgo
            tipo="bajo"
            icono={<CircleCheck size={30} />}
            titulo="Alumnos en bajo riesgo"
            numero={conteoRiesgo.bajo}
            descripcion="Sin riesgo significativo"
          />
        </section>

        <div className="an-layout">
          <div className="an-izq">
            <div className="an-fila">
              <ResumenDonut />
              <EvolucionRiesgo />
            </div>
          </div>

          <div className="an-der">
            <PatronesDetectados />
          </div>
        </div>
      </div>
    </>
  );
}