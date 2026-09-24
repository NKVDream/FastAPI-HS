from pydantic import BaseModel
from typing import Optional

class UserCreate(BaseModel):
    username: str
    password: str
    role: Optional[str] = "candidate"

class UserResponse(BaseModel):
    id: int
    username: str
    role: str
    class Config:
        from_attributes = True

class TokenResponse(BaseModel):
    access_token: str
    token_type: str

class NotificationResponse(BaseModel):
    id: int
    message: str
    is_read: bool
    class Config:
        from_attributes = True

class VacancyCreate(BaseModel):
    title: str
    description: str = ""
    required_experience: int
    skills: str

class VacancyResponse(BaseModel):
    id: int
    title: str
    description: str
    required_experience: int
    skills: str

    class Config:
        from_attributes = True

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

class CandidateMatchResponse(BaseModel):
    id: int
    full_name: str
    email: str
    experience_years: int
    skills: str
    status: str
    matched_skills: list[str]
    match_count: int
    total_required_skills: int