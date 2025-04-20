import { useNavigate } from 'react-router-dom';

const About = () => {
  const navigate = useNavigate();

  return (
    <div className="about-container">
      <header>
        <button onClick={() => navigate(-1)} className="back-button">
          ← Back
        </button>
        <h1>About Cornpanion</h1>
      </header>

      <div className="about-content">
        <div className="about-section">
          <h2>How to Play</h2>
          <p>
            Cornpanion is a digital scoreboard for tracking cornhole games. The app offers three modes:
          </p>
          <ul>
            <li>
              <strong>Solo Mode</strong>: Track scores offline on a single device
            </li>
            <li>
              <strong>Host Game</strong>: Create a game room and share a 4-character code for others to join
            </li>
            <li>
              <strong>Join Game</strong>: Enter a code to join a hosted game and view the scores in real-time
            </li>
          </ul>
        </div>

        <div className="about-section">
          <h2>Game Rules</h2>
          <h3>Score Limit</h3>
          <p>
            The default score limit is 21 points. The first team to reach or exceed this score wins the game.
            This can be configured when setting up a game.
          </p>

          <h3>Bust Rule</h3>
          <p>
            When enabled, if a team exceeds the score limit after adding points, their score resets to the
            bust reset score (default: 15). This rule can be toggled when setting up a game.
          </p>

          <h3>Scoring</h3>
          <ul>
            <li>
              <strong>Bag on Board</strong>: 1 point
            </li>
            <li>
              <strong>Bag in Hole</strong>: 3 points
            </li>
          </ul>
        </div>

        <div className="about-section">
          <h2>Math Mode</h2>
          <p>
            Math Mode simplifies scoring by calculating the net points after each round:
          </p>
          <ol>
            <li>Enter the number of bags on board (1pt) and in hole (3pts) for each team</li>
            <li>The app calculates the raw score for each team</li>
            <li>The net difference is awarded to the team with the higher score</li>
            <li>If scores are equal, no points are awarded</li>
          </ol>
          <p>
            For example, if Team 1 scores 7 points and Team 2 scores 4 points in a round,
            Team 1 is awarded 3 points (7-4).
          </p>
        </div>

        <div className="about-section">
          <h2>PWA Features</h2>
          <p>
            Cornpanion is a Progressive Web App (PWA) that can be installed on your device for offline use:
          </p>
          <ul>
            <li>Install on your home screen for app-like experience</li>
            <li>Solo mode works completely offline</li>
            <li>Responsive design works on all devices</li>
          </ul>
        </div>

        <div className="about-section">
          <h2>About the Project</h2>
          <p>
            Cornpanion was developed as a PWA demo using React, Firebase Realtime Database, and Jotai for state management.
            The project is open source and contributions are welcome.
          </p>
          <p>
            &copy; 2025 • Version 1.0
          </p>
        </div>
      </div>
    </div>
  );
};

export default About;