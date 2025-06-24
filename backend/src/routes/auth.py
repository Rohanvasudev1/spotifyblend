# src/routes/auth.py

from fastapi import APIRouter, Query
from fastapi.responses import RedirectResponse
from spotipy.oauth2 import SpotifyOAuth
import os
import uuid

router = APIRouter()

@router.get("/login")
def login(user: str, t: str = Query(None)):
    """
    Login endpoint that forces a fresh Spotify login.
    - user: 'A' or 'B' to identify which user is logging in
    - t: timestamp to force fresh session (prevents caching)
    """
    # Generate a unique state to prevent CSRF and force fresh session
    unique_state = f"{user}_{uuid.uuid4().hex[:8]}_{t or ''}"
    
    oauth = SpotifyOAuth(
        client_id     = os.getenv("SPOTIPY_CLIENT_ID"),
        client_secret = os.getenv("SPOTIPY_CLIENT_SECRET"),
        redirect_uri  = os.getenv("REDIRECT_URI"),
        scope         = "user-top-read playlist-modify-public playlist-modify-private user-read-private user-read-email",
        state         = unique_state,
        show_dialog   = True,      # Force account chooser
        cache_path    = None       # Disable file caching
    )
    
    # Get the authorization URL
    auth_url = oauth.get_authorize_url()
    
    # Add additional parameters to force fresh login
    if "?" in auth_url:
        auth_url += "&approval_prompt=force&access_type=offline"
    else:
        auth_url += "?approval_prompt=force&access_type=offline"
    
    return RedirectResponse(auth_url)

@router.get("/callback")
def callback(code: str, state: str):
    """
    Callback endpoint that processes the Spotify authorization code
    and redirects back to the frontend with the access token.
    """
    try:
        # Extract the user from the state (format: "A_uniqueid_timestamp")
        user = state.split('_')[0] if '_' in state else state
        
        # Re-create the OAuth object (same settings) to redeem this code
        oauth = SpotifyOAuth(
            client_id     = os.getenv("SPOTIPY_CLIENT_ID"),
            client_secret = os.getenv("SPOTIPY_CLIENT_SECRET"),
            redirect_uri  = os.getenv("REDIRECT_URI"),
            cache_path    = None
        )
        
        # Exchange the code for tokens
        token_info = oauth.get_access_token(code, as_dict=True, check_cache=False)
        
        if not token_info:
            raise Exception("Failed to get access token")
        
        # Redirect back to React app with token in URL params
        frontend_url = os.getenv("FRONTEND_URL", "http://localhost:3000")
        redirect_url = (
            f"{frontend_url}/callback?"
            f"access_token={token_info['access_token']}&"
            f"state={user}&"
            f"expires_in={token_info['expires_in']}"
        )
        
        # Add refresh token if available
        if 'refresh_token' in token_info:
            redirect_url += f"&refresh_token={token_info['refresh_token']}"
        
        return RedirectResponse(redirect_url)
        
    except Exception as e:
        print(f"Auth callback error: {str(e)}")
        # If error, redirect to frontend with error
        frontend_url = os.getenv("FRONTEND_URL", "http://localhost:3000")
        return RedirectResponse(f"{frontend_url}/?error=auth_failed&message={str(e)}")

@router.get("/logout")
def logout():
    """
    Logout endpoint that helps clear Spotify session.
    This returns a page that tries to clear the Spotify session.
    """
    html_content = """
    <!DOCTYPE html>
    <html>
    <head>
        <title>Logging out...</title>
        <script>
            // Try to clear Spotify session
            window.onload = function() {
                // Clear any local storage
                if (typeof(Storage) !== "undefined") {
                    localStorage.clear();
                    sessionStorage.clear();
                }
                
                // Redirect to Spotify logout
                setTimeout(function() {
                    window.location.href = "https://accounts.spotify.com/logout";
                }, 1000);
            }
        </script>
    </head>
    <body>
        <p>Logging out...</p>
    </body>
    </html>
    """
    
    from fastapi.responses import HTMLResponse
    return HTMLResponse(content=html_content)

# To run: python -m uvicorn main:app --reload