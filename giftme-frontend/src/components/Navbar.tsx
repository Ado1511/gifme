import { Link, useNavigate } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import { useState } from 'react';
import { useAuth } from '../Hooks/useAuth';
import { useNotification } from '../contexts/NotificationContext';

function Navbar() {
  const { toggleTheme } = useTheme();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { unreadCount } = useNotification();
  const [search, setSearch] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (search.trim()) {
      navigate(`/explore?q=${encodeURIComponent(search.trim())}`);
      setSearch('');
      setMenuOpen(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    logout();
    navigate('/login');
    setMenuOpen(false);
  };

  return (
    <nav className="sticky top-0 z-50 px-4 py-3 bg-white shadow dark:bg-darkBackground">
      <div className="flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="text-2xl font-bold text-accent">
          GifME
        </Link>

        {/* Hamburger (mobile) */}
        <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden focus:outline-none">
          <svg className="w-6 h-6 text-foreground dark:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {menuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>

        {/* Desktop nav */}
        <div className="items-center hidden gap-3 md:flex bg-white/70 dark:bg-[#1f1f1f]/70 backdrop-blur-md px-4 py-2 rounded-full shadow border border-gray-200 dark:border-[#444]">
          {user && (
            <form onSubmit={handleSearch} className="relative mr-4">
              <input
                type="text"
                placeholder="Search..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="px-3 py-1.5 rounded-full text-sm border border-gray-300 dark:border-gray-600 dark:bg-[#2a2a2a] focus:outline-none"
              />
            </form>
          )}

          {user ? (
            <>
              <Link to="/explore" title="Explore" aria-label="Explore">
                <img src="https://media.giphy.com/media/anRNFRN2dEka0Q3c1V/giphy.gif" alt="Explore" className="w-8 h-8 rounded-full hover:ring hover:ring-accent" />
              </Link>
              <Link to="/upload" title="Upload" aria-label="Upload">
                <img src="https://media.giphy.com/media/zt5IskYK0eJco0MI7o/giphy.gif" alt="Upload" className="w-8 h-8 rounded-full hover:ring hover:ring-accent" />
              </Link>
              <Link to={`/profile/${user.username}`} title="Profile" aria-label="Profile">
                <img src={user.avatar || 'https://media.giphy.com/media/ICOgUNjpvO0PC/giphy.gif'} alt="Profile" className="w-8 h-8 rounded-full border-2 border-white dark:border-[#AA90FB] hover:ring hover:ring-accent" />
              </Link>
              <Link to="/settings" title="Settings" aria-label="Settings">
                <img src="https://media.giphy.com/media/jQ8sGUX6xYTfchDsCw/giphy.gif" alt="Settings" className="w-8 h-8 rounded-full hover:ring hover:ring-accent" />
              </Link>
              <Link to="/notifications" title="Notifications" aria-label="Notifications" className="relative">
                <img src="https://media.giphy.com/media/fwcuq9F85MeQF6CVLa/giphy.gif" alt="Notifications" className="w-8 h-8 rounded-full hover:ring hover:ring-accent" />
                {unreadCount > 0 && (
                  <span className="absolute top-0 right-0 inline-block px-1 text-xs font-bold text-white transform translate-x-1/2 -translate-y-1/2 bg-red-500 rounded-full">
                    {unreadCount}
                  </span>
                )}
              </Link>
              <button onClick={handleLogout} title="Logout" aria-label="Logout">
                <img src="https://media.giphy.com/media/dkEMVTkDnh27CmJ1HJ/giphy.gif" alt="Logout" className="w-8 h-8 rounded-full hover:ring hover:ring-red-500" />
              </button>
            </>
          ) : (
            <>
              <Link to="/register" className="px-4 py-2 font-bold text-white rounded-full bg-accent hover:opacity-90">Register</Link>
              <Link to="/login" className="px-4 py-2 font-bold text-white rounded-full bg-accent hover:opacity-90">Login</Link>
            </>
          )}
          <button onClick={toggleTheme} title="Toggle Theme" aria-label="Toggle Theme">
            <img src="https://media.giphy.com/media/hXNnWyUAKll9nJhL8l/giphy.gif" alt="Theme" className="w-8 h-8 rounded-full hover:ring hover:ring-purple-400" />
          </button>
        </div>
      </div>

      {/* Mobile nav */}
      {menuOpen && (
        <div className="flex flex-col gap-4 mt-4 md:hidden">
          {user && (
            <form onSubmit={handleSearch}>
              <input
                type="text"
                placeholder="Search users or GIFs..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full px-3 py-2 rounded border dark:border-gray-600 dark:bg-[#2a2a2a]"
              />
            </form>
          )}

          {user ? (
            <>
              <Link to="/explore" onClick={() => setMenuOpen(false)}>Explore</Link>
              <Link to="/upload" onClick={() => setMenuOpen(false)}>Upload</Link>
              <Link to={`/profile/${user.username}`} onClick={() => setMenuOpen(false)}>Profile</Link>
              <Link to="/settings" onClick={() => setMenuOpen(false)}>Settings</Link>
              <Link to="/notifications" onClick={() => setMenuOpen(false)}>Notifications</Link>
              <button onClick={handleLogout}>Logout</button>
            </>
          ) : (
            <>
              <Link to="/register" onClick={() => setMenuOpen(false)}>Register</Link>
              <Link to="/login" onClick={() => setMenuOpen(false)}>Login</Link>
            </>
          )}
          <button onClick={toggleTheme}>Toggle Theme</button>
        </div>
      )}
    </nav>
  );
}

export default Navbar;
