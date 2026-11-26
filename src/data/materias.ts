export interface MateriaReprobada {
  nombre: string;
  cuatrimestre: number;
  calificacion: number;
}

// Datos de ejemplo: la cantidad coincide con el campo `reprobadas` de cada alumno.
// Cuando se conecte la base de datos, nombre y calificación vendrán del backend.
export const materiasReprobadas: Record<number, MateriaReprobada[]> = {
  1: [
    { nombre: 'Cálculo Integral', cuatrimestre: 7, calificacion: 5.5 },
    { nombre: 'Estructuras de Datos', cuatrimestre: 7, calificacion: 6.2 },
    { nombre: 'Bases de Datos', cuatrimestre: 7, calificacion: 6.0 },
  ],
  2: [{ nombre: 'Contabilidad Financiera', cuatrimestre: 4, calificacion: 6.5 }],
  3: [{ nombre: 'Circuitos Eléctricos', cuatrimestre: 10, calificacion: 6.0 }],
  4: [],
  5: [],
  6: [],
  7: [
    { nombre: 'Matemáticas Básicas', cuatrimestre: 1, calificacion: 5.0 },
    { nombre: 'Fundamentos de Mercadotecnia', cuatrimestre: 1, calificacion: 5.8 },
  ],
};