from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
import models
import schemas

router = APIRouter()

# =====================================================================
# РАБОТА С ВАКАНСИЯМИ (CRUD)
# =====================================================================

@router.post("/vacancies", response_model=schemas.VacancyResponse, tags=["Vacancies"])
def create_vacancy(vacancy: schemas.VacancyCreate, db: Session = Depends(get_db)):
    db_vacancy = models.DBVacancy(**vacancy.model_dump())
    db.add(db_vacancy)
    db.commit()
    db.refresh(db_vacancy)
    return db_vacancy

@router.get("/vacancies", response_model=list[schemas.VacancyResponse], tags=["Vacancies"])
def get_all_vacancies(db: Session = Depends(get_db)):
    return db.query(models.DBVacancy).all()


# =====================================================================
# РАБОТА С КАНДИДАТАМИ (CRUD)
# =====================================================================

@router.post("/candidates", response_model=schemas.CandidateResponse, tags=["Candidates"])
def create_candidate(candidate: schemas.CandidateCreate, db: Session = Depends(get_db)):
    # Проверка на дубликат email
    existing = db.query(models.DBCandidate).filter(models.DBCandidate.email == candidate.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Candidate with this email already exists")
    
    db_candidate = models.DBCandidate(**candidate.model_dump())
    db.add(db_candidate)
    db.commit()
    db.refresh(db_candidate)
    return db_candidate

@router.put("/candidates/{candidate_id}", response_model=schemas.CandidateResponse, tags=["Candidates"])
def update_candidate(candidate_id: int, updated_data: schemas.CandidateCreate, db: Session = Depends(get_db)):
    db_candidate = db.query(models.DBCandidate).filter(models.DBCandidate.id == candidate_id).first()
    if not db_candidate:
        raise HTTPException(status_code=404, detail="Candidate not found")
    
    for key, value in updated_data.model_dump().items():
        setattr(db_candidate, key, value)
        
    db.commit()
    db.refresh(db_candidate)
    return db_candidate

@router.delete("/candidates/{candidate_id}", tags=["Candidates"])
def delete_candidate(candidate_id: int, db: Session = Depends(get_db)):
    db_candidate = db.query(models.DBCandidate).filter(models.DBCandidate.id == candidate_id).first()
    if not db_candidate:
        raise HTTPException(status_code=404, detail="Candidate not found")
    db.delete(db_candidate)
    db.commit()
    return {"message": f"Candidate {candidate_id} deleted successfully"}


# =====================================================================
# МНОГОКРИТЕРИАЛЬНЫЙ ПОИСК КАНДИДАТОВ ПО ВАКАНСИИ
# =====================================================================

@router.get("/search/match-candidates/{vacancy_id}", response_model=list[schemas.CandidateResponse], tags=["Search"])
def match_candidates_for_vacancy(vacancy_id: int, db: Session = Depends(get_db)):
    # 1. Находим вакансию
    vacancy = db.query(models.DBVacancy).filter(models.DBVacancy.id == vacancy_id).first()
    if not vacancy:
        raise HTTPException(status_code=404, detail="Vacancy not found")
    
    # 2. Базовый фильтр: Опыт кандидата должен быть >= опыта в вакансии
    query = db.query(models.DBCandidate).filter(models.DBCandidate.experience_years >= vacancy.required_experience)
    all_candidates = query.all()
    
    # Разбираем навыки вакансии на список (убираем лишние пробелы и приводим к нижнему регистру)
    vacancy_skills = [s.strip().lower() for s in vacancy.skills.split(",") if s.strip()]
    
    matched_candidates = []
    
    # 3. Фильтруем по ключевым навыкам (в коде, так как SQLite не умеет в сложные массивы данных)
    for candidate in all_candidates:
        candidate_skills = [s.strip().lower() for s in candidate.skills.split(",") if s.strip()]
        
        # Если есть хотя бы одно пересечение в навыках — кандидат нам подходит
        if any(skill in candidate_skills for skill in vacancy_skills):
            matched_candidates.append(candidate)
            
    return matched_candidates
