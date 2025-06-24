# src/routes/data.py
import os
from fastapi import APIRouter, HTTPException, Header
from spotipy import Spotify
from typing import Optional

router = APIRouter()

def get_spotify_client(authorization: Optional[str] = Header(None)) -> Spotify:
    """Extract token from Authorization header and create Spotify client"""
    if not authorization:
        raise HTTPException(status_code=401, detail="Missing Authorization header")
    
    # Handle "Bearer <token>" format
    if authorization.startswith("Bearer "):
        token = authorization.replace("Bearer ", "")
    else:
        token = authorization
    
    if not token:
        raise HTTPException(status_code=401, detail="Invalid token")
    
    try:
        return Spotify(auth=token)
    except Exception as e:
        raise HTTPException(status_code=401, detail="Invalid or expired token")

@router.get("/top-tracks")
async def top_tracks(limit: int = 20):
    """Fetch the user's top tracks."""
    # Get token from header manually for better error handling
    from fastapi import Request
    
    async def _get_tracks(request: Request):
        authorization = request.headers.get("authorization")
        sp = get_spotify_client(authorization)
        
        try:
            resp = sp.current_user_top_tracks(limit=limit)
            return {
                "items": [
                    {
                        "id": t["id"],
                        "name": t["name"],
                        "artists": [{"name": a["name"]} for a in t["artists"]],
                        "album": {"name": t["album"]["name"]},
                        "preview_url": t.get("preview_url"),
                        "external_urls": t.get("external_urls", {}),
                        "duration_ms": t.get("duration_ms", 0)
                    }
                    for t in resp.get("items", [])
                ]
            }
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Failed to fetch tracks: {str(e)}")
    
    # This is a workaround - let's simplify
    pass

# Simpler version
@router.get("/top-tracks")
async def top_tracks(authorization: str = Header(..., alias="Authorization"), limit: int = 20):
    """Fetch the user's top tracks."""
    
    # Extract token from "Bearer <token>" format
    if authorization.startswith("Bearer "):
        token = authorization.replace("Bearer ", "")
    else:
        token = authorization
    
    try:
        sp = Spotify(auth=token)
        resp = sp.current_user_top_tracks(limit=limit)
        
        return {
            "items": [
                {
                    "id": t["id"],
                    "name": t["name"],
                    "artists": [{"name": a["name"]} for a in t["artists"]],
                    "album": {"name": t["album"]["name"]},
                    "preview_url": t.get("preview_url"),
                    "external_urls": t.get("external_urls", {}),
                    "duration_ms": t.get("duration_ms", 0),
                    "popularity": t.get("popularity", 0)
                }
                for t in resp.get("items", [])
            ],
            "total": resp.get("total", 0),
            "limit": resp.get("limit", limit)
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to fetch tracks: {str(e)}")

@router.get("/top-artists")
async def top_artists(authorization: str = Header(..., alias="Authorization"), limit: int = 20):
    """Fetch the user's top artists."""
    
    # Extract token from "Bearer <token>" format
    if authorization.startswith("Bearer "):
        token = authorization.replace("Bearer ", "")
    else:
        token = authorization
    
    try:
        sp = Spotify(auth=token)
        resp = sp.current_user_top_artists(limit=limit)
        
        return {
            "items": [
                {
                    "id": a["id"],
                    "name": a["name"],
                    "genres": a.get("genres", []),
                    "images": a.get("images", []),
                    "popularity": a.get("popularity", 0),
                    "followers": a.get("followers", {}).get("total", 0)
                }
                for a in resp.get("items", [])
            ],
            "total": resp.get("total", 0),
            "limit": resp.get("limit", limit)
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to fetch artists: {str(e)}")

@router.get("/user-profile")
async def user_profile(authorization: str = Header(..., alias="Authorization")):
    """Get current user's profile information."""
    
    # Extract token from "Bearer <token>" format
    if authorization.startswith("Bearer "):
        token = authorization.replace("Bearer ", "")
    else:
        token = authorization
    
    try:
        sp = Spotify(auth=token)
        user = sp.current_user()
        
        return {
            "id": user["id"],
            "display_name": user.get("display_name", ""),
            "email": user.get("email", ""),
            "images": user.get("images", []),
            "followers": user.get("followers", {}).get("total", 0),
            "country": user.get("country", ""),
            "product": user.get("product", "")
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to fetch user profile: {str(e)}")