from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import logging

from src.config import settings
from src.supabase import check_supabase_connection
from src.block.router import router as block_router
from src.tag.router import router as tag_router
from src.analytics.router import router as analytics_router
from src.weekly_goals.router import router as weekly_goals_router
from src.task_blueprint.router import router as task_blueprint_router
from src.backlog.router import router as backlog_router
from src.access.router import router as access_router

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    datefmt='%Y-%m-%d %H:%M:%S'
)

# Set log level based on environment
if settings.ENVIRONMENT == "development":
    logging.getLogger().setLevel(logging.INFO)
    logging.getLogger("src").setLevel(logging.INFO)


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    print("Starting up FastAPI application...")
    yield
    # Shutdown
    print("Shutting down FastAPI application...")


app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    openapi_url=f"{settings.API_V1_STR}/openapi.json" if settings.ENVIRONMENT != "production" else None,
    docs_url="/docs" if settings.ENVIRONMENT != "production" else None,
    redoc_url="/redoc" if settings.ENVIRONMENT != "production" else None,
    lifespan=lifespan
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_origin_regex=r"chrome-extension://.*",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(block_router, prefix=f"{settings.API_V1_STR}/blocks", tags=["blocks"])
app.include_router(tag_router, prefix=f"{settings.API_V1_STR}/tags", tags=["tags"])
app.include_router(analytics_router, prefix=f"{settings.API_V1_STR}/analytics", tags=["analytics"])
app.include_router(weekly_goals_router, prefix=f"{settings.API_V1_STR}/weekly-goals", tags=["weekly-goals"])
app.include_router(task_blueprint_router, prefix=f"{settings.API_V1_STR}/task-blueprints", tags=["task-blueprints"])
app.include_router(backlog_router, prefix=f"{settings.API_V1_STR}/backlog", tags=["backlog"])
app.include_router(access_router, prefix=f"{settings.API_V1_STR}/access", tags=["access"])


@app.get("/")
async def root():
    return {
        "message": "Welcome to HourBloc API",
        "version": settings.VERSION,
        "docs": "/docs"
    }


@app.get("/health")
async def health_check():
    return {"status": "healthy"}


@app.get("/health/supabase")
async def supabase_health_check():
    """
    Check Supabase connection status
    """
    return check_supabase_connection()


