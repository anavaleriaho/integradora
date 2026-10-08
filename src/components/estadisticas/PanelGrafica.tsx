import type { ReactNode } from 'react';

interface Props {
  titulo: string;
  subtitulo?: string;
  children: ReactNode;
}

export default function PanelGrafica({ titulo, subtitulo, children }: Props) {
  return (
    <section className="es-panel">
      <h2>{titulo}</h2>
      {subtitulo && <p className="es-sub">{subtitulo}</p>}
      {children}
    </section>
  );
}