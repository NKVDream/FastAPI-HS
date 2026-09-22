from pydantic import BaseModel
from typing import Optional

# --- СХЕМЫ ПОЛЬЗОВАТЕЛЕЙ И АВТОРШАНИИ ---
class UserCreate(BaseModel):
    username: str
    password: str
    role: Optional[str] = "candidate" # Можно передать "admin" или "candidate"

class UserResponse(BaseModel):
    id: int
    username: str
    role: str
    class Config:
        from_attributes = True

class TokenResponse(BaseModel):
    access_token: str
    token_type: str

# --- СХЕМЫ УВЕДОМЛЕНИЙ ---
class NotificationResponse(BaseModel):
    id: int
    message: str
    is_read: bool
    class Config:
        from_attributes = True

# --- СХЕМЫ ВАКАНСИЙ ---
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

# --- СХЕМЫ КАНДИДАТОВ ---
class CandidateCreate(BaseModel):
    full_name: str
    email: str
    experience_years: int = 0
    skills: str
    status: Optional[str] = "New"

class CandidateResponse(CandidateCreate):
    id: int
    user_id: Optional[int] = None
    class Config:
        from_attributes = True
