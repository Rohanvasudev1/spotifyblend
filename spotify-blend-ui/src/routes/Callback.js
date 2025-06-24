import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

export default function Callback() {
  const nav = useNavigate();
  const loc = useLocation();
  const [error, setError] = useState(null);
  const [isProcessing, setIsProcessing] = useState(true);

  useEffect(() => {
    const params = new URLSearchParams(loc.search);
    const token = params.get('access_token');
    const user = params.get('state'); // 'A' or 'B'
    const expiresIn = params.get('expires_in');
    const refreshToken = params.get('refresh_token');
    const errorParam = params.get('error');
    const errorMessage = params.get('message');

    // Handle errors
    if (errorParam) {
      setError(errorMessage || 'Authentication failed');
      setIsProcessing(false);
      setTimeout(() => {
        nav('/', { replace: true });
      }, 3000);
      return;
    }

    // Handle successful authentication
    if (token && user) {
      try {
        // Store the access token
        localStorage.setItem(`token${user}`, token);
        
        // Store additional token info if available
        if (expiresIn) {
          const expirationTime = Date.now() + (parseInt(expiresIn) * 1000);
          localStorage.setItem(`token${user}_expires`, expirationTime.toString());
        }
        
        if (refreshToken) {
          localStorage.setItem(`token${user}_refresh`, refreshToken);
        }

        // Store user info to show which user just logged in
        localStorage.setItem('lastLoggedInUser', user);

        // Success - redirect to home
        setTimeout(() => {
          nav('/', { replace: true });
        }, 1500);

      } catch (err) {
        setError('Failed to save authentication data');
        setIsProcessing(false);
        setTimeout(() => {
          nav('/', { replace: true });
        }, 3000);
      }
    } else {
      setError('Missing authentication data');
      setIsProcessing(false);
      setTimeout(() => {
        nav('/', { replace: true });
      }, 3000);
    }
  }, [loc, nav]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto">
            <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <div>
            <h2 className="text-xl font-semibold text-white mb-2">Authentication Failed</h2>
            <p className="text-gray-400 mb-4">{error}</p>
            <p className="text-sm text-gray-500">Redirecting you back...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center space-y-4">
        <div className="w-16 h-16 border-4 border-white/20 border-t-green-500 rounded-full animate-spin mx-auto" />
        <div>
          <h2 className="text-xl font-semibold text-white mb-2">
            {isProcessing ? 'Connecting your account...' : 'Success!'}
          </h2>
          <p className="text-gray-400">
            {isProcessing 
              ? 'Please wait while we set up your connection'
              : 'Redirecting you back to the app'
            }
          </p>
        </div>
      </div>
    </div>
  );
}