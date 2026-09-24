from sqlalchemy import Column, Integer, String, Text, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from database import Base

class DBUser(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    role = Column(String, default="candidate", nullable=False)

    candidate_profile = relationship("DBCandidate", back_populates="user", uselist=False)
    notifications = relationship("DBNotification", back_populates="user", cascade="all, delete-orphan")

class DBVacancy(Base):
    __tablename__ = "vacancies"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True, nullable=False)
    department = Column(String, index=True)
    required_experience = Column(Integer, default=0)
    skills = Column(String)
    description = Column(Text)

class DBCandidate(Base):
    __tablename__ = "candidates"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=True) # Связь с аккаунтом
    full_name = Column(String, index=True, nullable=False)
    email = Column(String, unique=True, index=True)
    experience_years = Column(Integer, default=0)
    skills = Column(String)
    status = Column(String, default="New")

    user = relationship("DBUser", back_populates="candidate_profile")

class DBNotification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    message = Column(String, nullable=False)
    is_read = Column(Boolean, default=False)

    user = relationship("DBUser", back_populates="notifications")
