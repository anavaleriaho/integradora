const API_URL = "http://127.0.0.1:8000/api";

export interface MateriaReprobada {
  nombre: string;
  calificacion: number;
  cuatrimestre?: number;
}

export interface EstudianteAPI {
  id_estudiante: number;
  matricula: string;
  nombre_completo: string;
  carrera: string;
  grupo: string;
  riesgo: "bajo" | "medio" | "alto" | "sin evaluar";
  probabilidad: number;
  promedio?: number;
  asistencia?: number;
  materias_reprobadas?: MateriaReprobada[];
}

export type Estudiante = EstudianteAPI;

export interface PrediccionResponse {
  id_prediccion: number;
  id_estudiante: number;
  promedio_calculado: number;
  asistencia_calculada: number;
  reprobadas_calculadas: number;
  riesgo: "bajo" | "medio" | "alto";
  probabilidad: number;
  clase_predicha: number;
}

export const getEstudiantes = async (): Promise<EstudianteAPI[]> => {
  const response = await fetch(`${API_URL}/estudiantes`);
  if (!response.ok) {
    throw new Error("Error al obtener la lista de estudiantes");
  }
  return await response.json();
};

export const predecirRiesgo = async (idEstudiante: number): Promise<PrediccionResponse> => {
  const response = await fetch(`${API_URL}/predict/${idEstudiante}`);
  if (!response.ok) {
    throw new Error(`Error al predecir el riesgo para el estudiante ${idEstudiante}`);
  }
  return await response.json();
};