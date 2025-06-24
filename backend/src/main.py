# src/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes.auth import router as auth_router
from routes.data import router as data_router
from routes.blend import router as blend_router

app = FastAPI(
    title="Spotify Blend API",
    description="Backend API for creating blended Spotify playlists",
    version="1.0.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",  # React dev server
        "http://127.0.0.1:3000",
        "http://localhost:3001",  # Alternative port
        # Add your production frontend URL here
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth_router, prefix="/auth", tags=["Authentication"])
app.include_router(data_router, prefix="/data", tags=["User Data"])
app.include_router(blend_router, prefix="/blend", tags=["Playlist Blending"])



@app.get("/", tags=["Health"])
async def root():
    return {
        "message": "Spotify Blend Backend Running",
        "version": "1.0.0",
        "status": "healthy"
    }

@app.get("/health", tags=["Health"])
async def health_check():
    return {"status": "healthy", "service": "spotify-blend-api"}

# To run: python -m uvicorn main:app --reload