import { useState } from 'react';
import {
  FileText,
  FileSpreadsheet,
  FileDown,
  Download,
  Check,
  TriangleAlert,
  ClipboardList,
} from 'lucide-react';
import Header from '../components/Header';
import { useAuth } from '../auth/useAuth';
import { construirReporte } from '../reportes/datosReporte';
import { exportarPDF } from '../reportes/exportarPDF';
import { exportarExcel } from '../reportes/exportarExcel';
import { exportarCSV } from '../reportes/exportarCSV';
import '../styles/reportes.css';

type Formato = 'pdf' | 'excel' | 'csv';

interface InfoFormato {
  clave: Formato;
  icono: typeof FileText;
  titulo: string;
  etiqueta: string;
  descripcion: string;
  boton: string;
  extension: string;
}

const formatos: InfoFormato[] = [
  {
    clave: 'pdf',
    icono: FileText,
    titulo: 'Reporte en PDF',
    etiqueta: 'Ideal para imprimir',
    descripcion:
      'Documento listo para imprimir y guardar como respaldo físico, con el resumen de los datos analizados y el listado de alumnos.',
    boton: 'Generar PDF',
    extension: 'pdf',
  },
  {
    clave: 'excel',
    icono: FileSpreadsheet,
    titulo: 'Hoja de cálculo (Excel)',
    etiqueta: 'Para revisar y editar',
    descripcion:
      'Archivo con dos hojas, una de resumen y otra con los alumnos, para revisar, ordenar o hacer cálculos sobre los datos.',
    boton: 'Generar Excel',
    extension: 'xlsx',
  },
  {
    clave: 'csv',
    icono: FileDown,
    titulo: 'Archivo CSV',
    etiqueta: 'Formato universal',
    descripcion:
      'Listado de alumnos en un formato simple que abre cualquier programa y que sirve para importar los datos a otros sistemas.',
    boton: 'Generar CSV',
    extension: 'csv',
  },
];

const incluye = [
  'Resumen general: total de alumnos, promedio, asistencia, materias reprobadas y tasa de aprobación.',
  'Distribución de alumnos por nivel de riesgo (alto, medio y bajo).',
  'Listado de alumnos con sus indicadores y su nivel de riesgo.',
  'Fecha de generación, persona responsable y fecha del último análisis.',
];

interface Mensaje {
  tipo: 'ok' | 'error';
  texto: string;
}

export default function Reportes() {
  const { usuario } = useAuth();
  const [generando, setGenerando] = useState<Formato | null>(null);
  const [mensaje, setMensaje] = useState<Mensaje | null>(null);

  const generar = async (formato: InfoFormato) => {
    setMensaje(null);
    setGenerando(formato.clave);

    try {
      await new Promise((resolver) => setTimeout(resolver, 400));
      const datos = construirReporte(usuario);

      if (formato.clave === 'pdf') exportarPDF(datos);
      else if (formato.clave === 'excel') exportarExcel(datos);
      else exportarCSV(datos);

      setMensaje({
        tipo: 'ok',
        texto: `Reporte generado: ${datos.nombreArchivo}.${formato.extension}`,
      });
    } catch {
      setMensaje({
        tipo: 'error',
        texto: 'No se pudo generar el reporte. Inténtalo de nuevo.',
      });
    } finally {
      setGenerando(null);
    }
  };

  return (
    <>
      <Header
        titulo="Reportes"
        subtitulo="Genera reportes de los datos analizados para tener un respaldo físico o digital."
      />

      <div className="pagina">
        {mensaje && (
          <div className={`rp-mensaje ${mensaje.tipo}`} role="status">
            {mensaje.tipo === 'ok' ? (
              <Check size={18} />
            ) : (
              <TriangleAlert size={18} />
            )}
            {mensaje.texto}
          </div>
        )}

        <section className="rp-formatos">
          {formatos.map((f) => {
            const Icono = f.icono;
            const ocupado = generando === f.clave;
            return (
              <article key={f.clave} className="rp-tarjeta">
                <div className={`rp-icono ${f.clave}`}>
                  <Icono size={32} />
                </div>
                <span className="rp-etiqueta">{f.etiqueta}</span>
                <h2>{f.titulo}</h2>
                <p>{f.descripcion}</p>
                <button
                  className="rp-btn"
                  onClick={() => generar(f)}
                  disabled={generando !== null}
                >
                  <Download size={18} />
                  {ocupado ? 'Generando...' : f.boton}
                </button>
              </article>
            );
          })}
        </section>

        <section className="rp-incluye">
          <h2>
            <ClipboardList size={20} />
            ¿Qué incluye el reporte?
          </h2>
          <ul className="rp-lista">
            {incluye.map((texto) => (
              <li key={texto}>
                <Check size={16} />
                {texto}
              </li>
            ))}
          </ul>
          <p className="rp-nota">
            El archivo CSV incluye únicamente el listado de alumnos.
          </p>
        </section>
      </div>
    </>
  );
}