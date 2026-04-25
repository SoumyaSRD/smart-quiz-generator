import os
from dotenv import load_dotenv

# Load environment variables from .env file if it exists
load_dotenv()

class Settings:
    """
    Enterprise-level configuration management.
    Handles secrets, global constants, and environment-specific settings.
    """
    
    # Security: Secret key for JWT signing
    # Each line explained:
    # 1. SECRET_KEY: The cryptographic key used to sign and verify JWT tokens.
    # 2. Defaults to a dev string if not found in .env (SECURITY: Should always be set in prod).
    SECRET_KEY: str = os.getenv("SECRET_KEY", "your-enterprise-secret-key-change-this")
    
    # 3. ALGORITHM: The hashing algorithm used for the tokens (HS256 is industry standard).
    ALGORITHM: str = "HS256"
    
    # 4. Token expiration time to enhance security (sessions automatically expire).
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    # Storage & Processing:
    # 5. UPLOAD_DIR: Centralized path for temporary file processing.
    # 6. Uses /tmp on RENDER/Linux environments for high-speed ephemeral storage.
    UPLOAD_DIR: str = "/tmp/temp_uploads" if os.getenv("RENDER") else "temp_uploads"
    
    # 7. Allowed Origins for CORS protection.
    ALLOWED_ORIGINS: list = os.getenv("ALLOWED_ORIGINS", "*").split(",")

# Singleton instance of settings to be used across the app
settings = Settings()
