from datetime import timedelta
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from app.core import security
from app.core.config import settings
from app.api import deps
from app.schemas.user import Token, User, UserCreate
from app.models.mock_db import users_db

router = APIRouter()

@router.post("/token", response_model=Token)
async def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends()):
    """
    Standard OAuth2 compatible token login, get an access token for future requests.
    """
    # 1. Verification logic
    user = users_db.get(form_data.username)
    if not user or not security.verify_password(form_data.password, user["hashed_password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # 2. Generation logic
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = security.create_access_token(
        subject=user["username"], expires_delta=access_token_expires
    )
    
    return {"access_token": access_token, "token_type": "bearer"}

@router.post("/register")
async def register(user_in: UserCreate):
    """
    User registration endpoint.
    """
    if user_in.username in users_db:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already registered"
        )
    
    # Securely hash the password before saving
    users_db[user_in.username] = {
        "username": user_in.username,
        "full_name": user_in.full_name,
        "hashed_password": security.get_password_hash(user_in.password),
        "disabled": False,
        "role": "user"
    }
    return {"message": "User registered successfully"}

@router.get("/me", response_model=User)
async def read_users_me(current_user: dict = Depends(deps.get_current_active_user)):
    """
    Returns the current authenticated user's profile.
    """
    return current_user
