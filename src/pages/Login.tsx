import { useState } from 'react';
import type { FormEvent } from 'react';
import { Navigate } from 'react-router-dom';
import {
  GraduationCap,
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
  TriangleAlert,
  Brain,
  Gauge,
  ShieldCheck,
} from 'lucide-react';
import { useAuth } from '../auth/useAuth';
import { correoEjemplo, contrasenaEjemplo } from '../data/usuario';
import { alumnos } from '../data/alumnos';
import '../styles/login.css';

type Modo = 'personal' | 'alumno';

const puntos = [
  { icono: Brain, texto: 'Detección temprana con inteligencia artificial' },
  { icono: Gauge, texto: 'Semáforo de riesgo para priorizar la atención' },
  { icono: ShieldCheck, texto: 'Acceso para personal docente y para cada alumno' },
];

export default function Login() {
  const { usuario, iniciarSesion, iniciarSesionAlumno } = useAuth();
  const [modo, setModo] = useState<Modo>('personal');
  const [correo, setCorreo] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [matricula, setMatricula] = useState('');
  const [mostrar, setMostrar] = useState(false);
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);

  // Si ya hay sesión iniciada, cada quien va a su pantalla
  if (usuario) {
    return (
      <Navigate
        to={usuario.rol === 'alumno' ? '/mi-semaforo' : '/panel'}
        replace
      />
    );
  }

  const cambiarModo = (nuevo: Modo) => {
    setModo(nuevo);
    setError('');
  };

  const enviar = (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (modo === 'personal') {
      if (!correo.trim() || !contrasena) {
        setError('Escribe tu correo y tu contraseña.');
        return;
      }
      setCargando(true);
      setTimeout(() => {
        if (!iniciarSesion(correo, contrasena)) {
          setError('Correo o contraseña incorrectos.');
          setCargando(false);
        }
      }, 700);
    } else {
      if (!matricula.trim()) {
        setError('Escribe tu matrícula.');
        return;
      }
      setCargando(true);
      setTimeout(() => {
        if (!iniciarSesionAlumno(matricula)) {
          setError(
            'No encontramos esa matrícula. Revisa que esté escrita correctamente.'
          );
          setCargando(false);
        }
      }, 700);
    }
  };

  return (
    <div className="lg-pagina">
      <section className="lg-marca">
        <span className="lg-circulo c1" />
        <span className="lg-circulo c2" />
        <span className="lg-circulo c3" />

        <div className="lg-marca-contenido">
          <div className="lg-logo">
            <GraduationCap size={64} />
          </div>
          <h1>ProEdu</h1>
          <p className="lg-tagline">
            Sistema inteligente para la detección de riesgo académico
          </p>

          <ul className="lg-puntos">
            {puntos.map((p) => {
              const Icono = p.icono;
              return (
                <li key={p.texto}>
                  <Icono size={20} />
                  {p.texto}
                </li>
              );
            })}
          </ul>
        </div>
      </section>

      <section className="lg-zona">
        <form className="lg-tarjeta" onSubmit={enviar} noValidate>
          <div className="lg-tabs" role="tablist">
            <button
              type="button"
              role="tab"
              aria-selected={modo === 'personal'}
              className={`lg-tab ${modo === 'personal' ? 'activa' : ''}`}
              onClick={() => cambiarModo('personal')}
              disabled={cargando}
            >
              Personal docente
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={modo === 'alumno'}
              className={`lg-tab ${modo === 'alumno' ? 'activa' : ''}`}
              onClick={() => cambiarModo('alumno')}
              disabled={cargando}
            >
              Alumno
            </button>
          </div>

          {modo === 'personal' ? (
            <>
              <h2>Iniciar sesión</h2>
              <p className="lg-sub">
                Ingresa con tu cuenta para consultar el estado de los
                estudiantes.
              </p>

              <label className="lg-etiqueta" htmlFor="lg-correo">
                Correo electrónico
              </label>
              <div className="lg-campo">
                <Mail size={18} />
                <input
                  id="lg-correo"
                  type="email"
                  placeholder="correo@institucion.edu"
                  autoComplete="username"
                  value={correo}
                  onChange={(e) => setCorreo(e.target.value)}
                />
              </div>

              <label className="lg-etiqueta" htmlFor="lg-contrasena">
                Contraseña
              </label>
              <div className="lg-campo">
                <Lock size={18} />
                <input
                  id="lg-contrasena"
                  type={mostrar ? 'text' : 'password'}
                  placeholder="Tu contraseña"
                  autoComplete="current-password"
                  value={contrasena}
                  onChange={(e) => setContrasena(e.target.value)}
                />
                <button
                  type="button"
                  className="lg-ojo"
                  onClick={() => setMostrar(!mostrar)}
                  aria-label={
                    mostrar ? 'Ocultar contraseña' : 'Mostrar contraseña'
                  }
                >
                  {mostrar ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </>
          ) : (
            <>
              <h2>Consulta tu semáforo</h2>
              <p className="lg-sub">
                Ingresa con tu matrícula para ver cómo vas en tus estudios.
              </p>

              <label className="lg-etiqueta" htmlFor="lg-matricula">
                Matrícula
              </label>
              <div className="lg-campo">
                <User size={18} />
                <input
                  id="lg-matricula"
                  type="text"
                  placeholder="Ejemplo: 2025-00123"
                  autoComplete="off"
                  value={matricula}
                  onChange={(e) => setMatricula(e.target.value)}
                />
              </div>
            </>
          )}

          {error && (
            <div className="lg-error" role="alert">
              <TriangleAlert size={16} />
              {error}
            </div>
          )}

          <button type="submit" className="lg-btn" disabled={cargando}>
            {cargando
              ? 'Ingresando...'
              : modo === 'personal'
                ? 'Iniciar sesión'
                : 'Ver mi semáforo'}
          </button>

          <div className="lg-demo">
            {modo === 'personal' ? (
              <>
                <p>
                  <strong>Datos de ejemplo</strong>
                </p>
                <p>Correo: {correoEjemplo}</p>
                <p>Contraseña: {contrasenaEjemplo}</p>
                <button
                  type="button"
                  onClick={() => {
                    setCorreo(correoEjemplo);
                    setContrasena(contrasenaEjemplo);
                    setError('');
                  }}
                >
                  Usar datos de ejemplo
                </button>
              </>
            ) : (
              <>
                <p>
                  <strong>Matrículas de ejemplo</strong> (toca una para usarla)
                </p>
                <div className="lg-chips">
                  {alumnos.map((a) => (
                    <button
                      key={a.id}
                      type="button"
                      onClick={() => {
                        setMatricula(a.matricula);
                        setError('');
                      }}
                    >
                      {a.nombre.split(' ').slice(0, 2).join(' ')} ·{' '}
                      {a.matricula}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </form>
      </section>
    </div>
  );
}