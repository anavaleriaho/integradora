from pathlib import Path
import joblib
import numpy as np
from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import text
from db import get_db

app = FastAPI(title="API Sistema de Riesgo Académico")

# Habilitar CORS para peticiones desde React
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

BASE_DIR = Path(__file__).resolve().parent
MODEL_PATH = BASE_DIR / "modelo_random_forest_proedu_90.joblib"

try:
    modelo_rf = joblib.load(MODEL_PATH)
    print("✅ Modelo Random Forest cargado correctamente.")
except Exception as e:
    print(f"❌ Error al cargar el modelo: {e}")
    modelo_rf = None

# Endpoint 1: Listar todos los estudiantes para la Tabla General de React
@app.get("/api/estudiantes")
def listar_estudiantes(db: Session = Depends(get_db)):
    try:
        query = text("""
            SELECT 
                e.id_estudiante,
                e.matricula,
                CONCAT(e.nombre, ' ', e.apellido_paterno, ' ', COALESCE(e.apellido_materno, '')) AS nombre_completo,
                c.clave AS carrera,
                g.nombre_grupo AS grupo,
                p.riesgo,
                p.probabilidad
            FROM estudiantes e
            LEFT JOIN carreras c ON e.id_carrera = c.id_carrera
            LEFT JOIN inscripciones i ON e.id_estudiante = i.id_estudiante
            LEFT JOIN grupos g ON i.id_grupo = g.id_grupo
            LEFT JOIN (
                SELECT DISTINCT ON (id_estudiante) id_estudiante, riesgo, probabilidad
                FROM predicciones_riesgo
                ORDER BY id_estudiante, fecha_prediccion DESC
            ) p ON e.id_estudiante = p.id_estudiante
            ORDER BY e.id_estudiante ASC;
        """)
        
        resultados = db.execute(query).fetchall()
        lista = []
        for r in resultados:
            lista.append({
                "id_estudiante": r.id_estudiante,
                "matricula": r.matricula,
                "nombre_completo": r.nombre_completo.strip(),
                "carrera": r.carrera or "N/A",
                "grupo": r.grupo or "N/A",
                "riesgo": r.riesgo or "sin evaluar",
                "probabilidad": float(r.probabilidad) if r.probabilidad else 0.0
            })
        return lista
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Endpoint 2: Predicción individual por ID de estudiante
@app.get("/api/predict/{id_estudiante}")
def predecir_riesgo_estudiante(id_estudiante: int, db: Session = Depends(get_db)):
    if modelo_rf is None:
        raise HTTPException(status_code=500, detail="El modelo no está disponible")

    try:
        query_metricas = text("""
            SELECT 
                e.id_estudiante,
                c.clave AS clave_carrera,
                COALESCE(g.cuatrimestre, 1) AS cuatrimestre_corte,
                COALESCE(AVG(cal.calificacion), 8.0) AS promedio_cuatri_actual,
                COALESCE(AVG(cal.calificacion), 8.0) AS promedio_cuat_anterior,
                COUNT(CASE WHEN cal.calificacion < 7.0 THEN 1 END) AS reprobadas_cuat_actual,
                COUNT(CASE WHEN cal.calificacion < 7.0 THEN 1 END) AS reprobadas_acumuladas,
                COALESCE(AVG(cal.calificacion), 8.0) AS promedio_historico,
                COALESCE(AVG(asis.porcentaje), 100.0) AS asistencia_porcentaje
            FROM estudiantes e
            LEFT JOIN carreras c ON e.id_carrera = c.id_carrera
            LEFT JOIN inscripciones i ON e.id_estudiante = i.id_estudiante
            LEFT JOIN grupos g ON i.id_grupo = g.id_grupo
            LEFT JOIN cursamiento_materia cm ON i.id_inscripcion = cm.id_inscripcion
            LEFT JOIN calificaciones cal ON cm.id_cursamiento = cal.id_cursamiento
            LEFT JOIN asistencias asis ON cm.id_cursamiento = asis.id_cursamiento
            WHERE e.id_estudiante = :id_estudiante
            GROUP BY e.id_estudiante, c.clave, g.cuatrimestre;
        """)
        datos = db.execute(query_metricas, {"id_estudiante": id_estudiante}).fetchone()

        if not datos:
            raise HTTPException(status_code=404, detail="Estudiante no encontrado")

        clave_carrera = datos.clave_carrera or ""
        cuatrimestre_corte = int(datos.cuatrimestre_corte)
        promedio_cuatri_actual = float(datos.promedio_cuatri_actual)
        promedio_cuat_anterior = float(datos.promedio_cuat_anterior)
        reprobadas_cuat_actual = int(datos.reprobadas_cuat_actual)
        reprobadas_acumuladas = int(datos.reprobadas_acumuladas)
        promedio_historico = float(datos.promedio_historico)
        asistencia_porcentaje = float(datos.asistencia_porcentaje)

        carrera_ASP = 1 if clave_carrera == "ASP" else 0
        carrera_DGS = 1 if clave_carrera == "DGS" else 0
        carrera_MEC = 1 if clave_carrera == "MEC" else 0
        carrera_NEG = 1 if clave_carrera == "NEG" else 0
        carrera_OCI = 1 if clave_carrera == "OCI" else 0

        tendencia_promedio = promedio_cuatri_actual - promedio_cuat_anterior
        ratio_reprobadas_acum = reprobadas_acumuladas / max(cuatrimestre_corte, 1)
        brecha_asistencia = 100.0 - asistencia_porcentaje

        features = np.array([[
            cuatrimestre_corte, promedio_cuatri_actual, promedio_cuat_anterior,
            reprobadas_cuat_actual, reprobadas_acumuladas, promedio_historico,
            asistencia_porcentaje, carrera_ASP, carrera_DGS, carrera_MEC,
            carrera_NEG, carrera_OCI, tendencia_promedio, ratio_reprobadas_acum, brecha_asistencia
        ]])

        prediccion_clase = int(modelo_rf.predict(features)[0])
        probabilidades = modelo_rf.predict_proba(features)[0]
        prob_riesgo = float(probabilidades[1]) if len(probabilidades) > 1 else float(probabilidades[0])
        probabilidad_porcentaje = round(prob_riesgo * 100, 2)

        if prob_riesgo >= 0.7:
            riesgo = "alto"
        elif prob_riesgo >= 0.4:
            riesgo = "medio"
        else:
            riesgo = "bajo"

        insert_sql = text("""
            INSERT INTO predicciones_riesgo (id_estudiante, id_modelo, riesgo, probabilidad, fecha_prediccion)
            VALUES (:id_estudiante, 1, :riesgo, :probabilidad, NOW())
            RETURNING id_prediccion;
        """)
        res = db.execute(insert_sql, {
            "id_estudiante": id_estudiante,
            "riesgo": riesgo,
            "probabilidad": probabilidad_porcentaje
        })
        db.commit()
        id_prediccion = res.fetchone()[0]

        return {
            "id_prediccion": id_prediccion,
            "id_estudiante": id_estudiante,
            "promedio_calculado": round(promedio_cuatri_actual, 2),
            "asistencia_calculada": round(asistencia_porcentaje, 2),
            "reprobadas_calculadas": reprobadas_cuat_actual,
            "riesgo": riesgo,
            "probabilidad": probabilidad_porcentaje,
            "clase_predicha": prediccion_clase
        }
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))