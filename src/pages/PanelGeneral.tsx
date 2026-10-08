import {
  GraduationCap,
  Brain,
  Gauge,
  ChartColumn,
  Bell,
  CalendarCheck,
  ShieldCheck,
  Target,
} from 'lucide-react';
import Header from '../components/Header';
import { modelo } from '../data/analisis';
import '../styles/panel.css';

const funciones = [
  {
    icono: Brain,
    titulo: 'Detección con IA',
    texto:
      'Analiza calificaciones, asistencias, materias reprobadas, entregas y semestre para encontrar patrones de riesgo.',
  },
  {
    icono: Gauge,
    titulo: 'Semáforo de riesgo',
    texto:
      'Clasifica a cada estudiante en riesgo alto, medio o bajo para priorizar la atención.',
  },
  {
    icono: ChartColumn,
    titulo: 'Gráficas y patrones',
    texto:
      'Muestra la evolución del riesgo y los patrones detectados en gráficas y reportes.',
  },
  {
    icono: Bell,
    titulo: 'Alertas visuales',
    texto:
      'Identifica de inmediato a los alumnos que requieren atención del personal docente.',
  },
  {
    icono: CalendarCheck,
    titulo: 'Análisis diario',
    texto:
      'El modelo se ejecuta todos los días para detectar a tiempo las primeras señales de riesgo.',
  },
  {
    icono: ShieldCheck,
    titulo: 'Privacidad y seguridad',
    texto:
      'Cuida la información de los estudiantes y limita el acceso al personal autorizado.',
  },
];

const semaforo = [
  {
    tipo: 'alto',
    titulo: 'Riesgo alto',
    texto: 'Requiere atención inmediata del personal.',
  },
  {
    tipo: 'medio',
    titulo: 'Riesgo medio',
    texto: 'Se recomienda dar seguimiento al estudiante.',
  },
  {
    tipo: 'bajo',
    titulo: 'Riesgo bajo',
    texto: 'Sin riesgo significativo por el momento.',
  },
];

export default function PanelGeneral() {
  return (
    <>
      <Header
        titulo="Panel General"
        subtitulo="Información general sobre la plataforma EduAlert."
      />

      <div className="pagina">
        <section className="pg-hero">
          <div className="pg-logo">
            <GraduationCap size={64} />
          </div>
          <div>
            <h2>EDUALERT</h2>
            <p className="pg-tagline">
              Sistema inteligente para la detección de riesgo académico
            </p>
            <p className="pg-desc">
              Plataforma web que utiliza inteligencia artificial para detectar
              diariamente a los estudiantes en riesgo de abandono, y ayudar al
              personal docente (tutores, psicólogos y trabajadores sociales) a
              intervenir a tiempo.
            </p>
          </div>
        </section>

        <section className="pg-ia">
          <div className="pg-ia-icono">
            <Brain size={32} />
          </div>
          <div className="pg-ia-texto">
            <h3>IA en acción</h3>
            <p>
              El modelo continúa analizando los datos en tiempo real para
              detectar patrones de riesgo y reducir falsos positivos mediante
              validación de información.
            </p>
          </div>
          <div className="pg-ia-precision">
            <Target size={30} />
            <div>
              <span>Precisión del modelo</span>
              <strong>{modelo.precision}%</strong>
              <small>en la detección de riesgo</small>
            </div>
          </div>
        </section>

        <h2 className="pg-titulo">¿Qué ofrece EduAlert?</h2>
        <section className="pg-funciones">
          {funciones.map((f) => {
            const Icono = f.icono;
            return (
              <article key={f.titulo} className="pg-funcion">
                <div className="pg-funcion-icono">
                  <Icono size={26} />
                </div>
                <h3>{f.titulo}</h3>
                <p>{f.texto}</p>
              </article>
            );
          })}
        </section>

        <h2 className="pg-titulo">Cómo leer el semáforo de riesgo</h2>
        <section className="pg-semaforo">
          {semaforo.map((s) => (
            <article key={s.tipo} className={`pg-luz-card ${s.tipo}`}>
              <span className="pg-luz" />
              <div>
                <h3>{s.titulo}</h3>
                <p>{s.texto}</p>
              </div>
            </article>
          ))}
        </section>
      </div>
    </>
  );
}