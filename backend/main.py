from fastapi import FastAPI
from sqlalchemy import text
from db import engine
from datetime import date
from pydantic import BaseModel

app = FastAPI(title="Detección de riesgo académico")

from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/salud")
def salud():
    with engine.connect() as conn:
        conn.execute(text("SELECT 1"))
    return {"estado": "ok"}

@app.get("/carreras")
def listar_carreras():
    with engine.connect() as conn:
        filas = conn.execute(text("SELECT id_carrera, nombre_carrera FROM carreras"))
        return [dict(f._mapping) for f in filas]

class EstudianteNuevo(BaseModel):
    matricula: str
    nombre: str
    apellido_paterno: str
    apellido_materno: str | None = None
    fecha_nacimiento: date | None = None
    genero: str | None = None
    telefono: str | None = None
    direccion: str | None = None
    id_carrera: int | None = None

@app.post("/estudiantes", status_code=201)
def crear_estudiante(e: EstudianteNuevo):
    with engine.begin() as conn:
        fila = conn.execute(text("""
            INSERT INTO estudiantes (matricula, nombre, apellido_paterno, apellido_materno,
                fecha_nacimiento, genero, telefono, direccion, id_carrera)
            VALUES (:matricula, :nombre, :apellido_paterno, :apellido_materno,
                :fecha_nacimiento, :genero, :telefono, :direccion, :id_carrera)
            RETURNING id_estudiante
        """), e.model_dump())
        return {"id_estudiante": fila.scalar()}

@app.get("/estudiantes")
def listar_estudiantes():
    with engine.connect() as conn:
        filas = conn.execute(text(
            "SELECT id_estudiante, matricula, nombre, apellido_paterno, apellido_materno, estatus "
            "FROM estudiantes ORDER BY id_estudiante"
        ))
        return [dict(f._mapping) for f in filas]

class InscripcionNueva(BaseModel):
    id_estudiante: int
    id_grupo: int

@app.post("/inscripciones", status_code=201)
def inscribir(i: InscripcionNueva):
    with engine.begin() as conn:
        id_insc = conn.execute(text("""
            INSERT INTO inscripciones (id_estudiante, id_grupo)
            VALUES (:id_estudiante, :id_grupo) RETURNING id_inscripcion
        """), i.model_dump()).scalar()
        # una fila de cursamiento por cada materia del grupo
        conn.execute(text("""
            INSERT INTO cursamiento_materia (id_inscripcion, id_grupo_materia)
            SELECT :id_insc, id_grupo_materia FROM grupo_materia WHERE id_grupo = :id_grupo
        """), {"id_insc": id_insc, "id_grupo": i.id_grupo})
    return {"id_inscripcion": id_insc}

class CalificacionNueva(BaseModel):
    id_cursamiento: int
    id_tipo_evaluacion: int
    calificacion: float
    fuente: str | None = "manual"

@app.post("/calificaciones", status_code=201)
def registrar_calificacion(c: CalificacionNueva):
    with engine.begin() as conn:
        id_cal = conn.execute(text("""
            INSERT INTO calificaciones (id_cursamiento, id_tipo_evaluacion, calificacion, fuente)
            VALUES (:id_cursamiento, :id_tipo_evaluacion, :calificacion, :fuente)
            RETURNING id_calificacion
        """), c.model_dump()).scalar()
    return {"id_calificacion": id_cal}

@app.get("/estudiantes/{id_estudiante}/calificaciones")
def calificaciones_estudiante(id_estudiante: int):
    with engine.connect() as conn:
        filas = conn.execute(text("""
            SELECT m.nombre AS materia, t.nombre AS evaluacion, c.calificacion
            FROM inscripciones i
            JOIN cursamiento_materia cm ON cm.id_inscripcion = i.id_inscripcion
            JOIN grupo_materia gm ON gm.id_grupo_materia = cm.id_grupo_materia
            JOIN materias m ON m.id_materia = gm.id_materia
            JOIN calificaciones c ON c.id_cursamiento = cm.id_cursamiento
            JOIN tipos_evaluacion t ON t.id_tipo_evaluacion = c.id_tipo_evaluacion
            WHERE i.id_estudiante = :id ORDER BY m.nombre, t.orden
        """), {"id": id_estudiante})
        return [dict(f._mapping) for f in filas]

from fastapi import Query

# Calificación mínima aprobatoria. Ajústala a la de tu institución.
CALIFICACION_MINIMA = 7.0


@app.get("/grupos")
def listar_grupos(carrera_id: int | None = Query(None)):
    with engine.connect() as conn:
        filas = conn.execute(text("""
            SELECT DISTINCT nombre_grupo AS nombre
            FROM grupos
            WHERE activo = TRUE
              AND (CAST(:carrera_id AS INT) IS NULL OR id_carrera = :carrera_id)
            ORDER BY nombre_grupo
        """), {"carrera_id": carrera_id})
        return [dict(f._mapping) for f in filas]


def _metricas(conn, carrera_id, grupo, cuatrimestre):
    """Calcula las 4 métricas para un filtro. Los filtros vacíos (None) no filtran."""
    fila = conn.execute(text("""
        WITH base AS (
            SELECT i.id_inscripcion, i.id_estudiante
            FROM inscripciones i
            JOIN grupos g ON g.id_grupo = i.id_grupo
            WHERE i.estatus = 'activo'
              AND (CAST(:carrera_id AS INT) IS NULL OR g.id_carrera = :carrera_id)
              AND (CAST(:grupo AS VARCHAR) IS NULL OR g.nombre_grupo = :grupo)
              AND (CAST(:cuatrimestre AS INT) IS NULL OR g.cuatrimestre = :cuatrimestre)
        ),
        prom_cursamiento AS (
            SELECT cm.id_cursamiento, AVG(c.calificacion) AS prom
            FROM base b
            JOIN cursamiento_materia cm ON cm.id_inscripcion = b.id_inscripcion
            JOIN calificaciones c ON c.id_cursamiento = cm.id_cursamiento
            WHERE c.es_oficial = TRUE
            GROUP BY cm.id_cursamiento
        )
        SELECT
            (SELECT COUNT(DISTINCT id_estudiante) FROM base) AS total_alumnos,
            (SELECT AVG(prom) FROM prom_cursamiento) AS promedio,
            (SELECT AVG(a.porcentaje)
               FROM base b
               JOIN cursamiento_materia cm ON cm.id_inscripcion = b.id_inscripcion
               JOIN asistencias a ON a.id_cursamiento = cm.id_cursamiento) AS asistencia,
            (SELECT COUNT(*) FROM prom_cursamiento WHERE prom < :minima) AS reprobadas
    """), {
        "carrera_id": carrera_id,
        "grupo": grupo,
        "cuatrimestre": cuatrimestre,
        "minima": CALIFICACION_MINIMA,
    }).one()

    return {
        "totalAlumnos": int(fila.total_alumnos or 0),
        "promedioGeneral": round(float(fila.promedio or 0), 1),
        "asistenciaPromedio": round(float(fila.asistencia or 0), 1),
        "totalReprobadas": int(fila.reprobadas or 0),
    }


@app.get("/estadisticas")
def estadisticas(
    carrera_id: int | None = Query(None),
    grupo: str | None = Query(None),
    cuatrimestre: int | None = Query(None),
):
    with engine.connect() as conn:
        actual = _metricas(conn, carrera_id, grupo, cuatrimestre)

        # Cambios: solo se comparan si se eligió un cuatrimestre y hay datos del anterior
        cambios = {"promedio": 0, "asistencia": 0, "reprobadas": 0}
        if cuatrimestre and cuatrimestre > 1:
            previo = _metricas(conn, carrera_id, grupo, cuatrimestre - 1)
            if previo["totalAlumnos"] > 0:
                cambios = {
                    "promedio": round(actual["promedioGeneral"] - previo["promedioGeneral"], 1),
                    "asistencia": round(actual["asistenciaPromedio"] - previo["asistenciaPromedio"], 1),
                    "reprobadas": actual["totalReprobadas"] - previo["totalReprobadas"],
                }

        return {**actual, "cambios": cambios}