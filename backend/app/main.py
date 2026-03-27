from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.responses import JSONResponse

from app.api.routes import router
from app.core.config import settings

app = FastAPI(
    title=settings.app_name,
    debug=settings.debug
)

# Mount static files
app.mount("/static", StaticFiles(directory="app/static"), name="static")

# Include API routes
app.include_router(router)


# Test root route
@app.get("/")
async def root():
    return JSONResponse({
        "message": "Greenware backend is running successfully"
    })


# Health check route
@app.get("/health")
async def health_check():
    return JSONResponse({
        "status": "ok",
        "app_name": settings.app_name,
        "debug": settings.debug
    })