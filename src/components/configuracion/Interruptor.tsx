interface Props {
  activo: boolean;
  onChange: (valor: boolean) => void;
  etiqueta: string;
}

export default function Interruptor({ activo, onChange, etiqueta }: Props) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={activo}
      aria-label={etiqueta}
      className={`cf-switch ${activo ? 'activo' : ''}`}
      onClick={() => onChange(!activo)}
    >
      <span />
    </button>
  );
}