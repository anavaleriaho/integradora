export interface MateriaReprobada {
  nombre: string;
  cuatrimestre: number;
}

// Datos de ejemplo: la cantidad coincide con el campo `reprobadas` de cada alumno.
export const materiasReprobadas: Record<number, MateriaReprobada[]> = {
  1: [
    { nombre: 'Cálculo Integral', cuatrimestre: 2 },
    { nombre: 'Estructuras de Datos', cuatrimestre: 3 },
    { nombre: 'Bases de Datos', cuatrimestre: 4 },
  ],
  2: [{ nombre: 'Contabilidad Financiera', cuatrimestre: 2 }],
  3: [{ nombre: 'Circuitos Eléctricos', cuatrimestre: 4 }],
  4: [],
  5: [],
  6: [],
  7: [
    { nombre: 'Matemáticas Básicas', cuatrimestre: 1 },
    { nombre: 'Fundamentos de Mercadotecnia', cuatrimestre: 1 },
  ],
};