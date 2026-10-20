import { GraduationCap, Percent, CircleAlert } from 'lucide-react';
import Header from '../components/Header';
import { useAuth } from '../auth/useAuth';
import { buscarAlumno } from '../data/usuario';
import type { NivelRiesgo } from '../types';
import '../styles/alumno.css';

const contenido: Record<
  NivelRiesgo,
  { etiqueta: string; titulo: string; texto: string; consejos: string[] }
> = {
  bajo: {
    etiqueta: 'Verde',
    titulo: '¡Vas muy bien!',
    texto:
      'Tus indicadores están en buen camino. Sigue con tu constancia y tu esfuerzo.',
    consejos: [
      'Mantén tu asistencia y entrega tus trabajos a tiempo.',
      'Si tienes dudas en alguna materia, resuélvelas pronto con tu docente.',
      'Ayuda a un compañero: explicar lo que sabes también te ayuda a aprender.',
    ],
  },
  medio: {
    etiqueta: 'Amarillo',
    titulo: 'Hay algunos puntos que cuidar',
    texto:
      'Vamos a darte seguimiento. Con un poco de apoyo puedes mejorar tus resultados.',
    consejos: [
      'Platica con tu tutor para revisar cómo mejorar tu asistencia y tus calificaciones.',
      'Organiza un calendario con las entregas de tus materias.',
      'Pide asesoría en las materias que más se te dificulten.',
    ],
  },
  alto: {
    etiqueta: 'Rojo',
    titulo: 'Queremos apoyarte',
    texto:
      'Notamos que podrías necesitar ayuda en este momento. No tienes que resolverlo solo: hay personas listas para acompañarte.',
    consejos: [
      'Acércate con tu tutor o con el área de trabajo social lo antes posible.',
      'Cuéntales cómo te sientes y qué dificultades has tenido.',
      'Revisa con ellos un plan para ponerte al corriente en tus materias.',
    ],
  },
};

const orden: NivelRiesgo[] = ['alto', 'medio', 'bajo'];

export default function MiSemaforo() {
  const { usuario } = useAuth();
  const alumno = usuario?.matricula ? buscarAlumno(usuario.matricula) : undefined;

  if (!alumno) {
    return (
      <>
        <Header
          titulo="Mi semáforo"
          subtitulo="Consulta cómo vas en tus estudios."
        />
        <div className="pagina">
          <p className="ms-vacio">
            No pudimos encontrar tus datos. Cierra sesión e inicia de nuevo.
          </p>
        </div>
      </>
    );
  }

  const info = contenido[alumno.riesgo];
  const palabras = alumno.nombre.split(' ');
  const iniciales = palabras
    .slice(0, 2)
    .map((p) => p[0])
    .join('')
    .toUpperCase();

  return (
    <>
      <Header
        titulo="Mi semáforo"
        subtitulo="Consulta cómo vas en tus estudios y qué puedes hacer para seguir adelante."
      />

      <div className="pagina">
        <section className="ms-saludo">
          <div className="ms-avatar">{iniciales}</div>
          <div>
            <h2>Hola, {palabras[0]}</h2>
            <p>{alumno.carrera}</p>
            <p>
              Matrícula {alumno.matricula} · Cuatrimestre {alumno.semestre}°
            </p>
          </div>
        </section>

        <div className="ms-fila">
          <section className={`ms-semaforo ${alumno.riesgo}`}>
            <div className="ms-luces" aria-hidden="true">
              {orden.map((n) => (
                <span
                  key={n}
                  className={`ms-luz ${n} ${alumno.riesgo === n ? 'encendida' : ''}`}
                />
              ))}
            </div>
            <div>
              <p className="ms-nivel">Nivel {info.etiqueta}</p>
              <h2>{info.titulo}</h2>
              <p className="ms-texto">{info.texto}</p>
            </div>
          </section>

          <section className="ms-panel">
            <h3>Mis indicadores</h3>
            <ul className="ms-indicadores">
              <li>
                <span className="ms-ind-icono">
                  <GraduationCap size={22} />
                </span>
                <span>Promedio</span>
                <strong>{alumno.promedio.toFixed(1)}</strong>
              </li>
              <li>
                <span className="ms-ind-icono">
                  <Percent size={22} />
                </span>
                <span>Asistencia</span>
                <strong>{alumno.asistencia}%</strong>
              </li>
              <li>
                <span className="ms-ind-icono">
                  <CircleAlert size={22} />
                </span>
                <span>Materias reprobadas</span>
                <strong>{alumno.reprobadas}</strong>
              </li>
            </ul>
          </section>
        </div>

        <div className="ms-fila dos">
          <section className="ms-panel">
            <h3>Lo que notamos en tu seguimiento</h3>
            <ul className={`ms-lista ${alumno.riesgo}`}>
              {alumno.factores.map((factor) => (
                <li key={factor}>{factor}</li>
              ))}
            </ul>
          </section>

          <section className="ms-panel">
            <h3>Qué puedes hacer</h3>
            <ul className="ms-lista">
              {info.consejos.map((consejo) => (
                <li key={consejo}>{consejo}</li>
              ))}
            </ul>
          </section>
        </div>
      </div>
    </>
  );
}