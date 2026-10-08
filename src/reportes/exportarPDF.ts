import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { encabezadosAlumnos } from './datosReporte';
import type { DatosReporte } from './datosReporte';

const AZUL: [number, number, number] = [17, 59, 122];

const colorRiesgo: Record<string, [number, number, number]> = {
  Alto: [220, 38, 38],
  Medio: [217, 154, 30],
  Bajo: [22, 163, 74],
};

export function exportarPDF(d: DatosReporte) {
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
  const ancho = doc.internal.pageSize.getWidth();
  const alto = doc.internal.pageSize.getHeight();
  const margen = 14;

  // ----- Banda de encabezado -----
  doc.setFillColor(AZUL[0], AZUL[1], AZUL[2]);
  doc.rect(0, 0, ancho, 26, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  doc.text('ProEdu', margen, 15);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text(
    'Sistema inteligente para la detección de riesgo académico',
    margen,
    21
  );
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text(d.titulo, ancho - margen, 15, { align: 'right' });

  // ----- Datos generales -----
  doc.setTextColor(30, 41, 59);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text(`Fecha de generación: ${d.generado}`, margen, 36);
  doc.text(`Generado por: ${d.responsable}`, margen, 42);
  doc.text(`Último análisis del modelo: ${d.ultimoAnalisis}`, margen, 48);

  // ----- Resumen y distribución de riesgo (lado a lado) -----
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(AZUL[0], AZUL[1], AZUL[2]);
  doc.text('Resumen general', margen, 58);
  doc.text('Distribución por nivel de riesgo', 150, 58);

  let yFinal = 61;
  const registrarY = (datos: { cursor: { y: number } | null }) => {
    if (datos.cursor) yFinal = Math.max(yFinal, datos.cursor.y);
  };

  autoTable(doc, {
    startY: 61,
    margin: { left: margen },
    tableWidth: 120,
    head: [['Indicador', 'Valor']],
    body: d.resumen,
    theme: 'grid',
    headStyles: { fillColor: AZUL },
    styles: { fontSize: 9 },
    didDrawPage: registrarY,
  });

  autoTable(doc, {
    startY: 61,
    margin: { left: 150 },
    tableWidth: 133,
    head: [['Nivel', 'Alumnos', 'Porcentaje']],
    body: d.riesgo,
    theme: 'grid',
    headStyles: { fillColor: AZUL },
    styles: { fontSize: 9 },
    didDrawPage: registrarY,
  });

  // ----- Listado de alumnos -----
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(AZUL[0], AZUL[1], AZUL[2]);
  doc.text('Listado de alumnos analizados', margen, yFinal + 12);

  autoTable(doc, {
    startY: yFinal + 15,
    margin: { left: margen, right: margen, bottom: 16 },
    head: [encabezadosAlumnos],
    body: d.alumnos.map((a) => [
      a.nombre,
      a.matricula,
      a.carrera,
      `${a.semestre}°`,
      a.promedio.toFixed(1),
      `${a.asistencia}%`,
      a.reprobadas,
      a.riesgo,
      `${a.probabilidad}%`,
    ]),
    theme: 'grid',
    headStyles: { fillColor: AZUL },
    alternateRowStyles: { fillColor: [244, 248, 253] },
    styles: { fontSize: 9 },
    didParseCell: (datos) => {
      if (datos.section === 'body' && datos.column.index === 7) {
        const color = colorRiesgo[String(datos.cell.raw)];
        if (color) {
          datos.cell.styles.textColor = color;
          datos.cell.styles.fontStyle = 'bold';
        }
      }
    },
  });

  // ----- Pie de página con numeración -----
  const paginas = doc.getNumberOfPages();
  for (let i = 1; i <= paginas; i++) {
    doc.setPage(i);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text('Documento generado automáticamente por ProEdu', margen, alto - 8);
    doc.text(`Página ${i} de ${paginas}`, ancho - margen, alto - 8, {
      align: 'right',
    });
  }

  doc.save(`${d.nombreArchivo}.pdf`);
}