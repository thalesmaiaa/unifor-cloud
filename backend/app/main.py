import logging

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.database import engine, Base, SessionLocal
from app.models import User, Project, Task, ActivityLog  # noqa: F401
from app.models.user import UserRole
from app.services.auth import get_password_hash
from app.middleware.logging import LoggingMiddleware
from app.routers import auth, users, projects, tasks, logs

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger("app")

# Create FastAPI app
app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description=settings.DESCRIPTION,
    docs_url="/docs",
    redoc_url="/redoc",
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Logging middleware
app.add_middleware(LoggingMiddleware)

# Include routers
app.include_router(auth.router)
app.include_router(users.router)
app.include_router(projects.router)
app.include_router(tasks.router)
app.include_router(logs.router)


@app.on_event("startup")
def on_startup():
    """Create tables and seed admin user on startup."""
    Base.metadata.create_all(bind=engine)
    logger.info("Database tables created.")

    # Seed default admin user
    db = SessionLocal()
    try:
        admin = db.query(User).filter(User.email == settings.FIRST_ADMIN_EMAIL).first()
        if not admin:
            admin = User(
                email=settings.FIRST_ADMIN_EMAIL,
                full_name="Administrator",
                hashed_password=get_password_hash(settings.FIRST_ADMIN_PASSWORD),
                role=UserRole.ADMIN,
            )
            db.add(admin)
            db.commit()
            logger.info(f"Default admin user created: {settings.FIRST_ADMIN_EMAIL}")
    finally:
        db.close()


@app.get("/", tags=["Health"])
def root():
    """Health check endpoint."""
    return {
        "status": "healthy",
        "service": settings.PROJECT_NAME,
        "version": settings.VERSION,
    }


@app.get("/api/health", tags=["Health"])
def health_check():
    """API health check."""
    return {"status": "ok"}
