import { useState } from 'react';
import { Check, LogOut } from 'lucide-react';

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

export default function LoginButton({ user, onTokenChange }) {
  const [isLoading, setIsLoading] = useState(false);
  
  // Check if user is already logged in
  const token = localStorage.getItem(`token${user}`);
  const isLoggedIn = !!token;

  

  const login = () => {
    console.log("🔥 login() fired for user", user);
    setIsLoading(true);
    const timestamp = Date.now();
    const target = `${process.env.REACT_APP_API}/auth/login?user=${user}&t=${timestamp}`;
    console.log("→ redirecting to", target);
    window.location.href = target;
  };
  

  const logout = () => {
    localStorage.removeItem(`token${user}`);
    // Trigger parent component to update state
    if (onTokenChange) {
      onTokenChange(user, null);
    }
    
    // Optional: Clear Spotify session by opening logout URL in hidden iframe
    const iframe = document.createElement('iframe');
    iframe.style.display = 'none';
    iframe.src = 'https://accounts.spotify.com/logout';
    document.body.appendChild(iframe);
    setTimeout(() => {
      document.body.removeChild(iframe);
    }, 1000);
  };

  if (isLoggedIn) {
    return (
      <div className="flex items-center justify-between bg-green-500/10 border border-green-500/20 rounded-xl px-6 py-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
            <Check size={20} className="text-white" />
          </div>
          <div>
            <div className="font-semibold text-green-400">User {user}</div>
            <div className="text-sm text-green-300">Connected</div>
          </div>
        </div>
        <button
          onClick={logout}
          className="p-2 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 rounded-lg transition-colors"
          title="Logout"
        >
          <LogOut size={16} className="text-red-400" />
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={login}
      disabled={isLoading}
      className="group bg-gray-800/50 hover:bg-gray-700/50 border border-gray-600/30 hover:border-gray-500/50 rounded-xl px-6 py-4 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 bg-gradient-to-r from-green-400 to-green-600 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
          {isLoading ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <SpotifyLogo size={20} className="text-white" />
          )}
        </div>
        <div className="text-left">
          <div className="font-semibold text-white">Connect User {user}</div>
          <div className="text-sm text-gray-400">Login with Spotify</div>
        </div>
      </div>
    </button>
  );
}