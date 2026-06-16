import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';

interface NavbarProps {
  isAuthenticated?: boolean;
}

export function Navbar({ isAuthenticated = false }: NavbarProps) {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  function logout() {
    localStorage.removeItem('accessToken');
    navigate('/');
  }

  return (
    <header className="navbar">
      <Link to="/" className="navbar__brand">
        <span className="navbar__logo">P</span>
        <span>Portfolio Manager</span>
      </Link>

      {isAuthenticated && (
        <nav className="navbar__links">
          <NavLink to="/dashboard">Dashboard</NavLink>
          <NavLink to="/investments">Investments</NavLink>
          <NavLink to="/transactions">Transactions</NavLink>
        </nav>
      )}

      <div className="navbar__actions">
        <button
          type="button"
          className="theme-toggle"
          onClick={toggleTheme}
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? '🌙 Dark' : '☀️ Light'}
        </button>

        {isAuthenticated ? (
          <button type="button" className="button button--dark" onClick={logout}>
            Logout
          </button>
        ) : (
          <Link to="/login" className="button button--dark">
            Login
          </Link>
        )}
      </div>
    </header>
  );
}