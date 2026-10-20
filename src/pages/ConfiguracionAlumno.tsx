import { User, Info } from 'lucide-react';
import Header from '../components/Header';
import PanelConfig from '../components/configuracion/PanelConfig';
import CuentaSeguridad from '../components/configuracion/CuentaSeguridad';
import { useAuth } from '../auth/useAuth';
import { buscarAlumno } from '../data/usuario';
import '../styles/configuracion.css';
import '../styles/alumno.css';

export default function ConfiguracionAlumno() {
  const { usuario } = useAuth();
  const alumno = usuario?.matricula ? buscarAlumno(usuario.matricula) : undefined;

  return (
    <>
      <Header
        titulo="Configuración"
        subtitulo="Consulta tus datos y administra tu sesión."
      />

      <div className="pagina">
        <div className="cf-layout">
          <div className="cf-col">
            <PanelConfig
              icono={<User size={20} />}
              titulo="Mis datos"
              descripcion="Información registrada en la universidad."
            >
              <div className="cf-campos">
                <div className="cf-campo ancho">
                  <label htmlFor="al-nombre">Nombre</label>
                  <input
                    id="al-nombre"
                    type="text"
                    readOnly
                    value={alumno?.nombre ?? ''}
                  />
                </div>

                <div className="cf-campo">
                  <label htmlFor="al-matricula">Matrícula</label>
                  <input
                    id="al-matricula"
                    type="text"
                    readOnly
                    value={alumno?.matricula ?? ''}
                  />
                </div>

                <div className="cf-campo">
                  <label htmlFor="al-cuatri">Cuatrimestre</label>
                  <input
                    id="al-cuatri"
                    type="text"
                    readOnly
                    value={alumno ? `${alumno.semestre}°` : ''}
                  />
                </div>

                <div className="cf-campo ancho">
                  <label htmlFor="al-carrera">Carrera</label>
                  <input
                    id="al-carrera"
                    type="text"
                    readOnly
                    value={alumno?.carrera ?? ''}
                  />
                </div>
              </div>

              <div className="cf-nota">
                <Info size={18} />
                <p>
                  Si algún dato no es correcto, acércate con tu tutor para que
                  lo corrijan.
                </p>
              </div>
            </PanelConfig>
          </div>

          <div className="cf-col">
            <CuentaSeguridad mostrarContrasena={false} />
          </div>
        </div>
      </div>
    </>
  );
}