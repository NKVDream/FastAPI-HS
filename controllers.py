from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from database import get_db
import models
import schemas
import auth


router = APIRouter()

@router.post(
    "/auth/register",
    response_model=schemas.UserResponse,
    tags=["Authentication"]
)
def register(
    user_data: schemas.UserCreate,
    db: Session = Depends(get_db)
):
    existing_user = db.query(models.DBUser).filter(
        models.DBUser.username == user_data.username
    ).first()

    if existing_user:
        raise HTTPException(
            status_code=400,
            detail="Username already taken"
        )

    if user_data.role not in ["candidate", "admin"]:
        raise HTTPException(
            status_code=400,
            detail="Invalid role. Choose 'candidate' or 'admin'"
        )

    hashed_pwd = auth.get_password_hash(user_data.password)

    new_user = models.DBUser(
        username=user_data.username,
        hashed_password=hashed_pwd,
        role=user_data.role
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return new_user


@router.post(
    "/auth/login",
    response_model=schemas.TokenResponse,
    tags=["Authentication"]
)
def login(
    user_data: schemas.UserCreate,
    db: Session = Depends(get_db)
):
    user = db.query(models.DBUser).filter(
        models.DBUser.username == user_data.username
    ).first()

    if not user or not auth.verify_password(
        user_data.password,
        user.hashed_password
    ):
        raise HTTPException(
            status_code=401,
            detail="Incorrect username or password"
        )

    access_token = auth.create_access_token(
        data={"sub": user.username}
    )

    return {
        "access_token": access_token,
        "token_type": "bearer"
    }

@router.get(
    "/me/profile",
    tags=["Profile"]
)
def get_my_profile(
    current_user: models.DBUser = Depends(auth.get_current_user)
):

    profile_data = {
        "id": current_user.id,
        "username": current_user.username,
        "role": current_user.role,
        "candidate_info": None
    }

    if current_user.candidate_profile:
        profile_data["candidate_info"] = (
            schemas.CandidateResponse
            .from_orm(current_user.candidate_profile)
        )

    return profile_data


@router.get(
    "/me/notifications",
    response_model=list[schemas.NotificationResponse],
    tags=["Profile"]
)
def get_my_notifications(
    db: Session = Depends(get_db),
    current_user: models.DBUser = Depends(auth.get_current_user)
):

    return db.query(models.DBNotification).filter(
        models.DBNotification.user_id == current_user.id
    ).all()

@router.post(
    "/candidates",
    response_model=schemas.CandidateResponse,
    tags=["Candidates"]
)
def create_candidate(
    candidate: schemas.CandidateCreate,
    db: Session = Depends(get_db),
    current_user: models.DBUser = Depends(auth.get_current_user)
):

    existing = db.query(models.DBCandidate).filter(
        models.DBCandidate.email == candidate.email
    ).first()

    if existing:
        raise HTTPException(
            status_code=400,
            detail="Candidate with this email already exists"
        )

    db_candidate = models.DBCandidate(
        **candidate.model_dump()
    )

    if current_user.role == "candidate":

        if current_user.candidate_profile:
            raise HTTPException(
                status_code=400,
                detail="You already have a candidate profile"
            )

        db_candidate.user_id = current_user.id

    db.add(db_candidate)
    db.commit()
    db.refresh(db_candidate)

    return db_candidate


@router.put(
    "/candidates/{candidate_id}",
    response_model=schemas.CandidateResponse,
    tags=["Candidates"]
)
def update_candidate_status_or_data(
    candidate_id: int,
    updated_data: schemas.CandidateCreate,
    db: Session = Depends(get_db),
    current_user: models.DBUser = Depends(auth.get_current_user)
):

    db_candidate = db.query(models.DBCandidate).filter(
        models.DBCandidate.id == candidate_id
    ).first()

    if not db_candidate:
        raise HTTPException(
            status_code=404,
            detail="Candidate not found"
        )

    old_status = db_candidate.status

    for key, value in updated_data.model_dump().items():
        setattr(db_candidate, key, value)

    if (
        old_status != "Interview"
        and updated_data.status == "Interview"
        and db_candidate.user_id
    ):
        notification = models.DBNotification(
            user_id=db_candidate.user_id,
            message=(
                "Вас выбрали по вакансии. "
                "Мы готовим для вас собеседование."
            )
        )

        db.add(notification)

    db.commit()
    db.refresh(db_candidate)

    return db_candidate


@router.get(
    "/candidates",
    response_model=list[schemas.CandidateResponse],
    tags=["Candidates"]
)
def get_all_candidates(
    db: Session = Depends(get_db),
    current_user: models.DBUser = Depends(auth.get_current_user)
):

    if current_user.role != "admin":
        raise HTTPException(
            status_code=403,
            detail="Only admins can view all candidates"
        )

    return db.query(models.DBCandidate).all()

@router.post(
    "/vacancies",
    response_model=schemas.VacancyResponse,
    tags=["Vacancies"]
)
def create_vacancy(
    vacancy: schemas.VacancyCreate,
    db: Session = Depends(get_db),
    current_user: models.DBUser = Depends(auth.get_current_user)
):

    if current_user.role != "admin":
        raise HTTPException(
            status_code=403,
            detail="Only admins can create vacancies"
        )

    db_vacancy = models.DBVacancy(
        **vacancy.model_dump()
    )

    db.add(db_vacancy)
    db.commit()
    db.refresh(db_vacancy)

    return db_vacancy


@router.get(
    "/vacancies",
    response_model=list[schemas.VacancyResponse],
    tags=["Vacancies"]
)
def get_all_vacancies(
    db: Session = Depends(get_db)
):
    """
    Получить список всех вакансий.
    """

    return db.query(models.DBVacancy).all()

@router.get(
    "/search/match-candidates/{vacancy_id}",
    response_model=list[schemas.CandidateResponse],
    tags=["Search"]
)
def match_candidates_for_vacancy(
    vacancy_id: int,
    db: Session = Depends(get_db),
    current_user: models.DBUser = Depends(auth.get_current_user)
):
    """
    Поиск кандидатов под конкретную вакансию.

    1. Проверяем, что пользователь администратор.
    2. Получаем вакансию.
    3. Фильтруем кандидатов по минимальному опыту.
    4. Сравниваем требуемые и имеющиеся навыки.
    5. Оставляем кандидатов хотя бы с одним совпадением.
    6. Сортируем по количеству совпавших навыков.
    """

    if current_user.role != "admin":
        raise HTTPException(
            status_code=403,
            detail="Access denied"
        )

    vacancy = db.query(models.DBVacancy).filter(
        models.DBVacancy.id == vacancy_id
    ).first()

    if not vacancy:
        raise HTTPException(
            status_code=404,
            detail="Vacancy not found"
        )

    vacancy_skills = {
        skill.strip().lower()
        for skill in vacancy.skills.split(",")
        if skill.strip()
    }

    candidates = db.query(models.DBCandidate).filter(
        models.DBCandidate.experience_years
        >= vacancy.required_experience
    ).all()

    matched_candidates = []

    for candidate in candidates:

        candidate_skills = {
            skill.strip().lower()
            for skill in candidate.skills.split(",")
            if skill.strip()
        }

        matched_skills = vacancy_skills.intersection(
            candidate_skills
        )

        matched_skills_count = len(matched_skills)

        if matched_skills_count > 0:

            matched_candidates.append(
                (
                    candidate,
                    matched_skills_count
                )
            )

    matched_candidates.sort(
        key=lambda item: item[1],
        reverse=True
    )

    return [
        candidate
        for candidate, matched_skills_count
        in matched_candidates
    ]