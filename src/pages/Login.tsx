import { useState } from 'react';
import type { FormEvent } from 'react';
import { Navigate } from 'react-router-dom';
import {
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
import logo from "../assets/images/logo-proedu.png";
import { useAuth } from '../auth/useAuth';
import {
  LARGO_MINIMO,
  crearClave,
  tieneClave,
  verificarClave,
} from '../auth/clavesAlumno';
import { correoEjemplo, contrasenaEjemplo, buscarAlumno } from '../data/usuario';
import { alumnos } from '../data/alumnos';
import '../styles/login.css';

type Modo = 'personal' | 'alumno';

// Pasos del acceso de alumnos:
//  matricula → solo escribe su matrícula
//  crear     → primer acceso: crea su clave
//  clave     → ya tiene clave: la escribe para entrar
type Paso = 'matricula' | 'crear' | 'clave';

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
  const [paso, setPaso] = useState<Paso>('matricula');
  const [clave, setClave] = useState('');
  const [confirmar, setConfirmar] = useState('');
  const [nombreAlumno, setNombreAlumno] = useState('');
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

  const reiniciarAlumno = () => {
    setPaso('matricula');
    setClave('');
    setConfirmar('');
    setError('');
  };

  const cambiarModo = (nuevo: Modo) => {
    setModo(nuevo);
    reiniciarAlumno();
  };

  const fallar = (texto: string) => {
    setError(texto);
    setCargando(false);
  };

  const enviarAlumno = async () => {
    // 1. Solo la matrícula: se decide si es primer acceso o ya tiene clave
    if (paso === 'matricula') {
      if (!matricula.trim()) {
        setError('Escribe tu matrícula.');
        return;
      }
      const alumno = buscarAlumno(matricula);
      if (!alumno) {
        setError(
          'No encontramos esa matrícula. Revisa que esté escrita correctamente.'
        );
        return;
      }
      setNombreAlumno(alumno.nombre.split(' ')[0]);
      setPaso(tieneClave(alumno.matricula) ? 'clave' : 'crear');
      return;
    }

    const alumno = buscarAlumno(matricula);
    if (!alumno) {
      reiniciarAlumno();
      return;
    }

    setCargando(true);

    // 2. Primer acceso: crea su clave y entra
    if (paso === 'crear') {
      if (clave.length < LARGO_MINIMO) {
        fallar(`La clave debe tener al menos ${LARGO_MINIMO} caracteres.`);
        return;
      }
      if (clave !== confirmar) {
        fallar('Las claves no coinciden.');
        return;
      }
      if (!(await crearClave(alumno.matricula, clave))) {
        fallar('No se pudo guardar tu clave en este navegador. Inténtalo de nuevo.');
        return;
      }
      iniciarSesionAlumno(alumno.matricula);
      return;
    }

    // 3. Ya tiene clave: la revisa y entra
    if (!clave) {
      fallar('Escribe tu clave.');
      return;
    }
    const resultado = await verificarClave(alumno.matricula, clave);
    if (resultado.ok) {
      iniciarSesionAlumno(alumno.matricula);
    } else if (resultado.motivo === 'incorrecta') {
      fallar(
        `Clave incorrecta. Te ${
          resultado.restantes === 1 ? 'queda 1 intento' : `quedan ${resultado.restantes} intentos`
        }.`
      );
    } else if (resultado.motivo === 'bloqueada') {
      fallar(
        `Demasiados intentos. Vuelve a intentarlo en ${resultado.segundos} segundos.`
      );
    } else {
      fallar('No se pudo verificar tu clave. Inténtalo de nuevo.');
    }
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
      void enviarAlumno();
    }
  };

  const textoBoton = () => {
    if (modo === 'personal') return cargando ? 'Ingresando...' : 'Iniciar sesión';
    if (paso === 'matricula') return 'Continuar';
    if (paso === 'crear') return cargando ? 'Guardando...' : 'Guardar clave y entrar';
    return cargando ? 'Ingresando...' : 'Ver mi semáforo';
  };

  const botonOjo = (
    <button
      type="button"
      className="lg-ojo"
      onClick={() => setMostrar(!mostrar)}
      aria-label={mostrar ? 'Ocultar clave' : 'Mostrar clave'}
    >
      {mostrar ? <EyeOff size={18} /> : <Eye size={18} />}
    </button>
  );

  return (
    <div className="lg-pagina">
      <section className="lg-marca">
        <span className="lg-circulo c1" />
        <span className="lg-circulo c2" />
        <span className="lg-circulo c3" />

        <div className="lg-marca-contenido">
          <div className="lg-logo">
            <img src={logo} alt="Logo" />
          </div>
          <p>Detección temprana para un futuro seguro </p>
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
                {botonOjo}
              </div>
            </>
          ) : paso === 'matricula' ? (
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
          ) : (
            <>
              <h2>{paso === 'crear' ? 'Crea tu clave' : 'Ingresa tu clave'}</h2>
              <p className="lg-sub">
                {paso === 'crear'
                  ? `Hola, ${nombreAlumno}. Es tu primer acceso: crea una clave. La próxima vez entrarás con tu matrícula y esta clave.`
                  : `Hola de nuevo, ${nombreAlumno}. Escribe la clave que creaste en tu primer acceso.`}
              </p>

              <div className="lg-identidad">
                <span>
                  Matrícula: <strong>{matricula.trim()}</strong>
                </span>
                <button type="button" onClick={reiniciarAlumno} disabled={cargando}>
                  Cambiar
                </button>
              </div>

              <label className="lg-etiqueta" htmlFor="lg-clave">
                {paso === 'crear' ? 'Crea tu clave' : 'Clave'}
              </label>
              <div className="lg-campo">
                <Lock size={18} />
                <input
                  id="lg-clave"
                  type={mostrar ? 'text' : 'password'}
                  placeholder={
                    paso === 'crear' ? `Mínimo ${LARGO_MINIMO} caracteres` : 'Tu clave'
                  }
                  autoComplete={paso === 'crear' ? 'new-password' : 'current-password'}
                  value={clave}
                  onChange={(e) => setClave(e.target.value)}
                  autoFocus
                />
                {botonOjo}
              </div>

              {paso === 'crear' && (
                <>
                  <label className="lg-etiqueta" htmlFor="lg-confirmar">
                    Confirma tu clave
                  </label>
                  <div className="lg-campo">
                    <Lock size={18} />
                    <input
                      id="lg-confirmar"
                      type={mostrar ? 'text' : 'password'}
                      placeholder="Escríbela otra vez"
                      autoComplete="new-password"
                      value={confirmar}
                      onChange={(e) => setConfirmar(e.target.value)}
                    />
                  </div>
                  <p className="lg-ayuda">
                    Guárdala bien: la necesitarás cada vez que entres.
                  </p>
                </>
              )}
            </>
          )}

          {error && (
            <div className="lg-error" role="alert">
              <TriangleAlert size={16} />
              {error}
            </div>
          )}

          <button type="submit" className="lg-btn" disabled={cargando}>
            {textoBoton()}
          </button>

          {(modo === 'personal' || paso === 'matricula') && (
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
                    <strong>Matrículas de ejemplo</strong> (toca una para usarla).
                    La primera vez te pediremos crear una clave.
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
          )}
        </form>
      </section>
    </div>
  );
}