import { useState } from 'react';
import type { FormEvent } from 'react';
import { Navigate } from 'react-router-dom';
import {
  GraduationCap,
  Mail,
  Lock,
  Eye,
  EyeOff,
  TriangleAlert,
  Brain,
  Gauge,
  ShieldCheck,
} from 'lucide-react';
import { useAuth } from '../auth/useAuth';
import { correoEjemplo, contrasenaEjemplo } from '../data/usuario';
import '../styles/login.css';

const puntos = [
  { icono: Brain, texto: 'Detección temprana con inteligencia artificial' },
  { icono: Gauge, texto: 'Semáforo de riesgo para priorizar la atención' },
  { icono: ShieldCheck, texto: 'Acceso exclusivo para personal docente' },
];

export default function Login() {
  const { usuario, iniciarSesion } = useAuth();
  const [correo, setCorreo] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [mostrar, setMostrar] = useState(false);
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);

  // Si ya hay sesión iniciada, no tiene sentido ver el login
  if (usuario) {
    return <Navigate to="/panel" replace />;
  }

  const enviar = (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (!correo.trim() || !contrasena) {
      setError('Escribe tu correo y tu contraseña.');
      return;
    }

    setCargando(true);
    setTimeout(() => {
      const correcto = iniciarSesion(correo, contrasena);
      if (!correcto) {
        setError('Correo o contraseña incorrectos.');
        setCargando(false);
      }
    }, 700);
  };

  const usarEjemplo = () => {
    setCorreo(correoEjemplo);
    setContrasena(contrasenaEjemplo);
    setError('');
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
          <h2>Iniciar sesión</h2>
          <p className="lg-sub">
            Ingresa con tu cuenta para consultar el estado de los estudiantes.
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
              aria-label={mostrar ? 'Ocultar contraseña' : 'Mostrar contraseña'}
            >
              {mostrar ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          {error && (
            <div className="lg-error" role="alert">
              <TriangleAlert size={16} />
              {error}
            </div>
          )}

          <button type="submit" className="lg-btn" disabled={cargando}>
            {cargando ? 'Ingresando...' : 'Iniciar sesión'}
          </button>

          <div className="lg-demo">
            <p>
              <strong>Datos de ejemplo</strong>
            </p>
            <p>Correo: {correoEjemplo}</p>
            <p>Contraseña: {contrasenaEjemplo}</p>
            <button type="button" onClick={usarEjemplo}>
              Usar datos de ejemplo
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}