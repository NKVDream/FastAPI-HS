from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import models
from database import engine
from controllers import router as api_router

models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Система подбора кандидатов")

# НАСТРОЙКА CORS
origins = [
    "http://localhost:3000",
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router)

@app.get("/")
def read_root():
    return {"status": "Система работает. Перейдите на /docs для тестирования."}
