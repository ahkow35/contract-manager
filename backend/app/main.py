"""FastAPI application entry point."""

import logging
import os
from pathlib import Path
from alembic.config import Config as AlembicConfig
from alembic import command as alembic_command
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

from app.api.routes import documents, health, templates, auth, admin, analytics, drafts
from app.config import settings
from app.logging_config import configure_logging

configure_logging(debug=settings.debug)

# Run database migrations on startup
_logger = logging.getLogger(__name__)

# Ensure data directory exists
_db_path = os.environ.get("DATABASE_PATH", "./data/sql_app.db")
os.makedirs(os.path.dirname(os.path.abspath(_db_path)), exist_ok=True)

# Run migrations with error handling
_alembic_ini = os.path.join(os.path.dirname(__file__), "..", "alembic.ini")
_alembic_cfg = AlembicConfig(_alembic_ini)
try:
    # Detect existing databases created before Alembic was introduced.
    # If the users table exists but alembic_version does not, the DB was
    # bootstrapped with Base.metadata.create_all().  Stamp it at the
    # initial_schema revision so Alembic skips table creation and only
    # applies the subsequent migrations (is_admin, password_reset_tokens).
    import sqlite3 as _sqlite3
    _conn = _sqlite3.connect(_db_path)
    _tables = {r[0] for r in _conn.execute("SELECT name FROM sqlite_master WHERE type='table'").fetchall()}
    _conn.close()
    if "users" in _tables and "alembic_version" not in _tables:
        _logger.info("Existing pre-Alembic database detected — stamping initial_schema revision")
        alembic_command.stamp(_alembic_cfg, "a274d593a41a")
    alembic_command.upgrade(_alembic_cfg, "head")
    _logger.info("Database migrations completed successfully")
except Exception as _e:
    _logger.error("Failed to run database migrations: %s", _e, exc_info=True)
    raise

app = FastAPI(
    title="Highlight Edit API",
    description="API for extracting and editing highlighted document sections",
    version="0.1.0",
)

# CORS configuration - allow multiple origins for development
app.add_middleware(
    CORSMiddleware,
    allow_origins=[o.strip() for o in settings.allowed_origins.split(",")],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register API routes
app.include_router(health.router, tags=["health"])
app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(documents.router, prefix="/api/documents", tags=["documents"])
app.include_router(templates.router, prefix="/api/templates", tags=["templates"])
app.include_router(admin.router, prefix="/api/admin", tags=["admin"])
app.include_router(analytics.router, prefix="/api/analytics", tags=["analytics"])
app.include_router(drafts.router, prefix="/api/drafts", tags=["drafts"])

# Serve static frontend files if the static directory exists (Docker deployment)
STATIC_DIR = Path(__file__).parent.parent / "static"
if STATIC_DIR.exists():
    # Mount static assets (JS, CSS, images)
    app.mount("/assets", StaticFiles(directory=STATIC_DIR / "assets"), name="assets")
    
    # Catch-all route for SPA - must be after API routes
    @app.get("/{full_path:path}")
    async def serve_spa(request: Request, full_path: str):
        """Serve the SPA for any non-API route."""
        # Check if it's a static file
        file_path = STATIC_DIR / full_path
        if file_path.is_file():
            return FileResponse(file_path)
        # Otherwise serve index.html for client-side routing
        return FileResponse(STATIC_DIR / "index.html")
else:
    # Development mode - just show API info at root
    @app.get("/")
    async def root():
        return {"message": "Highlight Edit API", "version": "0.1.0"}

