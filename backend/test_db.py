from db import engine
from sqlalchemy import text

try:
    with engine.connect() as conn:
        result = conn.execute(text("SELECT 1;"))
        print("\n" + "="*45)
        print("🎉 ¡CONEXIÓN EXITOSA A POSTGRESQL!")
        print("="*45 + "\n")
except Exception as e:
    print("\n❌ Ocurrió un error al intentar conectar:")
    print(e)