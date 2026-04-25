from typing import Optional
from pydantic import BaseModel, EmailStr

class UserBase(BaseModel):
    """Base shared user attributes"""
    username: str
    full_name: Optional[str] = None
    role: str = "user"

class UserCreate(UserBase):
    """Schema for registering a new user"""
    password: str

class User(UserBase):
    """Schema for returning user data (excludes sensitive fields)"""
    disabled: bool = False

    class Config:
        from_attributes = True

class Token(BaseModel):
    """Schema for returning a successful login token"""
    access_token: str
    token_type: str

class TokenData(BaseModel):
    """Schema for extracted token payload during verification"""
    username: Optional[str] = None
