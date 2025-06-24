from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from spotipy import Spotify
from typing import Optional
import random

router = APIRouter()

class BlendRequest(BaseModel):
    token_a: str
    token_b: str
    playlist_name: str
    tracks_per_user: Optional[int] = 25
    blend_style: Optional[str] = "interleave"  # "interleave", "shuffle", "popularity"
    playlist_description: Optional[str] = None

@router.post("/")
async def create_blend(req: BlendRequest):
    try:
        # Instantiate two Spotify clients
        sp_a = Spotify(auth=req.token_a)
        sp_b = Spotify(auth=req.token_b)

        # Get user info for playlist description
        user_a = sp_a.current_user()
        user_b = sp_b.current_user()
        
        # 1) Fetch top tracks
        top_a = sp_a.current_user_top_tracks(limit=req.tracks_per_user)["items"]
        top_b = sp_b.current_user_top_tracks(limit=req.tracks_per_user)["items"]

        if not top_a or not top_b:
            raise HTTPException(status_code=400, detail="One or both users have no top tracks")

        # 2) Extract track URIs and metadata
        tracks_a = [
            {
                "uri": t["uri"],
                "name": t["name"],
                "artist": t["artists"][0]["name"],
                "popularity": t.get("popularity", 0)
            }
            for t in top_a
        ]
        
        tracks_b = [
            {
                "uri": t["uri"],
                "name": t["name"], 
                "artist": t["artists"][0]["name"],
                "popularity": t.get("popularity", 0)
            }
            for t in top_b
        ]

        # 3) Blend tracks based on style
        if req.blend_style == "interleave":
            # Simple interleaving merge
            merged = []
            for a, b in zip(tracks_a, tracks_b):
                merged.extend([a["uri"], b["uri"]])
            # Add remaining tracks
            if len(tracks_a) > len(tracks_b):
                merged.extend([t["uri"] for t in tracks_a[len(tracks_b):]])
            elif len(tracks_b) > len(tracks_a):
                merged.extend([t["uri"] for t in tracks_b[len(tracks_a):]])
                
        elif req.blend_style == "shuffle":
            # Combine and shuffle
            all_tracks = tracks_a + tracks_b
            random.shuffle(all_tracks)
            merged = [t["uri"] for t in all_tracks]
            
        elif req.blend_style == "popularity":
            # Sort by popularity and alternate
            tracks_a_sorted = sorted(tracks_a, key=lambda x: x["popularity"], reverse=True)
            tracks_b_sorted = sorted(tracks_b, key=lambda x: x["popularity"], reverse=True)
            merged = []
            for a, b in zip(tracks_a_sorted, tracks_b_sorted):
                merged.extend([a["uri"], b["uri"]])
        else:
            # Default to interleave
            merged = []
            for a, b in zip(tracks_a, tracks_b):
                merged.extend([a["uri"], b["uri"]])

        # Remove duplicates while preserving order
        seen = set()
        unique_merged = []
        for uri in merged:
            if uri not in seen:
                seen.add(uri)
                unique_merged.append(uri)

        # 4) Create playlist description
        if not req.playlist_description:
            description = f"A blend of {user_a.get('display_name', 'User A')} and {user_b.get('display_name', 'User B')}'s music taste. Created with Spotify Blend."
        else:
            description = req.playlist_description

        # 5) Create playlist in user A's account
        playlist = sp_a.user_playlist_create(
            user_a["id"], 
            req.playlist_name, 
            public=False,
            description=description
        )

        # 6) Add tracks in batches of 100 max (Spotify API limit)
        batch_size = 100
        for i in range(0, len(unique_merged), batch_size):
            batch = unique_merged[i:i + batch_size]
            sp_a.playlist_add_items(playlist["id"], batch)

        # 7) Return comprehensive response
        return {
            "success": True,
            "playlist_id": playlist["id"],
            "playlist_url": playlist["external_urls"]["spotify"],
            "playlist_name": req.playlist_name,
            "total_tracks": len(unique_merged),
            "tracks_from_user_a": len(tracks_a),
            "tracks_from_user_b": len(tracks_b),
            "user_a_name": user_a.get("display_name", "User A"),
            "user_b_name": user_b.get("display_name", "User B"),
            "blend_style": req.blend_style
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create blend: {str(e)}")

@router.get("/compatibility")
async def get_compatibility(token_a: str, token_b: str):
    """Calculate music compatibility between two users based on shared artists/genres"""
    try:
        sp_a = Spotify(auth=token_a)
        sp_b = Spotify(auth=token_b)
        
        # Get top artists for both users
        artists_a = sp_a.current_user_top_artists(limit=50)["items"]
        artists_b = sp_b.current_user_top_artists(limit=50)["items"]
        
        # Extract artist IDs and genres
        artist_ids_a = {a["id"] for a in artists_a}
        artist_ids_b = {a["id"] for a in artists_b}
        
        genres_a = set()
        genres_b = set()
        
        for artist in artists_a:
            genres_a.update(artist.get("genres", []))
        for artist in artists_b:
            genres_b.update(artist.get("genres", []))
        
        # Calculate compatibility
        shared_artists = len(artist_ids_a.intersection(artist_ids_b))
        shared_genres = len(genres_a.intersection(genres_b))
        
        # Simple compatibility score (you can make this more sophisticated)
        artist_compatibility = (shared_artists / max(len(artist_ids_a), len(artist_ids_b))) * 100
        genre_compatibility = (shared_genres / max(len(genres_a), len(genres_b))) * 100
        
        overall_compatibility = (artist_compatibility + genre_compatibility) / 2
        
        return {
            "compatibility_score": round(overall_compatibility),
            "shared_artists": shared_artists,
            "shared_genres": shared_genres,
            "total_artists_a": len(artist_ids_a),
            "total_artists_b": len(artist_ids_b),
            "total_genres_a": len(genres_a),
            "total_genres_b": len(genres_b),
            "common_genres": list(genres_a.intersection(genres_b))[:10]  # Top 10
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to calculate compatibility: {str(e)}")