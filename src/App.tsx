import { useAtom } from 'jotai';
import { useEffect } from 'react';
import { Route, BrowserRouter as Router, Routes, useNavigate, useSearchParams } from 'react-router-dom';
import { appModeAtom, currentLobbyIdAtom } from './store/atoms';

// Pages
import About from './pages/About.tsx';
import Home from './pages/Home.tsx';
import LobbySetup from './pages/LobbySetup.tsx';
import NotFound from './pages/NotFound.tsx';
import Scoreboard from './pages/Scoreboard.tsx';

// Redirect component to handle URL parameters
const RedirectHandler = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [, setAppMode] = useAtom(appModeAtom);
  const [, setCurrentLobbyId] = useAtom(currentLobbyIdAtom);

  useEffect(() => {
    // Check for join parameter in URL
    const joinCode = searchParams.get('join');
    if (joinCode) {
      setAppMode('join');
      setCurrentLobbyId(joinCode);
      navigate('/lobby');
      return;
    }

    // Check for mode parameter in URL
    const mode = searchParams.get('mode');
    if (mode === 'host') {
      setAppMode('host');
      navigate('/lobby');
    } else if (mode === 'solo') {
      setAppMode('solo');
      navigate('/game');
    }
  }, [searchParams, navigate, setAppMode, setCurrentLobbyId]);

  return null;
};

function App() {
  // Check for user name on first load
  // const [userName, setUserName] = useAtom(userNameAtom); // Keep atom if needed elsewhere, but remove prompt logic

  return (
    <Router basename="/Cornpanion">
      <RedirectHandler />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/lobby" element={<LobbySetup />} />
        <Route path="/game" element={<Scoreboard />} />
        <Route path="/about" element={<About />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}

export default App;