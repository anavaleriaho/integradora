import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, KeyRound, LogOut } from 'lucide-react';
import PanelConfig from './PanelConfig';
import { useAuth } from '../../auth/useAuth';

export default function CuentaSeguridad() {
  const navigate = useNavigate();
  const [confirmando, setConfirmando] = useState(false);

const { cerrarSesion: salir } = useAuth();

const cerrarSesion = () => {
  salir();
  navigate('/login', { replace: true });
};

  return (
    <PanelConfig
      icono={<ShieldCheck size={20} />}
      titulo="Cuenta y seguridad"
      descripcion="Protege el acceso a la información de los estudiantes."
    >
      <div className="cf-fila">
        <div className="cf-fila-texto">
          <strong>Contraseña</strong>
          <span>Cámbiala periódicamente para mantener tu cuenta segura.</span>
        </div>
        <button className="cf-btn sec">
          <KeyRound size={16} />
          Cambiar
        </button>
      </div>

      <div className="cf-fila">
        <div className="cf-fila-texto">
          <strong>Cerrar sesión</strong>
          <span>Saldrás del sistema en este dispositivo.</span>
        </div>
        {!confirmando && (
          <button className="cf-btn peligro" onClick={() => setConfirmando(true)}>
            <LogOut size={16} />
            Cerrar sesión
          </button>
        )}
      </div>

      {confirmando && (
        <div className="cf-confirmar">
          <p>¿Seguro que quieres cerrar sesión?</p>
          <div className="cf-acciones" style={{ marginTop: 0 }}>
            <button className="cf-btn peligro-fuerte" onClick={cerrarSesion}>
              Sí, cerrar sesión
            </button>
            <button className="cf-btn sec" onClick={() => setConfirmando(false)}>
              Cancelar
            </button>
          </div>
        </div>
      )}
    </PanelConfig>
  );
}