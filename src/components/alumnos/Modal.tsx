import { useEffect } from 'react';
import type { ReactNode } from 'react';
import { X } from 'lucide-react';

interface Props {
  titulo: string;
  subtitulo?: string;
  icono: ReactNode;
  tono?: 'azul' | 'rojo' | 'verde';
  onCerrar: () => void;
  children: ReactNode;
  pie?: ReactNode;
}

export default function Modal({
  titulo,
  subtitulo,
  icono,
  tono = 'azul',
  onCerrar,
  children,
  pie,
}: Props) {
  useEffect(() => {
    const alPresionar = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCerrar();
    };
    window.addEventListener('keydown', alPresionar);
    return () => window.removeEventListener('keydown', alPresionar);
  }, [onCerrar]);

  // Evita que la página de fondo se desplace mientras la ventana está abierta
  useEffect(() => {
    const anterior = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = anterior;
    };
  }, []);

  return (
    <div className="al-modal-fondo" onClick={onCerrar}>
      <div
        className="al-modal"
        role="dialog"
        aria-modal="true"
        aria-label={titulo}
        onClick={(e) => e.stopPropagation()}
      >
        <header className="al-modal-cabecera">
          <div className={`al-modal-icono ${tono}`}>{icono}</div>
          <div className="al-modal-titulos">
            <h2>{titulo}</h2>
            {subtitulo && <p>{subtitulo}</p>}
          </div>
          <button
            type="button"
            className="al-modal-cerrar"
            onClick={onCerrar}
            aria-label="Cerrar"
          >
            <X size={20} />
          </button>
        </header>

        <div className="al-modal-cuerpo">{children}</div>

        {pie && <footer className="al-modal-pie">{pie}</footer>}
      </div>
    </div>
  );
}