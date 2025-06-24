import { useState, useEffect } from 'react';
import { Users } from 'lucide-react';
import LoginButton from '../components/LoginButton';
import Dashboard from '../components/Dashboard';

// Spotify Logo Component
const SpotifyLogo = ({ size = 24, className = "" }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
  >
    <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.42 1.56-.299.421-1.02.599-1.559.3z"/>
  </svg>
);

export default function Home() {
  const [tokenA, setTokenA] = useState(null);
  const [tokenB, setTokenB] = useState(null);

  // Load tokens from localStorage on component mount
  useEffect(() => {
    const loadTokens = () => {
      setTokenA(localStorage.getItem('tokenA'));
      setTokenB(localStorage.getItem('tokenB'));
    };
    
    loadTokens();
    
    // Listen for storage changes (in case user opens multiple tabs)
    window.addEventListener('storage', loadTokens);
    
    return () => {
      window.removeEventListener('storage', loadTokens);
    };
  }, []);

  // Handle token changes (login/logout)
  const handleTokenChange = (user, token) => {
    if (user === 'A') {
      setTokenA(token);
    } else if (user === 'B') {
      setTokenB(token);
    }
  };

  // Clear all tokens (logout all users)
  const clearAllTokens = () => {
    localStorage.removeItem('tokenA');
    localStorage.removeItem('tokenB');
    setTokenA(null);
    setTokenB(null);
    
    // Clear Spotify sessions
    const iframe = document.createElement('iframe');
    iframe.style.display = 'none';
    iframe.src = 'https://accounts.spotify.com/logout';
    document.body.appendChild(iframe);
    setTimeout(() => {
      document.body.removeChild(iframe);
    }, 1000);
  };

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center items-center space-x-3 mb-6">
            <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
              <SpotifyLogo size={24} className="text-white" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent">
              Spotify Blend
            </h1>
          </div>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Connect two Spotify accounts and create the perfect playlist that blends both of your music tastes together.
          </p>
        </div>

        {/* Clear All Button (only show if any user is logged in) */}
        {(tokenA || tokenB) && (
          <div className="text-center mb-8">
            <button
              onClick={clearAllTokens}
              className="bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 px-4 py-2 rounded-lg text-red-400 hover:text-red-300 transition-colors text-sm"
            >
              Clear All Connections
            </button>
          </div>
        )}

        {/* Login Section */}
        <div className="mb-12">
          <h2 className="text-2xl font-semibold text-center mb-8 text-white">Connect Your Accounts</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
            <LoginButton 
              user="A" 
              onTokenChange={handleTokenChange}
            />
            <LoginButton 
              user="B" 
              onTokenChange={handleTokenChange}
            />
          </div>
        </div>

        {/* Dashboard */}
        {tokenA && tokenB ? (
          <Dashboard tokenA={tokenA} tokenB={tokenB} />
        ) : (
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-gray-800/50 rounded-full flex items-center justify-center mx-auto mb-6">
              <Users size={40} className="text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Ready to Blend?</h3>
            <p className="text-gray-500">Connect both accounts to start creating your perfect playlist mix.</p>
            
            {/* Progress indicator */}
            <div className="flex justify-center mt-8 space-x-4">
              <div className={`w-3 h-3 rounded-full transition-colors ${tokenA ? 'bg-green-500' : 'bg-white/20'}`} />
              <div className={`w-3 h-3 rounded-full transition-colors ${tokenB ? 'bg-blue-500' : 'bg-white/20'}`} />
            </div>
            <p className="text-sm text-gray-600 mt-2">
              {tokenA && !tokenB ? 'User A connected. Connect User B to continue.' : 
               !tokenA && tokenB ? 'User B connected. Connect User A to continue.' : 
               'Connect both users to get started'}
            </p>
            
            {/* Instructions */}
            <div className="mt-8 max-w-md mx-auto text-left">
              <div className="bg-gray-800/30 rounded-lg p-4 text-sm text-gray-400">
                <h4 className="font-semibold text-white mb-2">How it works:</h4>
                <ol className="space-y-1">
                  <li>1. Connect User A's Spotify account</li>
                  <li>2. Connect User B's Spotify account</li>
                  <li>3. View both users' top tracks</li>
                  <li>4. Create a blended playlist</li>
                </ol>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}