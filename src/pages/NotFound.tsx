import { useNavigate } from 'react-router-dom';

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="not-found-container">
      <h1>404 - Not Found</h1>
      <p>Sorry, the page you are looking for does not exist.</p>
      <button
        onClick={() => navigate('/')}
        className="button primary"
      >
        Return to Home
      </button>
    </div>
  );
};

export default NotFound;