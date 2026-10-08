import * as XLSX from 'xlsx';
import { aFilas, encabezadosAlumnos } from './datosReporte';
import type { DatosReporte } from './datosReporte';

export function exportarExcel(d: DatosReporte) {
  const libro = XLSX.utils.book_new();

  // ----- Hoja 1: resumen -----
  const resumen = [
    ['ProEdu - ' + d.titulo],
    ['Fecha de generación', d.generado],
    ['Generado por', d.responsable],
    ['Último análisis del modelo', d.ultimoAnalisis],
    [],
    ['Resumen general'],
    ...d.resumen,
    [],
    ['Distribución por nivel de riesgo', 'Alumnos', 'Porcentaje'],
    ...d.riesgo,
  ];
  const hojaResumen = XLSX.utils.aoa_to_sheet(resumen);
  hojaResumen['!cols'] = [{ wch: 36 }, { wch: 28 }, { wch: 14 }];
  XLSX.utils.book_append_sheet(libro, hojaResumen, 'Resumen');

  // ----- Hoja 2: alumnos -----
  const hojaAlumnos = XLSX.utils.aoa_to_sheet([
    encabezadosAlumnos,
    ...aFilas(d),
  ]);
  hojaAlumnos['!cols'] = [
    { wch: 28 },
    { wch: 14 },
    { wch: 28 },
    { wch: 10 },
    { wch: 10 },
    { wch: 14 },
    { wch: 20 },
    { wch: 16 },
    { wch: 26 },
  ];
  XLSX.utils.book_append_sheet(libro, hojaAlumnos, 'Alumnos');

  XLSX.writeFile(libro, `${d.nombreArchivo}.xlsx`);
}