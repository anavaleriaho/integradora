import type { ReactNode } from 'react';

interface Props {
  titulo: string;
  subtitulo?: string;
  vacio?: boolean;
  children: ReactNode;
}

export default function PanelGrafica({
  titulo,
  subtitulo,
  vacio = false,
  children,
}: Props) {
  return (
    <section className="es-panel">
      <h2>{titulo}</h2>
      {subtitulo && <p className="es-sub">{subtitulo}</p>}
      {vacio ? (
        <p className="es-sin-datos">Sin datos para este filtro.</p>
      ) : (
        children
      )}
    </section>
  );
}