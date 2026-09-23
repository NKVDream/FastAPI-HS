from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from database import get_db
import models
import schemas
import auth

router = APIRouter()

# =====================================================================
# АВТОРИЗАЦИЯ И РЕГИСТРАЦИЯ
# =====================================================================

@router.post("/auth/register", response_model=schemas.UserResponse, tags=["Authentication"])
def register(user_data: schemas.UserCreate, db: Session = Depends(get_db)):
    existing_user = db.query(models.DBUser).filter(models.DBUser.username == user_data.username).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Username already taken")
    
    if user_data.role not in ["candidate", "admin"]:
        raise HTTPException(status_code=400, detail="Invalid role. Choose 'candidate' or 'admin'")
        
    hashed_pwd = auth.get_password_hash(user_data.password)
    new_user = models.DBUser(username=user_data.username, hashed_password=hashed_pwd, role=user_data.role)
    
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

@router.post("/auth/login", response_model=schemas.TokenResponse, tags=["Authentication"])
def login(user_data: schemas.UserCreate, db: Session = Depends(get_db)):
    user = db.query(models.DBUser).filter(models.DBUser.username == user_data.username).first()
    if not user or not auth.verify_password(user_data.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Incorrect username or password")
    
    access_token = auth.create_access_token(data={"sub": user.username})
    return {"access_token": access_token, "token_type": "bearer"}


# =====================================================================
# ЛИЧНЫЙ КАБИНЕТ (Для текущего вошедшего пользователя)
# =====================================================================

@router.get("/me/profile", tags=["Profile"])
def get_my_profile(current_user: models.DBUser = Depends(auth.get_current_user)):
    """Возвращает информацию о текущем пользователе и его резюме кандидате"""
    profile_data = {
        "id": current_user.id,
        "username": current_user.username,
        "role": current_user.role,
        "candidate_info": None
    }
    if current_user.candidate_profile:
        profile_data["candidate_info"] = schemas.CandidateResponse.from_orm(current_user.candidate_profile)
    return profile_data

@router.get("/me/notifications", response_model=list[schemas.NotificationResponse], tags=["Profile"])
def get_my_notifications(
    db: Session = Depends(get_db), 
    current_user: models.DBUser = Depends(auth.get_current_user)
):
    """Получить уведомления для личного кабинета"""
    return db.query(models.DBNotification).filter(models.DBNotification.user_id == current_user.id).all()


# =====================================================================
# РАБОТА С КАНДИДАТАМИ (Добавление / Изменение статуса с уведомлением)
# =====================================================================

@router.post("/candidates", response_model=schemas.CandidateResponse, tags=["Candidates"])
def create_candidate(
    candidate: schemas.CandidateCreate, 
    db: Session = Depends(get_db),
    current_user: models.DBUser = Depends(auth.get_current_user)
):
    """Создать резюме. Автоматически привязывается к аккаунту, если роль 'candidate'"""
    existing = db.query(models.DBCandidate).filter(models.DBCandidate.email == candidate.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Candidate with this email already exists")
    
    db_candidate = models.DBCandidate(**candidate.model_dump())
    
    # Если текущий пользователь — кандидат, привязываем анкету к его аккаунту
    if current_user.role == "candidate":
        # Проверяем, нет ли у него уже анкеты
        if current_user.candidate_profile:
            raise HTTPException(status_code=400, detail="You already have a candidate profile")
        db_candidate.user_id = current_user.id

    db.add(db_candidate)
    db.commit()
    db.refresh(db_candidate)
    return db_candidate

@router.put("/candidates/{candidate_id}", response_model=schemas.CandidateResponse, tags=["Candidates"])
def update_candidate_status_or_data(
    candidate_id: int, 
    updated_data: schemas.CandidateCreate, 
    db: Session = Depends(get_db),
    current_user: models.DBUser = Depends(auth.get_current_user)
):
    """Редактирование кандидата. Если админ меняет статус на Interview, шлется уведомление."""
    db_candidate = db.query(models.DBCandidate).filter(models.DBCandidate.id == candidate_id).first()
    if not db_candidate:
        raise HTTPException(status_code=404, detail="Candidate not found")
    
    old_status = db_candidate.status
    
    for key, value in updated_data.model_dump().items():
        setattr(db_candidate, key, value)
    
    # ЛОГИКА УВЕДОМЛЕНИЙ: Если статус изменился на Interview и анкета привязана к пользователю
    if old_status != "Interview" and updated_data.status == "Interview" and db_candidate.user_id:
        notification = models.DBNotification(
            user_id=db_candidate.user_id,
            message="Вас выбрали по вакансии! Мы готовим для вас собеседование."
        )
        db.add(notification)

    db.commit()
    db.refresh(db_candidate)
    return db_candidate

@router.get("/candidates", response_model=list[schemas.CandidateResponse], tags=["Candidates"])
def get_all_candidates(db: Session = Depends(get_db), current_user: models.DBUser = Depends(auth.get_current_user)):
    # Только админ может видеть полный список всех кандидатов системы
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Only admins can view all candidates")
    return db.query(models.DBCandidate).all()


# =====================================================================
# РАБОТА С ВАКАНСИЯМИ
# =====================================================================

@router.post("/vacancies", response_model=schemas.VacancyResponse, tags=["Vacancies"])
def create_vacancy(
    vacancy: schemas.VacancyCreate, 
    db: Session = Depends(get_db),
    current_user: models.DBUser = Depends(auth.get_current_user)
):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Only admins can create vacancies")
    db_vacancy = models.DBVacancy(**vacancy.model_dump())
    db.add(db_vacancy)
    db.commit()
    db.refresh(db_vacancy)
    return db_vacancy

@router.get("/vacancies", response_model=list[schemas.VacancyResponse], tags=["Vacancies"])
def get_all_vacancies(db: Session = Depends(get_db)):
    return db.query(models.DBVacancy).all()


# =====================================================================
# МНОГОКРИТЕРИАЛЬНЫЙ ПОИСК (Только для Админа)
# =====================================================================

@router.get("/search/match-candidates/{vacancy_id}", response_model=list[schemas.CandidateResponse], tags=["Search"])
def match_candidates_for_vacancy(
    vacancy_id: int, 
    db: Session = Depends(get_db),
    current_user: models.DBUser = Depends(auth.get_current_user)
):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Access denied")
        
    vacancy = db.query(models.DBVacancy).filter(models.DBVacancy.id == vacancy_id).first()
    if not vacancy:
        raise HTTPException(status_code=404, detail="Vacancy not found")
    
    all_candidates = db.query(models.DBCandidate).filter(models.DBCandidate.experience_years >= vacancy.required_experience).all()
    vacancy_skills = [s.strip().lower() for s in vacancy.skills.split(",") if s.strip()]
    matched_candidates = []
    
    for candidate in all_candidates:
        candidate_skills = [s.strip().lower() for s in candidate.skills.split(",") if s.strip()]
        if any(skill in candidate_skills for skill in vacancy_skills):
            matched_candidates.append(candidate)
            
    return matched_candidates