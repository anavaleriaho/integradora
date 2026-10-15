import os
from dotenv import load_dotenv
from sqlalchemy import create_engine, text

load_dotenv()
engine = create_engine(os.getenv("DATABASE_URL"))

if __name__ == "__main__":
    with engine.connect() as conn:
        print(conn.execute(text("SELECT count(*) FROM carreras")).scalar())