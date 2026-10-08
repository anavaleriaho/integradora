import { CircleAlert, CircleCheck, Users, GraduationCap, FileText, ArrowRight } from 'lucide-react';
import type { Alumno } from '../types';

const etiquetas = {
  alto: 'Riesgo alto',
  medio: 'Riesgo medio',
  bajo: 'Riesgo bajo',
};

interface Props {
  alumno: Alumno;
}

export default function AlumnoCard({ alumno }: Props) {
  const palabras = alumno.nombre.split(' ');
  const iniciales = palabras[0][0] + palabras[1][0];
  const Icono = alumno.riesgo === 'bajo' ? CircleCheck : CircleAlert;

  return (
    <article className={`alumno-card ${alumno.riesgo}`}>
      <div className="alumno-datos">
        <div className="alumno-avatar">{iniciales}</div>
        <div>
          <h3>{alumno.nombre}</h3>
          <p>Matrícula: {alumno.matricula}</p>
          <p>{alumno.carrera}</p>
          <p>Semestre: {alumno.semestre}°</p>
        </div>
      </div>

      <div className="alumno-riesgo">
        <span className="etiqueta">
          <Icono size={16} />
          {etiquetas[alumno.riesgo]}
        </span>
        <strong>{alumno.probabilidad}%</strong>
        <small>Probabilidad de riesgo</small>
      </div>

      <div className="alumno-factores">
        <h4>Factores detectados</h4>
        <ul>
          {alumno.factores.map((factor) => (
            <li key={factor}>{factor}</li>
          ))}
        </ul>
      </div>

      <div className="alumno-metricas">
        <div>
          <Users size={16} /> <span>Asistencia</span>
          <strong>{alumno.asistencia}%</strong>
        </div>
        <div>
          <GraduationCap size={16} /> <span>Promedio</span>
          <strong>{alumno.promedio}</strong>
        </div>
        <div>
          <FileText size={16} /> <span>Reprobadas</span>
          <strong>{alumno.reprobadas}</strong>
        </div>
      </div>

      <button className="btn-detalles">
        Ver detalles <ArrowRight size={16} />
      </button>
    </article>
  );
}