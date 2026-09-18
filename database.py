from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# Имя файла нашей будущей БД
DATABASE_URL = "sqlite:///./app.db"

engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Базовый класс, от которого будут исследоваться все таблицы
Base = declarative_base()

# Функция-помощник для получения сессии БД (Аналог Scoped Injection в C#)
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
