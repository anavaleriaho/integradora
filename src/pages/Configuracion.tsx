import Header from '../components/Header';
import PerfilUsuario from '../components/configuracion/PerfilUsuario';
import ParametrosModelo from '../components/configuracion/ParametrosModelo';
import Notificaciones from '../components/configuracion/Notificaciones';
import CuentaSeguridad from '../components/configuracion/CuentaSeguridad';
import ConfiguracionModelo from '../components/analisis/ConfiguracionModelo';
import '../styles/analisis.css';
import '../styles/configuracion.css';

export default function Configuracion() {
  return (
    <>
      <Header
        titulo="Configuración"
        subtitulo="Administra tu perfil, el modelo de IA y las preferencias del sistema."
      />

      <div className="pagina">
        <div className="cf-layout">
          <div className="cf-col">
            <PerfilUsuario />
            <ConfiguracionModelo />
            <ParametrosModelo />
          </div>

          <div className="cf-col">
            <Notificaciones />
            <CuentaSeguridad />
          </div>
        </div>
      </div>
    </>
  );
}