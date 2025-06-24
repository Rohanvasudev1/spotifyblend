import { Routes, Route } from 'react-router-dom';
import Home     from './routes/Home';
import Callback from './routes/Callback';

export default function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 text-white">
      <Routes>
        <Route path="/"        element={<Home />} />
        <Route path="/callback" element={<Callback />} />
      </Routes>
    </div>
  );
}