from fastapi import FastAPI
import models
from database import engine
from controllers import router as api_router

# Создаем таблицы в SQLite автоматически
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Система подбора кандидатов")

# Подключаем наш контроллер
app.include_router(api_router)

@app.get("/")
def read_root():
    return {"status": "Система работает. Перейдите на /docs для тестирования."}
