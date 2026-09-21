from pydantic import BaseModel
from typing import Optional

# ----------------- СХЕМЫ ДЛЯ ВАКАНСИЙ -----------------
class VacancyCreate(BaseModel):
    title: str
    department: Optional[str] = None
    required_experience: int = 0
    skills: str
    description: Optional[str] = None

class VacancyResponse(VacancyCreate):
    id: int
    class Config:
        from_attributes = True

# ----------------- СХЕМЫ ДЛЯ КАНДИДАТОВ -----------------
class CandidateCreate(BaseModel):
    full_name: str
    email: str
    experience_years: int = 0
    skills: str
    status: Optional[str] = "New"

class CandidateResponse(CandidateCreate):
    id: int
    class Config:
        from_attributes = True
