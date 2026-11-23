from pathlib import Path
import joblib

BASE_DIR = Path(__file__).resolve().parent
MODEL_PATH = BASE_DIR / "modelo_random_forest_proedu_90.joblib"

print(f"Buscando modelo en: {MODEL_PATH}")

if MODEL_PATH.exists():
    try:
        modelo = joblib.load(MODEL_PATH)
        print("🎉 ¡Éxito! El modelo cargó correctamente sin errores.")
    except Exception as e:
        print(f"❌ Ocurrió un error al cargar el archivo .joblib: {e}")
else:
    print("❌ El archivo 'modelo_random_forest_proedu_90.joblib' no se encuentra en la carpeta backend.")