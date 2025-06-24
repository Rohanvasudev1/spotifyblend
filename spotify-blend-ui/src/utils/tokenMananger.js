// src/utils/tokenManager.js

export const tokenManager = {
    /**
     * Check if a token is expired
     */
    isTokenExpired(user) {
      const expirationTime = localStorage.getItem(`token${user}_expires`);
      if (!expirationTime) return false; // If no expiration time, assume it's valid
      
      return Date.now() > parseInt(expirationTime);
    },
  
    /**
     * Get a valid token, refresh if needed
     */
    async getValidToken(user) {
      const token = localStorage.getItem(`token${user}`);
      if (!token) return null;
  
      // If token is not expired, return it
      if (!this.isTokenExpired(user)) {
        return token;
      }
  
      // Try to refresh the token
      const refreshToken = localStorage.getItem(`token${user}_refresh`);
      if (!refreshToken) {
        // No refresh token, user needs to log in again
        this.clearUserTokens(user);
        return null;
      }
  
      try {
        // Call backend to refresh token (you'd need to implement this endpoint)
        const response = await fetch(`${process.env.REACT_APP_API}/auth/refresh`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            refresh_token: refreshToken,
            user: user
          })
        });
  
        if (response.ok) {
          const data = await response.json();
          this.setUserTokens(user, data.access_token, data.expires_in, data.refresh_token);
          return data.access_token;
        } else {
          // Refresh failed, clear tokens
          this.clearUserTokens(user);
          return null;
        }
      } catch (error) {
        console.error('Token refresh failed:', error);
        this.clearUserTokens(user);
        return null;
      }
    },
  
    /**
     * Set user tokens in localStorage
     */
    setUserTokens(user, accessToken, expiresIn, refreshToken) {
      localStorage.setItem(`token${user}`, accessToken);
      
      if (expiresIn) {
        const expirationTime = Date.now() + (parseInt(expiresIn) * 1000);
        localStorage.setItem(`token${user}_expires`, expirationTime.toString());
      }
      
      if (refreshToken) {
        localStorage.setItem(`token${user}_refresh`, refreshToken);
      }
    },
  
    /**
     * Clear all tokens for a user
     */
    clearUserTokens(user) {
      localStorage.removeItem(`token${user}`);
      localStorage.removeItem(`token${user}_expires`);
      localStorage.removeItem(`token${user}_refresh`);
    },
  
    /**
     * Clear all tokens for all users
     */
    clearAllTokens() {
      ['A', 'B'].forEach(user => this.clearUserTokens(user));
      localStorage.removeItem('lastLoggedInUser');
    },
  
    /**
     * Get user info from token
     */
    async getUserInfo(user) {
      const token = await this.getValidToken(user);
      if (!token) return null;
  
      try {
        const response = await fetch(`${process.env.REACT_APP_API}/data/user-profile`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
  
        if (response.ok) {
          return await response.json();
        }
        return null;
      } catch (error) {
        console.error('Failed to get user info:', error);
        return null;
      }
    }
  };