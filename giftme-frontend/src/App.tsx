import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Feed from './pages/Feed'; // ✅ Usamos Feed en Home
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import Explore from './pages/Explore';
import GifDetail from './pages/GifDetail';
import Upload from './pages/Upload';
import Navbar from './components/Navbar';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { Toaster } from 'react-hot-toast';
import Notifications from './pages/Notifications';
import Settings from './pages/Settings';
import NotFound from './pages/NotFound';


function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <NotificationProvider>
          <Router>
            <div className="min-h-screen bg-background text-foreground dark:bg-darkBackground dark:text-white">
              <Navbar />
              <Toaster position="top-center" reverseOrder={false} />
              <Routes>
                <Route path="/" element={<Feed />} /> {/* ✅ Home = Feed */}
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/profile/:username" element={<Profile />} />
                <Route path="/explore" element={<Explore />} />
                <Route path="/gif/:id" element={<GifDetail />} />
                <Route path="/upload" element={<Upload />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/notifications" element={<Notifications />} />
                <Route path="*" element={<NotFound />} /> {/* Página 404 */}
              </Routes>
            </div>
          </Router>
        </NotificationProvider>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;
