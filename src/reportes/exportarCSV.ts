import { aFilas, encabezadosAlumnos } from './datosReporte';
import type { DatosReporte } from './datosReporte';

const celda = (valor: string | number) => {
  const texto = String(valor);
  return /[",\n]/.test(texto) ? `"${texto.replace(/"/g, '""')}"` : texto;
};

export function exportarCSV(d: DatosReporte) {
  const contenido = [encabezadosAlumnos, ...aFilas(d)]
    .map((fila) => fila.map(celda).join(','))
    .join('\r\n');

  const blob = new Blob(['\uFEFF' + contenido], {
    type: 'text/csv;charset=utf-8;',
  });
  const url = URL.createObjectURL(blob);
  const enlace = document.createElement('a');
  enlace.href = url;
  enlace.download = `${d.nombreArchivo}.csv`;
  enlace.click();
  URL.revokeObjectURL(url);
}