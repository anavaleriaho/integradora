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
    ap_paterno: str
    ap_materno: str | None = None
    fecha_nacimiento: date | None = None
    genero: str | None = None
    correo_institucional: str | None = None
    id_carrera: int | None = None

@app.post("/estudiantes", status_code=201)
def crear_estudiante(e: EstudianteNuevo):
    with engine.begin() as conn:
        fila = conn.execute(text("""
            INSERT INTO estudiantes (matricula, nombre, ap_paterno, ap_materno,
                fecha_nacimiento, genero, correo_institucional, id_carrera)
            VALUES (:matricula, :nombre, :ap_paterno, :ap_materno,
                :fecha_nacimiento, :genero, :correo_institucional, :id_carrera)
            RETURNING id_estudiante
        """), e.model_dump())
        return {"id_estudiante": fila.scalar()}

@app.get("/estudiantes")
def listar_estudiantes():
    with engine.connect() as conn:
        filas = conn.execute(text(
            "SELECT id_estudiante, matricula, nombre, ap_paterno, ap_materno, estatus "
            "FROM estudiantes ORDER BY id_estudiante"
        ))
        return [dict(f._mapping) for f in filas]