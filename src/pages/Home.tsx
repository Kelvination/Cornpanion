import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAtom } from 'jotai';
import { appModeAtom } from '../store/atoms';
import { useLobby } from '../hooks/useLobby';

const Home = () => {
  const navigate = useNavigate();
  const [, setAppMode] = useAtom(appModeAtom);
  const { createLobby, isLoading, error } = useLobby();

  // Handler for Host Game button
  const handleHostGame = useCallback(async () => {
    setAppMode('host');
    const lobbyId = await createLobby();

    if (lobbyId) {
      navigate('/lobby');
    }
  }, [setAppMode, createLobby, navigate]);

  // Handler for Join Game button
  const handleJoinGame = useCallback(() => {
    const lobbyCode = prompt('Enter 4-character lobby code:');

    if (lobbyCode && lobbyCode.length === 4) {
      setAppMode('join');
      navigate('/lobby', { state: { lobbyCode } });
    } else if (lobbyCode !== null) {
      alert('Please enter a valid 4-character lobby code.');
    }
  }, [setAppMode, navigate]);

  // Handler for Solo Game button
  const handleSoloGame = useCallback(() => {
    setAppMode('solo');
    navigate('/game');
  }, [setAppMode, navigate]);

  // Handler for About button
  const handleAbout = useCallback(() => {
    navigate('/about');
  }, [navigate]);

  return (
    <div className="home-container">
      <header>
        <h1>Cornpanion</h1>
        <h2>Cornhole Scoreboard</h2>
      </header>

      <main className="button-container">
        <button
          onClick={handleHostGame}
          disabled={isLoading}
          className="button primary"
        >
          {isLoading ? 'Creating...' : 'Host Game'}
        </button>

        <button
          onClick={handleJoinGame}
          disabled={isLoading}
          className="button secondary"
        >
          Join Game
        </button>

        <button
          onClick={handleSoloGame}
          disabled={isLoading}
          className="button tertiary"
        >
          Solo Game
        </button>

        <button
          onClick={handleAbout}
          className="button info"
        >
          About
        </button>
      </main>

      {error && <div className="error-message">{error}</div>}

      <footer>
        <p>A Cornhole Scoreboard PWA</p>
      </footer>
    </div>
  );
};

export default Home;