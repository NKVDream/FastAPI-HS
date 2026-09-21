from sqlalchemy import Column, Integer, String, Text
from database import Base

# Таблица Вакансий
class DBVacancy(Base):
    __tablename__ = "vacancies"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True, nullable=False)        # Название (например, "C# Developer")
    department = Column(String, index=True)                  # Отдел / Направление
    required_experience = Column(Integer, default=0)         # Требуемый опыт в годах
    skills = Column(String)                                  # Ключевые навыки (через запятую, например: "C#, SQL, Git")
    description = Column(Text)                               # Описание вакансии

# Таблица Кандидатов
class DBCandidate(Base):
    __tablename__ = "candidates"

    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String, index=True, nullable=False)   # ФИО кандидата
    email = Column(String, unique=True, index=True)          # Контакты
    experience_years = Column(Integer, default=0)            # Опыт работы кандидата в годах
    skills = Column(String)                                  # Навыки кандидата (например: "C#, EF Core, Docker")
    status = Column(String, default="New")                   # Статус (New, Interview, Hired, Rejected)