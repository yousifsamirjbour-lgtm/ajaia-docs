import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

from backend.database import init_db
from backend.router import router

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: initialize database tables and seed if empty
    await init_db()
    yield
    # Shutdown logic if any

app = FastAPI(
    title="Ajaia Docs API",
    description="Collaborative AI-Native Document Workspace",
    version="1.0.0",
    lifespan=lifespan
)

# CORS configuration
allowed_origins_env = os.getenv("ALLOWED_ORIGINS", "*")
origins = [origin.strip() for origin in allowed_origins_env.split(",") if origin.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins if origins != ["*"] else ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API Router
app.include_router(router)

# Production Frontend Static Serving
# Check possible frontend dist locations
FRONTEND_DIST_PATHS = [
    os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "frontend", "dist")),
    os.path.abspath(os.path.join(os.path.dirname(__file__), "dist")),
    os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "dist")),
]

dist_dir = None
for p in FRONTEND_DIST_PATHS:
    if os.path.isdir(p) and os.path.isfile(os.path.join(p, "index.html")):
        dist_dir = p
        break

if dist_dir:
    # Mount assets if directory exists
    assets_dir = os.path.join(dist_dir, "assets")
    if os.path.isdir(assets_dir):
        app.mount("/assets", StaticFiles(directory=assets_dir), name="assets")

    @app.get("/{full_path:path}")
    async def serve_spa(full_path: str):
        # If API route, let router handle or 404
        if full_path.startswith("api/"):
            return {"detail": "Not Found"}
        target_file = os.path.join(dist_dir, full_path)
        if os.path.isfile(target_file):
            return FileResponse(target_file)
        return FileResponse(os.path.join(dist_dir, "index.html"))
