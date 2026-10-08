import type { ReactNode } from 'react';

interface Props {
  icono: ReactNode;
  titulo: string;
  descripcion?: string;
  children: ReactNode;
}

export default function PanelConfig({
  icono,
  titulo,
  descripcion,
  children,
}: Props) {
  return (
    <section className="cf-panel">
      <div className="cf-head">
        <span className="cf-head-icono">{icono}</span>
        <div>
          <h2>{titulo}</h2>
          {descripcion && <p>{descripcion}</p>}
        </div>
      </div>
      {children}
    </section>
  );
}