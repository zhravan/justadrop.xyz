from typing import Optional
from datetime import timedelta
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from pydantic import BaseModel

from src.core.database import get_db
from src.core.security import (
    verify_password, create_access_token, hash_password,
    ACCESS_TOKEN_EXPIRE_MINUTES
)
from src.models.models import User, UserRole, Organization, OrganizationStatus
from src.schemas.user import UserCreate, UserResponse

router = APIRouter()


class Token(BaseModel):
    access_token: str
    token_type: str


class LoginResponse(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse


class TokenData(BaseModel):
    user_id: Optional[int] = None


@router.post('/register', response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def register(user: UserCreate, db: Session = Depends(get_db)):
    """Register a new user."""
    # Check if user already exists
    existing_user = db.query(User).filter(
        (User.email == user.email) | (User.username == user.username)
    ).first()
    
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail='User with this email or username already exists'
        )
    
    # Convert role string to UserRole enum
    role_map = {
        'volunteer': UserRole.VOLUNTEER,
        'organization': UserRole.ORGANIZATION,
        'admin': UserRole.ADMIN
    }
    user_role = role_map.get(user.role.lower(), UserRole.VOLUNTEER)
    
    # Create new user
    db_user = User(
        email=user.email,
        username=user.username,
        full_name=user.full_name,
        hashed_password=hash_password(user.password),
        role=user_role,
        phone=user.phone,
        bio=user.bio,
        skills=user.skills,
        location=user.location
    )
    
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    
    # If user is an organization, create organization profile
    if user_role == UserRole.ORGANIZATION:
        organization = Organization(
            user_id=db_user.id,
            organization_name=user.full_name or user.username,
            verification_status=OrganizationStatus.PENDING
        )
        db.add(organization)
        db.commit()
    
    return db_user


@router.post('/login', response_model=LoginResponse)
def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):
    """Login and get access token."""
    user = db.query(User).filter(User.username == form_data.username).first()
    
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail='Incorrect username or password',
            headers={'WWW-Authenticate': 'Bearer'},
        )
    
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail='User account is inactive'
        )
    
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={'sub': str(user.id)},
        expires_delta=access_token_expires
    )
    
    return {
        'access_token': access_token,
        'token_type': 'bearer',
        'user': user
    }

