import {
  GraduationCap,
  Brain,
  Target,
  CalendarCheck,
  FileText,
  UserCheck,
} from 'lucide-react';
import Header from '../components/Header';
import { modelo } from '../data/analisis';
import '../styles/panel.css';

const pildoras = [
  { icono: CalendarCheck, texto: 'Análisis diario con IA', pronto: false },
  { icono: FileText, texto: 'Reportes en PDF, Excel y CSV', pronto: false },
  {
    icono: UserCheck,
    texto: 'Semáforo para el alumno con su matrícula',
    pronto: true,
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
        subtitulo="Información general sobre la plataforma ProEdu."
      />

      <div className="pagina">
        <section className="pg-hero">
          <div className="pg-logo">
            <GraduationCap size={64} />
          </div>
          <div>
            <h2>ProEdu</h2>
            <p className="pg-tagline">
              Sistema inteligente para la detección de riesgo académico
            </p>
            <p className="pg-desc">
              Plataforma web que utiliza inteligencia artificial para detectar
              diariamente a los estudiantes en riesgo de abandono, y ayudar al
              personal docente (tutores, psicólogos y trabajadores sociales) a
              intervenir a tiempo. Ademas permite generar reportes en PDF,
              Excel y CSV como respaldo de los datos analizados,
            </p>

            <div className="pg-pildoras">
              {pildoras.map((p) => {
                const Icono = p.icono;
                return (
                  <span
                    key={p.texto}
                    className={`pg-pildora ${p.pronto ? 'pronto' : ''}`}
                  >
                    <Icono size={16} />
                    {p.texto}
                    {p.pronto && <em>Próximamente</em>}
                  </span>
                );
              })}
            </div>
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