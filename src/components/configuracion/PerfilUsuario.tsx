import { useState } from 'react';
import { User, Check } from 'lucide-react';
import PanelConfig from './PanelConfig';
import { useAuth } from '../../auth/useAuth';

export default function PerfilUsuario() {
const { usuario } = useAuth();
const [nombre, setNombre] = useState(usuario?.nombre ?? '');
const [cargo, setCargo] = useState(usuario?.cargo ?? '');
const [correo, setCorreo] = useState(usuario?.correo ?? '');
  const [guardado, setGuardado] = useState(false);

  const cambiar = (poner: (v: string) => void, valor: string) => {
    poner(valor);
    setGuardado(false);
  };

  return (
    <PanelConfig
      icono={<User size={20} />}
      titulo="Perfil de usuario"
      descripcion="Datos de la persona que usa el sistema."
    >
      <div className="cf-campos">
        <div className="cf-campo">
          <label htmlFor="cf-nombre">Nombre</label>
          <input
            id="cf-nombre"
            type="text"
            value={nombre}
            onChange={(e) => cambiar(setNombre, e.target.value)}
          />
        </div>

        <div className="cf-campo">
          <label htmlFor="cf-cargo">Cargo</label>
          <input
            id="cf-cargo"
            type="text"
            value={cargo}
            onChange={(e) => cambiar(setCargo, e.target.value)}
          />
        </div>

        <div className="cf-campo ancho">
          <label htmlFor="cf-correo">Correo electrónico</label>
          <input
            id="cf-correo"
            type="email"
            placeholder="correo@institucion.edu"
            value={correo}
            onChange={(e) => cambiar(setCorreo, e.target.value)}
          />
        </div>
      </div>

      <div className="cf-acciones">
        <button className="cf-btn" onClick={() => setGuardado(true)}>
          Guardar cambios
        </button>
        {guardado && (
          <span className="cf-ok">
            <Check size={16} />
            Cambios guardados
          </span>
        )}
      </div>
    </PanelConfig>
  );
}