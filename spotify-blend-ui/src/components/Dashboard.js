import { useState, useEffect } from 'react';
import { Users, Play, ExternalLink, Check, Sparkles } from 'lucide-react';
import API from '../utils/api';

export default function Dashboard({ tokenA, tokenB }) {
  const [topA, setTopA] = useState([]);
  const [topB, setTopB] = useState([]);
  const [blendUrl, setUrl] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    Promise.all([
      API.get('/data/top-tracks', { headers: { Authorization: `Bearer ${tokenA}` }}),
      API.get('/data/top-tracks', { headers: { Authorization: `Bearer ${tokenB}` }})
    ]).then(([responseA, responseB]) => {
      setTopA(responseA.data.items);
      setTopB(responseB.data.items);
      setIsLoading(false);
    }).catch(() => {
      setIsLoading(false);
    });
  }, [tokenA, tokenB]);

  const createBlend = () => {
    setIsCreating(true);
    API.post('/blend/', {
      token_a: tokenA,
      token_b: tokenB,
      playlist_name: 'A + B Blend'
    }).then(r => {
      setUrl(r.data.playlist_url);
      setIsCreating(false);
    }).catch(() => {
      setIsCreating(false);
    });
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12 space-y-4">
        <div className="w-12 h-12 border-4 border-white/20 border-t-green-500 rounded-full animate-spin" />
        <p className="text-gray-400">Loading your music taste...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="flex justify-center items-center space-x-2 mb-4">
          <Users className="text-green-400" size={24} />
          <h2 className="text-2xl font-bold">Your Music Blend</h2>
        </div>
        <p className="text-gray-400">Here are your top tracks. Ready to create something amazing together?</p>
      </div>

      {/* Top Tracks Comparison */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User A */}
        <div className="bg-gray-900/80 backdrop-blur-lg rounded-2xl p-6 border border-gray-700/50">
          <h3 className="text-xl font-semibold mb-4 text-green-400">User A's Top Tracks</h3>
          <div className="space-y-3">
            {topA.slice(0, 5).map((track, index) => (
              <div key={track.id} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-800/50 transition-colors">
                <div className="w-8 h-8 bg-gradient-to-r from-green-400 to-green-600 rounded-full flex items-center justify-center text-sm font-bold text-white">
                  {index + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-white truncate">{track.name}</div>
                  <div className="text-sm text-gray-400 truncate">
                    {track.artists?.map(artist => artist.name).join(', ') || 'Unknown Artist'}
                  </div>
                </div>
                <Play size={16} className="text-gray-400 hover:text-white cursor-pointer" />
              </div>
            ))}
          </div>
        </div>

        {/* User B */}
        <div className="bg-gray-900/80 backdrop-blur-lg rounded-2xl p-6 border border-gray-700/50">
          <h3 className="text-xl font-semibold mb-4 text-blue-400">User B's Top Tracks</h3>
          <div className="space-y-3">
            {topB.slice(0, 5).map((track, index) => (
              <div key={track.id} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-800/50 transition-colors">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-sm font-bold text-white">
                  {index + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-white truncate">{track.name}</div>
                  <div className="text-sm text-gray-400 truncate">
                    {track.artists?.map(artist => artist.name).join(', ') || 'Unknown Artist'}
                  </div>
                </div>
                <Play size={16} className="text-gray-400 hover:text-white cursor-pointer" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Create Blend Button */}
      <div className="text-center">
        <button
          onClick={createBlend}
          disabled={isCreating}
          className="group bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 px-8 py-4 rounded-full font-semibold text-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 disabled:hover:scale-100"
        >
          <div className="flex items-center space-x-3">
            {isCreating ? (
              <>
                <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Creating Your Blend...</span>
              </>
            ) : (
              <>
                <Sparkles size={24} />
                <span>Create Blend Playlist</span>
              </>
            )}
          </div>
        </button>
      </div>

      {/* Blend Result */}
      {blendUrl && (
        <div className="bg-gradient-to-r from-green-500/10 to-blue-500/10 border border-green-500/20 rounded-2xl p-6 text-center space-y-4">
          <div className="flex justify-center">
            <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center">
              <Check size={32} className="text-white" />
            </div>
          </div>
          <div>
            <h3 className="text-xl font-bold text-white mb-2">Your Blend is Ready! 🎉</h3>
            <p className="text-gray-400 mb-4">Your personalized playlist has been created and saved to your Spotify account.</p>
            <a
              href={blendUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center space-x-2 bg-green-500 hover:bg-green-600 px-6 py-3 rounded-full font-semibold text-white transition-colors"
            >
              <ExternalLink size={20} />
              <span>Open in Spotify</span>
            </a>
          </div>
        </div>
      )}
    </div>
  );
}