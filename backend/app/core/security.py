from datetime import datetime, timedelta
from typing import Optional, Union, Any
from jose import jwt
from passlib.context import CryptContext
from app.core.config import settings

# Password Hashing context using bcrypt
# 1. schemes=["bcrypt"]: Specifies the industry-standard algorithm for secure password hashing.
# 2. deprecated="auto": Ensures we automatically upgrade hash formats if the standard changes.
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def create_access_token(subject: Union[str, Any], expires_delta: Optional[timedelta] = None) -> str:
    """
    Generates a secure JSON Web Token (JWT).
    Line explanation:
    1. subject: Usually the user's email/username (stored in the 'sub' claim).
    2. delta: How long until the token becomes invalid.
    """
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        # 3. Default to the system configuration (30 minutes).
        expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    
    # 4. to_encode: The data payload included in the token.
    to_encode = {"exp": expire, "sub": str(subject)}
    
    # 5. jwt.encode: Cryptographically signs the data so it cannot be tampered with.
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Securely compares a plain-text password with its encrypted database version.
    """
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str) -> str:
    """
    One-way hashes a password so it can be safely stored.
    """
    return pwd_context.hash(password)
