import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.endpoints import auth, quiz
from app.middlewares.logging_middleware import LoggingMiddleware
from app.core.config import settings

def create_application() -> FastAPI:
    """
    Factory function to initialize the FastAPI application.
    Enables cleaner unit testing and enterprise modularity.
    """
    
    # 1. Initialize FastAPI with metadata
    application = FastAPI(
        title="BrainWave Quiz Engine",
        description="Enterprise-level AI Quiz Generation Platform",
        version="2.0.0"
    )

    # 2. Configure CORS Interceptor (Middleware)
    # Allows the frontend to communicate with the backend safely.
    application.add_middleware(
        CORSMiddleware,
        allow_origins=settings.ALLOWED_ORIGINS,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # 3. Register Custom Logging Interceptor (Middleware)
    # Tracks request timing and status codes globally.
    application.add_middleware(LoggingMiddleware)

    # 4. Include Subject-specific Routers
    # - Authentication & User Management (Standardized under /api)
    application.include_router(auth.router, prefix="/api", tags=["Authentication"])
    
    # - Quiz Engineering & Generation (Standardized under /api)
    application.include_router(quiz.router, prefix="/api", tags=["Quiz Engine"])

    @application.get("/", tags=["Health"])
    async def root():
        """Public health check endpoint"""
        return {"status": "Active", "system": "BrainWave Core", "version": "2.0.0"}

    return application

# Final app instance
app = create_application()

if __name__ == "__main__":
    # Start the server using Uvicorn
    # Line explanation:
    # 1. host 0.0.0.0: Bind to all interfaces (required for Docker/Cloud).
    # 2. port 8000: Standard API port.
    uvicorn.run(app, host="0.0.0.0", port=8000)
